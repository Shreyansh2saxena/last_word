import { create } from 'zustand'
import { toast } from 'react-hot-toast'
import {
  appendActionLog,
  gameDb,
  loadLastProfile,
  loadSnapshot,
  removeGeneratedMessage,
  saveLastProfile,
  saveSnapshot,
  storeGeneratedMessage,
} from '../db/gameDb.js'
import { buildSeedState } from '../constants/initialData.js'
import { loginRequest, logoutRequest, registerRequest } from '../services/api.js'
import {
  applyConsequences,
  advancePendingConsequences,
  createActionOutcome,
  selectNextMessageId,
} from '../utils/consequenceEngine.js'
import { clamp } from '../utils/formatters.js'
import { groqGenerateScenario } from '../services/groqService.js'

let persistTimer

const snapshotFromState = (state) => ({
  profile: state.profile,
  worldState: state.worldState,
  traits: state.traits,
  settings: state.settings,
  news: state.news,
  messages: state.messages,
  drafts: state.drafts,
  selectedMessageId: state.selectedMessageId,
  pendingConsequences: state.pendingConsequences,
  day: state.day,
  clockMinutes: state.clockMinutes,
  signalStrength: state.signalStrength,
  reputation: state.reputation,
  credits: state.credits,
  authSource: state.authSource,
  backendStatus: state.backendStatus,
  actionCount: state.actionCount,
  needsSetup: state.needsSetup,
})

const queuePersist = (state) => {
  clearTimeout(persistTimer)

  persistTimer = window.setTimeout(async () => {
    if (!state.profile?.username) return

    await saveLastProfile(state.profile.username)
    await saveSnapshot(state.profile.username, snapshotFromState(state))
  }, 260)
}

const createLocalAuthPayload = (mode, username) => ({
  accessToken: `local-${mode}-${username}-${Date.now()}`,
  user: { username, source: 'local' },
  source: 'local',
})

const mergeSnapshot = (snapshot) => ({
  ...snapshot,
  messages: snapshot.messages ?? [],
  drafts: snapshot.drafts ?? {},
  news: snapshot.news ?? [],
  settings: snapshot.settings ?? {},
  traits: snapshot.traits ?? {},
  worldState: snapshot.worldState ?? {},
  pendingConsequences: snapshot.pendingConsequences ?? [],
  needsSetup: snapshot.needsSetup ?? false,
})

export const useGameStore = create((set, get) => ({
  bootState: 'booting',
  isAuthenticated: false,
  authToken: null,
  authSource: 'local',
  backendStatus: 'offline',
  profile: null,
  worldState: {},
  traits: {},
  settings: {},
  news: [],
  messages: [],
  drafts: {},
  selectedMessageId: null,
  pendingConsequences: [],
  day: 1,
  clockMinutes: 0,
  signalStrength: 0,
  reputation: 0,
  credits: 0,
  actionCount: 0,
  needsSetup: false,

  hydrate: async () => {
    try {
      const username = await loadLastProfile()
      const snapshot = await loadSnapshot(username)

      if (!snapshot) {
        set({ bootState: 'ready' })
        return
      }

      set({
        ...mergeSnapshot(snapshot),
        isAuthenticated: true,
        authToken: `restored-${username}`,
        bootState: 'ready',
      })
    } catch (error) {
      console.error('Failed to hydrate save state', error)
      set({ bootState: 'ready' })
    }
  },

  authenticate: async ({ username, password, mode }) => {
    const normalizedUser = username.trim()
    let authPayload

    try {
      authPayload =
        mode === 'register'
          ? await registerRequest({ username: normalizedUser, password })
          : await loginRequest({ username: normalizedUser, password })
    } catch (error) {
      if (error.response) throw error
      authPayload = createLocalAuthPayload(mode, normalizedUser)
    }

    const existingSnapshot = await loadSnapshot(normalizedUser)
    const isNewGame = !existingSnapshot
    const seededState = existingSnapshot
      ? mergeSnapshot(existingSnapshot)
      : buildSeedState(normalizedUser)

    const nextState = {
      ...seededState,
      isAuthenticated: true,
      authToken: authPayload.accessToken,
      authSource: authPayload.source ?? (authPayload.user?.source ?? 'backend'),
      bootState: 'ready',
      needsSetup: isNewGame ? true : (seededState.needsSetup ?? false),
    }

    set(nextState)
    queuePersist({ ...get(), ...nextState })

    return { isNewGame }
  },

  logout: async () => {
    try {
      await logoutRequest()
    } catch {
      // Offline/local mode is fine.
    }

    set({
      bootState: 'ready',
      isAuthenticated: false,
      authToken: null,
      profile: null,
      messages: [],
      drafts: {},
      news: [],
      worldState: {},
      traits: {},
      settings: {},
      selectedMessageId: null,
      pendingConsequences: [],
      day: 1,
      clockMinutes: 0,
      signalStrength: 0,
      reputation: 0,
      credits: 0,
      actionCount: 0,
      needsSetup: false,
    })
  },

  newGame: async () => {
    const { profile } = get()
    const username = profile?.username

    try {
      await logoutRequest()
    } catch {
      // ignore
    }

    try {
      if (username) {
        await gameDb.saves.delete(username)
        await gameDb.worldAnalysis.where('username').equals(username).delete()
      }
      await gameDb.generatedMessages.clear()
      await gameDb.meta.delete('last-profile')
    } catch {
      // ignore — clear what we can
    }

    set({
      bootState: 'ready',
      isAuthenticated: false,
      authToken: null,
      profile: null,
      messages: [],
      drafts: {},
      news: [],
      worldState: {},
      traits: {},
      settings: {},
      selectedMessageId: null,
      pendingConsequences: [],
      day: 1,
      clockMinutes: 0,
      signalStrength: 0,
      reputation: 0,
      credits: 0,
      actionCount: 0,
      needsSetup: false,
    })
  },

  updateTraits: (newTraits) => {
    set((state) => {
      const next = { traits: { ...state.traits, ...newTraits } }
      queuePersist({ ...state, ...next })
      return next
    })
  },

  initializeGame: (customTraits) => {
    set((state) => {
      const next = {
        traits: { ...state.traits, ...customTraits },
        needsSetup: false,
      }
      queuePersist({ ...state, ...next })
      return next
    })
  },

  selectMessage: (messageId) => {
    set({ selectedMessageId: messageId })
  },

  setDraft: (messageId, value) => {
    set((state) => {
      const next = { drafts: { ...state.drafts, [messageId]: value } }
      queuePersist({ ...state, ...next })
      return next
    })
  },

  clearDraft: (messageId) => {
    set((state) => {
      const drafts = { ...state.drafts }
      delete drafts[messageId]
      const next = { drafts }
      queuePersist({ ...state, ...next })
      return next
    })
  },

  setBackendStatus: (backendStatus) => {
    set({ backendStatus })
  },

  updateSetting: (key, value) => {
    set((state) => {
      const next = { settings: { ...state.settings, [key]: value } }
      queuePersist({ ...state, ...next })
      return next
    })
  },

  cycleTextScale: () => {
    set((state) => {
      const values = [0.95, 1, 1.08, 1.15]
      const currentIndex = values.indexOf(state.settings.textScale ?? 1)
      const nextScale = values[(currentIndex + 1) % values.length]
      const next = { settings: { ...state.settings, textScale: nextScale } }
      queuePersist({ ...state, ...next })
      return next
    })
  },

  processAction: async (action) => {
    const state = get()
    const message = state.messages.find((entry) => entry.id === state.selectedMessageId)

    if (!message || message.status !== 'pending') return null

    const { due, remaining } = advancePendingConsequences(state.pendingConsequences)
    const resolvedState = applyConsequences(state, due)
    const draftText = state.drafts[message.id]?.trim() ?? ''
    const outcome = createActionOutcome(message, action, draftText)
    const nextClockMinutes = state.clockMinutes + 17
    const dayShift = Math.floor(nextClockMinutes / 1440)

    const nextMessages = resolvedState.messages.map((entry) =>
      entry.id === message.id
        ? {
            ...entry,
            status: outcome.status,
            handledAtDay: state.day + dayShift,
            lastAction: action,
            anonymousReply: outcome.anonymousReply ?? entry.anonymousReply ?? null,
            editedMessage: outcome.editedMessage ?? entry.editedMessage ?? null,
          }
        : entry,
    )

    const nextDrafts = { ...state.drafts }
    if (action === 'reply' || action === 'edit') {
      delete nextDrafts[message.id]
    }

    const nextState = {
      ...resolvedState,
      pendingConsequences: [...remaining, outcome.queuedConsequence],
      messages: nextMessages,
      drafts: nextDrafts,
      actionCount: state.actionCount + 1,
      day: state.day + dayShift,
      clockMinutes: nextClockMinutes % 1440,
      signalStrength: clamp(state.signalStrength + outcome.statShift.signalStrength),
      reputation: clamp(state.reputation + outcome.statShift.reputation),
      credits: clamp(state.credits + outcome.statShift.credits),
      selectedMessageId: selectNextMessageId(nextMessages, message.id),
    }

    set(nextState)
    queuePersist({ ...state, ...nextState })

    await appendActionLog({
      username: state.profile?.username ?? 'anonymous',
      action,
      messageId: message.id,
      createdAt: new Date().toISOString(),
    })

    if (message._generated) {
      removeGeneratedMessage(message.id).catch(() => {})
    }

    // Every action generates a consequence scenario — the city always responds
    groqGenerateScenario(message, action, draftText, state.worldState, state.traits)
      .then((generated) => {
        storeGeneratedMessage(generated.id).catch(() => {})

        set((currentState) => {
          const updated = {
            messages: [...currentState.messages, { ...generated, status: 'pending', _arrivedAt: Date.now() }],
          }
          queuePersist({ ...currentState, ...updated })
          return updated
        })

        toast('New signal intercepted — the city responds to your last decision.', {
          duration: 4000,
        })
      })
      .catch(() => {})

    return {
      action,
      message,
      outcome,
      appliedConsequences: due.length,
    }
  },
}))

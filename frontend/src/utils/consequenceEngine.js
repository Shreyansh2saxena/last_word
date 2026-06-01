import { clamp } from './formatters.js'
import { buildAnonymousReply, buildNewsFromVector } from './procedural.js'

const actionProfiles = {
  deliver: {
    turnsRemaining: 1,
    worldTransform: (vector) => ({ ...vector }),
    statShift: { reputation: 2, signalStrength: -1, credits: 0 },
    traitShift: { empathy: 3, honesty: 1 },
    status: 'delivered',
  },
  delay: {
    turnsRemaining: 2,
    worldTransform: (vector) => scaleVector(vector, 0.55, { publicFear: 2, hopeLevel: -1 }),
    statShift: { reputation: -1, signalStrength: 1, credits: 0 },
    traitShift: { fear: 2, empathy: -1 },
    status: 'delayed',
  },
  ignore: {
    turnsRemaining: 1,
    worldTransform: (vector) =>
      invertCareVector(vector, { publicFear: 4, hopeLevel: -3, informationControl: 1 }),
    statShift: { reputation: -3, signalStrength: 2, credits: 0 },
    traitShift: { selfishness: 3, empathy: -2, fear: 1 },
    status: 'ignored',
  },
  edit: {
    turnsRemaining: 1,
    worldTransform: (vector) =>
      scaleVector(vector, 0.5, { informationControl: 4, aiInfluence: 1, publicFear: 2 }),
    statShift: { reputation: 1, signalStrength: -3, credits: 5 },
    traitShift: { manipulation: 4, honesty: -3, paranoia: 1 },
    status: 'edited',
  },
  reply: {
    turnsRemaining: 1,
    worldTransform: (vector) =>
      scaleVector(vector, 0.65, { hopeLevel: 3, publicFear: -1, aiInfluence: 1 }),
    statShift: { reputation: 2, signalStrength: -2, credits: 0 },
    traitShift: { empathy: 2, curiosity: 2 },
    status: 'replied',
  },
  flag: {
    turnsRemaining: 1,
    worldTransform: (vector) => ({
      governmentPower: 4,
      informationControl: 5,
      resistancePower: vector.resistancePower ? -3 : 0,
      publicFear: 3,
    }),
    statShift: { reputation: 1, signalStrength: 0, credits: 2 },
    traitShift: { fear: 2, honesty: -1, manipulation: 1 },
    status: 'flagged',
  },
  archive: {
    turnsRemaining: 2,
    worldTransform: () => ({
      hopeLevel: -2,
      informationControl: 1,
    }),
    statShift: { reputation: -1, signalStrength: 1, credits: 0 },
    traitShift: { curiosity: -2, empathy: -1 },
    status: 'archived',
  },
}

const positiveCareKeys = ['hopeLevel', 'foodSupply', 'resistancePower']
const negativeCareKeys = [
  'publicFear',
  'violenceIndex',
  'governmentPower',
  'informationControl',
  'economicCollapse',
  'aiInfluence',
]

function scaleVector(vector, factor, extras = {}) {
  const scaled = Object.fromEntries(
    Object.entries(vector ?? {}).map(([key, value]) => [key, Math.round(value * factor)]),
  )

  return mergeVectors(scaled, extras)
}

function invertCareVector(vector, extras = {}) {
  const next = {}

  Object.entries(vector ?? {}).forEach(([key, value]) => {
    if (positiveCareKeys.includes(key)) {
      next[key] = -Math.max(1, Math.round(Math.abs(value) * 0.75))
      return
    }

    if (negativeCareKeys.includes(key)) {
      next[key] = Math.max(1, Math.round(Math.abs(value) * 0.5))
      return
    }

    next[key] = 0
  })

  return mergeVectors(next, extras)
}

function mergeVectors(base = {}, extras = {}) {
  const merged = { ...base }

  Object.entries(extras).forEach(([key, value]) => {
    merged[key] = (merged[key] ?? 0) + value
  })

  return merged
}

export const advancePendingConsequences = (pendingConsequences) => {
  const due = []
  const remaining = []

  pendingConsequences.forEach((item) => {
    const next = { ...item, turnsRemaining: item.turnsRemaining - 1 }

    if (next.turnsRemaining <= 0) {
      due.push(next)
      return
    }

    remaining.push(next)
  })

  return { due, remaining }
}

export const applyConsequences = (state, dueConsequences) => {
  const worldState = { ...state.worldState }
  const traits = { ...state.traits }
  const news = [...state.news]
  const messages = [...state.messages]

  dueConsequences.forEach((consequence) => {
    Object.entries(consequence.worldVector ?? {}).forEach(([key, value]) => {
      if (!(key in worldState)) {
        return
      }

      worldState[key] = clamp((worldState[key] ?? 0) + value)
    })

    Object.entries(consequence.traitShift ?? {}).forEach(([key, value]) => {
      traits[key] = clamp((traits[key] ?? 0) + value)
    })

    if (consequence.newsLine) {
      news.unshift(consequence.newsLine)
    }

    if (consequence.spawnMessage) {
      messages.unshift({
        ...consequence.spawnMessage,
        status: 'pending',
        revealedAtAction: state.actionCount + 1,
      })
    }
  })

  return {
    worldState,
    traits,
    news: news.slice(0, 8),
    messages,
  }
}

const buildEditedRelayCopy = (message, draftText) => {
  if (draftText) {
    return draftText
  }

  const fragments = message.message.split('. ')
  return `${fragments[0] ?? message.message}.\n\n[relay edit applied: severity softened before transmission]`
}

export const createActionOutcome = (message, action, draftText = '') => {
  const profile = actionProfiles[action]

  if (!profile) {
    throw new Error(`Unsupported action: ${action}`)
  }

  const worldVector = profile.worldTransform(message.worldVector ?? {})
  const branch = message.branches?.[action]

  return {
    queuedConsequence: {
      id: `${message.id}:${action}`,
      turnsRemaining: branch?.turnsRemaining ?? profile.turnsRemaining,
      worldVector,
      traitShift: profile.traitShift,
      newsLine: buildNewsFromVector(worldVector, action, message.sender),
      spawnMessage: branch?.message ? { ...branch.message, status: 'pending' } : null,
    },
    statShift: profile.statShift,
    status: profile.status,
    anonymousReply:
      action === 'reply' ? (draftText || buildAnonymousReply(message)) : null,
    editedMessage: action === 'edit' ? buildEditedRelayCopy(message, draftText) : null,
  }
}

export const selectNextMessageId = (messages, fallbackId = null) => {
  const nextPending = messages.find((message) => message.status === 'pending')
  return nextPending?.id ?? fallbackId
}

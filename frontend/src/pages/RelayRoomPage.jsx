import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FiActivity, FiBarChart2, FiRotateCcw } from 'react-icons/fi'
import PanelFrame from '../components/layout/PanelFrame.jsx'
import StatusPill from '../components/layout/StatusPill.jsx'
import ActionConsole from '../components/messages/ActionConsole.jsx'
import ConversationPanel from '../components/messages/ConversationPanel.jsx'
import MessageList from '../components/messages/MessageList.jsx'
import OperatorDraftPanel from '../components/messages/OperatorDraftPanel.jsx'
import WorldStatePanel from '../components/world/WorldStatePanel.jsx'
import WorldAnalysisModal from '../components/ui/WorldAnalysisModal.jsx'
import AppShell from '../layouts/AppShell.jsx'
import { getSystemHealth } from '../services/api.js'
import { useGameStore } from '../stores/useGameStore.js'

function RelayRoomPage() {
  const navigate = useNavigate()
  const [showAnalysis, setShowAnalysis] = useState(false)

  const profile = useGameStore((state) => state.profile)
  const messages = useGameStore((state) => state.messages)
  const selectedMessageId = useGameStore((state) => state.selectedMessageId)
  const drafts = useGameStore((state) => state.drafts)
  const news = useGameStore((state) => state.news)
  const worldState = useGameStore((state) => state.worldState)
  const settings = useGameStore((state) => state.settings)
  const day = useGameStore((state) => state.day)
  const clockMinutes = useGameStore((state) => state.clockMinutes)
  const signalStrength = useGameStore((state) => state.signalStrength)
  const reputation = useGameStore((state) => state.reputation)
  const credits = useGameStore((state) => state.credits)
  const backendStatus = useGameStore((state) => state.backendStatus)
  const selectMessage = useGameStore((state) => state.selectMessage)
  const processAction = useGameStore((state) => state.processAction)
  const setBackendStatus = useGameStore((state) => state.setBackendStatus)
  const updateSetting = useGameStore((state) => state.updateSetting)
  const cycleTextScale = useGameStore((state) => state.cycleTextScale)
  const setDraft = useGameStore((state) => state.setDraft)
  const clearDraft = useGameStore((state) => state.clearDraft)
  const newGame = useGameStore((state) => state.newGame)

  const selectedMessage = useMemo(
    () => messages.find((entry) => entry.id === selectedMessageId) ?? messages[0] ?? null,
    [messages, selectedMessageId],
  )

  const systemHealthQuery = useQuery({
    queryKey: ['system-health'],
    queryFn: getSystemHealth,
    refetchInterval: 20000,
  })

  useEffect(() => {
    if (systemHealthQuery.isSuccess) {
      setBackendStatus('online')
      return
    }
    if (systemHealthQuery.isError) {
      setBackendStatus('offline')
    }
  }, [setBackendStatus, systemHealthQuery.isError, systemHealthQuery.isSuccess])

  useEffect(() => {
    document.documentElement.style.setProperty('--text-scale', String(settings.textScale ?? 1))
  }, [settings.textScale])

const handleAction = async (action) => {
    const result = await processAction(action)
    if (result?.outcome?.anonymousReply) {
      toast('Anonymous reply routed into conversation history.')
    }
    return result
  }

  const handleNewGame = async () => {
    await newGame()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <AppShell
        settings={settings}
        topTickerItems={news}
        bottomBarProps={{
          day,
          clockMinutes,
          signalStrength,
          reputation,
          credits,
          backendStatus,
        }}
      >
        <div className="flex h-full flex-col gap-3">
          {/* Compact header */}
          <div className="panel-frame shrink-0 flex items-center justify-between gap-4 px-4 py-2.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <p className="panel-label hidden text-[0.6rem] sm:block">MCR</p>
              <h1 className="equipment-title truncate text-lg text-white">
                {profile?.callSign} — {profile?.username}
              </h1>
              <div className="hidden items-center gap-1.5 sm:flex">
                <StatusPill tone="neutral">{profile?.role}</StatusPill>
                <StatusPill tone={backendStatus === 'online' ? 'green' : 'neutral'}>
                  {backendStatus === 'online' ? 'Online' : 'Offline'}
                </StatusPill>
                <StatusPill tone="blue">
                  {messages.filter((m) => m.status === 'pending').length} pending
                </StatusPill>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAnalysis(true)}
                className="pixel-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-300 transition hover:text-white"
              >
                <FiBarChart2 size={12} />
                <span className="hidden uppercase tracking-wider sm:inline">World Report</span>
              </button>
              <button
                type="button"
                onClick={handleNewGame}
                className="pixel-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 transition hover:text-gray-300"
              >
                <FiRotateCcw size={12} />
                <span className="hidden uppercase tracking-wider sm:inline">New Game</span>
              </button>
            </div>
          </div>

          {/* Main grid — fills remaining height */}
          <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[260px_minmax(0,1fr)_240px]">
            {/* Left — message list */}
            <PanelFrame
              title="Incoming Messages"
              aside={
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                  <FiActivity size={11} />
                  select
                </span>
              }
            >
              <MessageList
                messages={messages}
                selectedMessageId={selectedMessage?.id}
                onSelect={selectMessage}
              />
            </PanelFrame>

            {/* Center — message view + draft + actions */}
            <PanelFrame
              title="Message View"
              aside={<StatusPill tone="neutral">{selectedMessage?.tone ?? 'idle'}</StatusPill>}
            >
              <div className="min-h-0 flex-1 overflow-y-auto">
                <ConversationPanel message={selectedMessage} />
              </div>
              <div className="shrink-0 border-t border-white/8">
                <OperatorDraftPanel
                  message={selectedMessage}
                  draftText={selectedMessage ? (drafts[selectedMessage.id] ?? '') : ''}
                  onChange={(value) => { if (selectedMessage) setDraft(selectedMessage.id, value) }}
                  onClear={() => { if (selectedMessage) clearDraft(selectedMessage.id) }}
                />
                <ActionConsole
                  onAction={handleAction}
                  disabled={selectedMessage?.status !== 'pending'}
                />
              </div>
            </PanelFrame>

            {/* Right — city status */}
            <PanelFrame title="City Status">
              <WorldStatePanel
                worldState={worldState}
                settings={settings}
                onToggleSetting={updateSetting}
                onCycleTextScale={cycleTextScale}
              />
            </PanelFrame>
          </div>
        </div>
      </AppShell>

      {showAnalysis && (
        <WorldAnalysisModal
          onClose={() => setShowAnalysis(false)}
          onNewGame={handleNewGame}
        />
      )}
    </>
  )
}

export default RelayRoomPage

import { useEffect, useState } from 'react'
import { FiRefreshCw, FiX } from 'react-icons/fi'
import { baseTraits } from '../../constants/initialData.js'
import { loadWorldAnalysis, saveWorldAnalysis } from '../../db/gameDb.js'
import { groqAnalyzeWorld } from '../../services/groqService.js'
import { useGameStore } from '../../stores/useGameStore.js'

const TRAIT_LABELS = {
  empathy: 'Empathy',
  selfishness: 'Selfishness',
  manipulation: 'Manipulation',
  curiosity: 'Curiosity',
  honesty: 'Honesty',
  fear: 'Fear',
  paranoia: 'Paranoia',
}

function TraitBar({ label, start, current }) {
  const delta = current - start
  const sign = delta > 0 ? '+' : ''
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-gray-500">{label}</span>
        <span className={delta > 5 ? 'text-white' : delta < -5 ? 'text-gray-600' : 'text-gray-500'}>
          {start}→{current}
          {delta !== 0 && <span className="ml-1 text-[0.6rem]">({sign}{delta})</span>}
        </span>
      </div>
      <div className="relative h-1.5 border border-white/8 bg-white/5">
        <div className="absolute inset-y-0 left-0 bg-white/15" style={{ width: `${start}%` }} />
        <div
          className={`absolute inset-y-0 left-0 ${delta >= 0 ? 'bg-white/50' : 'bg-white/20'}`}
          style={{ width: `${current}%` }}
        />
        <div className="absolute inset-y-0 w-px bg-white/40" style={{ left: `${start}%` }} />
      </div>
    </div>
  )
}

function Block({ label, children }) {
  return (
    <div className="pixel-frame p-3">
      <p className="panel-label mb-2 text-[0.6rem]">{label}</p>
      {children}
    </div>
  )
}

function WorldAnalysisModal({ onClose, onNewGame }) {
  const profile = useGameStore((s) => s.profile)
  const worldState = useGameStore((s) => s.worldState)
  const traits = useGameStore((s) => s.traits)
  const actionCount = useGameStore((s) => s.actionCount)
  const day = useGameStore((s) => s.day)
  const news = useGameStore((s) => s.news)
  const updateTraits = useGameStore((s) => s.updateTraits)

  const isNewOperator = actionCount === 0

  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmNewGame, setConfirmNewGame] = useState(false)

  const fetchAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const previous = await loadWorldAnalysis(profile?.username)
      const raw = await groqAnalyzeWorld(worldState, traits, actionCount, day, news, previous?.analysis ?? null)

      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Could not parse analysis response.')

      const parsed = JSON.parse(jsonMatch[0])
      setAnalysis(parsed)

      if (parsed.updatedTraits && typeof parsed.updatedTraits === 'object') {
        updateTraits(parsed.updatedTraits)
      }

      await saveWorldAnalysis(profile?.username, {
        analysis: parsed,
        worldSnapshot: { ...worldState },
        traitSnapshot: { ...traits },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAnalysis() }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="absolute inset-0 bg-black/90" />

      {/* Full-screen panel */}
      <div
        className="relative z-10 flex h-full flex-col panel-frame"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between gap-4 border-b border-white/8 px-5 py-3">
          <div className="flex items-center gap-4">
            <div>
              <p className="panel-label text-[0.6rem]">Intelligence Report</p>
              <h2 className="equipment-title text-xl text-white">City &amp; Operator Status</h2>
            </div>
            <p className="text-[0.68rem] text-gray-600">
              Day {day} — {isNewOperator ? 'no decisions yet' : `${actionCount} decision${actionCount === 1 ? '' : 's'}`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={fetchAnalysis}
              disabled={loading}
              title="Refresh"
              className="pixel-button p-2 text-gray-500 transition hover:text-white disabled:opacity-30"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} size={13} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="pixel-button p-2 text-gray-500 transition hover:text-white"
            >
              <FiX size={13} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-hidden p-5">
          {/* Loading */}
          {loading && (
            <div className="flex h-full items-center justify-center">
              <p className="animate-pulse text-sm text-gray-600">Compiling intelligence report…</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <p className="text-sm text-gray-500">Analysis failed: {error}</p>
              <button
                type="button"
                onClick={fetchAnalysis}
                className="pixel-button px-4 py-2 text-xs text-gray-300"
              >
                Try again
              </button>
            </div>
          )}

          {/* Analysis — two columns */}
          {analysis && !loading && (
            <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
              {/* Left — narrative */}
              <div className="flex flex-col gap-3 overflow-y-auto">
                <Block label="Current City Condition">
                  <p className="text-sm leading-6 text-gray-300">{analysis.cityState}</p>
                </Block>

                <Block label={isNewOperator ? 'What Is Waiting For You' : 'How Your Choices Built This'}>
                  <p className="text-sm leading-6 text-gray-300">{analysis.operatorImpact}</p>
                </Block>

                <Block label="What Comes Next">
                  <p className="text-sm leading-6 text-gray-300">{analysis.trajectory}</p>
                </Block>

                <Block label={isNewOperator ? 'Who You Appear To Be' : 'Who You Were / Who You Are'}>
                  <p className="text-sm italic leading-6 text-gray-400">{analysis.characterArc}</p>
                </Block>
              </div>

              {/* Right — traits + new game */}
              <div className="flex flex-col gap-3">
                <div className="pixel-frame flex-1 p-3">
                  <p className="panel-label mb-3 text-[0.6rem]">{isNewOperator ? 'Starting Profile' : 'Trait Drift'}</p>
                  <div className="space-y-2.5">
                    {Object.entries(traits).map(([key, current]) => (
                      <TraitBar
                        key={key}
                        label={TRAIT_LABELS[key] ?? key}
                        start={baseTraits[key] ?? current}
                        current={current}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-[0.6rem] text-gray-700">
                    {isNewOperator ? 'Your starting values. They will shift as you act.' : 'Line = start. Fill = now.'}
                  </p>
                </div>

                {/* New Game */}
                <div className="pixel-frame shrink-0 p-3">
                  {confirmNewGame ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">All saves erased. Cannot be undone.</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmNewGame(false)}
                          className="pixel-button flex-1 py-2 text-xs text-gray-600 transition hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={onNewGame}
                          className="pixel-button flex-1 border-white/25 py-2 text-xs text-white transition hover:bg-white/6"
                        >
                          Confirm Restart
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmNewGame(true)}
                      className="pixel-button w-full py-2 text-xs text-gray-600 transition hover:text-gray-300"
                    >
                      New Game
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorldAnalysisModal

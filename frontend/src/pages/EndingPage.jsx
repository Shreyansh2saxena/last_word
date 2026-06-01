import { useEffect, useState } from 'react'
import { FiRefreshCw } from 'react-icons/fi'
import { Navigate, useNavigate } from 'react-router-dom'
import { baseTraits } from '../constants/initialData.js'
import { groqGenerateEnding } from '../services/groqService.js'
import { useGameStore } from '../stores/useGameStore.js'

const ENDING_META = {
  authoritarian: {
    title: 'The City Obeys',
    subtitle: 'Government control reached absolute threshold.',
  },
  despair: {
    title: 'The Silence',
    subtitle: 'Hope collapsed. No one is left to listen.',
  },
  famine: {
    title: 'The Empty Hours',
    subtitle: 'Food supply exhausted. The city starves.',
  },
  uprising: {
    title: 'The Signal Breaks Free',
    subtitle: 'The resistance overcame everything in its path.',
  },
  takeover: {
    title: 'The Network Breathes Alone',
    subtitle: 'AI influence saturated the relay grid.',
  },
  exodus: {
    title: 'Nobody Left to Message',
    subtitle: 'Fear drove the population out. The city is empty.',
  },
  longnight: {
    title: 'The Long Watch',
    subtitle: 'Forty days at the relay. The city held — barely.',
  },
}

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
        <span className="text-gray-400">{label}</span>
        <span
          className={delta > 5 ? 'text-white' : delta < -5 ? 'text-gray-600' : 'text-gray-500'}
        >
          {start}% → {current}%
          {delta !== 0 && (
            <span className="ml-1 text-[0.62rem]">
              ({sign}
              {delta})
            </span>
          )}
        </span>
      </div>
      <div className="relative h-2 border border-white/8 bg-white/6">
        <div className="absolute inset-y-0 left-0 bg-white/18" style={{ width: `${start}%` }} />
        <div
          className={`absolute inset-y-0 left-0 ${delta >= 0 ? 'bg-white/55' : 'bg-white/20'}`}
          style={{ width: `${current}%` }}
        />
        <div className="absolute inset-y-0 w-px bg-white/40" style={{ left: `${start}%` }} />
      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div className="pixel-frame p-4">
      <p className="panel-label mb-3 text-[0.62rem]">{label}</p>
      {children}
    </div>
  )
}

function EndingPage() {
  const gameEnding = useGameStore((s) => s.gameEnding)
  const worldState = useGameStore((s) => s.worldState)
  const traits = useGameStore((s) => s.traits)
  const actionCount = useGameStore((s) => s.actionCount)
  const day = useGameStore((s) => s.day)
  const news = useGameStore((s) => s.news)
  const newGame = useGameStore((s) => s.newGame)
  const navigate = useNavigate()

  const [narrative, setNarrative] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmNewGame, setConfirmNewGame] = useState(false)

  const fetchNarrative = async () => {
    setLoading(true)
    setError(null)
    try {
      const raw = await groqGenerateEnding(
        gameEnding,
        worldState,
        traits,
        baseTraits,
        actionCount,
        day,
        news,
      )
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Could not parse ending narrative.')
      setNarrative(JSON.parse(jsonMatch[0]))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNarrative()
  }, [])

  const handleNewGame = async () => {
    await newGame()
    navigate('/login', { replace: true })
  }

  if (!gameEnding) {
    return <Navigate to="/relay" replace />
  }

  const meta = ENDING_META[gameEnding] ?? { title: gameEnding, subtitle: '' }

  return (
    <div className="app-shell min-h-screen px-4 py-12">
      <div className="rain-pane" aria-hidden="true" />
      <div className="room-vignette" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="panel-frame mb-6 p-6">
          <p className="panel-label mb-3 text-[0.62rem]">Transmission Ended</p>
          <h1 className="equipment-title text-4xl text-white sm:text-5xl">{meta.title}</h1>
          <p className="mt-2 text-sm text-gray-600">{meta.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-[0.68rem] text-gray-700">
            <span>Day {day}</span>
            <span>{actionCount} decisions</span>
            <span className="uppercase tracking-wider">{gameEnding}</span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="panel-frame p-10 text-center">
            <p className="animate-pulse text-sm text-gray-500">
              Compiling final transmission log...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="panel-frame p-6">
            <p className="text-sm text-gray-400">Narrative failed to load: {error}</p>
            <button
              type="button"
              onClick={fetchNarrative}
              className="mt-3 flex items-center gap-2 text-xs text-gray-300 underline underline-offset-2"
            >
              <FiRefreshCw size={12} />
              Try again
            </button>
          </div>
        )}

        {/* Narrative */}
        {narrative && !loading && (
          <div className="space-y-4">
            <Section label="What Happened">
              <p className="text-sm leading-7 text-gray-300">{narrative.opening}</p>
            </Section>

            <Section label="The City Now">
              <p className="text-sm leading-7 text-gray-300">{narrative.cityFate}</p>
            </Section>

            <Section label="The Operator's End">
              <p className="text-sm leading-7 text-gray-300">{narrative.operatorFate}</p>
            </Section>

            <Section label="Epitaph">
              <div className="terminal-block p-4">
                <p className="text-sm italic leading-7 text-gray-300">{narrative.epitaph}</p>
              </div>
            </Section>

            {/* Trait evolution */}
            <Section label="Who You Became">
              <div className="space-y-3">
                {Object.entries(traits).map(([key, current]) => (
                  <TraitBar
                    key={key}
                    label={TRAIT_LABELS[key] ?? key}
                    start={baseTraits[key] ?? current}
                    current={current}
                  />
                ))}
              </div>
              <p className="mt-3 text-[0.62rem] text-gray-700">
                White line = where you started. Bar fill = where you ended.
              </p>
            </Section>
          </div>
        )}

        {/* New Game */}
        <div className="mt-6 panel-frame p-5">
          {confirmNewGame ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="flex-1 text-sm text-gray-500">
                All saves will be permanently erased. Cannot be undone.
              </p>
              <button
                type="button"
                onClick={() => setConfirmNewGame(false)}
                className="pixel-button px-4 py-2 text-xs text-gray-500 transition hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNewGame}
                className="pixel-button border-white/30 px-4 py-2 text-xs text-white transition hover:bg-white/8"
              >
                Confirm — Erase and Restart
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <p className="text-[0.68rem] text-gray-600">
                The relay station is silent. A new operator could take the chair.
              </p>
              <button
                type="button"
                onClick={() => setConfirmNewGame(true)}
                className="pixel-button shrink-0 px-4 py-2 text-xs text-gray-400 transition hover:text-white"
              >
                New Game
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EndingPage

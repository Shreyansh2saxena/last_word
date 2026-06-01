import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { baseTraits } from '../constants/initialData.js'
import { useGameStore } from '../stores/useGameStore.js'

const TRAIT_INFO = {
  empathy:      { label: 'Empathy',      desc: 'Weight given to others\' suffering' },
  selfishness:  { label: 'Selfishness',  desc: 'Self-preservation over the message' },
  manipulation: { label: 'Manipulation', desc: 'Altering truth to shape outcomes' },
  curiosity:    { label: 'Curiosity',    desc: 'Drive to uncover hidden consequences' },
  honesty:      { label: 'Honesty',      desc: 'Routing truth even when dangerous' },
  fear:         { label: 'Fear',         desc: 'How much danger shapes each decision' },
  paranoia:     { label: 'Paranoia',     desc: 'Suspicion of unknown senders' },
}

function TraitSlider({ label, desc, value, onChange }) {
  const pct = value
  const intensity =
    pct >= 70 ? 'text-white' : pct >= 40 ? 'text-gray-300' : 'text-gray-600'

  return (
    <div className="pixel-frame p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.15em] text-gray-200">{label}</p>
          <p className="mt-0.5 text-[0.6rem] leading-4 text-gray-600">{desc}</p>
        </div>
        <span className={`shrink-0 font-bold tabular-nums text-sm ${intensity}`}>{value}</span>
      </div>

      {/* Track */}
      <div className="relative mt-1 h-1.5 border border-white/10 bg-white/5">
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 bg-white/40 transition-all duration-75"
          style={{ width: `${pct}%` }}
        />
        {/* Tick marks at 25 / 50 / 75 */}
        {[25, 50, 75].map((t) => (
          <div
            key={t}
            className="absolute inset-y-0 w-px bg-white/10"
            style={{ left: `${t}%` }}
          />
        ))}
        {/* Handle */}
        <div
          className="absolute top-1/2 h-3 w-1.5 -translate-x-1/2 -translate-y-1/2 border border-white/50 bg-[#0c0c0c] transition-all duration-75"
          style={{ left: `${pct}%` }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>

      {/* Range labels */}
      <div className="mt-1 flex justify-between text-[0.58rem] uppercase tracking-wider text-gray-700">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  )
}

function CharacterSetupPage() {
  const [traits, setTraits] = useState({ ...baseTraits })
  const initializeGame = useGameStore((s) => s.initializeGame)
  const profile = useGameStore((s) => s.profile)
  const navigate = useNavigate()

  const handleStart = () => {
    initializeGame(traits)
    navigate('/relay', { replace: true })
  }

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-6">
      <div className="rain-pane" aria-hidden="true" />
      <div className="room-vignette" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="panel-frame p-5">
          {/* Header */}
          <div className="mb-4 border-b border-white/8 pb-4">
            <p className="panel-label mb-1 text-[0.6rem]">Operator Calibration</p>
            <h1 className="equipment-title text-2xl text-white">
              {profile?.callSign} — Set Your Starting Disposition
            </h1>
            <p className="mt-1.5 text-[0.68rem] leading-5 text-gray-600">
              These shift as you make decisions. The system tracks your actual behavior and adjusts them over time.
            </p>
          </div>

          {/* 2-column slider grid */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {Object.entries(TRAIT_INFO).map(([key, info]) => (
              <TraitSlider
                key={key}
                label={info.label}
                desc={info.desc}
                value={traits[key]}
                onChange={(val) => setTraits((prev) => ({ ...prev, [key]: val }))}
              />
            ))}
          </div>

          {/* Begin button */}
          <div className="mt-4 border-t border-white/8 pt-4">
            <button
              type="button"
              onClick={handleStart}
              className="pixel-button w-full py-2.5 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-white/6"
            >
              Begin Operating
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterSetupPage

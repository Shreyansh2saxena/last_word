import { FiSliders } from 'react-icons/fi'

const metricInfo = {
  governmentPower:   'Gov Control',
  resistancePower:   'Resistance',
  publicFear:        'Public Fear',
  hopeLevel:         'Hope Level',
  violenceIndex:     'Violence',
  aiInfluence:       'AI Influence',
  economicCollapse:  'Economic Crisis',
  foodSupply:        'Food Supply',
  informationControl:'Info Control',
}

function WorldStatePanel({ worldState, settings, onToggleSetting, onCycleTextScale }) {
  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3 sm:px-5">
      {/* City metrics */}
      <div className="pixel-frame p-3">
        <p className="panel-label mb-3 text-[0.6rem]">City Metrics</p>
        <div className="space-y-2.5">
          {Object.entries(worldState).map(([key, value]) => (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-gray-400">{metricInfo[key] ?? key}</span>
                <span className="tabular-nums text-gray-300">{value}%</span>
              </div>
              <div className="world-bar h-1.5">
                <span style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="pixel-frame p-3">
        <div className="mb-2.5 flex items-center gap-2 text-gray-400">
          <FiSliders size={11} />
          <p className="panel-label text-[0.6rem]">Settings</p>
        </div>
        <div className="space-y-1.5 text-xs text-gray-400">
          {[
            ['reducedFlicker', 'Reduced flicker'],
            ['subtitles', 'Subtitles'],
            ['colorAssist', 'Color assist'],
          ].map(([key, label]) => (
            <label key={key} className="terminal-block flex cursor-pointer items-center justify-between px-2.5 py-1.5">
              <span>{label}</span>
              <input
                type="checkbox"
                checked={Boolean(settings[key])}
                onChange={(e) => onToggleSetting(key, e.target.checked)}
              />
            </label>
          ))}
          <button
            type="button"
            onClick={onCycleTextScale}
            className="pixel-button w-full px-2.5 py-1.5 text-left text-gray-400 transition hover:text-white"
          >
            Text scale: {settings.textScale}×
          </button>
        </div>
      </div>
    </div>
  )
}

export default WorldStatePanel

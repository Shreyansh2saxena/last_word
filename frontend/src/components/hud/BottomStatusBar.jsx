import { FiCalendar, FiRadio, FiShield, FiWifi, FiWifiOff } from 'react-icons/fi'
import { buildSignalLabel, formatClock } from '../../utils/formatters.js'

function BottomStatusBar({ day, clockMinutes, signalStrength, reputation, credits, backendStatus }) {
  const items = [
    {
      icon: FiCalendar,
      label: 'Day',
      value: `${day}  —  ${formatClock(clockMinutes)}`,
    },
    {
      icon: FiRadio,
      label: 'Signal Strength',
      value: `${signalStrength}%  (${buildSignalLabel(signalStrength)})`,
    },
    {
      icon: FiShield,
      label: 'Reputation',
      value: `${reputation}%  /  ${credits} credits`,
    },
  ]

  const isOnline = backendStatus === 'online'

  return (
    <div className="panel-frame grid gap-3 px-4 py-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="terminal-block flex items-center gap-3 px-3 py-2 text-sm">
          <Icon className="text-gray-400 shrink-0" />
          <div>
            <p className="panel-label text-[0.62rem]">{label}</p>
            <p className="text-gray-200">{value}</p>
          </div>
        </div>
      ))}

      <div className="terminal-block flex items-center gap-2 justify-self-start px-3 py-2 text-xs uppercase tracking-[0.18em] sm:justify-self-end">
        {isOnline ? (
          <FiWifi className="text-gray-300" />
        ) : (
          <FiWifiOff className="text-gray-600" />
        )}
        <span className={isOnline ? 'text-gray-300' : 'text-gray-600'}>
          Server {backendStatus}
        </span>
      </div>
    </div>
  )
}

export default BottomStatusBar

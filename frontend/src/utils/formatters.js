export const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value))

export const formatMetricLabel = (label) =>
  label
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())

export const formatClock = (minutes) => {
  const dayMinutes = ((minutes % 1440) + 1440) % 1440
  const hours = Math.floor(dayMinutes / 60)
  const mins = dayMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export const formatActionLabel = (action) =>
  action.charAt(0).toUpperCase() + action.slice(1)

export const buildSignalLabel = (strength) => {
  if (strength > 70) {
    return 'Stable'
  }

  if (strength > 40) {
    return 'Frayed'
  }

  return 'Fading'
}

function StatusPill({ tone = 'neutral', children }) {
  const tones = {
    neutral: 'border-white/15 bg-black/45 text-gray-400',
    green: 'border-white/30 bg-white/8 text-white',
    blue: 'border-white/20 bg-white/5 text-gray-200',
    red: 'border-white/10 bg-white/3 text-gray-500',
    amber: 'border-white/20 bg-white/5 text-gray-300',
  }

  return (
    <span
      className={`border px-2.5 py-1 text-[0.67rem] uppercase tracking-[0.22em] ${tones[tone] ?? tones.neutral}`}
    >
      {children}
    </span>
  )
}

export default StatusPill

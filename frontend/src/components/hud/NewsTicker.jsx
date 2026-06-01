function NewsTicker({ items }) {
  const duplicated = [...items, ...items]

  return (
    <div className="panel-frame overflow-hidden px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="panel-label text-[0.62rem]">News</p>
        <p className="text-[0.68rem] text-gray-600">live updates from the city</p>
      </div>

      <div className="ticker-track flex gap-12 border-t border-white/8 pt-2 text-xs uppercase tracking-[0.18em] text-gray-300">
        {duplicated.map((item, index) => (
          <span key={`${item}-${index}`} className="inline-flex items-center gap-3">
            <span className="signal-dot h-1.5 w-1.5 text-gray-400" />
            <span>{item}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default NewsTicker

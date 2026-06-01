function PanelFrame({ title, aside, className = '', children }) {
  return (
    <section className={`panel-frame flex min-h-0 flex-col overflow-hidden ${className}`}>
      <header className="terminal-header-strip shrink-0 flex items-center justify-between px-4 py-2.5 sm:px-5">
        <p className="panel-label text-[0.7rem]">{title}</p>
        {aside}
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </section>
  )
}

export default PanelFrame

function CRTEffects({ reducedFlicker = false }) {
  return (
    <>
      <div className="rain-pane" aria-hidden="true" />
      <div className={`crt-grid ${reducedFlicker ? '' : 'noise-burst'}`} aria-hidden="true" />
      <div className="room-vignette" aria-hidden="true" />
    </>
  )
}

export default CRTEffects

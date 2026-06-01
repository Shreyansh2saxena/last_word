import Typewriter from 'typewriter-effect'

const lines = [
  'Loading message archive...',
  'Scanning incoming civilian channels...',
  'Restoring last session from local storage...',
  'Relay station ready. Awaiting operator.',
]

function BootSequence() {
  return (
    <div className="panel-frame p-5 text-sm text-gray-300">
      <p className="panel-label mb-4">System</p>
      <div className="mb-4 flex items-center gap-2 text-gray-200">
        <span className="signal-dot" />
        <span className="terminal-text">Save data found — ready to continue</span>
      </div>

      <div className="terminal-window min-h-[7.5rem] p-4">
        <Typewriter
          options={{
            strings: lines,
            autoStart: true,
            loop: true,
            delay: 18,
            deleteSpeed: 999999,
            cursor: '_',
          }}
        />
      </div>
    </div>
  )
}

export default BootSequence

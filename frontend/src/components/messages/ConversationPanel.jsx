import { AnimatePresence, motion } from 'framer-motion'
import { FiCornerDownRight, FiMapPin, FiUser } from 'react-icons/fi'
import StatusPill from '../layout/StatusPill.jsx'
import { useProgressiveText } from '../../hooks/useProgressiveText.js'
import { useGameStore } from '../../stores/useGameStore.js'

const ACTION_PAST = {
  deliver: 'delivered',
  ignore: 'ignored',
  edit: 'edited',
  reply: 'replied to',
  flag: 'flagged',
  archive: 'archived',
  delay: 'delayed',
}

function MessageBody({ text }) {
  const displayed = useProgressiveText(text, 22)
  return (
    <span>
      {displayed}
      <span className="animate-pulse">_</span>
    </span>
  )
}

function ConversationPanel({ message }) {
  const messages = useGameStore((s) => s.messages)

  if (!message) {
    return (
      <div className="flex h-64 items-center justify-center p-6 text-center text-gray-600">
        Select a message from the left panel to read it here.
      </div>
    )
  }

  const origin = message._generated && message.spawnedFrom
    ? messages.find((m) => m.id === message.spawnedFrom)
    : null
  const spawnAction = message._generated ? (message.tags?.[2] ?? null) : null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        {/* Consequence context banner */}
        {message._generated && (
          <div className="border-b border-white/8 bg-white/3 px-4 py-3 sm:px-5">
            <div className="flex items-start gap-2">
              <FiCornerDownRight className="mt-0.5 shrink-0 text-gray-600" size={12} />
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.15em] text-gray-500">
                  Signal Intercepted — Consequence
                </p>
                {origin && spawnAction ? (
                  <p className="mt-0.5 text-[0.68rem] leading-5 text-gray-600">
                    This arrived because you{' '}
                    <span className="text-gray-400">{ACTION_PAST[spawnAction] ?? spawnAction}</span>{' '}
                    the message from{' '}
                    <span className="text-gray-400">{origin.sender}</span>
                    {origin.subject ? (
                      <> — <span className="italic text-gray-600">"{origin.subject}"</span></>
                    ) : null}
                  </p>
                ) : (
                  <p className="mt-0.5 text-[0.68rem] text-gray-600">
                    The city responded to one of your recent decisions.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="terminal-header-strip px-4 py-4 sm:px-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusPill tone="neutral">{message.faction}</StatusPill>
            <StatusPill tone="neutral">{message.emotionalState}</StatusPill>
            <StatusPill tone="neutral">trust: {message.hiddenTruthValue}%</StatusPill>
          </div>

          <h2 className="equipment-title text-xl text-white">{message.subject}</h2>

          <div className="mt-3 flex flex-wrap gap-4 text-[0.68rem] text-gray-500">
            <span className="inline-flex items-center gap-2">
              <FiUser />
              {message.sender}, age {message.age}
            </span>
            <span className="inline-flex items-center gap-2">
              <FiMapPin />
              {message.location}
            </span>
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_260px] sm:px-5">
          <div className="terminal-window p-4">
            <div className="mb-3 flex items-center justify-between border-b border-white/8 pb-3">
              <p className="panel-label text-[0.62rem]">Message Content</p>
              <span className="text-[0.62rem] text-gray-600 uppercase tracking-wider">
                urgency {message.urgency}
              </span>
            </div>

            <div className="terminal-copy text-sm leading-7 min-h-36">
              <MessageBody key={message.id} text={message.message} />
            </div>

            {message.editedMessage ? (
              <div className="terminal-block mt-5 p-3">
                <p className="panel-label mb-2 text-[0.62rem] text-gray-300">Your Edited Version</p>
                <p className="terminal-copy whitespace-pre-wrap text-sm">{message.editedMessage}</p>
              </div>
            ) : null}

            {message.anonymousReply ? (
              <div className="terminal-block mt-5 p-3">
                <p className="panel-label mb-2 text-[0.62rem] text-gray-200">Your Anonymous Reply</p>
                <p className="terminal-copy text-sm">{message.anonymousReply}</p>
              </div>
            ) : null}
          </div>

          <aside className="pixel-frame p-4 flex flex-col gap-4">
            <div>
              <p className="panel-label mb-3 text-[0.62rem]">Message History</p>
              <ul className="space-y-2">
                {message.history.map((entry) => (
                  <li key={entry} className="terminal-block px-3 py-2 text-gray-400 text-xs leading-5">
                    {entry}
                  </li>
                ))}
              </ul>
            </div>

            <div className="terminal-block p-3">
              <p className="panel-label mb-2 text-[0.62rem]">Possible Risk</p>
              <p className="text-xs text-gray-400 leading-5">{message.hiddenConsequences}</p>
            </div>

            <div className="terminal-block p-3">
              <p className="panel-label mb-2 text-[0.62rem]">Hint</p>
              <p className="text-xs text-gray-500 italic leading-5">{message.truthHint}</p>
            </div>
          </aside>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ConversationPanel

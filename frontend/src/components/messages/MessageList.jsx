import { AnimatePresence, motion } from 'framer-motion'
import { FiAlertTriangle, FiArchive, FiRadio, FiSend } from 'react-icons/fi'
import StatusPill from '../layout/StatusPill.jsx'

const ACTION_PAST = {
  deliver: 'delivered',
  ignore: 'ignored',
  edit: 'edited',
  reply: 'replied to',
  flag: 'flagged',
  archive: 'archived',
  delay: 'delayed',
}

const statusTone = {
  pending: 'blue',
  delivered: 'green',
  delayed: 'amber',
  ignored: 'red',
  edited: 'amber',
  replied: 'green',
  flagged: 'red',
  archived: 'neutral',
}

const statusLabel = {
  pending: 'Waiting',
  delivered: 'Delivered',
  delayed: 'Delayed',
  ignored: 'Ignored',
  edited: 'Edited',
  replied: 'Replied',
  flagged: 'Flagged',
  archived: 'Archived',
}

function MessageList({ messages, selectedMessageId, onSelect }) {
  const pending = messages.filter((m) => m.status === 'pending')
  const handled = messages.filter((m) => m.status !== 'pending')

  const renderMessage = (message) => {
    const isSelected = message.id === selectedMessageId
    const isNew = message._generated && message.status === 'pending'
    const spawnAction = message._generated ? (message.tags?.[2] ?? null) : null

    const Icon =
      message._generated
        ? FiRadio
        : message.status === 'pending'
          ? FiSend
          : message.status === 'archived'
            ? FiArchive
            : FiAlertTriangle

    return (
      <motion.button
        key={message.id}
        layout
        type="button"
        onClick={() => onSelect(message.id)}
        className={`terminal-block p-3 text-left w-full transition ${
          isSelected
            ? 'border-white/25 bg-white/6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
            : 'hover:border-white/18 hover:bg-white/3'
        }`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
      >
        {/* New signal banner */}
        {isNew && (
          <div className="mb-2 flex items-center gap-2 border-b border-white/8 pb-2">
            <span className="animate-pulse text-[0.6rem] uppercase tracking-[0.18em] text-gray-300">
              ▲ Signal Intercepted
            </span>
            {spawnAction && (
              <span className="text-[0.6rem] text-gray-600">
                — consequence of {ACTION_PAST[spawnAction] ?? spawnAction}
              </span>
            )}
          </div>
        )}

        <div className="mb-2 flex items-start justify-between gap-3 border-b border-white/8 pb-2">
          <div>
            <p className="equipment-title text-sm text-white">{message.sender}</p>
            <p className="mt-0.5 text-[0.68rem] text-gray-500">{message.location}</p>
          </div>
          <Icon className="mt-0.5 shrink-0 text-gray-500" size={13} />
        </div>

        <p className="mb-2.5 text-sm leading-5 text-gray-300">{message.subject}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          <StatusPill tone={statusTone[message.status] ?? 'neutral'}>
            {statusLabel[message.status] ?? message.status}
          </StatusPill>
          <StatusPill tone="amber">urgency {message.urgency}</StatusPill>
          <StatusPill>{message.faction}</StatusPill>
        </div>
      </motion.button>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3 sm:px-4">
      {pending.length > 0 && (
        <>
          <p className="px-1 pb-1 text-[0.62rem] uppercase tracking-widest text-gray-600">
            Needs your decision ({pending.length})
          </p>
          <AnimatePresence initial={false}>
            <div className="flex flex-col gap-3 mb-3">
              {pending.map(renderMessage)}
            </div>
          </AnimatePresence>
        </>
      )}

      {handled.length > 0 && (
        <>
          <p className="px-1 pb-1 pt-2 text-[0.62rem] uppercase tracking-widest text-gray-600 border-t border-white/8">
            Already handled ({handled.length})
          </p>
          <AnimatePresence initial={false}>
            <div className="flex flex-col gap-3">
              {handled.map(renderMessage)}
            </div>
          </AnimatePresence>
        </>
      )}

      {messages.length === 0 && (
        <p className="p-4 text-sm text-gray-600 text-center">No messages in queue.</p>
      )}
    </div>
  )
}

export default MessageList

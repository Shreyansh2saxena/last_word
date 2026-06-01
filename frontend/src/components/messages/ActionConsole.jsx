import { startTransition, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FiArchive, FiClock, FiEdit3, FiFlag, FiInbox, FiMessageSquare, FiSend } from 'react-icons/fi'
import { formatActionLabel } from '../../utils/formatters.js'

const actions = [
  { id: 'deliver', icon: FiSend,         title: 'Forward as written' },
  { id: 'reply',   icon: FiMessageSquare, title: 'Send anonymous reply (type in draft box first)' },
  { id: 'edit',    icon: FiEdit3,         title: 'Rewrite before sending (type in draft box first)' },
  { id: 'delay',   icon: FiClock,         title: 'Hold back — return to it later' },
  { id: 'ignore',  icon: FiInbox,         title: 'Take no action — message goes unresolved' },
  { id: 'flag',    icon: FiFlag,          title: 'Report to authorities' },
  { id: 'archive', icon: FiArchive,       title: 'File away without acting' },
]

function ActionConsole({ onAction, disabled = false }) {
  const [pendingAction, setPendingAction] = useState(null)

  const handleAction = (actionId) => {
    setPendingAction(actionId)
    startTransition(() => {
      void onAction(actionId)
        .then((result) => {
          if (result) {
            toast.success(
              `${formatActionLabel(actionId)} applied. ${result.appliedConsequences} queued effect(s) resolved.`,
            )
          }
        })
        .finally(() => setPendingAction(null))
    })
  }

  return (
    <div className="px-4 py-3 sm:px-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="panel-label text-[0.6rem]">Decision</p>
        {disabled && (
          <p className="text-[0.65rem] text-gray-600">Already handled</p>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {actions.map(({ id, icon: Icon, title }) => (
          <button
            key={id}
            type="button"
            title={title}
            onClick={() => handleAction(id)}
            disabled={Boolean(pendingAction) || disabled}
            className="pixel-button flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-gray-300 transition hover:text-white disabled:cursor-wait disabled:opacity-40"
          >
            <Icon size={11} />
            {pendingAction === id ? '...' : id}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ActionConsole

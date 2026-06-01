import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { groqSuggestEdit, groqSuggestReply, groqAnalyzeImpact } from '../../services/groqService.js'
import { useGameStore } from '../../stores/useGameStore.js'

function OperatorDraftPanel({ message, draftText, onChange, onClear }) {
  const [loading, setLoading] = useState(null)
  const worldState = useGameStore((s) => s.worldState)
  const traits = useGameStore((s) => s.traits)

  const handleSignalTool = async (type) => {
    if (!message || loading) return
    setLoading(type)
    try {
      if (type === 'edit') {
        const result = await groqSuggestEdit(message, worldState, traits)
        onChange(result)
        toast.success('Relay copy synthesized — review before committing.')
      } else if (type === 'reply') {
        const result = await groqSuggestReply(message, worldState)
        onChange(result)
        toast.success('Response drafted — edit or send as-is.')
      } else if (type === 'analyze') {
        const result = await groqAnalyzeImpact(message, worldState, traits)
        toast(result, { duration: 12000 })
      }
    } catch (err) {
      toast.error(`Signal tool failed: ${err.message}`)
    } finally {
      setLoading(null)
    }
  }

  if (!message) return null

  return (
    <div className="px-4 py-3 sm:px-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="panel-label text-[0.6rem]">Draft</p>
        <div className="flex items-center gap-2">
          <span className="text-[0.62rem] text-gray-700">{draftText.length} chars</span>
          <button
            type="button"
            onClick={onClear}
            className="pixel-button px-2 py-1 text-[0.65rem] uppercase tracking-[0.15em] text-gray-600 transition hover:text-gray-300"
          >
            Clear
          </button>
        </div>
      </div>

      <textarea
        value={draftText}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type here before clicking Edit or Reply…"
        rows={3}
        className="pixel-textarea w-full resize-none px-3 py-2 text-sm leading-6 outline-none transition"
      />

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <p className="panel-label mr-1 text-[0.6rem]">Signal Tools</p>
        {[
          { type: 'edit',    idle: 'Synthesize Copy',   busy: 'Synthesizing…' },
          { type: 'reply',   idle: 'Draft Response',    busy: 'Drafting…'    },
          { type: 'analyze', idle: 'Project Outcome',   busy: 'Projecting…'  },
        ].map(({ type, idle, busy }) => (
          <button
            key={type}
            type="button"
            onClick={() => handleSignalTool(type)}
            disabled={Boolean(loading)}
            className="pixel-button px-2.5 py-1 text-[0.65rem] text-gray-400 transition hover:text-white disabled:cursor-wait disabled:opacity-40"
          >
            {loading === type ? busy : idle}
          </button>
        ))}
      </div>
    </div>
  )
}

export default OperatorDraftPanel

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const guideSlips = [
  {
    id: 'welcome',
    label: 'Step 1 of 7',
    title: 'You work at a message relay station.',
    tone: 'text-white',
    body: [
      'The city is in crisis. People are sending messages — civilians, rebels, officials, children — and they all pass through your desk.',
      'You decide what happens to each one. Nothing leaves this room without your choice.',
    ],
    note: 'This is a story game about consequences, not action. Take your time.',
  },
  {
    id: 'loop',
    label: 'Step 2 of 7',
    title: 'The basic loop is simple.',
    tone: 'text-gray-200',
    body: [
      'Pick a message from the left panel and read it in the center panel.',
      'Choose what to do with it using the action buttons at the bottom.',
      'Then move on to the next message while the city quietly changes around your decisions.',
    ],
    note: 'Start with the first message — it shows you how everything connects.',
  },
  {
    id: 'reply-edit',
    label: 'Step 3 of 7',
    title: 'Edit and Reply need you to write first.',
    tone: 'text-gray-300',
    body: [
      'If you want to Edit a message, type your rewritten version in the draft box before clicking Edit.',
      'If you want to Reply, type an anonymous message in the draft box before clicking Reply.',
      'Any other action (Deliver, Delay, Ignore, Flag, Archive) works without typing anything.',
    ],
    note: 'Your draft is saved automatically as you type.',
  },
  {
    id: 'actions',
    label: 'Step 4 of 7',
    title: 'Every action has a different cost.',
    tone: 'text-gray-400',
    body: [
      'Deliver sends the message unchanged. Delay holds it back. Ignore lets it die quietly.',
      'Flag reports it to the authorities. Archive stores it without resolving it.',
      'There is no safe choice — only different trade-offs.',
    ],
    note: 'The game never tells you if you made the right call.',
  },
  {
    id: 'results',
    label: 'Step 5 of 7',
    title: 'Your choices show up in different places.',
    tone: 'text-gray-200',
    body: [
      'The left panel shows each message\'s status: delivered, edited, replied, ignored, etc.',
      'The center panel shows any edits or replies you wrote.',
      'The news ticker at the top and the city meters on the right change after your decisions.',
    ],
    note: 'Sometimes the first sign of a consequence is just a news headline.',
  },
  {
    id: 'delay',
    label: 'Step 6 of 7',
    title: 'Results don\'t always appear right away.',
    tone: 'text-white',
    body: [
      'After you act on a message, you might not see what happened for several turns.',
      'A later message may reveal the outcome — sometimes much later, from an unexpected sender.',
      'This is intentional. Uncertainty is part of the experience.',
    ],
    note: 'Pay attention to new messages that arrive after you make a decision.',
  },
  {
    id: 'final',
    label: 'Step 7 of 7',
    title: 'Read carefully. Move slowly.',
    tone: 'text-gray-300',
    body: [
      'Notice the sender\'s age, faction, urgency level, and what they leave unsaid.',
      'The game rewards attention over speed.',
    ],
    note: 'When you\'re ready, create an account or log in to start the game.',
  },
]

function GameGuide({ onContinue }) {
  const [index, setIndex] = useState(0)
  const currentSlip = guideSlips[index]
  const isLastSlip = index === guideSlips.length - 1

  const handleNext = () => {
    if (isLastSlip) {
      onContinue()
      return
    }

    setIndex((value) => value + 1)
  }

  const handleBack = () => {
    if (index > 0) {
      setIndex((value) => value - 1)
    }
  }

  return (
    <section className="panel-frame p-6 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="panel-label mb-3">How to Play</p>
          <h1
            className="max-w-3xl text-4xl leading-none text-white sm:text-5xl"
            style={{ fontFamily: 'var(--display)' }}
          >
            Read the guide. Then start playing.
          </h1>
        </div>

        <div className="pixel-frame px-4 py-3 text-right shrink-0">
          <p className="panel-label mb-1 text-[0.62rem]">Progress</p>
          <p className="text-sm text-gray-200">
            {index + 1} / {guideSlips.length}
          </p>
        </div>
      </div>

      <div className="mb-5 flex gap-2">
        {guideSlips.map((slip, slipIndex) => (
          <button
            key={slip.id}
            type="button"
            onClick={() => setIndex(slipIndex)}
            className={`h-1.5 flex-1 transition ${slipIndex <= index ? 'bg-white/60' : 'bg-white/12'}`}
            aria-label={`Go to step ${slipIndex + 1}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlip.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          className="terminal-window p-6"
        >
          <div className="mb-5">
            <p className="panel-label mb-2 text-[0.7rem]">{currentSlip.label}</p>
            <h2 className={`equipment-title text-2xl leading-tight sm:text-3xl ${currentSlip.tone}`}>
              {currentSlip.title}
            </h2>
          </div>

          <div className="space-y-4 text-base leading-8 text-gray-300">
            {currentSlip.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="terminal-block mt-6 p-4 text-sm leading-7 text-gray-400">
            <span className="text-gray-500 uppercase tracking-widest text-[0.62rem] block mb-1">Note</span>
            {currentSlip.note}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleBack}
          disabled={index === 0}
          className="pixel-button px-4 py-3 text-sm uppercase tracking-[0.22em] text-gray-500 transition disabled:opacity-30"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="pixel-button shrink-0 px-5 py-3 text-sm uppercase tracking-[0.22em] text-white transition"
        >
          {isLastSlip ? 'Go to Login' : 'Next'}
        </button>
      </div>
    </section>
  )
}

export default GameGuide

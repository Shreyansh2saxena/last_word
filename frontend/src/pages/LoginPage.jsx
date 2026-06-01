import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import BootSequence from '../components/auth/BootSequence.jsx'
import GameGuide from '../components/auth/GameGuide.jsx'
import { useGameStore } from '../stores/useGameStore.js'

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

function LoginPage() {
  const [mode, setMode] = useState('login')
  const [showGuide, setShowGuide] = useState(true)
  const navigate = useNavigate()
  const authenticate = useGameStore((state) => state.authenticate)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (values) => {
    try {
      const result = await authenticate({ ...values, mode })
      toast.success(mode === 'login' ? 'Welcome back. Loading your game...' : 'Account created. Starting game...')
      navigate(result?.isNewGame ? '/setup' : '/relay', { replace: true })
    } catch (error) {
      const message =
        error.response?.data?.message ?? 'Login failed. Check your username and password.'
      toast.error(message)
    }
  }

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-6">
      <div className="rain-pane" aria-hidden="true" />
      <div className="room-vignette" aria-hidden="true" />

      <motion.div
        className="relative z-10 grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AnimatePresence mode="wait">
          {showGuide ? (
            <motion.div
              key="guide"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
            >
              <GameGuide onContinue={() => setShowGuide(false)} />
            </motion.div>
          ) : (
            <motion.section
              key="intro"
              className="panel-frame p-6 sm:p-8"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="panel-label mb-4">Last Message</p>
                  <h1
                    className="max-w-2xl text-4xl leading-none text-white sm:text-6xl"
                    style={{ fontFamily: 'var(--display)' }}
                  >
                    The world is collapsing one message at a time.
                  </h1>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base">
                    You are the final surviving relay operator in a city in crisis. Every message
                    that leaves this room goes through you first. Your choices shape what survives.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGuide(true)}
                  className="pixel-button px-4 py-3 text-sm uppercase tracking-[0.18em] text-gray-300 transition shrink-0"
                >
                  How to Play
                </button>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  'Deliver, delay, ignore, edit, reply, archive, or flag each message.',
                  'Consequences arrive later — sometimes long after, from unexpected people.',
                  'There are no correct answers. Only different costs.',
                ].map((line) => (
                  <div
                    key={line}
                    className="pixel-frame p-4 text-sm text-gray-400"
                  >
                    {line}
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="grid gap-6">
          <BootSequence />

          {showGuide ? (
            <section className="panel-frame p-6">
              <p className="panel-label mb-3">Read the guide first</p>
              <p className="text-sm leading-7 text-gray-400">
                The guide on the left explains how to play, what each action button does, and where
                to find the results of your choices. It only takes a minute to read.
              </p>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="pixel-button mt-5 w-full px-4 py-3 text-sm uppercase tracking-[0.22em] text-white transition"
              >
                Skip to Login
              </button>
            </section>
          ) : (
            <section className="panel-frame p-6">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="panel-label mb-2">Sign In</p>
                  <p className="text-sm text-gray-500">
                    Works offline too — your progress is saved in this browser.
                  </p>
                </div>
                <div className="flex gap-2 text-xs uppercase tracking-[0.18em]">
                  <button
                    type="button"
                    onClick={() => setShowGuide(true)}
                    className="pixel-button px-3 py-1.5 text-gray-400 hover:text-gray-200"
                  >
                    Guide
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`pixel-button px-3 py-1.5 ${mode === 'login' ? 'border-white/30 bg-white/8 text-white' : 'text-gray-500'}`}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`pixel-button px-3 py-1.5 ${mode === 'register' ? 'border-white/25 bg-white/6 text-gray-200' : 'text-gray-500'}`}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-gray-500">
                    Username
                  </label>
                  <input
                    {...register('username')}
                    autoFocus
                    className="pixel-input w-full px-4 py-3 outline-none transition"
                    placeholder="your_name"
                  />
                  {errors.username ? (
                    <p className="mt-2 text-xs text-gray-400">{errors.username.message}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-gray-500">
                    Password
                  </label>
                  <input
                    {...register('password')}
                    type="password"
                    className="pixel-input w-full px-4 py-3 outline-none transition"
                    placeholder="••••••••"
                  />
                  {errors.password ? (
                    <p className="mt-2 text-xs text-gray-400">{errors.password.message}</p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="pixel-button w-full px-4 py-3 text-sm uppercase tracking-[0.22em] text-white transition disabled:cursor-wait disabled:opacity-60"
                >
                  {isSubmitting
                    ? 'Logging in...'
                    : mode === 'login'
                      ? 'Log In'
                      : 'Create Account'}
                </button>
              </form>
            </section>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage

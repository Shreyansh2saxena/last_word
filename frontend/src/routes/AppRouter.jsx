import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useGameStore } from '../stores/useGameStore.js'

const LoginPage = lazy(() => import('../pages/LoginPage.jsx'))
const RelayRoomPage = lazy(() => import('../pages/RelayRoomPage.jsx'))
const CharacterSetupPage = lazy(() => import('../pages/CharacterSetupPage.jsx'))

function BootFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-6">
      <div className="panel-frame max-w-xl rounded-3xl px-6 py-8 text-sm text-gray-300">
        <p className="panel-label mb-3">Loading</p>
        <p className="terminal-text text-gray-200">
          Restoring your save... please wait...
        </p>
      </div>
    </div>
  )
}

function ProtectedRoute() {
  const bootState = useGameStore((state) => state.bootState)
  const isAuthenticated = useGameStore((state) => state.isAuthenticated)

  if (bootState === 'booting') {
    return <BootFallback />
  }

  return isAuthenticated ? <Outlet /> : <Navigate replace to="/login" />
}

function GuestRoute() {
  const bootState = useGameStore((state) => state.bootState)
  const isAuthenticated = useGameStore((state) => state.isAuthenticated)

  if (bootState === 'booting') {
    return <BootFallback />
  }

  return isAuthenticated ? <Navigate replace to="/relay" /> : <Outlet />
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<BootFallback />}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/" element={<Navigate replace to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/relay" element={<RelayRoomPage />} />
            <Route path="/setup" element={<CharacterSetupPage />} />
          </Route>

          <Route path="*" element={<Navigate replace to="/login" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRouter

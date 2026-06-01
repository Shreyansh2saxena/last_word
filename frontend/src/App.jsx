import { useEffect, useRef } from 'react'
import AppRouter from './routes/AppRouter.jsx'
import { useGameStore } from './stores/useGameStore.js'

function App() {
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (hydratedRef.current) {
      return
    }

    hydratedRef.current = true
    void useGameStore.getState().hydrate()
  }, [])

  return <AppRouter />
}

export default App

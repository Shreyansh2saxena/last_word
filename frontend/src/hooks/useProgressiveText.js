import { useEffect, useRef, useState } from 'react'

export function useProgressiveText(text, speedMs = 24) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    setDisplayed('')
    indexRef.current = 0

    if (!text) return

    timerRef.current = setInterval(() => {
      indexRef.current += 1
      setDisplayed(text.slice(0, indexRef.current))

      if (indexRef.current >= text.length) {
        clearInterval(timerRef.current)
      }
    }, speedMs)

    return () => clearInterval(timerRef.current)
  }, [text, speedMs])

  return displayed
}

import { useCallback, useEffect, useState } from 'react'

type ColorMode = 'light' | 'dark'

const STORAGE_KEY = '@finance:colorMode'

function getInitialMode(): ColorMode {
  const stored = localStorage.getItem(STORAGE_KEY) as ColorMode | null
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyMode(mode: ColorMode) {
  document.documentElement.dataset.theme = mode
  document.documentElement.style.colorScheme = mode
  localStorage.setItem(STORAGE_KEY, mode)
}

export function useColorMode() {
  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ColorMode | null
    return stored ?? 'light'
  })

  useEffect(() => {
    applyMode(getInitialMode())
    setColorModeState(getInitialMode())
  }, [])

  const setColorMode = useCallback((mode: ColorMode) => {
    applyMode(mode)
    setColorModeState(mode)
  }, [])

  const toggleColorMode = useCallback(() => {
    setColorModeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      applyMode(next)
      return next
    })
  }, [])

  return { colorMode, setColorMode, toggleColorMode }
}

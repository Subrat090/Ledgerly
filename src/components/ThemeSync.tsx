import { useEffect } from 'react'
import type { ThemeMode } from '../store/financeStore'

function systemIsDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement
  const dark =
    theme === 'dark' || (theme === 'system' && systemIsDark())
  root.classList.toggle('dark', dark)
}

export function ThemeSync({ theme }: { theme: ThemeMode }) {
  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  return null
}

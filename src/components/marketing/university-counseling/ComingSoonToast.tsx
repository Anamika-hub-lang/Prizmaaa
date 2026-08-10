import { useCallback, useEffect, useState } from 'react'
import { COMING_SOON_TOAST } from './data'

export function useComingSoonToast() {
  const [visible, setVisible] = useState(false)

  const showToast = useCallback(() => {
    setVisible(true)
  }, [])

  useEffect(() => {
    if (!visible) return
    const timer = window.setTimeout(() => setVisible(false), 3200)
    return () => window.clearTimeout(timer)
  }, [visible])

  return { visible, showToast, message: COMING_SOON_TOAST }
}

type ToastProps = {
  visible: boolean
  message: string
}

export function ComingSoonToast({ visible, message }: ToastProps) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="rounded-full border border-orange-100 bg-white px-5 py-3 text-sm font-semibold text-[#1a1a1a] shadow-xl shadow-orange-100/50">
        {message}
      </div>
    </div>
  )
}

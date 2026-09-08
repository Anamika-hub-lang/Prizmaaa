'use client'

import { useEffect, useId, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function AppModal({
  title,
  subtitle,
  onClose,
  children,
  size = 'md',
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  size?: 'md' | 'lg'
}) {
  const titleId = useId()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label={`Close ${title}`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-10 w-full ${
          size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg'
        } max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border-[3px] border-orange-100 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.25)]`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 bg-white/95 backdrop-blur px-5 pt-5 pb-3 border-b border-orange-50">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-xl sm:text-2xl text-[#1a1a1a]">
              {title}
            </h2>
            {subtitle ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-orange-100 p-2 text-gray-500 hover:bg-orange-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 text-left">{children}</div>
      </div>
    </div>
  )
}

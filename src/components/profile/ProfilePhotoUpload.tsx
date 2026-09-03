'use client'

import { useRef, useState } from 'react'
import { Camera, User } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const MAX_BYTES = 5 * 1024 * 1024

export function ProfilePhotoUpload({
  helperText,
  onUploaded,
}: {
  helperText?: string
  onUploaded?: (imageUrl: string) => void
}) {
  const { user } = useUser()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const src = user?.imageUrl
  const hasCustomPhoto = Boolean(user?.hasImage)

  async function handleFile(file: File) {
    if (!user) return
    if (!file.type.startsWith('image/')) {
      setError('Choose a JPG, PNG, or WebP photo.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Photo must be under 5 MB.')
      return
    }
    setError(null)
    setUploading(true)
    try {
      await user.setProfileImage({ file })
      await user.reload()
      const url = user.imageUrl?.trim()
      if (url) onUploaded?.(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update photo')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center sm:items-start gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || !user}
        className="relative group w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-educture-orange/15 shrink-0 disabled:opacity-60"
        aria-label={hasCustomPhoto ? 'Change profile photo' : 'Add profile photo'}
      >
        {src ? (
          <img src={src} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="w-full h-full bg-educture-orange/10 flex items-center justify-center text-educture-orange">
            <User className="w-8 h-8" strokeWidth={2} />
          </span>
        )}
        <span className="absolute inset-0 hidden sm:flex bg-black/0 group-hover:bg-black/45 group-focus-visible:bg-black/45 transition-colors flex-col items-center justify-center text-white">
          <Camera className="w-5 h-5 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
          <span className="text-[10px] font-semibold mt-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
            {uploading ? 'Saving…' : hasCustomPhoto ? 'Change' : 'Add photo'}
          </span>
        </span>
        <span className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-educture-orange text-white flex items-center justify-center shadow-md ring-2 ring-white">
          <Camera className="w-3.5 h-3.5" />
        </span>
      </button>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || !user}
        className="text-xs font-semibold text-educture-orange hover:underline disabled:opacity-50"
      >
        {uploading ? 'Uploading…' : hasCustomPhoto ? 'Change photo' : 'Add profile photo'}
      </button>
      {helperText ? <p className="text-[11px] text-gray-500 max-w-[14rem] text-center sm:text-left">{helperText}</p> : null}
      {error ? (
        <p className="text-xs text-red-600 max-w-[14rem] text-center sm:text-left" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

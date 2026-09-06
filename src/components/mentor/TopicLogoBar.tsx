'use client'

import { useEffect, useId, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import {
  isTopicLogoKey,
  topicLogoIcons,
  topicLogoLabels,
  TOPIC_LOGO_KEYS,
  type TopicLogoKey,
} from '../../data/topicLogoPresets'

export function TopicLogoIcon({
  logoKey,
  logoUrl,
  className = 'w-4 h-4',
}: {
  logoKey: string | null
  logoUrl: string | null
  className?: string
}) {
  if (logoUrl) {
    return (
      <img src={logoUrl} alt="" className={`${className} rounded-sm object-cover`} />
    )
  }
  if (isTopicLogoKey(logoKey)) {
    const Icon = topicLogoIcons[logoKey]
    return <Icon className={className} />
  }
  return null
}

export function TopicLogoBar({
  logoKey,
  logoUrl,
  pendingFile,
  onChange,
}: {
  logoKey: string | null
  logoUrl: string | null
  pendingFile?: File | null
  onChange: (next: {
    logoKey: string | null
    logoUrl: string | null
    pendingFile: File | null
  }) => void
}) {
  const inputId = useId()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(pendingFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingFile])

  const customSrc = previewUrl ?? logoUrl

  function selectPreset(key: TopicLogoKey) {
    onChange({
      logoKey: logoKey === key ? null : key,
      logoUrl: null,
      pendingFile: null,
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {TOPIC_LOGO_KEYS.map((key) => {
        const Icon = topicLogoIcons[key]
        const selected = !customSrc && logoKey === key
        return (
          <button
            key={key}
            type="button"
            title={topicLogoLabels[key]}
            aria-label={topicLogoLabels[key]}
            aria-pressed={selected}
            onClick={() => selectPreset(key)}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border ${
              selected
                ? 'border-educture-orange bg-educture-orange text-white'
                : 'border-gray-200 bg-white text-gray-500 hover:border-orange-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        )
      })}
      <label
        htmlFor={inputId}
        className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-gray-500 hover:border-educture-orange hover:text-educture-orange"
        title="Upload custom logo"
      >
        {customSrc ? (
          <img src={customSrc} alt="" className="h-full w-full rounded-lg object-cover" />
        ) : (
          <ImagePlus className="w-3.5 h-3.5" />
        )}
        <input
          id={inputId}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null
            e.target.value = ''
            if (!file) return
            onChange({ logoKey: null, logoUrl: null, pendingFile: file })
          }}
        />
      </label>
      {customSrc || logoKey ? (
        <button
          type="button"
          aria-label="Clear logo"
          onClick={() => onChange({ logoKey: null, logoUrl: null, pendingFile: null })}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-rose-600"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : null}
    </div>
  )
}

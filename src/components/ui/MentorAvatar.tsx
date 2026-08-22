import { useState } from 'react'
import { isGenericMentorImage } from '../../lib/mentorAvatar'

const sizeClass = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-lg',
} as const

export function MentorAvatar({
  src,
  name,
  size = 'md',
}: {
  src?: string | null
  name: string
  size?: keyof typeof sizeClass
}) {
  const [failed, setFailed] = useState(false)
  const showImg = Boolean(src?.trim()) && !failed && !isGenericMentorImage(src)
  const initial = (name.trim() || 'M').charAt(0).toUpperCase()

  if (showImg) {
    return (
      <img
        src={src!}
        alt=""
        className={`${sizeClass[size]} rounded-full object-cover shrink-0 ring-2 ring-orange-100`}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span
      className={`${sizeClass[size]} rounded-full bg-educture-orange/10 text-educture-orange font-bold flex items-center justify-center shrink-0 ring-2 ring-orange-100`}
    >
      {initial}
    </span>
  )
}

import { useState } from 'react'
import { User } from 'lucide-react'
import { isGenericMentorImage } from '../../lib/mentorAvatar'

const sizeClass = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
} as const

const iconClass = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-7 h-7',
} as const

export function MentorAvatar({
  src,
  name: _name,
  size = 'md',
}: {
  src?: string | null
  name: string
  size?: keyof typeof sizeClass
}) {
  const [failed, setFailed] = useState(false)
  const showImg = Boolean(src?.trim()) && !failed && !isGenericMentorImage(src)

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
      className={`${sizeClass[size]} rounded-full bg-educture-orange/10 text-educture-orange flex items-center justify-center shrink-0 ring-2 ring-orange-100`}
      aria-hidden
    >
      <User className={iconClass[size]} strokeWidth={2.25} />
    </span>
  )
}

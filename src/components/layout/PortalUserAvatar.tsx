import { Link } from 'react-router-dom'
import { useUser } from '@clerk/nextjs'

export function PortalUserAvatar({ profilePath }: { profilePath: string }) {
  const { user } = useUser()
  const src = user?.imageUrl
  const name = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? 'Account'

  return (
    <Link
      to={profilePath}
      className="flex items-center gap-2 rounded-full pr-1 hover:bg-gray-50 transition-colors"
      title="Profile"
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="w-9 h-9 rounded-full object-cover ring-2 ring-educture-orange/20"
        />
      ) : (
        <span
          className="w-9 h-9 rounded-full bg-educture-orange/15 text-educture-orange text-sm font-bold flex items-center justify-center ring-2 ring-educture-orange/20"
        >
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </Link>
  )
}

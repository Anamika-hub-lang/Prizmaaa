import { ExternalLink } from 'lucide-react'

export function AssignmentReferenceImages({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {urls.map((url, index) => (
        <a
          key={`${url}-${index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative group shrink-0"
        >
          <img
            src={url}
            alt={`Reference ${index + 1}`}
            className="w-14 h-14 rounded-lg object-cover border-2 border-white"
          />
          <ExternalLink className="w-3 h-3 absolute bottom-1 right-1 text-white drop-shadow opacity-0 group-hover:opacity-100" />
        </a>
      ))}
    </div>
  )
}

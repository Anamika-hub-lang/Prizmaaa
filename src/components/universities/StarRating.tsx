import { Star } from 'lucide-react'

type Props = {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

export function StarRating({ value, max = 5, size = 'md', showValue = false }: Props) {
  const iconClass = sizeClasses[size]

  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = value >= i + 1
        const half = !filled && value > i && value < i + 1
        return (
          <Star
            key={i}
            className={`${iconClass} ${
              filled || half ? 'text-educture-orange fill-educture-orange' : 'text-gray-300'
            }`}
          />
        )
      })}
      {showValue && (
        <span className="ml-1.5 text-sm font-bold text-[#1a1a1a] tabular-nums">{value.toFixed(1)}</span>
      )}
    </div>
  )
}

type InputProps = {
  value: number
  onChange: (value: number) => void
  label?: string
}

export function StarRatingInput({ value, onChange, label }: InputProps) {
  return (
    <div>
      {label && <p className="text-xs font-bold text-gray-500 uppercase mb-2">{label}</p>}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5 rounded transition-transform hover:scale-110"
            aria-label={`Rate ${star} out of 5`}
          >
            <Star
              className={`w-6 h-6 ${
                star <= value ? 'text-educture-orange fill-educture-orange' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-semibold text-gray-600">{value}/5</span>
      </div>
    </div>
  )
}

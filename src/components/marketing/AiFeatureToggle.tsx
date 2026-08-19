import type { AiFeature, AiFeatureId } from '../../data/aiFeatures'

type Props = {
  features: AiFeature[]
  activeId: AiFeatureId
  onChange: (id: AiFeatureId) => void
  size?: 'sm' | 'md'
}

export function AiFeatureToggle({ features, activeId, onChange, size = 'md' }: Props) {
  if (features.length === 0) return null

  const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 sm:px-5 py-2 text-xs sm:text-sm'

  return (
    <div
      className="inline-flex max-w-full flex-wrap gap-1 rounded-full border-2 border-indigo-100 bg-white p-1 shadow-sm"
      role="tablist"
      aria-label="AI tools"
    >
      {features.map((feature) => {
        const active = feature.id === activeId
        return (
          <button
            key={feature.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(feature.id)}
            className={`rounded-full font-semibold transition-all ${pad} ${
              active
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            {feature.shortTitle}
          </button>
        )
      })}
    </div>
  )
}

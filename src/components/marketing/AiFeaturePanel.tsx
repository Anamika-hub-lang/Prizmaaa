import { Link } from 'react-router-dom'
import { ArrowRight, Brain, FileUp, Sparkles, Target } from 'lucide-react'
import type { AiFeature, AiFeatureId } from '../../data/aiFeatures'
import { AiFeatureToggle } from './AiFeatureToggle'

type Props = {
  features: AiFeature[]
  activeId: AiFeatureId
  onChange: (id: AiFeatureId) => void
  variant?: 'dark' | 'light'
  /** When false, parent renders the feature toggle (e.g. /ai page header). */
  showToggle?: boolean
}

const icons = {
  'resume-review': FileUp,
  'opportunity-matcher': Target,
} as const

export function AiFeaturePanel({ features, activeId, onChange, variant = 'dark', showToggle = true }: Props) {
  const feature = features.find((item) => item.id === activeId) ?? features[0]
  if (!feature) return null

  const Icon = icons[feature.id]
  const isDark = variant === 'dark'

  const panel = (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 text-left ${
        isDark ? 'border-indigo-500/30 bg-[#0f0f12]' : 'border-indigo-100 bg-white shadow-sm'
      }`}
    >
      <div className="grid md:grid-cols-2 gap-0">
        <div className={`relative min-h-[200px] md:min-h-[280px] ${isDark ? '' : 'order-2 md:order-1'}`}>
          <img src={feature.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <div
            className={`absolute inset-0 ${
              isDark ? 'bg-gradient-to-r from-[#0f0f12]/90 to-[#0f0f12]/40' : 'bg-gradient-to-t from-white via-white/20 to-transparent md:hidden'
            }`}
          />
        </div>

        <div className={`p-5 sm:p-6 md:p-7 flex flex-col ${isDark ? '' : 'order-1 md:order-2'}`}>
          <div className="flex items-start justify-between gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] ${
                isDark
                  ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Live · Free
            </span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className={`font-display text-xl sm:text-2xl leading-tight ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
                {feature.title}
              </h3>
              <p className={`text-sm mt-0.5 ${isDark ? 'text-indigo-200/90' : 'text-indigo-600'}`}>{feature.tagline}</p>
            </div>
          </div>

          <p className={`text-sm mt-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {feature.description}
          </p>

          <ol className={`mt-4 space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {feature.steps.map((step, index) => (
              <li key={step} className="flex gap-2.5">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    isDark ? 'bg-indigo-500/30 text-indigo-200' : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <ul className="mt-4 flex flex-wrap gap-1.5">
            {feature.highlights.map((item) => (
              <li
                key={item}
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                  isDark ? 'border-white/10 bg-white/5 text-gray-300' : 'border-indigo-100 bg-indigo-50/80 text-indigo-800'
                }`}
              >
                {item}
              </li>
            ))}
          </ul>

          <Link
            to={`/ai?tool=${feature.id}#try`}
            className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5 ${
              isDark ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-700 hover:text-indigo-900'
            }`}
          >
            Try free now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {showToggle && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Brain className={`w-4 h-4 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`} />
            <p
              className={`text-[10px] font-bold uppercase tracking-[0.22em] ${
                isDark ? 'text-indigo-300/80' : 'text-indigo-600'
              }`}
            >
              PRIZMA AI
            </p>
          </div>
          <AiFeatureToggle features={features} activeId={activeId} onChange={onChange} size="sm" />
        </div>
      )}
      {panel}
    </div>
  )
}

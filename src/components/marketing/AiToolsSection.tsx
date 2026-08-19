import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Brain } from 'lucide-react'
import {
  defaultAiFeatureId,
  enabledAiFeatures,
  type AiFeatureId,
} from '../../data/aiFeatures'
import { AiFeaturePanel } from './AiFeaturePanel'

type Props = {
  id?: string
  variant?: 'dark' | 'light'
}

export function AiToolsSection({ id = 'ai-tools', variant = 'dark' }: Props) {
  const features = enabledAiFeatures
  const [activeId, setActiveId] = useState<AiFeatureId>(defaultAiFeatureId())

  if (features.length === 0) return null

  const isDark = variant === 'dark'

  return (
    <section
      id={id}
      className={`relative overflow-hidden py-12 sm:py-14 lg:py-16 gsap-reveal ${
        isDark ? 'bg-[#0a0a0f] text-white' : 'bg-indigo-50/40 text-[#1a1a1a]'
      }`}
    >
      <div
        className="pointer-events-none absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl"
        aria-hidden
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6 sm:mb-8">
          <div className="text-left max-w-xl">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                isDark
                  ? 'border-indigo-400/40 bg-indigo-500/15 text-indigo-200'
                  : 'border-indigo-200 bg-white text-indigo-700'
              }`}
            >
              <Brain className="w-3 h-3" />
              AI for students
            </span>
            <h2 className={`font-display text-2xl sm:text-3xl mt-3 leading-tight ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
              Smarter{' '}
              <span className="font-script text-indigo-400 text-3xl sm:text-4xl">resume & opportunities</span>
            </h2>
            <p className={`text-sm mt-2 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Toggle between AI resume review and opportunity matching — built for internships, scholarships, and your
              next move.
            </p>
          </div>
          <Link
            to="/ai"
            className={`inline-flex items-center gap-2 shrink-0 rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
              isDark
                ? 'border-indigo-400/50 text-indigo-200 hover:border-indigo-300 hover:bg-indigo-500/10'
                : 'border-indigo-200 bg-white text-indigo-800 hover:border-indigo-400'
            }`}
          >
            Explore AI tools
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <AiFeaturePanel
          features={features}
          activeId={activeId}
          onChange={setActiveId}
          variant={variant}
        />
      </div>
    </section>
  )
}

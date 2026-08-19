import { CheckCircle2 } from 'lucide-react'
import { counsellingIncludes } from '../../data/counsellingServices'

type Props = {
  /** Light cream cards on white — original counselling style */
  variant?: 'light' | 'dark'
  /** White panel wrapper for use on dark backgrounds */
  boxed?: boolean
}

export function CounsellingIncludesGrid({ variant = 'light', boxed = false }: Props) {
  const isDark = variant === 'dark'

  const content = (
    <>
      <h3
        className={`font-display text-2xl sm:text-3xl mb-1 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}
      >
        Every guidance call includes
      </h3>
      <p className={`text-sm sm:text-base mb-5 sm:mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Clear next steps — roadmap, resources, and honest advice in one hour.
      </p>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {counsellingIncludes.map((item) => (
          <li
            key={item}
            className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3.5 sm:py-4 text-left text-sm leading-snug ${
              isDark
                ? 'border-white/10 bg-white/[0.04] text-gray-300'
                : 'border-orange-100 bg-[#fff9f3] text-gray-700'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 text-educture-orange shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </>
  )

  if (boxed) {
    return (
      <div className="rounded-3xl border-[3px] border-orange-100 bg-white p-6 sm:p-8 shadow-sm text-left">
        {content}
      </div>
    )
  }

  return <div className="text-left">{content}</div>
}

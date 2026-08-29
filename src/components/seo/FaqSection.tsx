import type { SeoFaqItem } from '../../data/seoFaqs'

type Props = {
  heading: string
  items: SeoFaqItem[]
  tone?: 'light' | 'dark'
}

export function FaqSection({ heading, items, tone = 'light' }: Props) {
  const onDark = tone === 'dark'
  return (
    <section className={onDark ? 'py-10 sm:py-12 border-t border-white/10' : 'py-10 sm:py-12'}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2
          className={`font-display text-2xl sm:text-3xl leading-tight ${
            onDark ? 'text-white' : 'text-[#1a1a1a]'
          }`}
        >
          {heading}
        </h2>
        <dl className="mt-6 space-y-5">
          {items.map((item) => (
            <div key={item.question}>
              <dt
                className={`font-semibold text-sm sm:text-base ${
                  onDark ? 'text-white' : 'text-[#1a1a1a]'
                }`}
              >
                {item.question}
              </dt>
              <dd
                className={`text-sm leading-relaxed mt-1.5 ${
                  onDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

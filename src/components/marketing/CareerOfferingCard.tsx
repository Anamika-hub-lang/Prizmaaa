import { Link } from 'react-router-dom'
import { ArrowRight, IndianRupee } from 'lucide-react'
import type { CareerOffering } from '../../data/counsellingServices'

type Props = {
  offering: CareerOffering
  onComingSoon?: () => void
}

export function CareerOfferingCard({ offering, onComingSoon }: Props) {
  const priceBlock = offering.priceInr ? (
    <div className="inline-flex items-center gap-1.5 rounded-xl border border-educture-orange/40 bg-educture-orange/10 px-3 py-1.5 shrink-0">
      <IndianRupee className="w-3.5 h-3.5 text-educture-orange" />
      <span className="text-sm font-bold text-white">₹{offering.priceInr}</span>
      {offering.durationLabel && (
        <span className="text-[10px] text-orange-200/90">/ {offering.durationLabel}</span>
      )}
    </div>
  ) : null

  const inner = (
    <>
      <img
        src={offering.image}
        alt={offering.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/25" />
      <div className="relative z-10 flex h-full min-h-[190px] flex-col justify-end p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            {offering.comingSoon && (
              <span className="inline-flex rounded-full border border-violet-300/40 bg-violet-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-violet-200">
                Coming soon
              </span>
            )}
            {!offering.comingSoon && (
              <span className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-200">
                Live on Meet
              </span>
            )}
            <h3 className="font-display text-xl sm:text-2xl text-white mt-2 leading-tight">{offering.title}</h3>
            <p className="text-xs sm:text-sm text-gray-200 mt-1">{offering.tagline}</p>
          </div>
          {priceBlock}
        </div>
        <p className="text-xs text-gray-300 mt-3 leading-relaxed line-clamp-2">{offering.description}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {offering.highlights.map((item) => (
            <li
              key={item}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] text-gray-300"
            >
              {item}
            </li>
          ))}
        </ul>
        <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-educture-orange group-hover:gap-2.5 transition-all">
          {offering.comingSoon ? 'Notify me when live' : 'Book mock interview'}
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </>
  )

  if (offering.comingSoon) {
    return (
      <button
        type="button"
        onClick={onComingSoon}
        className="group relative block h-full w-full overflow-hidden rounded-2xl border-2 border-white/10 text-left hover:border-violet-400/50 transition-all"
      >
        {inner}
      </button>
    )
  }

  return (
    <Link
      to={offering.link ?? '/counselling'}
      className="group relative block h-full overflow-hidden rounded-2xl border-2 border-white/10 text-left hover:border-educture-orange/50 transition-all"
    >
      {inner}
    </Link>
  )
}

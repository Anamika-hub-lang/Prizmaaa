import { motion } from 'framer-motion'

/** Thin orange line decor — matches reference hero wireframes */
export function HeroWireframeDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Concentric arcs — right side */}
      <svg
        className="absolute top-[18%] right-[2%] w-[min(42vw,320px)] h-[min(42vw,320px)] text-educture-orange/25 hidden sm:block"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="64" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="1.5" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[14%] right-[22%] w-12 h-12 border-2 border-educture-orange/30 rounded-full hidden lg:block"
      />
      <motion.div
        animate={{ rotate: [0, 8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[38%] right-[12%] w-16 h-16 border-2 border-educture-orange/20 rounded-2xl rotate-12 hidden lg:block"
      />

      {/* Left subtle ring */}
      <div className="absolute top-[22%] left-[3%] w-20 h-20 border-2 border-educture-orange/15 rounded-full hidden lg:block" />

      <svg
        className="absolute bottom-[18%] left-[6%] w-24 h-24 text-educture-orange/12 hidden lg:block"
        viewBox="0 0 100 100"
      >
        <rect x="8" y="8" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="2" rx="10" />
        <rect x="28" y="28" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="2" rx="10" />
      </svg>
    </div>
  )
}

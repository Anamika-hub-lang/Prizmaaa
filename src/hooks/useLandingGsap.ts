import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function useLandingGsap() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.from('.gsap-hero-in', {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
      })

      gsap.from('.gsap-hero-img', {
        opacity: 0,
        scale: 0.92,
        duration: 1,
        ease: 'power3.out',
        delay: 0.15,
      })

      gsap.utils.toArray<HTMLElement>('.gsap-reveal').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
          opacity: 0,
          y: 56,
          duration: 0.75,
          ease: 'power2.out',
        })
      })

      gsap.utils.toArray<HTMLElement>('.gsap-card-in').forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            toggleActions: 'play none none none',
          },
          opacity: 0,
          y: 36,
          duration: 0.55,
          delay: (i % 3) * 0.08,
          ease: 'power2.out',
        })
      })
    })

    return () => ctx.revert()
  }, [])
}

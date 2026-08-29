import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone, ArrowUpRight, Share2, Globe } from 'lucide-react'
import { BrandLogo, BRAND_NAME } from '../brand/BrandLogo'
import { footerTagline, contactSectionCopy } from '../../data/aboutStory'

const social = [Share2, Globe, Mail]

export function MarketingFooter() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-left relative">
        <div>
          <BrandLogo to="/" size="md" tone="dark" className="mb-3" />
          <p className="text-sm leading-relaxed max-w-xs">{footerTagline}</p>
        </div>
        <div>
          <p className="font-bold text-educture-orange text-xs uppercase tracking-widest mb-4">Explore</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/classes" className="hover:text-white">Online classes</Link></li>
            <li><Link to="/counselling" className="hover:text-white">Career counselling</Link></li>
            <li><Link to="/colleges" className="hover:text-white">Colleges</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-educture-orange text-xs uppercase tracking-widest mb-4">Resources</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/sign-up" className="hover:text-white">Join free</Link></li>
            <li><Link to="/ai" className="hover:text-white">AI resume & matcher</Link></li>
            <li><Link to="/counselling" className="hover:text-white">Guidance — ₹199/call</Link></li>
            <li><Link to="/counselling/interview-prep" className="hover:text-white">Mock interview — ₹99</Link></li>
            <li><Link to="/universities" className="hover:text-white">Campus stories</Link></li>
            <li><Link to="/university-counseling" className="hover:text-white">Campus connect</Link></li>
            <li><Link to="/become-mentor" className="hover:text-white">Become a mentor</Link></li>
            <li><Link to="/reviews" className="hover:text-white">Share your story</Link></li>
            <li><Link to="/sign-in" className="hover:text-white">Student login</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-educture-orange text-xs uppercase tracking-widest mb-4">
            Let&apos;s connect
          </p>
          <p className="text-sm flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-educture-orange shrink-0" />
            hello@educture.com
          </p>
          <p className="text-sm flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-educture-orange shrink-0" />
            India · Online worldwide
          </p>
          <p className="text-sm flex items-center gap-2 mb-4">
            <Phone className="w-4 h-4 text-educture-orange shrink-0" />
            +91 98765 43210
          </p>
          <div className="flex gap-2">
            {social.map((Icon, i) => (
              <span
                key={i}
                className="w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center hover:border-educture-orange transition-colors"
              >
                <Icon className="w-4 h-4" />
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8 border-t border-gray-800 pt-6">
        <p className="text-xs text-center sm:text-left">© 2024 {BRAND_NAME}. All rights reserved.</p>
      </div>
    </footer>
  )
}

export function ContactSection({ id = 'contact' }: { id?: string }) {
  return (
    <section id={id} className="relative overflow-hidden bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 pt-0 pb-16 lg:pb-24">
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 pointer-events-none" aria-hidden>
        <svg className="w-full h-full text-white" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,0 L0,40 Q360,80 720,40 T1440,50 L1440,0 Z" />
        </svg>
      </div>
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 400">
          <path d="M0,200 Q400,100 800,200 T1200,180" fill="none" stroke="white" strokeWidth="1" />
          <path d="M0,280 Q300,200 600,280 T1200,260" fill="none" stroke="white" strokeWidth="1" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 lg:pt-28 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="gsap-reveal flex flex-col items-center lg:items-start">
          <div className="relative w-full max-w-sm">
            <img
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=700&q=80"
              alt="Students learning together"
              className="w-full rounded-3xl border-[3px] border-white/40 shadow-2xl object-cover aspect-[4/3]"
            />
            <div className="absolute -bottom-4 -right-2 bg-educture-orange rounded-2xl p-4 border-[3px] border-white shadow-xl max-w-[200px]">
              <p className="font-script text-xl text-white leading-snug text-center">
                Your journey. Your people.
              </p>
            </div>
          </div>
        </div>

        <div className="gsap-reveal text-left">
          <h2 className="font-display text-3xl sm:text-4xl text-white leading-snug">{contactSectionCopy.title}</h2>
          <p className="text-sm text-white/90 mt-4 max-w-md leading-relaxed">{contactSectionCopy.body}</p>
          <form className="mt-8 space-y-3" onSubmit={(e) => e.preventDefault()}>
            <input
              placeholder="Name"
              className="w-full px-6 py-3.5 rounded-full bg-white border-[3px] border-white text-sm outline-none text-gray-800 shadow-lg"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-6 py-3.5 rounded-full bg-white border-[3px] border-white text-sm outline-none text-gray-800 shadow-lg"
            />
            <textarea
              placeholder="Message"
              rows={3}
              className="w-full px-6 py-4 rounded-3xl bg-white border-[3px] border-white text-sm outline-none resize-none text-gray-800 shadow-lg"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-educture-orange text-white font-semibold text-sm shadow-[0_12px_32px_rgba(243,112,33,0.55)] hover:bg-educture-orange-dark transition-colors"
            >
              Send message
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

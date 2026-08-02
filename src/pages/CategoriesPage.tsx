import { Eye, GraduationCap, Palette, Rocket, Terminal } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { FooterLight } from '../components/layout/Footers'
import { BrutalButton } from '../components/ui/BrutalButton'
import { Reveal, StaggerContainer, StaggerItem } from '../components/ui/Reveal'

export function CategoriesPage() {
  return (
    <div className="min-h-screen bg-cream-warm flex flex-col">
      <MainNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full text-left">
        <Reveal>
          <h1 className="font-display text-4xl sm:text-5xl mb-4">
            KNOWLEDGE{' '}
            <span className="inline-block bg-brutal-yellow border-[3px] border-black px-2 shadow-brutal">
              UNFILTERED.
            </span>
          </h1>
          <p className="text-gray-700 max-w-2xl mb-8">
            Explore categories built for depth — not dopamine. Pick a lane and go deep.
          </p>
        </Reveal>

        <div className="h-[3px] bg-black w-full mb-10" />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">
          <StaggerItem className="md:col-span-2 md:row-span-2">
            <div className="border-[3px] border-black bg-white shadow-brutal-lg p-6 h-full brutal-press">
              <div className="flex justify-between mb-4">
                <span className="bg-brutal-green text-xs font-bold border-2 border-black px-2 py-0.5">TRENDING</span>
                <Terminal className="w-6 h-6" />
              </div>
              <p className="font-display text-2xl mb-2">SKILL DEVELOPMENT</p>
              <p className="text-sm text-gray-600 mb-4">Stack skills that compound — code, design, and leadership in one track.</p>
              <div className="flex gap-2 flex-wrap">
                {['CODING', 'DESIGN', 'MANAGEMENT'].map((t) => (
                  <span key={t} className="text-xs border-2 border-black px-2 py-1 font-mono">{t}</span>
                ))}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="border-[3px] border-black bg-brutal-lavender shadow-brutal p-5 h-full min-h-[180px] brutal-press">
              <Eye className="w-6 h-6 mb-3" />
              <p className="font-display">FREELANCING</p>
              <p className="text-sm mt-2">Land clients without begging.</p>
              <p className="text-xs font-bold mt-4">EXPLORE →</p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="border-[3px] border-black bg-brutal-green shadow-brutal p-5 h-full min-h-[180px] brutal-press">
              <GraduationCap className="w-6 h-6 mb-3" />
              <p className="font-display">ACADEMIC</p>
              <p className="text-sm mt-2">Foundations that actually transfer.</p>
              <div className="mt-4 h-2 bg-white border-2 border-black">
                <div className="h-full w-2/3 bg-brutal-blue" />
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="border-[3px] border-black bg-[#d9d9d9] shadow-brutal p-5 brutal-press">
              <Palette className="w-6 h-6 mb-3" />
              <p className="font-display">CREATIVE ARTS</p>
              <ul className="text-xs mt-3 space-y-1 font-mono">
                <li>— DIGITAL ILLUSTRATION</li>
                <li>— AUDIO ENGINEERING</li>
                <li>— STREET PHOTOGRAPHY</li>
              </ul>
            </div>
          </StaggerItem>

          <StaggerItem className="md:col-span-1">
            <div className="border-[3px] border-black shadow-brutal overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80"
                alt="Neon"
                className="h-24 w-full object-cover grayscale border-b-[3px] border-black"
              />
              <div className="bg-brutal-yellow p-4">
                <p className="font-display">MARKETING</p>
                <p className="text-xs font-bold">SCALE YOUR REACH.</p>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem className="md:col-span-2">
            <div className="border-[3px] border-black bg-white shadow-brutal flex gap-4 p-5 items-center brutal-press">
              <div className="w-14 h-14 bg-black flex items-center justify-center shrink-0">
                <Rocket className="w-7 h-7 text-brutal-yellow" />
              </div>
              <div>
                <p className="font-display">ENTREPRENEURSHIP</p>
                <p className="text-sm text-gray-600">Build the thing before the pitch deck.</p>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem className="md:col-span-2">
            <div className="border-[3px] border-black bg-brutal-blue text-white shadow-brutal p-5 flex justify-between items-center brutal-press">
              <div>
                <p className="font-display">LIFESTYLE</p>
                <p className="text-sm opacity-90">Balance that doesn’t kill ambition.</p>
              </div>
              <div className="w-12 h-12 border-[3px] border-white bg-white/10" />
            </div>
          </StaggerItem>
        </StaggerContainer>

        <Reveal className="mt-12">
          <div className="border-[3px] border-black bg-white shadow-brutal-xl p-8 text-center">
            <p className="font-display text-2xl mb-2">MISSING SOMETHING?</p>
            <p className="text-sm text-gray-600 mb-6">Suggest a category — we build what students actually ask for.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <input
                placeholder="Suggest a category..."
                className="flex-1 border-[3px] border-black px-4 py-3 font-mono text-sm outline-none"
              />
              <BrutalButton size="md">Submit Proposal</BrutalButton>
            </div>
          </div>
        </Reveal>
      </main>

      <FooterLight />
    </div>
  )
}

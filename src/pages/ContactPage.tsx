import { Mail, MapPin, Phone } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { PageHero } from '../components/ui/PageHero'
import { AppButton } from '../components/ui/AppButton'

export function ContactPage() {
  return (
    <PageShell>
      <PageHero
        badge="Contact"
        title="We're here to help you learn"
        description="Questions about courses, mentors, or teams? Send a message — we typically reply within one business day."
        image="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=900&q=80"
      />

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10">
        <div className="space-y-6 text-left">
          {[
            { icon: Mail, label: 'Email', value: 'hello@educture.com' },
            { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
            { icon: MapPin, label: 'Office', value: 'Bengaluru & remote-first' },
          ].map((item) => (
            <div key={item.label} className="flex gap-4 items-start">
              <span className="w-11 h-11 rounded-xl bg-educture-orange/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-educture-orange" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase text-gray-400 tracking-wide">{item.label}</p>
                <p className="font-medium text-[#1d1d1d]">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 sm:p-8 text-left space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600">Full name</label>
            <input className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-educture-orange text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Email</label>
            <input type="email" className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-educture-orange text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Message</label>
            <textarea rows={4} className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-educture-orange text-sm resize-none" />
          </div>
          <AppButton type="submit" className="w-full justify-center">Send message</AppButton>
        </form>
      </section>
    </PageShell>
  )
}

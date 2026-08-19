import { useState } from 'react'
import { Video } from 'lucide-react'
import { useMentorContent } from '../../context/MentorContentContext'
import { MentorPageHeader } from '../../components/layout/TeacherLayout'
import { AppButton } from '../../components/ui/AppButton'
import { tintedSurface, tintedSurfaceKey } from '../../components/ui/dashboardCardStyles'

export function MentorMeetPage() {
  const { myClasses, setMeetForClass } = useMentorContent()
  const [selectedId, setSelectedId] = useState(myClasses[0]?.id ?? '')
  const selected = myClasses.find((c) => c.id === selectedId)
  const [meetLink, setMeetLink] = useState(selected?.meetLink ?? 'https://meet.google.com/')
  const [nextSession, setNextSession] = useState(selected?.nextSessionLabel ?? '')

  const onSelect = (id: string) => {
    setSelectedId(id)
    const c = myClasses.find((x) => x.id === id)
    if (c) {
      setMeetLink(c.meetLink)
      setNextSession(c.nextSessionLabel)
    }
  }

  const save = () => {
    if (selectedId) setMeetForClass(selectedId, meetLink, nextSession)
  }

  return (
    <>
      <MentorPageHeader
        title="Google Meet links"
        subtitle="Students join live classes from My Courses — set the Meet URL and next session time here."
      />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-left space-y-6">
        <div className={`${tintedSurface(1)} p-5 flex gap-3`}>
          <Video className="w-6 h-6 text-educture-orange shrink-0" />
          <p className="text-sm text-gray-700 leading-relaxed">
            When a student enrolls and pays ₹1,000, they use this link on the dashboard and enrolled page to join your live class.
          </p>
        </div>

        <div className={`${tintedSurface(0)} p-6 space-y-4`}>
          <div>
            <label className="text-xs font-semibold text-gray-600">Select class</label>
            <select
              value={selectedId}
              onChange={(e) => onSelect(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
            >
              {myClasses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          {selected && (
            <img src={selected.image} alt="" className="w-full h-40 object-cover rounded-xl" />
          )}
          <div>
            <label className="text-xs font-semibold text-gray-600">Google Meet link</label>
            <input
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Next session label (shown to students)</label>
            <input
              value={nextSession}
              onChange={(e) => setNextSession(e.target.value)}
              placeholder="Today, 7:00 PM · Google Meet"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>
          <AppButton type="button" onClick={save} className="w-full justify-center">
            Save Meet settings
          </AppButton>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-500 uppercase">All classes</h2>
          {myClasses.map((c) => (
            <div key={c.id} className={`flex gap-3 items-center p-3 rounded-xl ${tintedSurfaceKey(c.id)}`}>
              <img src={c.image} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{c.title}</p>
                <p className="text-xs text-gray-500 truncate">{c.meetLink}</p>
                <p className="text-xs text-educture-orange">{c.nextSessionLabel}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}

import { useState } from 'react'
import { useMentorContent } from '../../context/MentorContentContext'
import { MentorPageHeader } from '../../components/layout/TeacherLayout'
import { AppButton } from '../../components/ui/AppButton'
import { tintedSurface, tintedSurfaceKey } from '../../components/ui/dashboardCardStyles'

export function MentorFreeCoursesPage() {
  const { freeCourses, addFreeCourse, removeFreeCourse } = useMentorContent()
  const [title, setTitle] = useState('')
  const [image, setImage] = useState('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80')
  const [instructor, setInstructor] = useState('')
  const [lessons, setLessons] = useState(8)
  const [hours, setHours] = useState(3)
  const [description, setDescription] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    addFreeCourse({
      title,
      image,
      instructor,
      lessons,
      hours,
      description,
    })
    setTitle('')
    setDescription('')
  }

  return (
    <>
      <MentorPageHeader
        title="Free courses"
        subtitle="These appear on the student Free Courses tab — no payment required."
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left">
        <form
          onSubmit={handleAdd}
          className={`${tintedSurface(3)} p-6 mb-8 grid sm:grid-cols-2 gap-4`}
        >
          <p className="sm:col-span-2 font-bold text-[#1d1d1d]">Add free course</p>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-600">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Instructor</label>
            <input
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              required
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Image URL</label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Lessons</label>
            <input
              type="number"
              value={lessons}
              onChange={(e) => setLessons(Number(e.target.value))}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Hours</label>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-600">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none resize-none"
            />
          </div>
          <AppButton type="submit">Publish free course</AppButton>
        </form>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {freeCourses.map((c) => (
            <article key={c.id} className={`overflow-hidden ${tintedSurfaceKey(c.id)}`}>
              <img src={c.image} alt="" className="w-full h-36 object-cover" />
              <div className="p-4">
                <span className="text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">FREE</span>
                <p className="font-bold mt-2">{c.title}</p>
                <p className="text-xs text-gray-500">{c.lessons} lessons · {c.hours}h</p>
                <button
                  type="button"
                  onClick={() => removeFreeCourse(c.id)}
                  className="text-xs text-red-500 mt-2 font-medium"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  )
}

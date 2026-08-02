import { useState } from 'react'
import { useMentorContent } from '../../context/MentorContentContext'
import type { ClassCategoryId } from '../../data/classCatalog'
import { formatBrowsePricingSummary, getCategoryPlanPriceLabel } from '../../data/classCatalog'
import { MentorPageHeader } from '../../components/layout/TeacherLayout'
import { AppButton } from '../../components/ui/AppButton'
import { tintedSurface, tintedSurfaceKey } from '../../components/ui/dashboardCardStyles'

export function MentorClassesPage() {
  const { classes, addClass, removeClass, categories } = useMentorContent()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState<ClassCategoryId>('skills')
  const [image, setImage] = useState('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80')
  const [duration, setDuration] = useState('6 weeks')
  const [sessions, setSessions] = useState('12 live sessions')
  const [description, setDescription] = useState('')
  const [mentor, setMentor] = useState('Your name')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    addClass({
      title,
      categoryId,
      image,
      mentor,
      mentorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      duration,
      sessions,
      description,
      meetLink: 'https://meet.google.com/',
      nextSessionLabel: 'Set in Meet tab',
      published: true,
    })
    setShowForm(false)
    setTitle('')
    setDescription('')
  }

  return (
    <>
      <MentorPageHeader
        title="Online classes"
        subtitle={`Students pay official category plans at checkout — ${formatBrowsePricingSummary()}.`}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left">
        <AppButton type="button" onClick={() => setShowForm(!showForm)} className="mb-6">
          {showForm ? 'Cancel' : '+ Upload new class'}
        </AppButton>

        {showForm && (
          <form
            onSubmit={handleAdd}
            className={`${tintedSurface(0)} p-6 mb-8 grid sm:grid-cols-2 gap-4`}
          >
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600">Class title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value as ClassCategoryId)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Mentor name (shown to students)</label>
              <input
                value={mentor}
                onChange={(e) => setMentor(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600">Cover image URL</label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
              />
              <img src={image} alt="" className="mt-2 w-full max-h-40 object-cover rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Duration</label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Sessions</label>
              <input
                value={sessions}
                onChange={(e) => setSessions(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <AppButton type="submit">Publish class</AppButton>
              <p className="text-xs text-gray-500 mt-2">
                Checkout pricing for this category: {getCategoryPlanPriceLabel(categoryId)}
              </p>
            </div>
          </form>
        )}

        {classes.length === 0 ? (
          <p className="text-sm text-gray-500 py-8">
            No online classes yet. Use <strong>Upload new class</strong> to add your first one — students will see it live after you publish.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((c) => (
              <article key={c.id} className={`overflow-hidden ${tintedSurfaceKey(c.id)}`}>
                <img src={c.image} alt="" className="w-full h-40 object-cover" />
                <div className="p-4">
                  <p className="font-bold">{c.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {c.categoryId} · {getCategoryPlanPriceLabel(c.categoryId)}
                  </p>
                  <p className="text-xs text-educture-orange mt-1">{c.published ? 'Published' : 'Hidden'}</p>
                  <button
                    type="button"
                    onClick={() => removeClass(c.id)}
                    className="text-xs text-red-500 mt-3 font-medium hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

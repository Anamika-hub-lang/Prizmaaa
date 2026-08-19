import { useState } from 'react'
import { useMentorContent } from '../../context/MentorContentContext'
import type { ClassCategoryId } from '../../data/classCatalog'
import {
  formatBrowsePricingSummary,
  getCategoryPlanPriceLabel,
  getDefaultPriceForCategory,
} from '../../data/classCatalog'
import type { ManagedClass } from '../../types/mentorContent'
import { MentorPageHeader } from '../../components/layout/TeacherLayout'
import { AppButton } from '../../components/ui/AppButton'
import { tintedSurface, tintedSurfaceKey } from '../../components/ui/dashboardCardStyles'

const defaultImage =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80'
const defaultMentorImage =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80'

type ClassFormState = {
  title: string
  categoryId: ClassCategoryId
  image: string
  duration: string
  sessions: string
  description: string
  mentor: string
  published: boolean
}

const emptyForm = (): ClassFormState => ({
  title: '',
  categoryId: 'skills',
  image: defaultImage,
  duration: '6 weeks',
  sessions: '12 live sessions',
  description: '',
  mentor: 'Your name',
  published: true,
})

function classToForm(c: ManagedClass): ClassFormState {
  return {
    title: c.title,
    categoryId: c.categoryId,
    image: c.image,
    duration: c.duration,
    sessions: c.sessions,
    description: c.description,
    mentor: c.mentor,
    published: c.published,
  }
}

export function MentorClassesPage() {
  const { myClasses, addClass, updateClass, removeClass, categories } = useMentorContent()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ClassFormState>(emptyForm)

  const resetForm = () => {
    setForm(emptyForm())
    setEditingId(null)
    setShowForm(false)
  }

  const openCreate = () => {
    setForm(emptyForm())
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (c: ManagedClass) => {
    setForm(classToForm(c))
    setEditingId(c.id)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: form.title.trim(),
      categoryId: form.categoryId,
      image: form.image.trim(),
      mentor: form.mentor.trim(),
      mentorImage: defaultMentorImage,
      duration: form.duration.trim(),
      sessions: form.sessions.trim(),
      description: form.description.trim(),
      meetLink: 'https://meet.google.com/',
      nextSessionLabel: 'Set in Meet tab',
      published: form.published,
    }

    if (editingId) {
      const existing = myClasses.find((c) => c.id === editingId)
      const price =
        existing?.categoryId === form.categoryId
          ? existing.price
          : getDefaultPriceForCategory(form.categoryId)
      updateClass(editingId, { ...payload, price })
    } else {
      addClass(payload)
    }
    resetForm()
  }

  const handleRemove = (c: ManagedClass) => {
    if (
      !window.confirm(
        `Remove "${c.title}"? Students will no longer see this class.`,
      )
    ) {
      return
    }
    removeClass(c.id)
    if (editingId === c.id) resetForm()
  }

  return (
    <>
      <MentorPageHeader
        title="Online classes"
        subtitle={`Students pay official category plans at checkout — ${formatBrowsePricingSummary()}.`}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left">
        <AppButton type="button" onClick={() => (showForm && !editingId ? resetForm() : openCreate())} className="mb-6">
          {showForm && !editingId ? 'Cancel' : '+ Upload new class'}
        </AppButton>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className={`${tintedSurface(0)} p-6 mb-8 grid sm:grid-cols-2 gap-4`}
          >
            <p className="sm:col-span-2 font-bold text-[#1d1d1d]">
              {editingId ? 'Edit class' : 'New class'}
            </p>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600">Class title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoryId: e.target.value as ClassCategoryId }))
                }
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Mentor name (shown to students)</label>
              <input
                value={form.mentor}
                onChange={(e) => setForm((f) => ({ ...f, mentor: e.target.value }))}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600">Cover image URL</label>
              <input
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
              />
              <img src={form.image} alt="" className="mt-2 w-full max-h-40 object-cover rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Duration</label>
              <input
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Sessions</label>
              <input
                value={form.sessions}
                onChange={(e) => setForm((f) => ({ ...f, sessions: e.target.value }))}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none resize-none"
              />
            </div>
            <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                  className="rounded border-gray-300 text-educture-orange focus:ring-educture-orange"
                />
                Published (visible to students)
              </label>
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-3">
              <AppButton type="submit">{editingId ? 'Save changes' : 'Publish class'}</AppButton>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300"
                >
                  Cancel edit
                </button>
              )}
              <p className="w-full text-xs text-gray-500">
                Checkout pricing for this category: {getCategoryPlanPriceLabel(form.categoryId)}
              </p>
            </div>
          </form>
        )}

        {myClasses.length === 0 ? (
          <p className="text-sm text-gray-500 py-8">
            No online classes yet. Use <strong>Upload new class</strong> to add your first one — students
            will see it live after you publish.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {myClasses.map((c) => (
              <article key={c.id} className={`overflow-hidden ${tintedSurfaceKey(c.id)}`}>
                <img src={c.image} alt="" className="w-full h-40 object-cover" />
                <div className="p-4">
                  <p className="font-bold">{c.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {c.categoryId} · {getCategoryPlanPriceLabel(c.categoryId)}
                  </p>
                  <p className="text-xs mt-1">
                    <span
                      className={
                        c.published
                          ? 'text-emerald-600 font-semibold'
                          : 'text-gray-400 font-semibold'
                      }
                    >
                      {c.published ? 'Published' : 'Hidden'}
                    </span>
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="text-xs text-educture-orange font-semibold hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => updateClass(c.id, { published: !c.published })}
                      className="text-xs text-gray-600 font-semibold hover:underline"
                    >
                      {c.published ? 'Hide' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(c)}
                      className="text-xs text-red-500 font-semibold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useMentorContent } from '../../context/MentorContentContext'
import type { ClassCategoryId } from '../../data/classCatalog'
import { getCategoryById, getDefaultPriceForCategory } from '../../data/classCatalog'
import type { ManagedClass } from '../../types/mentorContent'
import { MentorPageHeader } from '../../components/layout/TeacherLayout'
import { AppButton } from '../../components/ui/AppButton'
import { tintedSurface, tintedSurfaceKey } from '../../components/ui/dashboardCardStyles'
import { pickClassCoverImage, isGenericClassCover } from '../../lib/classCoverImages'
import { resolveMentorImage } from '../../lib/mentorAvatar'
import { ClassSharePanel } from '../../components/mentor/ClassSharePanel'
import { ClassNotifyPanel } from '../../components/mentor/ClassNotifyPanel'

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
  image: '',
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
  const { user } = useUser()
  const { myClasses, addClass, updateClass, removeClass, categories, isOwnerOfClass, refreshSharedClasses } =
    useMentorContent()
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
    const seed = editingId ?? `new-${form.title.trim().toLowerCase()}`
    const coverImage = isGenericClassCover(form.image)
      ? pickClassCoverImage({
          id: seed,
          categoryId: form.categoryId,
          title: form.title.trim(),
          image: form.image,
        })
      : form.image.trim()

    const payload = {
      title: form.title.trim(),
      categoryId: form.categoryId,
      image: coverImage,
      mentor: form.mentor.trim(),
      mentorImage: resolveMentorImage(undefined, user?.hasImage ? user.imageUrl : null),
      duration: form.duration.trim(),
      sessions: form.sessions.trim(),
      description: form.description.trim(),
      meetLink: 'https://meet.google.com/',
      nextSessionLabel: '',
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
        subtitle="Upload, publish, and share live classes with a co-mentor when you need backup."
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
                placeholder="Leave blank for auto cover image"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
              />
              <img
                src={pickClassCoverImage({
                  id: editingId ?? 'preview',
                  categoryId: form.categoryId,
                  title: form.title.trim() || 'preview',
                  image: form.image,
                })}
                alt=""
                className="mt-2 w-full max-h-40 object-cover rounded-xl"
              />
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
                    {getCategoryById(c.categoryId)?.title ?? c.categoryId} · {c.sessions}
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
                  <ClassSharePanel
                    classId={c.id}
                    classTitle={c.title}
                    isOwner={isOwnerOfClass(c.id)}
                    onChanged={() => void refreshSharedClasses()}
                  />
                  <ClassNotifyPanel classId={c.id} classTitle={c.title} />
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
                    {isOwnerOfClass(c.id) ? (
                      <button
                        type="button"
                        onClick={() => handleRemove(c)}
                        className="text-xs text-red-500 font-semibold hover:underline"
                      >
                        Remove
                      </button>
                    ) : null}
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

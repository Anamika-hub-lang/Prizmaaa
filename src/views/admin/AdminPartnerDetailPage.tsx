'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@clerk/nextjs'
import { AdminPageHeader } from '../../components/layout/AdminLayout'
import { dashboardCardBorder, dashboardTint } from '../../components/ui/dashboardCardStyles'
import {
  addPartnerProgram,
  fetchPartnerPrograms,
  fetchPartners,
  patchPartner,
  type UniversityPartner,
} from '../../lib/universityLeadsApi'

const inputClass =
  'w-full mt-1 px-3 py-2 rounded-xl border border-orange-100 bg-white text-sm outline-none focus:border-educture-orange'

export function AdminPartnerDetailPage() {
  const { id = '' } = useParams()
  const { getToken } = useAuth()
  const [partner, setPartner] = useState<UniversityPartner | null>(null)
  const [programs, setPrograms] = useState<
    Array<{ id: string; name: string; fees_inr: number | null; eligibility: string | null; duration: string | null }>
  >([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [shortName, setShortName] = useState('')
  const [location, setLocation] = useState('')
  const [state, setState] = useState('')
  const [website, setWebsite] = useState('')
  const [admissionInfo, setAdmissionInfo] = useState('')
  const [clerkId, setClerkId] = useState('')
  const [leadFee, setLeadFee] = useState('0')
  const [admitFee, setAdmitFee] = useState('0')
  const [isActive, setIsActive] = useState(true)
  const [progName, setProgName] = useState('')
  const [progFees, setProgFees] = useState('')
  const [progElig, setProgElig] = useState('')
  const [progDuration, setProgDuration] = useState('')

  const load = useCallback(async () => {
    setError(null)
    try {
      const list = await fetchPartners(getToken)
      const found = list.find((p) => p.id === id) ?? null
      setPartner(found)
      if (found) {
        setName(found.name)
        setShortName(found.short_name ?? '')
        setLocation(found.location ?? '')
        setState(found.state ?? '')
        setWebsite(found.website ?? '')
        setAdmissionInfo(found.admission_info ?? '')
        setClerkId(found.clerk_id ?? '')
        setLeadFee(String(found.lead_commission_inr ?? 0))
        setAdmitFee(String(found.admission_commission_inr ?? 0))
        setIsActive(found.is_active)
        setPrograms(await fetchPartnerPrograms(getToken, found.id))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load partner')
    }
  }, [getToken, id])

  useEffect(() => {
    void load()
  }, [load])

  async function saveProfile(e: FormEvent) {
    e.preventDefault()
    if (!partner) return
    setSaving(true)
    setError(null)
    try {
      await patchPartner(getToken, partner.id, {
        name,
        shortName,
        location,
        state,
        website,
        admissionInfo,
        clerkId,
        leadCommissionInr: Number(leadFee) || 0,
        admissionCommissionInr: Number(admitFee) || 0,
        isActive,
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save partner')
    } finally {
      setSaving(false)
    }
  }

  async function addProgram(e: FormEvent) {
    e.preventDefault()
    if (!partner || !progName.trim()) return
    setSaving(true)
    setError(null)
    try {
      await addPartnerProgram(getToken, partner.id, {
        name: progName.trim(),
        feesInr: progFees ? Number(progFees) : null,
        eligibility: progElig.trim(),
        duration: progDuration.trim(),
      })
      setProgName('')
      setProgFees('')
      setProgElig('')
      setProgDuration('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add programme')
    } finally {
      setSaving(false)
    }
  }

  if (!partner && !error) {
    return (
      <div>
        <AdminPageHeader title="Partner profile" subtitle="Loading…" />
      </div>
    )
  }

  if (!partner) {
    return (
      <div>
        <AdminPageHeader title="Partner not found" />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link to="/admin/partners" className="text-sm font-semibold text-educture-orange">
            ← Back to partners
          </Link>
        </div>
      </div>
    )
  }

  const stats = partner.stats ?? { leads: 0, applications: 0, admissions: 0, shared: 0 }

  return (
    <div>
      <AdminPageHeader title={partner.name} subtitle="Profile, programmes, admission notes, and lead volume." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Link to="/admin/partners" className="text-sm font-semibold text-educture-orange">
          ← All partners
        </Link>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <div className="grid sm:grid-cols-4 gap-3">
          {[
            { label: 'Leads received', value: stats.leads, tint: 0 },
            { label: 'Shared contacts', value: stats.shared, tint: 1 },
            { label: 'Applications', value: stats.applications, tint: 2 },
            { label: 'Admissions', value: stats.admissions, tint: 3 },
          ].map((card) => {
            const tint = dashboardTint(card.tint)
            return (
              <div key={card.label} className={`${dashboardCardBorder} ${tint.bg} ${tint.border} rounded-2xl p-4`}>
                <p className="text-xs uppercase tracking-wide text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
            )
          })}
        </div>

        <form onSubmit={(e) => void saveProfile(e)} className="rounded-2xl border border-orange-100 bg-white p-5 grid sm:grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-gray-500">
            Name
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            Short name
            <input className={inputClass} value={shortName} onChange={(e) => setShortName(e.target.value)} />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            Location
            <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            State
            <input className={inputClass} value={state} onChange={(e) => setState(e.target.value)} />
          </label>
          <label className="text-xs font-semibold text-gray-500 sm:col-span-2">
            Website
            <input className={inputClass} value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
          <label className="text-xs font-semibold text-gray-500 sm:col-span-2">
            Admission information
            <textarea
              className={`${inputClass} min-h-[88px]`}
              value={admissionInfo}
              onChange={(e) => setAdmissionInfo(e.target.value)}
            />
          </label>
          <label className="text-xs font-semibold text-gray-500 sm:col-span-2">
            Partner Clerk user ID (for /partner login)
            <input className={inputClass} value={clerkId} onChange={(e) => setClerkId(e.target.value)} />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            Lead commission (₹)
            <input className={inputClass} type="number" min={0} value={leadFee} onChange={(e) => setLeadFee(e.target.value)} />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            Admission commission (₹)
            <input className={inputClass} type="number" min={0} value={admitFee} onChange={(e) => setAdmitFee(e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active partner
          </label>
          <div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-educture-orange px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-orange-100 bg-white p-5">
          <h2 className="font-semibold mb-3">Courses / programmes</h2>
          <ul className="space-y-2 mb-4">
            {programs.length === 0 ? (
              <li className="text-sm text-gray-400">No programmes yet.</li>
            ) : (
              programs.map((p) => (
                <li key={p.id} className="rounded-xl border border-orange-50 px-3 py-2 text-sm">
                  <span className="font-medium">{p.name}</span>
                  {p.fees_inr != null ? <span className="text-gray-500"> · ₹{p.fees_inr.toLocaleString('en-IN')}</span> : null}
                  {p.duration ? <span className="text-gray-500"> · {p.duration}</span> : null}
                  {p.eligibility ? <p className="text-xs text-gray-500 mt-1">{p.eligibility}</p> : null}
                </li>
              ))
            )}
          </ul>
          <form onSubmit={(e) => void addProgram(e)} className="grid sm:grid-cols-4 gap-2">
            <input
              className={inputClass}
              placeholder="Programme name"
              value={progName}
              onChange={(e) => setProgName(e.target.value)}
              required
            />
            <input
              className={inputClass}
              placeholder="Fees (₹)"
              value={progFees}
              onChange={(e) => setProgFees(e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Eligibility"
              value={progElig}
              onChange={(e) => setProgElig(e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Duration"
              value={progDuration}
              onChange={(e) => setProgDuration(e.target.value)}
            />
            <button
              type="submit"
              disabled={saving}
              className="sm:col-span-4 rounded-full border-[3px] border-orange-200 px-4 py-2 text-sm font-semibold"
            >
              Add programme
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

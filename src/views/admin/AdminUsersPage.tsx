'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Search } from 'lucide-react'
import { AdminPageHeader } from '../../components/layout/AdminLayout'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import {
  ASSIGNABLE_ROLES,
  isUserRole,
  roleDisplayLabel,
  type AssignableRole,
  type UserRole,
} from '../../types/auth'
import {
  fetchAdminUsers,
  patchAdminUserRole,
  type AdminUserRow,
} from '../../lib/adminDashboardApi'

const PAGE_SIZE = 20

function matchesSearch(user: AdminUserRow, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const name = (user.fullName ?? '').toLowerCase()
  const email = (user.email ?? '').toLowerCase()
  const role = (user.role ?? '').toLowerCase()
  const roleLabel = isUserRole(user.role)
    ? roleDisplayLabel(user.role as UserRole).toLowerCase()
    : 'member'

  return (
    name.includes(q) ||
    email.includes(q) ||
    role.includes(q) ||
    roleLabel.includes(q) ||
    // allow searching "mentor" for teacher role
    (q === 'mentor' && role === 'teacher')
  )
}

export function AdminUsersPage() {
  const { getToken } = useAuth()
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setUsers(await fetchAdminUsers(getToken))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [roleFilter, search])

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter === 'none' && u.role) return false
      if (roleFilter !== 'all' && roleFilter !== 'none' && u.role !== roleFilter) return false
      return matchesSearch(u, search)
    })
  }, [users, roleFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  async function assignRole(clerkId: string, role: AssignableRole | null) {
    setBusyId(clerkId)
    setError(null)
    setWarning(null)
    try {
      const result = await patchAdminUserRole(getToken, clerkId, role)
      await load()
      if (result.warning) {
        setWarning(result.warning)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update role')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Users management"
        subtitle="Search by name, email, or role. Assign student, mentor, counsellor, or intern. Admin roles cannot be changed here."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <label className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {['all', 'student', 'teacher', 'counsellor', 'intern', 'admin', 'none'].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setRoleFilter(id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                roleFilter === id
                  ? 'border-educture-orange bg-educture-orange/10 text-educture-orange'
                  : 'border-orange-100 bg-white text-gray-600'
              }`}
            >
              {id === 'teacher' ? 'Mentor' : id}
            </button>
          ))}
        </div>

        {warning ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {warning}
          </div>
        ) : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
          <p>
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
            –{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-orange-100 px-3 py-1.5 font-semibold text-gray-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-semibold text-gray-600">
              Page {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-orange-100 px-3 py-1.5 font-semibold text-gray-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        <DataTable
          loading={loading}
          rows={pageRows}
          emptyTitle="No users found"
          emptyDescription={
            search.trim()
              ? 'Try a different name, email, or role.'
              : 'Profiles appear here after Clerk sync.'
          }
          columns={[
            {
              key: 'name',
              header: 'User',
              cell: (row) => (
                <div>
                  <p className="font-medium text-[#1d1d1d]">{row.fullName || 'Unnamed'}</p>
                  <p className="text-xs text-gray-500">{row.email || row.clerkId}</p>
                </div>
              ),
            },
            {
              key: 'role',
              header: 'Role',
              cell: (row) => (
                <StatusBadge
                  label={roleDisplayLabel((row.role as AssignableRole | 'admin' | null) ?? null)}
                  tone={row.role ? 'neutral' : 'pending'}
                />
              ),
            },
            {
              key: 'actions',
              header: 'Assign',
              cell: (row) => {
                if (row.role === 'admin') {
                  return <span className="text-xs text-gray-400">Protected</span>
                }
                return (
                  <div className="flex flex-wrap gap-1.5">
                    {ASSIGNABLE_ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        disabled={busyId === row.clerkId || row.role === role}
                        onClick={() => void assignRole(row.clerkId, role)}
                        className="rounded-lg border border-orange-100 px-2 py-1 text-[11px] font-semibold text-gray-700 hover:border-educture-orange hover:text-educture-orange disabled:opacity-40"
                      >
                        {roleDisplayLabel(role)}
                      </button>
                    ))}
                    {row.role ? (
                      <button
                        type="button"
                        disabled={busyId === row.clerkId}
                        onClick={() => void assignRole(row.clerkId, null)}
                        className="rounded-lg border border-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-40"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                )
              },
            },
          ]}
        />
      </div>
    </div>
  )
}

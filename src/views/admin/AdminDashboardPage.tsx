import { Link } from 'react-router-dom'
import {
  CalendarCheck,
  CreditCard,
  FileSpreadsheet,
  Tags,
  UserRound,
  Users,
} from 'lucide-react'
import { AdminPageHeader } from '../../components/layout/AdminLayout'
import { dashboardCardBorder, dashboardTint } from '../../components/ui/dashboardCardStyles'

const tiles = [
  {
    to: '/admin/users',
    title: 'Users management',
    desc: 'View all users, filter by role, and assign mentor, counsellor, or intern.',
    icon: Users,
    tint: 0,
  },
  {
    to: '/admin/counselling-types',
    title: 'Counselling types',
    desc: 'Create Career, Abroad, Tech and custom types with subdomains.',
    icon: Tags,
    tint: 1,
  },
  {
    to: '/admin/counsellors',
    title: 'Counsellor management',
    desc: 'Assign types, availability, and review counsellor bookings.',
    icon: UserRound,
    tint: 2,
  },
  {
    to: '/admin/uploads',
    title: 'CSV approvals',
    desc: 'Approve or reject intern class CSV uploads before they go live.',
    icon: FileSpreadsheet,
    tint: 3,
  },
  {
    to: '/admin/counselling',
    title: 'Counselling bookings',
    desc: 'See who booked, assignees, and whether payment went through.',
    icon: CalendarCheck,
    tint: 4,
  },
  {
    to: '/admin/counselling?status=paid',
    title: 'Paid sessions',
    desc: 'Confirmed Cashfree payments ready for Meet or call.',
    icon: CreditCard,
    tint: 5,
  },
] as const

export function AdminDashboardPage() {
  return (
    <div>
      <AdminPageHeader
        title="Admin overview"
        subtitle="Manage users, counselling, counsellors, and CSV catalog approvals."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiles.map((tile) => {
            const Icon = tile.icon
            const tint = dashboardTint(tile.tint)
            return (
              <Link
                key={tile.to}
                to={tile.to}
                className={`${dashboardCardBorder} ${tint.bg} ${tint.border} rounded-2xl p-5 text-left hover:brightness-[0.98] transition`}
              >
                <Icon className="w-6 h-6 text-educture-orange" />
                <h2 className="font-bold text-lg text-[#1d1d1d] mt-3">{tile.title}</h2>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{tile.desc}</p>
                <p className="text-xs font-semibold text-educture-orange mt-4">Open →</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

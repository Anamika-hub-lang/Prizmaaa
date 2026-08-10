export const COUNSELLING_TIME_SLOTS = [
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '20:00', label: '8:00 PM' },
] as const

export type CounsellingTimeSlot = (typeof COUNSELLING_TIME_SLOTS)[number]['value']

const SLOT_VALUES = new Set<string>(COUNSELLING_TIME_SLOTS.map((s) => s.value))

export function isValidCounsellingTimeSlot(value: string): value is CounsellingTimeSlot {
  return SLOT_VALUES.has(value)
}

export function formatScheduleLabel(date: string, time: string): string {
  const slot = COUNSELLING_TIME_SLOTS.find((s) => s.value === time)
  const d = new Date(`${date}T${time}:00`)
  const dateLabel = d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `${dateLabel} · ${slot?.label ?? time}`
}

/** YYYY-MM-DD for &lt;input type="date" min&gt; */
export function minBookingDateString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function availableSlotsForDate(date: string): Array<(typeof COUNSELLING_TIME_SLOTS)[number]> {
  const today = minBookingDateString()
  if (date !== today) return [...COUNSELLING_TIME_SLOTS]

  const now = new Date()
  const minHour = now.getHours() + 2
  return COUNSELLING_TIME_SLOTS.filter((s) => {
    const hour = Number.parseInt(s.value.split(':')[0] ?? '0', 10)
    return hour >= minHour
  })
}

export function sanitizeIndianPhoneDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 10)
}

export function validateIndianPhoneServer(
  phone: string,
): { ok: true; digits: string } | { ok: false; error: string } {
  const digits = sanitizeIndianPhoneDigits(phone)
  if (digits.length !== 10) {
    return { ok: false, error: 'Phone number must be exactly 10 digits' }
  }
  if (!/^[6-9]/.test(digits)) {
    return { ok: false, error: 'Enter a valid Indian mobile number' }
  }
  return { ok: true, digits }
}

const SLOT_VALUES = new Set([
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
])

export function isValidCounsellingTimeSlot(value: string): boolean {
  return SLOT_VALUES.has(value)
}

export function validateScheduledDateTime(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Invalid date'
  if (!isValidCounsellingTimeSlot(time)) return 'Invalid time slot'
  const scheduled = new Date(`${date}T${time}:00`)
  if (Number.isNaN(scheduled.getTime())) return 'Invalid schedule'
  const minMs = Date.now() + 2 * 60 * 60 * 1000
  if (scheduled.getTime() < minMs) {
    return 'Pick a slot at least 2 hours from now'
  }
  return null
}

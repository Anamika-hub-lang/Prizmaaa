/** Strip to digits only, max 10 for Indian mobile input. */
export function sanitizeIndianPhoneInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 10)
}

/** Normalize +91 / 91 / 0-prefix / 10-digit Indian mobile for Cashfree. */
export function toIndianMobileDigits(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2)
  if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1)
  if (digits.length !== 10 || !/^[6-9]/.test(digits)) return null
  if (digits === '9999999999') return null
  return digits
}

export function validateIndianPhone(phone: string): { ok: true; digits: string } | { ok: false; error: string } {
  const digits = sanitizeIndianPhoneInput(phone)
  if (digits.length !== 10) {
    return { ok: false, error: 'Phone number must be exactly 10 digits' }
  }
  if (!/^[6-9]/.test(digits) || digits === '9999999999') {
    return { ok: false, error: 'Enter a valid Indian mobile number (starts with 6–9)' }
  }
  return { ok: true, digits }
}

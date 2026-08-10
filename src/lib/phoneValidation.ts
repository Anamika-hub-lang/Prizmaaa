/** Strip to digits only, max 10 for Indian mobile input. */
export function sanitizeIndianPhoneInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 10)
}

export function validateIndianPhone(phone: string): { ok: true; digits: string } | { ok: false; error: string } {
  const digits = sanitizeIndianPhoneInput(phone)
  if (digits.length !== 10) {
    return { ok: false, error: 'Phone number must be exactly 10 digits' }
  }
  if (!/^[6-9]/.test(digits)) {
    return { ok: false, error: 'Enter a valid Indian mobile number (starts with 6–9)' }
  }
  return { ok: true, digits }
}

const PENDING_ORDER_KEY = 'educture_cashfree_order_id'

/** Cashfree order ids: edu_* (classes) or coun_* (counselling) */
export function isPlausibleCashfreeOrderId(id: string): boolean {
  const t = id.trim()
  if (t.length < 10 || t.length > 50) return false
  if (/X{3,}/i.test(t)) return false
  return /^(edu|coun)_[0-9]+$/.test(t)
}

export function orderIdFromSearchParams(searchParams: URLSearchParams): string | null {
  const keys = ['order_id', 'orderId', 'cf_order_id', 'cf_orderId']
  for (const key of keys) {
    const v = searchParams.get(key)?.trim()
    if (v) return v
  }
  return null
}

export function resolveCashfreeOrderId(searchParams: URLSearchParams): string | null {
  const fromUrl = orderIdFromSearchParams(searchParams)
  if (fromUrl && isPlausibleCashfreeOrderId(fromUrl)) return fromUrl

  try {
    const session = sessionStorage.getItem(PENDING_ORDER_KEY)?.trim()
    if (session && isPlausibleCashfreeOrderId(session)) return session
    const local = localStorage.getItem(PENDING_ORDER_KEY)?.trim()
    if (local && isPlausibleCashfreeOrderId(local)) return local
  } catch {
    /* ignore */
  }
  return null
}

export function stashCashfreeOrderId(orderId: string) {
  if (!isPlausibleCashfreeOrderId(orderId)) return
  try {
    sessionStorage.setItem(PENDING_ORDER_KEY, orderId)
    localStorage.setItem(PENDING_ORDER_KEY, orderId)
  } catch {
    /* ignore */
  }
}

export function takeCashfreeOrderId(): string | null {
  try {
    const id = sessionStorage.getItem(PENDING_ORDER_KEY) ?? localStorage.getItem(PENDING_ORDER_KEY)
    sessionStorage.removeItem(PENDING_ORDER_KEY)
    localStorage.removeItem(PENDING_ORDER_KEY)
    return id
  } catch {
    return null
  }
}

export function clearCashfreeOrderId(): void {
  try {
    sessionStorage.removeItem(PENDING_ORDER_KEY)
    localStorage.removeItem(PENDING_ORDER_KEY)
  } catch {
    /* ignore */
  }
}

export function readCashfreeOrderId(): string | null {
  try {
    const id = sessionStorage.getItem(PENDING_ORDER_KEY) ?? localStorage.getItem(PENDING_ORDER_KEY)
    return id && isPlausibleCashfreeOrderId(id) ? id : null
  } catch {
    return null
  }
}

export type CashfreeServerConfig = {
  clientId?: string
  clientSecret?: string
  mode?: 'sandbox' | 'production'
}

import { normalizeCashfreeOrderNoteRaw } from './cashfreeOrderNote'

/**
 * Origin Cashfree has already approved for JS checkout + return_url.
 * Keep this on vercel.app until merchant.cashfree.com whitelists https://prizma.guru.
 */
export const CASHFREE_PRODUCTION_ORIGIN = 'https://prizma-guru.vercel.app'

export function parseCashfreeMode(
  raw: string | undefined,
  secret?: string,
): 'sandbox' | 'production' {
  const mode = raw?.trim().toLowerCase()
  if (mode === 'production' || mode === 'prod' || mode === 'live') return 'production'
  if (mode === 'sandbox' || mode === 'test') return 'sandbox'
  if (secret && cashfreeSecretLooksProduction(secret)) return 'production'
  return 'sandbox'
}

const API_VERSION = '2023-08-01'

function pgBase(mode: 'sandbox' | 'production') {
  return mode === 'sandbox' ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg'
}

export function isCashfreeConfigured(cfg: CashfreeServerConfig): boolean {
  return Boolean(cfg.clientId && cfg.clientSecret)
}

function cashfreeSecretLooksProduction(secret: string): boolean {
  return /cfsk_ma_prod|_prod_/i.test(secret)
}

function cashfreeSecretLooksSandbox(secret: string): boolean {
  return /cfsk_ma_test|_test_/i.test(secret)
}

function validateCashfreeModeVsSecret(cfg: CashfreeServerConfig): void {
  const secret = cfg.clientSecret ?? ''
  const mode = parseCashfreeMode(cfg.mode, secret)
  if (mode === 'sandbox' && cashfreeSecretLooksProduction(secret)) {
    throw new Error(
      'Cashfree credentials mismatch: production secret with sandbox mode. Set CASHFREE_MODE=production and VITE_CASHFREE_MODE=production, or use sandbox Client ID / Secret from Cashfree test dashboard.',
    )
  }
  if (mode === 'production' && cashfreeSecretLooksSandbox(secret)) {
    throw new Error(
      'Cashfree credentials mismatch: sandbox secret with production mode. Set CASHFREE_MODE=sandbox and VITE_CASHFREE_MODE=sandbox, or use live credentials.',
    )
  }
}

type CreateOrderInput = {
  orderId: string
  amount: number
  currency?: string
  customerId: string
  customerName?: string
  customerEmail: string
  customerPhone: string
  returnUrl: string
  orderNote: string
}

export async function cashfreeCreateOrder(cfg: CashfreeServerConfig, input: CreateOrderInput) {
  const mode = parseCashfreeMode(cfg.mode, cfg.clientSecret)
  if (!cfg.clientId || !cfg.clientSecret) {
    throw new Error('Cashfree credentials missing')
  }
  validateCashfreeModeVsSecret(cfg)

  const customerId = input.customerId.trim()
  const customerPhone = input.customerPhone.trim()
  const customerEmail = input.customerEmail.trim()
  if (!customerId) {
    throw new Error('Cashfree customer_id is required')
  }
  if (!customerPhone) {
    throw new Error('Cashfree customer_phone is required')
  }
  if (!customerEmail) {
    throw new Error('Cashfree customer_email is required')
  }

  const res = await fetch(`${pgBase(mode)}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': API_VERSION,
      'x-client-id': cfg.clientId,
      'x-client-secret': cfg.clientSecret,
    },
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: input.amount,
      order_currency: input.currency ?? 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name: input.customerName?.trim() || 'Student',
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: input.returnUrl,
      },
      order_note: input.orderNote,
    }),
  })

  const data = (await res.json()) as {
    payment_session_id?: string
    order_id?: string
    message?: string
  }

  if (!res.ok) {
    throw new Error(data.message ?? `Cashfree create order failed (${res.status})`)
  }

  if (!data.payment_session_id) {
    throw new Error('Cashfree did not return payment_session_id')
  }

  return {
    paymentSessionId: data.payment_session_id,
    orderId: data.order_id ?? input.orderId,
  }
}

export async function cashfreeFetchOrder(cfg: CashfreeServerConfig, orderId: string) {
  const mode = parseCashfreeMode(cfg.mode, cfg.clientSecret)
  if (!cfg.clientId || !cfg.clientSecret) {
    throw new Error('Cashfree credentials missing')
  }
  validateCashfreeModeVsSecret(cfg)

  const res = await fetch(`${pgBase(mode)}/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: {
      'x-api-version': API_VERSION,
      'x-client-id': cfg.clientId,
      'x-client-secret': cfg.clientSecret,
    },
  })

  const data = (await res.json()) as {
    order_status?: string
    order_note?: string
    order_notes?: string
    customer_details?: { customer_id?: string }
    message?: string
  }

  if (!res.ok) {
    throw new Error(data.message ?? `Cashfree fetch order failed (${res.status})`)
  }

  const rawNote = data.order_note ?? data.order_notes

  return {
    orderStatus: data.order_status ?? '',
    orderNote: rawNote ? normalizeCashfreeOrderNoteRaw(rawNote) : undefined,
    orderNoteRaw: rawNote,
    customerId: data.customer_details?.customer_id?.trim() || undefined,
  }
}

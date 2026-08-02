export type CashfreeServerConfig = {
  clientId?: string
  clientSecret?: string
  mode?: 'sandbox' | 'production'
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
  const mode = cfg.mode === 'production' ? 'production' : 'sandbox'
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
  customerEmail?: string
  customerPhone?: string
  returnUrl: string
  orderNote: string
}

export async function cashfreeCreateOrder(cfg: CashfreeServerConfig, input: CreateOrderInput) {
  const mode = cfg.mode === 'production' ? 'production' : 'sandbox'
  if (!cfg.clientId || !cfg.clientSecret) {
    throw new Error('Cashfree credentials missing')
  }
  validateCashfreeModeVsSecret(cfg)

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
        customer_id: input.customerId,
        customer_name: input.customerName ?? 'Student',
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone ?? '9999999999',
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
  const mode = cfg.mode === 'production' ? 'production' : 'sandbox'
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
    message?: string
  }

  if (!res.ok) {
    throw new Error(data.message ?? `Cashfree fetch order failed (${res.status})`)
  }

  return {
    orderStatus: data.order_status ?? '',
    orderNote: data.order_note,
  }
}

type NotifyEnv = {
  notifyEmail?: string
  resendApiKey?: string
}

export async function sendNotifyEmail(
  env: NotifyEnv,
  subject: string,
  html: string
): Promise<void> {
  const to = env.notifyEmail ?? 'aaniya1985@gmail.com'
  if (!env.resendApiKey) {
    console.warn('[notify] RESEND_API_KEY not set — email not sent. Application saved in Supabase.')
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Educture <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[notify] Resend failed', text)
    throw new Error('Email notification failed')
  }
}

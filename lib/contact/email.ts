import dns from 'node:dns/promises'

const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  'discard.email',
  'dispostable.com',
  'emailondeck.com',
  'fakeinbox.com',
  'guerrillamail.com',
  'mailinator.com',
  'maildrop.cc',
  'sharklasers.com',
  'tempmail.com',
  'temp-mail.org',
  'yopmail.com',
])

async function hasDnsRecords(type: 'mx' | 'a' | 'aaaa', domain: string): Promise<boolean> {
  try {
    if (type === 'mx') {
      const result = await dns.resolveMx(domain)
      return Array.isArray(result) && result.length > 0
    }
    if (type === 'a') {
      const result = await dns.resolve4(domain)
      return Array.isArray(result) && result.length > 0
    }
    if (type === 'aaaa') {
      const result = await dns.resolve6(domain)
      return Array.isArray(result) && result.length > 0
    }
    return false
  } catch (error: unknown) {
    const dnsError = error as { code?: string }
    if (dnsError.code === 'ENOTFOUND' || dnsError.code === 'ENODATA') {
      return false
    }
    // On transient DNS failures we don't block legitimate users.
    return true
  }
}

export async function isLikelyDeliverableEmail(domain: string): Promise<{ valid: boolean; reason: string }> {
  if (!domain || domain.length < 3 || !domain.includes('.')) {
    return { valid: false, reason: 'domain-format' }
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: 'disposable-domain' }
  }

  const hasMx = await hasDnsRecords('mx', domain)
  if (hasMx) return { valid: true, reason: 'mx' }

  const hasA = await hasDnsRecords('a', domain)
  if (hasA) return { valid: true, reason: 'a' }

  const hasAaaa = await hasDnsRecords('aaaa', domain)
  if (hasAaaa) return { valid: true, reason: 'aaaa' }

  return { valid: false, reason: 'dns-missing' }
}

interface SendEmailParams {
  apiKey: string
  from: string
  to: string
  replyTo: string
  subject: string
  text: string
}

export async function sendWithResend(params: SendEmailParams): Promise<{ ok: boolean; id?: string | null; error?: unknown }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: params.from,
        to: [params.to],
        reply_to: params.replyTo,
        subject: params.subject,
        text: params.text,
      }),
    })

    if (!response.ok) {
      const errorPayload = await response.text()
      return { ok: false, error: { status: response.status, body: errorPayload } }
    }

    const payload = await response.json().catch(() => null)
    return { ok: true, id: payload && typeof payload.id === 'string' ? payload.id : null }
  } catch (error) {
    return {
      ok: false,
      error: { message: error instanceof Error ? error.message : 'Unknown error' },
    }
  }
}

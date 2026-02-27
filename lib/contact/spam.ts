const MAX_MESSAGE_LENGTH = 2500
const MIN_FORM_FILL_MS = 1200
const EMAIL_REGEX =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i

export const SUBJECT_LABELS: Record<string, string> = {
  visita: 'Prenotazione visita',
  evento: 'Evento privato',
  informazioni: 'Richiesta informazioni',
  altro: 'Altro',
}

const BLOCKED_USER_AGENT_PATTERNS = [
  /python-requests/i,
  /curl\//i,
  /wget/i,
  /httpclient/i,
  /scrapy/i,
  /go-http-client/i,
  /node-fetch/i,
  /aiohttp/i,
]

const SPAM_PATTERNS = [
  /\bseo\b/i,
  /\bposizionamento\s+google\b/i,
  /\blink\s*building\b/i,
  /\bbacklinks?\b/i,
  /\bguest\s*post/i,
  /\bcasino\b/i,
  /\bscommesse\b/i,
  /\bslot\b/i,
  /\bviagra\b/i,
  /\bcrypto\b/i,
  /\bcriptovalut\w*\b/i,
  /\bforex\b/i,
  /\bloan\b/i,
  /\bprestito\s+rapido\b/i,
  /\bwhatsapp\b/i,
  /\btelegram\b/i,
  /\bonlyfans\b/i,
  /\badult\b/i,
  /\bofferta\s+commerciale\b/i,
  /\bmake money fast\b/i,
  /\bwork from home\b/i,
]

const ALLOWED_ORIGIN_HOSTS = new Set([
  'castellomongivetto.com',
  'www.castellomongivetto.com',
  'castello-mongivetto.vercel.app',
])

export interface ContactPayload {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  website: string
  privacy: boolean
  formStartedAt: number
  emailDomain: string
}

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\u0000/g, '').trim().slice(0, maxLength)
}

function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+()./\-\s]/g, '')
}

export function normalizePayload(body: Record<string, unknown>): ContactPayload {
  const name = cleanText(body.name, 120)
  const email = cleanText(body.email, 160).toLowerCase()
  const phone = sanitizePhone(cleanText(body.phone, 40))
  const subject = cleanText(body.subject, 40).toLowerCase()
  const message = cleanText(body.message, MAX_MESSAGE_LENGTH)
  const website = cleanText(body.website, 120)
  const privacy = body.privacy === true
  const formStartedAt = Number(body.formStartedAt)
  const emailDomain = email.includes('@') ? email.split('@').pop() || '' : ''

  return { name, email, phone, subject, message, website, privacy, formStartedAt, emailDomain }
}

export function validatePayload(payload: ContactPayload): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!payload.name) errors.name = 'Inserisci nome e cognome.'
  if (!payload.email || !EMAIL_REGEX.test(payload.email)) errors.email = 'Inserisci un indirizzo email valido.'
  if (!Object.prototype.hasOwnProperty.call(SUBJECT_LABELS, payload.subject)) errors.subject = 'Seleziona una tipologia valida.'
  if (!payload.message || payload.message.length < 10) errors.message = 'Inserisci un messaggio di almeno 10 caratteri.'
  if (payload.message.length > MAX_MESSAGE_LENGTH) errors.message = 'Il messaggio è troppo lungo.'
  if (!payload.privacy) errors.privacy = 'È necessario accettare il consenso privacy.'

  return errors
}

export interface SpamResult {
  action: 'allow' | 'flag' | 'block'
  reasons: string[]
}

export function evaluateSpam(payload: ContactPayload): SpamResult {
  const reasons: string[] = []
  const flags = {
    honeypot: false,
    tooFast: false,
    missingTiming: false,
    keywordHits: 0,
    manyLinks: false,
    repeatedChars: false,
    veryShortMessage: false,
  }

  if (payload.website) {
    reasons.push('honeypot')
    flags.honeypot = true
  }

  if (Number.isFinite(payload.formStartedAt) && payload.formStartedAt > 0) {
    const elapsed = Date.now() - payload.formStartedAt
    if (elapsed < MIN_FORM_FILL_MS) {
      reasons.push('submitted-too-fast')
      flags.tooFast = true
    }
  }

  if (!Number.isFinite(payload.formStartedAt) || payload.formStartedAt <= 0) {
    reasons.push('missing-timing-signal')
    flags.missingTiming = true
  }

  const combined = `${payload.name} ${payload.email} ${payload.subject} ${payload.message}`
  const keywordHits = SPAM_PATTERNS.filter(pattern => pattern.test(combined))
  if (keywordHits.length > 0) {
    reasons.push(`keywords:${keywordHits.length}`)
    flags.keywordHits = keywordHits.length
  }

  const links = payload.message.match(/(?:https?:\/\/|www\.)\S+/gi)
  if (links && links.length > 2) {
    reasons.push('too-many-links')
    flags.manyLinks = true
  }

  if (/([a-z0-9])\1{8,}/i.test(payload.message)) {
    reasons.push('repeated-characters')
    flags.repeatedChars = true
  }

  if (payload.message.split(/\s+/).length <= 2) {
    reasons.push('very-short-message')
    flags.veryShortMessage = true
  }

  if (flags.honeypot) return { action: 'block', reasons }

  const clearSpamSignals =
    flags.keywordHits >= 2 ||
    (flags.keywordHits >= 1 && flags.manyLinks) ||
    (flags.manyLinks && flags.repeatedChars)
  if (clearSpamSignals) return { action: 'block', reasons }

  const suspiciousSignals =
    flags.tooFast ||
    flags.missingTiming ||
    flags.keywordHits === 1 ||
    flags.manyLinks ||
    flags.repeatedChars ||
    flags.veryShortMessage
  if (suspiciousSignals) return { action: 'flag', reasons }

  return { action: 'allow', reasons }
}

function isAllowedSourceHost(urlOrOrigin: string): boolean {
  try {
    const parsed = new URL(urlOrOrigin)
    const host = parsed.hostname.toLowerCase()
    if (ALLOWED_ORIGIN_HOSTS.has(host)) return true
    if (host.endsWith('.vercel.app')) return true
    return false
  } catch {
    return false
  }
}

export function evaluateRequestRisk(headers: Headers): SpamResult {
  const reasons: string[] = []
  const userAgent = (headers.get('user-agent') || '').trim()
  const origin = (headers.get('origin') || '').trim()
  const referer = (headers.get('referer') || '').trim()

  if (!userAgent) {
    reasons.push('missing-user-agent')
  } else if (BLOCKED_USER_AGENT_PATTERNS.some(pattern => pattern.test(userAgent))) {
    reasons.push('automated-user-agent')
  }

  if (origin && !isAllowedSourceHost(origin)) reasons.push('untrusted-origin')
  if (referer && !isAllowedSourceHost(referer)) reasons.push('untrusted-referer')

  if (reasons.includes('automated-user-agent') || reasons.includes('untrusted-origin')) {
    return { action: 'block', reasons }
  }

  if (reasons.length > 0) return { action: 'flag', reasons }
  return { action: 'allow', reasons }
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()

  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return 'unknown'
}

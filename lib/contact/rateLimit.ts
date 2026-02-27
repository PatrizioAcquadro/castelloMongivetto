import { createHash } from 'node:crypto'
import type { ContactPayload } from './spam'

const RATE_LIMIT_MAX = 8
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_BURST_MAX = 3
const RATE_LIMIT_BURST_WINDOW_MS = 10 * 60 * 1000
const DUPLICATE_WINDOW_MS = 20 * 60 * 1000

const ipRateLimitStore = new Map<string, number[]>()
const recentSubmissionStore = new Map<string, number>()

export function checkRateLimit(ip: string): { limited: boolean; reason: string | null } {
  const key = ip || 'unknown'
  const now = Date.now()
  const hourlyCutoff = now - RATE_LIMIT_WINDOW_MS
  const burstCutoff = now - RATE_LIMIT_BURST_WINDOW_MS

  for (const [entryKey, timestamps] of ipRateLimitStore.entries()) {
    const recent = timestamps.filter(ts => ts > hourlyCutoff)
    if (recent.length === 0) {
      ipRateLimitStore.delete(entryKey)
    } else {
      ipRateLimitStore.set(entryKey, recent)
    }
  }

  const timestamps = ipRateLimitStore.get(key) || []
  const burstRequests = timestamps.filter(ts => ts > burstCutoff)

  if (burstRequests.length >= RATE_LIMIT_BURST_MAX) {
    return { limited: true, reason: 'burst' }
  }

  if (timestamps.length >= RATE_LIMIT_MAX) {
    return { limited: true, reason: 'hourly' }
  }

  timestamps.push(now)
  ipRateLimitStore.set(key, timestamps)
  return { limited: false, reason: null }
}

function createSubmissionFingerprint(ip: string, payload: ContactPayload): string {
  const normalizedMessage = payload.message.toLowerCase().replace(/\s+/g, ' ').trim()
  return createHash('sha256')
    .update(`${ip}|${payload.email}|${payload.subject}|${normalizedMessage}`)
    .digest('hex')
}

export function isDuplicateSubmission(ip: string, payload: ContactPayload): boolean {
  const now = Date.now()
  const cutoff = now - DUPLICATE_WINDOW_MS

  for (const [fingerprint, timestamp] of recentSubmissionStore.entries()) {
    if (timestamp < cutoff) {
      recentSubmissionStore.delete(fingerprint)
    }
  }

  const fingerprint = createSubmissionFingerprint(ip, payload)
  const previous = recentSubmissionStore.get(fingerprint)
  if (typeof previous === 'number' && now - previous < DUPLICATE_WINDOW_MS) {
    return true
  }

  recentSubmissionStore.set(fingerprint, now)
  return false
}

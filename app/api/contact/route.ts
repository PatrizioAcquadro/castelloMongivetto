import { NextResponse } from 'next/server'
import {
  normalizePayload,
  validatePayload,
  evaluateSpam,
  evaluateRequestRisk,
  getClientIp,
  SUBJECT_LABELS,
} from '@/lib/contact/spam'
import { checkRateLimit, isDuplicateSubmission } from '@/lib/contact/rateLimit'
import { isLikelyDeliverableEmail, sendWithResend } from '@/lib/contact/email'

export const runtime = 'nodejs'

function jsonResponse(data: Record<string, unknown>, status: number, extraHeaders?: Record<string, string>) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return jsonResponse({ ok: false, message: 'Payload non valido.' }, 400)
  }

  const payload = normalizePayload(body)
  const validationErrors = validatePayload(payload)
  if (Object.keys(validationErrors).length > 0) {
    return jsonResponse(
      { ok: false, message: 'Controlla i campi del modulo e riprova.', errors: validationErrors },
      422
    )
  }

  const clientIp = getClientIp(request.headers)
  const rateLimit = checkRateLimit(clientIp)
  if (rateLimit.limited) {
    return jsonResponse(
      {
        ok: false,
        message:
          rateLimit.reason === 'burst'
            ? 'Hai inviato troppe richieste in poco tempo. Attendi qualche minuto.'
            : 'Hai inviato troppe richieste. Attendi circa un\'ora e riprova.',
      },
      429
    )
  }

  if (isDuplicateSubmission(clientIp, payload)) {
    console.warn('Contact form duplicate submission ignored', { ip: clientIp, email: payload.email })
    return jsonResponse(
      { ok: true, message: 'Richiesta già ricevuta. Ti risponderemo appena possibile.' },
      200
    )
  }

  const requestRisk = evaluateRequestRisk(request.headers)
  if (requestRisk.action === 'block') {
    console.warn('Contact form blocked by request risk checks', {
      ip: clientIp,
      email: payload.email,
      reasons: requestRisk.reasons,
    })
    return jsonResponse(
      { ok: true, message: 'Richiesta ricevuta. Ti risponderemo appena possibile.' },
      200
    )
  }

  const domainValidation = await isLikelyDeliverableEmail(payload.emailDomain)
  if (!domainValidation.valid) {
    return jsonResponse(
      {
        ok: false,
        message: 'Inserisci un indirizzo email reale e raggiungibile.',
        errors: { email: 'Il dominio email non risulta valido.' },
      },
      422
    )
  }

  const spamCheck = evaluateSpam(payload)
  if (spamCheck.action === 'block') {
    console.warn('Contact form spam blocked', {
      ip: clientIp,
      email: payload.email,
      reasons: spamCheck.reasons,
    })
    return jsonResponse(
      { ok: true, message: 'Richiesta ricevuta. Ti risponderemo appena possibile.' },
      200
    )
  }

  const resendApiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.CONTACT_TO_EMAIL || 'info@castellomongivetto.com'
  const fromEmail = process.env.CONTACT_FROM_EMAIL

  if (!resendApiKey || !fromEmail) {
    console.error('Contact form not configured', {
      missingResendApiKey: !resendApiKey,
      missingFromEmail: !fromEmail,
    })
    return jsonResponse({ ok: false, message: 'Servizio email non configurato correttamente.' }, 500)
  }

  const subjectLabel = SUBJECT_LABELS[payload.subject] || 'Altro'
  const submittedAt = new Date().toISOString()
  const antiSpamReasons = [...requestRisk.reasons, ...spamCheck.reasons]
  const subjectPrefix =
    requestRisk.action === 'flag' || spamCheck.action === 'flag' ? '[Possibile spam] ' : ''

  const text = [
    'Nuova richiesta dal Modulo Contatti',
    '',
    `Data UTC: ${submittedAt}`,
    `Nome: ${payload.name}`,
    `Email: ${payload.email}`,
    `Telefono: ${payload.phone || 'Non indicato'}`,
    `Oggetto: ${subjectLabel}`,
    '',
    'Messaggio:',
    payload.message,
    '',
    `IP cliente: ${clientIp}`,
    antiSpamReasons.length
      ? `Segnali anti-spam: ${antiSpamReasons.join(', ')}`
      : 'Segnali anti-spam: nessuno',
  ].join('\n')

  const emailResponse = await sendWithResend({
    apiKey: resendApiKey,
    from: fromEmail,
    to: toEmail,
    replyTo: payload.email,
    subject: `${subjectPrefix}Modulo Contatti - ${subjectLabel} - ${payload.name}`,
    text,
  })

  if (!emailResponse.ok) {
    console.error('Resend request failed', emailResponse.error)
    return jsonResponse({ ok: false, message: 'Errore temporaneo nell\'invio. Riprova tra poco.' }, 502)
  }

  console.log('Contact email accepted by Resend', {
    resendEmailId: emailResponse.id || null,
    requestAction: requestRisk.action,
    spamAction: spamCheck.action,
    reasons: antiSpamReasons,
  })

  return jsonResponse(
    { ok: true, message: 'Messaggio inviato correttamente. Ti risponderemo al più presto.' },
    200
  )
}

'use client'

import { useState, useRef, useCallback, type FormEvent } from 'react'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

interface FieldErrors {
  [key: string]: boolean
}

interface AlertState {
  type: 'success' | 'error' | null
  message: string
  visible: boolean
  hiding: boolean
}

export default function ContactFormClient() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [privacy, setPrivacy] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alert, setAlert] = useState<AlertState>({ type: null, message: '', visible: false, hiding: false })

  const formStartedAt = useRef(Date.now())
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearAlert = useCallback(() => {
    if (alertTimerRef.current) {
      clearTimeout(alertTimerRef.current)
      alertTimerRef.current = null
    }
    setAlert({ type: null, message: '', visible: false, hiding: false })
  }, [])

  const showAlert = useCallback((type: 'success' | 'error', message: string) => {
    clearAlert()
    // Small delay to allow DOM update before adding visible class
    setTimeout(() => {
      setAlert({ type, message, visible: true, hiding: false })
    }, 10)

    alertTimerRef.current = setTimeout(() => {
      setAlert(prev => ({ ...prev, hiding: true, visible: false }))
      setTimeout(() => {
        setAlert({ type: null, message: '', visible: false, hiding: false })
      }, 260)
    }, 10000)
  }, [clearAlert])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    clearAlert()
    const errors: FieldErrors = {}

    if (!name.trim()) errors.name = true
    if (!email.trim()) {
      errors.email = true
    } else if (!isValidEmail(email.trim())) {
      errors.email = true
    }
    if (!subject.trim()) errors.subject = true
    if (message.trim().length < 10) errors.message = true
    if (!privacy) errors.privacy = true

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      showAlert('error', 'Controlla i campi evidenziati e riprova.')
      return
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
      privacy,
      website: '',
      formStartedAt: String(formStartedAt.current),
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json().catch(() => null)

      if (!response.ok || !result || result.ok !== true) {
        if (result?.errors && typeof result.errors === 'object') {
          const serverErrors: FieldErrors = {}
          Object.keys(result.errors).forEach(key => {
            serverErrors[key] = true
          })
          setFieldErrors(prev => ({ ...prev, ...serverErrors }))
        }

        let msg = 'Non è stato possibile inviare la richiesta. Riprova tra qualche minuto.'
        if (result?.message) {
          msg = result.message
        } else if (response.status === 404) {
          msg = 'Servizio modulo contatti non disponibile al momento (errore 404).'
        } else if (response.status === 401 || response.status === 403) {
          msg = 'Servizio momentaneamente non accessibile (autenticazione richiesta).'
        } else if (response.status >= 500) {
          msg = 'Errore temporaneo del server. Riprova tra qualche minuto.'
        }
        showAlert('error', msg)
        return
      }

      showAlert('success', 'Inviata, ti risponderemo al più presto!')
      setName('')
      setEmail('')
      setPhone('')
      setSubject('')
      setMessage('')
      setPrivacy(false)
      setFieldErrors({})
      formStartedAt.current = Date.now()
    } catch {
      showAlert('error', 'Errore di rete durante l\'invio. Verifica la connessione e riprova.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="form-shell" data-reveal data-reveal-delay="90">
      <header className="section-header">
        <span className="section-eyebrow">Modulo contatti</span>
        <h2 className="section-title">Invia la tua richiesta</h2>
        <p className="section-intro">La richiesta viene inviata direttamente al nostro indirizzo email.</p>
      </header>

      <form noValidate onSubmit={handleSubmit}>
        {/* Honeypot */}
        <div className="form-group form-group--hidden" aria-hidden="true">
          <label htmlFor="website">Sito web</label>
          <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Nome e cognome *</label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              maxLength={120}
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className={fieldErrors.name ? 'input-error' : ''}
              aria-invalid={fieldErrors.name ? 'true' : undefined}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              maxLength={160}
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={fieldErrors.email ? 'input-error' : ''}
              aria-invalid={fieldErrors.email ? 'true' : undefined}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Telefono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              autoComplete="tel"
              maxLength={40}
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="subject">Oggetto *</label>
            <select
              id="subject"
              name="subject"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className={fieldErrors.subject ? 'input-error' : ''}
              aria-invalid={fieldErrors.subject ? 'true' : undefined}
            >
              <option value="">Seleziona un&apos;opzione</option>
              <option value="visita">Prenotazione visita</option>
              <option value="evento">Evento privato</option>
              <option value="informazioni">Richiesta informazioni</option>
              <option value="altro">Altro</option>
            </select>
          </div>
        </div>

        <div className="form-group form-group--message">
          <label htmlFor="message">Messaggio *</label>
          <textarea
            id="message"
            name="message"
            minLength={10}
            maxLength={2500}
            required
            value={message}
            onChange={e => setMessage(e.target.value)}
            className={fieldErrors.message ? 'input-error' : ''}
            aria-invalid={fieldErrors.message ? 'true' : undefined}
          ></textarea>
        </div>

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="privacy"
            name="privacy"
            required
            checked={privacy}
            onChange={e => setPrivacy(e.target.checked)}
            className={fieldErrors.privacy ? 'input-error' : ''}
            aria-invalid={fieldErrors.privacy ? 'true' : undefined}
          />
          <label htmlFor="privacy">Acconsento al trattamento dei dati personali secondo normativa GDPR *</label>
        </div>

        <div className="form-submit">
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Invio in corso...' : 'Invia richiesta'}
          </button>
          <div className="form-status" aria-live="polite" aria-atomic="true">
            {alert.type && (
              <div className={`form-alert form-alert--${alert.type}${alert.visible ? ' is-visible' : ''}${alert.hiding ? ' is-hiding' : ''}`}>
                {alert.message}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

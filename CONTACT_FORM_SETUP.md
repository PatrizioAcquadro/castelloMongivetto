# Setup Modulo Contatti

Il backend del modulo contatti usa l'endpoint serverless `POST /api/contact` e invia email tramite [Resend](https://resend.com/).

## Variabili ambiente (Vercel)

Configura queste variabili nel progetto Vercel:

- `RESEND_API_KEY`: API key Resend.
- `CONTACT_FROM_EMAIL`: mittente verificato su Resend (es. `Castello Mongivetto <noreply@castellomongivetto.com>`).
- `CONTACT_TO_EMAIL`: destinatario reale dei messaggi (es. `info@castellomongivetto.com`).

Se `CONTACT_TO_EMAIL` non viene impostata, il fallback è `info@castellomongivetto.com`.

## Protezioni anti-spam incluse

- validazione server-side campi obbligatori;
- controllo dominio email (DNS MX/A/AAAA);
- blocco domini email temporanei/disposable;
- rate limit per IP (max 5 richieste/ora);
- honeypot nascosto (`website`) e controllo invio troppo veloce;
- filtro parole chiave spam nel messaggio.

## Test rapido

```bash
curl -X POST https://<tuo-dominio>/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mario Rossi",
    "email": "mario.rossi@gmail.com",
    "phone": "+39 333 1234567",
    "subject": "visita",
    "message": "Buongiorno, vorrei prenotare una visita guidata.",
    "privacy": true,
    "website": "",
    "formStartedAt": 1730000000000
  }'
```

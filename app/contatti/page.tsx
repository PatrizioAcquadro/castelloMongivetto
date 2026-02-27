import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import ContactFormClient from '@/components/contact/ContactFormClient'
import VisitHeightSync from '@/components/contact/VisitHeightSync'

export const metadata: Metadata = {
  title: 'Contatti | Castello Mongivetto',
  description: 'Contatta Castello Mongivetto per visite, eventi privati e informazioni operative su orari, accessibilità e biglietti.',
}

export default function ContattiPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__layout">
          <div className="page-hero__content" data-reveal>
            <span className="page-hero__kicker">Prenotazioni e richieste</span>
            <h1>Contatta il team di Castello Mongivetto</h1>
            <p className="page-hero__lead">Per visite guidate, eventi privati o collaborazioni culturali, invia i dettagli della tua richiesta e riceverai un riscontro dedicato.</p>
            <p className="hero-breadcrumb"><Link href="/">Home</Link> / <span>Contatti</span></p>
          </div>
          <div className="page-hero__media image-slot image-slot--hero" data-reveal data-reveal-delay="80">
            <Image src="/images/castello-panorama-esterno.jpg" alt="Ingresso del Castello Mongivetto" width={590} height={394} priority />
          </div>
        </div>
      </section>

      <section className="section section--light">
        <div className="container">
          <header className="section-header section-header--contact-main" data-reveal>
            <span className="section-eyebrow">Informazioni utili</span>
            <h2 className="section-title">Riferimenti e orari di apertura</h2>
            <p className="section-intro">Siamo disponibili dal martedì alla domenica per visite e richieste informative.</p>
          </header>

          <div className="contact-layout">
            <div className="contact-layout__left">
              <div className="info-grid">
                <article className="info-card" data-reveal data-reveal-delay="40">
                  <div className="info-card__icon"><i className="fas fa-clock" aria-hidden="true"></i></div>
                  <h3>Orari</h3>
                  <p>Martedì - Domenica<br />10:00 - 18:00<br />Lunedì chiuso</p>
                </article>
                <article className="info-card" data-reveal data-reveal-delay="100">
                  <div className="info-card__icon"><i className="fas fa-envelope" aria-hidden="true"></i></div>
                  <h3>Email</h3>
                  <p><a href="mailto:info@castellomongivetto.com">info@castellomongivetto.com</a></p>
                </article>
              </div>

              <article className="map-card" data-reveal data-reveal-delay="200">
                <div className="map-card__media">
                  <iframe
                    className="map-card__iframe"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.9203531153676!2d8.048070522812756!3d45.4590584965462!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478629002b03d8ad%3A0x799f418ab6f21a1d!2sCastello%20di%20Mongiovetto!5e1!3m2!1sit!2sus!4v1772206575625!5m2!1sit!2sus"
                    title="Mappa del Castello Mongivetto"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                <div className="map-card__actions">
                  <p className="map-card__address"><strong>SP 400 Km 12, Cerrione (BI)</strong></p>
                  <a className="btn btn-secondary" href="https://maps.app.goo.gl/4tL3hDeGSxvKx7bL8" target="_blank" rel="noopener noreferrer">Apri su Google Maps</a>
                </div>
              </article>
            </div>

            <ContactFormClient />
          </div>
        </div>
      </section>

      <section className="section">
        <VisitHeightSync>
          <div className="container visit-grid">
            <figure className="image-slot image-slot--visit" data-reveal>
              <Image src="/images/archivio-incisione-lapidea-1834.jpg" alt="Dettaglio storico con data 1834 al Castello Mongivetto" width={540} height={360} loading="lazy" />
            </figure>
            <article className="visit-card" data-reveal data-reveal-delay="80">
              <h3>Dettagli visita</h3>
              <ul className="visit-list">
                <li>
                  <i className="fas fa-ticket-alt" aria-hidden="true"></i>
                  <div>
                    <h4>Biglietti</h4>
                    <p>Adulti &euro;10 &middot; Ridotti &euro;7 &middot; Under 6 gratis.</p>
                  </div>
                </li>
                <li>
                  <i className="fas fa-users" aria-hidden="true"></i>
                  <div>
                    <h4>Visite guidate</h4>
                    <p>Partenze ogni ora 10:00-17:00 &middot; durata 60 minuti.</p>
                  </div>
                </li>
                <li>
                  <i className="fas fa-parking" aria-hidden="true"></i>
                  <div>
                    <h4>Parcheggio</h4>
                    <p>Parcheggio gratuito per auto e minivan vicino all&apos;ingresso.</p>
                  </div>
                </li>
                <li>
                  <i className="fas fa-wheelchair" aria-hidden="true"></i>
                  <div>
                    <h4>Accessibilità</h4>
                    <p>Piano terra accessibile; supporto su richiesta.</p>
                  </div>
                </li>
              </ul>
            </article>
          </div>
        </VisitHeightSync>
      </section>
    </>
  )
}

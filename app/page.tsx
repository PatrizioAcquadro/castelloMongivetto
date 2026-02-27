import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Castello Mongivetto | Dimora Storica in Piemonte',
  description: 'Castello Mongivetto a Cerrione: attestazioni dal 1150-1165, memoria del 1944 e valorizzazione contemporanea.',
}

export default function HomePage() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__layout">
          <div className="page-hero__content" data-reveal>
            <span className="page-hero__kicker">Cerrione, Piemonte</span>
            <h1>Un castello per esperienze uniche</h1>
            <p className="page-hero__lead">Castello Mongivetto accoglie visitatori e ospiti privati in un contesto che unisce storia documentata, memoria del 1944 e valorizzazione contemporanea.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/contatti">Prenota visita</Link>
              <Link className="btn btn-secondary" href="/storia">Scopri la storia</Link>
            </div>
          </div>
          <div className="page-hero__media image-slot image-slot--hero" data-reveal data-reveal-delay="80">
            <Image src="/images/castello-panorama-esterno.jpg" alt="Panoramica del Castello Mongivetto" width={590} height={394} priority />
          </div>
        </div>
      </section>

      <section id="home-highlights" className="section section--light">
        <div className="container">
          <header className="section-header" data-reveal>
            <span className="section-eyebrow">Esperienza privata</span>
            <h2 className="section-title">Visite curate con standard da hospitality di alta gamma</h2>
            <p className="section-intro">Ogni percorso è progettato per offrire un equilibrio preciso tra valore storico, comfort e servizio personalizzato.</p>
          </header>

          <div className="highlights-grid">
            <article className="feature-card" data-reveal data-reveal-delay="40">
              <div className="feature-card__icon"><i className="fas fa-landmark" aria-hidden="true"></i></div>
              <h3>Patrimonio architettonico</h3>
              <p>Sale storiche, torri e dettagli originali conservati con interventi di restauro rispettosi del carattere originario.</p>
            </article>
            <article className="feature-card" data-reveal data-reveal-delay="120">
              <div className="feature-card__icon"><i className="fas fa-user-tie" aria-hidden="true"></i></div>
              <h3>Accoglienza dedicata</h3>
              <p>Guide selezionate, gruppi contenuti e percorsi flessibili per offrire un&apos;esperienza elegante e senza fretta.</p>
            </article>
            <article className="feature-card" data-reveal data-reveal-delay="200">
              <div className="feature-card__icon"><i className="fas fa-glass-cheers" aria-hidden="true"></i></div>
              <h3>Eventi su invito</h3>
              <p>Il castello ospita matrimoni, ricevimenti e incontri culturali in ambienti di forte identità scenografica.</p>
            </article>
            <article className="feature-card" data-reveal data-reveal-delay="280">
              <div className="feature-card__icon"><i className="fas fa-tree" aria-hidden="true"></i></div>
              <h3>Giardini storici</h3>
              <p>Spazi esterni perfetti per visite rilassate, shooting editoriali e programmi stagionali in contesto monumentale.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split-layout history-teaser">
          <div data-reveal>
            <span className="section-eyebrow">Racconto storico</span>
            <h3>Dal 1150 a oggi, con fonti e date verificate</h3>
            <p>Le fonti citano Mongivetto/Mongiovetto come località dal 1150 e come castello nel 1165, nel sistema feudale degli Avogadro di Cerrione.</p>
            <p>Nel 1944 il complesso viene quasi distrutto (data esatta non univoca per Mongivetto; il 10 ottobre 1944 è attestato per Cerrione). Oggi prosegue un percorso di cura e valorizzazione culturale.</p>
            <Link className="btn btn-ghost" href="/storia">Approfondisci la cronologia</Link>
          </div>
          <figure className="image-slot image-slot--story" data-reveal data-reveal-delay="120">
            <Image src="/images/archivio-facciata-cortile.jpg" alt="Veduta storica del cortile del Castello Mongivetto" width={540} height={360} loading="lazy" />
          </figure>
        </div>
      </section>

      <section className="section section--light">
        <div className="container">
          <header className="section-header" data-reveal>
            <span className="section-eyebrow">Anteprima visiva</span>
            <h2 className="section-title">Una selezione fotografica del complesso</h2>
            <p className="section-intro">Composizioni e scorci scelti per anticipare atmosfera, proporzioni e carattere degli spazi.</p>
          </header>

          <div className="gallery-preview-grid">
            <figure data-reveal data-reveal-delay="40">
              <div className="image-slot image-slot--card">
                <Image src="/images/archivio-ruderi-didascalia.jpg" alt="Ruderi storici del Castello Mongivetto" width={380} height={253} loading="lazy" />
              </div>
              <figcaption>Archivio: ruderi e memoria materiale</figcaption>
            </figure>
            <figure data-reveal data-reveal-delay="110">
              <div className="image-slot image-slot--card">
                <Image src="/images/archivio-interno-rovina.jpg" alt="Interno storico del Castello Mongivetto" width={380} height={253} loading="lazy" />
              </div>
              <figcaption>Dettagli interni in fotografie d&apos;epoca</figcaption>
            </figure>
            <figure data-reveal data-reveal-delay="180">
              <div className="image-slot image-slot--card">
                <Image src="/images/archivio-coscritti-prato-1937.jpg" alt="Foto storica di gruppo nel parco di Mongivetto" width={380} height={253} loading="lazy" />
              </div>
              <figcaption>Persone e vita del castello nel Novecento</figcaption>
            </figure>
          </div>

          <div className="gallery-preview-cta" data-reveal data-reveal-delay="220">
            <Link className="btn btn-ghost" href="/galleria">Esplora la galleria completa</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className="cta-panel" data-reveal>
            <h2>Programma la tua visita a Castello Mongivetto</h2>
            <p className="cta-panel__subtitle--single-line">Condividi data, numero di ospiti e tipologia di esperienza. Riceverai una proposta dedicata in base alla disponibilità del periodo.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/contatti">Contatta la direzione</Link>
              <Link className="btn btn-ghost" href="/galleria">Vedi gli spazi</Link>
            </div>
          </article>
        </div>
      </section>
    </>
  )
}

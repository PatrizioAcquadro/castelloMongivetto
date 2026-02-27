import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Storia | Castello Mongivetto',
  description: 'Cronologia documentata del Castello Mongivetto: attestazioni dal 1150-1165, vicende del 1944 e valorizzazione contemporanea.',
}

export default function StoriaPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__layout">
          <div className="page-hero__content" data-reveal>
            <span className="page-hero__kicker">Storia e patrimonio</span>
            <h1>Cronologia del Castello Mongivetto</h1>
            <p className="page-hero__lead">Una lettura sintetica basata su fonti documentarie: dalle attestazioni medievali alle trasformazioni moderne, fino alla gestione contemporanea del complesso.</p>
            <p className="hero-breadcrumb"><Link href="/">Home</Link> / <span>Storia</span></p>
          </div>
          <div className="page-hero__media image-slot image-slot--hero" data-reveal data-reveal-delay="80">
            <Image src="/images/archivio-facciata-cortile.jpg" alt="Veduta storica del Castello Mongivetto" width={590} height={394} priority />
          </div>
        </div>
      </section>

      <section className="section section--light">
        <div className="container">
          <header className="section-header" data-reveal>
            <span className="section-eyebrow">Linea del tempo</span>
            <h2 className="section-title">Dalle attestazioni medievali alla gestione contemporanea</h2>
            <p className="section-intro">Cronologia sintetica basata sul dossier storico-critico: quando una data resta incerta, viene indicata esplicitamente.</p>
          </header>

          <ol className="timeline">
            <li className="timeline-item" data-reveal>
              <span className="timeline-item__date">1150-1165 &bull; Prime attestazioni</span>
              <h3>Località e castello nel sistema avogadriano</h3>
              <p>Le fonti citano Mongivetto/Mongiovetto come località dal 1150 e come castello nel 1165, con investitura feudale agli Avogadro di Cerrione.</p>
              <div className="image-slot image-slot--timeline">
                <Image src="/images/archivio-mappa-e-torre.jpg" alt="Mappa storica e torre di Mongivetto" width={480} height={320} loading="lazy" />
              </div>
            </li>
            <li className="timeline-item" data-reveal data-reveal-delay="60">
              <span className="timeline-item__date">1341-1456 &bull; Feudo e controllo viario</span>
              <h3>Snodo strategico tra Canavese e Biellese</h3>
              <p>Il sito controlla la direttrice di Piverone; nel 1404 passa sotto sovranità sabauda con reinfeudazione agli Avogadro e nel 1456 compaiono norme di decoro per i castelli di Cerrione e Mongivetto.</p>
              <div className="image-slot image-slot--timeline">
                <Image src="/images/archivio-ruderi-didascalia.jpg" alt="Ruderi storici del Castello Mongivetto" width={480} height={320} loading="lazy" />
              </div>
            </li>
            <li className="timeline-item" data-reveal data-reveal-delay="120">
              <span className="timeline-item__date">XVII-XVIII secolo &bull; Trasformazione</span>
              <h3>Da presidio militare a residenza agricola</h3>
              <p>Tra Sei e Settecento il complesso perde la funzione militare e si consolida come residenza con attività rurali; la data della definitiva unione al feudo di Cerrione resta discussa tra fine XVII e fine XVIII secolo.</p>
              <div className="image-slot image-slot--timeline">
                <Image src="/images/archivio-ingresso-storico.jpg" alt="Ingresso storico della tenuta Mongivetto" width={480} height={320} loading="lazy" />
              </div>
            </li>
            <li className="timeline-item" data-reveal data-reveal-delay="180">
              <span className="timeline-item__date">1944 &bull; Resistenza e bombardamento</span>
              <h3>Distruzione bellica del complesso</h3>
              <p>Durante la Resistenza Mongivetto è usato come punto di appoggio (Missione Bamon e brigata GL). Nel 1944 un bombardamento distrugge gran parte del castello: il giorno esatto per Mongivetto non è verificato in modo univoco; per Cerrione è indicato il 10 ottobre 1944.</p>
              <div className="image-slot image-slot--timeline">
                <Image src="/images/archivio-incisione-lapidea-1834.jpg" alt="Incisione lapidea con data 1834 a Mongivetto" width={480} height={320} loading="lazy" />
              </div>
            </li>
            <li className="timeline-item" data-reveal data-reveal-delay="240">
              <span className="timeline-item__date">Dal 2000 &bull; Proprietà Famiglia Acquadro-Porzio</span>
              <h3>Valorizzazione contemporanea</h3>
              <p>Dal 2000 il Castello Mongivetto è di proprietà della Famiglia Acquadro-Porzio, con un percorso di cura, visite guidate e attività culturali dedicate al territorio.</p>
              <div className="image-slot image-slot--timeline">
                <Image src="/images/archivio-coscritti-prato-1937.jpg" alt="Foto storica di gruppo nel parco di Mongivetto" width={480} height={320} loading="lazy" />
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <header className="section-header" data-reveal>
            <span className="section-eyebrow">Architettura</span>
            <h2 className="section-title">Elementi distintivi della dimora</h2>
            <p className="section-intro">Tre componenti che definiscono l&apos;esperienza di visita e l&apos;unicità spaziale del complesso.</p>
          </header>

          <div className="detail-grid">
            <article className="feature-card" data-reveal data-reveal-delay="40">
              <div className="feature-card__icon"><i className="fas fa-chess-rook" aria-hidden="true"></i></div>
              <h3>Torretta e chiesetta storica</h3>
              <p>Tra Torretta, cinta e chiesetta integra,<br />il complesso conserva la sua identità storica,<br />e racconta una rinascita viva e monumentale.</p>
            </article>
            <article className="feature-card" data-reveal data-reveal-delay="120">
              <div className="feature-card__icon"><i className="fas fa-archway" aria-hidden="true"></i></div>
              <h3>Complesso pre-1944</h3>
              <p>Le fonti comunali ricordano appartamenti civili e rustici, cortili, giardino e cappella prima della distruzione bellica da truppe naziste.</p>
            </article>
            <article className="feature-card" data-reveal data-reveal-delay="200">
              <div className="feature-card__icon"><i className="fas fa-tree" aria-hidden="true"></i></div>
              <h3>Rinascita del complesso</h3>
              <p>Oggi Mongivetto è preservato e ristrutturato,<br />con interventi che valorizzano la sua storia,<br />e torna a splendere con nuova vita culturale.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--light">
        <div className="container">
          <article className="cta-panel" data-reveal>
            <h2>Scopri la storia direttamente in loco</h2>
            <p>Prenota una visita guidata e ricevi un percorso introduttivo calibrato su interessi storici, artistici o eventistici.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/contatti">Prenota una visita</Link>
              <Link className="btn btn-ghost" href="/galleria">Guarda la galleria</Link>
            </div>
          </article>
        </div>
      </section>
    </>
  )
}

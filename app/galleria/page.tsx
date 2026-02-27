import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import GalleryClient from '@/components/gallery/GalleryClient'

export const metadata: Metadata = {
  title: 'Galleria | Castello Mongivetto',
  description: 'Galleria fotografica del Castello Mongivetto: esterni, interni, giardini ed eventi in un percorso visivo curato.',
}

export default function GalleriaPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__layout">
          <div className="page-hero__content" data-reveal>
            <span className="page-hero__kicker">Raccolta fotografica</span>
            <h1>Galleria del Castello Mongivetto</h1>
            <p className="page-hero__lead">Un percorso visivo tra architettura, dettagli interni, giardini e scenari dedicati agli eventi privati.</p>
            <p className="hero-breadcrumb"><Link href="/">Home</Link> / <span>Galleria</span></p>
          </div>
          <div className="page-hero__media image-slot image-slot--hero" data-reveal data-reveal-delay="80">
            <Image src="/images/archivio-coscritti-ruderi-1937.jpg" alt="Fotografia storica orizzontale del Castello Mongivetto" width={590} height={394} priority />
          </div>
        </div>
      </section>

      <GalleryClient />
    </>
  )
}

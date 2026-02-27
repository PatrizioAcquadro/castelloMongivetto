'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import ImmersiveTour, { mapSceneByImageSrc, type ImmersiveTourHandle } from './ImmersiveTour'
import Lightbox, { type LightboxItem } from './Lightbox'

interface GalleryItemData {
  category: string
  src: string
  alt: string
  title: string
  description: string
  text: string
  sceneId?: string | null
  revealDelay: number
}

const GALLERY_ITEMS: GalleryItemData[] = [
  { category: 'esterni', src: '/images/archivio-facciata-cortile.jpg', alt: 'Facciata storica del cortile di Castello Mongivetto', title: 'Facciata storica del cortile', description: 'Veduta d\'epoca della corte interna con porticati e finestre ad arco.', text: 'Archivio fotografico', revealDelay: 30 },
  { category: 'esterni', src: '/images/archivio-ruderi-didascalia.jpg', alt: 'Ruderi storici di Mongivetto', title: 'Ruderi di Mongivetto', description: 'Documento storico con i ruderi del complesso e nota editoriale.', text: 'Testimonianza d\'epoca', revealDelay: 60 },
  { category: 'esterni', src: '/images/archivio-ingresso-storico.jpg', alt: 'Ingresso storico della tenuta di Mongivetto', title: 'Ingresso storico della tenuta', description: 'Scatto d\'archivio dell\'accesso al complesso con muro perimetrale.', text: 'Memoria del complesso', revealDelay: 90 },
  { category: 'esterni', src: '/images/archivio-mappa-e-torre.jpg', alt: 'Mappa storica e torre di Mongivetto', title: 'Mappa e torre', description: 'Composizione d\'archivio con cartografia storica e dettaglio della torre.', text: 'Fonti iconografiche', revealDelay: 120 },
  { category: 'interni', src: '/images/archivio-interno-rovina.jpg', alt: 'Interno storico del Castello Mongivetto', title: 'Interno in rovina', description: 'Dettaglio degli ambienti interni prima dei recuperi più recenti.', text: 'Spazi interni storici', sceneId: 'memorie-interni', revealDelay: 150 },
  { category: 'interni', src: '/images/archivio-incisione-lapidea-1834.jpg', alt: 'Incisione lapidea con data 1834', title: 'Incisione lapidea 1834', description: 'Particolare su pietra con data incisa, testimonianza materiale del complesso.', text: 'Dettagli materici', sceneId: 'segni-lapide-1834', revealDelay: 180 },
  { category: 'giardini', src: '/images/archivio-coscritti-prato-1937.jpg', alt: 'Foto di gruppo storica nel parco di Mongivetto', title: 'Coscritti nel prato', description: 'Foto di gruppo del 1937 con la torre sullo sfondo.', text: 'Vita nel Novecento', sceneId: 'comunita-territorio-1937', revealDelay: 210 },
  { category: 'giardini', src: '/images/archivio-coscritti-ruderi-1937.jpg', alt: 'Giovani tra i ruderi del Castello Mongivetto', title: 'Coscritti tra i ruderi', description: 'Scatto d\'epoca con giovani in visita tra le strutture storiche.', text: 'Memoria sociale', revealDelay: 240 },
  { category: 'eventi', src: '/images/archivio-ritratto-giovani-uno.jpg', alt: 'Ritratto storico davanti al Castello Mongivetto', title: 'Ritratto storico I', description: 'Ritratto d\'epoca di due giovani davanti al castello.', text: 'Archivio fotografico', revealDelay: 270 },
  { category: 'eventi', src: '/images/archivio-ritratto-giovani-due.jpg', alt: 'Secondo ritratto storico nel complesso di Mongivetto', title: 'Ritratto storico II', description: 'Fotografia d\'archivio con uniforme e sfondo della dimora.', text: 'Persone e territorio', revealDelay: 300 },
  { category: 'esterni', src: '/images/castello-panorama-esterno.jpg', alt: 'Panoramica esterna del Castello Mongivetto', title: 'Panoramica del complesso', description: 'Veduta esterna contemporanea del castello e delle pertinenze.', text: 'Immagine contemporanea', sceneId: 'soglia-mongivetto', revealDelay: 330 },
  { category: 'esterni', src: '/images/castello-torre-storica.jpg', alt: 'Torre storica del Castello Mongivetto', title: 'Torre storica', description: 'Dettaglio verticale della torre e dei volumi murari del castello.', text: 'Profilo architettonico', sceneId: 'torre-presidio', revealDelay: 360 },
  { category: 'giardini', src: '/images/castello-cortile-ingresso.jpg', alt: 'Cortile d\'ingresso del Castello Mongivetto', title: 'Cortile d\'ingresso', description: 'Scorcio del cortile interno utilizzato per visite guidate e accoglienza.', text: 'Percorso di visita', sceneId: 'ritorno-cortile', revealDelay: 390 },
]

const FILTERS = [
  { value: 'all', label: 'Tutto' },
  { value: 'esterni', label: 'Esterni' },
  { value: 'interni', label: 'Interni' },
  { value: 'giardini', label: 'Giardini' },
  { value: 'eventi', label: 'Eventi' },
]

export default function GalleryClient() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const tourRef = useRef<ImmersiveTourHandle>(null)

  const visibleItems = activeFilter === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeFilter)

  const lightboxItems: LightboxItem[] = visibleItems.map(item => ({
    src: item.src,
    alt: item.alt,
    title: item.title,
    description: item.description,
    sceneId: item.sceneId || mapSceneByImageSrc(item.src),
  }))

  const currentSceneId = lightboxOpen && lightboxItems[lightboxIndex]
    ? lightboxItems[lightboxIndex].sceneId || null
    : null

  const openLightbox = useCallback((visibleIndex: number) => {
    setLightboxIndex(visibleIndex)
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
  }, [])

  const stepLightbox = useCallback((direction: number) => {
    setLightboxIndex(prev => {
      const len = lightboxItems.length
      return (prev + direction + len) % len
    })
  }, [lightboxItems.length])

  const handleTourTrigger = useCallback((sceneId: string | null) => {
    const expandBtn = document.querySelector('#immersive-tour .tour-expand') as HTMLElement | null
    tourRef.current?.openFromSceneId(sceneId, {
      expand: true,
      sourceElement: expandBtn,
    })
    setLightboxOpen(false)
  }, [])

  return (
    <section className="section section--light">
      <div className="container">
        <header className="section-header" data-reveal>
          <span className="section-eyebrow">Filtri</span>
          <h2 className="section-title">Esplora per tipologia di ambiente</h2>
          <p className="section-intro">Seleziona una categoria per visualizzare solo le immagini pertinenti. L&apos;apertura lightbox rispetta il filtro attivo.</p>
        </header>

        <div className="filter-group" role="group" aria-label="Filtri galleria" data-reveal data-reveal-delay="60">
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`filter-btn${activeFilter === f.value ? ' is-active' : ''}`}
              type="button"
              data-filter={f.value}
              aria-pressed={activeFilter === f.value ? 'true' : 'false'}
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="gallery-grid">
          {visibleItems.map((item, index) => (
            <button
              key={item.src}
              className="gallery-item image-slot image-slot--gallery"
              type="button"
              data-category={item.category}
              onClick={() => openLightbox(index)}
            >
              <Image src={item.src} alt={item.alt} fill sizes="(max-width: 430px) 100vw, (max-width: 920px) 50vw, 33vw" loading="lazy" />
              <span className="gallery-item__overlay">
                <span className="gallery-item__title">{item.title}</span>
                <span className="gallery-item__text">{item.text}</span>
              </span>
            </button>
          ))}
        </div>

        <p className="gallery-empty" hidden={visibleItems.length > 0}>Nessun risultato con il filtro selezionato.</p>

        <ImmersiveTour ref={tourRef} />

        <Lightbox
          isOpen={lightboxOpen}
          items={lightboxItems}
          currentIndex={lightboxIndex}
          currentSceneId={currentSceneId}
          onClose={closeLightbox}
          onStep={stepLightbox}
          onTourTrigger={handleTourTrigger}
          hasTourBridge={true}
        />
      </div>
    </section>
  )
}

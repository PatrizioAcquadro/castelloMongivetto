'use client'

import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import Link from 'next/link'

export interface TourScene {
  id: string
  order: number
  title: string
  subtitle: string
  description: string
  category: string
  imageSrc: string
  imageAlt: string
}

export const TOUR_SCENES: TourScene[] = [
  {
    id: 'soglia-mongivetto',
    order: 1,
    title: 'Soglia di Mongivetto',
    subtitle: 'Attestazioni 1150-1165',
    description: 'Le fonti storiche attestano Mongivetto/Mongiovetto come località dal 1150 e come castello dal 1165 nel sistema degli Avogadro di Cerrione.',
    category: 'esterni',
    imageSrc: '/images/castello-panorama-esterno.jpg',
    imageAlt: 'Veduta esterna del Castello Mongivetto al tramonto',
  },
  {
    id: 'torre-presidio',
    order: 2,
    title: 'La Torre e il presidio',
    subtitle: 'Viabilità storica e difesa',
    description: 'La torre e i resti di cinta richiamano la funzione di controllo sulla direttrice Piverone-Canavese/Biellese, con passaggio ai Savoia nel 1404 e reinfeudazione agli Avogadro.',
    category: 'esterni',
    imageSrc: '/images/castello-torre-storica.jpg',
    imageAlt: 'Dettaglio della torre storica del Castello Mongivetto',
  },
  {
    id: 'memorie-interni',
    order: 3,
    title: 'Memorie degli interni',
    subtitle: 'Trasformazioni tra Sei e Settecento',
    description: 'Tra XVII e XVIII secolo il complesso perde la funzione militare e assume un uso residenziale-agricolo; la data della definitiva unione al feudo di Cerrione resta discussa tra le fonti.',
    category: 'interni',
    imageSrc: '/images/archivio-interno-rovina.jpg',
    imageAlt: 'Ambiente interno storico del Castello Mongivetto',
  },
  {
    id: 'segni-lapide-1834',
    order: 4,
    title: 'Segni nella pietra (1834)',
    subtitle: 'Memoria materiale e guerra',
    description: 'Documenti e ricognizioni descrivono un complesso con cappella, cortili e ambienti rustici prima della distruzione del 1944; per Mongivetto il giorno esatto del bombardamento non è verificato in modo univoco.',
    category: 'interni',
    imageSrc: '/images/archivio-incisione-lapidea-1834.jpg',
    imageAlt: 'Incisione lapidea con data 1834 nel Castello Mongivetto',
  },
  {
    id: 'comunita-territorio-1937',
    order: 5,
    title: 'Comunità e territorio (1937)',
    subtitle: 'Comunità e Resistenza',
    description: 'Le fotografie d\'epoca e le fonti sulla Resistenza collocano Mongivetto nella memoria civile del territorio, tra vita comunitaria e uso come punto di appoggio nel 1944.',
    category: 'giardini',
    imageSrc: '/images/archivio-coscritti-prato-1937.jpg',
    imageAlt: 'Foto di gruppo del 1937 nei prati di Mongivetto',
  },
  {
    id: 'ritorno-cortile',
    order: 6,
    title: 'Ritorno al cortile',
    subtitle: 'Gestione contemporanea',
    description: 'Il cortile riassume la vocazione contemporanea del complesso: cura del sito, valorizzazione culturale e percorsi di visita.',
    category: 'giardini',
    imageSrc: '/images/castello-cortile-ingresso.jpg',
    imageAlt: 'Cortile d\'ingresso del Castello Mongivetto',
  },
]

const SCENE_INDEX_BY_ID = new Map(TOUR_SCENES.map((s, i) => [s.id, i]))

function normalizeAssetKey(value: string): string {
  if (!value) return ''
  const parts = value.split('/')
  return (parts.pop() || '').split('?')[0].trim().toLowerCase()
}

const SCENE_ID_BY_ASSET = new Map(
  TOUR_SCENES.map(s => [normalizeAssetKey(s.imageSrc), s.id])
)

export function mapSceneByImageSrc(imageSrc: string): string | null {
  const key = normalizeAssetKey(imageSrc)
  if (!key) return null
  return SCENE_ID_BY_ASSET.get(key) || null
}

export interface ImmersiveTourHandle {
  openFromSceneId: (sceneId: string | null, options?: { expand?: boolean; sourceElement?: HTMLElement | null }) => void
  mapSceneByImageSrc: (imageSrc: string) => string | null
}

const ImmersiveTour = forwardRef<ImmersiveTourHandle>(function ImmersiveTour(_, ref) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const rootRef = useRef<HTMLElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const expandBtnRef = useRef<HTMLButtonElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reduceMotion = useRef(false)
  useEffect(() => {
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const scene = TOUR_SCENES[currentSceneIndex]

  const renderScene = useCallback((index: number, animate = true) => {
    const normalizedIndex = ((index % TOUR_SCENES.length) + TOUR_SCENES.length) % TOUR_SCENES.length

    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)

    if (!animate || reduceMotion.current) {
      setIsTransitioning(false)
      setCurrentSceneIndex(normalizedIndex)
      return
    }

    setIsTransitioning(true)
    transitionTimerRef.current = setTimeout(() => {
      setCurrentSceneIndex(normalizedIndex)
      setIsTransitioning(false)
    }, 140)
  }, [])

  const stepScene = useCallback((direction: number) => {
    renderScene(currentSceneIndex + direction)
  }, [currentSceneIndex, renderScene])

  const setOverlayOpenState = useCallback((shouldOpen: boolean, options: { sourceElement?: HTMLElement | null; returnFocus?: boolean } = {}) => {
    const { sourceElement = null, returnFocus = true } = options

    setIsOverlayOpen(shouldOpen)
    document.body.classList.toggle('tour-open', shouldOpen)

    if (shouldOpen) {
      lastFocusedRef.current = sourceElement instanceof HTMLElement ? sourceElement : document.activeElement as HTMLElement
      setTimeout(() => closeBtnRef.current?.focus(), 0)
    } else if (returnFocus && lastFocusedRef.current) {
      lastFocusedRef.current.focus()
      lastFocusedRef.current = null
    }
  }, [])

  const openFromSceneId = useCallback((sceneId: string | null, options: { expand?: boolean; sourceElement?: HTMLElement | null } = {}) => {
    const { expand = false, sourceElement = null } = options
    let resolvedId = sceneId

    if (resolvedId && !SCENE_INDEX_BY_ID.has(resolvedId)) {
      resolvedId = mapSceneByImageSrc(resolvedId)
    }
    if (!resolvedId) resolvedId = TOUR_SCENES[0].id

    renderScene(SCENE_INDEX_BY_ID.get(resolvedId) || 0, false)

    if (expand) {
      setOverlayOpenState(true, { sourceElement })
    } else {
      rootRef.current?.scrollIntoView({
        behavior: reduceMotion.current ? 'auto' : 'smooth',
        block: 'start',
      })
    }
  }, [renderScene, setOverlayOpenState])

  useImperativeHandle(ref, () => ({
    openFromSceneId,
    mapSceneByImageSrc,
  }), [openFromSceneId])

  // Keyboard navigation
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (document.body.classList.contains('lightbox-open')) return

      if (e.key === 'Escape' && isOverlayOpen) {
        e.preventDefault()
        setOverlayOpenState(false)
        return
      }

      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return

      const activeElement = document.activeElement
      const isWithinTour = isOverlayOpen || (activeElement instanceof Element && rootRef.current?.contains(activeElement))
      if (!isWithinTour) return

      e.preventDefault()
      stepScene(e.key === 'ArrowRight' ? 1 : -1)
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [isOverlayOpen, stepScene, setOverlayOpenState])

  // Cleanup body class on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('tour-open')
    }
  }, [])

  const stepButtons = TOUR_SCENES.map((s, i) => {
    const labels = ['Soglia', 'Torre', 'Interni', 'Lapide 1834', 'Comunità', 'Cortile']
    return { sceneId: s.id, index: String(i + 1).padStart(2, '0'), label: labels[i] }
  })

  return (
    <>
      <article
        className={`immersive-tour${isOverlayOpen ? ' is-overlay-open' : ''}`}
        id="immersive-tour"
        ref={rootRef}
        data-reveal
        data-reveal-delay="90"
        aria-label="Tour immersivo del Castello Mongivetto"
      >
        <div className="immersive-tour__header">
          <div>
            <span className="virtual-tour__badge">Tour immersivo</span>
            <h2>Percorso curatoriale in sei tappe</h2>
            <p>Un itinerario narrativo tra attestazioni medievali, memoria della guerra e gestione contemporanea.</p>
          </div>
          <div className="immersive-tour__tools">
            <p className="tour-progress" aria-live="polite">Tappa {scene.order} / {TOUR_SCENES.length}</p>
            <button
              className="tour-expand btn btn-ghost"
              type="button"
              ref={expandBtnRef}
              aria-expanded={isOverlayOpen ? 'true' : 'false'}
              aria-controls="immersive-tour"
              onClick={() => setOverlayOpenState(true, { sourceElement: expandBtnRef.current })}
            >
              Espandi esperienza
            </button>
            <button
              className="tour-close"
              type="button"
              ref={closeBtnRef}
              hidden={!isOverlayOpen}
              aria-label="Chiudi modalità immersiva"
              onClick={() => setOverlayOpenState(false)}
            >
              <i className="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div className="immersive-tour__layout">
          <figure className={`tour-stage image-slot image-slot--visit u-m-0${isTransitioning ? ' is-transitioning' : ''}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="tour-stage__image" src={scene.imageSrc} alt={scene.imageAlt} loading="lazy" decoding="async" />
            <figcaption className="tour-stage__meta">
              <span className="tour-stage__subtitle">{scene.subtitle}</span>
              <strong className="tour-stage__title">{scene.title}</strong>
            </figcaption>
          </figure>

          <div className="tour-panel">
            <h3 className="tour-panel__title">{scene.title}</h3>
            <p className="tour-panel__subtitle">{scene.subtitle}</p>
            <p className="tour-panel__description">{scene.description}</p>

            <div className="tour-controls" role="group" aria-label="Navigazione tour">
              <button className="tour-nav tour-nav--prev" type="button" aria-label="Vai alla tappa precedente" onClick={() => stepScene(-1)}>
                <i className="fas fa-chevron-left" aria-hidden="true"></i>
                <span>Precedente</span>
              </button>
              <button className="tour-nav tour-nav--next" type="button" aria-label="Vai alla tappa successiva" onClick={() => stepScene(1)}>
                <span>Successiva</span>
                <i className="fas fa-chevron-right" aria-hidden="true"></i>
              </button>
            </div>

            <div className="tour-steps" role="tablist" aria-label="Seleziona tappa del tour">
              {stepButtons.map((btn) => {
                const isCurrent = btn.sceneId === scene.id
                return (
                  <button
                    key={btn.sceneId}
                    className={`tour-step${isCurrent ? ' is-active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={isCurrent ? 'true' : 'false'}
                    aria-current={isCurrent ? 'step' : undefined}
                    data-scene-id={btn.sceneId}
                    onClick={() => renderScene(SCENE_INDEX_BY_ID.get(btn.sceneId) || 0)}
                  >
                    <span className="tour-step__index">{btn.index}</span>
                    <span className="tour-step__label">{btn.label}</span>
                  </button>
                )
              })}
            </div>

            <Link className="btn btn-primary tour-cta" href="/contatti">Richiedi visita privata</Link>
          </div>
        </div>

        <p className="tour-soon">Il tour 360 arriverà presto.</p>
      </article>
      <div
        className={`tour-overlay${isOverlayOpen ? ' is-visible' : ''}`}
        ref={overlayRef}
        hidden={!isOverlayOpen}
        aria-hidden={!isOverlayOpen ? 'true' : 'false'}
        onClick={() => setOverlayOpenState(false)}
      ></div>
    </>
  )
})

export default ImmersiveTour

'use client'

import { useEffect, useRef, useCallback } from 'react'

export interface LightboxItem {
  src: string
  alt: string
  title: string
  description: string
  sceneId?: string | null
}

interface LightboxProps {
  isOpen: boolean
  items: LightboxItem[]
  currentIndex: number
  currentSceneId: string | null
  onClose: () => void
  onStep: (direction: number) => void
  onTourTrigger: (sceneId: string | null) => void
  hasTourBridge: boolean
}

export default function Lightbox({
  isOpen,
  items,
  currentIndex,
  currentSceneId,
  onClose,
  onStep,
  onTourTrigger,
  hasTourBridge,
}: LightboxProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const mediaWrapRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef({ x: 0, y: 0, tracking: false })

  const SWIPE_THRESHOLD = 48
  const HORIZONTAL_INTENT_RATIO = 1.25

  // Focus management and body class
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('lightbox-open')
      closeBtnRef.current?.focus()
    } else {
      document.body.classList.remove('lightbox-open')
    }
    return () => {
      document.body.classList.remove('lightbox-open')
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onStep(-1)
      if (e.key === 'ArrowRight') onStep(1)
    }
    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [isOpen, onClose, onStep])

  // Touch swipe
  useEffect(() => {
    const mediaWrap = mediaWrapRef.current
    if (!mediaWrap || !isOpen) return

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, tracking: true }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current.tracking || e.changedTouches.length !== 1) {
        touchStartRef.current.tracking = false
        return
      }
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      touchStartRef.current.tracking = false

      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return
      if (Math.abs(deltaX) < Math.abs(deltaY) * HORIZONTAL_INTENT_RATIO) return
      onStep(deltaX < 0 ? 1 : -1)
    }

    const handleTouchCancel = () => {
      touchStartRef.current.tracking = false
    }

    mediaWrap.addEventListener('touchstart', handleTouchStart, { passive: true })
    mediaWrap.addEventListener('touchend', handleTouchEnd, { passive: true })
    mediaWrap.addEventListener('touchcancel', handleTouchCancel, { passive: true })

    return () => {
      mediaWrap.removeEventListener('touchstart', handleTouchStart)
      mediaWrap.removeEventListener('touchend', handleTouchEnd)
      mediaWrap.removeEventListener('touchcancel', handleTouchCancel)
    }
  }, [isOpen, onStep])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const current = items[currentIndex]
  const hasMultiple = items.length > 1
  const showTourTrigger = hasTourBridge && Boolean(currentSceneId)

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Visualizzazione immagine"
      aria-hidden={!isOpen ? 'true' : 'false'}
      onClick={handleBackdropClick}
    >
      <div className="lightbox__dialog">
        <div className="lightbox__toolbar">
          <button className="lightbox__close" type="button" aria-label="Chiudi galleria" ref={closeBtnRef} onClick={onClose}>
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div className="lightbox__media-wrap" ref={mediaWrapRef}>
          {current && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className="lightbox__media"
              src={current.src}
              alt={current.alt}
            />
          )}
          <div className="lightbox__nav-wrap">
            <button className="lightbox__nav lightbox__nav--prev" type="button" aria-label="Immagine precedente" hidden={!hasMultiple} onClick={() => onStep(-1)}>
              <i className="fas fa-chevron-left" aria-hidden="true"></i>
            </button>
            <button className="lightbox__nav lightbox__nav--next" type="button" aria-label="Immagine successiva" hidden={!hasMultiple} onClick={() => onStep(1)}>
              <i className="fas fa-chevron-right" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className="lightbox__caption">
          <h3 className="lightbox__title">{current?.title || ''}</h3>
          <p className="lightbox__description">{current?.description || ''}</p>
          <button
            className="lightbox__tour-trigger btn btn-secondary"
            type="button"
            hidden={!showTourTrigger}
            aria-hidden={!showTourTrigger ? 'true' : undefined}
            onClick={() => onTourTrigger(currentSceneId)}
          >
            Continua nel tour
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'

export default function VisitHeightSync({ children }: { children: React.ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const imageCard = grid.querySelector('.image-slot--visit') as HTMLElement | null
    const detailsCard = grid.querySelector('.visit-card') as HTMLElement | null
    if (!imageCard || !detailsCard) return

    const desktopQuery = window.matchMedia('(min-width: 921px)')
    let rafId = 0

    const apply = () => {
      imageCard.style.height = ''
      if (!desktopQuery.matches) return

      const targetHeight = Math.round(detailsCard.getBoundingClientRect().height)
      if (targetHeight > 0) {
        imageCard.style.height = `${targetHeight}px`
      }
    }

    const schedule = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        rafId = 0
        apply()
      })
    }

    schedule()
    window.addEventListener('resize', schedule)
    window.addEventListener('load', schedule)
    desktopQuery.addEventListener('change', schedule)

    const mediaImage = imageCard.querySelector('img')
    if (mediaImage instanceof HTMLImageElement && !mediaImage.complete) {
      mediaImage.addEventListener('load', schedule, { once: true })
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('load', schedule)
      desktopQuery.removeEventListener('change', schedule)
    }
  }, [])

  return <div ref={gridRef}>{children}</div>
}

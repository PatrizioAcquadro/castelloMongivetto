'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function RevealAnimations() {
  const pathname = usePathname()

  useEffect(() => {
    const revealItems = document.querySelectorAll('[data-reveal]:not(.is-visible)')
    if (!revealItems.length) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach(item => item.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          const target = entry.target as HTMLElement
          const delay = Number(target.getAttribute('data-reveal-delay') || '0')
          if (delay > 0) {
            target.style.transitionDelay = `${delay}ms`
          }
          target.classList.add('is-visible')
          observer.unobserve(target)
        })
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -6% 0px',
      }
    )

    revealItems.forEach(item => observer.observe(item))

    return () => observer.disconnect()
  }, [pathname])

  return null
}

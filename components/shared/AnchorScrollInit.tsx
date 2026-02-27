'use client'

import { useEffect } from 'react'

export default function AnchorScrollInit() {
  useEffect(() => {
    const getHeaderOffset = () => {
      const header = document.querySelector('.site-header')
      return header ? (header as HTMLElement).offsetHeight + 8 : 0
    }

    const handleClick = (event: Event) => {
      const anchor = (event.currentTarget as HTMLAnchorElement)
      const hash = anchor.getAttribute('href')
      if (!hash || hash.length < 2) return

      const target = document.querySelector(hash)
      if (!target) return

      event.preventDefault()
      const headerOffset = getHeaderOffset()
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset
      window.scrollTo({ top, behavior: 'smooth' })
    }

    const anchors = document.querySelectorAll('a[href^="#"]')
    anchors.forEach(anchor => anchor.addEventListener('click', handleClick))

    return () => {
      anchors.forEach(anchor => anchor.removeEventListener('click', handleClick))
    }
  }, [])

  return null
}

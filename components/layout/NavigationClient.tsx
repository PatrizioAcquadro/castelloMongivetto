'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavLink {
  href: string
  label: string
}

export default function NavigationClient({ links }: { links: NavLink[] }) {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  const isMobileViewport = useCallback(() => window.innerWidth <= 920, [])

  useEffect(() => {
    const nav = navRef.current
    const toggle = toggleRef.current
    const backdrop = backdropRef.current
    const menu = nav?.querySelector('#primary-navigation') as HTMLElement | null

    if (!nav || !toggle || !menu) return

    const menuLinks = Array.from(menu.querySelectorAll('a'))
    let lastViewportIsMobile = isMobileViewport()

    const setBackdrop = (isVisible: boolean) => {
      if (!backdrop) return
      backdrop.hidden = !isVisible
      backdrop.setAttribute('aria-hidden', String(!isVisible))
      backdrop.classList.toggle('is-visible', isVisible)
    }

    const setOpen = (isOpen: boolean, options: { returnFocus?: boolean; focusFirstLink?: boolean } = {}) => {
      const { returnFocus = false, focusFirstLink = false } = options
      const canOpenDrawer = isMobileViewport()
      const nextOpen = canOpenDrawer ? isOpen : false

      nav.classList.toggle('is-open', nextOpen)
      toggle.setAttribute('aria-expanded', String(nextOpen))
      toggle.setAttribute('aria-label', nextOpen ? 'Chiudi menu' : 'Apri menu')
      menu.setAttribute('aria-hidden', canOpenDrawer ? String(!nextOpen) : 'false')
      document.body.classList.toggle('nav-open', nextOpen)
      setBackdrop(canOpenDrawer && nextOpen)

      if (nextOpen && focusFirstLink && menuLinks.length > 0) {
        requestAnimationFrame(() => menuLinks[0].focus())
      }
      if (!nextOpen && returnFocus) {
        toggle.focus()
      }
    }

    setOpen(false)

    const handleToggleClick = () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true'
      const willOpen = !isOpen
      const shouldAutoFocus = !window.matchMedia('(pointer: coarse)').matches
      setOpen(willOpen, {
        focusFirstLink: willOpen && shouldAutoFocus,
        returnFocus: !willOpen,
      })
    }

    const handleMenuLinkClick = () => setOpen(false)
    const handleBackdropClick = () => setOpen(false, { returnFocus: true })

    const handleDocumentClick = (event: MouseEvent) => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true'
      if (!isOpen) return
      const target = event.target
      if (!(target instanceof Element)) return
      if (!nav.contains(target) && !toggle.contains(target) && !target.closest('.nav-backdrop')) {
        setOpen(false)
      }
    }

    const handleKeydown = (event: KeyboardEvent) => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true'
      if (event.key === 'Escape' && isOpen) {
        setOpen(false, { returnFocus: true })
      }
    }

    const handleResize = () => {
      const isMobile = isMobileViewport()
      if (isMobile !== lastViewportIsMobile) {
        setOpen(false)
      }
      lastViewportIsMobile = isMobile
    }

    toggle.addEventListener('click', handleToggleClick)
    menuLinks.forEach(link => link.addEventListener('click', handleMenuLinkClick))
    backdrop?.addEventListener('click', handleBackdropClick)
    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleKeydown)
    window.addEventListener('resize', handleResize)

    return () => {
      toggle.removeEventListener('click', handleToggleClick)
      menuLinks.forEach(link => link.removeEventListener('click', handleMenuLinkClick))
      backdrop?.removeEventListener('click', handleBackdropClick)
      document.removeEventListener('click', handleDocumentClick)
      document.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('resize', handleResize)
    }
  }, [isMobileViewport])

  return (
    <>
      <button
        className="nav-toggle"
        ref={toggleRef}
        type="button"
        aria-label="Apri menu"
        aria-expanded="false"
        aria-controls="primary-navigation"
      >
        <span className="nav-toggle__line"></span>
        <span className="nav-toggle__line"></span>
        <span className="nav-toggle__line"></span>
      </button>

      <nav className="site-nav" ref={navRef} aria-label="Navigazione principale">
        <ul className="nav-links" id="primary-navigation" aria-hidden="false">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} aria-current={pathname === href ? 'page' : undefined}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="nav-backdrop" ref={backdropRef} hidden aria-hidden="true"></div>
    </>
  )
}

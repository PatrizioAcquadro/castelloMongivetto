import Link from 'next/link'
import Image from 'next/image'
import NavigationClient from './NavigationClient'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/storia', label: 'Storia' },
  { href: '/galleria', label: 'Galleria' },
  { href: '/contatti', label: 'Contatti' },
]

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-shell">
        <Link className="brand" href="/" aria-label="Castello Mongivetto - Home">
          <Image src="/images/logo.png" alt="Logo Castello Mongivetto" width={46} height={46} priority />
          <span className="brand__text">
            <span className="brand__name">Castello Mongivetto</span>
            <span className="brand__tagline">Dimora Storica</span>
          </span>
        </Link>

        <NavigationClient links={navLinks} />
      </div>
    </header>
  )
}

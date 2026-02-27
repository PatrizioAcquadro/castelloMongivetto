import type { Metadata } from 'next'
import { Cormorant_Garamond, Source_Sans_3 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import RevealAnimations from '@/components/shared/RevealAnimations'
import AnchorScrollInit from '@/components/shared/AnchorScrollInit'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
})

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-source-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://castellomongivetto.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className={`js-ready ${cormorant.variable} ${sourceSans.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body id="top" suppressHydrationWarning>
        <a className="skip-link" href="#main-content">Salta al contenuto principale</a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <RevealAnimations />
        <AnchorScrollInit />
        <Analytics />
      </body>
    </html>
  )
}

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/history.html', destination: '/storia', permanent: true },
      { source: '/gallery.html', destination: '/galleria', permanent: true },
      { source: '/contact.html', destination: '/contatti', permanent: true },
    ]
  },
}

export default nextConfig

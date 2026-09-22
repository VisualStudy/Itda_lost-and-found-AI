import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ['*.sandbox.gensparksite.com', '*.sandbox.novita.ai'],
}

export default nextConfig

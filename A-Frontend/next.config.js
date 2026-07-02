const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produce a self-contained server build for Docker (`node server.js`).
  output: 'standalone',
  experimental: {
    // In a workspace monorepo, trace from the repo root so the standalone bundle
    // includes hoisted node_modules + the @ecom/shared package.
    outputFileTracingRoot: path.join(__dirname, '..'),
    // Tree-shake icon/util libraries so only used symbols are bundled.
    optimizePackageImports: ['lucide-react']
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oytwqtgwdlrpufcllkfp.supabase.co',
        pathname: '/storage/v1/object/public/**'
      }
    ]
  }
}

module.exports = nextConfig

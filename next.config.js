/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Keep the Prisma query engine out of the webpack bundle (loaded at runtime).
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
    // Tree-shake icon/util libraries so only the symbols actually used are bundled.
    // Cuts client JS dramatically → faster hydration and snappier navigation.
    optimizePackageImports: ['lucide-react']
  },
  images: {
    // Serve modern, much-smaller formats. next/image converts the large source
    // PNGs/JPGs to AVIF/WebP on demand and caches the result.
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images for 30 days so they aren't re-processed each request.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Allow next/image to optimize media served from the Supabase Storage bucket.
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

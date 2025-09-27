/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip linting and type checking during build for production deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      }
    ],
  },
  // Optimize RSC and reduce hydration issues
  experimental: {
    optimizePackageImports: ['lucide-react', '@tanstack/react-query'],
    // Improve chunk loading
    optimizeCss: true,
    scrollRestoration: true,
  },
  // Use SWC compiler
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },
  // Better caching strategy
  headers: async () => {
    return [
      {
        source: '/dashboard/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
}

export default nextConfig;

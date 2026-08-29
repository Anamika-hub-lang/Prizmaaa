import type { NextConfig } from 'next'
import path from 'node:path'

const rootDir = process.cwd()

const nextConfig: NextConfig = {
  // Vercel project still has Output Directory = "dist" (old Vite setting).
  // Point Next at dist so the platform finds the App Router build output.
  distDir: 'dist',
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      'react-router-dom': './src/shims/react-router-dom.tsx',
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-router-dom': path.join(rootDir, 'src/shims/react-router-dom.tsx'),
    }
    return config
  },
  async redirects() {
    return [
      { source: '/login', destination: '/sign-in', permanent: true },
      { source: '/signup', destination: '/sign-up', permanent: true },
      { source: '/courses', destination: '/classes', permanent: true },
      { source: '/live', destination: '/classes', permanent: true },
      { source: '/mentors', destination: '/about', permanent: true },
      { source: '/contact', destination: '/about', permanent: true },
      { source: '/library', destination: '/', permanent: true },
      { source: '/blog', destination: '/', permanent: true },
      { source: '/colleges/compare', destination: '/colleges', permanent: true },
    ]
  },
}

export default nextConfig

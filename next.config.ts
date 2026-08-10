import type { NextConfig } from 'next'
import path from 'node:path'

const rootDir = process.cwd()

const nextConfig: NextConfig = {
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
      { source: '/login', destination: '/sign-in', permanent: false },
      { source: '/signup', destination: '/sign-up', permanent: false },
      { source: '/courses', destination: '/classes', permanent: false },
      { source: '/live', destination: '/classes', permanent: false },
      { source: '/mentors', destination: '/about', permanent: false },
      { source: '/contact', destination: '/about', permanent: false },
      { source: '/library', destination: '/sign-in', permanent: false },
      { source: '/blog', destination: '/sign-in', permanent: false },
    ]
  },
}

export default nextConfig

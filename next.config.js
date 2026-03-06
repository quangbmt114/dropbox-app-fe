/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker
  output: 'standalone',
  // Skip type checking during build (use CI job instead)
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig


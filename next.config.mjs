/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    // Enable standalone output for Docker optimization
    output: 'standalone',
    // Configure allowed image domains if needed
    images: {
      domains: [],
    },
  }
export default nextConfig;

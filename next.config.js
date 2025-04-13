/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Configure for handling large payloads
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', 'mongoose']
  }
};

module.exports = nextConfig; 
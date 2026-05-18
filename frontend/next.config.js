/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hearty-connection-production.up.railway.app",
        port: "",
        pathname: "/uploads/**",
      },
    ],
  },
}

module.exports = nextConfig

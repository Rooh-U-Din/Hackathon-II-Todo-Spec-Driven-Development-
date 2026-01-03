/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://todo-backend-production-bbb3.up.railway.app'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

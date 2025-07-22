
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // experimental: {
  //   // This allows the Next.js dev server to accept requests from the
  //   // Firebase Studio environment.
  //   allowedDevOrigins: [
  //     "https://*.cluster-ancjwrkgr5dvux4qug5rbzyc2y.cloudworkstations.dev",
  //   ],
  // },
};

module.exports = nextConfig;

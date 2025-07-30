
/** @type {import('next').NextConfig} */
const nextConfig = {
  // API rewrites configuration
  async rewrites() {
    return [
      // Exclude order tracking API from backend rewrites
      // Order tracking will use frontend API routes
      {
        source: '/api/dashboard/:path*',
        destination: 'http://localhost:8080/api/dashboard/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:8080/api/admin/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:8080/api/auth/:path*',
      },
      // Add other specific API routes that should go to backend
      // /api/orders will use frontend API routes (not rewritten)
      {
        source: '/admin/login',
        destination: 'http://localhost:8080/admin/login',
      },
      {
        source: '/admin/logout',
        destination: 'http://localhost:8080/admin/logout',
      },
    ];
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Better source maps for debugging
    productionBrowserSourceMaps: false,
    // Fix HMR connection issues
    devIndicators: {
      position: 'bottom-right',
    },
  }),
  
  // Turbopack configuration (stable)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Experimental features
  experimental: {
    // Improve HMR performance
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

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
  
  // Environment-specific configurations
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Custom webpack configuration untuk production standards
  webpack: (config, { dev, isServer }) => {
    // Optimasi untuk development
    if (dev && !isServer) {
      // Improve HMR performance dan stability
      config.watchOptions = {
        poll: false, // Disable polling untuk performance yang lebih baik
        aggregateTimeout: 200, // Reduce timeout untuk faster updates
        ignored: ['**/node_modules/**', '**/.git/**', '**/logs/**'],
      };
      
      // Fix HMR connection issues
      config.devServer = {
        ...config.devServer,
        hot: true,
        liveReload: true,
        client: {
          overlay: {
            errors: true,
            warnings: false,
          },
          reconnect: 3,
        },
      };
      
      // Optimize chunk splitting for faster HMR
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;

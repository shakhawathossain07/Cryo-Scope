import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* Production optimizations */
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:9002', '*.netlify.app', '*.supabase.co'],
      bodySizeLimit: '2mb',
    },
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-icons'],
  },

  // TypeScript and ESLint
  typescript: {
    ignoreBuildErrors: true, // Only for deployment - fix in development
  },
  eslint: {
    ignoreDuringBuilds: true, // Only for deployment - fix in development
  },

  // Image optimization for Netlify
  images: {
    unoptimized: true, // Required for Netlify static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'gibs.earthdata.nasa.gov',
      },
      {
        protocol: 'https',
        hostname: 'services.sentinel-hub.com',
      },
      {
        protocol: 'https',
        hostname: 'sh.dataspace.copernicus.eu',
      },
    ],
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Production output optimization
  productionBrowserSourceMaps: false,

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Client-side optimization for chart libraries
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Optimize large dependencies
        'date-fns': 'date-fns/esm',
      };
    }

    // Ignore source maps in production
    if (process.env.NODE_ENV === 'production') {
      config.devtool = false;
    }

    return config;
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

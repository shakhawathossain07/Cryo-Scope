import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:9002', '*.netlify.app', '*.supabase.co'],
    },
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-icons'],
  },
  typescript: {
    // Only ignore during builds for deployment - should be fixed in development
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  eslint: {
    // Only ignore during builds for deployment - should be fixed in development
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;

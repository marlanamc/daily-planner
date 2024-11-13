const { Inter } = require('next/font/google');

const metadata = {
  title: 'Daily Planner',
  description: 'A simple daily planner application',
};

const inter = Inter({ subsets: ['latin'] });

module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  experimental: {
    appDir: true,
  },
  metadata,
  inter,
};
const { fontFamily } = require('tailwindcss/defaultTheme');
const { Inter } = require('@next/font/google');

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

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
  fonts: {
    inter: inter,
  },
};
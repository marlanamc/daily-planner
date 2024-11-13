const { fontFamily } = require('tailwindcss/defaultTheme');

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
  fontLoader: {
    preconnect: ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
    formats: ['woff2'],
    custom: {
      'inter-var': [
        {
          weight: '100 900',
          style: ['normal', 'italic'],
          fontDisplay: 'swap',
          src: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
        },
      ],
    },
  },
  plugins: [
    require('@next/font/google', {
      // Provide the font files to Next.js
      markers: true,
      variable: '--font-inter',
    }),
  ],
};
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
  fonts: {
    google: {
      preload: true,
      families: [
        {
          name: 'Inter',
          style: ['normal', 'italic'],
          weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
        },
      ],
    },
  },
};

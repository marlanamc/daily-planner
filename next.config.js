const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, 
  },
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
};

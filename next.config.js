/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.experiments.asyncWebAssembly = true;
    return config;
  },
};

module.exports = nextConfig;

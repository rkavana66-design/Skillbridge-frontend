/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // pdf.js has an optional, Node-only dependency on "canvas" that it never
    // actually uses in the browser. Next.js's build tries to bundle it anyway
    // and fails — this tells webpack to skip it entirely.
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;

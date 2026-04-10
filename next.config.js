/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'puppeteer',
      'puppeteer-core',
      'sharp',
      '@sparticuz/chromium',
    ],
  },
};

module.exports = nextConfig;

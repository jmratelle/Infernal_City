// next.config.ts
import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const runtimeCaching: any[] = [
  {
    urlPattern: ({ request }: { request: Request }) =>
      request.destination === 'document' || request.mode === 'navigate',
    handler: 'NetworkFirst',
    options: { cacheName: 'html-cache' },
  },
  {
    urlPattern: /^https?.*\.(?:js|css)$/,
    handler: 'StaleWhileRevalidate',
    options: { cacheName: 'static-resources' },
  },
  {
    urlPattern: /^https?.*\.(?:png|jpg|jpeg|svg|webp|woff2?)$/,
    handler: 'StaleWhileRevalidate',
    options: { cacheName: 'assets' },
  },
];

const nextConfig: NextConfig = { reactStrictMode: true };

export default withPWA({
  dest: 'public',                 // puts sw.js at the site root
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',  // ENABLED on Vercel
  runtimeCaching,
})(nextConfig);

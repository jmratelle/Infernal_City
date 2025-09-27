// next.config.ts
import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const runtimeCaching: any[] = [
  // Cache HTML documents so "/" loads offline
  {
  urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
  handler: 'NetworkFirst',
  options: { cacheName: 'html-cache' },
},
  // JS & CSS
  { urlPattern: /^https?.*\.(?:js|css)$/, handler: 'StaleWhileRevalidate', options: { cacheName: 'static-resources' } },
  // Images & fonts
  { urlPattern: /^https?.*\.(?:png|jpg|jpeg|svg|webp|woff2?)$/, handler: 'StaleWhileRevalidate', options: { cacheName: 'assets' } },
];

const nextConfig: NextConfig = { reactStrictMode: true };

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // SW only in prod
  runtimeCaching,
})(nextConfig);

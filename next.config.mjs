// next.config.mjs
import withPWA from 'next-pwa';

const runtimeCaching = [
  {
    urlPattern: ({ request }) =>
      request.destination === 'document' || request.mode === 'navigate',
    handler: 'NetworkFirst',
    options: { cacheName: 'html-cache' },
  },
  { urlPattern: /^https?.*\.(?:js|css)$/, handler: 'StaleWhileRevalidate', options: { cacheName: 'static-resources' } },
  { urlPattern: /^https?.*\.(?:png|jpg|jpeg|svg|webp|woff2?)$/, handler: 'StaleWhileRevalidate', options: { cacheName: 'assets' } },
];

const nextConfig = { reactStrictMode: true };

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching,
})(nextConfig);

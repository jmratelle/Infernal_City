'use client';

import { useEffect } from 'react';

export default function SWRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Only register on production (optional)
      const isLocalhost = typeof window !== 'undefined' && location.hostname === 'localhost';
      if (process.env.NODE_ENV === 'production' || !isLocalhost) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
    }
  }, []);
  return null;
}

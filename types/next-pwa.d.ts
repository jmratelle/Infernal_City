// types/next-pwa.d.ts
declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  type WithPWAOptions = {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    runtimeCaching?: any[]; // keep loose for convenience
    buildExcludes?: (RegExp | string)[];
    fallbacks?: {
      document?: string;
      image?: string;
      audio?: string;
      video?: string;
      font?: string;
    };
  };

  export default function withPWA(options?: WithPWAOptions): (config: NextConfig) => NextConfig;
}

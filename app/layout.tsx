import "./globals.css";
import type { ReactNode } from 'react';
import SWRegistrar from './sw-registrar';

export const metadata = {
  title: 'Infernal City Character Sheet',
  description: 'Offline-ready PWA',
  themeColor: '#111111',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SWRegistrar />
        <div className="app-bg" aria-hidden />
        <div className="app-root">
          {children}
        </div>
      </body>
    </html>
  );
}

import "./globals.css";
import SWRegistrar from './sw-registrar';
import type { ReactNode } from 'react';


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
        <div
          className="min-h-screen bg-cover bg-center"
          style={{ backgroundImage: "url(/background.jpg)" }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}

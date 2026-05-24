import "./globals.css";
import type { ReactNode } from 'react';
import ClientRuntimeDiagnostics from '@/components/ClientRuntimeDiagnostics';
import SWRegistrar from './sw-registrar';

export const metadata = {
  title: 'Infernal City Character Sheet',
  description: 'Infernal City character manager',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#111111',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function (event) {
                document.documentElement.dataset.clientError = event.message || 'error';
              });
              window.addEventListener('unhandledrejection', function (event) {
                document.documentElement.dataset.clientError = String(event.reason || 'rejection');
              });
            `,
          }}
        />
        <SWRegistrar />
        <ClientRuntimeDiagnostics />
        <div className="app-bg" aria-hidden />
        <div className="app-root">
          <div className="client-runtime-warning">
            The app loaded, but Safari has not started the interactive code yet. Refresh once, or clear this site&apos;s website data if this message stays visible.
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SWRegistrar from './sw-registrar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Infernal City Character Sheet',
  description: 'Offline-ready PWA',
  themeColor: '#111111',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SWRegistrar />
        {children}
      </body>
    </html>
  );
}
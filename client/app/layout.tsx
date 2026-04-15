import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from '../context/authContext';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Timesheet Portal",
  description: "Gestione presenze aziendale",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="it">
      {/* Aggiungiamo 'bg-white' per garantire una base neutra.
        'antialiased' serve a rendere i font più nitidi e professionali.
      */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
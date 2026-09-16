import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "SkillForge — Prove what you can build",
  description: "AI-powered developer assessments and evidence-backed portfolios.",
};

import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(15,17,26,.85)',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,.09)',
              backdropFilter: 'blur(18px)',
              boxShadow: '0 20px 60px rgba(0,0,0,.4), 0 0 0 1px rgba(0,229,255,.06)',
              borderRadius: '14px',
              fontWeight: 600,
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#b8ff2c', secondary: '#05060a' } },
            error: { iconTheme: { primary: '#ff2bd6', secondary: '#05060a' } },
          }}
        />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}

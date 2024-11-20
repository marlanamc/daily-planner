import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Daily Planner',
  description: 'Your personal daily planner',
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Daily Planner',
    startupImage: [
      '/apple-splash-2048-2732.jpg',
      '/apple-splash-1668-2224.jpg',
      '/apple-splash-1536-2048.jpg',
      '/apple-splash-1125-2436.jpg',
      '/apple-splash-1242-2208.jpg',
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Daily Planner" />
        <meta name="viewport" content="initial-scale=1, viewport-fit=cover, width=device-width, user-scalable=no" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="overscroll-none">{children}</body>
    </html>
  )
}
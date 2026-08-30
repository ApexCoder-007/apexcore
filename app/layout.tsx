import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'The Journey — What Happens When You Click?',
  description:
    'An interactive digital exhibition that makes the invisible journey of internet data visible. Watch your clicks, messages, images and videos travel as animated packets through a living global network.',
  generator: 'v0.app',
  keywords: [
    'internet data journey',
    'how the internet works',
    'network visualization',
    'data packets',
    'interactive exhibition',
    'data travels through the internet',
  ],
  authors: [{ name: 'The Journey' }],
  openGraph: {
    title: 'The Journey — What Happens When You Click?',
    description:
      'Make the invisible journey of internet data visible. An interactive, cinematic network simulation.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Journey — What Happens When You Click?',
    description:
      'Make the invisible journey of internet data visible. An interactive, cinematic network simulation.',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#06080f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark bg-background ${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

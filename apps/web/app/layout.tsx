import type { Metadata } from 'next'
import { Geist_Mono, Inter } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils";
import { PostHogInit } from "@/lib/analytics";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vectra-ai-saas-prospecting.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Vectra — Prospection IA automatisée',
    template: '%s | Vectra',
  },
  description:
    'Vectra automatise ta prospection B2B de A à Z : sourcing qualifié par IA, messages ultra-personnalisés, suivi de réponses et training cold call.',
  keywords: ['prospection IA', 'outreach B2B', 'sourcing leads', 'cold email IA', 'SaaS prospecting'],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: 'Vectra',
    title: 'Vectra — Prospection IA automatisée',
    description: 'Sourcing qualifié, messages personnalisés, outreach automatisé. Tout-en-un.',
    images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: 'Vectra' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vectra — Prospection IA automatisée',
    description: 'Sourcing qualifié, messages personnalisés, outreach automatisé. Tout-en-un.',
    images: [`${SITE_URL}/api/og`],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Vectra',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, macOS, Windows, iOS, Android',
  description: 'Prospection B2B automatisée par IA.',
  url: SITE_URL,
  offers: [
    { '@type': 'Offer', price: '0', priceCurrency: 'EUR', name: 'Free' },
    { '@type': 'Offer', price: '29', priceCurrency: 'EUR', name: 'Solo' },
    { '@type': 'Offer', price: '79', priceCurrency: 'EUR', name: 'Agence' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#09090b" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <PostHogInit />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

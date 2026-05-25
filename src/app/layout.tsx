import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'

const jost = Jost({
  subsets: ['latin'],
  weight: ['300','400','500','600','700'],
  variable: '--font-jost',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300','400','500','600','700'],
  style: ['normal','italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sadaf Finds',
  description: 'Amazon.ae Arbitrage Intelligence Portal',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jost.variable} ${cormorant.variable}`}>
      <body className="font-sans bg-bg text-ink antialiased min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}

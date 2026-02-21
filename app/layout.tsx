import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'clob.nad | Monad HFT Exchange',
  description: 'High-frequency CLOB exchange on Monad blockchain. Sub-second execution, on-chain order book.',
}

export const viewport: Viewport = {
  themeColor: '#0E0E12',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body className="font-mono antialiased scanlines noise overflow-hidden">
        {children}
        <Analytics />
      </body>
    </html>
  )
}

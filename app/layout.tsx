import type { Metadata } from 'next'
import '@/index.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'RavizGraphy',
  description: 'Cinematic photography and videography portfolio with a secure admin dashboard.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-cream-50 text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

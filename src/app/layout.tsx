import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/core/providers/providers'
import { type ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'MVVM Volix Template',
  description: 'Next.js 15 + MVVM by-feature',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Artspark - Discover, Create, Shine',
  description: 'AI艺术创作平台 - 发现灵感，释放创意，闪耀光芒。提供智能艺术工具和创作指导。',
  keywords: ['AI艺术', '创作平台', '灵感发现', '数字艺术', 'Artspark'],
  authors: [{ name: 'Artspark Team' }],
  creator: 'Artspark',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

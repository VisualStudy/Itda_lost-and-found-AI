import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Header } from '@/components/Header'

export const metadata: Metadata = {
  title: { default: '잇다 — AI 분실물 매칭', template: '%s | 잇다' },
  description: '잃어버린 것과 발견된 것을 AI로 잇다.',
  applicationName: '잇다',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: '잇다', statusBarStyle: 'default' },
  icons: { icon: '/icon.svg', apple: '/icons/apple-touch-icon.png' },
}

export const viewport: Viewport = { themeColor: '#F7F4EA', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body><Header />{children}<footer className="site-footer"><p>잃어버린 것과 발견된 것을 따뜻하게 잇습니다.</p><small>© 2026 Itda. AI는 소유권을 판단하지 않아요.</small></footer></body></html>
}

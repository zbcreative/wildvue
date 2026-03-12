'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/home',    label: 'Home',    emoji: '🔭' },
  { href: '/history', label: 'History', emoji: '📖' },
  { href: '/profile', label: 'Profile', emoji: '🪪' },
]

export default function BottomNav() {
  const pathname = usePathname()

  const hideOn = ['/signin']
  if (hideOn.some(p => pathname.startsWith(p))) return null

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: '72px',
      background: 'var(--cream)',
      borderTop: '1px solid rgba(26,46,30,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {navItems.map(item => {
        const active = pathname.startsWith(item.href) ||
          (item.href === '/profile' && pathname.startsWith('/settings'))
        return (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '4px',
            textDecoration: 'none',
            padding: '8px 24px',
          }}>
            <span style={{
              fontSize: '22px',
              lineHeight: 1,
              filter: active ? 'grayscale(0) opacity(1)' : 'grayscale(1) opacity(0.35)',
              transition: 'filter 0.15s ease',
            }}>{item.emoji}</span>
            <span style={{
              fontSize: '10px', fontWeight: 600,
              color: active ? '#1A2E1E' : 'rgba(26,46,30,0.3)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '0.02em',
            }}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

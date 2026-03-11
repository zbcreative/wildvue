'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/home',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill={active ? 'var(--dark)' : 'none'} stroke={active ? 'var(--dark)' : 'rgba(26,46,30,0.3)'} strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/history',
    label: 'History',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="1.5" fill={active ? 'var(--dark)' : 'none'} stroke={active ? 'var(--dark)' : 'rgba(26,46,30,0.3)'} strokeWidth="1.8"/>
        <rect x="13" y="3" width="8" height="8" rx="1.5" fill={active ? 'var(--dark)' : 'none'} stroke={active ? 'var(--dark)' : 'rgba(26,46,30,0.3)'} strokeWidth="1.8"/>
        <rect x="3" y="13" width="8" height="8" rx="1.5" fill={active ? 'var(--dark)' : 'none'} stroke={active ? 'var(--dark)' : 'rgba(26,46,30,0.3)'} strokeWidth="1.8"/>
        <rect x="13" y="13" width="8" height="8" rx="1.5" fill={active ? 'var(--dark)' : 'none'} stroke={active ? 'var(--dark)' : 'rgba(26,46,30,0.3)'} strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill={active ? 'var(--dark)' : 'none'} stroke={active ? 'var(--dark)' : 'rgba(26,46,30,0.3)'} strokeWidth="1.8"/>
        <path d="M4 20C4 17 7.6 14 12 14C16.4 14 20 17 20 20" stroke={active ? 'var(--dark)' : 'rgba(26,46,30,0.3)'} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  const hideOn = ['/settings', '/signin']
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
        const active = pathname.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '4px',
            textDecoration: 'none',
            padding: '8px 24px',
          }}>
            {item.icon(active)}
            <span style={{
              fontSize: '11px', fontWeight: 500,
              color: active ? 'var(--dark)' : 'rgba(26,46,30,0.3)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '0.02em',
            }}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

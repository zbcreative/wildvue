'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{
      fontSize: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      fontWeight: 700,
      color: 'rgba(26,46,30,0.35)',
      margin: '0 0 4px 4px',
    }}>
      {children}
    </p>
  )
}

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="rgba(26,46,30,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18L15 12L9 6" />
    </svg>
  )
}

interface SettingsRowProps {
  emoji: string
  label: string
  onTap: () => void
  divider?: boolean
}

function SettingsRow({ emoji, label, onTap, divider = false }: SettingsRowProps) {
  return (
    <div
      onClick={onTap}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flex: '1 0 0',
        paddingLeft: '16px',
        paddingRight: '16px',
        cursor: 'pointer',
        borderTop: divider ? '1px solid rgba(26,46,30,0.06)' : 'none',
      }}
    >
      <span style={{ fontSize: '18px', flexShrink: 0, width: '24px', textAlign: 'center', lineHeight: 1 }}>{emoji}</span>
      <span style={{ flex: 1, minWidth: 0, fontSize: '14px', fontWeight: 500, color: 'var(--dark)' }}>{label}</span>
      <Chevron />
    </div>
  )
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: '44px',
        height: '26px',
        borderRadius: '100px',
        background: on ? 'var(--sage)' : 'rgba(26,46,30,0.15)',
        position: 'relative',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 0.2s ease',
      }}
    >
      <div style={{
        position: 'absolute',
        top: '3px',
        left: on ? '21px' : '3px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        transition: 'left 0.2s ease',
      }} />
    </div>
  )
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#C0392B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isPro,           setIsPro]           = useState(false)
  const [notificationsOn, setNotificationsOn] = useState(true)
  const [loading,         setLoading]         = useState(true)
  const [signingOut,      setSigningOut]      = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/signin'); return }

      const { data } = await supabase
        .from('credits')
        .select('is_pro')
        .eq('user_id', user.id)
        .single()

      if (data) setIsPro(data.is_pro)
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/signin')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: 'rgba(250,245,232,0.5)' }}>Loading…</span>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--sage)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      {/* ── SAGE HEADER ── */}
      <div style={{
        flexShrink: 0,
        paddingTop: 'calc(52px + env(safe-area-inset-top))',
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}>
        <button
          onClick={() => router.push('/profile')}
          aria-label="Back"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(250,245,232,0.12)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="rgba(255,255,255,0.8)" fill="none"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" />
          </svg>
        </button>

        <span style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 700,
          fontSize: '22px',
          color: 'var(--cream)',
        }}>
          Settings
        </span>
      </div>

      {/* ── CREAM BODY ── */}
      <div
        className="settings-body"
        style={{
          background: 'var(--cream)',
          borderRadius: '22px 22px 0 0',
          marginTop: '-16px',
          flex: 1,
          overflow: 'hidden',
          padding: '12px 16px 12px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >

        {/* 1 — Plan card */}
        <div style={{
          background: 'var(--sage)',
          borderRadius: '16px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'rgba(250,245,232,0.5)',
              margin: '0 0 3px',
            }}>
              Current plan
            </p>
            <p style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              fontSize: '17px',
              color: 'var(--cream)',
              margin: '0 0 3px',
            }}>
              {isPro ? 'Pro' : 'Free'}
            </p>
            <p style={{
              fontSize: '11px',
              color: 'rgba(250,245,232,0.55)',
              margin: 0,
              lineHeight: 1.4,
            }}>
              {isPro
                ? 'Unlimited cleanups · No ads · No watermark'
                : '3 cleanups/month · Ads · Watermark'}
            </p>
          </div>

          {!isPro && (
            <button
              onClick={() => router.push('/upgrade')}
              style={{
                background: 'var(--gold)',
                color: 'var(--dark)',
                border: 'none',
                borderRadius: '100px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                flexShrink: 0,
              }}
            >
              Upgrade
            </button>
          )}
        </div>

        {/* 2 — Preferences */}
        <SectionLabel>Preferences</SectionLabel>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          marginBottom: '8px',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            height: '44px',
            paddingLeft: '16px',
            paddingRight: '16px',
            boxSizing: 'border-box',
          }}>
            <span style={{ fontSize: '18px', flexShrink: 0, width: '24px', textAlign: 'center', lineHeight: 1 }}>🔔</span>
            <span style={{ flex: 1, minWidth: 0, fontSize: '14px', fontWeight: 500, color: 'var(--dark)' }}>
              Notifications
            </span>
            <Toggle
              on={notificationsOn}
              onToggle={() => {
                const next = !notificationsOn
                setNotificationsOn(next)
                console.log('Notifications:', next ? 'on' : 'off')
              }}
            />
          </div>
        </div>

        {/* 3 — Support */}
        <SectionLabel>Support</SectionLabel>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          marginBottom: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '176px',
        }}>
          <SettingsRow emoji="⭐" label="Rate Wildvue"
            onTap={() => console.log('Rate Wildvue')} />
          <SettingsRow emoji="✉️" label="Contact us"
            onTap={() => { window.location.href = 'mailto:hello@wildvue.com' }}
            divider />
          <SettingsRow emoji="🔒" label="Privacy Policy"
            onTap={() => console.log('Privacy Policy')}
            divider />
          <SettingsRow emoji="📄" label="Terms of Service"
            onTap={() => console.log('Terms of Service')}
            divider />
        </div>

        {/* 4 — Account */}
        <SectionLabel>Account</SectionLabel>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          marginBottom: '4px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '88px',
        }}>
          <SettingsRow emoji="🔄" label="Restore purchases"
            onTap={() => console.log('Restore purchases')} />

          {/* Sign out row */}
          <div
            onClick={signingOut ? undefined : handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flex: '1 0 0',
              paddingLeft: '16px',
              paddingRight: '16px',
              cursor: signingOut ? 'default' : 'pointer',
              borderTop: '1px solid rgba(26,46,30,0.06)',
              opacity: signingOut ? 0.5 : 1,
            }}
          >
            <span style={{ width: '24px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogoutIcon />
            </span>
            <span style={{
              flex: 1,
              minWidth: 0,
              fontSize: '14px',
              fontWeight: 600,
              color: '#C0392B',
              lineHeight: 1,
            }}>
              {signingOut ? 'Signing out…' : 'Sign out'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontSize: '11px',
          color: 'rgba(26,46,30,0.25)',
          margin: '4px 0 0',
        }}>
          Images enhanced with AI · v1.0.0
        </p>

      </div>
    </div>
  )
}

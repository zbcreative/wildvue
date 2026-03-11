'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function ConfirmPage() {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    const url = sessionStorage.getItem('wildvue_selected_image')
    if (!url) { router.push('/home'); return }
    setImageUrl(url)

    const loadCredits = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('credits')
        .select('remaining')
        .eq('user_id', user.id)
        .single()
      if (data) setCredits(data.remaining)
    }
    loadCredits()
  }, [router])

  const handleConfirm = () => router.push('/processing')

  const handleBack = () => {
    sessionStorage.removeItem('wildvue_selected_image')
    router.push('/home')
  }

  if (!imageUrl) return null

  return (
    <main style={{
      height: 'calc(100vh - 72px)',
      background: 'var(--sage)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      overflow: 'hidden',
    }}>

      {/* TOP NAV */}
      <div style={{
        paddingTop: 'calc(52px + env(safe-area-inset-top))',
        paddingLeft: '24px',
        paddingRight: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '32px', letterSpacing: '-0.02em', color: 'var(--cream)' }}>
          Wild<em style={{ fontStyle: 'italic', fontWeight: 900, color: 'var(--gold)' }}>vue</em>
        </span>
        <div onClick={handleBack} style={{
          width: '34px', height: '34px',
          borderRadius: '50%',
          background: 'rgba(90,144,104,0.8)',
          border: '1.5px solid rgba(232,162,69,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="rgba(255,255,255,0.7)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12L12 19M5 12L12 5"/>
          </svg>
        </div>
      </div>

      {/* PHOTO PREVIEW */}
      <div style={{
        flex: 1,
        position: 'relative',
        margin: '14px 18px 0',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <img
          src={imageUrl}
          alt="Selected photo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* "Your photo" pill */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(6px)',
          borderRadius: '100px',
          padding: '5px 10px',
          fontSize: '9px',
          fontWeight: 600,
          color: 'var(--cream)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          Your photo
        </div>
      </div>

      {/* FLOATING CREAM CARD */}
      <div style={{
        flexShrink: 0,
        background: '#FAF5E8',
        borderRadius: '22px 22px 0 0',
        boxShadow: '0 -6px 24px rgba(0,0,0,0.12)',
        marginTop: '12px',
        padding: '20px 20px 16px',
      }}>
        {/* Title */}
        <h2 style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 700,
          fontSize: '16px',
          color: '#1A2E1E',
          marginBottom: '4px',
        }}>
          Clean this photo?
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: '10px',
          color: 'rgba(26,46,30,0.5)',
          marginBottom: '14px',
        }}>
          We'll remove all fences, glass and bars.
        </p>

        {/* Credit row */}
        <div style={{
          background: 'rgba(74,124,89,0.07)',
          border: '1px solid rgba(74,124,89,0.12)',
          borderRadius: '100px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px',
        }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(74,124,89,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="11" height="11" stroke="var(--sage)" fill="none" strokeWidth="2" strokeLinecap="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div style={{ flex: 1, fontSize: '12px', color: 'rgba(26,46,30,0.55)' }}>
            {credits === null
              ? '...'
              : credits < 0
                ? <span style={{ color: 'var(--sage)', fontWeight: 600 }}>Unlimited cleanups</span>
                : <><strong style={{ color: 'var(--sage)', fontWeight: 600 }}>{credits}</strong> cleanups left this month</>
            }
          </div>
          <div onClick={() => router.push('/upgrade')} style={{
            fontSize: '11px', fontWeight: 600,
            color: '#FAF5E8', background: 'var(--sage)',
            borderRadius: '100px', padding: '5px 12px', cursor: 'pointer', flexShrink: 0,
          }}>
            Upgrade
          </div>
        </div>

        {/* Primary CTA */}
        <button onClick={handleConfirm} style={{
          width: '100%',
          padding: '18px 24px',
          borderRadius: '14px',
          border: 'none',
          background: '#4A7C59',
          color: '#FAF5E8',
          fontSize: '22px',
          fontWeight: 700,
          fontFamily: "'Fraunces', serif",
          letterSpacing: '-0.02em',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(74,124,89,0.28)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', transform: 'translateX(-10px)' }}>
            <span style={{ fontSize: '22px' }}>🪄</span>
            Clean it up
          </span>
        </button>
      </div>

    </main>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
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

  const handleConfirm = () => {
    router.push('/processing')
  }

  const handleCancel = () => {
    sessionStorage.removeItem('wildvue_selected_image')
    router.push('/home')
  }

  if (!imageUrl) return null

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0C1A0F',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '430px',
      margin: '0 auto',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      {/* Header */}
      <div style={{
        padding: '56px 24px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <button onClick={handleCancel} style={{
          background: 'rgba(28,58,34,0.5)',
          border: '1px solid rgba(58,125,68,0.2)',
          borderRadius: '10px',
          width: '36px', height: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(250,247,242,0.7)" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M5 12L12 19M5 12L12 5"/>
          </svg>
        </button>
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: '22px', fontWeight: 600,
          color: '#FAF7F2',
        }}>Confirm cleanup</h1>
      </div>

      {/* Image preview */}
      <div style={{ padding: '0 24px', flex: 1 }}>
        <div style={{
          width: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '20px',
          background: 'rgba(28,58,34,0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <img
            src={imageUrl}
            alt="Selected photo"
            style={{
              width: '100%',
              maxHeight: '60vh',
              objectFit: 'contain',
              borderRadius: '16px',
            }}
          />
        </div>

        {/* Credit notice */}
        <div style={{
          background: 'rgba(28,58,34,0.4)',
          border: '1px solid rgba(58,125,68,0.2)',
          borderRadius: '14px',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#FAF7F2', marginBottom: '2px' }}>
              1 cleanup credit
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(250,247,242,0.5)' }}>
              Will be used to process this photo
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(232,162,69,0.12)',
            border: '1px solid rgba(232,162,69,0.2)',
            borderRadius: '100px',
            padding: '6px 12px',
          }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '18px', color: '#E8A245', fontWeight: 600 }}>{credits === null ? '...' : credits}</span>
            <span style={{ fontSize: '12px', color: 'rgba(250,247,242,0.5)' }}>left</span>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{
        padding: '16px 24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <button onClick={handleConfirm} style={{
          width: '100%',
          padding: '16px',
          borderRadius: '14px',
          border: 'none',
          background: '#E8A245',
          color: '#0C1A0F',
          fontSize: '16px',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: '-0.1px',
        }}>
          Clean this photo 🪄
        </button>
        <button onClick={handleCancel} style={{
          width: '100%',
          padding: '14px',
          borderRadius: '14px',
          border: '1px solid rgba(58,125,68,0.2)',
          background: 'transparent',
          color: 'rgba(250,247,242,0.5)',
          fontSize: '15px',
          cursor: 'pointer',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          Choose a different photo
        </button>
      </div>

      <BottomNav />
    </main>
  )
}

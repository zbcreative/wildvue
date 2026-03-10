'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    sessionStorage.setItem('wildvue_pending_image', url)
    router.push('/confirm')
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0C1A0F',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      maxWidth: '430px',
      margin: '0 auto',
    }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{
          width: '64px', height: '64px',
          background: '#1C3A22',
          borderRadius: '18px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          border: '1px solid rgba(58,125,68,0.3)',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="#E8A245">
            <path d="M12 2C9.5 2 7.5 3.5 7.5 5.5C7.5 6.5 8 7.4 8.7 8C7 8.3 5.5 9.5 5.5 11C5.5 12 6 12.8 6.7 13.3C5.5 13.8 4.5 15 4.5 16.5C4.5 18.4 6.1 20 8 20L16 20C17.9 20 19.5 18.4 19.5 16.5C19.5 15 18.5 13.8 17.3 13.3C18 12.8 18.5 12 18.5 11C18.5 9.5 17 8.3 15.3 8C16 7.4 16.5 6.5 16.5 5.5C16.5 3.5 14.5 2 12 2Z"/>
          </svg>
        </div>
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: '32px', fontWeight: 700,
          color: '#FAF7F2', marginBottom: '8px',
          letterSpacing: '-0.3px',
        }}>Wildvue</h1>
        <p style={{
          fontSize: '15px',
          color: 'rgba(250,247,242,0.55)',
          lineHeight: 1.5,
        }}>Remove fences, glass & bars from<br/>your wildlife photos instantly.</p>
      </div>

      {/* Upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: '100%',
          aspectRatio: '4/3',
          background: 'rgba(28,58,34,0.4)',
          border: '2px dashed rgba(58,125,68,0.4)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginBottom: '20px',
          transition: 'border-color 0.2s, background 0.2s',
          gap: '12px',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(232,162,69,0.5)'
          ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(28,58,34,0.6)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(58,125,68,0.4)'
          ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(28,58,34,0.4)'
        }}
      >
        <div style={{
          width: '56px', height: '56px',
          background: 'rgba(232,162,69,0.12)',
          borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8A245" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15L16 10L5 21"/>
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#FAF7F2', marginBottom: '4px' }}>
            Tap to select a photo
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(250,247,242,0.4)' }}>
            Zoo · Aquarium · Safari · Wildlife park
          </div>
        </div>
      </div>

      {/* Credits pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(28,58,34,0.5)',
        border: '1px solid rgba(58,125,68,0.2)',
        borderRadius: '100px',
        padding: '8px 16px',
        fontSize: '13px',
        color: 'rgba(250,247,242,0.6)',
      }}>
        <span style={{ color: '#E8A245', fontWeight: 700, fontFamily: "'Fraunces', serif", fontSize: '16px' }}>3</span>
        free cleanups remaining
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </main>
  )
}

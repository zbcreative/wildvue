'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResultPage() {
  const router = useRouter()
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [isAfter, setIsAfter] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const original = sessionStorage.getItem('wildvue_selected_image')
    const result = sessionStorage.getItem('wildvue_result_image')
    if (!original || !result) { router.push('/home'); return }
    setOriginalUrl(original)
    setResultUrl(result)
  }, [router])

  const toggle = () => setIsAfter(v => !v)

  const handleSave = async () => {
    if (!resultUrl) return
    try {
      const res = await fetch(resultUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wildvue-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      const a = document.createElement('a')
      a.href = resultUrl
      a.download = `wildvue-${Date.now()}.jpg`
      a.click()
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  const handleShare = async () => {
    if (!resultUrl) return
    try {
      const res = await fetch(resultUrl)
      const blob = await res.blob()
      const file = new File([blob], 'wildvue.jpg', { type: blob.type })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Wildvue — barrier-free wildlife photo' })
      } else {
        await handleSave()
      }
    } catch { /* user cancelled */ }
  }

  const handleCleanAnother = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        sessionStorage.setItem('wildvue_selected_image', reader.result as string)
        router.push('/confirm')
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  if (!originalUrl || !resultUrl) return null

  const glowShadow = '0 0 0 2.5px rgba(232,213,163,0.6), 0 0 20px rgba(232,213,163,0.25)'

  return (
    <main style={{
      height: 'calc(100vh - 72px)',
      background: 'var(--sage)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      overflow: 'hidden',
    }}>

      {/* TOP NAV — wordmark only */}
      <div style={{
        paddingTop: 'calc(52px + env(safe-area-inset-top))',
        paddingLeft: '24px',
        paddingRight: '24px',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 700,
          fontSize: '32px',
          letterSpacing: '-0.02em',
          color: 'var(--cream)',
        }}>
          Wild<em style={{ fontStyle: 'italic', fontWeight: 900, color: 'var(--gold)' }}>vue</em>
        </span>
      </div>

      {/* PHOTO AREA */}
      <div
        onClick={toggle}
        style={{
          flex: 1,
          position: 'relative',
          margin: '14px 18px 0',
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: isAfter ? glowShadow : 'none',
          transition: 'box-shadow 0.45s ease',
        }}
      >
        {/* After — result image */}
        <img
          src={resultUrl}
          alt="After"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isAfter ? 1 : 0,
            transition: 'opacity 0.45s ease',
          }}
        />

        {/* Before — original image */}
        <img
          src={originalUrl}
          alt="Before"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isAfter ? 0 : 1,
            transition: 'opacity 0.45s ease',
          }}
        />


        {/* "Barriers removed" badge — top left */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          opacity: isAfter ? 1 : 0,
          transition: 'opacity 0.45s ease',
          pointerEvents: 'none',
        }}>
          <div style={{
            background: 'var(--sage)',
            borderRadius: '100px',
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#7fff7f',
              flexShrink: 0,
            }} />
            <span style={{
              color: 'var(--cream)',
              fontSize: '9px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              Barriers removed
            </span>
          </div>
        </div>

        {/* Before / After toggle — bottom center */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '100px',
            padding: '4px',
            display: 'flex',
            gap: '2px',
          }}
        >
          {(['Before', 'After'] as const).map(label => {
            const active = (label === 'After') === isAfter
            return (
              <button
                key={label}
                onClick={() => setIsAfter(label === 'After')}
                style={{
                  background: active ? 'var(--cream)' : 'transparent',
                  color: active ? 'var(--dark)' : 'rgba(255,255,255,0.5)',
                  border: 'none',
                  borderRadius: '100px',
                  padding: '6px 18px',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  cursor: 'pointer',
                  transition: 'background 0.25s ease, color 0.25s ease',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* FLOATING CREAM CARD */}
      <div style={{
        flexShrink: 0,
        background: '#FAF5E8',
        borderRadius: '22px 22px 0 0',
        boxShadow: '0 -6px 24px rgba(0,0,0,0.12)',
        marginTop: '12px',
        padding: '16px 18px',
      }}>
        {/* Save to camera roll */}
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: '14px',
            border: 'none',
            background: saved ? '#3a6347' : '#4A7C59',
            color: '#FAF5E8',
            fontSize: '15px',
            fontWeight: 700,
            fontFamily: "'Fraunces', serif",
            letterSpacing: '-0.01em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 6px 18px rgba(74,124,89,0.25)',
            marginBottom: '10px',
            transition: 'background 0.3s ease',
          }}
        >
          {saved ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FAF5E8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Saved!
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FAF5E8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Save to camera roll
            </>
          )}
        </button>

        {/* Secondary row */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleShare}
            style={secondaryBtn}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </button>
          <button
            onClick={handleCleanAnother}
            style={secondaryBtn}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            Clean another
          </button>
        </div>
      </div>
    </main>
  )
}

const secondaryBtn: React.CSSProperties = {
  flex: 1,
  padding: '11px 8px',
  borderRadius: '12px',
  border: '1.5px solid rgba(74,124,89,0.25)',
  background: 'rgba(74,124,89,0.04)',
  color: 'var(--sage)',
  fontSize: '11px',
  fontWeight: 600,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
}

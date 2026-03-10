'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResultPage() {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const original = sessionStorage.getItem('wildvue_pending_image')
    const result = sessionStorage.getItem('wildvue_result_image')
    if (!original || !result) router.push('/home')
    else {
      setImageUrl(original)
      setResultUrl(result)
    }
  }, [router])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.min(Math.max(x, 0), 100))
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.min(Math.max(x, 0), 100))
  }

  const handleDone = () => {
    sessionStorage.removeItem('wildvue_pending_image')
    router.push('/history')
  }

  if (!imageUrl || !resultUrl) return null

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--sage)',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '430px',
      margin: '0 auto',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      {/* Header */}
      <div style={{ padding: '56px 24px 16px' }}>
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: '24px', fontWeight: 600,
          color: 'var(--cream)', marginBottom: '4px',
        }}>Done! ✨</h1>
        <p style={{ fontSize: '14px', color: 'rgba(250,247,242,0.5)' }}>
          Drag to compare before and after
        </p>
      </div>

      {/* Before/After slider */}
      <div style={{ padding: '0 24px', flex: 1 }}>
        <div
          style={{
            width: '100%',
            position: 'relative',
            cursor: 'ew-resize',
            userSelect: 'none',
          }}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
        >
          {/* After image — sets natural height of container */}
          <img src={resultUrl ?? undefined} alt="After" style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '16px',
            filter: 'contrast(1.05) saturate(1.1)',
          }}/>
          <div style={{
            position: 'absolute', bottom: '12px', right: '12px',
            background: 'rgba(125,184,140,0.8)', borderRadius: '6px',
            padding: '4px 10px', fontSize: '11px', fontWeight: 600,
            color: 'var(--cream)', letterSpacing: '0.05em',
          }}>AFTER</div>

          {/* Before (clips to sliderPos) */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            <img src={imageUrl} alt="Before" style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '16px',
            }}/>
            <div style={{
              position: 'absolute', bottom: '12px', left: '12px',
              background: 'rgba(0,0,0,0.5)', borderRadius: '6px',
              padding: '4px 10px', fontSize: '11px', fontWeight: 600,
            color: 'var(--cream)', letterSpacing: '0.05em',
          }}>BEFORE</div>
          </div>

          {/* Divider line */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${sliderPos}%`,
            width: '2px',
            background: 'var(--gold)',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}>
            {/* Handle */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '36px', height: '36px',
              background: 'var(--gold)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2.5" strokeLinecap="round">
                <path d="M8 12H16M8 12L5 9M8 12L5 15M16 12L19 9M16 12L19 15"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        padding: '20px 24px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <button
          onClick={async () => {
            const resultUrl = sessionStorage.getItem('wildvue_result_image')
            if (!resultUrl) return
            const link = document.createElement('a')
            link.href = resultUrl
            link.download = `wildvue-${Date.now()}.jpg`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }}
          style={{
            width: '100%', padding: '16px',
            borderRadius: '14px', border: 'none',
            background: 'var(--gold)', color: 'var(--sage)',
            fontSize: '16px', fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Save to camera roll ↓
        </button>
        <button onClick={handleDone} style={{
          width: '100%', padding: '14px',
          borderRadius: '14px',
          border: '1px solid rgba(125,184,140,0.2)',
          background: 'transparent',
          color: 'rgba(250,247,242,0.5)',
          fontSize: '15px', cursor: 'pointer',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          Done
        </button>
      </div>
    </main>
  )
}

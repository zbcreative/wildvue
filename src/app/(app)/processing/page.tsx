'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ProcessingPage() {
  const router = useRouter()
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const run = async () => {
      const imageUrl = sessionStorage.getItem('wildvue_pending_image')
      if (!imageUrl) { router.push('/home'); return }

      try {
        // Convert the object URL back to a file blob
        const res = await fetch(imageUrl)
        const blob = await res.blob()
        const file = new File([blob], 'photo.jpg', { type: blob.type })

        const formData = new FormData()
        formData.append('image', file)

        const response = await fetch('/api/cleanup', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (data.image) {
          sessionStorage.setItem('wildvue_result_image', data.image)
          if (data.creditsRemaining !== undefined) {
            sessionStorage.setItem('wildvue_credits', String(data.creditsRemaining))
          }
          router.push('/result')
        } else if (data.error === 'No credits remaining') {
          router.push('/home?upgrade=true')
        } else {
          console.error('No image returned:', data.error)
          router.push('/home')
        }
      } catch (err) {
        console.error('Processing failed:', err)
        router.push('/home')
      }
    }

    run()
  }, [router])

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--sage)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      maxWidth: '430px',
      margin: '0 auto',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '80px', height: '80px',
        background: 'var(--surface)',
        borderRadius: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '32px',
        border: '1px solid rgba(125,184,140,0.3)',
        animation: 'pulse 1.8s ease-in-out infinite',
      }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="var(--gold)">
          <path d="M12 2C9.5 2 7.5 3.5 7.5 5.5C7.5 6.5 8 7.4 8.7 8C7 8.3 5.5 9.5 5.5 11C5.5 12 6 12.8 6.7 13.3C5.5 13.8 4.5 15 4.5 16.5C4.5 18.4 6.1 20 8 20L16 20C17.9 20 19.5 18.4 19.5 16.5C19.5 15 18.5 13.8 17.3 13.3C18 12.8 18.5 12 18.5 11C18.5 9.5 17 8.3 15.3 8C16 7.4 16.5 6.5 16.5 5.5C16.5 3.5 14.5 2 12 2Z"/>
        </svg>
      </div>

      <h2 style={{
        fontFamily: "'Fraunces', serif",
        fontSize: '26px', fontWeight: 600,
        color: 'var(--cream)', marginBottom: '10px',
      }}>Cleaning your photo</h2>

      <p style={{
        fontSize: '15px',
        color: 'rgba(250,247,242,0.5)',
        lineHeight: 1.6,
        marginBottom: '40px',
        maxWidth: '280px',
      }}>Removing barriers and restoring the scene. This takes just a moment.</p>

      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '8px', height: '8px',
            borderRadius: '50%',
            background: 'var(--gold)',
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}/>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.96); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </main>
  )
}

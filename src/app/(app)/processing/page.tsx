'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const MESSAGES = [
  'Spotting the barriers…',
  'Working some magic…',
  'Revealing what\'s behind…',
]

const PAWS = [0, 1, 2, 3, 4]

export default function ProcessingPage() {
  const router = useRouter()
  const hasStarted = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [displayText, setDisplayText] = useState('')
  const [msgOpacity, setMsgOpacity] = useState(1)

  const msgIdxRef = useRef(0)
  const charIdxRef = useRef(0)
  const isMountedRef = useRef(true)

  const completeBar = () => {
    if (!barRef.current || !barRef.current.parentElement) return
    // Capture the live animated position before stopping the animation
    const currentPct =
      (parseFloat(getComputedStyle(barRef.current).width) /
        barRef.current.parentElement.offsetWidth) *
      100
    barRef.current.style.width = `${currentPct}%`
    barRef.current.style.animation = 'none'
    // Force a reflow so the browser commits the captured width
    // before the transition begins — prevents the snap-back-to-0 glitch
    void barRef.current.offsetWidth
    barRef.current.style.transition = 'width 0.9s ease-out'
    barRef.current.style.width = '100%'
  }

  // Typewriter loop
  useEffect(() => {
    isMountedRef.current = true
    let timeout: ReturnType<typeof setTimeout>

    const typeNextChar = () => {
      if (!isMountedRef.current) return
      const msg = MESSAGES[msgIdxRef.current]
      if (charIdxRef.current < msg.length) {
        charIdxRef.current++
        setDisplayText(msg.slice(0, charIdxRef.current))
        timeout = setTimeout(typeNextChar, 45)
      } else {
        timeout = setTimeout(() => {
          if (!isMountedRef.current) return
          setMsgOpacity(0)
          timeout = setTimeout(() => {
            if (!isMountedRef.current) return
            msgIdxRef.current = (msgIdxRef.current + 1) % MESSAGES.length
            charIdxRef.current = 0
            setDisplayText('')
            setMsgOpacity(1)
            timeout = setTimeout(typeNextChar, 60)
          }, 400)
        }, 1600)
      }
    }

    timeout = setTimeout(typeNextChar, 400)

    return () => {
      isMountedRef.current = false
      clearTimeout(timeout)
    }
  }, [])

  // API processing + bar start
  useEffect(() => {
    const url = sessionStorage.getItem('wildvue_selected_image')
    if (!url) { router.push('/home'); return }
    setImageUrl(url)

    if (hasStarted.current) return
    hasStarted.current = true

    const run = async () => {
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(url)
        const blob = await res.blob()
        const file = new File([blob], 'photo.jpg', { type: blob.type })
        const formData = new FormData()
        formData.append('image', file)

        const response = await fetch('/api/cleanup', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        })

        completeBar()

        const data = await response.json()

        if (data.image) {
          sessionStorage.setItem('wildvue_result_image', data.image)
          if (data.creditsRemaining !== undefined) {
            sessionStorage.setItem('wildvue_credits', String(data.creditsRemaining))
          }
          if (data.isPro !== undefined) {
            sessionStorage.setItem('wildvue_is_pro', String(data.isPro))
          }
          setTimeout(() => router.push('/result'), 400)
        } else if (data.error === 'No credits remaining') {
          router.push('/home?upgrade=true')
        } else {
          console.error('No image returned:', data.error)
          router.push('/home')
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
        console.error('Processing failed:', err)
        router.push('/home')
      }
    }

    run()

  }, [router])

  const handleCancel = () => {
    abortRef.current?.abort()
    router.push('/confirm')
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
          alt="Processing"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Dark overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(26,46,30,0.55)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '18px',
        }}>
          {/* Paw print trail */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {PAWS.map(i => (
              <span
                key={i}
                style={{
                  fontSize: '20px',
                  display: 'block',
                  filter: 'brightness(10)',
                  animationName: 'pawPulse',
                  animationDuration: '1000ms',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDelay: `${i * 200}ms`,
                }}
              >
                🐾
              </span>
            ))}
          </div>

          {/* Typewriter status */}
          <div style={{ minHeight: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{
              fontFamily: "'Fraunces', serif",
              fontStyle: 'italic',
              fontSize: '14px',
              color: '#FAF5E8',
              margin: 0,
              textAlign: 'center',
              opacity: msgOpacity,
              transition: 'opacity 0.4s ease',
              whiteSpace: 'nowrap',
            }}>
              {displayText}
            </p>
          </div>
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
        {/* Progress bar track */}
        <div style={{
          background: 'rgba(26,46,30,0.08)',
          borderRadius: '100px',
          height: '6px',
          marginBottom: '12px',
          overflow: 'hidden',
        }}>
          {/* CSS animation drives the fill — starts the moment the element mounts */}
          <div
            ref={barRef}
            style={{
              background: '#4A7C59',
              height: '100%',
              borderRadius: '100px',
              width: '0%',
              animation: 'fillBar 11s linear forwards',
            }}
          />
        </div>

        {/* Cancel */}
        <p
          onClick={handleCancel}
          style={{
            fontSize: '11px',
            color: 'rgba(26,46,30,0.4)',
            textAlign: 'center',
            cursor: 'pointer',
            margin: 0,
            userSelect: 'none',
          }}
        >
          Cancel
        </p>
      </div>

      <style>{`
        @keyframes pawPulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          10%       { opacity: 1;   transform: scale(1.25); }
          20%       { opacity: 0.2; transform: scale(1); }
        }
        @keyframes fillBar {
          from { width: 0%; }
          to   { width: 92%; }
        }
      `}</style>
    </main>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function OnboardingPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [firstFocused, setFirstFocused] = useState(false)
  const [lastFocused, setLastFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit || loading) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Session expired. Please sign in again.')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        has_onboarded: true,
      })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/home')
  }

  const inputStyle = (focused: boolean, filled: boolean): React.CSSProperties => ({
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    background: 'white',
    border: `1.5px solid ${focused ? '#4A7C59' : filled ? 'rgba(74,124,89,0.3)' : 'rgba(26,46,30,0.1)'}`,
    borderRadius: '12px',
    padding: '13px 15px',
    fontSize: '16px',
    color: '#1A2E1E',
    outline: 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'border-color 0.15s ease',
  })

  return (
    <main style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(to bottom, #162E1A 0%, #2E5E3A 35%, #3D7049 65%, #4A7C59 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      {/* STARS */}
      <div style={{ position: 'absolute', top: '3vh',  left: '8%',  width: '1.5px', height: '1.5px', borderRadius: '50%', background: '#FAF5E8', opacity: 0.4,  pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '7vh',  left: '18%', width: '1px',   height: '1px',   borderRadius: '50%', background: '#FAF5E8', opacity: 0.28, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '5vh',  left: '33%', width: '2px',   height: '2px',   borderRadius: '50%', background: '#FAF5E8', opacity: 0.5,  pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '11vh', left: '45%', width: '1px',   height: '1px',   borderRadius: '50%', background: '#FAF5E8', opacity: 0.22, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '4vh',  left: '57%', width: '1.5px', height: '1.5px', borderRadius: '50%', background: '#FAF5E8', opacity: 0.45, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '9vh',  left: '70%', width: '1px',   height: '1px',   borderRadius: '50%', background: '#FAF5E8', opacity: 0.3,  pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '2vh',  left: '82%', width: '1.5px', height: '1.5px', borderRadius: '50%', background: '#FAF5E8', opacity: 0.38, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '15vh', left: '12%', width: '1px',   height: '1px',   borderRadius: '50%', background: '#FAF5E8', opacity: 0.2,  pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '18vh', left: '27%', width: '1.5px', height: '1.5px', borderRadius: '50%', background: '#FAF5E8', opacity: 0.32, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '13vh', left: '52%', width: '1px',   height: '1px',   borderRadius: '50%', background: '#FAF5E8', opacity: 0.25, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '20vh', left: '66%', width: '2px',   height: '2px',   borderRadius: '50%', background: '#FAF5E8', opacity: 0.42, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '16vh', left: '88%', width: '1px',   height: '1px',   borderRadius: '50%', background: '#FAF5E8', opacity: 0.22, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '28vh', left: '38%', width: '1px',   height: '1px',   borderRadius: '50%', background: '#FAF5E8', opacity: 0.18, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '25vh', left: '74%', width: '1.5px', height: '1.5px', borderRadius: '50%', background: '#FAF5E8', opacity: 0.28, pointerEvents: 'none', zIndex: 0 }} />

      {/* MOON */}
      <div style={{ position: 'absolute', top: '28px', right: '36px', fontSize: '28px', lineHeight: 1, opacity: 0.75, pointerEvents: 'none', zIndex: 0 }}>🌙</div>

      {/* SAGE ZONE */}
      <div style={{
        flex: '0 0 54vh',
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: '24px',
        gap: '14px',
      }}>
        {/* Wordmark */}
        <span style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 700,
          fontSize: '34px',
          letterSpacing: '-0.02em',
          color: '#FAF5E8',
        }}>
          Wild<em style={{ fontStyle: 'italic', fontWeight: 900, color: '#E8D5A3' }}>vue</em>
        </span>

        {/* Animal emoji */}
        <div style={{
          fontSize: '64px',
          lineHeight: 1,
          filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.3))',
        }}>
          🦁
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 700,
          fontSize: '27px',
          color: '#FAF5E8',
          textAlign: 'center',
          lineHeight: 1.2,
          margin: 0,
          textShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}>
          Welcome to the{' '}
          <em style={{ fontStyle: 'italic', fontWeight: 900, color: '#E8D5A3', fontFamily: "'Fraunces', serif" }}>wild side.</em>
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: '13px',
          color: 'rgba(250,245,232,0.5)',
          textAlign: 'center',
          maxWidth: '220px',
          lineHeight: 1.55,
          margin: 0,
        }}>
          Let&apos;s get your account set up so we can personalize your experience.
        </p>
      </div>

      {/* CREAM CARD — 32% remaining */}
      <div style={{
        flex: 1,
        position: 'relative',
        zIndex: 1,
        background: '#FAF5E8',
        borderRadius: '22px 22px 0 0',
        boxShadow: '0 -6px 24px rgba(0,0,0,0.12)',
        padding: '20px 20px',
        paddingBottom: 'calc(28px + env(safe-area-inset-bottom))',
      }}>
        {/* Card title */}
        <h2 style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 700,
          fontSize: '21px',
          color: '#1A2E1E',
          margin: '0 0 5px',
        }}>
          What&apos;s your name?
        </h2>

        {/* Card sub */}
        <p style={{
          fontSize: '13px',
          color: 'rgba(26,46,30,0.45)',
          margin: '0 0 18px',
          lineHeight: 1.5,
        }}>
          We&apos;ll use this to personalize your experience.
        </p>

        {/* Name inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {/* First name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'rgba(26,46,30,0.4)',
              marginBottom: '7px',
            }}>
              First name
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              onFocus={() => setFirstFocused(true)}
              onBlur={() => setFirstFocused(false)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={inputStyle(firstFocused, firstName.length > 0)}
            />
          </div>

          {/* Last name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'rgba(26,46,30,0.4)',
              marginBottom: '7px',
            }}>
              Last name
            </label>
            <input
              type="text"
              placeholder="e.g. Johnson"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              onFocus={() => setLastFocused(true)}
              onBlur={() => setLastFocused(false)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={inputStyle(lastFocused, lastName.length > 0)}
            />
          </div>
        </div>

        {error && (
          <p style={{ fontSize: '13px', color: '#C0392B', margin: '0 0 10px' }}>
            {error}
          </p>
        )}

        {/* CTA button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          style={{
            display: 'block',
            width: '100%',
            background: canSubmit && !loading ? '#4A7C59' : 'rgba(74,124,89,0.4)',
            color: '#FAF5E8',
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: '17px',
            border: 'none',
            borderRadius: '14px',
            padding: '14px 18px',
            cursor: canSubmit && !loading ? 'pointer' : 'not-allowed',
            boxShadow: canSubmit && !loading ? '0 6px 18px rgba(74,124,89,0.25)' : 'none',
            marginBottom: '14px',
            transition: 'background 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          {loading ? 'Saving…' : "Let's go 🌿"}
        </button>
      </div>
    </main>
  )
}

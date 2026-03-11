'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSubmitted(true)
      setLoading(false)
    }
  }

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

        {/* Owl */}
        <div style={{
          fontSize: '64px',
          lineHeight: 1,
          filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.3))',
        }}>
          🦉
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
          Your wildlife photos,<br/>
          <strong style={{ fontStyle: 'italic', fontWeight: 900, color: '#E8D5A3', fontFamily: "'Fraunces', serif" }}>barrier-free.</strong>
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
          Sign in or create an account to get started.
        </p>
      </div>

      {/* FLOATING CREAM CARD */}
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
        {!submitted ? (
          <>
            {/* Card title */}
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              fontSize: '21px',
              color: '#1A2E1E',
              margin: '0 0 5px',
            }}>
              Sign in
            </h2>

            {/* Card sub */}
            <p style={{
              fontSize: '13px',
              color: 'rgba(26,46,30,0.45)',
              margin: '0 0 18px',
              lineHeight: 1.5,
            }}>
              Enter your email and we&apos;ll send you a magic link.
            </p>

            {/* Email label */}
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'rgba(26,46,30,0.4)',
              marginBottom: '7px',
            }}>
              Email address
            </label>

            {/* Email input */}
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSignIn()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                display: 'block',
                width: '100%',
                boxSizing: 'border-box',
                background: 'white',
                border: `1.5px solid ${focused ? '#4A7C59' : 'rgba(26,46,30,0.1)'}`,
                borderRadius: '12px',
                padding: '13px 15px',
                fontSize: '16px',
                color: '#1A2E1E',
                outline: 'none',
                marginBottom: '12px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: 'border-color 0.15s ease',
              }}
            />

            {error && (
              <p style={{ fontSize: '13px', color: '#C0392B', margin: '0 0 10px' }}>
                {error}
              </p>
            )}

            {/* CTA button */}
            <button
              onClick={handleSignIn}
              disabled={loading || !email}
              style={{
                display: 'block',
                width: '100%',
                background: loading || !email ? 'rgba(74,124,89,0.4)' : '#4A7C59',
                color: '#FAF5E8',
                fontFamily: "'Fraunces', serif",
                fontWeight: 700,
                fontSize: '17px',
                border: 'none',
                borderRadius: '14px',
                padding: '14px 18px',
                cursor: loading || !email ? 'not-allowed' : 'pointer',
                boxShadow: loading || !email ? 'none' : '0 6px 18px rgba(74,124,89,0.25)',
                marginBottom: '14px',
                transition: 'background 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {loading ? 'Sending…' : 'Send magic link 🪄'}
            </button>

            {/* Terms */}
            <p style={{
              fontSize: '11px',
              color: 'rgba(26,46,30,0.35)',
              textAlign: 'center',
              lineHeight: 1.6,
              margin: 0,
            }}>
              By continuing you agree to our{' '}
              <a href="/terms" style={{ color: 'rgba(26,46,30,0.5)', textDecoration: 'underline' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" style={{ color: 'rgba(26,46,30,0.5)', textDecoration: 'underline' }}>Privacy Policy</a>.
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: '8px', paddingBottom: '8px' }}>
            <div style={{ fontSize: '44px', marginBottom: '14px' }}>📬</div>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              fontSize: '18px',
              color: '#1A2E1E',
              margin: '0 0 10px',
            }}>
              Check your inbox
            </h2>
            <p style={{
              fontSize: '13px',
              color: 'rgba(26,46,30,0.5)',
              lineHeight: 1.6,
              margin: 0,
            }}>
              We sent a magic link to{' '}
              <strong style={{ color: '#1A2E1E' }}>{email}</strong>.
              <br/>Click it to sign in.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

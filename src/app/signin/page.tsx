'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      minHeight: '100vh',
      background: 'var(--sage)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(90,144,104,0.4)',
        border: '1px solid rgba(125,184,140,0.2)',
        borderRadius: '20px',
        padding: '40px 36px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{
          width: '52px', height: '52px',
          background: 'var(--surface)',
          borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          border: '1px solid rgba(125,184,140,0.3)',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--gold)">
            <path d="M12 2C9.5 2 7.5 3.5 7.5 5.5C7.5 6.5 8 7.4 8.7 8C7 8.3 5.5 9.5 5.5 11C5.5 12 6 12.8 6.7 13.3C5.5 13.8 4.5 15 4.5 16.5C4.5 18.4 6.1 20 8 20L16 20C17.9 20 19.5 18.4 19.5 16.5C19.5 15 18.5 13.8 17.3 13.3C18 12.8 18.5 12 18.5 11C18.5 9.5 17 8.3 15.3 8C16 7.4 16.5 6.5 16.5 5.5C16.5 3.5 14.5 2 12 2Z"/>
          </svg>
        </div>

        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: '26px', fontWeight: 700,
          color: 'var(--cream)', marginBottom: '8px',
        }}>Wildvue</h1>

        {!submitted ? (
          <>
            <p style={{ fontSize: '14px', color: 'rgba(250,247,242,0.6)', marginBottom: '28px', lineHeight: 1.5 }}>
              Enter your email and we'll send you a magic link to sign in.
            </p>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSignIn()}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(125,184,140,0.3)',
                background: 'rgba(12,26,15,0.6)',
                color: 'var(--cream)',
                fontSize: '15px',
                marginBottom: '12px',
                outline: 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            />

            {error && (
              <p style={{ fontSize: '13px', color: '#E05555', marginBottom: '12px' }}>{error}</p>
            )}

            <button
              onClick={handleSignIn}
              disabled={loading || !email}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                background: loading || !email ? 'rgba(232,162,69,0.4)' : 'var(--gold)',
                color: 'var(--sage)',
                fontSize: '15px',
                fontWeight: 700,
                cursor: loading || !email ? 'not-allowed' : 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {loading ? 'Sending...' : 'Send magic link ✨'}
            </button>
          </>
        ) : (
          <div>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📬</div>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '20px', color: 'var(--cream)', marginBottom: '10px'
            }}>Check your email</h2>
            <p style={{ fontSize: '14px', color: 'rgba(250,247,242,0.6)', lineHeight: 1.6 }}>
              We sent a magic link to <strong style={{ color: 'var(--cream)' }}>{email}</strong>. Click it to sign in.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

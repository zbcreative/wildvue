'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Profile {
  first_name: string
  last_name: string
  created_at: string
  favorite_venue: string | null
}

interface Credits {
  remaining: number
  lifetime_used: number
  is_pro: boolean
}

interface RankInfo {
  emoji: string
  title: string
  nextThreshold: number | null
  nextRank: string | null
}

function getRankInfo(n: number): RankInfo {
  if (n >= 50) return { emoji: '🦁', title: 'Conservation Hero', nextThreshold: null, nextRank: null }
  if (n >= 20) return { emoji: '🌿', title: 'Wildlife Ranger',   nextThreshold: 50,  nextRank: 'Conservation Hero' }
  if (n >= 5)  return { emoji: '🥾', title: 'Safari Scout',      nextThreshold: 20,  nextRank: 'Wildlife Ranger' }
  return             { emoji: '🔑', title: 'Zookeeper',          nextThreshold: 5,   nextRank: 'Safari Scout' }
}

function getRankProgress(n: number): number {
  if (n >= 50) return 1
  if (n >= 20) return (n - 20) / (50 - 20)
  if (n >= 5)  return (n - 5)  / (20 - 5)
  return n / 5
}

function formatJoined(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile,      setProfile]      = useState<Profile | null>(null)
  const [credits,      setCredits]      = useState<Credits | null>(null)
  const [email,        setEmail]        = useState('')
  const [loading,      setLoading]      = useState(true)
  const [editingVenue, setEditingVenue] = useState(false)
  const [venueInput,   setVenueInput]   = useState('')
  const [savingVenue,  setSavingVenue]  = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/signin'); return }

      setEmail(user.email ?? '')

      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('credits').select('remaining, lifetime_used, is_pro').eq('user_id', user.id).single(),
      ])

      if (p) setProfile({
        first_name:     p.first_name     ?? '',
        last_name:      p.last_name      ?? '',
        created_at:     p.created_at     ?? user.created_at,
        favorite_venue: p.favorite_venue ?? null,
      })
      if (c) setCredits(c)
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function saveVenue() {
    if (!profile) return
    setSavingVenue(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ favorite_venue: venueInput.trim() || null }).eq('id', user.id)
    setProfile(prev => prev ? { ...prev, favorite_venue: venueInput.trim() || null } : prev)
    setEditingVenue(false)
    setSavingVenue(false)
  }

  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase() || '?'
    : ''
  const displayName = profile
    ? `${profile.first_name ?? ''} ${profile.last_name?.[0] ? profile.last_name[0] + '.' : ''}`.trim()
    : ''

  const rankInfo     = credits ? getRankInfo(credits.lifetime_used)     : null
  const rankProgress = credits ? getRankProgress(credits.lifetime_used) : 0

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: 'rgba(250,245,232,0.5)' }}>Loading…</span>
      </div>
    )
  }

  return (
    <div style={{ height: 'calc(100vh - 72px)', background: 'var(--sage)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Hide scrollbar on cream body */}
      <style>{`.profile-body::-webkit-scrollbar { display: none; }`}</style>

      {/* ── SAGE HEADER ── */}
      <div style={{
        flexShrink: 0,
        paddingTop: 'calc(52px + env(safe-area-inset-top))',
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingBottom: '36px',
      }}>

        {/* Wordmark + gear row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: '32px',
            letterSpacing: '-0.02em',
            color: 'var(--cream)',
          }}>
            Wild<em style={{ fontStyle: 'italic', fontWeight: 900, color: 'var(--gold)' }}>vue</em>
          </span>

          <button
            onClick={() => router.push('/settings')}
            aria-label="Settings"
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'rgba(250,245,232,0.12)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="var(--cream)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>

        {/* Avatar + identity */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', marginTop: '0px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '26px', fontWeight: 700, color: 'var(--dark)' }}>
              {initials}
            </span>
          </div>

          <span style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', fontWeight: 700, color: 'var(--cream)' }}>
            {displayName}
          </span>

          <span style={{ fontSize: '12px', color: 'rgba(250,245,232,0.5)' }}>{email}</span>

          {credits && (
            <div style={{
              border: `1.5px solid ${credits.is_pro ? 'rgba(232,213,163,0.7)' : 'rgba(232,213,163,0.4)'}`,
              borderRadius: '100px',
              padding: '3px 12px',
              color: 'var(--gold)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {credits.is_pro ? 'Pro' : 'Free plan'}
            </div>
          )}
        </div>
      </div>

      {/* ── CREAM BODY ── */}
      <div
        className="profile-body"
        style={{
          background: 'var(--cream)',
          borderRadius: '22px 22px 0 0',
          marginTop: '-24px',
          flex: 1,
          overflowY: 'auto',
          scrollbarWidth: 'none',
          padding: '14px 16px 6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >

        {/* 1 — Joined date */}
        {profile && (
          <p style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: 'italic',
            fontSize: '12px',
            color: 'rgba(26,46,30,0.4)',
            textAlign: 'center',
            margin: 0,
          }}>
            In the wild since {formatJoined(profile.created_at)}
          </p>
        )}

        {/* 2 — Wildlife rank card */}
        {credits && rankInfo && (
          <div style={{ background: 'var(--sage)', borderRadius: '16px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '18px' }}>{rankInfo.emoji}</span>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', fontWeight: 700, color: 'var(--cream)' }}>
                {rankInfo.title}
              </span>
            </div>

            <p style={{ fontSize: '13px', color: 'rgba(250,245,232,0.75)', margin: '0 0 8px', lineHeight: 1.5 }}>
              You&apos;ve logged{' '}
              <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{credits.lifetime_used}</span>
              {' '}sightings so far. Keep exploring!
            </p>

            {/* Progress bar */}
            <div style={{
              height: '6px', borderRadius: '100px',
              background: 'rgba(250,245,232,0.15)',
              overflow: 'hidden',
              marginBottom: '6px',
            }}>
              <div style={{
                height: '100%', borderRadius: '100px',
                background: 'var(--gold)',
                width: `${Math.min(rankProgress * 100, 100)}%`,
                transition: 'width 0.4s ease',
              }} />
            </div>

            {rankInfo.nextRank && rankInfo.nextThreshold != null && (
              <p style={{ fontSize: '10px', color: 'rgba(250,245,232,0.38)', margin: 0 }}>
                {rankInfo.nextThreshold - credits.lifetime_used} more to reach {rankInfo.nextRank}
              </p>
            )}
          </div>
        )}

        {/* 3 — Favorite venue card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: '1.5px solid rgba(26,46,30,0.07)',
          padding: '10px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>📍</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '10px', textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'rgba(26,46,30,0.4)',
                  margin: '0 0 3px', fontWeight: 600,
                }}>
                  Favorite venue
                </p>
                {editingVenue ? (
                  <input
                    autoFocus
                    value={venueInput}
                    onChange={e => setVenueInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveVenue()}
                    placeholder="e.g. Central Park"
                    style={{
                      fontSize: '14px', fontWeight: 500, color: 'var(--dark)',
                      border: 'none', borderBottom: '1.5px solid var(--sage)',
                      outline: 'none', width: '100%', background: 'transparent',
                      padding: '2px 0',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  />
                ) : (
                  <p style={{
                    fontSize: '14px', fontWeight: 500, margin: 0,
                    color: profile?.favorite_venue ? 'var(--dark)' : 'rgba(26,46,30,0.3)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {profile?.favorite_venue ?? 'Add your favorite venue'}
                  </p>
                )}
              </div>
            </div>

            {editingVenue ? (
              <div style={{ display: 'flex', gap: '6px', marginLeft: '10px', flexShrink: 0 }}>
                <button
                  onClick={() => setEditingVenue(false)}
                  style={{ fontSize: '12px', color: 'rgba(26,46,30,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveVenue}
                  disabled={savingVenue}
                  style={{ fontSize: '12px', color: 'var(--sage)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  {savingVenue ? 'Saving…' : 'Save'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setVenueInput(profile?.favorite_venue ?? ''); setEditingVenue(true) }}
                style={{ fontSize: '13px', color: 'var(--sage)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0 4px 12px', flexShrink: 0 }}
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* 4 — Stats row */}
        {credits && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{
              background: 'white', borderRadius: '16px',
              border: '1.5px solid rgba(26,46,30,0.07)',
              padding: '12px',
            }}>
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>🐾</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: '18px', fontWeight: 700, color: 'var(--dark)', lineHeight: 1 }}>
                {credits.lifetime_used}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(26,46,30,0.45)', marginTop: '4px' }}>Sightings logged</div>
            </div>

            <div style={{
              background: 'white', borderRadius: '16px',
              border: '1.5px solid rgba(26,46,30,0.07)',
              padding: '12px',
            }}>
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>✨</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: credits.is_pro ? '14px' : '18px', fontWeight: 700, color: '#4A7C59', lineHeight: 1 }}>
                {credits.is_pro ? 'Unlimited' : credits.remaining}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(26,46,30,0.45)', marginTop: '4px' }}>
                {credits.is_pro ? 'Cleanups' : 'Credits left'}
              </div>
            </div>
          </div>
        )}

        {/* 5 — Upgrade banner (free only) */}
        {credits && !credits.is_pro && (
          <div style={{ background: 'var(--sage)', borderRadius: '16px', padding: '14px' }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: '15px', fontWeight: 700, color: 'var(--cream)', margin: '0 0 4px' }}>
              Go Pro 🌿
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(250,245,232,0.7)', margin: '0 0 12px' }}>
              Unlimited cleanups, no ads, no watermark.
            </p>
            <button
              onClick={() => router.push('/upgrade')}
              style={{
                background: 'var(--gold)', color: 'var(--dark)',
                border: 'none', borderRadius: '100px',
                padding: '8px 20px',
                fontSize: '14px', fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Upgrade
            </button>
          </div>
        )}

        {/* 6 — Pro perks card (pro only) */}
        {credits?.is_pro && (
          <div style={{
            background: 'white', borderRadius: '16px',
            border: '1.5px solid rgba(26,46,30,0.07)',
            padding: '12px 14px',
          }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: '13px', fontWeight: 700, color: 'var(--dark)', margin: '0 0 12px' }}>
              Your Pro perks 🌿
            </p>
            {['Unlimited cleanups', 'No ads, no watermark on saved photos'].map(perk => (
              <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--sage)', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'var(--dark)' }}>{perk}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

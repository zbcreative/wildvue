'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Cleanup } from '@/types/database'

// Signed URL TTL for grid thumbnails — 1 hour
const SIGNED_URL_EXPIRY = 3600

// "Today · 9:51 PM" / "Yesterday · 3:22 PM" / "Mar 7 · 2:15 PM"
function formatItemDate(iso: string): string {
  const d    = new Date(iso)
  const now  = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86_400_000)
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (days === 0) return `Today · ${time}`
  if (days === 1) return `Yesterday · ${time}`
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${time}`
}

// Group cleanups by relative time bucket
interface RelativeGroup { label: string; items: Cleanup[] }

function getRelativeBucket(iso: string): string {
  const d    = new Date(iso)
  const now  = new Date()
  // Compare calendar days in local time
  const todayStart     = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart.getTime() - 86_400_000)
  const weekStart      = new Date(todayStart.getTime() - 6 * 86_400_000)
  if (d >= todayStart)     return 'Today'
  if (d >= yesterdayStart) return 'Yesterday'
  if (d >= weekStart)      return 'This week'
  return 'Earlier'
}

// Preserve display order of buckets
const BUCKET_ORDER = ['Today', 'Yesterday', 'This week', 'Earlier']

function groupByRelativeTime(rows: Cleanup[]): RelativeGroup[] {
  const map: Record<string, Cleanup[]> = {}
  for (const c of rows) {
    const label = getRelativeBucket(c.created_at)
    if (!map[label]) map[label] = []
    map[label].push(c)
  }
  return BUCKET_ORDER.filter(l => map[l]).map(l => ({ label: l, items: map[l] }))
}

export default function HistoryPage() {
  const router = useRouter()
  const [cleanups,      setCleanups]      = useState<Cleanup[]>([])
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({})
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/signin'); return }

      // 1. Fetch completed cleanup records (store storage paths, not URLs)
      const { data } = await supabase
        .from('cleanups')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50)

      const rows: Cleanup[] = data || []
      setCleanups(rows)

      if (rows.length === 0) { setLoading(false); return }

      // 2. Generate fresh signed URLs for cleaned images (thumbnails only).
      //    The result page generates its own fresh URLs for both images when
      //    navigated to from history.
      const outputPaths = rows.map(c => c.output_url).filter(Boolean) as string[]
      const { data: signedData } = await supabase.storage
        .from('cleanups')
        .createSignedUrls(outputPaths, SIGNED_URL_EXPIRY)

      const urlMap: Record<string, string> = {}
      rows.forEach((c, i) => {
        urlMap[c.id] = signedData?.[i]?.signedUrl || ''
      })
      setThumbnailUrls(urlMap)
      setLoading(false)
    }
    load()
  }, [router])

  const handleOpen = (c: Cleanup) => {
    router.push(`/result?from=history&id=${c.id}`)
  }

  const groups = groupByRelativeTime(cleanups)

  return (
    <main style={{
      height: 'calc(100vh - 72px)',
      background: '#4A7C59',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      {/* ── SAGE HEADER ── */}
      <div style={{
        flexShrink: 0,
        paddingTop: 'calc(52px + env(safe-area-inset-top))',
        paddingLeft: '24px',
        paddingRight: '24px',
        paddingBottom: '20px',
      }}>
        {/* Wordmark — matches home screen exactly */}
        <div style={{ marginBottom: '10px' }}>
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

        {/* Page title + subtitle — indented to share the same left edge */}
        <div style={{ paddingLeft: '4px' }}>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: '26px',
            letterSpacing: '-0.02em',
            color: '#FAF5E8',
            margin: '0 0 4px',
            padding: 0,
          }}>
            History
          </h1>
          <p style={{
            margin: 0,
            padding: 0,
            fontSize: '11px',
            color: 'rgba(250,245,232,0.5)',
          }}>
            Your cleaned photos
          </p>
        </div>
      </div>

      {/* ── CREAM BODY ── */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: '#FAF5E8',
        borderRadius: '22px 22px 0 0',
        marginTop: '-16px',
        overflowY: 'auto',
        padding: '16px 24px',
      }}>
        {/* Cleanups count pill */}
        {!loading && cleanups.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '13px',
            right: '18px',
            background: 'rgba(74,124,89,0.08)',
            border: '1px solid rgba(74,124,89,0.15)',
            borderRadius: '100px',
            padding: '3px 10px',
            fontSize: '9px',
            fontWeight: 700,
            color: '#4A7C59',
            pointerEvents: 'none',
          }}>
            {cleanups.length} cleanup{cleanups.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'white',
                  borderRadius: '16px',
                  padding: '10px',
                  border: '1px solid rgba(26,46,30,0.05)',
                  boxShadow: '0 2px 12px rgba(26,46,30,0.07)',
                  marginBottom: '8px',
                }}
              >
                {/* Thumb shimmer */}
                <div style={{
                  width: '56px', height: '56px',
                  borderRadius: '12px',
                  background: 'rgba(26,46,30,0.07)',
                  flexShrink: 0,
                  animationName: 'shimmer',
                  animationDuration: '1.4s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDelay: `${i * 0.12}s`,
                }} />
                {/* Text shimmer */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{
                    height: '11px', borderRadius: '6px',
                    background: 'rgba(26,46,30,0.07)',
                    width: '60%',
                    animationName: 'shimmer',
                    animationDuration: '1.4s',
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                    animationDelay: `${i * 0.12}s`,
                  }} />
                  <div style={{
                    height: '10px', borderRadius: '6px',
                    background: 'rgba(26,46,30,0.05)',
                    width: '40%',
                    animationName: 'shimmer',
                    animationDuration: '1.4s',
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                    animationDelay: `${i * 0.12 + 0.07}s`,
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && cleanups.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            paddingTop: '60px',
          }}>
            <span style={{ fontSize: '52px', opacity: 0.4 }}>📷</span>
            <p style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              fontSize: '18px',
              color: '#1A2E1E',
              letterSpacing: '-0.02em',
              margin: 0,
            }}>
              No cleanups yet
            </p>
            <p style={{
              fontSize: '12px',
              color: 'rgba(26,46,30,0.45)',
              lineHeight: 1.5,
              maxWidth: '200px',
              textAlign: 'center',
              margin: 0,
            }}>
              Your cleaned wildlife photos will appear here after your first cleanup.
            </p>
            <button
              onClick={() => router.push('/home')}
              style={{
                marginTop: '4px',
                background: '#4A7C59',
                color: '#FAF5E8',
                border: 'none',
                borderRadius: '14px',
                padding: '13px 24px',
                fontFamily: "'Fraunces', serif",
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(74,124,89,0.25)',
              }}
            >
              Clean your first photo
            </button>
          </div>
        )}

        {/* Month groups + history items */}
        {!loading && cleanups.length > 0 && groups.map((group, gi) => (
          <div key={group.label}>
            {/* Month label */}
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(26,46,30,0.35)',
              margin: gi === 0 ? '0 0 6px' : '10px 0 6px',
            }}>
              {group.label}
            </p>

            {/* Items */}
            {group.items.map(c => {
              const thumbUrl = thumbnailUrls[c.id]
              return (
                <div
                  key={c.id}
                  onClick={() => handleOpen(c)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'white',
                    borderRadius: '16px',
                    padding: '10px',
                    border: '1px solid rgba(26,46,30,0.05)',
                    boxShadow: '0 2px 12px rgba(26,46,30,0.07)',
                    marginBottom: '8px',
                    cursor: 'pointer',
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: '56px', height: '56px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'rgba(26,46,30,0.07)',
                  }}>
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt="Cleaned photo"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        animationName: 'shimmer',
                        animationDuration: '1.4s',
                        animationTimingFunction: 'ease-in-out',
                        animationIterationCount: 'infinite',
                      }} />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: '0 0 3px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#1A2E1E',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {formatItemDate(c.created_at)}
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '10px',
                      color: 'rgba(26,46,30,0.4)',
                    }}>
                      Barriers removed
                    </p>
                  </div>

                  {/* Chevron */}
                  <div style={{
                    width: '24px', height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(26,46,30,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(26,46,30,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }
      `}</style>
    </main>
  )
}

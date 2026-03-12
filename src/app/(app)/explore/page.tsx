'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FeedCard {
  id: string
  output_url: string | null
  input_url: string | null
  venue_name: string | null
  created_at: string
  user_id: string
  first_name: string
  last_name: string | null
  output_signed_url: string | null
  input_signed_url: string | null
  like_count: number
  is_liked: boolean
  show_before: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function getInitials(firstName: string, lastName: string | null): string {
  const f = firstName?.charAt(0)?.toUpperCase() ?? ''
  const l = lastName?.charAt(0)?.toUpperCase() ?? ''
  return f + l || '?'
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ExplorePage() {
  const router = useRouter()
  const [cards, setCards] = useState<FeedCard[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set())
  const [showBeforeSet, setShowBeforeSet] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/signin'); return }
    setCurrentUserId(user.id)

    // Fetch public cleanups
    const { data: cleanupData } = await supabase
      .from('cleanups')
      .select('id, output_url, input_url, venue_name, created_at, user_id')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!cleanupData || cleanupData.length === 0) {
      setCards([])
      setLoading(false)
      return
    }

    // Fetch profiles for those user_ids
    const userIds = [...new Set(cleanupData.map(c => c.user_id))]
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds)

    const profileMap: Record<string, { first_name: string; last_name: string | null }> = {}
    profileData?.forEach(p => { profileMap[p.id] = p })

    // Fetch like counts and current user's likes
    const cleanupIds = cleanupData.map(c => c.id)
    const [{ data: allLikes }, { data: userLikes }] = await Promise.all([
      supabase.from('likes').select('cleanup_id').in('cleanup_id', cleanupIds),
      supabase.from('likes').select('cleanup_id').eq('user_id', user.id).in('cleanup_id', cleanupIds),
    ])

    const countMap: Record<string, number> = {}
    allLikes?.forEach(l => { countMap[l.cleanup_id] = (countMap[l.cleanup_id] ?? 0) + 1 })

    const userLikedIds = new Set(userLikes?.map(l => l.cleanup_id) ?? [])

    // Generate signed URLs in batch
    const outputPaths = cleanupData.map(c => c.output_url).filter(Boolean) as string[]
    const inputPaths  = cleanupData.map(c => c.input_url).filter(Boolean) as string[]

    const [outputSignedRes, inputSignedRes] = await Promise.all([
      outputPaths.length > 0
        ? supabase.storage.from('cleanups').createSignedUrls(outputPaths, 3600)
        : Promise.resolve({ data: [] }),
      inputPaths.length > 0
        ? supabase.storage.from('cleanups').createSignedUrls(inputPaths, 3600)
        : Promise.resolve({ data: [] }),
    ])

    const outputUrlMap: Record<string, string> = {}
    outputSignedRes.data?.forEach(s => { if (s.path && s.signedUrl) outputUrlMap[s.path] = s.signedUrl })

    const inputUrlMap: Record<string, string> = {}
    inputSignedRes.data?.forEach(s => { if (s.path && s.signedUrl) inputUrlMap[s.path] = s.signedUrl })

    const built: FeedCard[] = cleanupData.map(c => {
      const profile = profileMap[c.user_id]
      return {
        id:               c.id,
        output_url:       c.output_url,
        input_url:        c.input_url,
        venue_name:       c.venue_name,
        created_at:       c.created_at,
        user_id:          c.user_id,
        first_name:       profile?.first_name ?? 'Wildvuer',
        last_name:        profile?.last_name ?? null,
        output_signed_url: c.output_url ? (outputUrlMap[c.output_url] ?? null) : null,
        input_signed_url:  c.input_url  ? (inputUrlMap[c.input_url]   ?? null) : null,
        like_count:        countMap[c.id] ?? 0,
        is_liked:          userLikedIds.has(c.id),
        show_before:       false,
      }
    })

    setCards(built)
    setLikeCounts(Object.fromEntries(built.map(c => [c.id, c.like_count])))
    setLikedSet(new Set(built.filter(c => c.is_liked).map(c => c.id)))
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  const toggleLike = async (cardId: string) => {
    if (!currentUserId) return
    const supabase = createClient()
    const wasLiked = likedSet.has(cardId)

    // Optimistic update
    setLikedSet(prev => {
      const next = new Set(prev)
      wasLiked ? next.delete(cardId) : next.add(cardId)
      return next
    })
    setLikeCounts(prev => ({
      ...prev,
      [cardId]: (prev[cardId] ?? 0) + (wasLiked ? -1 : 1),
    }))

    try {
      if (wasLiked) {
        await supabase.from('likes').delete()
          .eq('user_id', currentUserId)
          .eq('cleanup_id', cardId)
      } else {
        await supabase.from('likes').insert({
          user_id:    currentUserId,
          cleanup_id: cardId,
        })
      }
    } catch (err) {
      // Revert optimistic update on error
      setLikedSet(prev => {
        const next = new Set(prev)
        wasLiked ? next.add(cardId) : next.delete(cardId)
        return next
      })
      setLikeCounts(prev => ({
        ...prev,
        [cardId]: (prev[cardId] ?? 0) + (wasLiked ? 1 : -1),
      }))
      console.error('Like toggle failed:', err)
    }
  }

  const togglePhoto = (cardId: string) => {
    setShowBeforeSet(prev => {
      const next = new Set(prev)
      next.has(cardId) ? next.delete(cardId) : next.add(cardId)
      return next
    })
  }

  const postCount = cards.length

  return (
    <div style={{
      height: 'calc(100vh - 72px)',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--sage)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      overflow: 'hidden',
    }}>

      {/* ------------------------------------------------------------------ */}
      {/* SAGE HEADER                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div style={{
        paddingTop: 'calc(52px + env(safe-area-inset-top))',
        paddingBottom: '20px',
        paddingLeft: '24px',
        paddingRight: '24px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}>
        <div>
          <span style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: '32px',
            letterSpacing: '-0.02em',
            color: 'var(--cream)',
            display: 'block',
          }}>
            Wild<em style={{ fontStyle: 'italic', fontWeight: 900, color: 'var(--gold)' }}>vue</em>
          </span>
          <span style={{
            fontSize: '13px',
            color: 'rgba(250,245,232,0.6)',
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}>
            Community sightings
          </span>
        </div>

        {/* Post count pill */}
        {!loading && (
          <div style={{
            background: 'rgba(250,245,232,0.12)',
            borderRadius: '100px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--cream)',
          }}>
            {postCount} {postCount === 1 ? 'post' : 'posts'}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CREAM FEED BODY                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div style={{
        flex: 1,
        background: '#FAF5E8',
        borderRadius: '22px 22px 0 0',
        overflowY: 'auto',
        padding: '16px 14px 12px',
      }}>

        {loading ? (
          // Skeleton
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                background: 'white',
                borderRadius: '18px',
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              }}>
                <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(74,124,89,0.1)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ width: '80px', height: '10px', background: 'rgba(26,46,30,0.07)', borderRadius: '4px', marginBottom: '6px' }} />
                    <div style={{ width: '120px', height: '8px', background: 'rgba(26,46,30,0.05)', borderRadius: '4px' }} />
                  </div>
                </div>
                <div style={{ background: 'rgba(26,46,30,0.06)', aspectRatio: '4/3' }} />
                <div style={{ padding: '10px 14px' }}>
                  <div style={{ width: '48px', height: '24px', background: 'rgba(26,46,30,0.06)', borderRadius: '100px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : cards.length === 0 ? (
          // Empty state
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 24px',
            gap: '10px',
          }}>
            <span style={{ fontSize: '48px' }}>🔎</span>
            <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '18px', color: '#1A2E1E', margin: 0, textAlign: 'center' }}>
              No sightings yet
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(26,46,30,0.45)', margin: 0, textAlign: 'center' }}>
              Be the first to post
            </p>
          </div>
        ) : (
          // Feed
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {cards.map(card => {
              const showBefore = showBeforeSet.has(card.id)
              const isLiked    = likedSet.has(card.id)
              const count      = likeCounts[card.id] ?? 0
              const initials   = getInitials(card.first_name, card.last_name)
              const photoUrl   = showBefore ? card.input_signed_url : card.output_signed_url

              return (
                <div
                  key={card.id}
                  style={{
                    background: 'white',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Card header */}
                  <div style={{
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--sage)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 700,
                        fontSize: '13px',
                        color: 'var(--cream)',
                      }}>
                        {initials}
                      </span>
                    </div>

                    {/* Name + venue + time */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '13px',
                          color: '#1A2E1E',
                        }}>
                          {card.first_name}
                        </span>
                        {card.venue_name && (
                          <>
                            <span style={{ fontSize: '12px', color: 'rgba(26,46,30,0.4)' }}>·</span>
                            <span style={{ fontSize: '12px' }}>📍</span>
                            <span style={{
                              fontSize: '12px',
                              color: 'rgba(26,46,30,0.55)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {card.venue_name}
                            </span>
                          </>
                        )}
                      </div>
                      <span style={{
                        fontSize: '11px',
                        color: 'rgba(26,46,30,0.35)',
                      }}>
                        {timeAgo(card.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Photo area */}
                  <div
                    onClick={() => togglePhoto(card.id)}
                    style={{
                      position: 'relative',
                      aspectRatio: '4/3',
                      overflow: 'hidden',
                      background: 'rgba(26,46,30,0.06)',
                      cursor: 'pointer',
                    }}
                  >
                    {/* After image */}
                    <img
                      src={card.output_signed_url ?? ''}
                      alt="After"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: showBefore ? 0 : 1,
                        transition: 'opacity 0.45s ease',
                      }}
                    />
                    {/* Before image */}
                    <img
                      src={card.input_signed_url ?? ''}
                      alt="Before"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: showBefore ? 1 : 0,
                        transition: 'opacity 0.45s ease',
                      }}
                    />

                    {/* ✓ Barriers removed badge — top right */}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'var(--sage)',
                      borderRadius: '100px',
                      padding: '4px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      opacity: showBefore ? 0 : 1,
                      transition: 'opacity 0.45s ease',
                      pointerEvents: 'none',
                    }}>
                      <span style={{ color: '#7DB88C', fontSize: '10px', fontWeight: 700 }}>✓</span>
                      <span style={{
                        color: 'var(--cream)',
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}>
                        Barriers removed
                      </span>
                    </div>
                  </div>

                  {/* Card footer — like button */}
                  <div style={{
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <button
                      onClick={() => toggleLike(card.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '100px',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={isLiked ? '#e05c5c' : 'none'}
                        stroke={isLiked ? '#e05c5c' : 'rgba(26,46,30,0.35)'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ transition: 'fill 0.15s ease, stroke 0.15s ease' }}
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: isLiked ? '#e05c5c' : 'rgba(26,46,30,0.35)',
                        transition: 'color 0.15s ease',
                      }}>
                        {count > 0 ? count : ''}
                      </span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

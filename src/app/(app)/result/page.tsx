'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Watermark — draws "Made with Wildvue" pill onto the cleaned image blob.
// Returns the watermarked blob; falls back to the original on any failure.
// ---------------------------------------------------------------------------
async function applyWatermark(sourceUrl: string): Promise<Blob> {
  await document.fonts.ready

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width  = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('No 2d context')); return }

      ctx.drawImage(img, 0, 0)

      const fontSize   = Math.round(canvas.width * 0.026)
      const padX       = Math.round(fontSize * 1.2)
      const padY       = Math.round(fontSize * 0.5)
      const bottomGap  = Math.round(canvas.height * 0.016)

      ctx.font = `italic bold ${fontSize}px 'Fraunces', serif`
      const textW    = ctx.measureText('Made with Wildvue').width
      const pillW    = textW + padX * 2
      const pillH    = fontSize + padY * 2
      const pillX    = (canvas.width - pillW) / 2
      const pillY    = canvas.height - pillH - bottomGap
      const radius   = pillH / 2

      ctx.beginPath()
      ctx.roundRect(pillX, pillY, pillW, pillH, radius)
      ctx.fillStyle = 'rgba(26,46,30,0.5)'
      ctx.fill()

      ctx.strokeStyle = 'rgba(232,213,163,0.2)'
      ctx.lineWidth   = Math.max(1, Math.round(canvas.width * 0.001))
      ctx.stroke()

      ctx.fillStyle    = '#FAF5E8'
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Made with Wildvue', canvas.width / 2, pillY + pillH / 2)

      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('toBlob failed')),
        'image/jpeg',
        0.95,
      )
    }

    img.onerror = reject
    img.src = sourceUrl
  })
}

async function getExportBlob(resultUrl: string, isPro: boolean): Promise<Blob> {
  const rawRes  = await fetch(resultUrl)
  const rawBlob = await rawRes.blob()

  if (isPro) return rawBlob

  try {
    return await applyWatermark(resultUrl)
  } catch {
    return rawBlob
  }
}

// ---------------------------------------------------------------------------
// Inner page component
// ---------------------------------------------------------------------------
function ResultPageContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [originalUrl,  setOriginalUrl]  = useState<string | null>(null)
  const [resultUrl,    setResultUrl]    = useState<string | null>(null)
  const [isAfter,      setIsAfter]      = useState(true)
  const [saved,        setSaved]        = useState(false)
  const [isPro,        setIsPro]        = useState(false)
  const [cleanupId,    setCleanupId]    = useState<string | null>(null)
  const [venueName,    setVenueName]    = useState('')
  const [isPosted,     setIsPosted]     = useState(false)
  const [isPosting,    setIsPosting]    = useState(false)

  useEffect(() => {
    const fromHistory = searchParams.get('from') === 'history'
    const idParam     = searchParams.get('id')

    if (fromHistory && idParam) {
      const load = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/signin'); return }

        const { data: cleanup } = await supabase
          .from('cleanups')
          .select('input_url, output_url')
          .eq('id', idParam)
          .eq('user_id', user.id)
          .single()

        if (!cleanup?.input_url || !cleanup?.output_url) {
          router.push('/history')
          return
        }

        const [inputSigned, outputSigned] = await Promise.all([
          supabase.storage.from('cleanups').createSignedUrl(cleanup.input_url,  3600),
          supabase.storage.from('cleanups').createSignedUrl(cleanup.output_url, 3600),
        ])

        if (inputSigned.error)  console.error('Signed URL (input) error:',  inputSigned.error)
        if (outputSigned.error) console.error('Signed URL (output) error:', outputSigned.error)

        setOriginalUrl(inputSigned.data?.signedUrl  ?? null)
        setResultUrl(outputSigned.data?.signedUrl   ?? null)
        setCleanupId(idParam)

        const cached = sessionStorage.getItem('wildvue_is_pro')
        if (cached !== null) {
          setIsPro(cached === 'true')
        } else {
          const { data: credits } = await supabase
            .from('credits')
            .select('is_pro')
            .eq('user_id', user.id)
            .single()
          if (credits) setIsPro(credits.is_pro)
        }
      }
      load()
    } else {
      const original = sessionStorage.getItem('wildvue_selected_image')
      const result   = sessionStorage.getItem('wildvue_result_image')
      if (!original || !result) { router.push('/home'); return }
      setOriginalUrl(original)
      setResultUrl(result)

      const storedCleanupId = sessionStorage.getItem('wildvue_cleanup_id')
      if (storedCleanupId) setCleanupId(storedCleanupId)

      const cached = sessionStorage.getItem('wildvue_is_pro')
      if (cached !== null) {
        setIsPro(cached === 'true')
      } else {
        const loadPro = async () => {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          const { data } = await supabase
            .from('credits')
            .select('is_pro')
            .eq('user_id', user.id)
            .single()
          if (data) setIsPro(data.is_pro)
        }
        loadPro()
      }
    }
  }, [router, searchParams])

  const handleSave = async () => {
    if (!resultUrl) return
    try {
      const blob = await getExportBlob(resultUrl, isPro)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `wildvue-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      const a    = document.createElement('a')
      a.href     = resultUrl
      a.download = `wildvue-${Date.now()}.jpg`
      a.click()
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  const handleShare = async () => {
    if (!resultUrl) return
    try {
      const blob = await getExportBlob(resultUrl, isPro)
      const file = new File([blob], 'wildvue.jpg', { type: blob.type })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Wildvue — barrier-free wildlife photo' })
      } else {
        await handleSave()
      }
    } catch { /* user cancelled or share unsupported */ }
  }

  const handleCleanAnother = () => {
    const input    = document.createElement('input')
    input.type     = 'file'
    input.accept   = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader   = new FileReader()
      reader.onload  = () => {
        sessionStorage.setItem('wildvue_selected_image', reader.result as string)
        router.push('/confirm')
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const handlePost = async () => {
    if (!cleanupId || isPosted || isPosting) return
    setIsPosting(true)
    try {
      const supabase = createClient()
      await supabase
        .from('cleanups')
        .update({ is_public: true, venue_name: venueName.trim() || null })
        .eq('id', cleanupId)
      setIsPosted(true)
    } catch (err) {
      console.error('Post failed:', err)
    } finally {
      setIsPosting(false)
    }
  }

  if (!originalUrl || !resultUrl) return null

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: 'calc(100vh - 72px)',
      overflow: 'hidden',
      background: '#1A2E1E',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      {/* ------------------------------------------------------------------ */}
      {/* PHOTO SECTION — fills all space above the cream card               */}
      {/* ------------------------------------------------------------------ */}
      <div style={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        background: '#1A2E1E',
      }}>
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

        {/* Wordmark + barriers removed badge — top of photo area */}
        <div style={{
          position: 'absolute',
          top: 16,
          left: 0,
          right: 0,
          zIndex: 20,
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}>
          {/* Wordmark */}
          <span style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: '26px',
            letterSpacing: '-0.02em',
            color: 'white',
            textShadow: '0 1px 8px rgba(0,0,0,0.55)',
          }}>
            Wild<em style={{ fontStyle: 'italic', fontWeight: 900, color: '#E8D5A3' }}>vue</em>
          </span>

          {/* Barriers removed pill — only on After */}
          <div style={{
            opacity: isAfter ? 1 : 0,
            transition: 'opacity 0.45s ease',
            background: 'rgba(26,46,30,0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: '100px',
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}>
            <span style={{ color: '#7DB88C', fontSize: '11px', fontWeight: 700 }}>✓</span>
            <span style={{
              color: 'var(--cream)',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '0.01em',
            }}>
              Barriers removed
            </span>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CREAM CARD — fixed bottom sheet, natural height only               */}
      {/* ------------------------------------------------------------------ */}
        {/* Cream card */}
        <div style={{
          flex: '0 0 auto',
          position: 'relative',
          zIndex: 2,
          background: '#FAF5E8',
          borderRadius: '22px 22px 0 0',
          boxShadow: '0 -6px 24px rgba(0,0,0,0.14)',
          padding: '12px 16px 16px',
          marginTop: '-22px',
        }}>
          {/* Before / After toggle pill — floats above card top edge */}
          <div style={{
            position: 'absolute',
            top: '-34px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              pointerEvents: 'auto',
              background: 'rgba(26,46,30,0.55)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '100px',
              padding: '3px',
              display: 'flex',
              gap: '2px',
            }}>
              {(['Before', 'After'] as const).map(label => {
                const active = (label === 'After') === isAfter
                return (
                  <button
                    key={label}
                    onClick={() => setIsAfter(label === 'After')}
                    style={{
                      background: active ? 'var(--cream)' : 'transparent',
                      color: active ? '#1A2E1E' : 'rgba(250,245,232,0.6)',
                      border: 'none',
                      borderRadius: '100px',
                      padding: '5px 16px',
                      fontSize: '11px',
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

          {/* Title */}
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: '18px',
            color: '#1A2E1E',
            margin: '0 0 8px',
            letterSpacing: '-0.01em',
          }}>
            Barrier <em style={{ fontStyle: 'italic', color: '#C4A35A' }}>free.</em> 🪄
          </h2>

          {/* Primary action row — Save + Share */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button
              onClick={handleSave}
              style={{
                flex: 2,
                padding: '10px 14px',
                borderRadius: '12px',
                border: 'none',
                background: saved ? '#3a6347' : '#4A7C59',
                color: '#FAF5E8',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: "'Fraunces', serif",
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(74,124,89,0.25)',
                transition: 'background 0.3s ease',
              }}
            >
              {saved ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FAF5E8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Saved!
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FAF5E8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Save
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              style={{
                flex: 1,
                padding: '10px 10px',
                borderRadius: '12px',
                border: '1.5px solid rgba(74,124,89,0.25)',
                background: 'rgba(74,124,89,0.04)',
                color: 'var(--sage)',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: "'Fraunces', serif",
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share
            </button>
          </div>

          {/* Community card */}
          {!isPosted ? (
            <div style={{
              background: 'rgba(74,124,89,0.08)',
              border: '1px solid rgba(74,124,89,0.18)',
              borderRadius: '14px',
              padding: '9px 12px',
              marginBottom: '8px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '7px',
                gap: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '17px', flexShrink: 0 }}>🔎</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontWeight: 700,
                      color: '#1A2E1E',
                      fontSize: '12px',
                      margin: 0,
                      lineHeight: 1.3,
                    }}>
                      Share to the Wildvue community?
                    </p>
                    <p style={{
                      color: 'rgba(26,46,30,0.5)',
                      fontSize: '10px',
                      margin: '1px 0 0',
                    }}>
                      Inspire other wildlife lovers
                    </p>
                  </div>
                </div>
                <button
                  onClick={handlePost}
                  disabled={!cleanupId || isPosting}
                  style={{
                    background: cleanupId ? '#C4A35A' : 'rgba(196,163,90,0.4)',
                    color: '#FAF5E8',
                    fontWeight: 700,
                    borderRadius: '20px',
                    padding: '6px 13px',
                    border: 'none',
                    cursor: cleanupId && !isPosting ? 'pointer' : 'not-allowed',
                    fontSize: '11px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    flexShrink: 0,
                    transition: 'opacity 0.15s ease',
                    opacity: isPosting ? 0.7 : 1,
                  }}
                >
                  {isPosting ? '…' : 'Post it'}
                </button>
              </div>

              <input
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="📍 Where was this? (optional)"
                style={{
                  width: '100%',
                  background: 'rgba(26,46,30,0.05)',
                  border: '1px solid rgba(26,46,30,0.1)',
                  borderRadius: '8px',
                  padding: '7px 10px',
                  fontSize: '11px',
                  color: '#1A2E1E',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
          ) : (
            <div style={{
              background: 'rgba(74,124,89,0.08)',
              border: '1px solid rgba(74,124,89,0.18)',
              borderRadius: '14px',
              padding: '9px 12px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '17px' }}>✅</span>
              <div>
                <p style={{ fontWeight: 700, color: '#4A7C59', fontSize: '12px', margin: 0 }}>Posted to the community!</p>
                <p style={{ color: 'rgba(26,46,30,0.5)', fontSize: '10px', margin: '1px 0 0' }}>Your photo is now on the Explore feed</p>
              </div>
            </div>
          )}

          {/* Clean another link */}
          <p
            onClick={handleCleanAnother}
            style={{
              textAlign: 'center',
              fontSize: '11px',
              color: 'rgba(26,46,30,0.35)',
              cursor: 'pointer',
              margin: 0,
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
            }}
          >
            Clean another →
          </p>
        </div>
    </main>
  )
}

export default function ResultPage() {
  return (
    <Suspense>
      <ResultPageContent />
    </Suspense>
  )
}

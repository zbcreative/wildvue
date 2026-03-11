'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Plan = 'monthly' | 'yearly' | 'pack'

interface LabelProps {
  text: string
  bg: string
  color: string
}

interface PlanRowProps {
  emoji: string
  name: string
  perks: string[]
  price: string
  period: string
  selected: boolean
  onSelect: () => void
  border: string
  label?: LabelProps
}

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <div style={{
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      border: selected ? '2px solid var(--sage)' : '1.5px solid rgba(26,46,30,0.15)',
      background: selected ? 'var(--sage)' : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 0.15s ease',
    }}>
      {selected && (
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'white',
        }} />
      )}
    </div>
  )
}

function PlanRow({ emoji, name, perks, price, period, selected, onSelect, border, label }: PlanRowProps) {
  return (
    <div
      onClick={onSelect}
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '18px',
        position: 'relative',
        border,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'border-color 0.15s ease',
      }}
    >
      {label && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '16px',
          background: label.bg,
          color: label.color,
          fontSize: '9px',
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: '100px',
          letterSpacing: '0.06em',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          {label.text}
        </div>
      )}

      <div style={{ fontSize: '26px', lineHeight: 1, flexShrink: 0 }}>{emoji}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 700,
          fontSize: '15px',
          color: '#1A2E1E',
          marginBottom: '3px',
        }}>
          {name}
        </div>
        {perks.map((perk, i) => (
          <div key={i} style={{
            fontSize: '11px',
            color: 'rgba(26,46,30,0.5)',
            lineHeight: 1.5,
          }}>
            {perk}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <div style={{ textAlign: 'right', paddingTop: '6px' }}>
          <div style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: '18px',
            color: '#1A2E1E',
          }}>
            {price}
          </div>
          <div style={{
            fontSize: '10px',
            color: 'rgba(26,46,30,0.5)',
            marginTop: '2px',
          }}>
            {period}
          </div>
        </div>
        <RadioDot selected={selected} />
      </div>
    </div>
  )
}

export default function UpgradePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<Plan>('yearly')

  const ctaText: Record<Plan, string> = {
    yearly: 'Get Pro Yearly 🪄',
    monthly: 'Get Pro Monthly 🪄',
    pack: 'Get 5-Pack 🪄',
  }

  const handlePurchase = () => {
    console.log('Purchase plan:', selected)
  }

  const handleRestore = () => {
    console.log('Restore purchases')
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--sage)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      zIndex: 50,
      overflowY: 'auto',
    }}>

      {/* SAGE TOP ZONE */}
      <div style={{
        minHeight: '280px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'relative',
        padding: '60px 24px 36px',
        flexShrink: 0,
      }}>
        {/* Close button */}
        <button
          onClick={() => router.back()}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 'calc(16px + env(safe-area-inset-top))',
            right: '16px',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'rgba(250,245,232,0.12)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cream)',
            fontSize: '15px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        <div style={{ fontSize: '44px', lineHeight: 1, marginBottom: '6px' }}>🌿</div>

        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 700,
          fontSize: '24px',
          color: 'var(--cream)',
          textAlign: 'center',
          lineHeight: 1.3,
          margin: '6px 0',
        }}>
          Go further into the<br />
          <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>wild.</em>
        </h1>

        <p style={{
          fontSize: '13px',
          color: 'rgba(250,245,232,0.55)',
          textAlign: 'center',
          maxWidth: '240px',
          margin: '6px 0 0 0',
          lineHeight: 1.55,
        }}>
          Unlock unlimited cleanups and share barrier-free photos every time.
        </p>
      </div>

      {/* CREAM SHEET */}
      <div style={{
        background: 'var(--cream)',
        borderRadius: '22px 22px 0 0',
        padding: '28px 20px 36px',
        flexShrink: 0,
      }}>

        {/* Pro Monthly */}
        <PlanRow
          emoji="⭐"
          name="Pro Monthly"
          perks={['No ads · No watermark', 'Unlimited cleanups']}
          price="$4.99"
          period="per month"
          selected={selected === 'monthly'}
          onSelect={() => setSelected('monthly')}
          border="1.5px solid rgba(26,46,30,0.07)"
        />

        {/* Pro Yearly — featured */}
        <PlanRow
          emoji="🌿"
          name="Pro Yearly"
          perks={['No ads · No watermark', 'Unlimited cleanups']}
          price="$29.99"
          period="per year"
          selected={selected === 'yearly'}
          onSelect={() => setSelected('yearly')}
          border="1.5px solid var(--sage)"
          label={{ text: 'BEST VALUE', bg: 'var(--sage)', color: 'var(--cream)' }}
        />

        {/* 5-Pack */}
        <PlanRow
          emoji="📦"
          name="5-Pack"
          perks={['5 barrier-free cleanups']}
          price="$3.99"
          period="one time"
          selected={selected === 'pack'}
          onSelect={() => setSelected('pack')}
          border="1.5px solid #1A2E1E"
          label={{ text: 'ONE-TIME', bg: '#1A2E1E', color: 'var(--cream)' }}
        />

        {/* CTA */}
        <button
          onClick={handlePurchase}
          style={{
            width: '100%',
            background: 'var(--sage)',
            color: 'var(--cream)',
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: '16px',
            border: 'none',
            borderRadius: '16px',
            padding: '16px 18px',
            boxShadow: '0 6px 18px rgba(74,124,89,0.25)',
            marginBottom: '14px',
            cursor: 'pointer',
          }}
        >
          {ctaText[selected]}
        </button>

        {/* Restore purchases */}
        <p
          onClick={handleRestore}
          style={{
            textAlign: 'center',
            fontSize: '11px',
            color: 'rgba(26,46,30,0.35)',
            textDecoration: 'underline',
            cursor: 'pointer',
            margin: 0,
          }}
        >
          Restore purchases
        </p>
      </div>
    </div>
  )
}

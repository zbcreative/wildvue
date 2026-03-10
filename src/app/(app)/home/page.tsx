'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const ANIMAL_DATA = [
  {
    emoji: '🦁',
    fact: 'Lions are the only cats that live in groups, called prides.',
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-lion" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C8620A"/>
            <stop offset="60%" stopColor="#E8952A"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-lion)"/>
        <circle cx="320" cy="60" r="32" fill="#FFD97A" opacity="0.9"/>
        <circle cx="320" cy="60" r="44" fill="#FFD97A" opacity="0.15"/>
        <ellipse cx="200" cy="260" rx="220" ry="40" fill="#6B3A0A" opacity="0.6"/>
        <ellipse cx="200" cy="270" rx="220" ry="35" fill="#3D1F05" opacity="0.8"/>
        {/* Acacia trees */}
        <rect x="40" y="180" width="6" height="60" fill="#2A1505" opacity="0.8"/>
        <ellipse cx="43" cy="175" rx="28" ry="12" fill="#1A3A0A" opacity="0.85"/>
        <rect x="300" y="195" width="5" height="50" fill="#2A1505" opacity="0.8"/>
        <ellipse cx="303" cy="190" rx="22" ry="10" fill="#1A3A0A" opacity="0.85"/>
        <rect x="150" y="200" width="4" height="45" fill="#2A1505" opacity="0.7"/>
        <ellipse cx="152" cy="196" rx="18" ry="8" fill="#1A3A0A" opacity="0.75"/>
        {/* Grass */}
        {[20,50,80,110,140,170,200,230,260,290,320,350,380].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="290" x2={x-4} y2="268" stroke="#4A2A05" strokeWidth="2" opacity="0.7"/>
            <line x1={x+5} y1="290" x2={x+9} y2="265" stroke="#4A2A05" strokeWidth="2" opacity="0.7"/>
            <line x1={x+10} y1="290" x2={x+7} y2="272" stroke="#3A2005" strokeWidth="2" opacity="0.6"/>
          </g>
        ))}
        <rect width="400" height="340" fill="linear-gradient(to bottom, transparent 60%, #0C1A0F 100%)" opacity="0"/>
        <rect y="240" width="400" height="100" fill="#0C1A0F" opacity="0.7"/>
      </svg>
    )
  },
  {
    emoji: '🐆',
    fact: 'Leopards can carry prey twice their body weight up into trees.',
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-leopard" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#051A08"/>
            <stop offset="50%" stopColor="#0A2A10"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-leopard)"/>
        {/* Canopy layers */}
        <ellipse cx="80" cy="40" rx="100" ry="60" fill="#0D3A15" opacity="0.9"/>
        <ellipse cx="250" cy="20" rx="130" ry="70" fill="#0A3010" opacity="0.85"/>
        <ellipse cx="380" cy="50" rx="90" ry="55" fill="#0D3A15" opacity="0.9"/>
        <ellipse cx="160" cy="60" rx="80" ry="45" fill="#082808" opacity="0.8"/>
        {/* Light rays */}
        <line x1="180" y1="0" x2="140" y2="340" stroke="#4A8A30" strokeWidth="18" opacity="0.04"/>
        <line x1="240" y1="0" x2="200" y2="340" stroke="#4A8A30" strokeWidth="12" opacity="0.03"/>
        <line x1="300" y1="0" x2="270" y2="340" stroke="#4A8A30" strokeWidth="8" opacity="0.04"/>
        {/* Vines */}
        <path d="M100 0 Q90 80 110 160 Q95 240 105 340" stroke="#1A4A10" strokeWidth="3" fill="none" opacity="0.6"/>
        <path d="M280 0 Q270 100 290 200 Q275 270 285 340" stroke="#1A4A10" strokeWidth="2.5" fill="none" opacity="0.5"/>
        {/* Ferns at bottom */}
        <ellipse cx="60" cy="300" rx="55" ry="25" fill="#0D3010" opacity="0.8"/>
        <ellipse cx="340" cy="310" rx="60" ry="22" fill="#0D3010" opacity="0.8"/>
        <ellipse cx="200" cy="320" rx="80" ry="20" fill="#082808" opacity="0.7"/>
        <rect y="280" width="400" height="60" fill="#0C1A0F" opacity="0.75"/>
      </svg>
    )
  },
  {
    emoji: '🦒',
    fact: "A giraffe's tongue is 18 inches long and dark purple to prevent sunburn.",
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-giraffe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C84A10"/>
            <stop offset="40%" stopColor="#E8702A"/>
            <stop offset="70%" stopColor="#F0A050"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-giraffe)"/>
        {/* Clouds */}
        <ellipse cx="100" cy="80" rx="60" ry="20" fill="#F0C080" opacity="0.25"/>
        <ellipse cx="300" cy="60" rx="50" ry="16" fill="#F0C080" opacity="0.2"/>
        {/* Horizon hills */}
        <ellipse cx="100" cy="240" rx="160" ry="50" fill="#5A2A08" opacity="0.7"/>
        <ellipse cx="320" cy="250" rx="140" ry="45" fill="#4A2005" opacity="0.7"/>
        {/* Scattered flat-top trees */}
        <rect x="60" y="175" width="5" height="55" fill="#2A1205"/>
        <ellipse cx="62" cy="170" rx="30" ry="10" fill="#1A3008" opacity="0.9"/>
        <rect x="290" y="185" width="5" height="50" fill="#2A1205"/>
        <ellipse cx="293" cy="180" rx="25" ry="9" fill="#1A3008" opacity="0.9"/>
        <rect x="175" y="195" width="4" height="40" fill="#2A1205"/>
        <ellipse cx="177" cy="191" rx="20" ry="8" fill="#1A3008" opacity="0.85"/>
        <rect y="270" width="400" height="70" fill="#0C1A0F" opacity="0.8"/>
      </svg>
    )
  },
  {
    emoji: '🐘',
    fact: "Elephants are the only animals that can't jump, and they don't need to.",
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-elephant" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8A5A3A"/>
            <stop offset="50%" stopColor="#B87A50"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-elephant)"/>
        {/* Dust haze */}
        <ellipse cx="200" cy="220" rx="250" ry="60" fill="#C8906A" opacity="0.15"/>
        <ellipse cx="200" cy="240" rx="250" ry="50" fill="#A87050" opacity="0.12"/>
        {/* Watering hole */}
        <ellipse cx="200" cy="270" rx="100" ry="22" fill="#4A6A7A" opacity="0.6"/>
        <ellipse cx="200" cy="270" rx="95" ry="18" fill="#3A5A6A" opacity="0.5"/>
        {/* Dusty ground */}
        <ellipse cx="200" cy="290" rx="220" ry="35" fill="#5A3A18" opacity="0.8"/>
        {/* Distant mountains */}
        <polygon points="0,220 80,160 160,220" fill="#6A4020" opacity="0.5"/>
        <polygon points="120,220 220,140 320,220" fill="#7A4A28" opacity="0.4"/>
        <polygon points="280,220 360,155 440,220" fill="#6A4020" opacity="0.5"/>
        <rect y="270" width="400" height="70" fill="#0C1A0F" opacity="0.8"/>
      </svg>
    )
  },
  {
    emoji: '🦏',
    fact: "A rhino's horn is made of keratin, the same material as your fingernails.",
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-rhino" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3A3A30"/>
            <stop offset="50%" stopColor="#5A5A48"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-rhino)"/>
        {/* River bank */}
        <path d="M0 230 Q100 210 200 225 Q300 240 400 220 L400 340 L0 340Z" fill="#4A3A20" opacity="0.8"/>
        {/* Water */}
        <path d="M0 245 Q100 235 200 242 Q300 250 400 240 L400 280 Q300 270 200 262 Q100 255 0 265Z" fill="#3A5A4A" opacity="0.7"/>
        {/* Reeds */}
        {[30,60,90,310,340,370].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="290" x2={x+3} y2="210" stroke="#4A5A20" strokeWidth="2.5" opacity="0.8"/>
            <ellipse cx={x+3} cy="207" rx="4" ry="10" fill="#5A4A10" opacity="0.7"/>
          </g>
        ))}
        <rect y="280" width="400" height="60" fill="#0C1A0F" opacity="0.8"/>
      </svg>
    )
  },
  {
    emoji: '🐊',
    fact: 'Crocodiles have the strongest bite force of any animal on Earth.',
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-croc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#051A08"/>
            <stop offset="40%" stopColor="#082A10"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-croc)"/>
        {/* Murky water */}
        <rect x="0" y="220" width="400" height="120" fill="#0A2A18" opacity="0.8"/>
        {/* Lily pads */}
        <ellipse cx="80" cy="255" rx="28" ry="12" fill="#1A4A15" opacity="0.9"/>
        <ellipse cx="300" cy="265" rx="22" ry="10" fill="#1A4A15" opacity="0.9"/>
        <ellipse cx="180" cy="275" rx="18" ry="8" fill="#1A4A15" opacity="0.85"/>
        <circle cx="82" cy="252" r="4" fill="#E84A6A" opacity="0.8"/>
        {/* Mangrove roots */}
        <path d="M20 0 Q10 100 30 200 Q15 240 25 290" stroke="#1A2A10" strokeWidth="8" fill="none" opacity="0.7"/>
        <path d="M380 0 Q390 120 370 210 Q385 250 375 290" stroke="#1A2A10" strokeWidth="7" fill="none" opacity="0.7"/>
        <path d="M10 150 Q40 180 20 220" stroke="#1A2A10" strokeWidth="5" fill="none" opacity="0.6"/>
        <path d="M390 140 Q360 175 380 215" stroke="#1A2A10" strokeWidth="5" fill="none" opacity="0.6"/>
        {/* Fog */}
        <ellipse cx="200" cy="220" rx="220" ry="30" fill="#0A3A20" opacity="0.3"/>
        <rect y="275" width="400" height="65" fill="#0C1A0F" opacity="0.85"/>
      </svg>
    )
  },
  {
    emoji: '🦅',
    fact: 'Eagles can spot a rabbit from nearly two miles away.',
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-eagle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#071828"/>
            <stop offset="40%" stopColor="#0E2A48"/>
            <stop offset="70%" stopColor="#1A4A6A"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-eagle)"/>
        {/* Stars */}
        {[30,70,120,180,240,290,350,50,160,310,90,270].map((x, i) => (
          <circle key={i} cx={x} cy={[20,45,15,35,25,50,18,60,40,30,55,22][i]} r="1.2" fill="white" opacity="0.7"/>
        ))}
        {/* Clouds */}
        <ellipse cx="120" cy="100" rx="70" ry="22" fill="#1A3A5A" opacity="0.5"/>
        <ellipse cx="300" cy="130" rx="60" ry="18" fill="#1A3A5A" opacity="0.4"/>
        {/* Mountain peaks */}
        <polygon points="0,280 70,160 140,280" fill="#0A1A28" opacity="0.9"/>
        <polygon points="80,280 170,130 260,280" fill="#0C2030" opacity="0.85"/>
        <polygon points="200,280 300,145 400,280" fill="#0A1A28" opacity="0.9"/>
        <polygon points="300,280 370,170 440,280" fill="#0C2030" opacity="0.8"/>
        {/* Snow caps */}
        <polygon points="70,160 85,185 55,185" fill="white" opacity="0.3"/>
        <polygon points="170,130 185,160 155,160" fill="white" opacity="0.3"/>
        <polygon points="300,145 315,172 285,172" fill="white" opacity="0.3"/>
        <rect y="265" width="400" height="75" fill="#0C1A0F" opacity="0.85"/>
      </svg>
    )
  },
  {
    emoji: '🐧',
    fact: 'Penguins propose to their mates with a pebble and stay together for life.',
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-penguin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#080E18"/>
            <stop offset="30%" stopColor="#0E1A2E"/>
            <stop offset="60%" stopColor="#1A2A3A"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-penguin)"/>
        {/* Aurora borealis */}
        <path d="M0 80 Q100 60 200 90 Q300 120 400 80" stroke="#00FF88" strokeWidth="20" fill="none" opacity="0.06"/>
        <path d="M0 100 Q100 75 200 110 Q300 145 400 100" stroke="#00CCFF" strokeWidth="15" fill="none" opacity="0.07"/>
        <path d="M0 120 Q100 95 200 125 Q300 155 400 115" stroke="#8844FF" strokeWidth="10" fill="none" opacity="0.06"/>
        {/* Icebergs */}
        <polygon points="30,230 60,180 90,230" fill="#C8E8F8" opacity="0.3"/>
        <polygon points="320,225 360,170 400,225" fill="#C8E8F8" opacity="0.25"/>
        <polygon points="150,240 185,195 220,240" fill="#B8D8E8" opacity="0.2"/>
        {/* Ice/water */}
        <rect x="0" y="255" width="400" height="85" fill="#0A1A2A" opacity="0.8"/>
        <ellipse cx="200" cy="256" rx="220" ry="12" fill="#1A3A5A" opacity="0.4"/>
        {/* Snow ground */}
        <ellipse cx="200" cy="260" rx="230" ry="20" fill="#C8E0F0" opacity="0.15"/>
        <rect y="270" width="400" height="70" fill="#0C1A0F" opacity="0.8"/>
      </svg>
    )
  },
  {
    emoji: '🦈',
    fact: "Sharks are older than trees, having existed for over 450 million years.",
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-shark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#030810"/>
            <stop offset="40%" stopColor="#060E1E"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-shark)"/>
        {/* Light caustics from above */}
        <ellipse cx="150" cy="80" rx="40" ry="15" fill="#1A4A6A" opacity="0.15"/>
        <ellipse cx="280" cy="60" rx="30" ry="10" fill="#1A4A6A" opacity="0.12"/>
        <ellipse cx="200" cy="100" rx="50" ry="12" fill="#1A5A7A" opacity="0.1"/>
        {/* Bubbles */}
        {[80,130,200,260,320].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={[60,90,50,80,65][i]} r="3" fill="none" stroke="#2A6A9A" strokeWidth="1" opacity="0.4"/>
            <circle cx={x+15} cy={[80,110,75,100,90][i]} r="2" fill="none" stroke="#2A6A9A" strokeWidth="1" opacity="0.3"/>
          </g>
        ))}
        {/* Kelp */}
        <path d="M40 340 Q50 280 35 220 Q48 160 38 100" stroke="#0A3A18" strokeWidth="6" fill="none" opacity="0.7"/>
        <path d="M360 340 Q350 270 365 210 Q352 150 362 90" stroke="#0A3A18" strokeWidth="5" fill="none" opacity="0.7"/>
        <path d="M80 340 Q95 290 80 240 Q92 195 82 150" stroke="#0A3A18" strokeWidth="4" fill="none" opacity="0.5"/>
        {/* Deep darkness at bottom */}
        <rect y="260" width="400" height="80" fill="#030810" opacity="0.85"/>
        <rect y="290" width="400" height="50" fill="#0C1A0F" opacity="0.9"/>
      </svg>
    )
  },
  {
    emoji: '🐬',
    fact: 'Dolphins have names for each other and call out to specific individuals.',
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-dolphin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A3A5A"/>
            <stop offset="40%" stopColor="#1A6A8A"/>
            <stop offset="70%" stopColor="#2A8AAA"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-dolphin)"/>
        {/* Sun rays */}
        <circle cx="200" cy="50" r="35" fill="#FFE87A" opacity="0.3"/>
        <circle cx="200" cy="50" r="55" fill="#FFE87A" opacity="0.08"/>
        {/* Waves */}
        <path d="M0 200 Q50 185 100 200 Q150 215 200 200 Q250 185 300 200 Q350 215 400 200" stroke="#3AAAC0" strokeWidth="3" fill="none" opacity="0.6"/>
        <path d="M0 215 Q50 200 100 215 Q150 230 200 215 Q250 200 300 215 Q350 230 400 215" stroke="#2A9AB0" strokeWidth="2.5" fill="none" opacity="0.5"/>
        <path d="M0 230 Q50 218 100 230 Q150 242 200 230 Q250 218 300 230 Q350 242 400 230" stroke="#2A9AB0" strokeWidth="2" fill="none" opacity="0.4"/>
        {/* Water surface */}
        <rect x="0" y="240" width="400" height="100" fill="#0A4A6A" opacity="0.7"/>
        {/* Sun sparkles on water */}
        {[60,120,200,280,340].map((x, i) => (
          <ellipse key={i} cx={x} cy={245} rx="15" ry="3" fill="#FFE87A" opacity="0.12"/>
        ))}
        <rect y="270" width="400" height="70" fill="#0C1A0F" opacity="0.75"/>
      </svg>
    )
  },
  {
    emoji: '🦜',
    fact: 'African grey parrots can learn over 1,000 words and understand context.',
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-parrot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#051808"/>
            <stop offset="40%" stopColor="#0A2A10"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-parrot)"/>
        {/* Dense canopy */}
        <ellipse cx="60" cy="30" rx="90" ry="55" fill="#0F4A18" opacity="0.9"/>
        <ellipse cx="200" cy="10" rx="120" ry="60" fill="#0A3A12" opacity="0.85"/>
        <ellipse cx="350" cy="35" rx="100" ry="58" fill="#0F4A18" opacity="0.9"/>
        <ellipse cx="130" cy="70" rx="75" ry="40" fill="#082E10" opacity="0.8"/>
        <ellipse cx="300" cy="55" rx="85" ry="42" fill="#082E10" opacity="0.8"/>
        {/* Exotic flowers */}
        <circle cx="90" cy="110" r="8" fill="#FF4A6A" opacity="0.85"/>
        <circle cx="310" cy="95" r="7" fill="#FF8A20" opacity="0.8"/>
        <circle cx="190" cy="100" r="6" fill="#FFDA20" opacity="0.75"/>
        <circle cx="50" cy="140" r="5" fill="#FF4A6A" opacity="0.7"/>
        {/* Light rays through canopy */}
        <line x1="160" y1="0" x2="120" y2="340" stroke="#8ACA40" strokeWidth="20" opacity="0.03"/>
        <line x1="240" y1="0" x2="210" y2="340" stroke="#8ACA40" strokeWidth="14" opacity="0.03"/>
        {/* Ground ferns */}
        <ellipse cx="50" cy="305" rx="60" ry="22" fill="#0A3A10" opacity="0.85"/>
        <ellipse cx="350" cy="310" rx="65" ry="20" fill="#0A3A10" opacity="0.85"/>
        <rect y="285" width="400" height="55" fill="#0C1A0F" opacity="0.8"/>
      </svg>
    )
  },
  {
    emoji: '🦛',
    fact: 'Hippos secrete a natural sunscreen that also acts as an antibiotic.',
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-hippo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A2A3A"/>
            <stop offset="50%" stopColor="#154A5A"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-hippo)"/>
        {/* River */}
        <path d="M0 210 Q200 190 400 210 L400 340 L0 340Z" fill="#0A3A4A" opacity="0.85"/>
        {/* Water ripples */}
        <ellipse cx="200" cy="230" rx="120" ry="12" fill="#1A5A6A" opacity="0.3"/>
        <ellipse cx="120" cy="250" rx="60" ry="8" fill="#1A5A6A" opacity="0.25"/>
        <ellipse cx="300" cy="245" rx="50" ry="7" fill="#1A5A6A" opacity="0.25"/>
        {/* Reeds */}
        {[20,45,70,330,355,380].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="300" x2={x+2} y2="200" stroke="#2A5A20" strokeWidth="3" opacity="0.7"/>
            <ellipse cx={x+2} cy="197" rx="5" ry="13" fill="#3A4A10" opacity="0.7"/>
          </g>
        ))}
        {/* Bank */}
        <ellipse cx="200" cy="215" rx="230" ry="20" fill="#1A3A18" opacity="0.5"/>
        <rect y="275" width="400" height="65" fill="#0C1A0F" opacity="0.8"/>
      </svg>
    )
  },
  {
    emoji: '🐻‍❄️',
    fact: 'Polar bears have black skin under their white fur to absorb heat.',
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-polarbear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#050A14"/>
            <stop offset="30%" stopColor="#0A1228"/>
            <stop offset="65%" stopColor="#0E1A30"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-polarbear)"/>
        {/* Aurora */}
        <path d="M0 60 Q100 40 200 70 Q300 100 400 55" stroke="#00FF99" strokeWidth="25" fill="none" opacity="0.07"/>
        <path d="M0 85 Q100 62 200 92 Q300 122 400 78" stroke="#44AAFF" strokeWidth="18" fill="none" opacity="0.08"/>
        <path d="M0 105 Q100 82 200 108 Q300 134 400 98" stroke="#AA44FF" strokeWidth="12" fill="none" opacity="0.06"/>
        {/* Stars */}
        {[25,75,140,210,270,330,380,55,175,295].map((x, i) => (
          <circle key={i} cx={x} cy={[18,30,12,25,18,32,15,45,38,28][i]} r="1" fill="white" opacity="0.6"/>
        ))}
        {/* Snow drifts */}
        <ellipse cx="200" cy="265" rx="240" ry="35" fill="#B8D0E8" opacity="0.2"/>
        <ellipse cx="80" cy="275" rx="120" ry="25" fill="#C8E0F0" opacity="0.15"/>
        <ellipse cx="330" cy="270" rx="100" ry="22" fill="#C8E0F0" opacity="0.15"/>
        <rect y="265" width="400" height="75" fill="#0C1A0F" opacity="0.82"/>
      </svg>
    )
  },
  {
    emoji: '🦓',
    fact: "Every zebra's stripe pattern is unique, like a human fingerprint.",
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-zebra" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A03010"/>
            <stop offset="35%" stopColor="#C85A20"/>
            <stop offset="65%" stopColor="#E88A50"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-zebra)"/>
        {/* Sunrise glow */}
        <ellipse cx="200" cy="200" rx="160" ry="50" fill="#FFB040" opacity="0.12"/>
        {/* Grass silhouettes */}
        {[0,25,50,75,100,125,150,175,200,225,250,275,300,325,350,375].map((x, i) => (
          <g key={i}>
            <line x1={x+5} y1="290" x2={x} y2="255" stroke="#2A1505" strokeWidth="2.5" opacity="0.75"/>
            <line x1={x+12} y1="290" x2={x+16} y2="250" stroke="#2A1505" strokeWidth="2" opacity="0.7"/>
            <line x1={x+20} y1="290" x2={x+17} y2="260" stroke="#1A1005" strokeWidth="2" opacity="0.65"/>
          </g>
        ))}
        {/* Flat horizon trees */}
        <rect x="50" y="190" width="4" height="65" fill="#1A0A02"/>
        <ellipse cx="52" cy="185" rx="25" ry="9" fill="#0F2808" opacity="0.9"/>
        <rect x="310" y="200" width="4" height="55" fill="#1A0A02"/>
        <ellipse cx="312" cy="196" rx="20" ry="8" fill="#0F2808" opacity="0.9"/>
        <rect y="272" width="400" height="68" fill="#0C1A0F" opacity="0.82"/>
      </svg>
    )
  },
  {
    emoji: '🦍',
    fact: 'Gorillas share 98.3% of their DNA with humans.',
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-gorilla" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#050F08"/>
            <stop offset="40%" stopColor="#081808"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-gorilla)"/>
        {/* Mist layers */}
        <ellipse cx="200" cy="180" rx="250" ry="40" fill="#1A3A20" opacity="0.2"/>
        <ellipse cx="200" cy="210" rx="250" ry="35" fill="#1A3A20" opacity="0.18"/>
        <ellipse cx="200" cy="240" rx="250" ry="30" fill="#1A3A20" opacity="0.15"/>
        {/* Dense forest */}
        <ellipse cx="50" cy="100" rx="80" ry="60" fill="#082A10" opacity="0.9"/>
        <ellipse cx="200" cy="80" rx="100" ry="65" fill="#061E08" opacity="0.9"/>
        <ellipse cx="360" cy="95" rx="85" ry="58" fill="#082A10" opacity="0.9"/>
        {/* Ferns */}
        <ellipse cx="60" cy="295" rx="70" ry="25" fill="#0A3010" opacity="0.85"/>
        <ellipse cx="340" cy="300" rx="65" ry="22" fill="#0A3010" opacity="0.85"/>
        <ellipse cx="200" cy="305" rx="85" ry="20" fill="#061E08" opacity="0.8"/>
        <rect y="280" width="400" height="60" fill="#0C1A0F" opacity="0.85"/>
      </svg>
    )
  },
  {
    emoji: '🦩',
    fact: 'Flamingos are born white, and their pink color comes entirely from their diet.',
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-flamingo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4A0A28"/>
            <stop offset="35%" stopColor="#8A1A40"/>
            <stop offset="65%" stopColor="#C84A6A"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-flamingo)"/>
        {/* Setting sun */}
        <circle cx="200" cy="180" r="45" fill="#FFB040" opacity="0.25"/>
        <circle cx="200" cy="180" r="30" fill="#FF8A30" opacity="0.2"/>
        {/* Flat salt flat water reflection */}
        <rect x="0" y="230" width="400" height="110" fill="#2A0A18" opacity="0.6"/>
        {/* Reflection shimmer */}
        {[50,120,200,280,350].map((x, i) => (
          <ellipse key={i} cx={x} cy={238} rx="20" ry="3" fill="#FF6A8A" opacity="0.1"/>
        ))}
        {/* Horizon line */}
        <line x1="0" y1="230" x2="400" y2="230" stroke="#FF6A8A" strokeWidth="1" opacity="0.2"/>
        <rect y="268" width="400" height="72" fill="#0C1A0F" opacity="0.82"/>
      </svg>
    )
  },
  {
    emoji: '🐅',
    fact: "No two tigers have the same stripe pattern. Each one is completely unique.",
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-tiger" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A0A02"/>
            <stop offset="40%" stopColor="#2A1205"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-tiger)"/>
        {/* Dense jungle shadows */}
        <rect x="0" y="0" width="60" height="340" fill="#0A1A05" opacity="0.7"/>
        <rect x="340" y="0" width="60" height="340" fill="#0A1A05" opacity="0.7"/>
        {/* Bamboo stalks */}
        {[30,80,130,270,320,370].map((x, i) => (
          <g key={i}>
            <rect x={x} y="0" width="8" height="340" fill="#1A3A08" opacity="0.5"/>
            {[60,120,180,240,300].map((y, j) => (
              <line key={j} x1={x} y1={y} x2={x+8} y2={y} stroke="#0A2A05" strokeWidth="1.5" opacity="0.6"/>
            ))}
          </g>
        ))}
        {/* Amber light shaft */}
        <line x1="180" y1="0" x2="150" y2="340" stroke="#E8902A" strokeWidth="30" opacity="0.04"/>
        {/* Ground shadows */}
        <ellipse cx="200" cy="295" rx="220" ry="30" fill="#0A1A05" opacity="0.8"/>
        <rect y="275" width="400" height="65" fill="#0C1A0F" opacity="0.85"/>
      </svg>
    )
  },
  {
    emoji: '🦭',
    fact: 'Seals can slow their heart rate to 4 beats per minute when diving.',
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-seal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#080E18"/>
            <stop offset="40%" stopColor="#101828"/>
            <stop offset="70%" stopColor="#182438"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-seal)"/>
        {/* Moon */}
        <circle cx="300" cy="55" r="22" fill="#E8E0C8" opacity="0.4"/>
        <circle cx="308" cy="50" r="22" fill="#080E18" opacity="0.6"/>
        {/* Rocky outcrops */}
        <polygon points="0,270 50,220 100,270" fill="#1A1A1A" opacity="0.85"/>
        <polygon points="60,270 120,200 180,270" fill="#141414" opacity="0.85"/>
        <polygon points="280,270 340,210 400,270" fill="#1A1A1A" opacity="0.85"/>
        {/* Ocean */}
        <rect x="0" y="255" width="400" height="85" fill="#0A1828" opacity="0.85"/>
        {/* Mist */}
        <ellipse cx="200" cy="258" rx="230" ry="18" fill="#1A2A3A" opacity="0.4"/>
        {/* Stars */}
        {[40,90,150,210,260,310,370].map((x, i) => (
          <circle key={i} cx={x} cy={[20,35,15,28,18,35,22][i]} r="1" fill="white" opacity="0.5"/>
        ))}
        <rect y="272" width="400" height="68" fill="#0C1A0F" opacity="0.82"/>
      </svg>
    )
  },
  {
    emoji: '🦔',
    fact: 'Hedgehogs are immune to many venoms, including some snake venoms.',
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-hedgehog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#100A04"/>
            <stop offset="40%" stopColor="#1E1208"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-hedgehog)"/>
        {/* Moon glow */}
        <circle cx="80" cy="70" r="25" fill="#F0E8C0" opacity="0.3"/>
        <circle cx="80" cy="70" r="40" fill="#F0E8C0" opacity="0.06"/>
        {/* Tree trunks */}
        <rect x="20" y="100" width="18" height="200" fill="#1A0E05" opacity="0.8"/>
        <rect x="340" y="120" width="16" height="200" fill="#1A0E05" opacity="0.8"/>
        <rect x="160" y="130" width="12" height="200" fill="#1A0E05" opacity="0.7"/>
        {/* Fallen leaves */}
        {[40,80,130,180,240,290,340,380].map((x, i) => (
          <ellipse key={i} cx={x} cy={[280,275,285,278,282,276,280,274][i]} rx="10" ry="5" fill={['#5A2A08','#8A3A10','#6A3010','#4A2008'][i%4]} opacity="0.7" transform={`rotate(${[20,-15,30,-25,15,-30,25,-10][i]} ${x} ${[280,275,285,278,282,276,280,274][i]})`}/>
        ))}
        {/* Mushrooms */}
        <ellipse cx="220" cy="282" rx="12" ry="6" fill="#8A3A20" opacity="0.8"/>
        <rect x="218" y="282" width="4" height="12" fill="#C8A880" opacity="0.7"/>
        <ellipse cx="280" cy="278" rx="9" ry="5" fill="#6A2A18" opacity="0.8"/>
        <rect x="278" y="278" width="3" height="10" fill="#C0A070" opacity="0.7"/>
        {/* Ground moss */}
        <ellipse cx="200" cy="295" rx="220" ry="22" fill="#1A2A08" opacity="0.6"/>
        <rect y="278" width="400" height="62" fill="#0C1A0F" opacity="0.82"/>
      </svg>
    )
  },
  {
    emoji: '🦋',
    fact: 'Butterflies taste with their feet, using taste sensors on their legs.',
    scene: (
      <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-butterfly" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#100A1E"/>
            <stop offset="40%" stopColor="#1E1030"/>
            <stop offset="70%" stopColor="#2A1A3A"/>
            <stop offset="100%" stopColor="#0C1A0F"/>
          </linearGradient>
        </defs>
        <rect width="400" height="340" fill="url(#sky-butterfly)"/>
        {/* Soft light */}
        <circle cx="200" cy="100" r="80" fill="#8A5ACA" opacity="0.08"/>
        <circle cx="200" cy="100" r="50" fill="#AA7AEA" opacity="0.06"/>
        {/* Wildflowers */}
        {[30,75,130,190,250,310,365].map((x, i) => (
          <g key={i}>
            <line x1={x+5} y1="310" x2={x+5} y2="260" stroke="#2A3A10" strokeWidth="2" opacity="0.7"/>
            <circle cx={x+5} cy="257" r="7" fill={['#8A2A8A','#CA4A8A','#6A2ACA','#AA5ACA','#8A3AAA','#CA6A4A','#8A4ACA'][i]} opacity="0.75"/>
          </g>
        ))}
        {/* Soft grass */}
        <ellipse cx="200" cy="300" rx="230" ry="25" fill="#1A2A08" opacity="0.6"/>
        {/* Floating pollen dots */}
        {[60,110,180,240,300,340].map((x, i) => (
          <circle key={i} cx={x} cy={[120,80,140,100,120,90][i]} r="2" fill="#FFE87A" opacity="0.2"/>
        ))}
        <rect y="278" width="400" height="62" fill="#0C1A0F" opacity="0.8"/>
      </svg>
    )
  },
]

const WILDLIFE_LINES = [
  "Ready to capture the wild?",
  "What did you see today?",
  "Got a zoo photo to clean up?",
  "Fresh from the aquarium?",
  "What animal did you spot?",
  "Back from the safari?",
  "Let's see what you captured.",
  "Which animal made your day?"
]

export default function HomePage() {
  const router = useRouter()
  const [credits, setCredits] = useState<number | null>(null)
  const [firstName, setFirstName] = useState('there')
  const [timeGreeting, setTimeGreeting] = useState('')
  const [wildlifeLine, setWildlifeLine] = useState('')
  const [animalIndex, setAnimalIndex] = useState<number | null>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const hour = new Date().getHours()
    setTimeGreeting(hour >= 5 && hour < 12 ? 'Good morning' : hour >= 12 && hour < 17 ? 'Good afternoon' : 'Good evening')
    setWildlifeLine(WILDLIFE_LINES[Math.floor(Math.random() * WILDLIFE_LINES.length)])
    setAnimalIndex(Math.floor(Math.random() * ANIMAL_DATA.length))
    loadUser()
  }, [])

  const loadUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/signin'); return }
    const rawName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]?.split('.')[0] || 'there'
    const name = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase()
    setFirstName(name)
    const { data } = await supabase.from('credits').select('remaining').eq('user_id', user.id).single()
    if (data) setCredits(data.remaining)
  }

  const shuffleAnimal = () => {
    setVisible(false)
    setTimeout(() => {
      setAnimalIndex(prev => {
        let next = Math.floor(Math.random() * ANIMAL_DATA.length)
        if (next === prev) next = (next + 1) % ANIMAL_DATA.length
        return next
      })
      setVisible(true)
    }, 250)
  }

  const handleTakePhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = () => {
          sessionStorage.setItem('wildvue_selected_image', reader.result as string)
          router.push('/confirm')
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleCameraRoll = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = () => {
          sessionStorage.setItem('wildvue_selected_image', reader.result as string)
          router.push('/confirm')
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const animal = animalIndex !== null ? ANIMAL_DATA[animalIndex] : null
  const noCredits = credits !== null && credits <= 0

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 72px)', background: '#0C1A0F', overflow: 'hidden' }}>

      {/* BIOME SCENE BACKGROUND */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '70%', overflow: 'hidden', pointerEvents: 'none', zIndex: 0, opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease' }}>
        {animal?.scene}
        {/* Fade to dark at top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to bottom, #0C1A0F, transparent)', pointerEvents: 'none' }}/>
        {/* Fade to dark at bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to bottom, transparent, #0C1A0F)', pointerEvents: 'none' }}/>
      </div>

      {/* CONTENT */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* NAV */}
        <div style={{ padding: 'max(52px, env(safe-area-inset-top)) 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: 'rgba(28,58,34,0.8)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🦉</div>
            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '28px', letterSpacing: '-0.02em', color: '#FAF7F2' }}>
              Wild<em style={{ fontStyle: 'italic', fontWeight: 400, color: '#E8A245' }}>vue</em>
            </span>
          </div>
          <div onClick={() => router.push('/profile')} style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(28,58,34,0.8)', border: '1.5px solid rgba(232,162,69,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="rgba(255,255,255,0.6)" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
        </div>

        {/* GREETING */}
        <div style={{ padding: '24px 24px 0', flexShrink: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#E8A245', marginBottom: '6px', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
            {timeGreeting}, {firstName}.
          </p>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '32px', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#FAF7F2', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            {wildlifeLine || '\u00A0'}
          </h1>
        </div>

        {/* ANIMAL MINI GAME */}
        <div onClick={shuffleAnimal} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', userSelect: 'none', padding: '0 32px', marginTop: '-24px' }}>
          <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div style={{ fontSize: '124px', lineHeight: 1, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))', textAlign: 'center', width: '100%' }}>
              {animal?.emoji}
            </div>
            <p style={{ marginTop: '20px', fontSize: '12px', color: 'rgba(250,247,242,0.35)', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.02em', marginBottom: '12px' }}>
              Tap to meet another
            </p>
            <p style={{ fontSize: '15px', color: 'rgba(250,247,242,0.6)', fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'center', lineHeight: 1.6, fontStyle: 'italic', maxWidth: '260px', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
              {animal?.fact}
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ padding: '0 24px', flexShrink: 0 }}>
          <button
            onClick={handleTakePhoto}
            disabled={noCredits}
            style={{
              background: noCredits ? 'rgba(232,162,69,0.4)' : '#E8A245',
              color: '#1C2B1E',
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              fontSize: '17px',
              letterSpacing: '-0.02em',
              border: 'none',
              borderRadius: '20px',
              padding: '20px 24px',
              cursor: noCredits ? 'not-allowed' : 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: noCredits ? 'none' : '0 8px 24px rgba(232,162,69,0.35)',
              marginBottom: '14px',
            }}
          >
            <span style={{ fontSize: '22px' }}>📸</span>
            {noCredits ? 'No cleanups left — Upgrade' : 'Take a photo now'}
          </button>

          {!noCredits && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', padding: '0 4px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
              </div>
              <div onClick={handleCameraRoll} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 16px', cursor: 'pointer', border: '1px dashed #3A7D44', borderRadius: '100px', marginBottom: '16px' }}>
                <svg viewBox="0 0 24 24" width="15" height="15" stroke="rgba(255,255,255,0.4)" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.45)' }}>
                  Choose from camera roll
                </span>
              </div>
            </>
          )}
        </div>

        {/* CREDITS PILL */}
        <div style={{ marginLeft: '20px', marginRight: '20px', marginBottom: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '100px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(232,162,69,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="#E8A245" fill="none" strokeWidth="2" strokeLinecap="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div style={{ flex: 1, fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
            {credits === null ? '...' : <><strong style={{ color: '#E8A245', fontWeight: 600 }}>{credits}</strong> cleanups left this month</>}
          </div>
          <div onClick={() => router.push('/upgrade')} style={{ fontSize: '11px', fontWeight: 600, color: '#E8A245', background: 'rgba(232,162,69,0.12)', borderRadius: '100px', padding: '4px 10px', cursor: 'pointer' }}>
            Upgrade
          </div>
        </div>

      </div>
    </div>
  )
}

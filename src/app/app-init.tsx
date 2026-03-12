'use client'

import { useEffect } from 'react'
import { initializeRevenueCat } from '@/lib/revenuecat'

export function AppInit() {
  useEffect(() => {
    initializeRevenueCat().catch((error) => {
      console.error('[AppInit] RevenueCat initialization failed:', error)
    })
  }, [])

  return null
}

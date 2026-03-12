import { Capacitor } from '@capacitor/core'
import { LOG_LEVEL, Purchases } from '@revenuecat/purchases-capacitor'
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor'

export async function initializeRevenueCat(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  if (process.env.NODE_ENV === 'development') {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG })
  }

  await Purchases.configure({
    apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY!,
  })
}

export async function purchasePackage(pkg: PurchasesPackage) {
  try {
    const result = await Purchases.purchasePackage({ aPackage: pkg })
    return result
  } catch (error) {
    console.error('[RevenueCat] purchasePackage error:', error)
    throw error
  }
}

export async function getOfferings() {
  try {
    const { offerings } = await Purchases.getOfferings()
    return offerings.current
  } catch (error) {
    console.error('[RevenueCat] getOfferings error:', error)
    throw error
  }
}

export async function getCustomerInfo() {
  try {
    const { customerInfo } = await Purchases.getCustomerInfo()
    return customerInfo
  } catch (error) {
    console.error('[RevenueCat] getCustomerInfo error:', error)
    throw error
  }
}

export async function restorePurchases() {
  try {
    const { customerInfo } = await Purchases.restorePurchases()
    return customerInfo
  } catch (error) {
    console.error('[RevenueCat] restorePurchases error:', error)
    throw error
  }
}

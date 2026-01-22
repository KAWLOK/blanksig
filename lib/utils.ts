import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Credibility tier system
export const CREDIBILITY_TIERS = {
  UNTRUSTED: { min: 0, max: 300, label: 'UNTRUSTED', color: 'tier-untrusted', icon: '⚠' },
  VERIFIED: { min: 301, max: 600, label: 'VERIFIED', color: 'tier-verified', icon: '✓' },
  TRUSTED: { min: 601, max: 800, label: 'TRUSTED', color: 'tier-trusted', icon: '✓✓' },
  ELITE: { min: 801, max: 900, label: 'ELITE', color: 'tier-elite', icon: '★' },
  LEGENDARY: { min: 901, max: 1000, label: 'LEGENDARY', color: 'tier-legendary', icon: '♔' },
}

export function getCredibilityTier(score: number) {
  if (score <= 300) return CREDIBILITY_TIERS.UNTRUSTED
  if (score <= 600) return CREDIBILITY_TIERS.VERIFIED
  if (score <= 800) return CREDIBILITY_TIERS.TRUSTED
  if (score <= 900) return CREDIBILITY_TIERS.ELITE
  return CREDIBILITY_TIERS.LEGENDARY
}

'use client'

import { getCredibilityTier } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface CredibilityBadgeProps {
  score: number
  showScore?: boolean
  className?: string
}

// Static class lookup to ensure Tailwind can purge correctly
// Dynamic class names like `border-${color}` don't work with Tailwind
const TIER_CLASSES: Record<string, string> = {
  'tier-untrusted': 'border-tier-untrusted text-tier-untrusted',
  'tier-verified': 'border-tier-verified text-tier-verified',
  'tier-trusted': 'border-tier-trusted text-tier-trusted',
  'tier-elite': 'border-tier-elite text-tier-elite',
  'tier-legendary': 'border-tier-legendary text-tier-legendary',
}

export function CredibilityBadge({
  score,
  showScore = true,
  className
}: CredibilityBadgeProps) {
  const tier = getCredibilityTier(score)

  return (
    <div className={cn("inline-flex items-center gap-2 font-terminal text-lg", className)}>
      <span
        className={cn(
          "px-3 py-1 border-2",
          TIER_CLASSES[tier.color],
          score > 900 && "animate-pulse"
        )}
      >
        [{tier.label}] {tier.icon}
      </span>
      {showScore && (
        <span className="text-white/60">
          {score}
        </span>
      )}
    </div>
  )
}

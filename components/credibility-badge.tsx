'use client'

import { getCredibilityTier } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface CredibilityBadgeProps {
  score: number
  showScore?: boolean
  className?: string
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
          `border-${tier.color} text-${tier.color}`,
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

'use client'

import { cn } from "@/lib/utils"
import { CredibilityBadge } from "./credibility-badge"
import type { BlankSig } from "@/types"

interface TerminalWindowProps {
  blanksig: BlankSig
  className?: string
}

export function TerminalWindow({ blanksig, className }: TerminalWindowProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={cn(
      "border-2 border-primary bg-black p-4 font-mono transition-all duration-300",
      "hover:border-secondary hover:shadow-[0_0_15px_rgba(0,255,65,0.3)]",
      className
    )}>
      {/* Header */}
      <div className="border-b-2 border-primary/30 pb-3 mb-3">
        <CredibilityBadge score={blanksig.ethos_score} />
      </div>

      {/* Content */}
      <div className="text-white/90 mb-4 leading-relaxed whitespace-pre-wrap">
        {blanksig.content}
      </div>

      {/* Footer */}
      <div className="border-t-2 border-primary/30 pt-3 flex items-center justify-between text-sm">
        <div className="text-secondary uppercase">
          Category: {blanksig.category.replace('_', ' ')}
        </div>
        <div className="text-white/40">
          Posted: {formatDate(blanksig.created_at)}
        </div>
      </div>

      {/* Tags */}
      {blanksig.tags && blanksig.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {blanksig.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs border border-primary/50 text-primary/70 px-2 py-1"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

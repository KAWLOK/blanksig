'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function VerifyPage() {
  return (
    <main className="min-h-screen bg-black text-primary p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              &lt; BACK_TO_MAIN
            </Button>
          </Link>
        </div>

        {/* Page Title */}
        <div className="font-terminal text-4xl text-center mb-12 neon-glow">
          <pre className="inline-block">
{`┌────────────────────────────────┐
│  VERIFY_ETHOS_SCORE            │
└────────────────────────────────┘`}
          </pre>
        </div>

        {/* Coming Soon */}
        <div className="border-2 border-primary p-8 text-center">
          <div className="font-terminal text-2xl text-secondary mb-4">
            [ CONNECT_WALLET ]
          </div>
          <div className="font-mono text-white/60 mb-8">
            Connect your wallet to verify your Ethos credibility score
          </div>
          <div className="space-y-2 font-mono text-sm text-primary">
            <div>{'>'} CONNECTING_TO_ETHOS_NETWORK...</div>
            <div>{'>'} RETRIEVING_CREDIBILITY_SCORE...</div>
            <div>{'>'} CALCULATING_TIER...</div>
            <div>{'>'} DISPLAY_RESULTS</div>
          </div>
        </div>

        {/* Tier System Info */}
        <div className="mt-8 border-2 border-primary/50 p-6">
          <div className="font-terminal text-xl text-center mb-4 text-secondary">
            CREDIBILITY_TIERS
          </div>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-tier-untrusted">[UNTRUSTED] ⚠</span>
              <span className="text-white/60">0-300</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tier-verified">[VERIFIED] ✓</span>
              <span className="text-white/60">301-600</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tier-trusted">[TRUSTED] ✓✓</span>
              <span className="text-white/60">601-800</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tier-elite">[ELITE] ★</span>
              <span className="text-white/60">801-900</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tier-legendary">[LEGENDARY] ♔</span>
              <span className="text-white/60">901-1000</span>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 text-center font-mono text-sm text-white/40">
          <p>FEATURE_IN_DEVELOPMENT...</p>
        </div>
      </div>
    </main>
  )
}

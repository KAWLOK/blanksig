'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
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
│  ABOUT_BLANKSIG                │
└────────────────────────────────┘`}
          </pre>
        </div>

        {/* Terminal Window with Content */}
        <div className="border-2 border-primary p-8 font-mono space-y-6">
          {/* What is BlankSig */}
          <div>
            <div className="text-secondary text-lg mb-2">
              {'>'} QUERY: What is BlankSig?
            </div>
            <div className="text-white/80 pl-4 leading-relaxed">
              BlankSig enables anonymous but credible testimonials by leveraging
              the Ethos Network reputation system. Users verify their Ethos score,
              submit testimonials, and the system stores ONLY the credibility score
              - never wallet addresses or identifying information.
            </div>
          </div>

          {/* How it works */}
          <div>
            <div className="text-secondary text-lg mb-2">
              {'>'} QUERY: How does it work?
            </div>
            <div className="text-white/80 pl-4 leading-relaxed">
              <div className="space-y-1">
                <div>1. Connect wallet → Verify Ethos score via API</div>
                <div>2. Submit testimonial → Store content + score only</div>
                <div>3. Wallet address discarded → True anonymity</div>
                <div>4. Testimonials displayed with credibility badge</div>
              </div>
            </div>
          </div>

          {/* Privacy Guarantees */}
          <div>
            <div className="text-secondary text-lg mb-2">
              {'>'} QUERY: How is anonymity guaranteed?
            </div>
            <div className="text-white/80 pl-4 leading-relaxed">
              BlankSig NEVER stores wallet addresses, user IDs, or any identifying
              data with testimonials. We only store: content, category, Ethos score,
              tier, tags, and timestamp. This is irreversible and truly anonymous.
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <div className="text-secondary text-lg mb-2">
              {'>'} QUERY: What are the use cases?
            </div>
            <div className="text-white/80 pl-4 leading-relaxed">
              <div className="space-y-1">
                <div>• Whistleblowing with credibility</div>
                <div>• Sensitive workplace feedback</div>
                <div>• Product reviews without retaliation risk</div>
                <div>• Controversial opinions backed by reputation</div>
                <div>• Community feedback with accountability</div>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="border-t-2 border-primary/30 pt-6 text-center">
            <div className="font-terminal text-2xl text-secondary">
              IDENTITY: <span className="text-destructive">VOID</span> {'>>'}
              CREDIBILITY: <span className="text-tier-elite">VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center font-mono text-sm text-white/40">
          <p>POWERED BY ETHOS NETWORK</p>
          <p className="mt-2">VIBEATHON 2026</p>
        </div>
      </div>
    </main>
  )
}

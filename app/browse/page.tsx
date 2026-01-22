'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function BrowsePage() {
  return (
    <main className="min-h-screen bg-black text-primary p-8">
      <div className="max-w-6xl mx-auto">
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
│  BROWSE_BLANKSIGS              │
└────────────────────────────────┘`}
          </pre>
        </div>

        {/* Coming Soon */}
        <div className="border-2 border-primary p-8 text-center">
          <div className="font-terminal text-2xl text-secondary mb-4">
            [ QUERY_DATABASE ]
          </div>
          <div className="font-mono text-white/60 mb-8">
            View anonymous testimonials with verified credibility scores
          </div>
          <div className="space-y-2 font-mono text-sm text-primary">
            <div>{'>'} FILTER: --category=all</div>
            <div>{'>'} FILTER: --min-score=0</div>
            <div>{'>'} SORT: --by=credibility</div>
            <div>{'>'} EXECUTE_QUERY</div>
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

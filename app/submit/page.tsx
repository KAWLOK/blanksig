'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SubmitWizard } from '@/components/submit-wizard'

export default function SubmitPage() {
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
          <pre className="inline-block text-lg sm:text-2xl md:text-4xl">
{`┌────────────────────────────────┐
│  SUBMIT_BLANKSIG_PROTOCOL      │
└────────────────────────────────┘`}
          </pre>
        </div>

        {/* Privacy Notice */}
        <div className="mb-8 p-4 border-2 border-accent/50 bg-accent/5">
          <div className="font-terminal text-accent mb-2">PRIVACY_NOTICE:</div>
          <div className="font-mono text-sm text-white/60">
            BlankSig guarantees complete anonymity. Your wallet address is only used
            to verify your Ethos credibility score and is <span className="text-accent">NEVER</span> stored
            with your testimonial. Once submitted, your message cannot be traced back to you.
          </div>
        </div>

        {/* Submit Wizard */}
        <SubmitWizard />

        {/* Footer disclaimer */}
        <div className="mt-12 text-center font-mono text-xs text-white/30">
          <p>By submitting, you agree that your testimonial will be permanently</p>
          <p>anonymous and you accept responsibility for its content.</p>
        </div>
      </div>
    </main>
  )
}

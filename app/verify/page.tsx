'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CredibilityBadge } from '@/components/credibility-badge'
import type { EthosScore } from '@/types'

export default function VerifyPage() {
  const [walletAddress, setWalletAddress] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<EthosScore | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const verificationSteps = [
    'CONNECTING_TO_ETHOS_NETWORK...',
    'RETRIEVING_CREDIBILITY_SCORE...',
    'CALCULATING_TIER...',
    'VERIFICATION_COMPLETE ✓',
  ]

  const handleVerify = async () => {
    if (!walletAddress) {
      setError('WALLET_ADDRESS_REQUIRED')
      return
    }

    // Validate wallet address format
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('INVALID_WALLET_FORMAT')
      return
    }

    setIsVerifying(true)
    setError(null)
    setResult(null)
    setCurrentStep(0)

    // Animate through steps
    for (let i = 0; i < verificationSteps.length; i++) {
      setCurrentStep(i)
      await new Promise(resolve => setTimeout(resolve, 600))
    }

    try {
      const response = await fetch('/api/verify-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setResult({
        score: data.score,
        tier: data.tier,
        canSubmit: data.canSubmit,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'VERIFICATION_FAILED')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleTestWallet = (testScore: number) => {
    // Generate a deterministic test wallet for a given score
    const hashValue = Math.floor((testScore / 1000) * 0xFFFFFFFF).toString(16).padStart(8, '0')
    const testWallet = `0x${hashValue}${'0'.repeat(32)}`
    setWalletAddress(testWallet)
  }

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

        {/* Verification Form */}
        <div className="border-2 border-primary p-8 mb-8">
          <div className="font-terminal text-2xl text-secondary mb-6 text-center">
            [ WALLET_VERIFICATION ]
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-mono text-sm text-white/80 mb-2 block">
                {'> ENTER_WALLET_ADDRESS:'}
              </label>
              <Input
                type="text"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                disabled={isVerifying}
                className="font-mono"
              />
            </div>

            <Button
              onClick={handleVerify}
              disabled={isVerifying || !walletAddress}
              className="w-full"
            >
              {isVerifying ? '[ VERIFYING... ]' : '[ VERIFY_SCORE ]'}
            </Button>

            {/* Test Wallets */}
            <div className="border-t border-primary/30 pt-4">
              <div className="font-mono text-xs text-white/60 mb-2">
                TEST_WALLETS (Development only):
              </div>
              <div className="flex flex-wrap gap-2">
                {[100, 400, 700, 850, 950].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleTestWallet(score)}
                    className="font-mono text-xs text-secondary hover:text-primary transition-colors px-2 py-1 border border-secondary/30 hover:border-primary"
                  >
                    Score: {score}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Animation */}
          <AnimatePresence>
            {isVerifying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 space-y-2 font-mono text-sm"
              >
                {verificationSteps.slice(0, currentStep + 1).map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-primary"
                  >
                    {'> '}{step}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 p-4 border-2 border-destructive bg-destructive/10"
              >
                <div className="font-terminal text-destructive">
                  ERROR: {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Display */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 p-6 border-2 border-secondary bg-secondary/5"
              >
                <div className="text-center mb-4">
                  <CredibilityBadge score={result.score} tier={result.tier} size="lg" />
                </div>

                <div className="space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">SCORE:</span>
                    <span className="text-primary">{result.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">TIER:</span>
                    <span className="text-secondary uppercase">{result.tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">CAN_SUBMIT:</span>
                    <span className={result.canSubmit ? 'text-tier-trusted' : 'text-destructive'}>
                      {result.canSubmit ? 'YES ✓' : 'NO ✗'}
                    </span>
                  </div>
                </div>

                {!result.canSubmit && (
                  <div className="mt-4 p-3 border border-destructive/50 bg-destructive/5">
                    <div className="font-mono text-xs text-destructive">
                      MINIMUM_SCORE_REQUIRED: 300
                    </div>
                    <div className="font-mono text-xs text-white/60 mt-1">
                      Increase your Ethos score to submit testimonials
                    </div>
                  </div>
                )}

                {result.canSubmit && (
                  <div className="mt-4 text-center">
                    <Link href="/submit">
                      <Button variant="default">
                        [ SUBMIT_BLANKSIG ]
                      </Button>
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tier System Info */}
        <div className="border-2 border-primary/50 p-6">
          <div className="font-terminal text-xl text-center mb-4 text-secondary">
            CREDIBILITY_TIERS
          </div>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between items-center">
              <span className="text-tier-untrusted">[UNTRUSTED] ⚠</span>
              <span className="text-white/60">0-300</span>
              <span className="text-xs text-white/40">Cannot submit</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-tier-verified">[VERIFIED] ✓</span>
              <span className="text-white/60">301-600</span>
              <span className="text-xs text-tier-verified">Can submit</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-tier-trusted">[TRUSTED] ✓✓</span>
              <span className="text-white/60">601-800</span>
              <span className="text-xs text-tier-trusted">Can submit</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-tier-elite">[ELITE] ★</span>
              <span className="text-white/60">801-900</span>
              <span className="text-xs text-tier-elite">Can submit</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-tier-legendary">[LEGENDARY] ♔</span>
              <span className="text-white/60">901-1000</span>
              <span className="text-xs text-tier-legendary">Can submit</span>
            </div>
          </div>

          <div className="mt-4 p-3 border-t border-primary/30">
            <div className="font-mono text-xs text-white/60 text-center">
              Minimum score of 300 required to submit anonymous testimonials
            </div>
          </div>
        </div>

        {/* Development Notice */}
        <div className="mt-8 text-center font-mono text-sm text-white/40">
          <p>⚠ DEVELOPMENT_MODE: Using mock Ethos scores</p>
          <p className="text-xs mt-1">Configure ETHOS_API_KEY in .env.local for production</p>
        </div>
      </div>
    </main>
  )
}

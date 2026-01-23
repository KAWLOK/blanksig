'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrowserProvider } from 'ethers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CredibilityBadge } from '@/components/credibility-badge'
import { cn, getCredibilityTier } from '@/lib/utils'
import type { BlankSigCategory, EthosScore } from '@/types'

// Wizard steps
type WizardStep = 'connect' | 'verify' | 'compose' | 'category' | 'submit' | 'success'

const STEPS: { key: WizardStep; label: string; command: string }[] = [
  { key: 'connect', label: 'CONNECT_WALLET', command: 'init_web3_connection' },
  { key: 'verify', label: 'VERIFY_CREDIBILITY', command: 'query_ethos_network' },
  { key: 'compose', label: 'COMPOSE_BLANKSIG', command: 'input_testimonial_data' },
  { key: 'category', label: 'SELECT_CATEGORY', command: 'classify_submission' },
  { key: 'submit', label: 'TRANSMIT_ANONYMOUS', command: 'execute_anonymous_submit' },
]

const CATEGORIES: { value: BlankSigCategory; label: string; icon: string }[] = [
  { value: 'workplace', label: 'WORKPLACE', icon: '>' },
  { value: 'product_review', label: 'PRODUCT_REVIEW', icon: '>' },
  { value: 'whistleblowing', label: 'WHISTLEBLOWING', icon: '>' },
  { value: 'community_feedback', label: 'COMMUNITY_FEEDBACK', icon: '>' },
  { value: 'other', label: 'OTHER', icon: '>' },
]

interface SubmitWizardProps {
  onComplete?: () => void
}

export function SubmitWizard({ onComplete }: SubmitWizardProps) {
  // Step state
  const [currentStep, setCurrentStep] = useState<WizardStep>('connect')
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set())

  // Wallet state
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Verification state
  const [ethosScore, setEthosScore] = useState<EthosScore | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [verifyLogs, setVerifyLogs] = useState<string[]>([])

  // Form state
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<BlankSigCategory | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitLogs, setSubmitLogs] = useState<string[]>([])
  const [submittedId, setSubmittedId] = useState<string | null>(null)

  // Animation helpers
  const addVerifyLog = useCallback((log: string, delay: number) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setVerifyLogs((prev) => [...prev, log])
        resolve()
      }, delay)
    })
  }, [])

  const addSubmitLog = useCallback((log: string, delay: number) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setSubmitLogs((prev) => [...prev, log])
        resolve()
      }, delay)
    })
  }, [])

  // Connect wallet function
  const connectWallet = async () => {
    setIsConnecting(true)
    setConnectionError(null)

    try {
      // Check if MetaMask or other Web3 provider is available
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new BrowserProvider(window.ethereum)
        const accounts = await provider.send('eth_requestAccounts', [])

        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setCompletedSteps((prev) => new Set([...prev, 'connect']))
          // Auto-advance to verify step after short delay
          setTimeout(() => setCurrentStep('verify'), 500)
        }
      } else {
        setConnectionError('NO_WEB3_PROVIDER_DETECTED')
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          setConnectionError('CONNECTION_REJECTED_BY_USER')
        } else {
          setConnectionError('CONNECTION_FAILED: ' + error.message)
        }
      }
    } finally {
      setIsConnecting(false)
    }
  }

  // Connect test wallet (for development)
  const connectTestWallet = (address: string) => {
    setWalletAddress(address)
    setCompletedSteps((prev) => new Set([...prev, 'connect']))
    setTimeout(() => setCurrentStep('verify'), 500)
  }

  // Verify Ethos score function
  const verifyScore = async () => {
    if (!walletAddress) return

    setIsVerifying(true)
    setVerifyError(null)
    setVerifyLogs([])

    try {
      // Terminal animation logs
      await addVerifyLog('> INITIALIZING_ETHOS_CONNECTION...', 0)
      await addVerifyLog('> ENCRYPTING_WALLET_HASH...', 400)
      await addVerifyLog('> QUERYING_REPUTATION_NETWORK...', 800)

      // Make API call
      const response = await fetch('/api/verify-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      })

      if (!response.ok) {
        throw new Error('Verification failed')
      }

      const data: EthosScore = await response.json()

      await addVerifyLog('> DECRYPTING_RESPONSE...', 1200)
      await addVerifyLog(`> SCORE_RETRIEVED: ${data.score}`, 1600)
      await addVerifyLog(`> TIER_CLASSIFICATION: ${data.tier.toUpperCase()}`, 2000)

      if (data.canSubmit) {
        await addVerifyLog('> STATUS: AUTHORIZED_TO_SUBMIT ✓', 2400)
        setEthosScore(data)
        setCompletedSteps((prev) => new Set([...prev, 'verify']))
        setTimeout(() => setCurrentStep('compose'), 1000)
      } else {
        await addVerifyLog('> STATUS: INSUFFICIENT_CREDIBILITY ✗', 2400)
        await addVerifyLog('> MINIMUM_REQUIRED: 300', 2800)
        setVerifyError('CREDIBILITY_SCORE_BELOW_THRESHOLD')
      }
    } catch (error) {
      await addVerifyLog('> ERROR: VERIFICATION_FAILED ✗', 1200)
      setVerifyError('ETHOS_VERIFICATION_ERROR')
    } finally {
      setIsVerifying(false)
    }
  }

  // Start verification when entering verify step
  useEffect(() => {
    if (currentStep === 'verify' && walletAddress && !ethosScore && !isVerifying) {
      verifyScore()
    }
    // We intentionally only trigger on step/wallet changes to avoid re-verification loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, walletAddress])

  // Add tag function
  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase().replace(/\s+/g, '_')
    if (trimmedTag && tags.length < 5 && !tags.includes(trimmedTag)) {
      setTags((prev) => [...prev, trimmedTag])
      setTagInput('')
    }
  }

  // Remove tag function
  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove))
  }

  // Submit testimonial function
  const submitTestimonial = async () => {
    if (!walletAddress || !ethosScore || !content || !category) return

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitLogs([])

    try {
      // Terminal animation logs
      await addSubmitLog('> PREPARING_ANONYMOUS_PAYLOAD...', 0)
      await addSubmitLog('> STRIPPING_WALLET_IDENTIFIERS...', 500)
      await addSubmitLog('> ENCRYPTING_TRANSMISSION...', 1000)
      await addSubmitLog('> CONNECTING_TO_BLANKSIG_NETWORK...', 1500)

      // Make API call
      const response = await fetch('/api/blanksigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          category,
          tags,
          walletAddress, // Only used for verification, never stored
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed')
      }

      await addSubmitLog('> ANONYMIZING_RECORD... OK ✓', 2000)
      await addSubmitLog('> COMMITTING_TO_DATABASE... OK ✓', 2500)
      await addSubmitLog('> CLEARING_SESSION_DATA... OK ✓', 3000)
      await addSubmitLog(`> BLANKSIG_ID: ${data.testimonial.id}`, 3500)
      await addSubmitLog('> TRANSMISSION_COMPLETE ✓', 4000)

      setSubmittedId(data.testimonial.id)
      setCompletedSteps((prev) => new Set([...prev, 'submit']))
      setTimeout(() => setCurrentStep('success'), 1000)
    } catch (error) {
      if (error instanceof Error) {
        await addSubmitLog(`> ERROR: ${error.message.toUpperCase()} ✗`, 2000)
        setSubmitError(error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Navigation helpers
  const goToStep = (step: WizardStep) => {
    if (step === 'compose' && !ethosScore?.canSubmit) return
    if (step === 'category' && !content) return
    if (step === 'submit' && (!content || !category)) return
    setCurrentStep(step)
  }

  const canProceedToCompose = ethosScore?.canSubmit
  const canProceedToCategory = content.length >= 10
  const canProceedToSubmit = content.length >= 10 && category !== null

  // Step progress indicator
  const getStepStatus = (stepKey: WizardStep) => {
    if (completedSteps.has(stepKey)) return 'completed'
    if (currentStep === stepKey) return 'active'
    return 'pending'
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8 border-2 border-primary/30 p-4">
        <div className="font-terminal text-xs text-primary/60 mb-3">
          PROTOCOL_STATUS:
        </div>
        <div className="space-y-1">
          {STEPS.map((step, index) => {
            const status = getStepStatus(step.key)
            return (
              <div
                key={step.key}
                className={cn(
                  'font-mono text-sm flex items-center gap-2 transition-colors',
                  status === 'completed' && 'text-secondary',
                  status === 'active' && 'text-primary',
                  status === 'pending' && 'text-white/30'
                )}
              >
                <span className="w-4">
                  {status === 'completed' ? '✓' : status === 'active' ? '>' : ' '}
                </span>
                <span className="w-6">{index + 1}.</span>
                <span>{step.label}</span>
                {status === 'active' && (
                  <span className="text-primary/50 ml-2">
                    [{step.command}]
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 1: Connect Wallet */}
          {currentStep === 'connect' && (
            <StepConnect
              walletAddress={walletAddress}
              isConnecting={isConnecting}
              error={connectionError}
              onConnect={connectWallet}
              onTestConnect={connectTestWallet}
            />
          )}

          {/* Step 2: Verify Score */}
          {currentStep === 'verify' && (
            <StepVerify
              walletAddress={walletAddress}
              ethosScore={ethosScore}
              isVerifying={isVerifying}
              error={verifyError}
              logs={verifyLogs}
              onRetry={verifyScore}
              onProceed={() => setCurrentStep('compose')}
            />
          )}

          {/* Step 3: Compose */}
          {currentStep === 'compose' && (
            <StepCompose
              content={content}
              onContentChange={setContent}
              canProceed={canProceedToCategory}
              onBack={() => setCurrentStep('verify')}
              onProceed={() => {
                setCompletedSteps((prev) => new Set([...prev, 'compose']))
                setCurrentStep('category')
              }}
            />
          )}

          {/* Step 4: Category */}
          {currentStep === 'category' && (
            <StepCategory
              category={category}
              tags={tags}
              tagInput={tagInput}
              onCategoryChange={setCategory}
              onTagInputChange={setTagInput}
              onAddTag={addTag}
              onRemoveTag={removeTag}
              canProceed={canProceedToSubmit}
              onBack={() => setCurrentStep('compose')}
              onProceed={() => {
                setCompletedSteps((prev) => new Set([...prev, 'category']))
                setCurrentStep('submit')
              }}
            />
          )}

          {/* Step 5: Submit */}
          {currentStep === 'submit' && (
            <StepSubmit
              content={content}
              category={category!}
              tags={tags}
              ethosScore={ethosScore!}
              isSubmitting={isSubmitting}
              error={submitError}
              logs={submitLogs}
              onBack={() => setCurrentStep('category')}
              onSubmit={submitTestimonial}
            />
          )}

          {/* Success */}
          {currentStep === 'success' && (
            <StepSuccess
              submittedId={submittedId}
              ethosScore={ethosScore!}
              onComplete={onComplete}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Step 1: Connect Wallet
function StepConnect({
  walletAddress,
  isConnecting,
  error,
  onConnect,
  onTestConnect,
}: {
  walletAddress: string | null
  isConnecting: boolean
  error: string | null
  onConnect: () => void
  onTestConnect: (address: string) => void
}) {
  return (
    <div className="border-2 border-primary p-6">
      <div className="font-terminal text-2xl text-primary mb-4 neon-glow">
        {'>'} CONNECT_WEB3_WALLET
      </div>

      <div className="font-mono text-white/60 mb-6">
        Connect your Ethereum wallet to verify your Ethos credibility score.
        <br />
        <span className="text-accent">
          Your wallet address will NOT be stored with your testimonial.
        </span>
      </div>

      {walletAddress ? (
        <div className="font-mono text-secondary">
          <div className="text-sm text-white/40 mb-1">CONNECTED_ADDRESS:</div>
          <div className="text-lg">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        </div>
      ) : (
        <>
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? 'CONNECTING...' : 'CONNECT_METAMASK'}
          </Button>

          {/* Manual address input for development/testing */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="font-mono text-xs text-white/40 mb-2">
              DEV_MODE: Enter wallet address manually
            </div>
            <TestWalletButtons onSelect={onTestConnect} />
          </div>
        </>
      )}

      {error && (
        <div className="mt-4 font-mono text-sm text-destructive">
          ERROR: {error}
        </div>
      )}
    </div>
  )
}

// Test wallet buttons component
function TestWalletButtons({
  onSelect,
}: {
  onSelect: (address: string) => void
}) {
  const testWallets = [
    { label: 'LOW_SCORE (100)', address: '0x1111111111111111111111111111111111111111' },
    { label: 'VERIFIED (400)', address: '0x4444444444444444444444444444444444444444' },
    { label: 'TRUSTED (700)', address: '0x7777777777777777777777777777777777777777' },
    { label: 'ELITE (850)', address: '0x8888888888888888888888888888888888888888' },
    { label: 'LEGENDARY (950)', address: '0x9999999999999999999999999999999999999999' },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {testWallets.map((wallet) => (
        <Button
          key={wallet.address}
          variant="ghost"
          size="sm"
          onClick={() => onSelect(wallet.address)}
          className="text-xs"
        >
          {wallet.label}
        </Button>
      ))}
    </div>
  )
}

// Step 2: Verify Score
function StepVerify({
  walletAddress,
  ethosScore,
  isVerifying,
  error,
  logs,
  onRetry,
  onProceed,
}: {
  walletAddress: string | null
  ethosScore: EthosScore | null
  isVerifying: boolean
  error: string | null
  logs: string[]
  onRetry: () => void
  onProceed: () => void
}) {
  return (
    <div className="border-2 border-primary p-6">
      <div className="font-terminal text-2xl text-primary mb-4 neon-glow">
        {'>'} VERIFY_ETHOS_CREDIBILITY
      </div>

      {/* Terminal output */}
      <div className="bg-black/50 border border-primary/30 p-4 mb-6 font-mono text-sm min-h-[200px]">
        {logs.map((log, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              log.includes('OK ✓') && 'text-secondary',
              log.includes('✗') && 'text-destructive',
              log.includes('SCORE_RETRIEVED') && 'text-accent',
              log.includes('TIER_CLASSIFICATION') && 'text-accent',
              log.includes('AUTHORIZED') && 'text-secondary',
              log.includes('INSUFFICIENT') && 'text-destructive'
            )}
          >
            {log}
          </motion.div>
        ))}
        {isVerifying && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1">
            _
          </span>
        )}
      </div>

      {/* Score display */}
      {ethosScore && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 border-2 border-secondary bg-secondary/10"
        >
          <div className="font-mono text-xs text-white/40 mb-2">
            VERIFICATION_RESULT:
          </div>
          <CredibilityBadge score={ethosScore.score} />
          <div className="mt-3 font-mono text-sm text-white/60">
            STATUS: {ethosScore.canSubmit ? (
              <span className="text-secondary">AUTHORIZED_TO_SUBMIT</span>
            ) : (
              <span className="text-destructive">SUBMISSION_BLOCKED</span>
            )}
          </div>
        </motion.div>
      )}

      {/* Error state */}
      {error && !isVerifying && (
        <div className="mb-6">
          <div className="font-mono text-sm text-destructive mb-4">
            {error}
          </div>
          <Button variant="destructive" onClick={onRetry}>
            RETRY_VERIFICATION
          </Button>
        </div>
      )}

      {/* Proceed button */}
      {ethosScore?.canSubmit && (
        <Button onClick={onProceed} className="w-full">
          PROCEED_TO_COMPOSE
        </Button>
      )}
    </div>
  )
}

// Step 3: Compose
function StepCompose({
  content,
  onContentChange,
  canProceed,
  onBack,
  onProceed,
}: {
  content: string
  onContentChange: (value: string) => void
  canProceed: boolean
  onBack: () => void
  onProceed: () => void
}) {
  const charCount = content.length
  const minChars = 10
  const maxChars = 2000

  return (
    <div className="border-2 border-primary p-6">
      <div className="font-terminal text-2xl text-primary mb-4 neon-glow">
        {'>'} COMPOSE_BLANKSIG
      </div>

      <div className="font-mono text-white/60 mb-6">
        Write your anonymous testimonial. Be honest, be credible.
        <br />
        <span className="text-accent">
          Remember: Your identity will be completely stripped from this message.
        </span>
      </div>

      <Textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Enter your testimonial here..."
        className="min-h-[200px] mb-4"
        maxLength={maxChars}
      />

      <div className="flex justify-between items-center mb-6">
        <div className="font-mono text-sm">
          <span className={cn(
            charCount < minChars ? 'text-destructive' : 'text-white/40'
          )}>
            {charCount}
          </span>
          <span className="text-white/40">/{maxChars} chars</span>
          {charCount < minChars && (
            <span className="text-destructive ml-2">
              (min {minChars})
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="ghost" onClick={onBack}>
          BACK
        </Button>
        <Button
          onClick={onProceed}
          disabled={!canProceed}
          className="flex-1"
        >
          PROCEED_TO_CATEGORY
        </Button>
      </div>
    </div>
  )
}

// Step 4: Category
function StepCategory({
  category,
  tags,
  tagInput,
  onCategoryChange,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  canProceed,
  onBack,
  onProceed,
}: {
  category: BlankSigCategory | null
  tags: string[]
  tagInput: string
  onCategoryChange: (value: BlankSigCategory) => void
  onTagInputChange: (value: string) => void
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
  canProceed: boolean
  onBack: () => void
  onProceed: () => void
}) {
  return (
    <div className="border-2 border-primary p-6">
      <div className="font-terminal text-2xl text-primary mb-4 neon-glow">
        {'>'} SELECT_CATEGORY
      </div>

      <div className="font-mono text-white/60 mb-6">
        Classify your testimonial for better discoverability.
      </div>

      {/* Category selection */}
      <div className="space-y-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={cn(
              'w-full text-left px-4 py-3 font-mono text-sm border-2 transition-all',
              category === cat.value
                ? 'border-secondary text-secondary bg-secondary/10'
                : 'border-white/20 text-white/60 hover:border-primary hover:text-primary'
            )}
          >
            {cat.icon} --category={cat.label.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Tags */}
      <div className="mb-6">
        <div className="font-mono text-xs text-white/40 mb-2">
          OPTIONAL_TAGS (max 5):
        </div>
        <div className="flex gap-2 mb-2">
          <Input
            value={tagInput}
            onChange={(e) => onTagInputChange(e.target.value)}
            placeholder="add_tag"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddTag())}
            className="flex-1"
          />
          <Button
            variant="secondary"
            onClick={onAddTag}
            disabled={tags.length >= 5 || !tagInput.trim()}
          >
            ADD
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 border border-accent text-accent font-mono text-sm"
              >
                #{tag}
                <button
                  onClick={() => onRemoveTag(tag)}
                  className="text-accent/60 hover:text-destructive"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button variant="ghost" onClick={onBack}>
          BACK
        </Button>
        <Button
          onClick={onProceed}
          disabled={!canProceed}
          className="flex-1"
        >
          PROCEED_TO_SUBMIT
        </Button>
      </div>
    </div>
  )
}

// Step 5: Submit
function StepSubmit({
  content,
  category,
  tags,
  ethosScore,
  isSubmitting,
  error,
  logs,
  onBack,
  onSubmit,
}: {
  content: string
  category: BlankSigCategory
  tags: string[]
  ethosScore: EthosScore
  isSubmitting: boolean
  error: string | null
  logs: string[]
  onBack: () => void
  onSubmit: () => void
}) {
  const tier = getCredibilityTier(ethosScore.score)

  return (
    <div className="border-2 border-primary p-6">
      <div className="font-terminal text-2xl text-primary mb-4 neon-glow">
        {'>'} CONFIRM_TRANSMISSION
      </div>

      {/* Preview */}
      <div className="mb-6 p-4 border border-white/20 bg-black/50">
        <div className="font-mono text-xs text-white/40 mb-3">PREVIEW:</div>
        <div className="mb-3">
          <CredibilityBadge score={ethosScore.score} />
        </div>
        <div className="font-mono text-white/80 mb-3 whitespace-pre-wrap">
          {content}
        </div>
        <div className="font-mono text-xs text-white/40">
          Category: {category.replace('_', ' ')}
          {tags.length > 0 && (
            <span className="ml-4">
              Tags: {tags.map((t) => `#${t}`).join(' ')}
            </span>
          )}
        </div>
      </div>

      {/* Warning */}
      <div className="mb-6 p-4 border-2 border-accent bg-accent/10">
        <div className="font-terminal text-accent mb-2">ANONYMITY_NOTICE:</div>
        <div className="font-mono text-sm text-white/60">
          Once submitted, your testimonial CANNOT be traced back to you.
          Only your credibility score ({ethosScore.score} - {tier.label}) will be visible.
          This action is irreversible.
        </div>
      </div>

      {/* Terminal output */}
      {logs.length > 0 && (
        <div className="bg-black/50 border border-primary/30 p-4 mb-6 font-mono text-sm min-h-[150px]">
          {logs.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                log.includes('OK ✓') && 'text-secondary',
                log.includes('✗') && 'text-destructive',
                log.includes('BLANKSIG_ID') && 'text-accent',
                log.includes('COMPLETE') && 'text-secondary font-bold'
              )}
            >
              {log}
            </motion.div>
          ))}
          {isSubmitting && (
            <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1">
              _
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 font-mono text-sm text-destructive">
          ERROR: {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isSubmitting}
        >
          BACK
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'TRANSMITTING...' : 'EXECUTE_ANONYMOUS_SUBMIT'}
        </Button>
      </div>
    </div>
  )
}

// Success screen
function StepSuccess({
  submittedId,
  ethosScore,
  onComplete,
}: {
  submittedId: string | null
  ethosScore: EthosScore
  onComplete?: () => void
}) {
  const [showAscii, setShowAscii] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowAscii(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="border-2 border-secondary p-6 text-center">
      {/* Success ASCII */}
      {showAscii && (
        <motion.pre
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-mono text-secondary text-xs mb-6 neon-glow"
        >
{`
  ____  _    _  ____ ____ _____ ____ ____  _
 / ___|| |  | |/ ___/ ___|  ___/ ___/ ___|| |
 \\___ \\| |  | | |   \\___ \\ |\\___ \\___ \\| |
  ___) | |__| | |___ ___) |_| ___) |__) |_|
 |____/ \\____/ \\____|____/|___|____/____/(_)

`}
        </motion.pre>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="font-terminal text-2xl text-secondary mb-4 neon-glow">
          TRANSMISSION_COMPLETE
        </div>

        <div className="font-mono text-white/60 mb-6">
          Your anonymous testimonial has been successfully submitted.
        </div>

        {submittedId && (
          <div className="mb-6 p-4 border border-accent/50 inline-block">
            <div className="font-mono text-xs text-white/40 mb-1">
              BLANKSIG_ID:
            </div>
            <div className="font-mono text-accent">
              {submittedId}
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="font-mono text-xs text-white/40 mb-2">
            ATTACHED_CREDIBILITY:
          </div>
          <CredibilityBadge score={ethosScore.score} />
        </div>

        <div className="font-mono text-sm text-white/40 mb-6">
          {'>'} WALLET_DATA_PURGED ✓<br />
          {'>'} IDENTITY_STRIPPED ✓<br />
          {'>'} ANONYMITY_GUARANTEED ✓
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/browse'}
          >
            BROWSE_BLANKSIGS
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.location.reload()}
          >
            SUBMIT_ANOTHER
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, callback: (accounts: string[]) => void) => void
      removeListener: (event: string, callback: (accounts: string[]) => void) => void
    }
  }
}

/**
 * Ethos Network API Client
 *
 * This client handles all interactions with the Ethos Network API
 * to fetch user credibility scores.
 *
 * IMPORTANT: Never store wallet addresses with testimonials.
 * Only use for real-time verification during submission.
 */

import { EthosScore } from '@/types'
import { getCredibilityTier } from '@/lib/utils'

// API Configuration
const ETHOS_API_URL = process.env.ETHOS_API_URL || 'https://api.ethos.network'
const ETHOS_API_KEY = process.env.ETHOS_API_KEY

// Minimum score required to submit testimonials
const MIN_SCORE_TO_SUBMIT = 300

/**
 * Fetches the Ethos credibility score for a given wallet address
 *
 * @param walletAddress - Ethereum wallet address (0x...)
 * @returns EthosScore object with score, tier, and submission eligibility
 * @throws Error if API request fails or wallet is invalid
 */
export async function fetchEthosScore(
  walletAddress: string
): Promise<EthosScore> {
  // Validate wallet address format
  if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error('Invalid wallet address format')
  }

  // Check if API key is configured
  if (!ETHOS_API_KEY) {
    console.warn('ETHOS_API_KEY not configured. Using mock data for development.')
    return getMockEthosScore(walletAddress)
  }

  try {
    // TODO: Update with actual Ethos API endpoint structure
    // Common patterns:
    // - GET /api/v1/score/{address}
    // - GET /api/v1/profiles/{address}/score
    // - GraphQL query

    const response = await fetch(
      `${ETHOS_API_URL}/api/v1/score/${walletAddress}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ETHOS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        // User not found in Ethos - return minimum score
        return {
          score: 0,
          tier: getCredibilityTier(0),
          canSubmit: false,
        }
      }

      throw new Error(`Ethos API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // TODO: Update based on actual API response structure
    // Common response patterns:
    // - { score: number }
    // - { credibility: number }
    // - { reputation: { score: number } }

    const score = data.score || data.credibility || 0
    const tier = getCredibilityTier(score)
    const canSubmit = score >= MIN_SCORE_TO_SUBMIT

    return {
      score,
      tier,
      canSubmit,
    }
  } catch (error) {
    if (error instanceof Error) {
      // Network errors, timeouts, etc.
      console.error('Failed to fetch Ethos score:', error.message)
      throw new Error(`Unable to verify Ethos score: ${error.message}`)
    }
    throw error
  }
}

/**
 * Validates if a wallet has minimum score to submit testimonials
 *
 * @param walletAddress - Ethereum wallet address
 * @returns boolean indicating if user can submit
 */
export async function canSubmitTestimonial(
  walletAddress: string
): Promise<boolean> {
  try {
    const { canSubmit } = await fetchEthosScore(walletAddress)
    return canSubmit
  } catch (error) {
    console.error('Error validating submission eligibility:', error)
    return false
  }
}

/**
 * Batch fetch scores for multiple addresses
 * Useful for displaying testimonial authors' scores
 *
 * @param addresses - Array of wallet addresses
 * @returns Map of address to EthosScore
 */
export async function fetchBatchScores(
  addresses: string[]
): Promise<Map<string, EthosScore>> {
  const scores = new Map<string, EthosScore>()

  // TODO: Check if Ethos API supports batch requests
  // If not, use Promise.all with rate limiting

  const promises = addresses.map(async (address) => {
    try {
      const score = await fetchEthosScore(address)
      scores.set(address, score)
    } catch (error) {
      console.error(`Failed to fetch score for ${address}:`, error)
      // Set default score on error
      scores.set(address, {
        score: 0,
        tier: 'untrusted',
        canSubmit: false,
      })
    }
  })

  await Promise.all(promises)
  return scores
}

/**
 * Mock Ethos scores for development/testing
 * Returns deterministic scores based on wallet address
 *
 * REMOVE THIS IN PRODUCTION when Ethos API is configured
 */
function getMockEthosScore(walletAddress: string): EthosScore {
  // Generate deterministic score from wallet address
  const hash = walletAddress.slice(2, 10) // Take first 8 hex chars
  const numHash = parseInt(hash, 16)
  const score = numHash % 1001 // Score between 0-1000

  return {
    score,
    tier: getCredibilityTier(score),
    canSubmit: score >= MIN_SCORE_TO_SUBMIT,
  }
}

/**
 * Get tier name for display purposes
 *
 * @param tier - Tier identifier
 * @returns Human-readable tier name with emoji
 */
export function getTierDisplay(tier: string): string {
  const tierMap: Record<string, string> = {
    untrusted: '[UNTRUSTED] ⚠',
    verified: '[VERIFIED] ✓',
    trusted: '[TRUSTED] ✓✓',
    elite: '[ELITE] ★',
    legendary: '[LEGENDARY] ♔',
  }

  return tierMap[tier] || '[UNKNOWN] ?'
}

/**
 * Get tier color for UI display
 *
 * @param tier - Tier identifier
 * @returns Tailwind color class
 */
export function getTierColor(tier: string): string {
  const colorMap: Record<string, string> = {
    untrusted: 'text-tier-untrusted',
    verified: 'text-tier-verified',
    trusted: 'text-tier-trusted',
    elite: 'text-tier-elite',
    legendary: 'text-tier-legendary',
  }

  return colorMap[tier] || 'text-white'
}

/**
 * Rate limiting utilities
 * Prevents API abuse and respects Ethos API limits
 */
const requestCache = new Map<string, { score: EthosScore; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Cached version of fetchEthosScore
 * Reduces API calls during verification flow
 *
 * @param walletAddress - Ethereum wallet address
 * @returns Cached or fresh EthosScore
 */
export async function getCachedEthosScore(
  walletAddress: string
): Promise<EthosScore> {
  const cached = requestCache.get(walletAddress)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.score
  }

  const score = await fetchEthosScore(walletAddress)

  requestCache.set(walletAddress, {
    score,
    timestamp: Date.now(),
  })

  // Clean up old cache entries
  cleanCache()

  return score
}

/**
 * Cleans expired entries from request cache
 */
function cleanCache() {
  const now = Date.now()

  for (const [address, entry] of requestCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      requestCache.delete(address)
    }
  }
}

/**
 * Clear a specific wallet from cache
 * Useful after score updates
 *
 * @param walletAddress - Wallet to clear from cache
 */
export function clearScoreCache(walletAddress?: string) {
  if (walletAddress) {
    requestCache.delete(walletAddress)
  } else {
    requestCache.clear()
  }
}

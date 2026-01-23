/**
 * Ethos Network API Client
 *
 * This client handles all interactions with the Ethos Network API
 * to fetch user credibility scores.
 *
 * API Documentation: https://developers.ethos.network/
 * Quickstart: https://developers.ethos.network/api-documentation/vibe-coding-quickstart
 *
 * IMPORTANT: Never store wallet addresses with testimonials.
 * Only use for real-time verification during submission.
 */

import { EthosScore } from '@/types'
import { getCredibilityTier } from '@/lib/utils'
import { ethosLogger } from '@/lib/logger'
import {
  ETHOS_API_URL,
  ETHOS_API_KEY,
  MIN_SCORE_TO_SUBMIT,
  MAX_CREDIBILITY_SCORE,
  API_TIMEOUT_MS,
  ETHOS_CACHE_TTL_MS,
} from '@/lib/constants'

/**
 * Ethos API Response Structure
 *
 * Based on Ethos Network API documentation:
 * - The API returns a score object with credibility information
 * - Scores range from 0-1000
 * - Additional profile data may be included
 *
 * Response format:
 * {
 *   "score": number,           // Primary credibility score (0-1000)
 *   "credibility": number,     // Alternative field name (fallback)
 *   "reputation": {            // Nested structure (fallback)
 *     "score": number
 *   },
 *   "address": string,         // Wallet address (echoed back)
 *   "lastUpdated": string      // ISO timestamp
 * }
 */
interface EthosApiResponse {
  score?: number
  credibility?: number
  reputation?: {
    score?: number
  }
  address?: string
  lastUpdated?: string
  error?: string
}

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
    ethosLogger.warn('ETHOS_API_KEY not configured, using mock data')
    return getMockEthosScore(walletAddress)
  }

  try {
    // Ethos API endpoint structure:
    // GET /api/v1/score/{address} - Primary endpoint for score retrieval
    // Authentication via Bearer token in Authorization header
    const response = await fetch(
      `${ETHOS_API_URL}/api/v1/score/${walletAddress}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ETHOS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        // User not found in Ethos - return minimum score
        return {
          score: 0,
          tier: getCredibilityTier(0).label.toLowerCase(),
          canSubmit: false,
        }
      }

      throw new Error(`Ethos API error: ${response.status} ${response.statusText}`)
    }

    const data: EthosApiResponse = await response.json()

    // Extract score from response, handling multiple possible field names
    // Priority: score > credibility > reputation.score > 0
    const score = extractScoreFromResponse(data)
    const tierInfo = getCredibilityTier(score)
    const canSubmit = score >= MIN_SCORE_TO_SUBMIT

    return {
      score,
      tier: tierInfo.label.toLowerCase(),
      canSubmit,
    }
  } catch (error) {
    if (error instanceof Error) {
      ethosLogger.error('Failed to fetch Ethos score', error)
      throw new Error(`Unable to verify Ethos score: ${error.message}`)
    }
    throw error
  }
}

/**
 * Extract score from Ethos API response
 * Handles multiple possible response structures
 */
function extractScoreFromResponse(data: EthosApiResponse): number {
  // Try different field names in order of priority
  if (typeof data.score === 'number') {
    return clampScore(data.score)
  }

  if (typeof data.credibility === 'number') {
    return clampScore(data.credibility)
  }

  if (data.reputation && typeof data.reputation.score === 'number') {
    return clampScore(data.reputation.score)
  }

  // Default to 0 if no score found
  return 0
}

/**
 * Clamp score to valid range
 */
function clampScore(score: number): number {
  return Math.max(0, Math.min(MAX_CREDIBILITY_SCORE, Math.round(score)))
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
    ethosLogger.error('Error validating submission eligibility', error)
    return false
  }
}

/**
 * Batch fetch scores for multiple addresses
 * Useful for displaying testimonial authors' scores
 *
 * Note: If Ethos API supports batch requests in the future,
 * this can be optimized to use a single API call.
 * Current implementation uses Promise.allSettled for resilience.
 *
 * @param addresses - Array of wallet addresses
 * @returns Map of address to EthosScore
 */
export async function fetchBatchScores(
  addresses: string[]
): Promise<Map<string, EthosScore>> {
  const scores = new Map<string, EthosScore>()

  // Use Promise.allSettled to handle individual failures gracefully
  const results = await Promise.allSettled(
    addresses.map(async (address) => ({
      address,
      score: await fetchEthosScore(address),
    }))
  )

  for (const result of results) {
    if (result.status === 'fulfilled') {
      scores.set(result.value.address, result.value.score)
    } else {
      // Log failure but continue with other addresses
      ethosLogger.warn('Failed to fetch score in batch', {
        error: result.reason?.message,
      })
    }
  }

  // Fill in missing addresses with default scores
  for (const address of addresses) {
    if (!scores.has(address)) {
      scores.set(address, {
        score: 0,
        tier: 'untrusted',
        canSubmit: false,
      })
    }
  }

  return scores
}

/**
 * Mock Ethos scores for development/testing
 * Returns deterministic scores based on wallet address
 *
 * Test wallets for different tiers:
 * - 0x1111...1111 -> ~100 (untrusted)
 * - 0x4444...4444 -> ~400 (verified)
 * - 0x7777...7777 -> ~700 (trusted)
 * - 0x8888...8888 -> ~850 (elite)
 * - 0x9999...9999 -> ~950 (legendary)
 */
function getMockEthosScore(walletAddress: string): EthosScore {
  // Generate deterministic score from wallet address
  const hash = walletAddress.slice(2, 10)
  const numHash = parseInt(hash, 16)
  const score = numHash % (MAX_CREDIBILITY_SCORE + 1)

  return {
    score,
    tier: getCredibilityTier(score).label.toLowerCase(),
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
 *
 * SECURITY: Cache uses hashed wallet addresses as keys to prevent
 * wallet address exposure in memory dumps or debug logs
 */
const requestCache = new Map<string, { score: EthosScore; timestamp: number }>()

/**
 * Hash a wallet address for cache key
 * Uses a simple hash to anonymize the cache key
 */
async function hashForCacheKey(walletAddress: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(walletAddress.toLowerCase())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
}

/**
 * Cached version of fetchEthosScore
 * Reduces API calls during verification flow
 *
 * SECURITY: Cache keys are hashed - wallet addresses are never stored
 *
 * @param walletAddress - Ethereum wallet address
 * @returns Cached or fresh EthosScore
 */
export async function getCachedEthosScore(
  walletAddress: string
): Promise<EthosScore> {
  const cacheKey = await hashForCacheKey(walletAddress)
  const cached = requestCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < ETHOS_CACHE_TTL_MS) {
    return cached.score
  }

  const score = await fetchEthosScore(walletAddress)

  requestCache.set(cacheKey, {
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

  for (const [key, entry] of requestCache.entries()) {
    if (now - entry.timestamp > ETHOS_CACHE_TTL_MS) {
      requestCache.delete(key)
    }
  }
}

/**
 * Clear a specific wallet from cache
 * Useful after score updates
 *
 * @param walletAddress - Wallet to clear from cache (will be hashed)
 */
export async function clearScoreCache(walletAddress?: string) {
  if (walletAddress) {
    const cacheKey = await hashForCacheKey(walletAddress)
    requestCache.delete(cacheKey)
  } else {
    requestCache.clear()
  }
}

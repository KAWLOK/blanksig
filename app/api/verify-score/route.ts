/**
 * API Route: Verify Ethos Score
 *
 * POST /api/verify-score
 *
 * Verifies a user's Ethos credibility score without storing any identifying information.
 * Returns score, tier, and whether they can submit testimonials.
 *
 * SECURITY: This endpoint only reads data, never writes.
 * Wallet addresses are NEVER stored - only used for real-time verification.
 * Rate limiting prevents wallet enumeration attacks.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCachedEthosScore } from '@/lib/ethos'
import { apiLogger } from '@/lib/logger'
import { MIN_SCORE_TO_SUBMIT } from '@/lib/constants'
import type { VerifyScoreRequest } from '@/types'

/**
 * In-memory rate limiter for verification requests
 * SECURITY: Uses hashed IP + wallet to prevent enumeration attacks
 * Allows 10 requests per minute per IP
 */
const verifyRateLimits = new Map<string, { count: number; resetTime: number }>()

// Rate limit configuration
const VERIFY_RATE_LIMIT = 10
const VERIFY_RATE_WINDOW_MS = 60 * 1000
const MAX_RATE_LIMIT_ENTRIES = 10000

async function hashForRateLimit(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
}

function checkVerifyRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = verifyRateLimits.get(key)

  // Clean up old entries periodically
  if (verifyRateLimits.size > MAX_RATE_LIMIT_ENTRIES) {
    for (const [k, v] of verifyRateLimits.entries()) {
      if (v.resetTime < now) {
        verifyRateLimits.delete(k)
      }
    }
  }

  if (!entry || entry.resetTime < now) {
    verifyRateLimits.set(key, { count: 1, resetTime: now + VERIFY_RATE_WINDOW_MS })
    return false // Not rate limited
  }

  if (entry.count >= VERIFY_RATE_LIMIT) {
    return true // Rate limited
  }

  entry.count++
  return false // Not rate limited
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limit by IP to prevent enumeration attacks
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
    const rateLimitKey = await hashForRateLimit(ip)

    if (checkVerifyRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse request body
    const body: VerifyScoreRequest = await request.json()
    const { walletAddress } = body

    // Validate wallet address
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      )
    }

    // Fetch Ethos score
    const ethosScore = await getCachedEthosScore(walletAddress)

    // Return score data
    // CRITICAL: We return this data but NEVER store the wallet address
    return NextResponse.json({
      score: ethosScore.score,
      tier: ethosScore.tier,
      canSubmit: ethosScore.canSubmit,
      message: ethosScore.canSubmit
        ? 'Verification successful. You can submit testimonials.'
        : `Score too low. Minimum score required: ${MIN_SCORE_TO_SUBMIT}. Your score: ${ethosScore.score}`,
    })
  } catch (error) {
    apiLogger.error('Error verifying Ethos score', error)

    // Return user-friendly error
    return NextResponse.json(
      {
        error: 'Failed to verify Ethos score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// SECURITY: GET method removed to prevent wallet addresses appearing in
// URL logs, browser history, and server access logs.
// All verification requests must use POST with body parameters.

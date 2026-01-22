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
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCachedEthosScore } from '@/lib/ethos'
import type { VerifyScoreRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
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
        : `Score too low. Minimum score required: 300. Your score: ${ethosScore.score}`,
    })
  } catch (error) {
    console.error('Error verifying Ethos score:', error)

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

// Optionally support GET for testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const walletAddress = searchParams.get('address')

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Missing address parameter' },
      { status: 400 }
    )
  }

  try {
    const ethosScore = await getCachedEthosScore(walletAddress)

    return NextResponse.json({
      score: ethosScore.score,
      tier: ethosScore.tier,
      canSubmit: ethosScore.canSubmit,
    })
  } catch (error) {
    console.error('Error verifying Ethos score:', error)

    return NextResponse.json(
      {
        error: 'Failed to verify Ethos score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

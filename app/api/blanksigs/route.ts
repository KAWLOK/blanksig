/**
 * API Route: BlankSigs (Testimonials)
 *
 * POST /api/blanksigs - Submit anonymous testimonial
 * GET /api/blanksigs - Fetch testimonials with filters
 *
 * CRITICAL ANONYMITY GUARANTEES:
 * - Wallet addresses are used ONLY for verification
 * - Wallet addresses are NEVER stored in database
 * - Wallet addresses are NEVER logged
 * - Only Ethos score and tier are persisted
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  createBlankSig,
  getBlankSigs,
  isRateLimited,
  recordSubmission,
  hashWalletAddress,
} from '@/lib/db'
import { getCachedEthosScore } from '@/lib/ethos'
import type { SubmitBlankSigRequest, BlankSigCategory, BlankSigFilters } from '@/types'

// Content validation constants
const MIN_CONTENT_LENGTH = 10
const MAX_CONTENT_LENGTH = 2000
const MAX_TAGS = 5
const MAX_TAG_LENGTH = 30

// Valid categories
const VALID_CATEGORIES: BlankSigCategory[] = [
  'workplace',
  'product_review',
  'whistleblowing',
  'community_feedback',
  'other',
]

/**
 * POST /api/blanksigs
 * Submit a new anonymous testimonial
 *
 * Flow:
 * 1. Validate input
 * 2. Check rate limit (using wallet hash - NOT stored with testimonial)
 * 3. Verify Ethos score
 * 4. Create testimonial with ONLY score/tier (wallet address discarded)
 * 5. Record rate limit
 * 6. Return success
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: SubmitBlankSigRequest = await request.json()
    const { content, category, tags, walletAddress } = body

    // Validate required fields
    if (!content || !category || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: content, category, walletAddress' },
        { status: 400 }
      )
    }

    // Validate wallet address format
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      )
    }

    // Validate content length
    if (content.length < MIN_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Content must be at least ${MIN_CONTENT_LENGTH} characters` },
        { status: 400 }
      )
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Content must be less than ${MAX_CONTENT_LENGTH} characters` },
        { status: 400 }
      )
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate tags
    const sanitizedTags = (tags || [])
      .slice(0, MAX_TAGS)
      .map((tag) => tag.trim().toLowerCase().slice(0, MAX_TAG_LENGTH))
      .filter((tag) => tag.length > 0)

    // STEP 1: Hash wallet for rate limiting (one-way hash, cannot be reversed)
    const walletHash = await hashWalletAddress(walletAddress)

    // STEP 2: Check rate limit (1 submission per hour per wallet)
    const rateLimited = await isRateLimited(walletHash)
    if (rateLimited) {
      return NextResponse.json(
        { error: 'Rate limited. You can submit one testimonial per hour.' },
        { status: 429 }
      )
    }

    // STEP 3: Verify Ethos score
    const ethosScore = await getCachedEthosScore(walletAddress)

    if (!ethosScore.canSubmit) {
      return NextResponse.json(
        {
          error: 'Insufficient Ethos score',
          details: `Minimum score required: 300. Your score: ${ethosScore.score}`,
        },
        { status: 403 }
      )
    }

    // STEP 4: Create testimonial
    // CRITICAL: wallet address is NOT passed to createBlankSig
    // ONLY the verified score and tier are stored
    const testimonial = await createBlankSig(
      content,
      category,
      ethosScore.score, // Only the score
      ethosScore.tier,  // Only the tier
      sanitizedTags
    )

    // STEP 5: Record rate limit
    await recordSubmission(walletHash)

    // STEP 6: Return success
    // Note: wallet address is NEVER in the response
    return NextResponse.json(
      {
        success: true,
        message: 'Testimonial submitted anonymously',
        testimonial: {
          id: testimonial.id,
          ethos_score: testimonial.ethos_score,
          ethos_tier: testimonial.ethos_tier,
          created_at: testimonial.created_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating testimonial:', error)

    return NextResponse.json(
      {
        error: 'Failed to submit testimonial',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/blanksigs
 * Fetch testimonials with optional filters
 *
 * Query params:
 * - category: Filter by category
 * - minScore: Minimum Ethos score
 * - sort: 'credibility' | 'recent'
 * - page: Page number (1-indexed)
 * - limit: Results per page (default 20, max 100)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters
    const category = searchParams.get('category') as BlankSigCategory | null
    const minScoreParam = searchParams.get('minScore')
    const sort = searchParams.get('sort') as 'credibility' | 'recent' | null
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')

    // Validate category if provided
    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      )
    }

    // Parse pagination
    const page = Math.max(1, parseInt(pageParam || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(limitParam || '20', 10)))
    const offset = (page - 1) * limit

    // Parse minScore
    const minScore = minScoreParam ? parseInt(minScoreParam, 10) : undefined

    // Build filters
    const filters: BlankSigFilters = {
      category: category || undefined,
      minScore,
      sort: sort || 'recent',
    }

    // Fetch testimonials
    const { testimonials, total } = await getBlankSigs(filters, limit, offset)

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      testimonials,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    })
  } catch (error) {
    console.error('Error fetching testimonials:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch testimonials',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

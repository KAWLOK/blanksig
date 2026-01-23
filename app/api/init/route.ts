/**
 * API Route: Database Initialization
 *
 * POST /api/init - Initialize database schema
 *
 * SECURITY: This endpoint should be protected in production
 * or removed after initial deployment.
 */

import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db'

// Secret key for initialization (MUST be set in env vars)
// SECURITY: No default value - must be explicitly configured
const INIT_SECRET = process.env.INIT_SECRET

/**
 * POST /api/init
 * Initialize the database schema
 *
 * Requires secret key in Authorization header for production safety.
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require INIT_SECRET to be explicitly configured
    if (!INIT_SECRET) {
      console.error('INIT_SECRET environment variable is not configured')
      return NextResponse.json(
        { error: 'Server configuration error: INIT_SECRET not set' },
        { status: 500 }
      )
    }

    // Check authorization
    const authHeader = request.headers.get('Authorization')
    const providedSecret = authHeader?.replace('Bearer ', '')

    if (providedSecret !== INIT_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Initialize database
    await initializeDatabase()

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      tables: ['blanksigs', 'rate_limits'],
      indexes: [
        'idx_blanksigs_category',
        'idx_blanksigs_ethos_score',
        'idx_blanksigs_created_at',
      ],
    })
  } catch (error) {
    console.error('Error initializing database:', error)

    return NextResponse.json(
      {
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

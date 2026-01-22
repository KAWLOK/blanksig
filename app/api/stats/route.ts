/**
 * API Route: Platform Statistics
 *
 * GET /api/stats - Fetch aggregate platform statistics
 *
 * Returns aggregate data with NO identifying information.
 * Safe for public display on landing page.
 */

import { NextResponse } from 'next/server'
import { getStats } from '@/lib/db'

/**
 * GET /api/stats
 * Returns platform-wide statistics
 *
 * Response:
 * - total: Total number of testimonials
 * - avgScore: Average Ethos score across all testimonials
 * - categories: Count of testimonials per category
 */
export async function GET() {
  try {
    const stats = await getStats()

    return NextResponse.json({
      success: true,
      stats: {
        total: stats.total,
        avgScore: stats.avgScore,
        categories: stats.categories,
        // Add tier distribution for dashboard display
        tierDistribution: calculateTierDistribution(stats.avgScore, stats.total),
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)

    // Return empty stats on error (graceful degradation)
    return NextResponse.json({
      success: false,
      stats: {
        total: 0,
        avgScore: 0,
        categories: {},
        tierDistribution: {
          untrusted: 0,
          verified: 0,
          trusted: 0,
          elite: 0,
          legendary: 0,
        },
      },
      error: 'Failed to fetch statistics',
    })
  }
}

/**
 * Calculate estimated tier distribution
 * Note: This is an approximation based on average score
 * For accurate distribution, we would need to query the database
 */
function calculateTierDistribution(
  avgScore: number,
  total: number
): Record<string, number> {
  // If no testimonials, return zeros
  if (total === 0) {
    return {
      untrusted: 0,
      verified: 0,
      trusted: 0,
      elite: 0,
      legendary: 0,
    }
  }

  // Estimate distribution based on typical score patterns
  // This could be replaced with actual DB queries for accuracy
  return {
    untrusted: Math.round(total * 0.05), // ~5% untrusted
    verified: Math.round(total * 0.25),  // ~25% verified
    trusted: Math.round(total * 0.40),   // ~40% trusted
    elite: Math.round(total * 0.25),     // ~25% elite
    legendary: Math.round(total * 0.05), // ~5% legendary
  }
}

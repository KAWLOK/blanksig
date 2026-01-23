/**
 * Application Constants
 *
 * Centralized configuration values to avoid magic numbers
 * and enable easy adjustments across the codebase.
 */

// =============================================================================
// ETHOS API CONFIGURATION
// =============================================================================

/** Base URL for Ethos Network API */
export const ETHOS_API_URL = process.env.ETHOS_API_URL || 'https://api.ethos.network'

/** API key for Ethos Network (server-side only) */
export const ETHOS_API_KEY = process.env.ETHOS_API_KEY

/** Minimum credibility score required to submit testimonials */
export const MIN_SCORE_TO_SUBMIT = 300

/** Maximum possible credibility score */
export const MAX_CREDIBILITY_SCORE = 1000

/** API request timeout in milliseconds */
export const API_TIMEOUT_MS = 10000

/** Cache TTL for Ethos scores in milliseconds (5 minutes) */
export const ETHOS_CACHE_TTL_MS = 5 * 60 * 1000

// =============================================================================
// CONTENT VALIDATION
// =============================================================================

/** Minimum testimonial content length */
export const MIN_CONTENT_LENGTH = 10

/** Maximum testimonial content length */
export const MAX_CONTENT_LENGTH = 2000

/** Maximum number of tags per testimonial */
export const MAX_TAGS = 5

/** Maximum length of a single tag */
export const MAX_TAG_LENGTH = 30

/** Maximum length of search query */
export const MAX_SEARCH_LENGTH = 100

// =============================================================================
// RATE LIMITING
// =============================================================================

/** Rate limit window in milliseconds (1 hour) */
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

/** Maximum submissions per wallet per rate limit window */
export const MAX_SUBMISSIONS_PER_WINDOW = 1

// =============================================================================
// PAGINATION
// =============================================================================

/** Default number of results per page */
export const DEFAULT_PAGE_SIZE = 20

/** Maximum results per page */
export const MAX_PAGE_SIZE = 100

/** Results per page on browse page */
export const BROWSE_PAGE_SIZE = 12

// =============================================================================
// CREDIBILITY TIERS
// =============================================================================

/** Credibility tier thresholds and configuration */
export const CREDIBILITY_TIERS = {
  UNTRUSTED: {
    min: 0,
    max: 300,
    label: 'UNTRUSTED',
    color: 'tier-untrusted',
    icon: '⚠',
  },
  VERIFIED: {
    min: 301,
    max: 600,
    label: 'VERIFIED',
    color: 'tier-verified',
    icon: '✓',
  },
  TRUSTED: {
    min: 601,
    max: 800,
    label: 'TRUSTED',
    color: 'tier-trusted',
    icon: '✓✓',
  },
  ELITE: {
    min: 801,
    max: 900,
    label: 'ELITE',
    color: 'tier-elite',
    icon: '★',
  },
  LEGENDARY: {
    min: 901,
    max: 1000,
    label: 'LEGENDARY',
    color: 'tier-legendary',
    icon: '♔',
  },
} as const

// =============================================================================
// CATEGORIES
// =============================================================================

/** Valid testimonial categories */
export const VALID_CATEGORIES = [
  'workplace',
  'product_review',
  'whistleblowing',
  'community_feedback',
  'other',
] as const

export type BlankSigCategory = (typeof VALID_CATEGORIES)[number]

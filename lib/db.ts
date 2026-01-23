/**
 * Database Client for BlankSig
 *
 * CRITICAL ANONYMITY REQUIREMENTS:
 * - NEVER store wallet addresses with testimonials
 * - NEVER log wallet addresses with testimonials
 * - NEVER associate any identifying data with testimonials
 * - ONLY store: content, category, Ethos score, tier, tags, timestamp
 *
 * This module handles all database operations for the BlankSig platform.
 */

import { sql } from '@vercel/postgres'
import type { BlankSig, BlankSigCategory, BlankSigFilters } from '@/types'

/**
 * Initialize the database schema
 * SECURITY: Note that there are NO identifying fields in this schema
 */
export async function initializeDatabase(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS blanksigs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      content TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      ethos_score INTEGER NOT NULL,
      ethos_tier VARCHAR(20) NOT NULL,
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `

  // Create indexes for common queries
  await sql`
    CREATE INDEX IF NOT EXISTS idx_blanksigs_category ON blanksigs(category)
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_blanksigs_ethos_score ON blanksigs(ethos_score)
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_blanksigs_created_at ON blanksigs(created_at)
  `

  // Rate limiting table - stores HASHED wallet addresses only
  // Hash is used to prevent duplicate submissions, not to identify users
  await sql`
    CREATE TABLE IF NOT EXISTS rate_limits (
      wallet_hash VARCHAR(64) PRIMARY KEY,
      last_submission TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `
}

/**
 * Create a new anonymous testimonial
 *
 * CRITICAL: This function ONLY receives the data that will be stored.
 * The wallet address is NEVER passed to this function.
 *
 * @param content - Testimonial content
 * @param category - Category of the testimonial
 * @param ethosScore - Verified Ethos score (number, not wallet)
 * @param ethosTier - Credibility tier
 * @param tags - Optional tags
 * @returns Created BlankSig record
 */
export async function createBlankSig(
  content: string,
  category: BlankSigCategory,
  ethosScore: number,
  ethosTier: string,
  tags: string[] = []
): Promise<BlankSig> {
  // SECURITY: Sanitize tags to prevent SQL injection
  // Only allow alphanumeric characters, spaces, hyphens, and underscores
  const sanitizedTags = tags
    .map((t) => t.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim())
    .filter((t) => t.length > 0 && t.length <= 30)
    .slice(0, 5)

  // Use JSON.stringify for safe array conversion, then cast to text[]
  // This properly escapes all special characters
  const tagsJson = JSON.stringify(sanitizedTags)

  const result = await sql`
    INSERT INTO blanksigs (content, category, ethos_score, ethos_tier, tags)
    VALUES (${content}, ${category}, ${ethosScore}, ${ethosTier},
            (SELECT array_agg(value) FROM json_array_elements_text(${tagsJson}::json)))
    RETURNING id, content, category, ethos_score, ethos_tier, tags, created_at
  `

  const row = result.rows[0]
  return {
    id: row.id,
    content: row.content,
    category: row.category,
    ethos_score: row.ethos_score,
    ethos_tier: row.ethos_tier,
    tags: row.tags || [],
    created_at: row.created_at.toISOString(),
  }
}

/**
 * Fetch testimonials with filtering, search, and pagination
 *
 * @param filters - Query filters including search
 * @param limit - Number of results per page
 * @param offset - Pagination offset
 * @returns Array of BlankSig records
 */
export async function getBlankSigs(
  filters: BlankSigFilters = {},
  limit: number = 20,
  offset: number = 0
): Promise<{ testimonials: BlankSig[]; total: number }> {
  const { category, minScore, sort = 'recent', search } = filters

  // Sanitize search term for ILIKE pattern matching
  const searchPattern = search
    ? `%${search.replace(/[%_]/g, '\\$&').toLowerCase()}%`
    : null

  // Build dynamic query based on filters
  let testimonials: BlankSig[]
  let total: number

  // Get total count for pagination with all filters
  if (searchPattern && category && minScore !== undefined) {
    const countResult = await sql`
      SELECT COUNT(*) as total FROM blanksigs
      WHERE category = ${category}
        AND ethos_score >= ${minScore}
        AND (LOWER(content) LIKE ${searchPattern} OR EXISTS (
          SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE ${searchPattern}
        ))
    `
    total = parseInt(countResult.rows[0].total, 10)
  } else if (searchPattern && category) {
    const countResult = await sql`
      SELECT COUNT(*) as total FROM blanksigs
      WHERE category = ${category}
        AND (LOWER(content) LIKE ${searchPattern} OR EXISTS (
          SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE ${searchPattern}
        ))
    `
    total = parseInt(countResult.rows[0].total, 10)
  } else if (searchPattern && minScore !== undefined) {
    const countResult = await sql`
      SELECT COUNT(*) as total FROM blanksigs
      WHERE ethos_score >= ${minScore}
        AND (LOWER(content) LIKE ${searchPattern} OR EXISTS (
          SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE ${searchPattern}
        ))
    `
    total = parseInt(countResult.rows[0].total, 10)
  } else if (searchPattern) {
    const countResult = await sql`
      SELECT COUNT(*) as total FROM blanksigs
      WHERE LOWER(content) LIKE ${searchPattern} OR EXISTS (
        SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE ${searchPattern}
      )
    `
    total = parseInt(countResult.rows[0].total, 10)
  } else if (category && minScore !== undefined) {
    const countResult = await sql`
      SELECT COUNT(*) as total FROM blanksigs
      WHERE category = ${category} AND ethos_score >= ${minScore}
    `
    total = parseInt(countResult.rows[0].total, 10)
  } else if (category) {
    const countResult = await sql`
      SELECT COUNT(*) as total FROM blanksigs WHERE category = ${category}
    `
    total = parseInt(countResult.rows[0].total, 10)
  } else if (minScore !== undefined) {
    const countResult = await sql`
      SELECT COUNT(*) as total FROM blanksigs WHERE ethos_score >= ${minScore}
    `
    total = parseInt(countResult.rows[0].total, 10)
  } else {
    const countResult = await sql`SELECT COUNT(*) as total FROM blanksigs`
    total = parseInt(countResult.rows[0].total, 10)
  }

  // Fetch filtered results with search
  let result
  if (searchPattern) {
    // Queries with search
    if (category && minScore !== undefined) {
      if (sort === 'credibility') {
        result = await sql`
          SELECT id, content, category, ethos_score, ethos_tier, tags, created_at
          FROM blanksigs
          WHERE category = ${category}
            AND ethos_score >= ${minScore}
            AND (LOWER(content) LIKE ${searchPattern} OR EXISTS (
              SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE ${searchPattern}
            ))
          ORDER BY ethos_score DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        result = await sql`
          SELECT id, content, category, ethos_score, ethos_tier, tags, created_at
          FROM blanksigs
          WHERE category = ${category}
            AND ethos_score >= ${minScore}
            AND (LOWER(content) LIKE ${searchPattern} OR EXISTS (
              SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE ${searchPattern}
            ))
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    } else if (category) {
      if (sort === 'credibility') {
        result = await sql`
          SELECT id, content, category, ethos_score, ethos_tier, tags, created_at
          FROM blanksigs
          WHERE category = ${category}
            AND (LOWER(content) LIKE ${searchPattern} OR EXISTS (
              SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE ${searchPattern}
            ))
          ORDER BY ethos_score DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        result = await sql`
          SELECT id, content, category, ethos_score, ethos_tier, tags, created_at
          FROM blanksigs
          WHERE category = ${category}
            AND (LOWER(content) LIKE ${searchPattern} OR EXISTS (
              SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE ${searchPattern}
            ))
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    } else if (minScore !== undefined) {
      if (sort === 'credibility') {
        result = await sql`
          SELECT id, content, category, ethos_score, ethos_tier, tags, created_at
          FROM blanksigs
          WHERE ethos_score >= ${minScore}
            AND (LOWER(content) LIKE ${searchPattern} OR EXISTS (
              SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE ${searchPattern}
            ))
          ORDER BY ethos_score DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        result = await sql`
          SELECT id, content, category, ethos_score, ethos_tier, tags, created_at
          FROM blanksigs
          WHERE ethos_score >= ${minScore}
            AND (LOWER(content) LIKE ${searchPattern} OR EXISTS (
              SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE ${searchPattern}
            ))
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    } else {
      if (sort === 'credibility') {
        result = await sql`
          SELECT id, content, category, ethos_score, ethos_tier, tags, created_at
          FROM blanksigs
          WHERE LOWER(content) LIKE ${searchPattern} OR EXISTS (
            SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE ${searchPattern}
          )
          ORDER BY ethos_score DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        result = await sql`
          SELECT id, content, category, ethos_score, ethos_tier, tags, created_at
          FROM blanksigs
          WHERE LOWER(content) LIKE ${searchPattern} OR EXISTS (
            SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE ${searchPattern}
          )
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    }
  } else {
    // Queries without search (original logic)
    if (category && minScore !== undefined) {
      if (sort === 'credibility') {
        result = await sql`
          SELECT id, content, category, ethos_score, ethos_tier, tags, created_at
          FROM blanksigs
          WHERE category = ${category} AND ethos_score >= ${minScore}
          ORDER BY ethos_score DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        result = await sql`
          SELECT id, content, category, ethos_score, ethos_tier, tags, created_at
          FROM blanksigs
          WHERE category = ${category} AND ethos_score >= ${minScore}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    } else if (category) {
      if (sort === 'credibility') {
        result = await sql`
          SELECT id, content, category, ethos_score, ethos_tier, tags, created_at
          FROM blanksigs
          WHERE category = ${category}
          ORDER BY ethos_score DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        result = await sql`
          SELECT id, content, category, ethos_score, ethos_tier, tags, created_at
          FROM blanksigs
          WHERE category = ${category}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    } else if (minScore !== undefined) {
      if (sort === 'credibility') {
        result = await sql`
          SELECT id, content, category, ethos_score, ethos_tier, tags, created_at
          FROM blanksigs
          WHERE ethos_score >= ${minScore}
          ORDER BY ethos_score DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        result = await sql`
          SELECT id, content, category, ethos_score, ethos_tier, tags, created_at
          FROM blanksigs
          WHERE ethos_score >= ${minScore}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    } else {
      if (sort === 'credibility') {
        result = await sql`
          SELECT id, content, category, ethos_score, ethos_tier, tags, created_at
          FROM blanksigs
          ORDER BY ethos_score DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        result = await sql`
          SELECT id, content, category, ethos_score, ethos_tier, tags, created_at
          FROM blanksigs
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    }
  }

  testimonials = result.rows.map((row) => ({
    id: row.id,
    content: row.content,
    category: row.category,
    ethos_score: row.ethos_score,
    ethos_tier: row.ethos_tier,
    tags: row.tags || [],
    created_at: row.created_at.toISOString(),
  }))

  return { testimonials, total }
}

/**
 * Get a single testimonial by ID
 *
 * @param id - Testimonial UUID
 * @returns BlankSig record or null
 */
export async function getBlankSigById(id: string): Promise<BlankSig | null> {
  const result = await sql`
    SELECT id, content, category, ethos_score, ethos_tier, tags, created_at
    FROM blanksigs
    WHERE id = ${id}
  `

  if (result.rows.length === 0) {
    return null
  }

  const row = result.rows[0]
  return {
    id: row.id,
    content: row.content,
    category: row.category,
    ethos_score: row.ethos_score,
    ethos_tier: row.ethos_tier,
    tags: row.tags || [],
    created_at: row.created_at.toISOString(),
  }
}

/**
 * Check rate limit for a wallet (using hash)
 *
 * @param walletHash - SHA-256 hash of wallet address
 * @returns true if rate limited, false if can submit
 */
export async function isRateLimited(walletHash: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const result = await sql`
    SELECT last_submission FROM rate_limits
    WHERE wallet_hash = ${walletHash}
    AND last_submission > ${oneHourAgo}::timestamp with time zone
  `

  return result.rows.length > 0
}

/**
 * Record a submission for rate limiting
 *
 * @param walletHash - SHA-256 hash of wallet address
 */
export async function recordSubmission(walletHash: string): Promise<void> {
  await sql`
    INSERT INTO rate_limits (wallet_hash, last_submission)
    VALUES (${walletHash}, NOW())
    ON CONFLICT (wallet_hash)
    DO UPDATE SET last_submission = NOW()
  `
}

/**
 * Get platform statistics
 * Returns aggregate data with no identifying information
 */
export async function getStats(): Promise<{
  total: number
  avgScore: number
  categories: Record<string, number>
}> {
  const totalResult = await sql`SELECT COUNT(*) as total FROM blanksigs`
  const avgResult = await sql`SELECT AVG(ethos_score) as avg FROM blanksigs`
  const categoriesResult = await sql`
    SELECT category, COUNT(*) as count
    FROM blanksigs
    GROUP BY category
  `

  const categories: Record<string, number> = {}
  for (const row of categoriesResult.rows) {
    categories[row.category] = parseInt(row.count, 10)
  }

  return {
    total: parseInt(totalResult.rows[0].total, 10) || 0,
    avgScore: Math.round(parseFloat(avgResult.rows[0].avg) || 0),
    categories,
  }
}

/**
 * Hash a wallet address for rate limiting
 * Uses SHA-256 to create a one-way hash
 *
 * @param walletAddress - Ethereum wallet address
 * @returns SHA-256 hash of the address
 */
export async function hashWalletAddress(walletAddress: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(walletAddress.toLowerCase())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

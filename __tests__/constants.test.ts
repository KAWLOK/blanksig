import { describe, it, expect } from 'vitest'
import {
  MIN_SCORE_TO_SUBMIT,
  MAX_CREDIBILITY_SCORE,
  MIN_CONTENT_LENGTH,
  MAX_CONTENT_LENGTH,
  MAX_TAGS,
  MAX_TAG_LENGTH,
  MAX_SEARCH_LENGTH,
  RATE_LIMIT_WINDOW_MS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  VALID_CATEGORIES,
  CREDIBILITY_TIERS,
  API_TIMEOUT_MS,
  ETHOS_CACHE_TTL_MS,
} from '../lib/constants'

describe('Application Constants', () => {
  describe('Ethos API Configuration', () => {
    it('should have valid score thresholds', () => {
      expect(MIN_SCORE_TO_SUBMIT).toBe(300)
      expect(MAX_CREDIBILITY_SCORE).toBe(1000)
      expect(MIN_SCORE_TO_SUBMIT).toBeLessThan(MAX_CREDIBILITY_SCORE)
    })

    it('should have reasonable API timeout', () => {
      expect(API_TIMEOUT_MS).toBeGreaterThan(0)
      expect(API_TIMEOUT_MS).toBeLessThanOrEqual(30000) // Max 30 seconds
    })

    it('should have reasonable cache TTL', () => {
      expect(ETHOS_CACHE_TTL_MS).toBeGreaterThan(0)
      expect(ETHOS_CACHE_TTL_MS).toBe(5 * 60 * 1000) // 5 minutes
    })
  })

  describe('Content Validation', () => {
    it('should have valid content length bounds', () => {
      expect(MIN_CONTENT_LENGTH).toBeGreaterThan(0)
      expect(MAX_CONTENT_LENGTH).toBeGreaterThan(MIN_CONTENT_LENGTH)
    })

    it('should have reasonable tag limits', () => {
      expect(MAX_TAGS).toBeGreaterThan(0)
      expect(MAX_TAGS).toBeLessThanOrEqual(10)
      expect(MAX_TAG_LENGTH).toBeGreaterThan(0)
    })

    it('should have reasonable search length', () => {
      expect(MAX_SEARCH_LENGTH).toBeGreaterThan(0)
      expect(MAX_SEARCH_LENGTH).toBeLessThanOrEqual(200)
    })
  })

  describe('Rate Limiting', () => {
    it('should have valid rate limit window', () => {
      expect(RATE_LIMIT_WINDOW_MS).toBe(60 * 60 * 1000) // 1 hour
    })
  })

  describe('Pagination', () => {
    it('should have valid page size defaults', () => {
      expect(DEFAULT_PAGE_SIZE).toBeGreaterThan(0)
      expect(MAX_PAGE_SIZE).toBeGreaterThan(DEFAULT_PAGE_SIZE)
    })
  })

  describe('Categories', () => {
    it('should have all required categories', () => {
      expect(VALID_CATEGORIES).toContain('workplace')
      expect(VALID_CATEGORIES).toContain('product_review')
      expect(VALID_CATEGORIES).toContain('whistleblowing')
      expect(VALID_CATEGORIES).toContain('community_feedback')
      expect(VALID_CATEGORIES).toContain('other')
    })

    it('should be a readonly array', () => {
      expect(Array.isArray(VALID_CATEGORIES)).toBe(true)
      expect(VALID_CATEGORIES.length).toBe(5)
    })
  })

  describe('Credibility Tiers', () => {
    it('should have all tier levels', () => {
      expect(CREDIBILITY_TIERS.UNTRUSTED).toBeDefined()
      expect(CREDIBILITY_TIERS.VERIFIED).toBeDefined()
      expect(CREDIBILITY_TIERS.TRUSTED).toBeDefined()
      expect(CREDIBILITY_TIERS.ELITE).toBeDefined()
      expect(CREDIBILITY_TIERS.LEGENDARY).toBeDefined()
    })

    it('should have non-overlapping score ranges', () => {
      expect(CREDIBILITY_TIERS.UNTRUSTED.max).toBeLessThan(CREDIBILITY_TIERS.VERIFIED.min)
      expect(CREDIBILITY_TIERS.VERIFIED.max).toBeLessThan(CREDIBILITY_TIERS.TRUSTED.min)
      expect(CREDIBILITY_TIERS.TRUSTED.max).toBeLessThan(CREDIBILITY_TIERS.ELITE.min)
      expect(CREDIBILITY_TIERS.ELITE.max).toBeLessThan(CREDIBILITY_TIERS.LEGENDARY.min)
    })

    it('should cover the full score range', () => {
      expect(CREDIBILITY_TIERS.UNTRUSTED.min).toBe(0)
      expect(CREDIBILITY_TIERS.LEGENDARY.max).toBe(1000)
    })
  })
})

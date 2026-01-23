import { describe, it, expect } from 'vitest'
import { cn, getCredibilityTier, CREDIBILITY_TIERS } from '../lib/utils'

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('should merge class names', () => {
      const result = cn('foo', 'bar')
      expect(result).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      const result = cn('foo', false && 'bar', 'baz')
      expect(result).toBe('foo baz')
    })

    it('should merge Tailwind classes properly', () => {
      const result = cn('px-2 py-1', 'px-4')
      expect(result).toBe('py-1 px-4')
    })
  })

  describe('getCredibilityTier', () => {
    it('should return UNTRUSTED for scores 0-300', () => {
      expect(getCredibilityTier(0).label).toBe('UNTRUSTED')
      expect(getCredibilityTier(150).label).toBe('UNTRUSTED')
      expect(getCredibilityTier(300).label).toBe('UNTRUSTED')
    })

    it('should return VERIFIED for scores 301-600', () => {
      expect(getCredibilityTier(301).label).toBe('VERIFIED')
      expect(getCredibilityTier(450).label).toBe('VERIFIED')
      expect(getCredibilityTier(600).label).toBe('VERIFIED')
    })

    it('should return TRUSTED for scores 601-800', () => {
      expect(getCredibilityTier(601).label).toBe('TRUSTED')
      expect(getCredibilityTier(700).label).toBe('TRUSTED')
      expect(getCredibilityTier(800).label).toBe('TRUSTED')
    })

    it('should return ELITE for scores 801-900', () => {
      expect(getCredibilityTier(801).label).toBe('ELITE')
      expect(getCredibilityTier(850).label).toBe('ELITE')
      expect(getCredibilityTier(900).label).toBe('ELITE')
    })

    it('should return LEGENDARY for scores 901-1000', () => {
      expect(getCredibilityTier(901).label).toBe('LEGENDARY')
      expect(getCredibilityTier(950).label).toBe('LEGENDARY')
      expect(getCredibilityTier(1000).label).toBe('LEGENDARY')
    })

    it('should have correct icons for each tier', () => {
      expect(CREDIBILITY_TIERS.UNTRUSTED.icon).toBe('⚠')
      expect(CREDIBILITY_TIERS.VERIFIED.icon).toBe('✓')
      expect(CREDIBILITY_TIERS.TRUSTED.icon).toBe('✓✓')
      expect(CREDIBILITY_TIERS.ELITE.icon).toBe('★')
      expect(CREDIBILITY_TIERS.LEGENDARY.icon).toBe('♔')
    })
  })
})

import { describe, it, expect } from 'vitest'
import {
  moderateContent,
  sanitizeContent,
  getModerationErrorMessage,
  quickContentCheck,
} from '../lib/moderation'

describe('Content Moderation', () => {
  describe('moderateContent', () => {
    it('should allow clean content', () => {
      const result = moderateContent('This is a helpful and constructive review of the product.')
      expect(result.isClean).toBe(true)
      expect(result.flags).toHaveLength(0)
      expect(result.sanitizedContent).toBeDefined()
    })

    it('should flag profanity', () => {
      const result = moderateContent('This product is shit.')
      expect(result.flags.some(f => f.type === 'profanity')).toBe(true)
    })

    it('should block content with multiple profanity words (high severity)', () => {
      // 3+ profanity words = high severity = blocked
      // Using words that match exactly with word boundaries
      const result = moderateContent('What a shit ass damn situation this is.')
      expect(result.isClean).toBe(false)
      expect(result.flags.some(f => f.type === 'profanity')).toBe(true)
    })

    it('should detect hate speech patterns', () => {
      const result = moderateContent('Death to all enemies of freedom.')
      expect(result.isClean).toBe(false)
      expect(result.flags.some(f => f.type === 'hate_speech')).toBe(true)
    })

    it('should flag spam-like content', () => {
      const result = moderateContent('Work from home! Make money fast!')
      expect(result.flags.some(f => f.type === 'spam')).toBe(true)
    })

    it('should detect excessive caps', () => {
      const result = moderateContent('THIS ENTIRE MESSAGE IS IN ALL CAPS AND VERY LOUD')
      expect(result.flags.some(f => f.type === 'excessive_caps')).toBe(true)
    })

    it('should detect link spam (more than 2 URLs)', () => {
      const result = moderateContent(
        'Check out https://example1.com and https://example2.com and https://example3.com'
      )
      expect(result.flags.some(f => f.type === 'link_spam')).toBe(true)
    })

    it('should allow up to 2 URLs', () => {
      const result = moderateContent(
        'Check out https://example1.com and https://example2.com for more info.'
      )
      expect(result.flags.some(f => f.type === 'link_spam')).toBe(false)
    })

    it('should block content with multiple medium-severity issues', () => {
      // Profanity (medium) + link spam (medium) = blocked
      const result = moderateContent(
        'This is shit check https://a.com https://b.com https://c.com'
      )
      expect(result.isClean).toBe(false)
    })
  })

  describe('sanitizeContent', () => {
    it('should remove excessive whitespace', () => {
      const result = sanitizeContent('Hello    world.   How are   you?')
      expect(result).toBe('Hello world. How are you?')
    })

    it('should trim content', () => {
      const result = sanitizeContent('   Hello world.   ')
      expect(result).toBe('Hello world.')
    })

    it('should limit URLs to 2', () => {
      const content = 'Links: https://a.com https://b.com https://c.com https://d.com'
      const result = sanitizeContent(content)
      expect((result.match(/https:\/\//g) || []).length).toBeLessThanOrEqual(2)
    })
  })

  describe('getModerationErrorMessage', () => {
    it('should return empty string for clean content', () => {
      const result = moderateContent('This is clean content.')
      const message = getModerationErrorMessage(result)
      expect(message).toBe('')
    })

    it('should return error message for blocked content (hate speech)', () => {
      const result = moderateContent('Death to all enemies.')
      const message = getModerationErrorMessage(result)
      expect(message).toBeTruthy()
      expect(message.length).toBeGreaterThan(0)
    })
  })

  describe('quickContentCheck', () => {
    it('should return no issues for clean content', () => {
      const result = quickContentCheck('This is a normal, helpful review.')
      expect(result.hasIssues).toBe(false)
      expect(result.warnings).toHaveLength(0)
    })

    it('should warn about inappropriate language', () => {
      const result = quickContentCheck('This product is shit.')
      expect(result.hasIssues).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('should warn about excessive caps', () => {
      const result = quickContentCheck('THIS IS ALL CAPS WHICH IS VERY ANNOYING')
      expect(result.warnings.some(w => w.includes('capital'))).toBe(true)
    })

    it('should warn about too many links', () => {
      const result = quickContentCheck(
        'Link spam: https://a.com https://b.com https://c.com'
      )
      expect(result.warnings.some(w => w.includes('link'))).toBe(true)
    })
  })
})

/**
 * Content Moderation for BlankSig
 *
 * Provides filtering for:
 * - Profanity and hate speech
 * - Spam patterns
 * - Excessive caps/symbols
 * - URL/link spam
 */

// Common profanity words (basic list - can be expanded)
const PROFANITY_LIST = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'bastard', 'dick', 'cock',
  'pussy', 'cunt', 'whore', 'slut', 'fag', 'nigger', 'nigga', 'retard',
  'kike', 'spic', 'chink', 'wetback', 'cracker',
]

// Hate speech patterns
const HATE_PATTERNS = [
  /\b(kill|murder|rape|lynch)\s+(all|every|those)\s+\w+/i,
  /\bdeath\s+to\s+\w+/i,
  /\b(hate|destroy)\s+(all|every)\s+(jews|blacks|whites|muslims|christians|gays|women|men)/i,
]

// Spam patterns
const SPAM_PATTERNS = [
  /(.)\1{5,}/,                          // Repeated characters (aaaaaaaa)
  /\b(buy|click|free|winner|won|prize|lottery)\b.*\b(now|here|today)\b/i,
  /\$\d+[kK]?\+?\s*(per|a)\s*(day|week|month|hour)/i, // Money spam
  /\b(casino|poker|gambling|bet)\b/i,
  /\bsex\s*(chat|video|cam|dating)/i,
  /\b(viagra|cialis|pharmacy|pills)\b/i,
  /\b(work\s*from\s*home|make\s*money\s*fast|get\s*rich\s*quick)\b/i,
]

// URL patterns (to limit link spam)
const URL_PATTERN = /https?:\/\/[^\s]+/gi

export interface ModerationResult {
  isClean: boolean
  flags: ModerationFlag[]
  sanitizedContent?: string
}

export interface ModerationFlag {
  type: 'profanity' | 'hate_speech' | 'spam' | 'excessive_caps' | 'link_spam' | 'low_effort'
  severity: 'low' | 'medium' | 'high'
  reason: string
}

/**
 * Moderate content and check for violations
 */
export function moderateContent(content: string): ModerationResult {
  const flags: ModerationFlag[] = []
  const lowerContent = content.toLowerCase()

  // Check for profanity
  const profanityFound = PROFANITY_LIST.filter((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    return regex.test(content)
  })

  if (profanityFound.length > 0) {
    flags.push({
      type: 'profanity',
      severity: profanityFound.length > 2 ? 'high' : 'medium',
      reason: `Contains profanity: ${profanityFound.slice(0, 3).join(', ')}${profanityFound.length > 3 ? '...' : ''}`,
    })
  }

  // Check for hate speech patterns
  for (const pattern of HATE_PATTERNS) {
    if (pattern.test(content)) {
      flags.push({
        type: 'hate_speech',
        severity: 'high',
        reason: 'Contains hate speech or violent threats',
      })
      break
    }
  }

  // Check for spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      flags.push({
        type: 'spam',
        severity: 'medium',
        reason: 'Contains spam-like content',
      })
      break
    }
  }

  // Check for excessive caps (more than 50% uppercase in content > 20 chars)
  if (content.length > 20) {
    const letters = content.replace(/[^a-zA-Z]/g, '')
    const uppercase = letters.replace(/[^A-Z]/g, '')
    if (letters.length > 0 && uppercase.length / letters.length > 0.5) {
      flags.push({
        type: 'excessive_caps',
        severity: 'low',
        reason: 'Excessive use of capital letters',
      })
    }
  }

  // Check for link spam (more than 2 URLs)
  const urls = content.match(URL_PATTERN) || []
  if (urls.length > 2) {
    flags.push({
      type: 'link_spam',
      severity: 'medium',
      reason: `Contains ${urls.length} URLs (max 2 allowed)`,
    })
  }

  // Check for low effort (very short or just symbols)
  const alphanumeric = content.replace(/[^a-zA-Z0-9]/g, '')
  if (alphanumeric.length < 10 && content.length >= 10) {
    flags.push({
      type: 'low_effort',
      severity: 'low',
      reason: 'Content appears to be low effort or mostly symbols',
    })
  }

  // Determine if content should be blocked
  const highSeverityFlags = flags.filter((f) => f.severity === 'high')
  const mediumSeverityFlags = flags.filter((f) => f.severity === 'medium')

  // Block if any high severity or 2+ medium severity flags
  const isClean = highSeverityFlags.length === 0 && mediumSeverityFlags.length < 2

  return {
    isClean,
    flags,
    sanitizedContent: isClean ? sanitizeContent(content) : undefined,
  }
}

/**
 * Sanitize content by removing/masking problematic content
 * Used for content that passes moderation but needs cleanup
 */
export function sanitizeContent(content: string): string {
  let sanitized = content

  // Limit URLs to max 2
  const urls = content.match(URL_PATTERN) || []
  if (urls.length > 2) {
    urls.slice(2).forEach((url) => {
      sanitized = sanitized.replace(url, '[link removed]')
    })
  }

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim()

  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')

  return sanitized
}

/**
 * Get a user-friendly error message for moderation failures
 */
export function getModerationErrorMessage(result: ModerationResult): string {
  if (result.isClean) return ''

  const highFlags = result.flags.filter((f) => f.severity === 'high')
  if (highFlags.length > 0) {
    const types = highFlags.map((f) => f.type).join(', ')
    return `Content blocked: ${types.replace(/_/g, ' ')}`
  }

  const mediumFlags = result.flags.filter((f) => f.severity === 'medium')
  if (mediumFlags.length >= 2) {
    return 'Content blocked: Multiple content policy violations'
  }

  return 'Content does not meet community guidelines'
}

/**
 * Quick check if content is likely problematic (for real-time feedback)
 */
export function quickContentCheck(content: string): {
  hasIssues: boolean
  warnings: string[]
} {
  const warnings: string[] = []
  const lowerContent = content.toLowerCase()

  // Quick profanity check
  const hasProfanity = PROFANITY_LIST.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    return regex.test(content)
  })
  if (hasProfanity) {
    warnings.push('Content may contain inappropriate language')
  }

  // Quick caps check
  if (content.length > 20) {
    const letters = content.replace(/[^a-zA-Z]/g, '')
    const uppercase = letters.replace(/[^A-Z]/g, '')
    if (letters.length > 0 && uppercase.length / letters.length > 0.5) {
      warnings.push('Consider using less capital letters')
    }
  }

  // Quick URL check
  const urls = content.match(URL_PATTERN) || []
  if (urls.length > 2) {
    warnings.push('Too many links (max 2 allowed)')
  }

  return {
    hasIssues: warnings.length > 0,
    warnings,
  }
}

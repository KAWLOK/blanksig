// Type definitions for BlankSig

export interface BlankSig {
  id: string
  content: string
  category: BlankSigCategory
  ethos_score: number
  ethos_tier: string
  tags: string[]
  created_at: string
}

export type BlankSigCategory =
  | 'workplace'
  | 'product_review'
  | 'whistleblowing'
  | 'community_feedback'
  | 'other'

export interface EthosScore {
  score: number
  tier: string
  canSubmit: boolean
}

export interface VerifyScoreRequest {
  walletAddress: string
}

export interface SubmitBlankSigRequest {
  content: string
  category: BlankSigCategory
  tags: string[]
  walletAddress: string // Only used for verification, never stored
}

export interface BlankSigFilters {
  category?: BlankSigCategory
  minScore?: number
  sort?: 'credibility' | 'recent' | 'relevant'
  page?: number
}

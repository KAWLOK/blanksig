'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TerminalWindow } from '@/components/terminal-window'
import type { BlankSig, BlankSigCategory } from '@/types'

const CATEGORIES: { value: BlankSigCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'ALL' },
  { value: 'workplace', label: 'WORKPLACE' },
  { value: 'product_review', label: 'PRODUCT_REVIEW' },
  { value: 'whistleblowing', label: 'WHISTLEBLOWING' },
  { value: 'community_feedback', label: 'COMMUNITY_FEEDBACK' },
  { value: 'other', label: 'OTHER' },
]

const SCORE_FILTERS = [
  { value: 0, label: '--min-score=0 (ALL)' },
  { value: 300, label: '--min-score=300 (VERIFIED+)' },
  { value: 600, label: '--min-score=600 (TRUSTED+)' },
  { value: 800, label: '--min-score=800 (ELITE+)' },
  { value: 900, label: '--min-score=900 (LEGENDARY)' },
]

const SORT_OPTIONS = [
  { value: 'credibility', label: '--sort=credibility' },
  { value: 'recent', label: '--sort=recent' },
]

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export default function BrowsePage() {
  const [testimonials, setTestimonials] = useState<BlankSig[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [category, setCategory] = useState<BlankSigCategory | 'all'>('all')
  const [minScore, setMinScore] = useState(0)
  const [sort, setSort] = useState<'credibility' | 'recent'>('credibility')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)

  // Loading animation state
  const [loadingStep, setLoadingStep] = useState(0)
  const loadingSteps = [
    'CONNECTING_TO_DATABASE...',
    'EXECUTING_QUERY...',
    'DECRYPTING_BLANKSIGS...',
    'RENDERING_RESULTS...',
  ]

  const fetchTestimonials = useCallback(async () => {
    setLoading(true)
    setError(null)
    setLoadingStep(0)

    // Animate loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, loadingSteps.length - 1))
    }, 300)

    try {
      const params = new URLSearchParams()
      if (category !== 'all') params.set('category', category)
      if (minScore > 0) params.set('minScore', minScore.toString())
      if (search) params.set('search', search)
      params.set('sort', sort)
      params.set('page', page.toString())
      params.set('limit', '12')

      const response = await fetch(`/api/blanksigs?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch testimonials')
      }

      const data = await response.json()
      setTestimonials(data.testimonials)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      clearInterval(stepInterval)
      setLoadingStep(loadingSteps.length)
      setTimeout(() => setLoading(false), 200)
    }
  }, [category, minScore, sort, search, page, loadingSteps.length])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [category, minScore, sort, search])

  // Handle search submission
  const handleSearch = () => {
    setSearch(searchInput.trim())
  }

  // Handle search on Enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchInput('')
    setSearch('')
  }

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <main className="min-h-screen bg-black text-primary p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              {'<'} BACK_TO_MAIN
            </Button>
          </Link>
        </div>

        {/* Page Title */}
        <motion.div
          className="font-terminal text-2xl md:text-4xl text-center mb-8 neon-glow"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <pre className="inline-block text-sm md:text-base">
{`┌────────────────────────────────┐
│  BROWSE_BLANKSIGS              │
│  Query anonymous testimonials  │
└────────────────────────────────┘`}
          </pre>
        </motion.div>

        {/* Filter Panel */}
        <motion.div
          className="border-2 border-primary bg-black/50 p-4 md:p-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="font-terminal text-lg text-secondary mb-4">
            {'>'} QUERY_PARAMETERS:
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <label className="block font-mono text-xs text-white/60 mb-2">
              --search
            </label>
            <div className="flex gap-2">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search content and tags..."
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="secondary">
                SEARCH
              </Button>
              {search && (
                <Button onClick={clearSearch} variant="ghost">
                  CLEAR
                </Button>
              )}
            </div>
            {search && (
              <div className="mt-2 font-mono text-xs text-accent">
                {'>'} Active search: &quot;{search}&quot;
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Category Filter */}
            <div>
              <label className="block font-mono text-xs text-white/60 mb-2">
                --category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BlankSigCategory | 'all')}
                className="w-full bg-black border-2 border-primary text-primary font-mono text-sm p-2 cursor-crosshair focus:outline-none focus:border-secondary focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Score Filter */}
            <div>
              <label className="block font-mono text-xs text-white/60 mb-2">
                --min-score
              </label>
              <select
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                className="w-full bg-black border-2 border-primary text-primary font-mono text-sm p-2 cursor-crosshair focus:outline-none focus:border-secondary focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] transition-all"
              >
                {SCORE_FILTERS.map((score) => (
                  <option key={score.value} value={score.value}>
                    {score.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block font-mono text-xs text-white/60 mb-2">
                --sort
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'credibility' | 'recent')}
                className="w-full bg-black border-2 border-primary text-primary font-mono text-sm p-2 cursor-crosshair focus:outline-none focus:border-secondary focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] transition-all"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Query Display */}
          <div className="mt-4 pt-4 border-t border-primary/30">
            <div className="font-mono text-xs text-white/40">
              {'>'} EXECUTING: GET /api/blanksigs
              {search && ` --search="${search}"`}
              {category !== 'all' && ` --category=${category}`}
              {minScore > 0 && ` --min-score=${minScore}`}
              {` --sort=${sort}`}
              {` --page=${page}`}
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        {pagination && !loading && (
          <motion.div
            className="font-mono text-sm text-white/60 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {'>'} QUERY_RESULT: {pagination.total} testimonials found
            {pagination.totalPages > 1 && ` | Page ${pagination.page} of ${pagination.totalPages}`}
          </motion.div>
        )}

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="border-2 border-primary p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="font-terminal text-lg text-center mb-6">
                PROCESSING_QUERY...
              </div>
              <div className="max-w-md mx-auto space-y-2">
                {loadingSteps.map((step, idx) => (
                  <motion.div
                    key={step}
                    className="font-mono text-sm flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: idx <= loadingStep ? 1 : 0.3,
                      x: 0
                    }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <span className={idx < loadingStep ? 'text-secondary' : 'text-primary'}>
                      {idx < loadingStep ? '✓' : idx === loadingStep ? '>' : ' '}
                    </span>
                    <span className={idx < loadingStep ? 'text-white/60' : idx === loadingStep ? 'text-primary' : 'text-white/30'}>
                      {step}
                    </span>
                    {idx < loadingStep && (
                      <span className="text-secondary ml-auto">OK</span>
                    )}
                  </motion.div>
                ))}
              </div>
              {/* Progress Bar */}
              <div className="mt-6 max-w-md mx-auto">
                <div className="border border-primary/50 h-4 bg-black">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="font-mono text-xs text-center mt-2 text-white/40">
                  [{Math.round(((loadingStep + 1) / loadingSteps.length) * 100)}%]
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && !loading && (
          <motion.div
            className="border-2 border-destructive p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="font-terminal text-xl text-destructive mb-4">
              [ERROR] QUERY_FAILED
            </div>
            <div className="font-mono text-white/60 mb-4">
              {error}
            </div>
            <Button onClick={fetchTestimonials} variant="destructive">
              [ RETRY_QUERY ]
            </Button>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && testimonials.length === 0 && (
          <motion.div
            className="border-2 border-primary/50 p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="font-terminal text-xl text-white/60 mb-4">
              NO_RESULTS_FOUND
            </div>
            <div className="font-mono text-sm text-white/40 mb-6">
              {'>'} Query returned 0 testimonials matching criteria
            </div>
            <div className="space-y-2 font-mono text-xs text-white/30">
              <p>TRY:</p>
              {search && <p>- Clearing search filter</p>}
              <p>- Lowering minimum score threshold</p>
              <p>- Selecting different category</p>
              <p>- Checking back later for new submissions</p>
            </div>
            <div className="mt-6 flex gap-4 justify-center">
              {search && (
                <Button variant="ghost" onClick={clearSearch}>
                  [ CLEAR_SEARCH ]
                </Button>
              )}
              <Link href="/submit">
                <Button variant="secondary">
                  [ BE_THE_FIRST_TO_SUBMIT ]
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Testimonials Grid */}
        {!loading && !error && testimonials.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <TerminalWindow blanksig={testimonial} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && !loading && (
          <motion.div
            className="mt-8 border-2 border-primary/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="font-terminal text-sm text-center mb-4 text-white/60">
              PAGE_NAVIGATION
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {/* First Page */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
                className="font-mono text-xs"
              >
                {'<<'} FIRST
              </Button>

              {/* Previous */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="font-mono text-xs"
              >
                {'<'} PREV
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    // Show first, last, and pages around current
                    return p === 1 ||
                           p === pagination.totalPages ||
                           Math.abs(p - page) <= 1
                  })
                  .map((p, idx, arr) => {
                    // Add ellipsis if there's a gap
                    const showEllipsisBefore = idx > 0 && arr[idx - 1] !== p - 1
                    return (
                      <span key={p} className="flex items-center">
                        {showEllipsisBefore && (
                          <span className="px-2 text-white/30 font-mono text-xs">...</span>
                        )}
                        <Button
                          variant={p === page ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => handlePageChange(p)}
                          className="font-mono text-xs min-w-[40px]"
                        >
                          {p.toString().padStart(2, '0')}
                        </Button>
                      </span>
                    )
                  })}
              </div>

              {/* Next */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={!pagination.hasMore}
                className="font-mono text-xs"
              >
                NEXT {'>'}
              </Button>

              {/* Last Page */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={page === pagination.totalPages}
                className="font-mono text-xs"
              >
                LAST {'>>'}
              </Button>
            </div>

            {/* Page Info */}
            <div className="text-center mt-4 font-mono text-xs text-white/40">
              {'>'} Showing {((page - 1) * pagination.limit) + 1}-{Math.min(page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
          </motion.div>
        )}

        {/* Footer Hint */}
        <div className="mt-8 text-center font-mono text-xs text-white/30">
          <p>ANONYMITY_GUARANTEED :: All testimonials display only credibility scores</p>
          <p>No identifying information is stored or transmitted</p>
        </div>
      </div>
    </main>
  )
}

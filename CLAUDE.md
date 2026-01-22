# CLAUDE.md - AI Assistant Guide for blanksig

**Repository**: KAWLOK/blanksig
**Last Updated**: 2026-01-22
**Status**: Active Development - Ethos Network Vibeathon Hackathon Project

---

## Table of Contents

1. [Repository Overview](#repository-overview)
2. [Current State](#current-state)
3. [Development Workflow](#development-workflow)
4. [Code Conventions](#code-conventions)
5. [Git Workflow](#git-workflow)
6. [Testing Guidelines](#testing-guidelines)
7. [Documentation Standards](#documentation-standards)
8. [AI Assistant Guidelines](#ai-assistant-guidelines)
9. [Common Tasks](#common-tasks)
10. [Troubleshooting](#troubleshooting)

---

## Repository Overview

### Project Purpose

**BlankSig** - Anonymous but credible testimonials for the Ethos Network Vibeathon hackathon.

**Tagline**: "Identity: void. Credibility: verified."

**Problem**: People need to speak freely (whistleblowing, sensitive feedback, controversial opinions) while maintaining credibility. Traditional anonymous platforms lack trust; identified platforms lack safety.

**Solution**: BlankSig enables truly anonymous testimonials where only the reviewer's Ethos reputation score is visible, not their identity. Users connect their wallet to verify their Ethos score, submit a testimonial, and the system stores ONLY the score - never the wallet address or any identifying information.

**Use Cases**:
- Workplace feedback and whistleblowing
- Product reviews without retaliation risk
- Community feedback
- Controversial opinions with credibility backing

**Hackathon**: Ethos Network Vibeathon
- Register: https://vibeathon.ethos.network/#register
- Docs: https://developers.ethos.network/
- Quickstart: https://developers.ethos.network/api-documentation/vibe-coding-quickstart

### Technology Stack

**Core**:
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (heavily customized for "Hacker Wii Terminal" aesthetic)

**Animations & Effects**:
- Framer Motion (page transitions, glitch effects)
- React Type Animation (typing effects)
- @react-spring/web (Wii-style 3D card animations)

**Backend & Database**:
- Ethos Network API integration
- Vercel Postgres (or Supabase as alternative)
- Next.js API Routes

**Development & Deployment**:
- Package Manager: npm
- Deployment: Vercel
- Version Control: Git

**Typography**:
- VT323 (terminal/retro) - Google Fonts
- JetBrains Mono (code) - Google Fonts
- Inter (body text when needed)

### Project Structure
```
blanksig/
├── .git/                      # Git version control
├── CLAUDE.md                  # This file - AI assistant guide
├── README.md                  # Project documentation
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── next.config.js             # Next.js configuration
├── .env.local                 # Environment variables (not committed)
├── app/                       # Next.js App Router
│   ├── layout.tsx             # Root layout with CRT effects
│   ├── page.tsx               # Landing page (boot sequence)
│   ├── globals.css            # Global styles + CRT effects
│   ├── submit/
│   │   └── page.tsx           # Submit testimonial flow
│   ├── browse/
│   │   └── page.tsx           # Browse testimonials
│   ├── verify/
│   │   └── page.tsx           # Verify Ethos score
│   ├── about/
│   │   └── page.tsx           # About page
│   └── api/
│       ├── blanksigs/
│       │   └── route.ts       # POST/GET testimonials
│       ├── verify-score/
│       │   └── route.ts       # Verify Ethos score
│       └── stats/
│           └── route.ts       # Platform statistics
├── components/                # React components
│   ├── ui/                    # Shadcn components (customized)
│   ├── wii-channel.tsx        # Wii-style navigation cards
│   ├── terminal-window.tsx    # Testimonial display
│   ├── credibility-badge.tsx  # Ethos score display
│   ├── terminal-input.tsx     # Form inputs
│   ├── boot-sequence.tsx      # Landing page animation
│   └── crt-overlay.tsx        # CRT screen effects
├── lib/                       # Utility functions
│   ├── ethos.ts               # Ethos API integration
│   ├── db.ts                  # Database connection
│   └── utils.ts               # Helper functions
├── types/                     # TypeScript types
│   └── index.ts               # Global type definitions
└── public/                    # Static assets
    ├── favicon.ico            # Pixel art favicon
    ├── og-image.png           # Open Graph image
    └── sounds/                # Optional UI sounds
```

*This structure will evolve during development*

---

## Current State

### Repository Status
- **Branch**: `claude/claude-md-mkpt5ieob2q0ibpc-1U17O`
- **Remote**: origin at http://127.0.0.1:17838/git/KAWLOK/blanksig
- **Development Phase**: Foundation & Core Features

### Development Phases

**Phase 1 - Foundation** (Day 1):
- [x] Set up Next.js project with TypeScript
- [ ] Configure Tailwind + Shadcn
- [ ] Implement color system and typography
- [ ] Create base layout with CRT effects
- [ ] Integrate Ethos API (test connection)
- [ ] Set up database schema

**Phase 2 - Core Features** (Day 2):
- [ ] Build Wii channel navigation
- [ ] Create testimonial card component
- [ ] Implement submission flow
- [ ] Build browse/filter page
- [ ] Connect to Ethos API for verification
- [ ] Test anonymity (verify no data leaks)

**Phase 3 - Polish** (Day 3):
- [ ] Add all animations and effects
- [ ] Implement responsive design
- [ ] Create landing page with boot sequence
- [ ] Add toast notifications
- [ ] Error handling throughout
- [ ] Performance optimization

**Phase 4 - Deploy & Demo** (Day 4):
- [ ] Set up custom domain
- [ ] Deploy to Vercel
- [ ] Seed demo data
- [ ] Create README with screenshots
- [ ] Record demo video (optional)
- [ ] Final testing on all devices

### Hackathon Strategy
- **Focus**: 1-2 features executed EXCEPTIONALLY well (quality over quantity)
- **Goal**: Make judges remember "the hacker Wii one"
- **Differentiator**: Unique UI aesthetic + perfect polish
- **Demo-Ready**: Every detail polished for presentation

---

## UI/UX Design System - "Hacker Wii Terminal"

### Design Philosophy
Combine Nintendo Wii channel aesthetics with hacker/terminal visuals. Y2K nostalgia meets cyberpunk underground. Every interaction should feel like "hacking" even though you're just browsing testimonials.

### Color Palette
```css
--color-bg: #000000          /* Pure black background */
--color-primary: #00FF41     /* Electric cyan */
--color-secondary: #39FF14   /* Matrix green */
--color-accent: #B026FF      /* Neon purple */
--color-danger: #FF0041      /* Terminal red */
--color-text: #FFFFFF        /* White */

/* Credibility Tier Colors */
--tier-untrusted: #FF0041    /* Red (0-300) */
--tier-verified: #FFD700     /* Yellow (301-600) */
--tier-trusted: #39FF14      /* Green (601-800) */
--tier-elite: #00FF41        /* Cyan (801-900) */
--tier-legendary: #B026FF    /* Purple (901-1000) */
```

### Typography
- **Headings**: VT323 (terminal/retro aesthetic)
- **Code/Monospace**: JetBrains Mono
- **Body Text**: Inter (when readability is critical)
- **ALL_CAPS** for labels and terminal commands

### Visual Effects
- CRT screen curvature (subtle CSS filter)
- Scanline overlay (15% opacity)
- Glitch effects on transitions
- Neon glow on interactive elements (`box-shadow`)
- Typing animation on page load
- Matrix rain background (5% opacity, very slow)

### Ethos Score Display Tiers
```
[UNTRUSTED] ⚠    0-300    Red
[VERIFIED] ✓     301-600  Yellow
[TRUSTED] ✓✓     601-800  Green
[ELITE] ★        801-900  Cyan
[LEGENDARY] ♔    901-1000 Purple
```

### Component Patterns

**Buttons**:
```
[ SUBMIT_BLANKSIG ]  // Primary action
--category=all       // Filter flags
> EXECUTE_QUERY      // Terminal commands
```

**Terminal Windows**:
```
┌─────────────────────────────────┐
│ [ELITE] ★ 850 CREDIBILITY       │
├─────────────────────────────────┤
│ Testimonial content here...     │
│                                 │
│ Category: Whistleblowing        │
│ Posted: 2h ago                  │
└─────────────────────────────────┘
```

**Loading States**:
```
PROCESSING_BLANKSIG...
[████████░░] 80%
ENCRYPTING_DATA... OK ✓
ANONYMIZING... OK ✓
```

---

## Development Workflow

### Branch Naming Convention
- **Feature branches**: `claude/<descriptive-name>-<session-id>`
- **Main branch**: To be determined (likely `main` or `master`)
- **CRITICAL**: Branch names MUST start with `claude/` and end with session ID for successful push operations

### Before Starting Work
1. Check current branch: `git status`
2. Ensure you're on the correct feature branch
3. Review recent changes: `git log --oneline -10`
4. Check for uncommitted changes

### Making Changes
1. **Read Before Modifying**: Always read files before making changes
2. **Understand Context**: Review related files to understand dependencies
3. **Make Focused Changes**: Keep changes minimal and directly related to the task
4. **Test Your Changes**: Verify functionality after modifications
5. **Commit Regularly**: Make small, logical commits with clear messages

---

## Code Conventions

### General Principles
- **Simplicity First**: Avoid over-engineering; solve the immediate problem
- **No Premature Optimization**: Only optimize when there's a proven need
- **Minimal Abstractions**: Don't create utilities or helpers for one-time operations
- **Security Awareness**: Watch for vulnerabilities (XSS, SQL injection, command injection, etc.)
- **Clean Up Unused Code**: Delete, don't comment out or rename with `_`

### Code Style

**TypeScript/React Conventions**:
- **Indentation**: 2 spaces (no tabs)
- **Naming**:
  - Components: PascalCase (`TerminalWindow.tsx`)
  - Functions/variables: camelCase (`fetchEthosScore`)
  - Constants: UPPER_SNAKE_CASE (`CREDIBILITY_TIERS`)
  - Types/Interfaces: PascalCase (`BlankSig`, `EthosScore`)
- **File Organization**:
  - One component per file
  - Co-locate related types in same file
  - Separate API logic into `/lib` utilities
- **Import Ordering**:
  1. React/Next.js imports
  2. External libraries
  3. Internal components
  4. Internal utilities
  5. Types
  6. Styles

**Example**:
```typescript
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

import { TerminalWindow } from '@/components/terminal-window'
import { fetchEthosScore } from '@/lib/ethos'

import type { BlankSig } from '@/types'
```

### Documentation in Code
- **Only Add When Necessary**: Don't add comments to code you didn't change
- **Self-Documenting Code**: Prefer clear naming over comments
- **Comment the Why, Not the What**: Explain reasoning, not obvious operations
- **Keep Comments Updated**: Remove outdated comments immediately

### Privacy & Security - CRITICAL

**Anonymity Requirements**:
- ❌ **NEVER** store wallet addresses with testimonials
- ❌ **NEVER** log wallet addresses with testimonials
- ❌ **NEVER** associate any identifying data with testimonials
- ✅ **ONLY** store: content, category, Ethos score, tier, tags, timestamp
- ✅ Use temporary session tokens for verification (expire after 5 min)
- ✅ Clear all identifying data immediately after score verification

**Database Schema Rule**:
```sql
-- CORRECT: No identifying fields
CREATE TABLE blanksigs (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  ethos_score INTEGER NOT NULL,
  ethos_tier VARCHAR(20) NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
  -- NO wallet_address
  -- NO user_id
  -- NO ip_address
);
```

**Security Checklist**:
- [ ] Rate limiting on submissions (1 per wallet per hour)
- [ ] Content moderation (filter hate speech, spam)
- [ ] XSS prevention (sanitize user input)
- [ ] SQL injection prevention (use parameterized queries)
- [ ] Add disclaimer on submit page about irreversible anonymity
- [ ] GDPR-compliant (no personal data stored)

---

## Git Workflow

### Commit Message Format
```
<type>: <brief description>

<optional detailed description>

<optional references to issues/tickets>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring without behavior change
- `docs`: Documentation only changes
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling
- `perf`: Performance improvements

### Commit Guidelines
1. **Use Descriptive Messages**: Focus on the "why" not just the "what"
2. **Keep Commits Focused**: One logical change per commit
3. **Follow Repository Style**: Review `git log` to match existing patterns
4. **Never Commit Secrets**: Check for .env, credentials, API keys before committing

### Push Operations
```bash
# Always use -u flag for new branches
git push -u origin <branch-name>

# Branch MUST start with 'claude/' and end with session ID
# Retry up to 4 times with exponential backoff if network errors occur
```

### Fetch/Pull Operations
```bash
# Prefer specific branches
git fetch origin <branch-name>
git pull origin <branch-name>

# Retry up to 4 times with exponential backoff if network errors occur
```

### Git Safety Rules
- ❌ **NEVER** update git config without explicit permission
- ❌ **NEVER** run destructive commands (force push, hard reset) without explicit user request
- ❌ **NEVER** skip hooks (--no-verify, --no-gpg-sign) without explicit request
- ❌ **NEVER** force push to main/master
- ⚠️ **AVOID** `git commit --amend` unless specific conditions are met:
  - User explicitly requested amend, OR pre-commit hook auto-modified files
  - HEAD commit was created by you in this conversation
  - Commit has NOT been pushed to remote
- ✅ **ALWAYS** verify status before and after operations
- ✅ **ALWAYS** use proper quoting for paths with spaces

---

## Testing Guidelines

### Testing Philosophy
*To be defined when test framework is established*

### Running Tests
```bash
# Commands to be added based on testing framework
# Examples:
# npm test
# pytest
# cargo test
# go test ./...
```

### Writing Tests
*Guidelines to be added based on testing framework and conventions*

---

## Documentation Standards

### README.md
*To be created - should include:*
- Project description and purpose
- Installation instructions
- Usage examples
- Contributing guidelines
- License information

### Code Documentation
- Document public APIs and interfaces
- Include examples for complex functionality
- Keep documentation close to the code it describes

### This File (CLAUDE.md)
- **Update Regularly**: Keep this file current as the project evolves
- **Be Specific**: Add concrete examples and commands
- **Stay Relevant**: Remove outdated information promptly

---

## AI Assistant Guidelines

### Tool Usage Priorities
1. **Use Specialized Tools**: Prefer Read/Edit/Write over bash for file operations
2. **Search Efficiently**: Use Task tool with Explore agent for codebase exploration
3. **Parallel Operations**: Call multiple independent tools simultaneously
4. **Avoid Bash for Communication**: Never use echo or comments to communicate with users

### Task Management
1. **Use TodoWrite**: For multi-step or complex tasks (3+ steps)
2. **Update Status Real-Time**: Mark tasks in_progress before starting
3. **Complete Immediately**: Mark tasks completed as soon as finished
4. **One Task at a Time**: Only one task should be in_progress at any moment

### Reading Code
- ✅ **Always read files before modifying them**
- ✅ **Use Read tool for specific files**
- ✅ **Use Glob for finding files by pattern**
- ✅ **Use Grep for content search**
- ✅ **Use Task/Explore for broad codebase exploration**

### Making Changes
- ✅ **Minimal changes**: Only modify what's necessary
- ✅ **Security first**: Check for vulnerabilities in new code
- ✅ **Test after changes**: Verify functionality
- ❌ **No feature creep**: Don't add unrequested features
- ❌ **No unnecessary refactoring**: Don't "improve" working code unless asked
- ❌ **No premature abstraction**: Keep it simple

### Communication Style
- **Concise**: Users see CLI output; be brief and clear
- **No Emojis**: Unless explicitly requested by user
- **Professional**: Focus on facts, not validation
- **Markdown**: Use GitHub-flavored markdown for formatting
- **No Colons Before Tools**: End sentences with periods

---

## Common Tasks

### Initial Project Setup
```bash
# Create Next.js project with TypeScript
npx create-next-app@latest blanksig --typescript --tailwind --app --no-src-dir

# Install core dependencies
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
npm install framer-motion react-type-animation @react-spring/web
npm install lucide-react

# Install Shadcn CLI
npx shadcn-ui@latest init

# Install development dependencies
npm install -D @types/node @types/react @types/react-dom
```

### Adding Dependencies
```bash
# Add a new package
npm install <package-name>

# Add a Shadcn component
npx shadcn-ui@latest add <component-name>

# Examples:
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add toast
```

### Running the Project
```bash
# Development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Building for Production
```bash
# Build optimized production bundle
npm run build

# Test production build locally
npm start

# Deploy to Vercel
vercel deploy --prod
```

### Database Operations
```bash
# Initialize Vercel Postgres (if using)
vercel postgres create

# Run database migrations
# (Add migration commands when schema is set up)
```

### Environment Variables
Required in `.env.local`:
```bash
ETHOS_API_KEY=your_key_here
ETHOS_API_URL=https://api.ethos.network
DATABASE_URL=your_postgres_url
NEXT_PUBLIC_SITE_URL=https://blanksig.xyz
```

---

## Troubleshooting

### Git Push Fails with 403
- **Cause**: Branch name doesn't start with `claude/` or doesn't end with session ID
- **Solution**: Ensure branch name follows pattern: `claude/<name>-<session-id>`

### Network Errors on Git Operations
- **Solution**: Implement exponential backoff retry (2s, 4s, 8s, 16s)
- **Max Retries**: 4 attempts

### File Not Found Errors
- **Check**: Current working directory with `pwd`
- **Check**: File exists with `ls -la <path>`
- **Remember**: Always use absolute paths in tools

### Merge Conflicts
*To be updated when collaboration patterns are established*

---

## Project-Specific Notes

### Current Session
- **Branch**: `claude/claude-md-mkpt5ieob2q0ibpc-1U17O`
- **Task**: Building BlankSig for Ethos Network Vibeathon
- **Phase**: Foundation & Setup

### API Routes Reference

**POST /api/blanksigs**
- Submit anonymous testimonial
- Request: `{ content, category, tags, walletAddress }`
- Process: Verify Ethos score → Store only score/tier → Return success
- CRITICAL: Never store walletAddress in database

**GET /api/blanksigs**
- Fetch testimonials with filters
- Query: `?category=whistleblowing&minScore=800&sort=credibility&page=1`
- Returns: Paginated results with testimonials

**GET /api/verify-score**
- Verify user's Ethos score
- Request: `{ walletAddress }`
- Returns: `{ score, tier, canSubmit }`
- Used for real-time verification before submission

**GET /api/stats**
- Platform statistics
- Returns: `{ total, avgScore, categories }`
- For landing page display

### Core Features

**1. Submit Anonymous Testimonial**:
- Connect wallet to verify Ethos score
- Multi-step terminal-style wizard
- Category selection: Workplace, Product Review, Whistleblowing, Community Feedback, Other
- System stores ONLY the Ethos score (no identity)
- Terminal-style confirmation with fake command execution

**2. Browse Credible Testimonials**:
- Filter by category, minimum Ethos score threshold
- Terminal windows with credibility scores
- Sort by: Most credible, Recent, Most relevant
- ASCII badges and neon progress bars
- Command-line style filters: `--category=whistleblowing --min-score=800`

### External Dependencies
- **Ethos Network API**: https://developers.ethos.network/
- **Vibe Coding Quickstart**: https://developers.ethos.network/api-documentation/vibe-coding-quickstart
- **Hackathon Registration**: https://vibeathon.ethos.network/#register

---

## Maintenance

### Updating This File
- **Frequency**: Update whenever significant project changes occur
- **Responsibility**: All AI assistants should maintain this file
- **Format**: Keep structure consistent and sections organized
- **Version**: Update "Last Updated" date at the top

### Review Checklist
- [ ] All commands are tested and working
- [ ] File paths are accurate
- [ ] Conventions match current codebase
- [ ] Examples are relevant and helpful
- [ ] Removed outdated information
- [ ] Added new patterns discovered in the codebase

---

## Additional Resources

### Related Documentation
*Links to be added as documentation is created:*
- README.md
- CONTRIBUTING.md
- API Documentation
- Architecture Decision Records (ADRs)

### External References
- Ethos Network API Documentation: https://developers.ethos.network/
- Next.js 14 Documentation: https://nextjs.org/docs
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- Shadcn/ui Components: https://ui.shadcn.com/
- Framer Motion Documentation: https://www.framer.com/motion/

---

## Critical Reminders for AI Assistants

### Before Making ANY Database Changes
- ✅ **Triple-check**: Does this store ANY identifying information?
- ✅ **Verify**: Are wallet addresses completely absent from storage?
- ✅ **Confirm**: Is anonymity truly guaranteed?

### UI/UX Priorities
- Every component should scream "Hacker Wii Terminal"
- Glitch effects, neon glows, terminal aesthetics everywhere
- No generic UI - every detail is themed
- Animations should be smooth and memorable
- Judges should remember "the hacker Wii one"

### Development Priorities
- **Quality > Quantity**: 1 perfect feature beats 3 mediocre ones
- **Polish everything**: Custom domain, favicon, OG tags, mobile responsive
- **Test anonymity**: Verify no data leaks at every step
- **Demo-ready**: Every feature should wow during presentation

### What Makes This Special
1. **Unique Aesthetic**: Nintendo Wii + Hacker Terminal = Unforgettable
2. **Real Problem Solved**: Anonymous yet credible testimonials
3. **Perfect Ethos Integration**: Reputation layer enables the solution
4. **Attention to Detail**: Every pixel polished for judges

---

**Remember**: This is a living document. Keep it updated as the repository evolves, and it will serve as an invaluable guide for AI assistants working on this project.

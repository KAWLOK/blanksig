# BlankSig

**Identity: void. Credibility: verified.**

Anonymous testimonials backed by Ethos reputation scores for the [Ethos Network Vibeathon](https://vibeathon.ethos.network/) hackathon.

## 🎮 Concept

BlankSig solves the trust paradox of anonymous feedback. Whether it's whistleblowing, sensitive workplace feedback, product reviews, or controversial opinions - people need to speak freely while maintaining credibility.

- **Traditional anonymous platforms**: High anonymity, zero credibility
- **Identified platforms**: High credibility, zero safety
- **BlankSig**: True anonymity + verifiable credibility via Ethos scores

## 🎨 Aesthetic: "Hacker Wii Terminal"

A unique UI combining Nintendo Wii channel navigation with Y2K hacker/terminal visuals. Think: a secret government terminal running on a modded Wii.

**Design Elements**:
- CRT screen effects with scanlines
- Neon glow (#00FF41 cyan, #39FF14 matrix green)
- Terminal-style typography (VT323, JetBrains Mono)
- Wii-style 3D tilted navigation cards
- Glitch effects and typing animations
- Matrix rain background

## ✨ Core Features

### 1. Submit Anonymous Testimonial
- Connect wallet to verify Ethos score
- Multi-step terminal-style wizard
- Categories: Workplace, Product Review, Whistleblowing, Community Feedback, Other
- System stores **ONLY** the Ethos score (never wallet address or identity)
- Terminal confirmation with fake encryption sequence

### 2. Browse Credible Testimonials
- Filter by category and minimum Ethos score threshold
- Display as terminal windows with credibility badges
- Sort by: Most credible, Recent, Most relevant
- Command-line style filters: `--category=whistleblowing --min-score=800`

## 🏆 Ethos Score Tiers

```
[UNTRUSTED] ⚠    0-300    Red
[VERIFIED] ✓     301-600  Yellow
[TRUSTED] ✓✓     601-800  Green
[ELITE] ★        801-900  Cyan
[LEGENDARY] ♔    901-1000 Purple
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (heavily customized)
- **Animations**: Framer Motion, React Type Animation, @react-spring/web
- **Backend**: Ethos Network API, Next.js API Routes
- **Database**: Vercel Postgres (or Supabase)
- **Deployment**: Vercel

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your ETHOS_API_KEY and DATABASE_URL

# Run development server
npm run dev
# Open http://localhost:3000
```

## 🔒 Privacy & Security

**Critical**: BlankSig guarantees true anonymity

✅ **What we store**: Content, category, Ethos score, tier, tags, timestamp
❌ **What we NEVER store**: Wallet addresses, user IDs, IP addresses, any identifying data

**How it works**:
1. User connects wallet → Verify Ethos score via API
2. User submits testimonial → Store only the score/tier
3. Wallet address discarded immediately → Irreversible anonymity
4. Testimonials displayed with credibility badge only

## 📁 Project Structure

```
blanksig/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with CRT effects
│   ├── page.tsx            # Landing page (boot sequence)
│   ├── globals.css         # Global styles + CRT effects
│   ├── submit/             # Submit testimonial flow
│   ├── browse/             # Browse testimonials
│   ├── verify/             # Verify Ethos score
│   └── api/                # API routes
│       ├── blanksigs/      # POST/GET testimonials
│       ├── verify-score/   # Verify Ethos score
│       └── stats/          # Platform statistics
├── components/             # React components
│   ├── ui/                 # Shadcn components (customized)
│   ├── wii-channel.tsx     # Wii-style navigation cards
│   ├── terminal-window.tsx # Testimonial display
│   └── credibility-badge.tsx # Ethos score display
├── lib/                    # Utility functions
│   ├── ethos.ts            # Ethos API integration
│   └── utils.ts            # Helper functions
└── types/                  # TypeScript types
    └── index.ts            # Global type definitions
```

## 🔗 Resources

- **Ethos Network**: https://developers.ethos.network/
- **Vibe Coding Quickstart**: https://developers.ethos.network/api-documentation/vibe-coding-quickstart
- **Hackathon**: https://vibeathon.ethos.network/

## 📝 Development

This project follows a quality-over-quantity approach. Every feature is polished to perfection.

**Phase 1** - Foundation ✅
- Next.js setup with TypeScript
- Tailwind with custom color system
- Base layout with CRT effects
- Typography system

**Phase 2** - Core Features 🚧
- Wii channel navigation
- Testimonial submission flow
- Browse/filter interface
- Ethos API integration

**Phase 3** - Polish
- Animations and effects
- Responsive design
- Error handling
- Performance optimization

**Phase 4** - Deploy & Demo
- Custom domain
- Seed demo data
- Final testing

## 🎯 Hackathon Strategy

**Goal**: Make judges remember "the hacker Wii one"

**Differentiators**:
1. ✨ Unforgettable UI aesthetic
2. 🎯 Perfect execution of core features
3. 🔒 True anonymity with credibility
4. 💎 Polished every detail

## 📄 License

MIT

---

Built for [Ethos Network Vibeathon](https://vibeathon.ethos.network/) 2026

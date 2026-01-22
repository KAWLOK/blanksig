# BlankSig Testing Guide

## Quick Start

```bash
# Start the development server
npm run dev

# Open http://localhost:3000
```

## Testing the Ethos API Integration

### 1. Verify Page (http://localhost:3000/verify)

The verify page tests the complete Ethos API integration with a terminal-style interface.

**Test Wallets (Development Mode)**

Since `ETHOS_API_KEY` is not configured, the system uses deterministic mock scores. Click these test buttons to try different score tiers:

- **Score: 100** → `[UNTRUSTED]` (Red) - Cannot submit
- **Score: 400** → `[VERIFIED]` (Yellow) - Can submit
- **Score: 700** → `[TRUSTED]` (Green) - Can submit
- **Score: 850** → `[ELITE]` (Cyan) - Can submit
- **Score: 950** → `[LEGENDARY]` (Purple) - Can submit

**Manual Testing**

You can also enter any valid Ethereum address (format: `0x` + 40 hex characters). The mock system will generate a deterministic score based on the address.

Example addresses to try:
```
0x1111111100000000000000000000000000000000 → Score varies
0xFFFFFFFF00000000000000000000000000000000 → Score varies
```

**What to Look For**

✅ Terminal-style verification animation (4 steps)
✅ Credibility badge displays correct tier color
✅ Score and tier information shown
✅ "Can Submit" correctly indicates if score ≥ 300
✅ For eligible scores, shows button to navigate to /submit
✅ For low scores, shows helpful error message
✅ Wallet address validation (rejects invalid formats)

### 2. API Endpoint Testing

**Test via GET request**

```bash
# Test with curl
curl "http://localhost:3000/api/verify-score?address=0x66666666000000000000000000000000000000000000000000000000"

# Expected response:
{
  "score": 716,
  "tier": "trusted",
  "canSubmit": true
}
```

**Test via POST request**

```bash
curl -X POST http://localhost:3000/api/verify-score \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x66666666000000000000000000000000000000000000000000000000"}'

# Expected response:
{
  "score": 716,
  "tier": "trusted",
  "canSubmit": true,
  "message": "Verification successful. You can submit testimonials."
}
```

**Error Cases to Test**

```bash
# Invalid address format
curl -X POST http://localhost:3000/api/verify-score \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "invalid"}'

# Expected: 400 error with "Invalid wallet address format"

# Missing address
curl -X POST http://localhost:3000/api/verify-score \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 400 error with "Wallet address is required"
```

### 3. Landing Page (http://localhost:3000)

**What to Look For**

✅ Boot sequence animation (2-3 seconds)
  - "INITIALIZING BLANKSIG PROTOCOL..."
  - "LOADING MODULES... OK ✓"
  - "CONNECTING TO ETHOS NETWORK... OK ✓"
  - "VERIFYING ANONYMITY LAYER... OK ✓"
  - "SYSTEM READY."

✅ ASCII BlankSig logo with neon cyan glow
✅ Tagline: "IDENTITY: VOID >> CREDIBILITY: VERIFIED"
✅ Four Wii-style channel cards with hover effects
✅ CRT scanline overlay visible
✅ Custom scrollbar (cyan accent)

### 4. UI/UX Testing Checklist

**Terminal Aesthetic**
- [ ] All text uses terminal fonts (VT323, JetBrains Mono)
- [ ] Neon glow effects on interactive elements
- [ ] CRT scanlines visible across all pages
- [ ] Cursor appears as crosshair on hover
- [ ] Terminal-style brackets on all buttons `[ TEXT ]`

**Wii Channel Cards (Landing Page)**
- [ ] 2x2 grid on desktop, 1x4 stack on mobile
- [ ] Hover triggers scale animation (1.05x)
- [ ] Hover shows neon cyan glow
- [ ] Click navigates to correct page
- [ ] Icon rotates on hover (if using WiiChannel component)

**Color System**
- [ ] Background: Pure black (#000000)
- [ ] Primary text: Electric cyan (#00FF41)
- [ ] Secondary text: Matrix green (#39FF14)
- [ ] Credibility tiers display correct colors:
  - Untrusted: Red (#FF0041)
  - Verified: Yellow (#FFD700)
  - Trusted: Green (#39FF14)
  - Elite: Cyan (#00FF41)
  - Legendary: Purple (#B026FF)

**Responsiveness**
- [ ] Test on mobile (320px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1920px width)
- [ ] All text remains readable
- [ ] No horizontal scroll
- [ ] Touch targets ≥ 48px on mobile

### 5. Performance Testing

**Lighthouse Audit**

```bash
# Build for production
npm run build
npm start

# Open Chrome DevTools > Lighthouse
# Run audit on http://localhost:3000
```

**Target Scores**
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

**What to Check**
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3s
- [ ] No console errors
- [ ] No accessibility violations

## Configuring Real Ethos API

When you have an Ethos API key:

1. Create `.env.local`:
```bash
ETHOS_API_KEY=your_actual_api_key_here
ETHOS_API_URL=https://api.ethos.network
```

2. Update `lib/ethos.ts` if needed:
   - Verify the API endpoint structure matches Ethos docs
   - Update response parsing if the JSON structure differs
   - Adjust timeout values if needed

3. Test with real wallets:
   - Remove mock data warnings
   - Verify real score fetching works
   - Test with various Ethos Network users

## Known Development Quirks

**Mock Data Notice**
The verify page shows "⚠ DEVELOPMENT_MODE: Using mock Ethos scores" when `ETHOS_API_KEY` is not set. This is expected and will disappear once the API key is configured.

**Score Determinism**
Mock scores are deterministic based on wallet address hash. The same address will always return the same mock score. This is intentional for consistent testing.

**Caching**
Scores are cached for 5 minutes. If testing the same address repeatedly, you may need to wait or clear the cache by restarting the dev server.

## Next Testing Steps

Once database and submission features are built:

1. **Submission Flow**
   - Test wallet connection
   - Test score verification before submit
   - Test testimonial submission
   - Verify wallet address is NOT stored

2. **Browse Feature**
   - Test filtering by category
   - Test filtering by minimum score
   - Test sorting options
   - Test pagination

3. **Anonymity Verification**
   - Inspect database records (should have NO wallet addresses)
   - Check API logs (should not log identifying data)
   - Test that same wallet can submit multiple times without correlation

## Troubleshooting

**Dev server won't start**
```bash
# Kill any existing processes
pkill -f "next dev"

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Start fresh
npm run dev
```

**API route returns 404**
```bash
# Make sure you're hitting the right endpoint
# POST /api/verify-score (not /api/verify-score/)
# Check that app/api/verify-score/route.ts exists
```

**Styles not loading**
```bash
# Restart dev server to rebuild Tailwind
# Check that tailwind.config.ts includes app directory
# Verify globals.css is imported in layout.tsx
```

**Mock scores seem random**
They're deterministic! The same address always produces the same score. Try using the test wallet buttons for predictable results.

---

**Happy Testing!** 🎮✨

Report issues or unexpected behavior so we can polish every detail for the hackathon judges.

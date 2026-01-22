'use client'

import { useState, useEffect } from 'react'
import { WiiChannelGrid } from '@/components/wii-channel'

export default function Home() {
  const [bootComplete, setBootComplete] = useState(false)
  const [currentLine, setCurrentLine] = useState(0)

  const bootSequence = [
    "INITIALIZING BLANKSIG PROTOCOL...",
    "LOADING MODULES... OK ✓",
    "CONNECTING TO ETHOS NETWORK... OK ✓",
    "VERIFYING ANONYMITY LAYER... OK ✓",
    "SYSTEM READY.",
  ]

  useEffect(() => {
    if (currentLine < bootSequence.length) {
      const timer = setTimeout(() => {
        setCurrentLine(currentLine + 1)
      }, 800)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setBootComplete(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [currentLine])

  if (!bootComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="space-y-2 font-terminal text-primary text-2xl">
          {bootSequence.slice(0, currentLine).map((line, idx) => (
            <div key={idx} className="animate-fade-in">
              {'> '}{line}
            </div>
          ))}
          {currentLine < bootSequence.length && (
            <div className="cursor-blink"></div>
          )}
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-primary p-8">
      <div className="max-w-6xl mx-auto">
        {/* ASCII Art Logo */}
        <div className="font-terminal text-center mb-12 text-4xl neon-glow">
          <pre className="inline-block">
{`
╔══════════════════════════════════════╗
║  ██████╗ ██╗      █████╗ ███╗   ██╗ ║
║  ██╔══██╗██║     ██╔══██╗████╗  ██║ ║
║  ██████╔╝██║     ███████║██╔██╗ ██║ ║
║  ██╔══██╗██║     ██╔══██║██║╚██╗██║ ║
║  ██████╔╝███████╗██║  ██║██║ ╚████║ ║
║  ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ║
║                                      ║
║  ███████╗██╗ ██████╗                ║
║  ██╔════╝██║██╔════╝                ║
║  ███████╗██║██║  ███╗               ║
║  ╚════██║██║██║   ██║               ║
║  ███████║██║╚██████╔╝               ║
║  ╚══════╝╚═╝ ╚═════╝                ║
╚══════════════════════════════════════╝
`}
          </pre>
        </div>

        {/* Tagline */}
        <div className="text-center mb-16">
          <h1 className="font-terminal text-3xl mb-4 text-secondary">
            <span className="inline-block">IDENTITY: </span>
            <span className="text-destructive inline-block">VOID</span>
            <span className="inline-block"> &gt;&gt; </span>
            <span className="inline-block">CREDIBILITY: </span>
            <span className="text-tier-elite inline-block">VERIFIED</span>
          </h1>
          <p className="font-mono text-lg text-white/80">
            Anonymous testimonials backed by Ethos reputation scores
          </p>
        </div>

        {/* Navigation Channels - Wii Style */}
        <WiiChannelGrid
          channels={[
            { title: 'SUBMIT', icon: '█', description: 'Submit anonymous testimonial', href: '/submit' },
            { title: 'BROWSE', icon: '█', description: 'View credible testimonials', href: '/browse' },
            { title: 'VERIFY', icon: '█', description: 'Check your Ethos score', href: '/verify' },
            { title: 'ABOUT', icon: '█', description: 'Learn about BlankSig', href: '/about' },
          ]}
        />

        {/* Footer */}
        <div className="mt-16 text-center font-mono text-sm text-white/40">
          <p>POWERED BY ETHOS NETWORK</p>
          <p className="mt-2">VIBEATHON 2026</p>
        </div>
      </div>
    </main>
  )
}

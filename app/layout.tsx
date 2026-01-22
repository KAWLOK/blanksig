import type { Metadata } from "next"
import { Inter, VT323, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-terminal",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "BlankSig - Identity: void. Credibility: verified.",
  description: "Anonymous testimonials backed by Ethos credibility scores. Speak freely while maintaining trust.",
  openGraph: {
    title: "BlankSig - Identity: void. Credibility: verified.",
    description: "Anonymous testimonials backed by Ethos credibility scores. Speak freely while maintaining trust.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlankSig - Identity: void. Credibility: verified.",
    description: "Anonymous testimonials backed by Ethos credibility scores.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${vt323.variable} ${jetbrainsMono.variable} antialiased`}>
        <div className="crt-screen min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}

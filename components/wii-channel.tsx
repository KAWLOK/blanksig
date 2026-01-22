'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface WiiChannelProps {
  title: string
  icon: string
  description: string
  href: string
  delay?: number
}

export function WiiChannel({ title, icon, description, href, delay = 0 }: WiiChannelProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.5, type: 'spring' }}
        whileHover={{ scale: 1.05, z: 50 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          "group relative p-8 border-2 border-primary bg-black",
          "transition-all duration-300 cursor-crosshair",
          "hover:border-secondary",
          isHovered && "shadow-[0_0_20px_rgba(0,255,65,0.5)]"
        )}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
      >
        {/* Icon */}
        <motion.div
          className="font-terminal text-4xl text-center mb-4 text-primary group-hover:text-secondary"
          animate={isHovered ? { rotateY: 360 } : { rotateY: 0 }}
          transition={{ duration: 0.6 }}
        >
          {icon}
        </motion.div>

        {/* Title */}
        <div className={cn(
          "font-terminal text-2xl text-center mb-2 text-secondary",
          isHovered && "animate-glitch"
        )}>
          [ {title} ]
        </div>

        {/* Description */}
        <div className="font-mono text-sm text-center text-white/60 group-hover:text-white/80 transition-colors">
          {description}
        </div>

        {/* Hover glow effect */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 border-2 border-secondary pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>
    </Link>
  )
}

interface WiiChannelGridProps {
  channels: Array<{
    title: string
    icon: string
    description: string
    href: string
  }>
  className?: string
}

export function WiiChannelGrid({ channels, className }: WiiChannelGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto",
      className
    )}>
      {channels.map((channel, idx) => (
        <WiiChannel
          key={channel.title}
          {...channel}
          delay={idx * 0.1}
        />
      ))}
    </div>
  )
}

"use client";

import { useEffect, useState } from 'react'

const LoadingScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!isVisible) return

    // Simple timeout - hide loading screen after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [isVisible])

  return (
    <div
      className={`loading-screen fixed inset-0 z-[9999] bg-cream-50 flex items-center justify-center transition-opacity duration-1000 ${
        !isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex gap-1 text-4xl md:text-5xl font-display font-light tracking-wider">
          {'RAVIZGRAPHY'.split('').map((letter, i) => (
            <span key={i} className="logo-letters inline-block">
              {letter}
            </span>
          ))}
        </div>

        {/* Loading Line */}
        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>

        {/* Loading Text */}
        <p className="text-xs tracking-[0.2em] uppercase text-slate-400">
          Crafting moments
        </p>
      </div>
    </div>
  )
}

export default LoadingScreen

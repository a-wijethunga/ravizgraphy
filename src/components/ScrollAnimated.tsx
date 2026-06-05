"use client";

import { useEffect, useRef } from 'react'
import { scrollReveal, blurReveal, staggeredFadeIn, zoomOnScroll } from '../utils/animations'

interface ScrollAnimatedProps {
  children: React.ReactNode
  type?: 'reveal' | 'blur' | 'stagger' | 'zoom'
  className?: string
  delay?: number
}

const ScrollAnimated: React.FC<ScrollAnimatedProps> = ({ 
  children, 
  type = 'blur', 
  className = '',
  delay = 0
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => {
      if (!ref.current) return
      
      switch (type) {
        case 'reveal':
          scrollReveal(ref.current)
          break
        case 'blur':
          blurReveal(ref.current)
          break
        case 'stagger':
          staggeredFadeIn(ref.current)
          break
        case 'zoom':
          zoomOnScroll(ref.current)
          break
        default:
          blurReveal(ref.current)
      }
    }, delay)
  }, [type, delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

export default ScrollAnimated

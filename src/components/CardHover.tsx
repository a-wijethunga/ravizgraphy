"use client";

import { useRef } from 'react'

interface CardHoverProps {
  children: React.ReactNode
  className?: string
  intensity?: number
}

const CardHover: React.FC<CardHoverProps> = ({ 
  children, 
  className = '', 
  intensity = 1 
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !innerRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * 10 * intensity
    const rotateY = ((centerX - x) / centerX) * 10 * intensity

    // Apply 3D transforms via CSS
    innerRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
    innerRef.current.style.transition = 'none'
  }

  const handleMouseLeave = () => {
    if (!innerRef.current) return

    innerRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)'
    innerRef.current.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.320, 1)'
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${className}`}
      style={{
        perspective: '1000px'
      }}
    >
      <div
        ref={innerRef}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'box-shadow 0.3s ease'
        }}
        className="hover:shadow-2xl"
      >
        {children}
      </div>
    </div>
  )
}

export default CardHover

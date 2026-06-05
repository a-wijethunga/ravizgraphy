"use client";

import { useEffect, useRef } from 'react'

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const isHovering = useRef(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }

      // Smooth cursor positioning using CSS transforms
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`
        cursorRef.current.style.top = `${e.clientY}px`
      }

      if (dotRef.current && !isHovering.current) {
        dotRef.current.style.left = `${e.clientX}px`
        dotRef.current.style.top = `${e.clientY}px`
      }
    }

    const handleMouseEnter = () => {
      isHovering.current = true
      if (cursorRef.current) {
        cursorRef.current.style.transform = 'translate(-50%, -50%) scale(1.5)'
        cursorRef.current.style.transition = 'transform 0.3s ease-out'
      }
    }

    const handleMouseLeave = () => {
      isHovering.current = false
      if (cursorRef.current) {
        cursorRef.current.style.transform = 'translate(-50%, -50%) scale(1)'
        cursorRef.current.style.transition = 'transform 0.3s ease-out'
      }
    }

    // Interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], .interactive'
    )

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
    }
  }, [])

  return (
    <>
      {/* Outer Ring Cursor */}
      <div
        ref={cursorRef}
        className="fixed w-8 h-8 border border-slate-400 rounded-full pointer-events-none z-[9998] opacity-60"
        style={{
          left: 0,
          top: 0,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Inner Dot */}
      <div
        ref={dotRef}
        className="fixed w-2 h-2 bg-slate-600 rounded-full pointer-events-none z-[9998]"
        style={{
          left: 0,
          top: 0,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Hide default cursor */}
      <style>{`
        body {
          cursor: none;
        }
      `}</style>
    </>
  )
}

export default CustomCursor

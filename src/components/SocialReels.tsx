"use client";

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const reels = [
  { id: 1, url: 'https://www.instagram.com/reel/DTP6PzvCAlV/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==' },
  { id: 2, url: 'https://www.instagram.com/reel/DT-TBMWDN8i/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==' },
  { id: 3, url: 'https://www.instagram.com/reel/DSKltA9iChw/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==' },
  { id: 4, url: 'https://www.instagram.com/reel/DRkfq5NiHqs/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==' },
  { id: 5, url: 'https://www.instagram.com/reel/DXB__iko0Pf/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==' },
  { id: 6, url: 'https://www.instagram.com/reel/DUf74IvjcCg/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==' },
  { id: 7, url: 'https://www.instagram.com/reel/DPTlomTjJXN/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==' },
  { id: 8, url: 'https://www.instagram.com/reel/DTITQq1kxXr/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==' },
]

const SocialReels = () => {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const updateScrollArrows = () => {
    if (!carouselRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setShowLeftArrow(scrollLeft > 10)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    const timer = setTimeout(updateScrollArrows, 200)
    window.addEventListener('resize', updateScrollArrows)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateScrollArrows)
    }
  }, [])

  const handleArrow = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    const distance = carouselRef.current.clientWidth * 0.8
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth'
    })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 2 // Scroll-fast
    carouselRef.current.scrollLeft = scrollLeft - walk
  }

  return (
    <section className="py-20 bg-sand-50 overflow-hidden" id="social">
      <div className="max-w-7xl mx-auto px-6 mb-16 flex justify-between items-end">
        <div>
          <span className="text-sm tracking-[0.2em] uppercase text-slate-400 mb-4 block">Social</span>
          <h2 className="text-4xl md:text-5xl font-display text-slate-800">Visual Moments</h2>
        </div>
      </div>

      <div className="relative w-full">
        {/* Left Arrow */}
        {showLeftArrow && (
          <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <button
              type="button"
              onClick={() => handleArrow('left')}
              className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg active:scale-95"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <button
              type="button"
              onClick={() => handleArrow('right')}
              className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg active:scale-95"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        <div
          ref={carouselRef}
          onScroll={updateScrollArrows}
          className="flex gap-6 md:gap-8 px-6 md:px-12 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing pb-12 snap-x snap-mandatory"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
      >
        {reels.map((reel) => {
          let instagramEmbedUrl = '';
          const match = reel.url.match(/(?:reels?|p)\/([^/?#&]+)/);
          if (match && match[1]) {
            instagramEmbedUrl = `https://www.instagram.com/p/${match[1]}/embed?hidecaption=true`;
          }

          return (
            <motion.div
              key={reel.id}
              whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-[220px] md:w-[260px] h-[275px] md:h-[325px] rounded-2xl overflow-hidden relative shadow-sm hover:shadow-2xl transition-shadow duration-500 bg-slate-900 flex-shrink-0 snap-center"
              style={{ perspective: 1000 }}
            >
              {instagramEmbedUrl ? (
                <div className="w-full h-full relative overflow-hidden bg-slate-900">
                  {/* Inner wrapper perfectly frames the 4:5 video crop of the IG embed (308x385) */}
                  <div className="absolute top-0 left-0 origin-top-left w-[308px] h-[385px] scale-[0.714] md:scale-[0.844]">
                    <iframe loading="lazy"
                      src={instagramEmbedUrl}
                      className={`absolute top-[-54px] left-[-9px] w-[326px] h-[800px] max-w-none border-0 ${isDragging ? 'pointer-events-none' : ''}`}
                      scrolling="no"
                      {...{ allowtransparency: "true" }}
                      title={`Instagram Reel ${reel.id}`}
                    />
                  </div>
                  {/* Invisible overlay only while dragging to prevent iframe from capturing events */}
                  {isDragging && <div className="absolute inset-0 z-10 pointer-events-auto" />}
                </div>
              ) : (
                <div className="w-full h-full bg-slate-800 animate-pulse flex items-center justify-center text-slate-500">
                  Invalid URL
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  </section>
  )
}

export default SocialReels


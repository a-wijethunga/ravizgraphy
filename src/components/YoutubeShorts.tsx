"use client";

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ShortVideo {
  id: number
  youtubeId: string
  title: string
  category: string
}

const shorts: ShortVideo[] = [
  {
    id: 1,
    youtubeId: 'gnVHPhx0zJg',
    title: 'South Coast 🌊🌴✨🍃',
    category: 'Travel'
  },
  {
    id: 2,
    youtubeId: 'ii6tl_zjZ_U',
    title: 'Same Country, Different Life 🇱🇰🌊🌴',
    category: 'Lifestyle'
  },
  {
    id: 3,
    youtubeId: 'qckgxseWZDE',
    title: 'Choose What Brings You Peace ✨🏍️',
    category: 'Lifestyle'
  },
  {
    id: 4,
    youtubeId: 'qvS19kjVeso',
    title: 'Photoshoot at Coconut Tree Hill 🌴✨',
    category: 'Portrait'
  },
  {
    id: 5,
    youtubeId: 'yfHzq6ob0HQ',
    title: 'Started with a trip… ended with forever 🌴💍',
    category: 'Proposal'
  },
  {
    id: 6,
    youtubeId: 'x9go2U3S1FU',
    title: 'Everything feels better with you 🌊✨',
    category: 'Couple'
  },
  {
    id: 7,
    youtubeId: 'iDddtP6xrys',
    title: 'Chasing sunrise in Ahangama 🌅',
    category: 'Landscape'
  },
  {
    id: 8,
    youtubeId: 'jjy0Z4hVff4',
    title: 'Cruising Sri Lanka with Mom 🏍️',
    category: 'Family'
  },
  {
    id: 9,
    youtubeId: 'Ld6m75IsYeQ',
    title: 'Surprise Proposal in Mirissa 💍',
    category: 'Proposal'
  },
  {
    id: 10,
    youtubeId: 'WugPsAAP1wY',
    title: 'Moments in Sri Lanka 🌴',
    category: 'Vlog'
  },
  {
    id: 11,
    youtubeId: 'xt1lrA4n4Gc',
    title: 'The Photographer',
    category: 'Cinematic'
  },
  {
    id: 12,
    youtubeId: '59am8JdWbk8',
    title: 'Sri Lanka Photographer',
    category: 'Cinematic'
  },
  {
    id: 13,
    youtubeId: '4Ao4Z139S0w',
    title: 'South Coast Sri Lanka',
    category: 'Travel'
  },
  {
    id: 14,
    youtubeId: 'Oh8odKMeSG4',
    title: 'Everything is art. Art is everything.',
    category: 'Cinematic'
  },
  {
    id: 15,
    youtubeId: 'u_qjGMySsMs',
    title: 'Badass 🏍️🔥',
    category: 'Commercial'
  },
  {
    id: 16,
    youtubeId: 't-9TcKFs3Vw',
    title: 'KathC Clothing',
    category: 'Commercial'
  },
  {
    id: 17,
    youtubeId: 'kQoltd6Q-74',
    title: 'Nothing Left for Later – Cinematic Tattoo',
    category: 'Commercial'
  },
  {
    id: 18,
    youtubeId: 'eZJUVqyJylo',
    title: 'Timeless Style | Kath Ceylon Clothing',
    category: 'Commercial'
  },
  {
    id: 19,
    youtubeId: 'I7qZghkCmco',
    title: 'In your bones - Julia',
    category: 'Portrait'
  },
  {
    id: 20,
    youtubeId: 'WeL8VoTPdtw',
    title: 'Hima Ice Cream - Mirissa',
    category: 'Commercial'
  },
  {
    id: 21,
    youtubeId: 'suR8gIJffFk',
    title: 'Kalage - Ahangama',
    category: 'Commercial'
  },
  {
    id: 22,
    youtubeId: '5k6y_20jiDI',
    title: 'The White Rabbit - Ella',
    category: 'Travel'
  },
  {
    id: 23,
    youtubeId: 'kR1o0rNxASs',
    title: 'Flavors of Sri Lanka at Kalage',
    category: 'Commercial'
  },
  {
    id: 24,
    youtubeId: '2SChVoZccKs',
    title: 'Moments at Kalage Boutique Restaurant',
    category: 'Commercial'
  },
  {
    id: 25,
    youtubeId: 'zzwZwsLPFGo',
    title: 'Kunandura Villa - Galle 🍃',
    category: 'Travel'
  }
]

const YoutubeShorts = () => {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [hoveredShortId, setHoveredShortId] = useState<number | null>(null)
  const [selectedShort, setSelectedShort] = useState<ShortVideo | null>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const dragStartX = useRef(0)
  const hasDragged = useRef(false)

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
    dragStartX.current = e.pageX
    hasDragged.current = false
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
    
    // Determine if drag distance exceeds threshold to block clicks
    if (Math.abs(e.pageX - dragStartX.current) > 10) {
      hasDragged.current = true
    }
  }

  const handleCardClick = (short: ShortVideo) => {
    if (hasDragged.current) return
    setSelectedShort(short)
  }

  // Handle ESC key and scroll lock when lightbox is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedShort(null)
      }
    }

    if (selectedShort) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedShort])

  return (
    <section className="pt-6 pb-20 bg-sand-50 overflow-hidden" id="youtube-shorts">
      <div className="max-w-7xl mx-auto px-6 mb-16 flex justify-between items-end">
        <div>
          <span className="text-sm tracking-[0.2em] uppercase text-slate-400 mb-4 block">YOUTUBE SHORTS</span>
          <h2 className="text-4xl md:text-5xl font-display text-slate-800">Visual Stories</h2>
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
          {shorts.map((short) => (
            <motion.div
              key={short.id}
              whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-[220px] md:w-[260px] h-[275px] md:h-[325px] rounded-2xl overflow-hidden relative shadow-sm hover:shadow-2xl transition-shadow duration-500 bg-slate-900 flex-shrink-0 snap-center cursor-pointer group"
              style={{ perspective: 1000 }}
              onMouseEnter={() => setHoveredShortId(short.id)}
              onMouseLeave={() => setHoveredShortId(null)}
              onClick={() => handleCardClick(short)}
            >
              {/* Static Image Thumbnail */}
              <img decoding="async"
                src={`https://img.youtube.com/vi/${short.youtubeId}/hqdefault.jpg`}
                alt={short.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />

              {/* Hover Autoplay Preview (Muted Youtube Iframe) */}
              {hoveredShortId === short.id && (
                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden rounded-2xl">
                  <iframe loading="lazy"
                    src={`https://www.youtube.com/embed/${short.youtubeId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${short.youtubeId}&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0`}
                    className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 scale-[1.35] border-0"
                    allow="autoplay; encrypted-media"
                    title={short.title}
                  />
                </div>
              )}

              {/* Subtle Hover Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors duration-500">
                <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-out">
                  <svg className="w-5 h-5 fill-current translate-x-[2px]" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Typography Overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end text-white pointer-events-none">
                <span className="text-[9px] tracking-[0.2em] uppercase text-white/70 mb-1">{short.category}</span>
                <h3 className="text-xs font-sans font-medium tracking-wide leading-snug">{short.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedShort && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={() => setSelectedShort(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-[420px] aspect-[9/16] max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe loading="lazy"
                src={`https://www.youtube.com/embed/${selectedShort.youtubeId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title={selectedShort.title}
              />
              
              {/* Close Button on Modal Card */}
              <button
                onClick={() => setSelectedShort(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors duration-300 backdrop-blur-sm border border-white/10"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default YoutubeShorts

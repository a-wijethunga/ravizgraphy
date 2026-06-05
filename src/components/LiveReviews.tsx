"use client";

import React, { useEffect, useState, useRef } from 'react'
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion'
import { Star, ArrowUpRight } from 'lucide-react'

// Platform URLs
const GOOGLE_REVIEWS_URL = 'https://maps.google.com?q=Yahalawatta,%20Ravizgraphy%20Studio,%20Bopitiya,%20Akuress&ftid=0x69931ef6e8087091:0x5e54a3ffe9214463'
const TRIPADVISOR_URL = 'https://www.tripadvisor.co.uk/AttractionProductReview-g946553-d34045002-Cinematic_Photoshoot_Experience_on_Sri_Lanka_s_South_Coast-Matara_Southern_Provinc.html'
const DEFAULT_PLACE_ID = 'ChIJkWAI6PbekDkRZEQh6f-jVF4' // Ravizgraphy Studio Place ID

interface Review {
  id: string | number
  name: string
  photo: string
  rating: number
  text: string
  platform: 'google' | 'tripadvisor'
  date: string
}

// Highly detailed curated reviews (Premium fallback)
const fallbackReviews: Review[] = [
  {
    id: 'google-1',
    name: 'Sahan K.',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    text: 'Ravish was extremely professional and the photoshoot at the beach was amazing. His cinematic edits are mind-blowing! Highly recommend Ravizgraphy.',
    platform: 'google',
    date: '1 week ago',
  },
  {
    id: 'trip-1',
    name: 'Emily R.',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    text: "The South Coast photoshoot was one of the highlights of our trip. Beautiful cinematic shots on the beach. Absolute gem!",
    platform: 'tripadvisor',
    date: '2 weeks ago',
  },
  {
    id: 'google-2',
    name: 'Nilusha S.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    text: 'Best photoshoot experience in Sri Lanka. Ravish has a great eye for storytelling and captured our post-wedding shoots beautifully.',
    platform: 'google',
    date: '3 weeks ago',
  },
  {
    id: 'trip-2',
    name: 'Marc L.',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    text: 'Incredible cinematic photos and video! Ravish knows the best spots in Mirissa and Bopitiya. Super friendly and talented.',
    platform: 'tripadvisor',
    date: '1 month ago',
  },
  {
    id: 'google-3',
    name: 'Johannes M.',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    text: 'Amazing photography and video work. Friendly guy, very easy to work with. The highlights video he made is pure art!',
    platform: 'google',
    date: '1 month ago',
  },
  {
    id: 'trip-3',
    name: 'Chloe T.',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    text: 'A truly magical photoshoot. Very chill atmosphere, natural poses, and the edits look straight out of a movie.',
    platform: 'tripadvisor',
    date: '2 months ago',
  },
]

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.19-2.772-6.19-6.19 0-3.417 2.78-6.19 6.19-6.19 1.558 0 2.973.576 4.07 1.527l3.11-3.11C19.262 2.666 16.002 1.5 12.24 1.5 6.29 1.5 1.5 6.29 1.5 12.24s4.79 10.74 10.74 10.74c5.96 0 10.82-4.79 10.82-10.74 0-.693-.077-1.37-.215-1.955H12.24z" />
  </svg>
)

const TripAdvisorIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1.5a10.5 10.5 0 1 0 10.5 10.5A10.51 10.51 0 0 0 12 1.5zm0 18a7.5 7.5 0 1 1 7.5-7.5 7.51 7.51 0 0 1-7.5 7.5zm-3.75-9a1.5 1.5 0 1 0 1.5 1.5 1.5 1.5 0 0 0-1.5-1.5zm7.5 0a1.5 1.5 0 1 0 1.5 1.5 1.5 1.5 0 0 0-1.5-1.5z" />
  </svg>
)

interface ReviewCardProps {
  review: Review
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="h-full w-[310px] md:w-[380px] flex flex-col justify-between bg-white/40 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.02)] hover:bg-white/70 hover:border-slate-200/80 hover:shadow-[0_25px_60px_rgba(15,23,42,0.06)] transition-all duration-300 cursor-pointer select-none group"
    >
      <div>
        {/* Header: Name, Platform */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-sm font-semibold tracking-wider text-slate-800 uppercase font-sans">
              {review.name}
            </h4>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block mt-0.5">
              {review.date}
            </span>
          </div>

          {/* Small Platform Badge */}
          <span
            className={`p-2.5 rounded-full border flex items-center justify-center transition-transform duration-300 group-hover:rotate-12 ${
              review.platform === 'google'
                ? 'text-amber-500 bg-amber-500/5 border-amber-500/10'
                : 'text-emerald-600 bg-emerald-600/5 border-emerald-600/10'
            }`}
            title={review.platform === 'google' ? 'Google Review' : 'TripAdvisor Review'}
          >
            {review.platform === 'google' ? <GoogleIcon /> : <TripAdvisorIcon />}
          </span>
        </div>

        {/* Star Rating */}
        <div className="flex gap-0.5 mb-4">
          {[...Array(5)].map((_, i) => {
            const active = i < review.rating
            return (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  active
                    ? review.platform === 'google'
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-emerald-600 fill-emerald-600'
                    : 'text-slate-200'
                }`}
              />
            )
          })}
        </div>

        {/* Review text */}
        <p className="text-slate-600 font-light italic leading-relaxed text-sm md:text-[14.5px]">
          "{review.text}"
        </p>
      </div>
    </motion.div>
  )
}

const LiveReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews)
  const [loading, setLoading] = useState<boolean>(false)
  const scriptLoadedRef = useRef(false)

  // Custom marquee state
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const isDown = useRef(false)
  const startX = useRef(0)

  const [baseWidth, setBaseWidth] = useState(0)
  const [speed, setSpeed] = useState(55)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || (process.env as any).VITE_GOOGLE_PLACES_API_KEY
    const placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || (process.env as any).VITE_GOOGLE_PLACE_ID || DEFAULT_PLACE_ID

    if (!apiKey || scriptLoadedRef.current) {
      return
    }

    setLoading(true)
    scriptLoadedRef.current = true

    // Dynamically inject Google Maps JavaScript API script
    const scriptId = 'google-maps-places-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement

    const initPlacesService = () => {
      try {
        const dummyDiv = document.createElement('div')
        const googleObj = (window as any).google
        if (googleObj && googleObj.maps && googleObj.maps.places) {
          const service = new googleObj.maps.places.PlacesService(dummyDiv)
          service.getDetails(
            {
              placeId: placeId,
              fields: ['reviews'],
            },
            (place: any, status: any) => {
              if (
                status === googleObj.maps.places.PlacesServiceStatus.OK &&
                place &&
                place.reviews
              ) {
                // Map Google reviews to our custom structure
                const googleReviews: Review[] = place.reviews.map(
                  (rev: any, index: number) => ({
                    id: `google-live-${index}`,
                    name: rev.author_name,
                    photo: rev.profile_photo_url || '',
                    rating: rev.rating || 5,
                    text: rev.text || '',
                    platform: 'google',
                    date: rev.relative_time_description || 'Recent',
                  })
                )

                // Interleave live Google reviews with curated TripAdvisor reviews
                const tripAdvisorReviews = fallbackReviews.filter(
                  (r) => r.platform === 'tripadvisor'
                )
                
                // Combine and set reviews
                const combined = [...googleReviews, ...tripAdvisorReviews]
                setReviews(combined.length > 0 ? combined : fallbackReviews)
              }
              setLoading(false)
            }
          )
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to query Google Places details:', err)
        setLoading(false)
      }
    }

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        initPlacesService()
      }
      script.onerror = () => {
        console.warn('Google Places API Script failed to load. Falling back to curated data.')
        setLoading(false)
      }
      document.body.appendChild(script)
    } else {
      if ((window as any).google) {
        initPlacesService()
      } else {
        script.addEventListener('load', initPlacesService)
      }
    }
  }, [])

  // Calculate widths & responsive speeds
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setBaseWidth(containerRef.current.scrollWidth / 3)
      }
      // Speed adjustments: slower crawling on mobile, premium glide on desktop
      if (window.innerWidth < 768) {
        setSpeed(35)
      } else {
        setSpeed(55)
      }
    }

    updateDimensions()

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions()
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    window.addEventListener('resize', updateDimensions)
    return () => {
      window.removeEventListener('resize', updateDimensions)
      resizeObserver.disconnect()
    }
  }, [reviews])

  // Custom animation frame updates
  useAnimationFrame((_, delta) => {
    if (!baseWidth) return

    if (!isHovered && !isDragging) {
      const currentX = x.get()
      let newX = currentX - speed * (delta / 1000)

      // Seamless wrap-around
      if (newX <= -baseWidth) {
        newX += baseWidth
      }
      x.set(newX)
    }
  })

  // Custom drag wrapping calculations to keep drag/swipe infinite
  const handleDragStart = (pointerX: number) => {
    isDown.current = true
    setIsDragging(true)
    startX.current = pointerX - x.get()
  }

  const handleDragMove = (pointerX: number) => {
    if (!isDown.current) return
    let targetX = pointerX - startX.current

    if (targetX <= -baseWidth * 2) {
      targetX += baseWidth
      startX.current = pointerX - targetX
    } else if (targetX > 0) {
      targetX -= baseWidth
      startX.current = pointerX - targetX
    }
    x.set(targetX)
  }

  const handleDragEnd = () => {
    isDown.current = false
    setIsDragging(false)
  }

  // Duplicate items twice to ensure seamless continuous sliding in loop mode
  const displayReviews = [...reviews, ...reviews, ...reviews]

  return (
    <section id="reviews" className="relative py-32 bg-cream-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-xs font-sans tracking-[0.25em] uppercase text-slate-400 mb-4 block"
            >
              Live Reviews
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1 }}
              className="text-4xl md:text-5xl font-display text-slate-800 tracking-tight leading-tight uppercase font-light"
            >
              Trusted by Our Clients
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-sm font-sans text-slate-500 mt-4 max-w-xl font-light"
            >
              Real experiences. Real emotions. Captured forever.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap gap-6"
          >
            {/* Google Stats Card */}
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white/60 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.03)] hover:border-slate-300 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="text-amber-500 bg-amber-500/5 p-3 rounded-xl">
                <GoogleIcon />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-slate-800">5.0</span>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-slate-500">80+ Google Reviews</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
            </a>

            {/* TripAdvisor Stats Card */}
            <a
              href={TRIPADVISOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white/60 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.03)] hover:border-slate-300 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="text-emerald-600 bg-emerald-600/5 p-3 rounded-xl">
                <TripAdvisorIcon />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-slate-800">5.0</span>
                  <div className="flex text-emerald-600">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-slate-500">10+ TripAdvisor Reviews</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Testimonials continuous Marquee Slider */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full relative z-10 overflow-hidden"
      >
        {loading ? (
          // Shimmer loading cards (aligned with non-profile cards)
          <div className="flex gap-6 max-w-7xl mx-auto px-6 overflow-hidden">
            {[...Array(3)].map((_, idx) => (
              <div
                key={`loading-${idx}`}
                className="w-[310px] md:w-[380px] flex-shrink-0 bg-white/60 backdrop-blur-md border border-slate-200/40 p-8 rounded-3xl animate-pulse flex flex-col gap-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full overflow-hidden cursor-grab active:cursor-grabbing select-none">
            <motion.div
              ref={containerRef}
              style={{ x, willChange: 'transform' }}
              className="flex gap-6 w-max py-4 px-6"
              onMouseDown={(e) => {
                if (e.button !== 0) return
                handleDragStart(e.clientX)
              }}
              onMouseMove={(e) => {
                if (isDown.current) {
                  e.preventDefault()
                  handleDragMove(e.clientX)
                }
              }}
              onMouseUp={handleDragEnd}
              onMouseLeave={() => {
                handleDragEnd()
                setIsHovered(false)
              }}
              onMouseEnter={() => setIsHovered(true)}
              onTouchStart={(e) => {
                setIsHovered(true)
                if (e.touches[0]) {
                  handleDragStart(e.touches[0].clientX)
                }
              }}
              onTouchMove={(e) => {
                if (e.touches[0]) {
                  handleDragMove(e.touches[0].clientX)
                }
              }}
              onTouchEnd={() => {
                handleDragEnd()
                setIsHovered(false)
              }}
            >
              {displayReviews.map((review, index) => (
                <div key={`${review.id}-${index}`} className="flex-shrink-0">
                  <ReviewCard review={review} />
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Ambient side blurs for cinematic depth */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-64 bg-gradient-to-r from-cream-50 via-cream-50/80 to-transparent z-20"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-64 bg-gradient-to-l from-cream-50 via-cream-50/80 to-transparent z-20"></div>

      {/* CTA Buttons */}
      <div className="max-w-7xl mx-auto px-6 mt-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-6"
        >
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-slate-300 text-xs font-semibold uppercase tracking-widest text-slate-800 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 group"
          >
            <span>View All Google Reviews</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-2 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
          <a
            href={TRIPADVISOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-slate-300 text-xs font-semibold uppercase tracking-widest text-slate-800 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 group"
          >
            <span>View All TripAdvisor Reviews</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-2 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default LiveReviews

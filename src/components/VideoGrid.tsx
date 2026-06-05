"use client";

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface VideoItem {
  id: number
  title: string
  youtubeId: string
  description: string
}

const videos: VideoItem[] = [
  { id: 1, title: 'Evening Meditation', youtubeId: 'arzWIYZL6tc', description: 'Letting Go and Coming Home' },
  { id: 2, title: 'THE TOTAL RESET', youtubeId: '61a4s0RQv9k', description: '40 Minutes Yoga for Mental & Emotional Clarity' },
  { id: 3, title: 'Guided Meditation for Grief and Loss', youtubeId: 'bM95y1KZ2mQ', description: 'Gentle Healing' },
  { id: 4, title: 'Land Rover Cinematic Spec Commercial', youtubeId: 'eqr3OYFBoKY', description: 'Cinematic Commercial' },
  { id: 5, title: 'OnePlus 9 Pro Spec Commercial', youtubeId: 'vOZi7thazXw', description: 'Cinematic Commercial' },
  { id: 6, title: 'A cinematic glimpse into the calm and flow of yoga at Kurulubay', youtubeId: 'LHc3naNHex8', description: 'Where breath meets nature, and movement becomes meditation.' },
  { id: 7, title: 'Push Through the Pain', youtubeId: 'lfaPRLzEZ9M', description: 'Become Unstoppable' },
  { id: 8, title: 'Grind Now, Shine Later', youtubeId: '4Cgz8XYy_8E', description: 'Cinematic video' },
  { id: 9, title: 'Conquer Yourself', youtubeId: 'J67TlQxQT_c', description: 'Cinematic video' },
  { id: 10, title: 'Conquer the Darkness Within YouS', youtubeId: 'T6tHkAFdfFY', description: 'Cinematic video' },
  { id: 11, title: 'Remember That Dream', youtubeId: 'vBSElTsSjH0', description: 'Cinematic video' },
  { id: 12, title: 'When Life Breaks You', youtubeId: 'tTpSAqXdjIQ', description: 'Cinematic video' },
  { id: 13, title: 'Echoes of Silence', youtubeId: 'NqSeUQ063VU', description: 'A cinematic short for the Echoes of Silence project' },
]

const getVideoId = (idOrUrl: string) => {
  const match = idOrUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|v\/|.*[?&]v=))([A-Za-z0-9_-]{11})/)
  return match ? match[1] : idOrUrl
}

const getThumbnail = (youtubeId: string) =>
  `https://img.youtube.com/vi/${getVideoId(youtubeId)}/hqdefault.jpg`

const VideoGrid = () => {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    document.body.style.overflow = activeVideo ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeVideo])

  const closeModal = () => setActiveVideo(null)

  const handleArrow = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const distance = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({ left: direction === 'left' ? -distance : distance, behavior: 'smooth' })
  }

  return (
    <section className="relative py-28 bg-cream-50 text-slate-900" id="video">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cream-50/95 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="text-sm tracking-[0.3em] uppercase text-slate-400">
              Cinematic Films
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-display text-slate-900">
              Cinematic Video Collection
            </h2>

          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleArrow('left')}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white"
              aria-label="Scroll left"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => handleArrow('right')}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white"
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.25)]">
          <div
            ref={scrollRef}
            className="scrollbar-hide flex gap-6 overflow-x-auto px-4 py-8 snap-x snap-mandatory touch-pan-y"
          >
            {videos.map((video, index) => {
              const thumbnail = getThumbnail(video.youtubeId)

              return (
                <motion.button
                  key={video.id}
                  type="button"
                  onClick={() => setActiveVideo(video)}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="group snap-center min-w-[290px] sm:min-w-[340px] md:min-w-[380px] lg:min-w-[420px] xl:min-w-[460px] overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.18)] transition-transform duration-500 hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden rounded-t-[28px] bg-slate-950">
                    <img decoding="async"
                      src={thumbnail}
                      alt={video.title}
                      loading="lazy"
                      className="h-full w-full min-h-[240px] object-cover transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-lg transition duration-500 group-hover:scale-110">
                        <span className="text-2xl">▶</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 px-6 py-7 text-left">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                      Featured Film
                    </p>
                    <h3 className="text-2xl font-display text-slate-900 transition-colors duration-300 group-hover:text-slate-700">
                      {video.title}
                    </h3>
                    <p className="text-sm leading-7 text-slate-600">
                      {video.description}
                    </p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeVideo && (
          <motion.div
            key="video-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-5xl rounded-[32px] border border-white/20 bg-white/95 shadow-[0_35px_120px_rgba(15,23,42,0.25)]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close video"
                className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-700 shadow-sm transition duration-300 hover:bg-white"
              >
                ✕
              </button>

              <div className="relative overflow-hidden rounded-[32px]">
                <div className="aspect-[16/9] bg-slate-950">
                  <iframe loading="lazy"
                    title={activeVideo.title}
                    src={`https://www.youtube.com/embed/${getVideoId(activeVideo.youtubeId)}?autoplay=1&rel=0&modestbranding=1&controls=1`}
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default VideoGrid

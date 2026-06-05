"use client";

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

const films = [
  {
    id: 1,
    title: 'Beautiful Maternity Story',
    client: 'Personal Work',
    subtitle: 'Captured this In Thalpe',
    videoUrl: 'https://youtu.be/NqSeUQ063VU?si=o3aiBgBSH-_gAzyK',
    duration: '0:32',
  },
  {
    id: 2,
    title: 'Ravinga & Dhanushka',
    client: 'Wedding Film',
    subtitle: 'Wedding Film',
    videoUrl: 'https://youtu.be/N_sQx9wlnww?si=Dj5CcRt1y6Zhcrpp',
    duration: '3:08',
  },
]

const getYouTubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|v\/|.*[?&]v=))([A-Za-z0-9_-]{11})/)
  return match ? match[1] : url
}

const VideographyWork = () => {
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null)

  return (
    <section className="py-40 bg-cream-50" id="videography">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-24">
          <span className="text-sm tracking-[0.2em] uppercase text-slate-400 mb-4 block">Selected Works</span>
          <h2 className="text-4xl md:text-5xl font-display text-slate-800">Videography</h2>
        </div>

        <div className="flex flex-col gap-32">
          {films.map((film) => {
            const isPlaying = activeVideoId === film.id
            const videoId = film.videoUrl ? getYouTubeId(film.videoUrl) : ''
            const hasVideo = Boolean(film.videoUrl)
            const thumbnail = hasVideo ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : (film as any).image || ''

            return (
              <motion.div
                key={film.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className={`group block w-full ${hasVideo ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => hasVideo && setActiveVideoId((current) => (current === film.id ? null : film.id))}
                role={hasVideo ? 'button' : undefined}
                aria-label={hasVideo ? `Play ${film.title}` : undefined}
              >
                <div className="relative aspect-[21/9] overflow-hidden rounded-[28px] bg-sand-100 shadow-[0_40px_90px_-45px_rgba(15,23,42,0.15)]">
                  <AnimatePresence mode="wait">
                    {!isPlaying ? (
                      <motion.div
                        key="thumbnail"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="relative h-full w-full overflow-hidden"
                      >
                        <motion.img decoding="async" loading="lazy"
                          src={thumbnail}
                          alt={film.title}
                          className="h-full w-full object-cover transition-transform duration-1000 ease-out"
                          whileHover={hasVideo ? { scale: 1.04 } : undefined}
                        />


                        {hasVideo && (
                          <>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white shadow-[0_35px_60px_-30px_rgba(15,23,42,0.45)] transition duration-500 group-hover:scale-105">
                                <span className="text-4xl">▶</span>
                              </div>
                            </div>

                            <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
                              <div className="flex flex-col gap-3 rounded-[28px] bg-slate-950/75 px-4 py-4 text-white shadow-[0_30px_80px_-55px_rgba(15,23,42,0.5)] md:flex-row md:items-center md:justify-between">
                                <div className="space-y-1">
                                  <p className="text-sm font-semibold tracking-[0.15em] uppercase">{film.subtitle}</p>
                                  
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_-20px_rgba(0,0,0,0.55)]">
                                  <span>{film.duration}</span>
                                  <span className="hidden sm:inline">• Cinematic Video</span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="iframe"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0"
                      >
                        <iframe loading="lazy"
                          title={film.title}
                          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                          allowFullScreen
                          className="h-full w-full"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-8 flex flex-col gap-3 px-4 md:flex-row md:items-baseline md:justify-between">
                  <h3 className="text-3xl font-display text-slate-800 transition-all duration-500 group-hover:italic">
                    {film.title}
                  </h3>
                  <span className="text-xs font-mono tracking-[0.15em] uppercase text-slate-400">
                    {film.client}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default VideographyWork

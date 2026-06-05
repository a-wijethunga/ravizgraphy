"use client";

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react'

interface BestShotsPhoto {
  id: string
  public_url: string
  title: string
  alt_text?: string
}

interface BestShotsConfig {
  title: string
  highlight: string
  description: string
  visible: boolean
  limit: number
  layout: 'cinematic' | 'grid' | 'masonry' | 'featured'
  photos: BestShotsPhoto[]
}

const ease = [0.16, 1, 0.3, 1] as const

const getCinematicClass = (index: number) => {
  const classes = [
    'min-h-[320px] md:min-h-[390px]',
    'min-h-[320px] md:min-h-[390px]',
    'min-h-[360px] md:min-h-[470px] lg:col-span-2',
    'min-h-[320px] md:min-h-[420px]',
    'min-h-[320px] md:min-h-[420px]',
    'min-h-[320px] md:min-h-[430px]',
    'min-h-[280px] md:min-h-[360px]',
    'min-h-[360px] md:min-h-[470px] lg:col-span-2',
  ]
  return classes[index % classes.length] || 'min-h-[320px] md:min-h-[400px]'
}

const getMasonryAspect = (index: number) => {
  const aspects = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-[2/3]', 'aspect-[4/3]', 'aspect-[3/2]']
  return aspects[index % aspects.length] || 'aspect-[4/5]'
}

const FeaturedWork: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [config, setConfig] = useState<BestShotsConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const heroY = useTransform(scrollYProgress, [0, 1], ['-4%', '5%'])
  const gridY = useTransform(scrollYProgress, [0, 1], ['3%', '-3%'])

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/gallery/best-shots')
        if (res.ok) {
          const data = await res.json()
          setConfig(data)
        }
      } catch (err) {
        console.error('Failed to load Best Shots configuration:', err)
      } finally {
        setLoading(false)
      }
    }
    void fetchConfig()
  }, [])

  const displayPhotos = config ? (config.photos || []).slice(0, config.limit || 9) : []
  const activePhoto = activeIndex !== null ? displayPhotos[activeIndex] ?? null : null

  const closeLightbox = () => setActiveIndex(null)
  const showPrevious = () => {
    setActiveIndex((current) => {
      if (current === null) return current
      return (current - 1 + displayPhotos.length) % displayPhotos.length
    })
  }
  const showNext = () => {
    setActiveIndex((current) => {
      if (current === null) return current
      return (current + 1) % displayPhotos.length
    })
  }

  useEffect(() => {
    if (activeIndex === null) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLightbox()
      if (event.key === 'ArrowLeft') showPrevious()
      if (event.key === 'ArrowRight') showNext()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [activeIndex, displayPhotos.length])

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-cream-50 px-6 py-28 text-slate-900 md:py-36 lg:py-44 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-6 w-6 text-rose-500 animate-spin" />
        <span className="text-xs text-slate-400 mt-3 tracking-widest uppercase">Loading features...</span>
      </section>
    )
  }

  if (!config || !config.visible || !displayPhotos.length) {
    return null
  }

  const leadPhoto = displayPhotos[0]
  const layout = config.layout || 'cinematic'

  return (
    <section
      ref={sectionRef}
      id="featured-work"
      className="relative overflow-hidden bg-cream-50 px-6 py-28 text-slate-900 md:py-36 lg:py-44"
    >
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-cream-50 to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-14 grid gap-8 md:mb-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease }}
              className="mb-6 block text-xs font-sans uppercase tracking-[0.25em] text-slate-400"
            >
              Featured Work
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, delay: 0.08, ease }}
              className="max-w-3xl text-5xl font-display font-light leading-[1.08] tracking-tight text-slate-800 md:text-6xl lg:text-7xl"
            >
              {config.title || 'My Best'}{' '}
              <span className="italic text-slate-500">{config.highlight || 'Shots'}</span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.16, ease }}
            className="max-w-xl text-base font-light leading-8 text-slate-500 md:justify-self-end md:text-lg"
          >
            {config.description || 'A quiet selection of cinematic portraits, movement, romance, and coastal atmosphere.'}
          </motion.p>
        </div>

        {/* 1. CINEMATIC LAYOUT */}
        {layout === 'cinematic' && leadPhoto && (
          <div className="grid gap-5 lg:grid-cols-[1.05fr_1.15fr] lg:gap-6">
            <motion.button
              type="button"
              onClick={() => setActiveIndex(0)}
              style={{ y: heroY }}
              initial={{ opacity: 0, y: 44 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1.05, ease }}
              className="group relative min-h-[560px] overflow-hidden rounded-[28px] border border-white/80 bg-white/75 text-left shadow-[0_35px_100px_-55px_rgba(15,23,42,0.45)] md:min-h-[700px] lg:min-h-[860px]"
              aria-label={`Open ${leadPhoto.title} in lightbox`}
            >
              <Image
                src={leadPhoto.public_url}
                alt={leadPhoto.alt_text || leadPhoto.title}
                fill
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="object-cover transition duration-1000 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 md:p-9">
                <span className="mb-3 block text-[10px] uppercase tracking-[0.28em] text-white/70">
                  Lead Frame
                </span>
                <h3 className="text-3xl font-display font-light text-white md:text-4xl">
                  {leadPhoto.title}
                </h3>
              </div>
            </motion.button>

            <motion.div style={{ y: gridY }} className="grid gap-5 md:grid-cols-2 lg:gap-6">
              {displayPhotos.slice(1).map((photo, index) => {
                const photoIndex = index + 1
                const cinematicClass = getCinematicClass(index)

                return (
                  <motion.button
                    key={photo.id || index}
                    type="button"
                    onClick={() => setActiveIndex(photoIndex)}
                    initial={{ opacity: 0, y: 38 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.9, delay: index * 0.06, ease }}
                    whileHover={{ y: -6 }}
                    className={`group relative overflow-hidden rounded-[28px] border border-white/80 bg-white/75 text-left shadow-[0_24px_80px_-50px_rgba(15,23,42,0.38)] ${cinematicClass}`}
                    aria-label={`Open ${photo.title} in lightbox`}
                  >
                    <Image
                      src={photo.public_url}
                      alt={photo.alt_text || photo.title}
                      fill
                      sizes="(min-width: 1024px) 24vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition duration-1000 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent opacity-80 transition duration-500 group-hover:opacity-95" />
                    <div className="absolute inset-x-0 bottom-0 translate-y-2 p-5 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:p-6">
                      <span className="text-[10px] uppercase tracking-[0.24em] text-white/75">
                        {String(photoIndex + 1).padStart(2, '0')}
                      </span>
                      <h3 className="mt-2 text-2xl font-display font-light text-white">
                        {photo.title}
                      </h3>
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>
          </div>
        )}

        {/* 2. GRID LAYOUT */}
        {layout === 'grid' && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {displayPhotos.map((photo, index) => (
              <motion.button
                key={photo.id || index}
                type="button"
                onClick={() => setActiveIndex(index)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, delay: index * 0.05, ease }}
                whileHover={{ y: -6 }}
                className="group relative aspect-square overflow-hidden rounded-[28px] border border-white/80 bg-white/75 text-left shadow-[0_24px_80px_-50px_rgba(15,23,42,0.38)]"
                aria-label={`Open ${photo.title} in lightbox`}
              >
                <Image
                  src={photo.public_url}
                  alt={photo.alt_text || photo.title}
                  fill
                  sizes="(min-width: 1024px) 31vw, (min-width: 768px) 48vw, 100vw"
                  className="object-cover transition duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent opacity-80 transition duration-500 group-hover:opacity-95" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <span className="text-[10px] uppercase tracking-[0.24em] text-white/75">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-2 text-xl font-display font-light text-white truncate">
                    {photo.title}
                  </h3>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* 3. MASONRY LAYOUT */}
        {layout === 'masonry' && (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 [column-fill:_balance] box-border">
            {displayPhotos.map((photo, index) => {
              const masonryAspect = getMasonryAspect(index)
              return (
                <motion.button
                  key={photo.id || index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.8, delay: index * 0.05, ease }}
                  whileHover={{ y: -4 }}
                  className={`group relative overflow-hidden rounded-[28px] border border-white/80 bg-white/75 text-left shadow-[0_24px_80px_-50px_rgba(15,23,42,0.38)] mb-6 block w-full ${masonryAspect}`}
                  aria-label={`Open ${photo.title} in lightbox`}
                >
                  <Image
                    src={photo.public_url}
                    alt={photo.alt_text || photo.title}
                    fill
                    sizes="(min-width: 1024px) 31vw, (min-width: 768px) 48vw, 100vw"
                    className="object-cover transition duration-1000 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent opacity-80 transition duration-500 group-hover:opacity-95" />
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <span className="text-[10px] uppercase tracking-[0.24em] text-white/75">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-2 text-xl font-display font-light text-white truncate">
                      {photo.title}
                    </h3>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}

        {/* 4. FEATURED LAYOUT */}
        {layout === 'featured' && leadPhoto && (
          <div className="space-y-6">
            <motion.button
              type="button"
              onClick={() => setActiveIndex(0)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease }}
              className="w-full relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-[28px] border border-white/80 bg-white/75 shadow-[0_35px_100px_-55px_rgba(15,23,42,0.45)] text-left group"
              aria-label={`Open ${leadPhoto.title} in lightbox`}
            >
              <Image
                src={leadPhoto.public_url}
                alt={leadPhoto.alt_text || leadPhoto.title}
                fill
                priority
                sizes="100vw"
                className="object-cover transition duration-1000 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/5 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7 md:p-9">
                <span className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-white/70">
                  Featured Focus
                </span>
                <h3 className="text-3xl font-display font-light text-white md:text-4xl">
                  {leadPhoto.title}
                </h3>
              </div>
            </motion.button>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {displayPhotos.slice(1).map((photo, index) => {
                const photoIndex = index + 1
                return (
                  <motion.button
                    key={photo.id || index}
                    type="button"
                    onClick={() => setActiveIndex(photoIndex)}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.8, delay: index * 0.05, ease }}
                    whileHover={{ y: -6 }}
                    className="group relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/80 bg-white/75 text-left shadow-[0_24px_80px_-50px_rgba(15,23,42,0.38)]"
                    aria-label={`Open ${photo.title} in lightbox`}
                  >
                    <Image
                      src={photo.public_url}
                      alt={photo.alt_text || photo.title}
                      fill
                      sizes="(min-width: 1024px) 31vw, (min-width: 768px) 48vw, 100vw"
                      className="object-cover transition duration-1000 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent opacity-80 transition duration-500 group-hover:opacity-95" />
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                      <span className="text-[10px] uppercase tracking-[0.24em] text-white/75">
                        {String(photoIndex + 1).padStart(2, '0')}
                      </span>
                      <h3 className="mt-2 text-xl font-display font-light text-white truncate">
                        {photo.title}
                      </h3>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Dialog */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            key="featured-work-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`${activePhoto.title} lightbox`}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                closeLightbox()
              }}
              className="absolute right-5 top-5 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur transition hover:bg-white/20"
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                showPrevious()
              }}
              className="absolute left-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur transition hover:bg-white/20 md:left-8 md:h-12 md:w-12"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.45, ease }}
              className="relative h-[82dvh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/15 bg-slate-950 shadow-[0_40px_120px_rgba(0,0,0,0.45)]"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={activePhoto.public_url}
                alt={activePhoto.alt_text || activePhoto.title}
                fill
                sizes="(min-width: 1024px) 70vw, 94vw"
                className="object-contain"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent p-6 md:p-8">
                <span className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-white/55">
                  Featured Work
                </span>
                <h3 className="text-2xl font-display font-light text-white md:text-3xl">
                  {activePhoto.title}
                </h3>
              </div>
            </motion.div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                showNext()
              }}
              className="absolute right-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur transition hover:bg-white/20 md:right-8 md:h-12 md:w-12"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default FeaturedWork

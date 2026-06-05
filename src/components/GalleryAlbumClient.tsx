"use client";

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Grid3X3, Play, X } from 'lucide-react'
import type { GalleryAlbumDetail, GalleryPhoto, GalleryVideo } from '@/types/gallery'

type LightboxItem =
  | { type: 'photo'; item: GalleryPhoto }
  | { type: 'video'; item: GalleryVideo }

const ease = [0.16, 1, 0.3, 1] as const

export default function GalleryAlbumClient({ album }: { album: GalleryAlbumDetail }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const items = useMemo<LightboxItem[]>(
    () => [
      ...album.photos.map((photo) => ({ type: 'photo' as const, item: photo })),
      ...album.videos.map((video) => ({ type: 'video' as const, item: video })),
    ],
    [album.photos, album.videos]
  )

  const activeItem = activeIndex !== null ? items[activeIndex] ?? null : null

  const close = () => setActiveIndex(null)
  const previous = () => setActiveIndex((current) => (current === null ? current : (current - 1 + items.length) % items.length))
  const next = () => setActiveIndex((current) => (current === null ? current : (current + 1) % items.length))

  useEffect(() => {
    if (activeIndex === null) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowLeft') previous()
      if (event.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [activeIndex])

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return
    const distance = touchStart - touchEnd
    if (distance > 50) next()
    if (distance < -50) previous()
    setTouchStart(null)
    setTouchEnd(null)
  }

  return (
    <main className="min-h-screen bg-cream-50 text-slate-900">
      <section className="relative overflow-hidden px-6 pb-20 pt-32 md:pb-28 md:pt-40">
        <div className="mx-auto max-w-7xl">
          <Link href="/#photography" className="mb-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-400 transition hover:text-slate-700">
            <Grid3X3 className="h-4 w-4" />
            Back to gallery
          </Link>

          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease }}
                className="mb-6 block text-xs uppercase tracking-[0.25em] text-slate-400"
              >
                {album.category?.name ?? 'Gallery'} {album.subcategory?.name ? `/ ${album.subcategory.name}` : ''}
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.1, ease }}
                className="text-5xl font-display font-light leading-[1.08] tracking-tight text-slate-800 md:text-7xl"
              >
                {album.title}
              </motion.h1>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.18, ease }}
              className="space-y-6 text-slate-500"
            >
              {album.description && <p className="max-w-2xl text-lg font-light leading-8">{album.description}</p>}
              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em]">
                {album.sub_albums && album.sub_albums.length > 0 ? (
                  <span className="rounded-full border border-slate-200 bg-white px-4 py-2">{album.sub_albums.length} Galleries</span>
                ) : (
                  <>
                    <span className="rounded-full border border-slate-200 bg-white px-4 py-2">{album.photos.length} Photos</span>
                    <span className="rounded-full border border-slate-200 bg-white px-4 py-2">{album.videos.length} Videos</span>
                  </>
                )}
                {album.event_date && <span className="rounded-full border border-slate-200 bg-white px-4 py-2">{new Date(album.event_date).toLocaleDateString()}</span>}
              </div>
            </motion.div>
          </div>

          {album.sub_albums && album.sub_albums.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mt-16">
              {album.sub_albums.map((sub, index) => {
                const cover = sub.cover_url
                return (
                  <motion.article
                    key={sub.id}
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.85, delay: index * 0.05, ease }}
                    className="group overflow-hidden rounded-[28px] border border-white/80 bg-white/80 shadow-[0_28px_90px_-58px_rgba(15,23,42,0.45)] transition hover:-translate-y-1"
                  >
                    <Link href={`/gallery/${sub.slug}`} className="block">
                      <div className="relative aspect-[4/5] overflow-hidden bg-cream-100">
                        {cover ? (
                          <Image
                            src={cover}
                            alt={sub.title}
                            fill
                            sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
                            className="object-cover transition duration-1000 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-8 text-center text-sm uppercase tracking-[0.22em] text-slate-400">
                            Cover pending
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/5 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <span className="text-[10px] uppercase tracking-[0.25em] text-white/70">
                            {sub.category?.name ?? 'Sub Album'}
                          </span>
                          <h3 className="mt-3 text-3xl font-display font-light text-white">{sub.title}</h3>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 px-6 py-5">
                        <div className="text-sm text-slate-500">
                          <span>{sub.photo_count ?? 0} photos</span>
                          <span className="mx-2 text-slate-300">/</span>
                          <span>{sub.video_count ?? 0} videos</span>
                        </div>
                        {sub.featured && (
                          <span className="rounded-full bg-gold-50 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gold-700">
                            Featured
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.article>
                )
              })}
            </div>
          ) : (
            <div className="mt-16 columns-1 gap-6 space-y-6 md:columns-2 xl:columns-3">
              {items.map((entry, index) => (
                <motion.button
                  key={`${entry.type}-${entry.item.id}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.85, delay: (index % 6) * 0.05, ease }}
                  className="group relative mb-6 block w-full break-inside-avoid overflow-hidden rounded-[28px] border border-white/80 bg-white/80 text-left shadow-[0_28px_90px_-58px_rgba(15,23,42,0.45)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden" onContextMenu={(event) => event.preventDefault()}>
                    {entry.type === 'photo' ? (
                      <Image
                        src={entry.item.public_url}
                        alt={entry.item.alt_text}
                        fill
                        sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
                        className="select-none object-cover transition duration-1000 group-hover:scale-105"
                        draggable={false}
                      />
                    ) : (
                      <>
                        <video src={entry.item.public_url} className="h-full w-full object-cover transition duration-1000 group-hover:scale-105" muted playsInline preload="metadata" controls={false} />
                        <span className="absolute inset-0 flex items-center justify-center bg-slate-950/20 text-white">
                          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur">
                            <Play className="h-5 w-5 fill-current" />
                          </span>
                        </span>
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {!items.length && (!album.sub_albums || album.sub_albums.length === 0) && (
            <div className="mt-16 rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-500">
              This published album does not have public media yet.
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {activeItem && (
          <motion.div
            key="album-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4 py-6 backdrop-blur-sm"
            onClick={close}
            onTouchStart={(event) => setTouchStart(event.targetTouches[0]?.clientX ?? null)}
            onTouchMove={(event) => setTouchEnd(event.targetTouches[0]?.clientX ?? null)}
            onTouchEnd={handleTouchEnd}
            role="dialog"
            aria-modal="true"
          >
            <button type="button" onClick={(event) => { event.stopPropagation(); close() }} className="absolute right-5 top-5 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <button type="button" onClick={(event) => { event.stopPropagation(); previous() }} className="absolute left-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:left-8" aria-label="Previous">
              <ChevronLeft className="h-5 w-5" />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.45, ease }}
              onClick={(event) => event.stopPropagation()}
              onContextMenu={(event) => event.preventDefault()}
              className="relative h-[84dvh] w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/15 bg-slate-950 shadow-[0_40px_120px_rgba(0,0,0,0.45)]"
            >
              {activeItem.type === 'photo' ? (
                <Image
                  src={activeItem.item.public_url}
                  alt={activeItem.item.alt_text}
                  fill
                  sizes="94vw"
                  className="select-none object-contain"
                  draggable={false}
                  priority
                />
              ) : (
                <video src={activeItem.item.public_url} className="h-full w-full bg-slate-950 object-contain" controls controlsList="nodownload noplaybackrate" autoPlay playsInline />
              )}
            </motion.div>

            <button type="button" onClick={(event) => { event.stopPropagation(); next() }} className="absolute right-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:right-8" aria-label="Next">
              <ChevronRight className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

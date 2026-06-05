"use client";

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Filter, Search } from 'lucide-react'
import type { GalleryAlbum, GalleryAlbumListResponse, GalleryCategory, GallerySort } from '@/types/gallery'

const ease = [0.16, 1, 0.3, 1] as const

const sortOptions: Array<[GallerySort, string]> = [
  ['newest', 'Newest first'],
  ['oldest', 'Oldest first'],
  ['title-asc', 'Title A-Z'],
  ['title-desc', 'Title Z-A'],
]

const Gallery = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [categories, setCategories] = useState<GalleryCategory[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [subcategory, setSubcategory] = useState('all')
  const [sort, setSort] = useState<GallerySort>('newest')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [nextPage, setNextPage] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeSubcategories = useMemo(() => {
    if (category === 'all') return categories.flatMap((item) => item.subcategories ?? [])
    return categories.find((item) => item.slug === category)?.subcategories ?? []
  }, [categories, category])

  const loadAlbums = async (targetPage = 1, append = false) => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      page: String(targetPage),
      limit: '9',
      sort,
      category,
      subcategory,
    })
    if (search.trim()) params.set('search', search.trim())
    if (featuredOnly) params.set('featured', 'true')

    try {
      const response = await fetch(`/api/gallery/albums?${params.toString()}`)
      const body = (await response.json()) as GalleryAlbumListResponse | { message?: string }
      if (!response.ok) throw new Error('message' in body ? body.message : 'Unable to load gallery albums')

      const payload = body as GalleryAlbumListResponse
      setAlbums((current) => (append ? [...current, ...payload.albums] : payload.albums))
      setCategories(payload.categories)
      setNextPage(payload.nextPage)
      setPage(targetPage)
    } catch (err: any) {
      setError(err.message || 'Unable to load gallery albums')
      setAlbums([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadAlbums(1, false)
    }, 250)
    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, subcategory, sort, featuredOnly])

  useEffect(() => {
    setSubcategory('all')
  }, [category])

  return (
    <section id="photography" className="relative overflow-hidden bg-cream-50 px-6 py-28 text-slate-900 md:py-36 lg:py-44">
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-cream-50 to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-14 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease }}
              className="mb-6 block text-xs font-sans uppercase tracking-[0.25em] text-slate-400"
            >
              Gallery
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, delay: 0.08, ease }}
              className="max-w-3xl text-5xl font-display font-light leading-[1.08] tracking-tight text-slate-800 md:text-6xl lg:text-7xl"
            >
              Visual <span className="italic text-slate-500">Stories</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.16, ease }}
            className="max-w-xl text-base font-light leading-8 text-slate-500 lg:justify-self-end md:text-lg"
          >
            Explore published albums across weddings, events, portraits, and travel stories.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease }}
          className="mb-10 rounded-[28px] border border-white/80 bg-white/70 p-4 shadow-[0_24px_80px_-55px_rgba(15,23,42,0.35)] backdrop-blur md:p-5"
        >
          <div className="grid gap-3 lg:grid-cols-[1.3fr_0.9fr_0.9fr_0.85fr_auto]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="search"
                placeholder="Search albums and photos"
                className="h-12 w-full rounded-full border border-slate-200 bg-white px-11 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </label>

            <Select value={category} onChange={setCategory} label="Category" options={[['all', 'All categories'], ...categories.map((item) => [item.slug, item.name] as [string, string])]} />
            <Select value={subcategory} onChange={setSubcategory} label="Subcategory" options={[['all', 'All subcategories'], ...activeSubcategories.map((item) => [item.slug, item.name] as [string, string])]} />
            <Select value={sort} onChange={(value) => setSort(value as GallerySort)} label="Sort" options={sortOptions} />
            <button
              type="button"
              onClick={() => setFeaturedOnly((value) => !value)}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition ${
                featuredOnly ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <Filter className="h-4 w-4" />
              Featured
            </button>
          </div>
        </motion.div>

        {error && (
          <div className="mb-8 rounded-[1.75rem] border border-rose-200 bg-rose-50/70 p-5 text-sm text-rose-600">
            {error}
          </div>
        )}

        <AnimatePresence mode="popLayout">
          <motion.div layout className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {albums.map((album, index) => (
              <AlbumCard key={album.id} album={album} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        {!loading && !albums.length && !error && (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/60 p-10 text-center text-slate-500">
            No published albums match this search.
          </div>
        )}

        <div className="mt-12 flex justify-center">
          {loading ? (
            <span className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm text-slate-500">Loading albums...</span>
          ) : nextPage ? (
            <button
              type="button"
              onClick={() => loadAlbums(nextPage, true)}
              className="rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400"
            >
              Load more
            </button>
          ) : albums.length ? (
            <span className="text-sm uppercase tracking-[0.25em] text-slate-400">End of gallery</span>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function Select({
  value,
  onChange,
  label,
  options,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  options: Array<[string, string]>
}) {
  return (
    <label className="sr-only">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="not-sr-only h-12 w-full rounded-full border border-slate-200 bg-white px-5 text-sm text-slate-700 outline-none transition focus:border-slate-400"
      >
        {options.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}

function AlbumCard({ album, index }: { album: GalleryAlbum; index: number }) {
  const cover = album.cover_url

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.85, delay: index * 0.05, ease }}
      className="group overflow-hidden rounded-[28px] border border-white/80 bg-white/80 shadow-[0_28px_90px_-58px_rgba(15,23,42,0.45)] transition hover:-translate-y-1"
    >
      <Link href={`/gallery/${album.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-cream-100">
          {cover ? (
            <Image
              src={cover}
              alt={album.title}
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
              {album.category?.name ?? 'Gallery'} {album.subcategory?.name ? `/ ${album.subcategory.name}` : ''}
            </span>
            <h3 className="mt-3 text-3xl font-display font-light text-white">{album.title}</h3>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div className="text-sm text-slate-500">
            <span>{album.photo_count ?? 0} photos</span>
            <span className="mx-2 text-slate-300">/</span>
            <span>{album.video_count ?? 0} videos</span>
          </div>
          {album.featured && (
            <span className="rounded-full bg-gold-50 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gold-700">
              Featured
            </span>
          )}
        </div>
      </Link>
    </motion.article>
  )
}

export default Gallery

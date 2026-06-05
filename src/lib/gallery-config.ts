export const GALLERY_BUCKETS = {
  images: 'gallery-images',
  videos: 'gallery-videos',
  covers: 'album-covers',
} as const

export const DEFAULT_GALLERY_CATEGORIES = [
  {
    name: 'Engagement',
    slug: 'engagement',
    description: 'Pre-wedding, proposal, and couple stories with an editorial finish.',
    subcategories: [
      { name: 'Pre Shoot', slug: 'pre-shoot' },
      { name: 'Couples', slug: 'couples' },
      { name: 'Bachelor Shoot', slug: 'bachelor-shoot' },
    ],
  },
  {
    name: 'Weddings',
    slug: 'weddings',
    description: 'Elegant wedding stories, from pre-shoots to the final dance.',
    subcategories: [
      { name: 'Pre Shoot', slug: 'pre-shoot' },
      { name: 'Engagement', slug: 'engagement' },
      { name: 'Wedding Day', slug: 'wedding-day' },
    ],
  },
  {
    name: 'Events',
    slug: 'events',
    description: 'Corporate gatherings, private parties, and cultural festivals.',
    subcategories: [
      { name: 'Corporate', slug: 'corporate' },
      { name: 'Parties', slug: 'parties' },
      { name: 'Festivals', slug: 'festivals' },
    ],
  },
  {
    name: 'Portraits',
    slug: 'portraits',
    description: 'Studio, outdoor, and fashion portrait sessions.',
    subcategories: [
      { name: 'Studio', slug: 'studio' },
      { name: 'Outdoor', slug: 'outdoor' },
      { name: 'Fashion', slug: 'fashion' },
    ],
  },
  {
    name: 'Family & Kids',
    slug: 'family-kids',
    description: 'Warm family sessions, birthdays, and childhood milestones.',
    subcategories: [
      { name: 'Family Shoot', slug: 'family-shoot' },
      { name: 'Birthday Shoot', slug: 'birthday-shoot' },
      { name: 'Kids', slug: 'kids' },
    ],
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Editorial, product, and personal brand fashion stories.',
    subcategories: [
      { name: 'Editorial', slug: 'editorial' },
      { name: 'Product', slug: 'product' },
      { name: 'Outdoor', slug: 'outdoor' },
    ],
  },
  {
    name: 'Yoga',
    slug: 'yoga',
    description: 'Mindful movement, wellness, and retreat visual stories.',
    subcategories: [
      { name: 'Retreats', slug: 'retreats' },
      { name: 'Classes', slug: 'classes' },
      { name: 'Lifestyle', slug: 'lifestyle' },
    ],
  },
  {
    name: 'Life Style',
    slug: 'life-style',
    description: 'Lifestyle, wellness, personal projects, and brand narratives.',
    subcategories: [
      { name: 'Brand Story', slug: 'brand-story' },
      { name: 'Personal', slug: 'personal' },
      { name: 'Editorial', slug: 'editorial' },
    ],
  },
  {
    name: 'Travel',
    slug: 'travel',
    description: 'Travel stories from Sri Lanka, Bali, and international commissions.',
    subcategories: [
      { name: 'Sri Lanka', slug: 'sri-lanka' },
      { name: 'Bali', slug: 'bali' },
      { name: 'International', slug: 'international' },
    ],
  },
] as const

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const getStoragePath = (folder: string, fileName: string) => {
  const extension = fileName.includes('.') ? fileName.split('.').pop() : ''
  const baseName = slugify(fileName.replace(/\.[^/.]+$/, '')) || 'asset'
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `${folder}/${baseName}-${suffix}${extension ? `.${extension}` : ''}`
}

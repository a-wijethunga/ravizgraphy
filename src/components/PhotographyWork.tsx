"use client";

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const categories = ['All', 'Hospitality', 'Fashion', 'Yoga']

const photos = [
  { id: 1, category: 'Hospitality', image: 'https://images.unsplash.com/photo-1542314831-c6a4203251e5?q=80&w=1000&auto=format&fit=crop' },
  { id: 2, category: 'Fashion', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop' },
  { id: 3, category: 'Yoga', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop' },
  { id: 4, category: 'Hospitality', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop' },
  { id: 5, category: 'Fashion', image: 'https://images.unsplash.com/photo-1515378960530-7c0da622941f?q=80&w=1000&auto=format&fit=crop' },
  { id: 6, category: 'Yoga', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=1000&auto=format&fit=crop' },
]

const PhotographyWork = () => {
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredPhotos = activeCategory === 'All' 
    ? photos 
    : photos.filter(photo => photo.category === activeCategory)

  return (
    <section className="py-32 bg-sand-50" id="photography">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="mb-16 flex flex-col items-center">
          <span className="text-sm tracking-[0.2em] uppercase text-slate-400 mb-4 block text-center">Stillness</span>
          <h2 className="text-4xl md:text-5xl font-display text-slate-800 text-center mb-12">Photography</h2>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-xs tracking-[0.2em] uppercase transition-all duration-300 relative pb-2 ${
                  activeCategory === category ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {category}
                {activeCategory === category && (
                  <motion.div 
                    layoutId="underline" 
                    className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-800"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-cream-100 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                style={{ perspective: 1000 }}
              >
                <motion.div
                  className="w-full h-full origin-center"
                  whileHover={{ scale: 1.05, rotateX: 2, rotateY: -2 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <img decoding="async" loading="lazy"
                    src={photo.image}
                    alt={photo.category}
                    className="w-full h-full object-cover grayscale-[10%] brightness-[0.98]"
                  />
                  <div className="absolute inset-0 bg-cream-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

export default PhotographyWork

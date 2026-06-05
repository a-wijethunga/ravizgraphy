import { motion } from 'framer-motion'

interface Project {
  id: number
  title: string
  category: string
  image: string
}

const projects: Project[] = [
  {
    id: 1,
    title: 'Morning Light',
    category: 'Editorial',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1500&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'The Slow Retreat',
    category: 'Architecture',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1500&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Silent Conversations',
    category: 'Portrait',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1500&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'Organic Textures',
    category: 'Details',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1500&auto=format&fit=crop',
  },
]

const PortfolioGrid = () => {
  return (
    <section id="portfolio" className="py-32 bg-cream-50">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="mb-24 flex flex-col items-center text-center">
          <span className="text-sm tracking-[0.2em] uppercase text-slate-400 mb-4">Selected Works</span>
          <h2 className="text-4xl md:text-5xl font-display text-slate-800">Visual Journal</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-y-32">
          {projects.map((project, index) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: index % 2 === 0 ? 0 : 0.2 }}
              className={`group relative flex flex-col ${index % 2 !== 0 ? 'md:mt-24' : ''}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-sand-100 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <motion.img decoding="async" loading="lazy"
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover origin-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              
              <div className="mt-8 flex justify-between items-baseline px-2">
                <h3 className="text-2xl font-display text-slate-800 group-hover:italic transition-all duration-300">
                  {project.title}
                </h3>
                <span className="text-xs font-mono tracking-widest uppercase text-slate-400">
                  {project.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default PortfolioGrid

import { motion } from 'framer-motion'

const photographyItems = [
  {
    title: "Portraits & Lifestyle",
    desc: "solo, couples, maternity, family, documentary"
  },
  {
    title: "Fashion & Editorial",
    desc: "model portfolios, lookbooks, designer showcases"
  },
  {
    title: "Weddings & Elopements",
    desc: "intimate coverage focused on emotion and story"
  },
  {
    title: "Brand & Commercial",
    desc: "personal branding, product lifestyle, small business content"
  }
]

const videographyItems = [
  {
    title: "Cinematic highlight films",
    desc: "short-form edits with storytelling focus"
  },
  {
    title: "Social media reels",
    desc: "vertical edits optimized for Instagram, TikTok, YouTube"
  },
  {
    title: "Brand storytelling",
    desc: "authentic visual campaigns for businesses and creatives"
  },
  {
    title: "Event coverage",
    desc: "soft, ambient storytelling from live events"
  }
]

const WhatIOffer: React.FC = () => {
  return (
    <section id="offerings" className="py-32 md:py-40 bg-cream-50 border-t border-slate-200/35 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Main Heading */}
        <div className="mb-24 flex flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs font-sans tracking-[0.25em] uppercase text-slate-400 mb-4 block"
          >
            Capabilities
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-display font-light leading-tight text-slate-800 tracking-wide uppercase"
          >
            What I Offer
          </motion.h2>
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-x-24">
          
          {/* Photography Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <h3 className="text-xl md:text-2xl font-display tracking-[0.2em] text-slate-800 uppercase mb-12 pb-3 border-b border-slate-200/60 w-full text-center">
              Photography
            </h3>
            
            <div className="space-y-10 w-full max-w-lg">
              {photographyItems.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex flex-col items-center text-center cursor-default"
                >
                  <div className="flex items-center gap-3 justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-500 transition-colors duration-500" />
                    <h4 className="text-lg md:text-xl font-display text-slate-800 group-hover:italic transition-all duration-300">
                      {item.title}
                    </h4>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-500 transition-colors duration-500" />
                  </div>
                  <p className="text-slate-500 font-light text-sm md:text-base mt-2 max-w-sm leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Videography Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center mt-16 md:mt-0"
          >
            <h3 className="text-xl md:text-2xl font-display tracking-[0.2em] text-slate-800 uppercase mb-12 pb-3 border-b border-slate-200/60 w-full text-center">
              Videography
            </h3>
            
            <div className="space-y-10 w-full max-w-lg">
              {videographyItems.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex flex-col items-center text-center cursor-default"
                >
                  <div className="flex items-center gap-3 justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-500 transition-colors duration-500" />
                    <h4 className="text-lg md:text-xl font-display text-slate-800 group-hover:italic transition-all duration-300">
                      {item.title}
                    </h4>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-500 transition-colors duration-500" />
                  </div>
                  <p className="text-slate-500 font-light text-sm md:text-base mt-2 max-w-sm leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default WhatIOffer

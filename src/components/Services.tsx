import { motion } from 'framer-motion'
import { Camera, Video, Image as ImageIcon } from 'lucide-react'

const services = [
  {
    icon: <Camera className="w-6 h-6 stroke-[1.5]" />,
    title: "Photography",
    description: "Soft, natural, and highly curated portraiture focusing on raw emotion and effortless elegance."
  },
  {
    icon: <Video className="w-6 h-6 stroke-[1.5]" />,
    title: "Videography",
    description: "Cinematic visual narratives designed to elevate your brand's aesthetic and connect deeply."
  },
  {
    icon: <ImageIcon className="w-6 h-6 stroke-[1.5]" />,
    title: "Creative Direction",
    description: "Guiding the visual tone, set design, and overall mood to craft a cohesive storytelling experience."
  }
]

const Services = () => {
  return (
    <section id="services" className="py-32 bg-cream-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 text-center">
          <span className="text-sm tracking-[0.2em] uppercase text-slate-400 mb-4 block">Offerings</span>
          <h2 className="text-4xl md:text-5xl font-display text-slate-800">Curated Services</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="group cursor-pointer relative bg-white p-12 rounded-xl border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-500"
            >
              {/* Soft Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-sand-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-sand-100 text-slate-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-display text-slate-800 mb-4 group-hover:italic transition-all duration-300">{service.title}</h3>
                <p className="text-slate-500 font-light leading-relaxed text-sm">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services

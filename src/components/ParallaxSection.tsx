"use client";

import { useRef, useEffect } from 'react'
import { motion, useTransform, useViewportScroll } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ParallaxSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useViewportScroll()

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    gsap.registerPlugin(ScrollTrigger)

    // Parallax animation
    gsap.fromTo(
      section.querySelector('.parallax-bg'),
      { y: 0 },
      {
        y: -100,
        scrollTrigger: {
          trigger: section,
          start: 'top center',
          end: 'center center',
          scrub: 1,
          markers: false,
        },
      }
    )

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  const services = [
    {
      icon: '🎬',
      title: 'Videography',
      description: 'Cinematic storytelling with state-of-the-art equipment and professional editing.',
    },
    {
      icon: '📸',
      title: 'Photography',
      description: 'Timeless images captured with artistic vision and technical excellence.',
    },
    {
      icon: '✨',
      title: 'Post Production',
      description: 'Color grading, VFX, and animation to bring your vision to life.',
    },
    {
      icon: '🎞️',
      title: 'Motion Graphics',
      description: 'Dynamic animations and visual effects that captivate and engage.',
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-32 px-6 bg-dark-950 overflow-hidden"
    >
      {/* Parallax Background */}
      <motion.div
        className="parallax-bg absolute inset-0 -z-10"
        style={{
          y: useTransform(scrollY, [0, 1000], [0, -200]),
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-dark-950 to-dark-900/40" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(148, 163, 184, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)`,
          }}
        />
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
            Services
          </span>
          <h2 className="text-5xl md:text-6xl font-bold heading-display text-gradient mt-4 mb-6">
            What We Offer
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl">
            Complete creative solutions from concept to delivery. We handle every aspect of your project with precision and artistry.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(148, 163, 184, 0.1)' }}
              className="glass rounded-xl p-8 group cursor-pointer"
            >
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold heading-display text-white mb-3">
                {service.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-12 mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '500+', label: 'Projects Completed' },
              { number: '50+', label: 'Happy Clients' },
              { number: '10+', label: 'Years Experience' },
              { number: '15', label: 'Awards Won' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {stat.number}
                </div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Process Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
              Our Process
            </span>
            <h3 className="text-4xl md:text-5xl font-bold heading-display text-gradient mt-4">
              From Concept to Creation
            </h3>
          </motion.div>

          <div className="space-y-6">
            {[
              { step: '01', title: 'Concept & Strategy', description: 'We understand your vision and develop a comprehensive creative strategy.' },
              { step: '02', title: 'Production Planning', description: 'Detailed planning, storyboarding, and pre-production setup.' },
              { step: '03', title: 'Execution', description: 'Professional shoot with top-tier equipment and experienced crew.' },
              { step: '04', title: 'Post Production', description: 'Editing, color grading, VFX, and final touches to perfection.' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-8 flex items-start gap-6 group hover:border-slate-400/40 transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="text-3xl font-bold text-gradient group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-slate-400">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-slate-400 mb-6 text-lg">
            Ready to start your next project?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="button-cinematic text-lg"
          >
            Get in Touch
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default ParallaxSection

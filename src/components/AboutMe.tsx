"use client";

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const AboutMe: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7], [0, 1, 1])
  const y = useTransform(scrollYProgress, [0, 0.3], [40, 0])

  return (
    <section
      ref={containerRef}
      id="about-me"
      className="relative w-full py-32 md:py-40 lg:py-48 px-6 bg-cream-50 overflow-hidden"
    >
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
        
        {/* Label */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs font-sans tracking-[0.2em] uppercase text-slate-400 mb-12 block"
        >
          My Story
        </motion.span>

        {/* Main Heading */}
        <motion.div
          style={{ opacity, y }}
          className="mb-12 md:mb-16"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-display font-light leading-[1.1] text-slate-800 tracking-tight">
            About Me
          </h2>
        </motion.div>

        {/* Paragraph Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl lg:text-2xl font-light text-slate-600 leading-relaxed max-w-2xl"
        >
          <p className="mb-6 md:mb-8">
            Hi, I'm Raviz — a passionate photographer and
videographer based in Sri Lanka, dedicated to telling
stories through soulful imagery and cinematic visuals.
          </p>
          
          <p className="mb-6 md:mb-8">
            I aim
to capture genuine emotion, honest moments, and timeless
beauty — whether it's a subtle glance, a bold expression, or
an unfolding narrative.
          </p>
          
          <p>
            I'm currently working across Sri
Lanka, from coast to hill country, and I’m also available for
international projects based on the nature of the
collaboration.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutMe

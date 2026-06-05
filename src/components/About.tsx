"use client";

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import q1 from '../assets/1.jpg'; 

const About = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const yImage = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])

  const textLines = [
    "I believe in slow storytelling.",
    "Instead of rushing for the perfect shot,",
    "I wait for the genuine emotion to unfold",
    "naturally in front of the lens.",
    "",
    "Whether it's a soft portrait, a serene",
    "cafe corner, or the gentle touch of",
    "morning light, my focus is on crafting",
    "images that feel like a memory—warm,",
    "nostalgic, and deeply personal."
  ]

  return (
    <section ref={containerRef} id="about" className="relative py-32 bg-cream-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16 md:gap-24">
        
        {/* Left: Text */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm tracking-[0.2em] uppercase text-slate-400 mb-8 block"
          >
            Approach
          </motion.span>
          
          <div className="text-lg md:text-xl lg:text-2xl font-light text-slate-600 leading-relaxed">
            {textLines.map((line, index) => (
              <div key={index} className="overflow-hidden">
                <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  {line === "" ? <br /> : line}
                </motion.div>
              </div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16"
          >
            <img decoding="async" loading="lazy" src="/signature.png" alt="" className="h-12 opacity-30 mix-blend-multiply" />
            <span className="block mt-4 text-xs tracking-widest text-slate-400 uppercase">Director & Photographer</span>
          </motion.div>
        </div>

        {/* Right: Image */}
        <div className="w-full md:w-1/2 relative h-[70vh] min-h-[500px] overflow-hidden rounded-3xl bg-sand-100 shadow-xl transition-all duration-500">
          <motion.div style={{ y: yImage }} className="absolute inset-[-15%] w-[130%] h-[130%]">
            <img decoding="async" loading="lazy" 
              src={q1.src} 
              alt="Artistic portrait" 
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

      </div>
    </section>
  )
}

export default About

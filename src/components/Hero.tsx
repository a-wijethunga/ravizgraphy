"use client";

import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import heroPoster from '../assets/hero.png'

const heroVideo = '/videos/hero.mp4'

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const scaleBg = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // Force native DOM properties to guarantee browser autoplay
      video.muted = true
      video.defaultMuted = true
      
      // Force explicit loading to handle React-managed mount lifecycle
      video.load()
      
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Autoplay prevented, adding interaction fallback listeners:", error)
          
          // User interaction fallback
          const playOnInteraction = () => {
            video.play()
              .then(() => {
                document.removeEventListener('click', playOnInteraction)
                document.removeEventListener('touchstart', playOnInteraction)
              })
              .catch(err => console.error("Delayed play failed:", err))
          }
          document.addEventListener('click', playOnInteraction)
          document.addEventListener('touchstart', playOnInteraction)
        })
      }
    }
  }, [])

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative w-full h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-cream-50"
    >
      <motion.div 
        className="absolute inset-0 w-full h-full origin-top overflow-hidden"
        style={{ y: yBg, scale: scaleBg, opacity }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src={heroVideo}
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          poster={heroPoster.src}
        >
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream-50"></div>
      </motion.div>

      <motion.div 
        style={{ y: yText }}
        className="relative z-10 w-full px-6 flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <span className="inline-block text-xs font-sans tracking-[0.25em] uppercase text-slate-500 mb-8">
            Photography & Videography
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-display font-light leading-[1.1] text-slate-800 max-w-5xl mx-auto tracking-tight">
            Cinematic <br className="hidden md:block" />
            <span className="italic text-slate-600">storytelling.</span>
          </h1>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-slate-400"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <div className="w-[1px] h-12 bg-slate-300 overflow-hidden relative">
          <motion.div 
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-full bg-slate-600"
          />
        </div>
      </motion.div>
    </section>
  )
}

export default Hero


"use client";

import { useRef } from 'react'
import './App.css'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import FeaturedWork from './components/FeaturedWork'
import SocialReels from './components/SocialReels'
import YoutubeShorts from './components/YoutubeShorts'
import VideographyWork from './components/VideographyWork'
// import PhotographyWork from './components/PhotographyWork'
import About from './components/About'
import AboutMe from './components/AboutMe'
import WhatIOffer from './components/WhatIOffer'
import LiveReviews from './components/LiveReviews'
import Contact from './components/Contact'
import Gallery from './components/Gallery'
import Footer from './components/Footer'

function App() {
  const appRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={appRef} className="min-h-[100dvh] bg-cream-50 text-slate-900 overflow-hidden relative">
      <Navigation />
      <Hero />
      <FeaturedWork />
      <Gallery />
      <SocialReels />
      <YoutubeShorts />
      <VideographyWork />
      <About />
      <AboutMe />
      <WhatIOffer />
      <LiveReviews />
      <Contact />
      <Footer />
    </div>
  )
}

export default App

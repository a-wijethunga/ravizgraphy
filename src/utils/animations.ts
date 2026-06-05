import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Scroll-triggered reveal animation
export const scrollReveal = (element: HTMLElement | null, options = {}) => {
  if (!element) return

  const defaults = {
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1,
    ...options
  }

  gsap.from(element.children, {
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      end: 'top 20%',
      scrub: 0.5
    },
    opacity: 0,
    y: 50,
    duration: defaults.duration,
    ease: defaults.ease,
    stagger: defaults.stagger
  })
}

// Parallax effect on scroll
export const parallaxEffect = (element: HTMLElement | null, speed = -0.5) => {
  if (!element) return

  gsap.to(element, {
    scrollTrigger: {
      trigger: element,
      scrub: 1,
      markers: false
    },
    y: window.innerHeight * speed,
    ease: 'none'
  })
}

// Image zoom on scroll
export const zoomOnScroll = (element: HTMLElement | null, speed = 0.5) => {
  if (!element) return

  gsap.to(element, {
    scrollTrigger: {
      trigger: element,
      scrub: 1
    },
    scale: 1 + speed,
    ease: 'none'
  })
}

// Staggered fade-in on scroll
export const staggeredFadeIn = (container: HTMLElement | null, options = {}) => {
  if (!container) return

  const defaults = {
    duration: 0.6,
    stagger: 0.15,
    ease: 'power2.out',
    ...options
  }

  gsap.from(container.children, {
    scrollTrigger: {
      trigger: container,
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 30,
    duration: defaults.duration,
    stagger: defaults.stagger,
    ease: defaults.ease
  })
}

// Text animation on scroll
export const textRevealOnScroll = (element: HTMLElement | null) => {
  if (!element) return

  const text = element.textContent || ''
  const chars = text.split('')

  element.innerHTML = chars
    .map((char) => `<span class="char opacity-0">${char === ' ' ? '&nbsp;' : char}</span>`)
    .join('')

  gsap.from(element.querySelectorAll('.char'), {
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    duration: 0.4,
    stagger: 0.03,
    ease: 'power2.out'
  })
}

// Horizontal scroll snap
export const horizontalScroll = (container: HTMLElement | null) => {
  if (!container) return

  const proxy = { skew: 0, skewSetter(value: number) { this.skew = value }, getSkew() { return this.skew } },
    skewSetter = gsap.quickSetter(proxy, 'skew', 'deg'),
    clamp = gsap.utils.clamp(-20, 20)

  gsap.set(container, { transformOrigin: '0% 50%', force3D: true })

  ScrollTrigger.create({
    onUpdate: (self) => {
      const skew = clamp(self.getVelocity() / 300)
      if (Math.abs(skew) > Math.abs(proxy.skew)) {
        proxy.skew = skew
        skewSetter(skew)
      }
    }
  })

  gsap.to(proxy, {
    skew: 0,
    duration: 0.8,
    ease: 'power3',
    overwrite: 'auto',
    onUpdate: () => skewSetter(proxy.skew)
  })
}

// Mouse follow effect
export const mouseFollowEffect = (element: HTMLElement | null, speed = 0.1) => {
  if (!element) return

  let mouseX = 0
  let mouseY = 0

  const handleMouseMove = (e: MouseEvent) => {
    mouseX = e.clientX
    mouseY = e.clientY

    const rect = element.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const distX = (mouseX - (rect.left + centerX)) * speed
    const distY = (mouseY - (rect.top + centerY)) * speed

    gsap.to(element, {
      x: distX,
      y: distY,
      duration: 0.5,
      overwrite: 'auto'
    })
  }

  window.addEventListener('mousemove', handleMouseMove)

  return () => {
    window.removeEventListener('mousemove', handleMouseMove)
  }
}

// Blur reveal on scroll
export const blurReveal = (element: HTMLElement | null) => {
  if (!element) return

  gsap.from(element, {
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    duration: 1,
    ease: 'power2.out'
  })
}

// Animate on hover
export const animateOnHover = (element: HTMLElement | null) => {
  if (!element) return

  element.addEventListener('mouseenter', () => {
    gsap.to(element, {
      duration: 0.3,
      scale: 1.02,
      ease: 'power2.out',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
    })
  })

  element.addEventListener('mouseleave', () => {
    gsap.to(element, {
      duration: 0.3,
      scale: 1,
      ease: 'power2.out',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    })
  })
}

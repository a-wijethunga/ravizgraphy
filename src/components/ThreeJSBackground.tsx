"use client";

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const ThreeJSBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene Setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 30
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create floating particles/lights
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 50

    const posArray = new Float32Array(particlesCount * 3)
    const velocityArray = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 100
      posArray[i + 1] = (Math.random() - 0.5) * 100
      posArray[i + 2] = (Math.random() - 0.5) * 100

      velocityArray[i] = (Math.random() - 0.5) * 0.1
      velocityArray[i + 1] = (Math.random() - 0.5) * 0.1
      velocityArray[i + 2] = (Math.random() - 0.5) * 0.1
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.7,
      color: '#94a3b8',
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.3
    })

    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    // Create floating lines for depth
    const linesGeometry = new THREE.BufferGeometry()
    const linePositions = new Float32Array(60) // 20 lines * 3 coordinates
    for (let i = 0; i < 60; i++) {
      linePositions[i] = (Math.random() - 0.5) * 200
    }
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))

    const linesMaterial = new THREE.LineBasicMaterial({
      color: '#cbd5e1',
      linewidth: 0.5,
      transparent: true,
      opacity: 0.1
    })

    const lines = new THREE.LineSegments(linesGeometry, linesMaterial)
    scene.add(lines)

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    // Handle mouse movement
    let mouseX = 0
    let mouseY = 0

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    let animationId: number

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      // Rotate particles
      particles.rotation.x += 0.0001
      particles.rotation.y += 0.0002
      particles.rotation.z += 0.00015

      // Slight rotation toward mouse
      particles.rotation.x += mouseY * 0.00001
      particles.rotation.y += mouseX * 0.00001

      // Update particles positions for floating effect
      const positionAttr = particlesGeometry.attributes.position
      if (positionAttr) {
        const positions = positionAttr.array as Float32Array
        for (let i = 0; i < positions.length; i += 3) {
          const px = positions[i]!
          const py = positions[i + 1]!
          const pz = positions[i + 2]!

          const vx = velocityArray[i]!
          const vy = velocityArray[i + 1]!
          const vz = velocityArray[i + 2]!

          positions[i] = px + vx * 0.5
          positions[i + 1] = py + vy * 0.5
          positions[i + 2] = pz + vz * 0.5

          // Wrap around
          if (Math.abs(positions[i]!) > 50) velocityArray[i] = vx * -1
          if (Math.abs(positions[i + 1]!) > 50) velocityArray[i + 1] = vy * -1
          if (Math.abs(positions[i + 2]!) > 50) velocityArray[i + 2] = vz * -1
        }
        positionAttr.needsUpdate = true
      }

      // Rotate lines
      lines.rotation.x += 0.00005
      lines.rotation.y += 0.0001

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationId)
      renderer.dispose()
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${className}`}
      style={{
        background: 'radial-gradient(ellipse at center, rgba(15,23,42,0.5) 0%, rgba(15,23,42,0.8) 100%)'
      }}
    />
  )
}

export default ThreeJSBackground

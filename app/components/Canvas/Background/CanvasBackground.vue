<script setup lang="ts">
interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  pulseTimer: number
  pulseInterval: number
  trail: Array<{ x: number, y: number, opacity: number }>
  z: number // Głębia dla efektu 3D/parallax
  glowIntensity: number
}

interface Wave {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
  speed: number
  z: number // Głębia
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  z: number
}

interface ClickWave {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
  speed: number
  life: number
  maxLife: number
}

interface Props {
  container?: Ref<HTMLElement | null> | HTMLElement | null
}

const props = withDefaults(defineProps<Props>(), {
  container: null
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const mouse = ref({ x: 0, y: 0 })
const nodes = ref<Node[]>([])
const waves = ref<Wave[]>([])
const particles = ref<Particle[]>([])
const clickWaves = ref<ClickWave[]>([])
const animationFrame = ref<number | null>(null)
const randomColor = ref({ r: 0, g: 0, b: 0 })
const targetColor = ref({ r: 0, g: 0, b: 0 })
const colorTransitionSpeed = 0.02

const nodeCount = 75
const connectionDistance = 150
const nodeSpeed = 0.5
const mouseInfluenceRadius = 200
const mouseInfluenceStrength = 0.02
const waveMaxRadius = 80
const waveSpeed = 2
const minPulseInterval = 60000
const maxPulseInterval = 120000
const trailLength = 8
const particleEmissionRate = 0.1 // Prawdopodobieństwo emisji cząsteczki
const clickWaveMaxRadius = 150
const clickWaveSpeed = 3
const clickWaveDuration = 1000

const hslToRgb = (h: number, s: number, l: number) => {
  const c = ((1 - Math.abs((2 * l) / 100 - 1)) * s) / 100
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l / 100 - c / 2

  let r = 0
  let g = 0
  let b = 0

  if (h < 60) {
    r = c
    g = x
    b = 0
  } else if (h < 120) {
    r = x
    g = c
    b = 0
  } else if (h < 180) {
    r = 0
    g = c
    b = x
  } else if (h < 240) {
    r = 0
    g = x
    b = c
  } else if (h < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  }
}

const initNodes = () => {
  if (!canvasRef.value) return

  const width = canvasRef.value.width
  const height = canvasRef.value.height

  // Generate new random colors on each initialization
  // Adjusted for better visibility on dark backgrounds
  const generateColor = () => {
    const hue = Math.random() * 360
    const saturation = 60 + Math.random() * 40
    const lightness = 60 + Math.random() * 25 // Brighter for dark backgrounds
    return hslToRgb(hue, saturation, lightness)
  }

  randomColor.value = generateColor()
  targetColor.value = generateColor()

  nodes.value = Array.from({ length: nodeCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * nodeSpeed,
    vy: (Math.random() - 0.5) * nodeSpeed,
    radius: 3 + Math.random() * 3,
    pulseTimer: Math.random() * maxPulseInterval,
    pulseInterval: minPulseInterval + Math.random() * (maxPulseInterval - minPulseInterval),
    trail: [],
    z: Math.random(), // 0-1 dla głębi
    glowIntensity: 0
  }))
}

const updateNodes = () => {
  if (!canvasRef.value) return

  const width = canvasRef.value.width
  const height = canvasRef.value.height

  nodes.value.forEach((node) => {
    // Update position
    node.x += node.vx
    node.y += node.vy

    // Bounce off edges
    if (node.x < 0 || node.x > width) {
      node.vx *= -1
      node.x = Math.max(0, Math.min(width, node.x))
    }
    if (node.y < 0 || node.y > height) {
      node.vy *= -1
      node.y = Math.max(0, Math.min(height, node.y))
    }

    // Mouse interaction
    const dx = mouse.value.x - node.x
    const dy = mouse.value.y - node.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < mouseInfluenceRadius) {
      const force = (1 - distance / mouseInfluenceRadius) * mouseInfluenceStrength
      node.vx += (dx / distance) * force
      node.vy += (dy / distance) * force

      // Hover effect - zwiększ glow i rozbłysk
      node.glowIntensity = Math.min(1, (1 - distance / mouseInfluenceRadius) * 2)
    } else {
      node.glowIntensity *= 0.95 // Fade out glow
    }

    // Wave interaction - fale odpychają punkty
    waves.value.forEach((wave) => {
      const waveDx = node.x - wave.x
      const waveDy = node.y - wave.y
      const waveDistance = Math.sqrt(waveDx * waveDx + waveDy * waveDy)

      // Jeśli punkt jest w zasięgu fali
      if (waveDistance < wave.radius && waveDistance > 0) {
        // Siła zależy od odległości od środka fali i rozmiaru fali
        const waveForce = (1 - waveDistance / wave.radius) * 0.03
        const normalizedDx = waveDx / waveDistance
        const normalizedDy = waveDy / waveDistance

        // Odpychanie od środka fali
        node.vx += normalizedDx * waveForce
        node.vy += normalizedDy * waveForce

        // Zwiększ glow gdy punkt jest w zasięgu fali
        const glowBoost = (1 - waveDistance / wave.radius) * 0.5
        node.glowIntensity = Math.min(1, node.glowIntensity + glowBoost)
      }
    })

    // Click wave interaction - silniejsze oddziaływanie
    clickWaves.value.forEach((wave) => {
      const waveDx = node.x - wave.x
      const waveDy = node.y - wave.y
      const waveDistance = Math.sqrt(waveDx * waveDx + waveDy * waveDy)

      if (waveDistance < wave.radius && waveDistance > 0) {
        // Silniejsza siła dla click waves
        const waveForce = (1 - waveDistance / wave.radius) * 0.05
        const normalizedDx = waveDx / waveDistance
        const normalizedDy = waveDy / waveDistance

        node.vx += normalizedDx * waveForce
        node.vy += normalizedDy * waveForce

        // Silniejszy glow boost
        const glowBoost = (1 - waveDistance / wave.radius) * 0.8
        node.glowIntensity = Math.min(1, node.glowIntensity + glowBoost)
      }
    })

    // Damping
    node.vx *= 0.99
    node.vy *= 0.99

    // Update trail
    node.trail.push({ x: node.x, y: node.y, opacity: 1 })
    if (node.trail.length > trailLength) {
      node.trail.shift()
    }
    // Fade trail
    node.trail.forEach((point, index) => {
      point.opacity = ((index + 1) / node.trail.length) * 0.6
    })

    // Emit particles randomly
    if (Math.random() < particleEmissionRate) {
      particles.value.push({
        x: node.x,
        y: node.y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 0,
        maxLife: 500 + Math.random() * 500,
        size: 1 + Math.random() * 2,
        z: node.z
      })
    }

    // Update pulse timer and create waves
    node.pulseTimer += 16 // ~60fps = 16ms per frame
    if (node.pulseTimer >= node.pulseInterval) {
      // Create new wave
      waves.value.push({
        x: node.x,
        y: node.y,
        radius: node.radius,
        maxRadius: waveMaxRadius * (0.8 + node.z * 0.4), // Różne rozmiary w zależności od głębi
        opacity: 0.6,
        speed: waveSpeed * (0.8 + node.z * 0.4),
        z: node.z
      })
      // Reset timer with new random interval
      node.pulseTimer = 0
      node.pulseInterval
        = minPulseInterval + Math.random() * (maxPulseInterval - minPulseInterval)
    }
  })

  // Update particles
  particles.value = particles.value.filter((particle) => {
    particle.x += particle.vx
    particle.y += particle.vy
    particle.life += 16
    particle.vx *= 0.98
    particle.vy *= 0.98
    return particle.life < particle.maxLife
  })

  // Update click waves
  clickWaves.value = clickWaves.value.filter((wave) => {
    wave.radius += wave.speed
    wave.life += 16
    wave.opacity = 0.8 * (1 - wave.life / wave.maxLife)
    return wave.life < wave.maxLife && wave.radius < wave.maxRadius
  })

  // Color transition
  randomColor.value.r += (targetColor.value.r - randomColor.value.r) * colorTransitionSpeed
  randomColor.value.g += (targetColor.value.g - randomColor.value.g) * colorTransitionSpeed
  randomColor.value.b += (targetColor.value.b - randomColor.value.b) * colorTransitionSpeed

  // Change target color occasionally
  if (Math.random() < 0.001) {
    const hue = Math.random() * 360
    const saturation = 60 + Math.random() * 40
    const lightness = 60 + Math.random() * 25 // Brighter for dark backgrounds
    targetColor.value = hslToRgb(hue, saturation, lightness)
  }

  // Update waves
  waves.value = waves.value.filter((wave) => {
    wave.radius += wave.speed
    wave.opacity = 0.6 * (1 - wave.radius / wave.maxRadius)
    return wave.radius < wave.maxRadius && wave.opacity > 0.01
  })
}

const draw = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d', { alpha: true })

  if (!ctx) return

  // Enable sharp rendering
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Use current color (smoothly transitioning)
  const { r, g, b } = {
    r: Math.round(randomColor.value.r),
    g: Math.round(randomColor.value.g),
    b: Math.round(randomColor.value.b)
  }

  // Draw connections with depth effect
  ctx.lineWidth = 1.5

  for (let i = 0; i < nodes.value.length; i++) {
    for (let j = i + 1; j < nodes.value.length; j++) {
      const node1 = nodes.value[i]
      const node2 = nodes.value[j]

      if (!node1 || !node2) continue

      const dx = node2.x - node1.x
      const dy = node2.y - node1.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < connectionDistance) {
        const avgZ = (node1.z + node2.z) / 2
        const depthFactor = 0.5 + avgZ * 0.5 // 0.5-1.0
        const opacity = (1 - distance / connectionDistance) * 0.6 * depthFactor // Increased for better visibility
        const lineWidth = 1.5 * depthFactor

        ctx.lineWidth = lineWidth
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
        ctx.beginPath()
        ctx.moveTo(node1.x, node1.y)
        ctx.lineTo(node2.x, node2.y)
        ctx.stroke()
      }
    }
  }

  // Draw particles
  particles.value.forEach((particle) => {
    const progress = particle.life / particle.maxLife
    const opacity = (1 - progress) * 0.8
    const size = particle.size * (1 - progress * 0.5)
    const depthFactor = 0.5 + particle.z * 0.5

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity * depthFactor})`
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
    ctx.fill()
  })

  // Draw waves with depth
  waves.value.forEach((wave) => {
    const depthFactor = 0.5 + wave.z * 0.5
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${wave.opacity * depthFactor})`
    ctx.lineWidth = 2 * depthFactor
    ctx.beginPath()
    ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2)
    ctx.stroke()
  })

  // Draw click waves
  clickWaves.value.forEach((wave) => {
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${wave.opacity})`
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2)
    ctx.stroke()

    // Inner glow
    const gradient = ctx.createRadialGradient(wave.x, wave.y, 0, wave.x, wave.y, wave.radius)
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${wave.opacity * 0.5})`)
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2)
    ctx.fill()
  })

  // Draw trails
  nodes.value.forEach((node) => {
    if (node.trail.length > 1) {
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`
      ctx.lineWidth = 1
      ctx.beginPath()
      node.trail.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      ctx.stroke()
    }
  })

  // Draw nodes with glow and depth
  nodes.value.forEach((node) => {
    const depthFactor = 0.5 + node.z * 0.5
    const glowRadius = node.radius * (2 + node.glowIntensity * 3)

    // Glow effect
    if (node.glowIntensity > 0.1) {
      const glowGradient = ctx.createRadialGradient(
        node.x,
        node.y,
        node.radius,
        node.x,
        node.y,
        glowRadius
      )
      glowGradient.addColorStop(
        0,
        `rgba(${r}, ${g}, ${b}, ${node.glowIntensity * 0.4 * depthFactor})`
      )
      glowGradient.addColorStop(
        0.5,
        `rgba(${r}, ${g}, ${b}, ${node.glowIntensity * 0.2 * depthFactor})`
      )
      glowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2)
      ctx.fill()
    }

    // Główny punkt
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.9 * depthFactor})`
    ctx.beginPath()
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
    ctx.fill()

    // Dodatkowa warstwa dla większej ostrości
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${1 * depthFactor})`
    ctx.beginPath()
    ctx.arc(node.x, node.y, node.radius * 0.6, 0, Math.PI * 2)
    ctx.fill()
  })

  // Draw mouse influence area (optional, for debugging)
  // ctx.strokeStyle = 'rgba(var(--color-primary-DEFAULT), 0.1)'
  // ctx.beginPath()
  // ctx.arc(mouse.value.x, mouse.value.y, mouseInfluenceRadius, 0, Math.PI * 2)
  // ctx.stroke()
}

const animate = () => {
  updateNodes()
  draw()
  animationFrame.value = requestAnimationFrame(animate)
}

const handleMouseMove = (event: MouseEvent) => {
  if (!canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  mouse.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

const handleClick = (event: MouseEvent) => {
  if (!canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // Create click wave
  clickWaves.value.push({
    x,
    y,
    radius: 0,
    maxRadius: clickWaveMaxRadius,
    opacity: 0.8,
    speed: clickWaveSpeed,
    life: 0,
    maxLife: clickWaveDuration
  })

  // Emit particles from click
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 * i) / 10
    particles.value.push({
      x,
      y,
      vx: Math.cos(angle) * 2,
      vy: Math.sin(angle) * 2,
      life: 0,
      maxLife: 800,
      size: 2 + Math.random() * 3,
      z: Math.random()
    })
  }
}

const getContainer = (): HTMLElement | null => {
  if (!props.container) return null

  if (props.container instanceof HTMLElement) {
    return props.container
  }

  if ('value' in props.container) {
    return props.container.value
  }

  return null
}

const handleResize = () => {
  if (!canvasRef.value) return

  const container = getContainer() || canvasRef.value.parentElement
  const width = container ? container.clientWidth : window.innerWidth
  const height = container ? container.clientHeight : window.innerHeight

  canvasRef.value.width = width
  canvasRef.value.height = height
  initNodes()
}

onMounted(() => {
  if (!canvasRef.value) return

  handleResize()
  initNodes()
  animate()

  window.addEventListener('resize', handleResize)

  // Listen to mouse events on the container (section) instead of canvas
  // This allows events to work even when canvas is behind other elements
  const container = getContainer() || canvasRef.value.parentElement?.parentElement

  if (container) {
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('click', handleClick)
  } else if (canvasRef.value) {
    // Fallback to canvas if container not found
    canvasRef.value.addEventListener('mousemove', handleMouseMove)
    canvasRef.value.addEventListener('click', handleClick)
  }
})

onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
  window.removeEventListener('resize', handleResize)

  const container = getContainer() || canvasRef.value?.parentElement?.parentElement
  if (container) {
    container.removeEventListener('mousemove', handleMouseMove)
    container.removeEventListener('click', handleClick)
  } else if (canvasRef.value) {
    canvasRef.value.removeEventListener('mousemove', handleMouseMove)
    canvasRef.value.removeEventListener('click', handleClick)
  }
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="absolute inset-0 w-full h-full"
  />
</template>

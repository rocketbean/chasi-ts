<template>
  <canvas ref="canvas" class="hero-net" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let _cleanup = null

const COLORS = {
  dark:   [245, 158,  11],
  light:  [217, 119,   6],
  accent: [129, 140, 248],
  forest: [ 52, 211, 153],
}

function getColor() {
  const t = document.documentElement.getAttribute('data-theme') || 'dark'
  return COLORS[t] || COLORS.dark
}

onMounted(() => {
  const el = canvas.value
  if (!el) return
  const ctx = el.getContext('2d')
  if (!ctx) return
  const mouse = { x: -9999, y: -9999 }
  let W, H, particles, raf
  const N = 70
  const MAX_DIST = 145
  const SPEED = 0.5

  function resize() {
    const hero = el.closest('.w2-intro-hero') || el.parentElement
    if (!hero) return
    W = el.width = hero.offsetWidth
    H = el.height = hero.offsetHeight
  }

  function makeParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r:  1.2 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
    }
  }

  function init() {
    resize()
    particles = Array.from({ length: N }, makeParticle)
  }

  function frame() {
    const [r, g, b] = getColor()
    ctx.clearRect(0, 0, W, H)

    // Lines
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j]
        const d = Math.hypot(p.x - q.x, p.y - q.y)
        if (d < MAX_DIST) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - d / MAX_DIST) * 0.28})`
          ctx.lineWidth = 0.7
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(q.x, q.y)
          ctx.stroke()
        }
      }
    }

    // Dots
    for (const p of particles) {
      p.phase += 0.022

      // Mouse repulsion
      const mx = p.x - mouse.x
      const my = p.y - mouse.y
      const md = Math.hypot(mx, my)
      if (md < 110 && md > 0) {
        const f = ((110 - md) / 110) * 0.95
        p.vx += (mx / md) * f
        p.vy += (my / md) * f
      }

      p.vx *= 0.983
      p.vy *= 0.983
      p.x  += p.vx
      p.y  += p.vy

      if (p.x < 0)  { p.x = 0;  p.vx =  Math.abs(p.vx) }
      if (p.x > W)  { p.x = W;  p.vx = -Math.abs(p.vx) }
      if (p.y < 0)  { p.y = 0;  p.vy =  Math.abs(p.vy) }
      if (p.y > H)  { p.y = H;  p.vy = -Math.abs(p.vy) }

      const pr = p.r * (1 + 0.28 * Math.sin(p.phase))

      // Glow
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pr * 5)
      grd.addColorStop(0, `rgba(${r},${g},${b},0.5)`)
      grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
      ctx.beginPath()
      ctx.arc(p.x, p.y, pr * 5, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.fill()

      // Core
      ctx.beginPath()
      ctx.arc(p.x, p.y, pr, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${r},${g},${b},0.88)`
      ctx.fill()
    }

    raf = requestAnimationFrame(frame)
  }

  function onMove(e) {
    const rect = el.getBoundingClientRect()
    mouse.x = e.clientX - rect.left
    mouse.y = e.clientY - rect.top
  }
  function onLeave() { mouse.x = -9999; mouse.y = -9999 }

  init()
  frame()

  const hero = el.closest('.w2-intro-hero') || el.parentElement
  window.addEventListener('resize', init)
  if (hero) {
    hero.addEventListener('mousemove', onMove)
    hero.addEventListener('mouseleave', onLeave)
  }

  _cleanup = () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', init)
    if (hero) {
      hero.removeEventListener('mousemove', onMove)
      hero.removeEventListener('mouseleave', onLeave)
    }
  }
})

onUnmounted(() => _cleanup?.())
</script>

<style>
.hero-net {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  z-index: 0;
  pointer-events: none;
  display: block;
}
</style>

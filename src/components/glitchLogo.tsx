import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"

/**
 * The crest with the "datamosh scatter" glitch, ported from joe-lloyd.com's
 * GlitchLogo.astro. The crest is drawn into a tiny offscreen buffer and blown
 * back up with smoothing off, then rectangular tiles are lifted and flung so it
 * reads as a corrupted keyframe. Pauses off-screen and in hidden tabs, and
 * never draws under prefers-reduced-motion.
 */

const MIN_GAP = 2600
const JITTER = 2600
const BLOCKS = [6, 8, 10]

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const pick = (xs: number[]) => xs[(Math.random() * xs.length) | 0]
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

function arm(root: HTMLElement) {
  const img = root.querySelector<HTMLImageElement>("img.glitch-src, .glitch-src img")
  const canvas = root.querySelector<HTMLCanvasElement>(".glitch-px")
  if (!img || !canvas) return () => {}
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!
  const reduced = matchMedia("(prefers-reduced-motion: reduce)")

  const small = document.createElement("canvas")
  const sctx = small.getContext("2d")!

  let timer: number | undefined
  let frameTimer: number | undefined
  let visible = true
  let ready = false
  let dpr = 1

  const sizeCanvas = () => {
    const r = root.getBoundingClientRect()
    if (!r.width) return false
    dpr = Math.min(devicePixelRatio || 1, 2)
    canvas.width = Math.round(r.width * dpr)
    canvas.height = Math.round(r.height * dpr)
    return true
  }

  const pixelate = (W: number, H: number, block: number) => {
    const sw = Math.max(2, Math.round(W / block))
    const sh = Math.max(2, Math.round(H / block))
    small.width = sw
    small.height = sh
    sctx.clearRect(0, 0, sw, sh)
    sctx.imageSmoothingEnabled = true
    sctx.drawImage(img, 0, 0, sw, sh)
    ctx.clearRect(0, 0, W, H)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(small, 0, 0, sw, sh, 0, 0, W, H)
    return { sw, sh, unitX: W / sw, unitY: H / sh }
  }

  const tint = (x: number, y: number, w: number, h: number) => {
    ctx.save()
    ctx.globalCompositeOperation = "source-atop"
    ctx.fillStyle = Math.random() < 0.5 ? "rgba(67,202,223,0.38)" : "rgba(218,37,125,0.38)"
    ctx.fillRect(x, y, w, h)
    ctx.restore()
  }

  const drawFrame = () => {
    const W = canvas.width
    const H = canvas.height
    if (!W || !H) return
    const px = pixelate(W, H, pick(BLOCKS) * dpr)
    const tiles = 6 + ((Math.random() * 8) | 0)
    for (let i = 0; i < tiles; i++) {
      const tw = Math.round(Math.round(rand(3, px.sw * 0.5)) * px.unitX)
      const th = Math.round(Math.round(rand(2, px.sh * 0.22)) * px.unitY)
      const sx = Math.round(Math.round(rand(0, px.sw)) * px.unitX)
      const sy = Math.round(Math.round(rand(0, px.sh)) * px.unitY)
      const dx = Math.round(Math.round(rand(-8, 8)) * px.unitX)
      const dy = Math.round(Math.round(rand(-4, 4)) * px.unitY)
      if (tw < 1 || th < 1 || sx + tw > W || sy + th > H) continue
      const data = ctx.getImageData(sx, sy, tw, th)
      if (Math.random() < 0.35) {
        ctx.putImageData(data, clamp(sx + dx * 0.5, 0, W - tw), clamp(sy + dy * 0.5, 0, H - th))
      }
      const tx = clamp(sx + dx, 0, W - tw)
      const ty = clamp(sy + dy, 0, H - th)
      ctx.putImageData(data, tx, ty)
      if (Math.random() < 0.35) tint(tx, ty, tw, th)
    }
  }

  const stop = () => {
    clearTimeout(frameTimer)
    root.removeAttribute("data-firing")
  }

  const fire = () => {
    if (reduced.matches || document.hidden || !visible || !ready) return
    if (!sizeCanvas()) return
    root.setAttribute("data-firing", "")
    let left = 3 + ((Math.random() * 3) | 0)
    const step = () => {
      if (left-- <= 0) return stop()
      drawFrame()
      frameTimer = window.setTimeout(step, rand(55, 125))
    }
    step()
  }

  const schedule = () => {
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      fire()
      schedule()
    }, MIN_GAP + Math.random() * JITTER)
  }

  const onReady = () => {
    ready = true
    sizeCanvas()
    setTimeout(fire, 900)
  }
  if (img.complete && img.naturalWidth) onReady()
  else img.addEventListener("load", onReady, { once: true })

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting
      if (visible) schedule()
      else {
        clearTimeout(timer)
        stop()
      }
    },
    { threshold: 0.1 },
  )
  io.observe(root)

  const onVisibility = () => {
    if (document.hidden) {
      clearTimeout(timer)
      stop()
    } else schedule()
  }
  const onResize = () => sizeCanvas()
  document.addEventListener("visibilitychange", onVisibility)
  addEventListener("resize", onResize, { passive: true })
  root.addEventListener("mouseenter", fire)
  root.addEventListener("focusin", fire)

  return () => {
    clearTimeout(timer)
    stop()
    io.disconnect()
    document.removeEventListener("visibilitychange", onVisibility)
    removeEventListener("resize", onResize)
    root.removeEventListener("mouseenter", fire)
    root.removeEventListener("focusin", fire)
  }
}

const GlitchLogo: React.FC<{ width?: number }> = ({ width = 400 }) => {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => (ref.current ? arm(ref.current) : undefined), [])

  return (
    <div ref={ref} className="glitch-logo" style={{ width: `min(${width}px, 100%)` }}>
      <div className="glitch-stage">
        <StaticImage
          src="../images/logo.png"
          alt="Joe Lloyd dragon crest"
          placeholder="none"
          loading="eager"
          formats={["auto", "webp", "avif"]}
          className="glitch-src"
          // The canvas reads pixels back, so the image must not be tainted.
          imgClassName="glitch-src"
        />
        <canvas className="glitch-px" aria-hidden="true" />
      </div>
    </div>
  )
}

export default GlitchLogo

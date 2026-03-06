"use client"

import React from "react"

// ─────────────────────────────────────────────────────────────────────────────
// ClassPlaceholder — SVG generative art for classes without photos
//
// Each class gets a unique, deterministic visual composition based on:
//   1. Dimension → color palette (warm gradient)
//   2. Category → motif family (visual rhythm specific to the subject)
//   3. Class ID → seeded randomness (unique but reproducible)
//
// Visual layers (back to front):
//   1. Background gradient (dimension-colored)
//   2. Subtle dot-grid texture
//   3. Soft bokeh circles (depth through overlap)
//   4. Category-specific motif shapes (the hero layer)
//   5. Center radial glow (warmth)
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ──

interface ClassPlaceholderProps {
  category?: string
  dimension?: "content" | "philosophy" | "experience" | "child"
  tags?: { label: string; dimension: string }[]
  seed?: string // class ID for deterministic variation
  className?: string
  style?: React.CSSProperties
}

// ── Dimension color palettes ──
// Each dimension gets a gradient trio: [light, base, dark]
// These match DIMENSION_COLORS in mp-card.tsx but expressed as tinted gradients

interface Palette {
  bg1: string // lightest (top-left)
  bg2: string // base (center)
  bg3: string // darkest (bottom-right)
}

const PALETTES: Record<string, Palette> = {
  content:    { bg1: "#C4906A", bg2: "#7E401A", bg3: "#5A2D12" },
  philosophy: { bg1: "#FF8A5C", bg2: "#FF3C00", bg3: "#C23000" },
  experience: { bg1: "#F7CE5A", bg2: "#F1B313", bg3: "#C8950F" },
  child:      { bg1: "#FFB0AE", bg2: "#FF6966", bg3: "#D45553" },
}

const NEUTRAL_PALETTE: Palette = { bg1: "#E8D5C0", bg2: "#D4B896", bg3: "#BFA07A" }

// ── Seeded PRNG (Linear Congruential Generator) ──

function createRng(seed: number): () => number {
  let s = Math.abs(seed) || 1
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function hashStr(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

// ── Category → motif family mapping ──

type MotifFamily =
  | "creative"
  | "musical"
  | "athletic"
  | "academic"
  | "language"
  | "nature"
  | "default"

const CATEGORY_MAP: Record<string, MotifFamily> = {
  "art":          "creative",
  "creative":     "creative",
  "music":        "musical",
  "dance":        "musical",
  "sports":       "athletic",
  "swimming":     "athletic",
  "gymnastics":   "athletic",
  "martial arts": "athletic",
  "science":      "academic",
  "stem":         "academic",
  "math":         "academic",
  "enrichment":   "academic",
  "coding":       "academic",
  "tech":         "academic",
  "language":     "language",
  "cooking":      "nature",
  "nature":       "nature",
  "outdoor":      "nature",
}

function resolveMotif(category?: string): MotifFamily {
  if (!category) return "default"
  const lower = category.toLowerCase().trim()

  // Direct match
  if (CATEGORY_MAP[lower]) return CATEGORY_MAP[lower]

  // Partial match
  for (const [key, family] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return family
  }

  return "default"
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Motif Generators
//
// viewBox: 0 0 400 250  (≈16:10, sliced to fit any aspect)
//
// All shapes use white at various opacities (0.06–0.35) so they harmonize
// with any dimension palette. The result is warm, monochromatic, and restrained.
// ─────────────────────────────────────────────────────────────────────────────

type Elements = React.ReactElement[]

// ── Shared: soft bokeh circles ──

function genBokeh(rng: () => number, uid: string): Elements {
  const count = 4 + Math.floor(rng() * 3) // 4–6
  return Array.from({ length: count }, (_, i) => {
    const cx = 30 + rng() * 340
    const cy = 15 + rng() * 220
    const r = 28 + rng() * 55
    const op = 0.05 + rng() * 0.11
    return (
      <circle
        key={`bk${uid}${i}`}
        cx={cx}
        cy={cy}
        r={r}
        fill={`rgba(255,255,255,${op.toFixed(3)})`}
      />
    )
  })
}

// ── Creative (art, creative) ──
// Paint circles + curved brush strokes — playful, expressive

function genCreative(rng: () => number, uid: string): Elements {
  const els: Elements = []

  // Paint circles: scattered, varying sizes, some filled, some outlined
  for (let i = 0; i < 5; i++) {
    const cx = 35 + rng() * 330
    const cy = 20 + rng() * 210
    const r = 8 + rng() * 24
    const op = (0.1 + rng() * 0.2).toFixed(3)
    const outline = rng() > 0.55

    els.push(
      <circle
        key={`cr${uid}${i}`}
        cx={cx} cy={cy} r={r}
        fill={outline ? "none" : `rgba(255,255,255,${op})`}
        stroke={outline ? `rgba(255,255,255,${op})` : "none"}
        strokeWidth={outline ? 2 : 0}
      />
    )
  }

  // Brush stroke curves
  for (let i = 0; i < 2; i++) {
    const x1 = 30 + rng() * 140
    const y1 = 40 + rng() * 170
    const x2 = x1 + 80 + rng() * 120
    const y2 = y1 + (rng() - 0.5) * 80
    const cpx = (x1 + x2) / 2 + (rng() - 0.5) * 60
    const cpy = Math.min(y1, y2) - 20 - rng() * 40
    const op = (0.1 + rng() * 0.14).toFixed(3)

    els.push(
      <path
        key={`bs${uid}${i}`}
        d={`M${x1.toFixed(0)},${y1.toFixed(0)} Q${cpx.toFixed(0)},${cpy.toFixed(0)} ${x2.toFixed(0)},${y2.toFixed(0)}`}
        fill="none"
        stroke={`rgba(255,255,255,${op})`}
        strokeWidth={2.5 + rng() * 3}
        strokeLinecap="round"
      />
    )
  }

  return els
}

// ── Musical (music, dance) ──
// Flowing sine waves + floating oval notes — rhythmic, flowing

function genMusical(rng: () => number, uid: string): Elements {
  const els: Elements = []

  // Sinusoidal wave lines
  const waveCount = 3 + Math.floor(rng() * 2)
  for (let i = 0; i < waveCount; i++) {
    const yBase = 35 + i * 50 + rng() * 15
    const amp = 8 + rng() * 18
    const phase = rng() * Math.PI * 2
    const freq = 1.5 + rng() * 1.5
    const op = (0.08 + rng() * 0.14).toFixed(3)

    let d = ""
    for (let x = 0; x <= 400; x += 4) {
      const y = yBase + Math.sin((x / 400) * Math.PI * 2 * freq + phase) * amp
      d += x === 0 ? `M${x},${y.toFixed(1)}` : ` L${x},${y.toFixed(1)}`
    }

    els.push(
      <path
        key={`wv${uid}${i}`}
        d={d}
        fill="none"
        stroke={`rgba(255,255,255,${op})`}
        strokeWidth={1.5 + rng() * 1.5}
        strokeLinecap="round"
      />
    )
  }

  // Floating ovals (note-like)
  for (let i = 0; i < 3; i++) {
    const cx = 55 + rng() * 290
    const cy = 35 + rng() * 180
    const rx = 12 + rng() * 16
    const ry = rx * (0.5 + rng() * 0.3)
    const rot = (rng() - 0.5) * 25
    const op = (0.09 + rng() * 0.16).toFixed(3)

    els.push(
      <ellipse
        key={`nt${uid}${i}`}
        cx={cx} cy={cy} rx={rx} ry={ry}
        fill={`rgba(255,255,255,${op})`}
        transform={`rotate(${rot.toFixed(1)} ${cx} ${cy})`}
      />
    )
  }

  return els
}

// ── Athletic (sports, swimming, gymnastics, martial arts) ──
// Dynamic arcs + motion dots — energetic, kinetic

function genAthletic(rng: () => number, uid: string): Elements {
  const els: Elements = []

  // Motion arcs
  for (let i = 0; i < 4; i++) {
    const cx = 70 + rng() * 260
    const cy = 35 + rng() * 180
    const r = 24 + rng() * 48
    const start = rng() * Math.PI * 2
    const sweep = (0.35 + rng() * 0.85) * Math.PI
    const x1 = cx + Math.cos(start) * r
    const y1 = cy + Math.sin(start) * r
    const x2 = cx + Math.cos(start + sweep) * r
    const y2 = cy + Math.sin(start + sweep) * r
    const large = sweep > Math.PI ? 1 : 0
    const op = (0.1 + rng() * 0.18).toFixed(3)

    els.push(
      <path
        key={`ar${uid}${i}`}
        d={`M${x1.toFixed(1)},${y1.toFixed(1)} A${r.toFixed(0)},${r.toFixed(0)} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)}`}
        fill="none"
        stroke={`rgba(255,255,255,${op})`}
        strokeWidth={2 + rng() * 3}
        strokeLinecap="round"
      />
    )
  }

  // Speed dots
  for (let i = 0; i < 6; i++) {
    const x = 40 + rng() * 320
    const y = 25 + rng() * 200
    const r = 2.5 + rng() * 5.5
    const op = (0.08 + rng() * 0.18).toFixed(3)

    els.push(
      <circle
        key={`sd${uid}${i}`}
        cx={x} cy={y} r={r}
        fill={`rgba(255,255,255,${op})`}
      />
    )
  }

  return els
}

// ── Academic (science, stem, math, enrichment, coding, tech) ──
// Connected node network + hexagonal outlines — structured, cerebral

function genAcademic(rng: () => number, uid: string): Elements {
  const els: Elements = []

  // Node network
  const nodes: { x: number; y: number }[] = []
  const nodeCount = 7 + Math.floor(rng() * 4)

  for (let i = 0; i < nodeCount; i++) {
    const x = 35 + rng() * 330
    const y = 20 + rng() * 210
    nodes.push({ x, y })
    const r = 3 + rng() * 6
    const op = (0.1 + rng() * 0.2).toFixed(3)

    els.push(
      <circle
        key={`nd${uid}${i}`}
        cx={x} cy={y} r={r}
        fill={`rgba(255,255,255,${op})`}
      />
    )
  }

  // Connect nearby nodes with thin lines
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x
      const dy = nodes[i].y - nodes[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 120 && rng() > 0.35) {
        const op = (0.04 + rng() * 0.08).toFixed(3)
        els.push(
          <line
            key={`ln${uid}${i}${j}`}
            x1={nodes[i].x} y1={nodes[i].y}
            x2={nodes[j].x} y2={nodes[j].y}
            stroke={`rgba(255,255,255,${op})`}
            strokeWidth={1}
          />
        )
      }
    }
  }

  // Hexagonal outline accent
  const hx = 100 + rng() * 200
  const hy = 50 + rng() * 150
  const hr = 20 + rng() * 28
  const hrot = rng() * 30
  const hexPts = Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k + (hrot * Math.PI / 180)
    return `${(hx + Math.cos(a) * hr).toFixed(1)},${(hy + Math.sin(a) * hr).toFixed(1)}`
  }).join(" ")

  els.push(
    <polygon
      key={`hx${uid}`}
      points={hexPts}
      fill="none"
      stroke={`rgba(255,255,255,${(0.07 + rng() * 0.1).toFixed(3)})`}
      strokeWidth={1.5}
    />
  )

  return els
}

// ── Language ──
// Rounded text-line bars + speech bubble oval — communicative, structured

function genLanguage(rng: () => number, uid: string): Elements {
  const els: Elements = []

  // Text-block bars (horizontal rounded rects suggesting lines of text)
  for (let i = 0; i < 4; i++) {
    const x = 55 + rng() * 130
    const y = 35 + i * 48 + rng() * 15
    const w = 80 + rng() * 130
    const h = 8 + rng() * 6
    const rot = (rng() - 0.5) * 6
    const op = (0.07 + rng() * 0.13).toFixed(3)

    els.push(
      <rect
        key={`tb${uid}${i}`}
        x={x} y={y}
        width={w} height={h}
        rx={h / 2}
        fill={`rgba(255,255,255,${op})`}
        transform={`rotate(${rot.toFixed(1)} ${x + w / 2} ${y + h / 2})`}
      />
    )
  }

  // Speech bubble oval
  const bx = 130 + rng() * 140
  const by = 70 + rng() * 110
  const brx = 35 + rng() * 30
  const bry = 22 + rng() * 18
  const bop = (0.08 + rng() * 0.12).toFixed(3)

  els.push(
    <ellipse
      key={`sb${uid}`}
      cx={bx} cy={by}
      rx={brx} ry={bry}
      fill="none"
      stroke={`rgba(255,255,255,${bop})`}
      strokeWidth={1.5}
    />
  )

  // Flowing connector curves
  for (let i = 0; i < 2; i++) {
    const x1 = 40 + rng() * 100
    const y1 = 50 + rng() * 150
    const x2 = 260 + rng() * 100
    const y2 = 50 + rng() * 150
    const cpx = 150 + rng() * 100
    const cpy = y1 + (rng() - 0.5) * 80
    const lop = (0.06 + rng() * 0.1).toFixed(3)

    els.push(
      <path
        key={`lc${uid}${i}`}
        d={`M${x1.toFixed(0)},${y1.toFixed(0)} Q${cpx.toFixed(0)},${cpy.toFixed(0)} ${x2.toFixed(0)},${y2.toFixed(0)}`}
        fill="none"
        stroke={`rgba(255,255,255,${lop})`}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    )
  }

  return els
}

// ── Nature (cooking, nature, outdoor) ──
// Petal clusters + organic leaf curves — warm, organic

function genNature(rng: () => number, uid: string): Elements {
  const els: Elements = []

  // Petal cluster (1–2 centers)
  const centers = 1 + Math.floor(rng() * 2)
  for (let c = 0; c < centers; c++) {
    const cx = 90 + rng() * 220
    const cy = 45 + rng() * 160
    const petalCount = 5 + Math.floor(rng() * 3)
    const dist = 18 + rng() * 22

    for (let p = 0; p < petalCount; p++) {
      const angle = (p / petalCount) * Math.PI * 2 + rng() * 0.4
      const px = cx + Math.cos(angle) * dist
      const py = cy + Math.sin(angle) * dist
      const pr = 7 + rng() * 12
      const op = (0.07 + rng() * 0.15).toFixed(3)

      els.push(
        <circle
          key={`pt${uid}${c}${p}`}
          cx={px.toFixed(1)} cy={py.toFixed(1)} r={pr}
          fill={`rgba(255,255,255,${op})`}
        />
      )
    }

    // Center dot
    els.push(
      <circle
        key={`pc${uid}${c}`}
        cx={cx} cy={cy}
        r={4 + rng() * 5}
        fill={`rgba(255,255,255,${(0.14 + rng() * 0.16).toFixed(3)})`}
      />
    )
  }

  // Organic leaf curves
  for (let i = 0; i < 2; i++) {
    const x1 = 50 + rng() * 300
    const y1 = 35 + rng() * 180
    const len = 30 + rng() * 50
    const angle = rng() * Math.PI * 2
    const x2 = x1 + Math.cos(angle) * len
    const y2 = y1 + Math.sin(angle) * len
    const cpx = (x1 + x2) / 2 + (rng() - 0.5) * len * 0.8
    const cpy = (y1 + y2) / 2 + (rng() - 0.5) * len * 0.8
    const op = (0.08 + rng() * 0.14).toFixed(3)

    els.push(
      <path
        key={`lf${uid}${i}`}
        d={`M${x1.toFixed(0)},${y1.toFixed(0)} Q${cpx.toFixed(0)},${cpy.toFixed(0)} ${x2.toFixed(0)},${y2.toFixed(0)}`}
        fill="none"
        stroke={`rgba(255,255,255,${op})`}
        strokeWidth={2}
        strokeLinecap="round"
      />
    )
  }

  return els
}

// ── Default (unknown category) ──
// Floating circles + diamond accents — abstract, warm

function genDefault(rng: () => number, uid: string): Elements {
  const els: Elements = []

  // Floating circles
  for (let i = 0; i < 5; i++) {
    const cx = 45 + rng() * 310
    const cy = 25 + rng() * 200
    const r = 10 + rng() * 26
    const op = (0.07 + rng() * 0.18).toFixed(3)
    const outline = rng() > 0.5

    els.push(
      <circle
        key={`df${uid}${i}`}
        cx={cx} cy={cy} r={r}
        fill={outline ? "none" : `rgba(255,255,255,${op})`}
        stroke={outline ? `rgba(255,255,255,${op})` : "none"}
        strokeWidth={outline ? 1.5 : 0}
      />
    )
  }

  // Diamond accents
  for (let i = 0; i < 2; i++) {
    const cx = 80 + rng() * 240
    const cy = 45 + rng() * 160
    const s = 12 + rng() * 16
    const rot = 45 + rng() * 10
    const op = (0.07 + rng() * 0.13).toFixed(3)

    els.push(
      <rect
        key={`dm${uid}${i}`}
        x={cx - s / 2} y={cy - s / 2}
        width={s} height={s}
        rx={2}
        fill={`rgba(255,255,255,${op})`}
        transform={`rotate(${rot.toFixed(0)} ${cx} ${cy})`}
      />
    )
  }

  return els
}

// ── Motif dispatcher ──

const MOTIF_GENERATORS: Record<MotifFamily, (rng: () => number, uid: string) => Elements> = {
  creative: genCreative,
  musical:  genMusical,
  athletic: genAthletic,
  academic: genAcademic,
  language: genLanguage,
  nature:   genNature,
  default:  genDefault,
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const ClassPlaceholder = React.memo(function ClassPlaceholder({
  category,
  dimension,
  tags,
  seed = "default",
  className,
  style,
}: ClassPlaceholderProps) {
  const hash = hashStr(seed)
  const rng = createRng(hash)

  // Short unique ID for SVG defs (avoids gradient ID collisions between cards)
  const uid = `${hash}`

  // Resolve dimension palette
  const effectiveDimension = dimension ?? tags?.[0]?.dimension
  const palette = (effectiveDimension && PALETTES[effectiveDimension])
    ? PALETTES[effectiveDimension]
    : NEUTRAL_PALETTE

  // Resolve category motif
  const motif = resolveMotif(category)
  const generateMotifs = MOTIF_GENERATORS[motif]

  // Generate layers
  const bokehElements = genBokeh(rng, uid)
  const motifElements = generateMotifs(rng, uid)

  // SVG def IDs (unique per card)
  const bgId = `bg${uid}`
  const glowId = `gl${uid}`
  const dotId = `dt${uid}`

  // Dot texture opacity: brighter on colored backgrounds, subtler on neutral
  const dotOp = effectiveDimension ? 0.1 : 0.05

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...style,
      }}
    >
      <svg
        viewBox="0 0 400 250"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%", display: "block" }}
        aria-hidden="true"
      >
        <defs>
          {/* Background gradient */}
          <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.bg1} />
            <stop offset="50%" stopColor={palette.bg2} />
            <stop offset="100%" stopColor={palette.bg3} />
          </linearGradient>

          {/* Center glow */}
          <radialGradient id={glowId} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity={0.16} />
            <stop offset="100%" stopColor="white" stopOpacity={0} />
          </radialGradient>

          {/* Dot-grid texture pattern */}
          <pattern id={dotId} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="8" cy="8" r="0.8" fill="white" fillOpacity={dotOp} />
          </pattern>
        </defs>

        {/* Layer 1: Background gradient */}
        <rect width="400" height="250" fill={`url(#${bgId})`} />

        {/* Layer 2: Dot-grid texture */}
        <rect width="400" height="250" fill={`url(#${dotId})`} />

        {/* Layer 3: Bokeh circles (depth) */}
        {bokehElements}

        {/* Layer 4: Category motifs (hero) */}
        {motifElements}

        {/* Layer 5: Center glow (warmth) */}
        <rect width="400" height="250" fill={`url(#${glowId})`} />
      </svg>
    </div>
  )
})

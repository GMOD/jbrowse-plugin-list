import { curvePaths, nodeOutlinePath } from '@gmod/tubemap-core'

import { tubeMapMismatches } from './mismatches'

import type { TubeMapTransform } from './frame'
import type { TubeMapMismatch } from './mismatches'
import type { TrackType, TubeMapLayout } from '@gmod/tubemap-core'

// Paints a tube map layout on a 2D canvas, in the order sequenceTubeMap's d3
// drawing stacks it: haplotype tubes, their lane changes and turnarounds, then
// reads the same way, then the node boxes over all of them. Everything goes
// through `x` and `y`, tube coordinates to screen px, so the one painter serves
// the tube map's own axis (an affine map) and the reference axis (warp.ts).
//
// The package states curves, corners and node outlines as SVG path data. They
// are parsed once per layout into commands whose points can be mapped, since
// a Path2D built from the string could only be transformed affinely.

type Command =
  | { op: 'M' | 'L'; x: number; y: number }
  | { op: 'Q'; x1: number; y1: number; x: number; y: number }
  | {
      op: 'C'
      x1: number
      y1: number
      x2: number
      y2: number
      x: number
      y: number
    }
  | { op: 'H'; x: number }
  | { op: 'V'; y: number }
  | { op: 'Z' }

// The absolute M/L/H/V/Q/C/Z subset tubemap-core writes
export function parsePath(d: string): Command[] {
  const tokens = d.trim().split(/[\s,]+/)
  const commands: Command[] = []
  let i = 0
  const num = () => Number(tokens[i++])
  while (i < tokens.length) {
    const op = tokens[i++]
    if (op === 'M' || op === 'L') {
      commands.push({ op, x: num(), y: num() })
    } else if (op === 'H') {
      commands.push({ op, x: num() })
    } else if (op === 'V') {
      commands.push({ op, y: num() })
    } else if (op === 'Q') {
      commands.push({ op, x1: num(), y1: num(), x: num(), y: num() })
    } else if (op === 'C') {
      commands.push({
        op,
        x1: num(),
        y1: num(),
        x2: num(),
        y2: num(),
        x: num(),
        y: num(),
      })
    } else if (op === 'Z') {
      commands.push({ op })
    }
  }
  return commands
}

interface Filled {
  color: string
  alpha: number
  // tube x extent, for culling
  x0: number
  x1: number
}

interface Rect extends Filled {
  y0: number
  y1: number
}

interface Shape extends Filled {
  commands: Command[]
}

interface Layer {
  rects: Rect[]
  shapes: Shape[]
}

export interface TubeMapPicture {
  layers: Layer[]
  nodes: { name: string; commands: Command[]; x0: number; x1: number }[]
  mismatches: TubeMapMismatch[]
}

function extentOf(commands: Command[]) {
  let x0 = Infinity
  let x1 = -Infinity
  for (const c of commands) {
    if ('x' in c) {
      x0 = Math.min(x0, c.x)
      x1 = Math.max(x1, c.x)
    }
    if ('x1' in c) {
      x0 = Math.min(x0, c.x1)
      x1 = Math.max(x1, c.x1)
    }
  }
  return { x0, x1 }
}

function shapeOf(d: string, color: string, alpha: number): Shape {
  const commands = parsePath(d)
  return { commands, color, alpha, ...extentOf(commands) }
}

function layerOf(layout: TubeMapLayout, type: TrackType): Layer {
  const { shapes } = layout
  const rects = [...shapes.rectangles, ...shapes.verticalRectangles]
    .filter(r => r.type === type)
    .map(r => ({
      color: r.color,
      alpha: r.alpha ?? 1,
      x0: r.xStart,
      x1: r.xEnd + 1,
      y0: r.yStart,
      y1: r.yEnd + 1,
    }))
  const curves = curvePaths(shapes.curves, type).map(c =>
    shapeOf(c.path!, c.color, c.alpha ?? 1),
  )
  const corners = shapes.corners
    .filter(c => c.type === type)
    .map(c => shapeOf(c.path, c.color, 1))
  return { rects, shapes: [...curves, ...corners] }
}

// Everything a frame needs that does not depend on the transform
export function tubeMapPicture(layout: TubeMapLayout): TubeMapPicture {
  const nodes: TubeMapPicture['nodes'] = []
  layout.nodes.forEach(node => {
    if (node.order >= 0) {
      const commands = parsePath(nodeOutlinePath(node))
      nodes.push({ name: node.name, commands, ...extentOf(commands) })
    }
  })
  return {
    layers: [layerOf(layout, 'haplotype'), layerOf(layout, 'read')],
    nodes,
    mismatches: tubeMapMismatches(layout).filter(
      m => m.kind !== 'insertion' || !m.softClip,
    ),
  }
}

function trace(
  ctx: CanvasRenderingContext2D,
  commands: Command[],
  x: (tx: number) => number,
  y: (ty: number) => number,
) {
  let cx = 0
  let cy = 0
  for (const c of commands) {
    switch (c.op) {
      case 'M':
        cx = c.x
        cy = c.y
        ctx.moveTo(x(cx), y(cy))
        break
      case 'L':
        cx = c.x
        cy = c.y
        ctx.lineTo(x(cx), y(cy))
        break
      case 'H':
        cx = c.x
        ctx.lineTo(x(cx), y(cy))
        break
      case 'V':
        cy = c.y
        ctx.lineTo(x(cx), y(cy))
        break
      case 'Q':
        cx = c.x
        cy = c.y
        ctx.quadraticCurveTo(x(c.x1), y(c.y1), x(cx), y(cy))
        break
      case 'C':
        cx = c.x
        cy = c.y
        ctx.bezierCurveTo(x(c.x1), y(c.y1), x(c.x2), y(c.y2), x(cx), y(cy))
        break
      case 'Z':
        ctx.closePath()
        break
    }
  }
}

export interface TubeMapFrame extends TubeMapTransform {
  width: number
  highlightNode?: string | null
  darkMode?: boolean
}

// One fill per colour per layer: a layer's shapes do not overlap in a way the
// order within it would decide, and a fill per shape costs a draw call each.
function fillByColor<T extends Filled>(
  ctx: CanvasRenderingContext2D,
  items: T[],
  visible: (item: T) => boolean,
  addTo: (item: T) => void,
) {
  const byColor = new Map<string, T[]>()
  for (const item of items) {
    if (visible(item)) {
      const key = `${item.color}|${item.alpha}`
      const list = byColor.get(key)
      if (list) {
        list.push(item)
      } else {
        byColor.set(key, [item])
      }
    }
  }
  for (const list of byColor.values()) {
    ctx.fillStyle = list[0]!.color
    ctx.globalAlpha = list[0]!.alpha
    ctx.beginPath()
    for (const item of list) {
      addTo(item)
    }
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

export function drawTubeMap(
  ctx: CanvasRenderingContext2D,
  picture: TubeMapPicture,
  frame: TubeMapFrame,
) {
  const { x, y, width } = frame
  const visible = (item: { x0: number; x1: number }) =>
    x(item.x1) >= 0 && x(item.x0) <= width
  for (const layer of picture.layers) {
    fillByColor(ctx, layer.rects, visible, r => {
      const left = x(r.x0)
      const top = y(r.y0)
      ctx.rect(left, top, x(r.x1) - left, y(r.y1) - top)
    })
    fillByColor(ctx, layer.shapes, visible, s => {
      trace(ctx, s.commands, x, y)
    })
  }
  const stroke = frame.darkMode ? '#d0d0d0' : '#000000'
  const fill = frame.darkMode ? 'rgba(40,40,40,0.4)' : 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 2 * Math.max(0.25, Math.min(1, frame.yScale))
  for (const node of picture.nodes) {
    if (visible(node)) {
      const lit = node.name === frame.highlightNode
      ctx.beginPath()
      trace(ctx, node.commands, x, y)
      ctx.fillStyle = lit ? 'rgba(255,192,203,0.5)' : fill
      ctx.strokeStyle = lit ? '#ff0000' : stroke
      ctx.fill()
      ctx.stroke()
    }
  }
  drawMismatches(ctx, picture.mismatches, frame)
}

// sequenceTubeMap's marks, which it draws at 12px and hides once zoomed out
// below half size
const MISMATCH_FONT_PX = 12
const MIN_MISMATCH_FONT_PX = 6

function drawMismatches(
  ctx: CanvasRenderingContext2D,
  marks: readonly TubeMapMismatch[],
  { x, y, yScale, width, darkMode }: TubeMapFrame,
) {
  const fontPx = MISMATCH_FONT_PX * yScale
  if (fontPx < MIN_MISMATCH_FONT_PX || marks.length === 0) {
    return
  }
  const onScreen = (x0: number, x1: number) => x(x1) >= 0 && x(x0) <= width
  ctx.fillStyle = 'grey'
  ctx.beginPath()
  for (const m of marks) {
    if (m.kind === 'deletion' && onScreen(m.x0, m.x1)) {
      const left = x(m.x0)
      const top = y(m.y)
      ctx.rect(left, top, x(m.x1) - left, y(m.y + m.height) - top)
    }
  }
  ctx.fill()
  ctx.font = `${fontPx}px monospace`
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = darkMode ? '#ffffff' : '#000000'
  for (const m of marks) {
    if (m.kind === 'substitution' && onScreen(m.x0, m.x1)) {
      ctx.fillText(m.seq, x(m.x0) + 1, y(m.y + m.height))
    } else if (m.kind === 'insertion' && onScreen(m.x, m.x)) {
      ctx.fillText('*', x(m.x) - 3, y(m.y + m.height))
    }
  }
}

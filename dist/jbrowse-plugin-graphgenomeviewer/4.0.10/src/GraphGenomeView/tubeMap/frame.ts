import { referenceKnots, warpX } from './warp'

import type { TubeMapDrawing } from '../layout/tubeMapLayout'

export interface TubeMapView {
  scaleX: number
  translateX: number
  scaleY: number
  translateY: number
  // the pane's height less its fit padding
  usableHeight: number
}

// Tube coordinates to screen px
export interface TubeMapTransform {
  x: (tx: number) => number
  y: (ty: number) => number
  // screen px per tube px in y, which thins the node outlines of a squeezed
  // stack along with its tubes
  yScale: number
}

const MIN_TUBE_Y_SCALE = 0.05

// How far a node's box reaches past its tubes (tubemap-core's nodeOutlinePath)
const NODE_BOX_PAD = 9

// On the reference axis y is px and a linear view has no vertical pan, so a
// stack of tubes taller than the track squeezes to fit it; dragging the track
// taller gives the tubes back their width.
function squeeze(drawing: TubeMapDrawing, usableHeight: number) {
  const { minY, maxY } = drawing.layout.bounds
  const h = maxY - minY
  return drawing.columns && h > 0
    ? Math.max(MIN_TUBE_Y_SCALE, Math.min(1, usableHeight / h))
    : 1
}

// The tube map's own axis is the layout's x; the reference axis warps each
// column onto the bp it covers (warp.ts).
export function tubeMapFrame(
  drawing: TubeMapDrawing,
  view: TubeMapView,
): TubeMapTransform {
  const { scaleX, translateX, translateY } = view
  const yScale = view.scaleY * squeeze(drawing, view.usableHeight)
  const y = (ty: number) => (ty - drawing.yOffset) * yScale + translateY
  const { columns } = drawing
  if (columns) {
    const knots = referenceKnots(columns, bp => bp * scaleX + translateX)
    return { x: tx => warpX(knots, tx), y, yScale }
  }
  return { x: tx => tx * scaleX + translateX, y, yScale }
}

// The node whose box is under a screen point. The canvas's hit test measures
// from a centreline and a stroke width, and a tube map box is as tall as the
// tubes through it.
export function tubeMapNodeAt(
  drawing: TubeMapDrawing,
  { x, y }: TubeMapTransform,
  sx: number,
  sy: number,
) {
  let hit: string | null = null
  drawing.layout.nodes.forEach(node => {
    if (
      node.order >= 0 &&
      x(node.x - NODE_BOX_PAD) <= sx &&
      sx <= x(node.x + node.pixelWidth + NODE_BOX_PAD) &&
      y(node.y - NODE_BOX_PAD) <= sy &&
      sy <= y(node.y + node.contentHeight + NODE_BOX_PAD)
    ) {
      hit = node.name
    }
  })
  return hit
}

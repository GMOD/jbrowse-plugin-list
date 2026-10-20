import React, { useEffect, useState } from 'react'

import { observer } from 'mobx-react'

import { placeLabels } from '../labelLayout'
import loadMolstar from '../loadMolstar'
import { labelAnchors } from '../sessionHighlights'

import type { JBrowsePluginProteinViewModel } from '../model'
import type { Vec3, Vec4 } from 'molstar/lib/mol-math/linear-algebra'
import type { StructureElement } from 'molstar/lib/mol-model/structure'

interface DrawnLabel {
  ref: string
  label: string
  color: string
  x: number
  y: number
  width: number
  boxX: number
  boxY: number
  leaderX: number
  leaderY: number
}

const FONT_SIZE = 13
const FONT = `${FONT_SIZE}px Roboto, Helvetica, Arial, sans-serif`
const PAD_X = 5
const BOX_HEIGHT = FONT_SIZE + 8

let measureContext: CanvasRenderingContext2D | null | undefined
function textWidth(text: string) {
  measureContext ??= document.createElement('canvas').getContext('2d')
  if (!measureContext) {
    return text.length * FONT_SIZE * 0.6
  }
  measureContext.font = FONT
  return measureContext.measureText(text).width
}

/**
 * The session highlights' labels over the Mol* canvas, in screen pixels: a dot
 * on each labelled residue, a leader, and the label in a box of the
 * highlight's color, placed apart by placeLabels. Mol*'s own text is
 * depth-tested, sized in Å and never moves off another label. The residues
 * are projected again on every frame Mol* draws.
 */
const HighlightLabels = observer(function HighlightLabels({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  const plugin = model.molstarPluginContext
  const [drawn, setDrawn] = useState<DrawnLabel[]>([])
  useEffect(() => {
    const canvas3d = plugin?.canvas3d
    if (!plugin || !canvas3d) {
      return
    }
    let getBoundary:
      | ((loci: StructureElement.Loci) => { sphere: { center: Vec3 } })
      | undefined
    let cancelled = false
    const projected = [0, 0, 0, 0] as unknown as Vec4
    const place = () => {
      if (!getBoundary) {
        return
      }
      const { camera } = canvas3d
      const pixelRatio = canvas3d.webgl.pixelRatio
      const width = camera.viewport.width / pixelRatio
      const height = camera.viewport.height / pixelRatio
      const points = []
      for (const [ref, { label, color }] of labelAnchors(plugin)) {
        const loci = (
          plugin.state.data.cells.get(ref)?.obj?.data as
            { loci: StructureElement.Loci }[] | undefined
        )?.[0]?.loci
        if (loci) {
          camera.project(projected, getBoundary(loci).sphere.center)
          const depth = projected[2]!
          if (depth > 0 && depth < 1) {
            points.push({
              ref,
              label,
              color,
              x: projected[0]! / pixelRatio,
              y: height - projected[1]! / pixelRatio,
              width: textWidth(label) + PAD_X * 2,
            })
          }
        }
      }
      const placed = placeLabels(
        points.map(p => ({ ...p, height: BOX_HEIGHT })),
        { width, height },
      )
      const next = points.map((p, i) => ({ ...p, ...placed[i]! }))
      setDrawn(prev =>
        JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
      )
    }
    loadMolstar()
      .then(molstar => {
        if (!cancelled) {
          getBoundary = loci => molstar.StructureElement.Loci.getBoundary(loci)
          place()
        }
      })
      .catch((e: unknown) => {
        console.error(e)
      })
    const subscription = canvas3d.didDraw.subscribe(place)
    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [plugin])

  return drawn.length > 0 ? (
    <svg
      data-testid="protein-view-highlight-labels"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {drawn.map(
        ({ ref, label, color, x, y, width, boxX, boxY, leaderX, leaderY }) => (
          <g key={ref}>
            <line
              x1={x}
              y1={y}
              x2={leaderX}
              y2={leaderY}
              stroke="#000"
              strokeWidth={1.5}
            />
            <circle cx={x} cy={y} r={3.5} fill={color} stroke="#000" />
            <rect
              x={boxX}
              y={boxY}
              width={width}
              height={BOX_HEIGHT}
              rx={4}
              fill="#fff"
              fillOpacity={0.92}
              stroke={color}
              strokeWidth={2}
            />
            <text
              x={boxX + PAD_X}
              y={boxY + BOX_HEIGHT - 6}
              style={{ font: FONT }}
              fill="#000"
            >
              {label}
            </text>
          </g>
        ),
      )}
    </svg>
  ) : null
})

export default HighlightLabels

import React, { useEffect, useState } from 'react'

import { observer } from 'mobx-react'

import { nearestInFront, placeLabels } from '../labelLayout'
import loadMolstar from '../loadMolstar'
import { copyCenters, labelAnchors, pickHitsCopy } from '../sessionHighlights'

import type { JBrowsePluginProteinViewModel } from '../model'
import type { Vec2, Vec4 } from 'molstar/lib/mol-math/linear-algebra'
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
 * on the nearest visible copy of each labelled residue, a leader, and the
 * label in a box of the highlight's color, placed apart by placeLabels. Mol*'s
 * own text is depth-tested, sized in Å and never moves off another label. The
 * residues are projected again on every frame Mol* draws.
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
    let molstar: Awaited<ReturnType<typeof loadMolstar>> | undefined
    let cancelled = false
    // the chains whose copy Mol* last saw unoccluded, by anchor ref
    let visible = new Map<string, Set<number>>()
    const projected = [0, 0, 0, 0] as unknown as Vec4
    const copiesOnScreen = () => {
      const { camera } = canvas3d
      const pixelRatio = canvas3d.webgl.pixelRatio
      const height = camera.viewport.height / pixelRatio
      return [...labelAnchors(plugin)].map(([ref, anchor]) => {
        const loci = (
          plugin.state.data.cells.get(ref)?.obj?.data as
            { loci: StructureElement.Loci }[] | undefined
        )?.[0]?.loci
        const copies = (loci && molstar ? copyCenters(molstar, loci) : []).map(
          ({ chain, center }) => {
            camera.project(projected, center)
            return {
              chain,
              x: projected[0]! / pixelRatio,
              y: height - projected[1]! / pixelRatio,
              depth: projected[2]!,
              visible: visible.get(ref)?.has(chain),
            }
          },
        )
        return { ref, ...anchor, copies }
      })
    }
    const place = () => {
      const { camera } = canvas3d
      const pixelRatio = canvas3d.webgl.pixelRatio
      const width = camera.viewport.width / pixelRatio
      const height = camera.viewport.height / pixelRatio
      const points = []
      for (const { ref, label, color, copies } of copiesOnScreen()) {
        const nearest = nearestInFront(copies)
        if (nearest) {
          points.push({
            ref,
            label,
            color,
            x: nearest.x,
            y: nearest.y,
            width: textWidth(label) + PAD_X * 2,
          })
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
    // Once the view settles, ask Mol*'s picking which copies show at their
    // own centre: the nearest copy of haemoglobin's Val6 can sit behind
    // another chain, and a label there points at cartoon
    const findVisible = () => {
      const next = new Map<string, Set<number>>()
      for (const { ref, labelSeqIds, copies } of copiesOnScreen()) {
        const seen = new Set<number>()
        for (const { chain, x, y, depth } of copies) {
          const pick =
            depth > 0 && depth < 1
              ? canvas3d.identify([x, y] as unknown as Vec2)
              : undefined
          const { loci } = pick ? canvas3d.getLoci(pick.id) : {}
          if (molstar && pickHitsCopy(molstar, loci, chain, labelSeqIds)) {
            seen.add(chain)
          }
        }
        next.set(ref, seen)
      }
      const key = (m: Map<string, Set<number>>) =>
        JSON.stringify([...m].map(([ref, chains]) => [ref, [...chains]]))
      if (key(next) !== key(visible)) {
        visible = next
        place()
      }
    }
    let settle: ReturnType<typeof setTimeout> | undefined
    const onDraw = () => {
      place()
      clearTimeout(settle)
      settle = setTimeout(findVisible, 250)
    }
    loadMolstar()
      .then(loaded => {
        if (!cancelled) {
          molstar = loaded
          onDraw()
        }
      })
      .catch((e: unknown) => {
        console.error(e)
      })
    const subscription = canvas3d.didDraw.subscribe(onDraw)
    return () => {
      cancelled = true
      clearTimeout(settle)
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
          <g key={ref} data-highlight-label={label}>
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

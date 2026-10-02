import { useId } from 'react'

import { observer } from 'mobx-react'

import type { GraphPaneModel } from '../model'

// The session's genes drawn onto the graph: each exon outlined in the gene
// track's CDS colour, a rounded box around the backbone stretch that carries
// it, in layout units, moved by the same transform the halos use. The box
// clears the node's ink, lifted lanes included, so a node or lane keeps its
// colour inside it and an exon on a faded node reads as well as one on a lane.
// Their names are LabelLayer's.

const svgStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  pointerEvents: 'none' as const,
  overflow: 'hidden' as const,
  zIndex: 2,
}

export const EXON_COLOR = '#daa520'
// a lifted walk's lane at the least, as the geometry draws it
const MIN_LANE_PX = 4
const EXON_GAP_PX = 1
const EXON_LINE_PX = 2

const GenePins = observer(function GenePins({
  model,
}: {
  model: GraphPaneModel
}) {
  const maskId = `exon-outline-${useId().replaceAll(/[^\w-]/g, '')}`
  const { genePins, walkLift, nodeInk } = model
  if (genePins.length === 0) {
    return null
  }
  const {
    scaleX,
    scaleY,
    translateX,
    translateY,
    paneWidth: width,
    canvasHeight,
  } = model
  const inkPx = (nodeId: string) => {
    const own = nodeInk.halfWidthPx(nodeId) * 2
    return walkLift?.nodeIds.has(nodeId)
      ? Math.max(own, walkLift.walks.length * MIN_LANE_PX)
      : own
  }
  const stretches = genePins.flatMap(pin =>
    pin.exonsByNode.map(({ nodeId, d }) => ({
      key: `${pin.gene.name}-${pin.gene.start}-${nodeId}`,
      d,
      inner: inkPx(nodeId) + 2 * EXON_GAP_PX,
    })),
  )
  const transform = `translate(${translateX} ${translateY}) scale(${scaleX} ${scaleY})`
  const stroke = {
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    vectorEffect: 'non-scaling-stroke',
  }
  return (
    <svg
      style={svgStyle}
      width={width}
      height={canvasHeight}
      data-testid="graph-gene-pins"
    >
      <mask
        id={maskId}
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={width}
        height={canvasHeight}
      >
        <g transform={transform}>
          {stretches.map(s => (
            <path
              key={s.key}
              d={s.d}
              stroke="#fff"
              strokeWidth={s.inner + 2 * EXON_LINE_PX}
              {...stroke}
            />
          ))}
          {stretches.map(s => (
            <path
              key={s.key}
              d={s.d}
              stroke="#000"
              strokeWidth={s.inner}
              {...stroke}
            />
          ))}
        </g>
      </mask>
      <rect
        width={width}
        height={canvasHeight}
        fill={EXON_COLOR}
        mask={`url(#${maskId})`}
      />
    </svg>
  )
})

export default GenePins

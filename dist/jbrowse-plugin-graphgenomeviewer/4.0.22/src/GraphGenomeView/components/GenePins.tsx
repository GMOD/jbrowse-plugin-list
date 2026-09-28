import { observer } from 'mobx-react'

import type { GraphPaneModel } from '../model'

// The session's genes drawn onto the graph: exons as dark stretches along the
// backbone nodes that carry them, in layout units, moved by the same transform
// the halos use. Their names are LabelLayer's. Over lifted walks an exon is a
// faint band across all the lanes, so no lane reads as broken by it.

const svgStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  pointerEvents: 'none' as const,
  overflow: 'hidden' as const,
  zIndex: 2,
}

export const EXON_COLOR = '#1c1c22'
// a lane's width at the least, for the band an exon draws across them
const EXON_BAND_LANE_PX = 4

const GenePins = observer(function GenePins({
  model,
}: {
  model: GraphPaneModel
}) {
  const { genePins, walkLift } = model
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
    contigThickness,
  } = model
  return (
    <svg
      style={svgStyle}
      width={width}
      height={canvasHeight}
      data-testid="graph-gene-pins"
    >
      <g
        transform={`translate(${translateX} ${translateY}) scale(${scaleX} ${scaleY})`}
      >
        {genePins.map(pin =>
          pin.exons ? (
            <path
              key={`${pin.gene.name}-${pin.gene.start}`}
              d={pin.exons}
              fill="none"
              stroke={EXON_COLOR}
              strokeOpacity={walkLift ? 0.2 : 0.9}
              strokeWidth={
                walkLift
                  ? walkLift.walks.length * EXON_BAND_LANE_PX + 6
                  : contigThickness * 0.55
              }
              strokeLinecap={walkLift ? 'butt' : 'round'}
              vectorEffect="non-scaling-stroke"
            />
          ) : null,
        )}
      </g>
    </svg>
  )
})

export default GenePins

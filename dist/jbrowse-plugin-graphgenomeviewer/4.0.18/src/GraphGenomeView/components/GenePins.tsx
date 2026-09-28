import { observer } from 'mobx-react'

import type { GraphPaneModel } from '../model'

// The session's genes drawn onto the graph: exons as dark stretches along the
// backbone nodes that carry them, in layout units, moved by the same transform
// the halos use. Their names are LabelLayer's.

const svgStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  pointerEvents: 'none' as const,
  overflow: 'hidden' as const,
  zIndex: 2,
}

export const EXON_COLOR = '#1c1c22'

const GenePins = observer(function GenePins({
  model,
}: {
  model: GraphPaneModel
}) {
  const { genePins } = model
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
              strokeOpacity={0.9}
              strokeWidth={contigThickness * 0.55}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ) : null,
        )}
      </g>
    </svg>
  )
})

export default GenePins

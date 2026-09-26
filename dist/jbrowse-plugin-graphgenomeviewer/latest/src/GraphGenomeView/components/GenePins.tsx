import { observer } from 'mobx-react'

import LabelChip from './LabelChip'
import { LABEL_PX, placeLabels } from './overlayLabels'

import type { GraphGenomeViewModel } from '../model'

// The session's genes drawn onto the graph: exons as dark stretches along the
// backbone nodes that carry them, and each gene's name pinned under the
// backbone at its midpoint. Drawn once in layout units and moved by the same
// transform the halos use; the labels sit below the line where the halo
// labels sit above it.

const svgStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  pointerEvents: 'none' as const,
  overflow: 'hidden' as const,
  zIndex: 3,
}

const EXON_COLOR = '#1c1c22'

const GenePins = observer(function GenePins({
  model,
}: {
  model: GraphGenomeViewModel
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
    width,
    canvasHeight,
    contigThickness,
  } = model
  const labels = placeLabels(
    [...genePins]
      .sort((a, b) => b.gene.end - b.gene.start - (a.gene.end - a.gene.start))
      .map(pin => ({
        item: pin,
        x: pin.at.x * scaleX + translateX,
        y: pin.at.y * scaleY + translateY + contigThickness + 18,
        text: pin.covered < 0.98 ? `${pin.gene.name} …` : pin.gene.name,
      })),
    { width, height: canvasHeight },
  )

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
      {labels.map(({ item: pin, x, y, w, text }) => (
        <g key={`${pin.gene.name}-${pin.gene.start}-label`}>
          <line
            x1={x}
            x2={x}
            y1={y - LABEL_PX - 2}
            y2={pin.at.y * scaleY + translateY + contigThickness / 2}
            stroke={EXON_COLOR}
            strokeWidth={0.8}
            strokeOpacity={0.6}
          />
          <LabelChip
            x={x}
            y={y}
            w={w}
            text={text}
            color={EXON_COLOR}
            italic
            title={`${pin.gene.name} ${pin.gene.refName}:${pin.gene.start.toLocaleString()}-${pin.gene.end.toLocaleString()}${pin.covered < 0.98 ? ', runs past the cut' : ''}`}
            testId="graph-gene-pin-label"
          />
        </g>
      ))}
    </svg>
  )
})

export default GenePins

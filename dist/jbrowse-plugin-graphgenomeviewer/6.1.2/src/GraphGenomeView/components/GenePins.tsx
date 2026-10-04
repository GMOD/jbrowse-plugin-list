import { useId } from 'react'

import {
  exonOutlineTree,
  exonStretches,
} from '@jbrowse/bandage-core/genes/exonOutline'
import { observer } from 'mobx-react'

import ElTree from './ElTree'

import type { GraphPaneModel } from '../model'

// The session's genes drawn onto the graph: each exon outlined round its
// stretch of node, as core's exonOutlineTree draws it for every host, moved by
// the same transform the halos use. Their names are LabelLayer's.

const svgStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  pointerEvents: 'none' as const,
  overflow: 'hidden' as const,
  zIndex: 2,
}

export { EXON_COLOR } from '@jbrowse/bandage-core/genes/exonOutline'

const GenePins = observer(function GenePins({
  model,
}: {
  model: GraphPaneModel
}) {
  const id = `exon-outline-${useId().replaceAll(/[^\w-]/g, '')}`
  const { genePins, walkLift, nodeInk } = model
  const { scaleX, scaleY, translateX, translateY, paneWidth, canvasHeight } =
    model
  const tree = exonOutlineTree(
    exonStretches(genePins, nodeInk.halfWidthPx, walkLift),
    {
      id,
      width: paneWidth,
      height: canvasHeight,
      transform: `translate(${translateX} ${translateY}) scale(${scaleX} ${scaleY})`,
    },
  )
  return tree ? (
    <svg
      style={svgStyle}
      width={paneWidth}
      height={canvasHeight}
      data-testid="graph-gene-pins"
    >
      <ElTree el={tree} />
    </svg>
  ) : null
})

export default GenePins

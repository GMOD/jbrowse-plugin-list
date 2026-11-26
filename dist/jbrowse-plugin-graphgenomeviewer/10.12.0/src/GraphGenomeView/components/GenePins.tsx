import { exonOutlineTree } from '@jbrowse/bandage-core/genes/exonOutline'
import { observer } from 'mobx-react'

import ElTree, { PANE_TRANSFORM, useSvgId } from './ElTree'
import { PaneSvgLayer } from './PaneLayer'

import type { GraphPaneModel } from '../model'

// The session's genes drawn onto the graph: each exon outlined round its
// stretch of node, as core's exonOutlineTree draws it for every host, moved by
// the same transform the halos use. Their names are LabelLayer's.

const GenePins = observer(function GenePins({
  model,
}: {
  model: GraphPaneModel
}) {
  const id = `exon-outline-${useSvgId()}`
  const tree = exonOutlineTree(model.exonOutlines, {
    id,
    width: model.paneWidth,
    height: model.canvasHeight,
    transform: PANE_TRANSFORM,
  })
  return tree ? (
    <PaneSvgLayer model={model} zIndex={2} testId="graph-gene-pins">
      <ElTree el={tree} pane={model} />
    </PaneSvgLayer>
  ) : null
})

export default GenePins

import { renderDisplaySvg } from '@jbrowse/display-kit/renderDisplaySvg'

import PaneSvg from '../GraphGenomeView/components/PaneSvg'

import type { LinearGraphDisplayModel } from './model'
import type { LgvSvgBodyProps } from '@jbrowse/display-kit/renderDisplaySvg'
import type { ExportSvgDisplayOptions } from '@jbrowse/display-kit/types'

function GraphTrackSvgBody({
  model,
  opts,
}: LgvSvgBodyProps<LinearGraphDisplayModel>) {
  return (
    <PaneSvg
      model={model}
      rasterize={!!opts?.rasterizeLayers}
      idPrefix={`graph-${model.id}`}
    />
  )
}

export function renderGraphTrackSvg(
  model: LinearGraphDisplayModel,
  opts?: ExportSvgDisplayOptions,
) {
  return renderDisplaySvg(model, opts, GraphTrackSvgBody)
}

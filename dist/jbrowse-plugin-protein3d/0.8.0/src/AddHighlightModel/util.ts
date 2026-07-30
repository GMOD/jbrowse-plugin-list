import { getSession } from '@jbrowse/core/util'
import { makeStyles } from 'tss-react/mui'

import type { JBrowsePluginProteinViewModel } from '../ProteinView/model'
import type { AbstractSessionModel } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

// Region shape shared by every highlight source, matching core's
// HoverHighlightPosition (jbrowse >4.3.0) so callers can move to the shared
// components with no prop changes once the minimum jbrowse version provides them
export interface HighlightRegion {
  refName: string
  start: number
  end: number
  assemblyName?: string
}

// Local mirror of core's getLayoutHighlightCoords / model.getHighlightCoords,
// added to jbrowse after 4.3.0. Kept here so the plugin still builds against
// 4.3.0; once the minimum jbrowse version ships the model method, replace the
// body with `model.getHighlightCoords(region)`.
export function getHighlightCoords(
  model: LinearGenomeViewModel,
  region: HighlightRegion,
) {
  const { assemblyManager } = getSession(model)
  const assembly = region.assemblyName
    ? assemblyManager.get(region.assemblyName)
    : undefined
  const refName =
    assembly?.getCanonicalRefName(region.refName) ?? region.refName
  const s = model.bpToPx({ refName, coord: region.start })
  const e = model.bpToPx({ refName, coord: region.end })
  return s && e
    ? {
        width: Math.max(Math.abs(e.offsetPx - s.offsetPx), 3),
        left: Math.min(s.offsetPx, e.offsetPx) - model.offsetPx,
      }
    : undefined
}

export const useStyles = makeStyles()({
  highlight: {
    height: '100%',
    background: 'rgba(255,255,0,0.2)',
    border: '1px solid rgba(50,50,0,0.2)',
    position: 'absolute',
    zIndex: 99,
    textAlign: 'center',
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  thinborder: {
    border: '1px solid black',
  },
})

export function getProteinView(
  session: AbstractSessionModel,
): JBrowsePluginProteinViewModel | undefined {
  const view = session.views.find(v => v.type === 'ProteinView')
  return view as JBrowsePluginProteinViewModel | undefined
}

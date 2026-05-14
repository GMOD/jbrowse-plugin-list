import { makeStyles } from 'tss-react/mui'

import type { JBrowsePluginProteinViewModel } from '../ProteinView/model'
import type { AbstractSessionModel } from '@jbrowse/core/util'

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

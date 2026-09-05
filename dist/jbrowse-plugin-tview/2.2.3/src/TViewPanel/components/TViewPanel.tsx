import React from 'react'

import { observer } from 'mobx-react'
import { MSAView } from 'react-msaview'

import type { JBrowsePluginTViewModel } from '../model'
import type { MsaViewModel } from 'react-msaview'

const TViewPanel = observer(function TViewPanel2({
  model,
}: {
  model: JBrowsePluginTViewModel
}) {
  // react-msaview types its model prop with type: 'MsaView' baked in, but a
  // JBrowse view model's `type` must equal its registered view type name. That
  // literal is the only difference, and the MSA renderer never reads it.
  return <MSAView model={model as unknown as MsaViewModel} />
})

export default TViewPanel

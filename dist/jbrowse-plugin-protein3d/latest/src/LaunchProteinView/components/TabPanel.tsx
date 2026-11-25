import React, { useState } from 'react'

import { observer } from 'mobx-react'

/** The ids that tie a tab to its panel, for a screen reader to follow */
export function tabA11yProps(idPrefix: string, index: number) {
  return {
    id: `${idPrefix}-tab-${index}`,
    'aria-controls': `${idPrefix}-panel-${index}`,
  }
}

// A panel mounts the first time its tab is selected and stays mounted after,
// hidden via the `hidden` attribute. Mounting lazily keeps a tab's fetches
// (PDBe, AlphaFold, molstar parsing) from firing for a tab nobody opened;
// staying mounted preserves its in-progress work across tab switches.
const TabPanel = observer(function TabPanel({
  children,
  value,
  index,
  idPrefix,
}: {
  children?: React.ReactNode
  index: number
  value: number
  idPrefix: string
}) {
  const active = value === index
  const [visited, setVisited] = useState(active)
  if (active && !visited) {
    setVisited(true)
  }
  const { id, 'aria-controls': panelId } = tabA11yProps(idPrefix, index)
  return (
    <div role="tabpanel" hidden={!active} id={panelId} aria-labelledby={id}>
      {visited ? children : null}
    </div>
  )
})

export default TabPanel

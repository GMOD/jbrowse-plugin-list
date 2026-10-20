import React, { useState } from 'react'

// A panel mounts the first time its tab is selected and stays mounted after,
// hidden via the `hidden` attribute. Mounting lazily keeps a tab's fetches
// (PDBe, AlphaFold, molstar parsing) from firing for a tab nobody opened;
// staying mounted preserves its in-progress work across tab switches.
export default function TabPanel({
  children,
  value,
  index,
  ...other
}: {
  children?: React.ReactNode
  index: number
  value: number
}) {
  const active = value === index
  const [visited, setVisited] = useState(active)
  if (active && !visited) {
    setVisited(true)
  }
  return (
    <div role="tabpanel" hidden={!active} {...other}>
      {visited ? children : null}
    </div>
  )
}

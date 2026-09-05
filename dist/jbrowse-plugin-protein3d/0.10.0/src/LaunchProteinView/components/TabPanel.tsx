import React from 'react'

// Panels stay mounted and are hidden via the `hidden` attribute rather than
// unmounted, so switching tabs preserves each tab's in-progress work (typed
// UniProt ID, fetched results, selected transcript) instead of resetting it.
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
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {children}
    </div>
  )
}

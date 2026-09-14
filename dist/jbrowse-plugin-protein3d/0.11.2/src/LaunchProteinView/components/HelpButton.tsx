import React, { Suspense, lazy, useState } from 'react'

import Help from '@mui/icons-material/Help'
import { IconButton } from '@mui/material'
// icons

// lazies
const HelpDialog = lazy(() => import('./HelpDialog'))

export default function HelpButton() {
  const [show, setShow] = useState(false)
  return (
    <>
      <IconButton
        onClick={() => {
          setShow(true)
        }}
      >
        <Help />
      </IconButton>
      {show ? (
        <Suspense fallback={null}>
          <HelpDialog
            handleClose={() => {
              setShow(false)
            }}
          />
        </Suspense>
      ) : null}
    </>
  )
}

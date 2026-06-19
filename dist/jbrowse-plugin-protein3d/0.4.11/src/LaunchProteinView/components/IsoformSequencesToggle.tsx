import React, { useState } from 'react'

import { Button } from '@mui/material'

import MSATable from './MSATable'

import type { Feature } from '@jbrowse/core/util'

export default function IsoformSequencesToggle({
  structureSequence,
  structureName,
  isoformSequences,
}: {
  structureSequence: string
  structureName: string
  isoformSequences: Record<string, { feature: Feature; seq: string }>
}) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ margin: 10 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setShow(!show)
        }}
      >
        {show
          ? 'Hide all isoform protein sequences'
          : 'Show all isoform protein sequences'}
      </Button>
      {show ? (
        <MSATable
          structureSequence={structureSequence}
          structureName={structureName}
          isoformSequences={isoformSequences}
        />
      ) : null}
    </div>
  )
}

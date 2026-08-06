import React, { useState } from 'react'

import { Button } from '@mui/material'

import MSATable from './MSATable'

import type { IsoformSequences } from '../utils/util'

export default function IsoformSequencesToggle({
  structureSequence,
  structureName,
  isoformSequences,
}: {
  structureSequence: string
  structureName: string
  isoformSequences: IsoformSequences
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

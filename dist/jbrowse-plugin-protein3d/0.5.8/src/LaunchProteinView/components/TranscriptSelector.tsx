import React from 'react'

import { MenuItem, TextField } from '@mui/material'

import {
  classifyIsoforms,
  getGeneDisplayName,
  getTranscriptDisplayName,
} from '../utils/util'

import type { IsoformSequences, RankedIsoform } from '../utils/util'
import type { Feature } from '@jbrowse/core/util'

export default function TranscriptSelector({
  val,
  setVal,
  isoforms,
  isoformSequences,
  structureSequence,
  feature,
  disabled,
}: {
  isoforms: Feature[]
  feature: Feature
  val: string | undefined
  setVal: (str: string) => void
  structureSequence?: string
  isoformSequences: IsoformSequences
  disabled?: boolean
}) {
  const geneName = getGeneDisplayName(feature)
  const { matches, nonMatches, noData } = classifyIsoforms({
    options: isoforms,
    isoformSequences,
    structureSequence,
  })

  const renderOption = ({ feature: f, length }: RankedIsoform, note = '') => (
    <MenuItem value={f.id()} key={f.id()}>
      {geneName} - {getTranscriptDisplayName(f)} ({length}aa){note}
    </MenuItem>
  )

  return (
    <TextField
      value={val ?? ''}
      onChange={event => {
        setVal(event.target.value)
      }}
      label="Choose transcript isoform"
      select
      disabled={disabled}
    >
      {matches.map(m => renderOption(m, ' (matches structure residues)'))}
      {nonMatches.map(m => renderOption(m))}
      {noData.map(f => (
        <MenuItem value={f.id()} key={f.id()} disabled>
          {geneName} - {getTranscriptDisplayName(f)} (no data)
        </MenuItem>
      ))}
    </TextField>
  )
}

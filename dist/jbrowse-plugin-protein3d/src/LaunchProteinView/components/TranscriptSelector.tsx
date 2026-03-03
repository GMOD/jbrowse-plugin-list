import React from 'react'

import { Feature } from '@jbrowse/core/util'
import { MenuItem, TextField } from '@mui/material'

import {
  getGeneDisplayName,
  getTranscriptDisplayName,
  stripStopCodon,
} from '../utils/util'

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
  val: string
  setVal: (str: string) => void
  structureSequence?: string
  isoformSequences: Record<string, { feature: Feature; seq: string }>
  disabled?: boolean
}) {
  const geneName = getGeneDisplayName(feature)
  const matches: Feature[] = []
  const nonMatches: Feature[] = []
  const noData: Feature[] = []

  for (const f of isoforms) {
    const entry = isoformSequences[f.id()]
    if (!entry) {
      noData.push(f)
    } else if (
      structureSequence &&
      stripStopCodon(entry.seq) === structureSequence
    ) {
      matches.push(f)
    } else {
      nonMatches.push(f)
    }
  }

  matches.sort(
    (a, b) =>
      isoformSequences[b.id()]!.seq.length -
      isoformSequences[a.id()]!.seq.length,
  )
  nonMatches.sort(
    (a, b) =>
      isoformSequences[b.id()]!.seq.length -
      isoformSequences[a.id()]!.seq.length,
  )

  return (
    <TextField
      value={val}
      onChange={event => {
        setVal(event.target.value)
      }}
      label="Choose transcript isoform"
      select
      disabled={disabled}
    >
      {matches.map(f => (
        <MenuItem value={f.id()} key={f.id()}>
          {geneName} - {getTranscriptDisplayName(f)} (
          {isoformSequences[f.id()]!.seq.length}aa) (matches structure residues)
        </MenuItem>
      ))}
      {nonMatches.map(f => (
        <MenuItem value={f.id()} key={f.id()}>
          {geneName} - {getTranscriptDisplayName(f)} (
          {isoformSequences[f.id()]!.seq.length}aa)
        </MenuItem>
      ))}
      {noData.map(f => (
        <MenuItem value={f.id()} key={f.id()} disabled>
          {geneName} - {getTranscriptDisplayName(f)} (no data)
        </MenuItem>
      ))}
    </TextField>
  )
}

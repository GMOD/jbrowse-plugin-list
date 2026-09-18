import React from 'react'

import { MenuItem, TextField } from '@mui/material'
import { classifyIsoforms, stripStopCodon } from 'p2s_mapper'

import {
  getGeneDisplayName,
  getTranscriptDisplayName,
  rankableIsoforms,
} from '../utils/util'

import type { IsoformSequences } from '../utils/util'
import type { Feature } from '@jbrowse/core/util'
import type { RankedIsoform } from 'p2s_mapper'

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
  const byId = new Map(isoforms.map(f => [f.id(), f]))
  // A ranked isoform carries an id rather than the feature, so the name is a
  // lookup, and a row with no name at all reads worse than a bare id.
  const nameOf = (id: string) => getTranscriptDisplayName(byId.get(id)) || id
  const { matches, nonMatches, noData } = classifyIsoforms({
    isoforms: rankableIsoforms(isoforms, isoformSequences),
    structureSequence,
  })

  const structureLength = structureSequence
    ? stripStopCodon(structureSequence).length
    : undefined
  const renderOption = (
    { id, length, identical }: RankedIsoform,
    note = identical === undefined
      ? ''
      : ` (${identical}/${structureLength} structure residues identical)`,
  ) => (
    <MenuItem value={id} key={id}>
      {geneName} - {nameOf(id)} ({length}aa){note}
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
      {noData.map(id => (
        <MenuItem value={id} key={id} disabled>
          {geneName} - {nameOf(id)} (no data)
        </MenuItem>
      ))}
    </TextField>
  )
}

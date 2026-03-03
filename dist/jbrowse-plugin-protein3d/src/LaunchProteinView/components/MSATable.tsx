import React, { useState } from 'react'

import { Feature, max } from '@jbrowse/core/util'
import { TextField } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import Checkbox2 from './Checkbox2'
import { getTranscriptDisplayName, stripStopCodon } from '../utils/util'

const useStyles = makeStyles()({
  textAreaFont: {
    fontFamily: 'Courier New',
    whiteSpace: 'pre',
  },
})

export default function MSATable({
  structureName,
  structureSequence,
  isoformSequences,
}: {
  structureName: string
  structureSequence: string
  isoformSequences: Record<string, { feature: Feature; seq: string }>
}) {
  const { classes } = useStyles()
  const [showInFastaFormat, setShowInFastaFormat] = useState(false)
  const removedStars = Object.fromEntries(
    Object.entries(isoformSequences).map(([key, val]) => [
      key,
      { ...val, seq: stripStopCodon(val.seq) },
    ]),
  )
  const exactMatchIsoformAndStructureSeq = Object.entries(removedStars).find(
    ([_, val]) => structureSequence === val.seq,
  )
  const sname = `${structureName || ''} (structure residues)`
  const maxKeyLen = max([
    sname.length,
    ...Object.entries(removedStars).map(
      ([_, val]) => getTranscriptDisplayName(val.feature).length,
    ),
  ])

  return (
    <>
      <Checkbox2
        onChange={event => {
          setShowInFastaFormat(event.target.checked)
        }}
        label="Show in FASTA format?"
        checked={showInFastaFormat}
      />
      <TextField
        variant="outlined"
        multiline
        minRows={5}
        maxRows={10}
        fullWidth
        value={
          showInFastaFormat
            ? [
                `>${sname}\n${structureSequence}`,
                ...Object.values(removedStars).map(
                  ({ feature, seq }) =>
                    `>${getTranscriptDisplayName(feature)}\n${seq}`,
                ),
              ].join('\n')
            : [
                `${sname.padEnd(maxKeyLen)}${exactMatchIsoformAndStructureSeq ? '*' : ' '} ${structureSequence}`,
                exactMatchIsoformAndStructureSeq
                  ? `${getTranscriptDisplayName(exactMatchIsoformAndStructureSeq[1].feature).padEnd(maxKeyLen)}* ${exactMatchIsoformAndStructureSeq[1].seq}`
                  : undefined,
                ...Object.entries(removedStars)
                  .map(
                    ([_, val]) =>
                      `${getTranscriptDisplayName(val.feature).padEnd(maxKeyLen)}  ${val.seq}`,
                  )
                  .filter(([k]) => k !== exactMatchIsoformAndStructureSeq?.[0]),
              ]
                .filter(f => !!f)
                .join('\n')
        }
        slotProps={{
          input: {
            readOnly: true,
            classes: {
              input: classes.textAreaFont,
            },
          },
        }}
      />
    </>
  )
}

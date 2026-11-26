import React from 'react'

import { Dialog } from '@jbrowse/core/ui'
import { Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { observer } from 'mobx-react'

import type { TypographyProps } from '@mui/material'

const Typography2 = observer(function Typography2({
  children,
}: TypographyProps) {
  return (
    <Typography
      style={{
        margin: 4,
        marginBottom: 12,
      }}
    >
      {children}
    </Typography>
  )
})
const ProteinAlignmentHelpDialog = observer(
  function ProteinAlignmentHelpDialog({
    handleClose,
  }: {
    handleClose: () => void
  }) {
    return (
      <Dialog
        open
        maxWidth="lg"
        onClose={handleClose}
        title="Protein alignment"
      >
        <DialogContent>
          <Typography2>
            The panel aligns the protein the genome&apos;s transcript translates
            to the sequence the structure file spells, which can differ. The
            alignment runs in the browser: Smith-Waterman with BLOSUM62 and
            EMBOSS-style gap penalties, or Needleman-Wunsch when the view was
            launched with <code>alignmentAlgorithm</code> set to it. A residue
            that falls in a gap is unmapped and does not highlight. An alignment
            always returns something, so a low-similarity warning on the
            structure&apos;s header row means the mapping may be chance: check
            the chain picker or the transcript isoform first.
          </Typography2>
          <Typography2>
            A structure opened without a transcript shows its own protein chain:
            there is no GENOME row, and a click selects in 3D only.
          </Typography2>
          <ul style={{ margin: 4, paddingLeft: 20 }}>
            <li>
              <strong>GENOME</strong> is the transcript&apos;s translation;{' '}
              <strong>STRUCT</strong> is the structure file&apos;s sequence,
              shaded amber where it differs by a similar amino acid and red
              where it differs by a dissimilar one.
            </li>
            <li>
              <strong>residue</strong> counts the way the structure&apos;s
              authors numbered it, as papers do: p53&apos;s R248 is 248 in 1TUP,
              whose fragment starts at 94.
            </li>
            <li>
              Below them, rows <strong>from the alignment</strong> are domains
              and sites a connected multiple alignment draws, then UniProt
              features, <strong>pLDDT</strong> (AlphaFold&apos;s confidence) and{' '}
              <strong>hydro</strong> (Kyte-Doolittle hydrophobicity). Click a
              bar to select its residues.
            </li>
            <li>
              <strong>×</strong> hides a feature track, which the view
              menu&apos;s Restore hidden feature tracks brings back; the expand
              button beside it lays overlapping features on rows of their own.
            </li>
            <li>
              Bands across the rows: pink is the hovered residue, orange a
              hovered bar&apos;s residues, magenta the selection, and green the
              residues aligned to the transcript while that highlight is on.
            </li>
            <li>
              Click a residue to select it and move the genome view to its
              codon; hover one to light it in the 3D view.
            </li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleClose()
            }}
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  },
)

export default ProteinAlignmentHelpDialog

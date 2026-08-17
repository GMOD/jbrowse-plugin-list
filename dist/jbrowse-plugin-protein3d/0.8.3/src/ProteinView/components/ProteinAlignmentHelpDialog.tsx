import React from 'react'

import { Dialog } from '@jbrowse/core/ui'
import { Button, DialogActions, DialogContent, Typography } from '@mui/material'

import type { TypographyProps } from '@mui/material'

function Typography2({ children }: TypographyProps) {
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
}
export default function ProteinAlignmentHelpDialog({
  handleClose,
}: {
  handleClose: () => void
}) {
  return (
    <Dialog open maxWidth="lg" onClose={handleClose} title="Protein alignment">
      <DialogContent>
        <Typography2>
          This panel shows the computed pairwise alignment of the reference
          genome sequence to the structure sequence. The structure file (PDB
          file, mmCIF file, etc) has a stored representation of the e.g. amino
          acid sequence but the sequence in the structure file can differ from
          the sequence from the gene on the genome browser
        </Typography2>
        <Typography2>
          In order to resolve this, we align the two sequences together (using
          EMBOSS needle) to get pairwise alignment of the genome&apos;s
          representation of the protein and the structure file&apos;s
          representation of the protein.
        </Typography2>
        <Typography2>
          If you need a 100% fidelity protein, you can do a folding with e.g.
          AlphaFold to make sure the structure you are using matches exactly the
          sequence of the transcript
        </Typography2>
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
}

import React from 'react'

import { Dialog } from '@jbrowse/core/ui'
import {
  Button,
  DialogActions,
  DialogContent,
  Divider,
  Typography,
} from '@mui/material'

import ExternalLink from '../../components/ExternalLink'

const ISSUES_URL = 'https://github.com/GMOD/jbrowse-plugin-protein3d/issues'

export default function HelpDialog({
  handleClose,
}: {
  handleClose: () => void
}) {
  return (
    <Dialog open maxWidth="lg" onClose={handleClose} title="Help">
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Each tab finds a structure a different way. All of them end in the
          same place: the plugin aligns the structure's residues to the protein
          sequence it translates from the transcript you pick, and that
          alignment maps genome coordinates onto positions in the 3D view.
        </Typography>
        <Typography component="div">
          <ul>
            <li>
              <b>AlphaFoldDB search</b> resolves the feature to a UniProt
              accession — from its own identifiers, or one you type — and opens
              AlphaFold&apos;s predicted model for it.
            </li>
            <li>
              <b>PDB search</b> lists the experimental structures PDBe maps to
              that accession, ranked on coverage and resolution. A crystal is
              usually one domain, often with binding partners, so the view picks
              the chain the transcript belongs to once the structure loads.
            </li>
            <li>
              <b>Foldseek search</b> sends the protein sequence to the
              foldseek.com servers and lists structures similar in shape,
              including ones with little sequence similarity.
            </li>
            <li>
              <b>File or URL</b> opens a structure you already have — the output
              of ColabFold or another modelling tool, or any PDB/mmCIF file
              reachable by URL.
            </li>
          </ul>
        </Typography>
        <Typography sx={{ mb: 2 }}>
          The isoform list marks which transcripts match the structure&apos;s
          residues exactly, and counts identical residues for the rest. You do
          not need an exact match; the alignment absorbs the differences between
          the two representations.
        </Typography>
        <Typography>
          If a gene will not resolve, or something looks wrong, please open an
          issue at{' '}
          <ExternalLink href={ISSUES_URL}>
            github.com/GMOD/jbrowse-plugin-protein3d
          </ExternalLink>
          .
        </Typography>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

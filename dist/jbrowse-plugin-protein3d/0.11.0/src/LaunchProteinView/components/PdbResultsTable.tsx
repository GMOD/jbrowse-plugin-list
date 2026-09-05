import React from 'react'

import {
  Paper,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import ExternalLink from '../../components/ExternalLink'
import { rcsbEntryUrl } from '../services/pdbeBestStructures'

import type { PdbStructureEntry } from '../services/pdbeBestStructures'

const useStyles = makeStyles()(theme => ({
  tableContainer: {
    maxHeight: 300,
  },
  headerCell: {
    fontWeight: 'bold',
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.grey[900]
        : theme.palette.grey[100],
  },
  selectedRow: {
    backgroundColor: theme.palette.action.selected,
  },
  clickableRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))

const MAX_ROWS = 100

export default function PdbResultsTable({
  entries,
  selectedPdbId,
  onSelect,
}: {
  entries: PdbStructureEntry[]
  selectedPdbId?: string
  onSelect: (pdbId: string) => void
}) {
  const { classes } = useStyles()
  const shown = entries.slice(0, MAX_ROWS)
  return (
    <>
      <Typography variant="body2" color="textSecondary">
        {entries.length} PDB entries, ranked by PDBe on coverage and resolution
        {entries.length > shown.length
          ? ` (showing the first ${MAX_ROWS})`
          : ''}
      </Typography>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table size="small" stickyHeader data-testid="pdb-results-table">
          <TableHead>
            <TableRow>
              <TableCell className={classes.headerCell} padding="checkbox" />
              <TableCell className={classes.headerCell}>PDB ID</TableCell>
              <TableCell className={classes.headerCell}>Method</TableCell>
              <TableCell className={classes.headerCell}>Resolution</TableCell>
              <TableCell className={classes.headerCell}>
                UniProt residues
              </TableCell>
              <TableCell className={classes.headerCell}>Coverage</TableCell>
              <TableCell className={classes.headerCell}>Chains</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.map(entry => {
              const selected = entry.pdbId === selectedPdbId
              return (
                <TableRow
                  key={entry.pdbId}
                  className={`${classes.clickableRow} ${selected ? classes.selectedRow : ''}`}
                  onClick={() => {
                    onSelect(entry.pdbId)
                  }}
                >
                  <TableCell padding="checkbox">
                    <Radio checked={selected} size="small" />
                  </TableCell>
                  <TableCell>
                    <ExternalLink href={rcsbEntryUrl(entry.pdbId)}>
                      {entry.pdbId.toUpperCase()}
                    </ExternalLink>
                  </TableCell>
                  <TableCell>{entry.experimentalMethod}</TableCell>
                  <TableCell>
                    {entry.resolution === undefined
                      ? '-'
                      : `${entry.resolution.toFixed(2)} Å`}
                  </TableCell>
                  <TableCell>
                    {entry.unpStart}-{entry.unpEnd}
                  </TableCell>
                  <TableCell>{(entry.coverage * 100).toFixed(0)}%</TableCell>
                  <TableCell>{entry.chains.join(', ')}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

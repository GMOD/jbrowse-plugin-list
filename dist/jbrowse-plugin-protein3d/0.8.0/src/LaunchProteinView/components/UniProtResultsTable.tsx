import React from 'react'

import {
  Chip,
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

import type { UniProtEntry } from '../services/lookupMethods'

const useStyles = makeStyles()(theme => ({
  tableContainer: {
    maxHeight: 200,
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
  reviewedChip: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    fontSize: '0.7rem',
    height: 20,
  },
  unreviewedChip: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
    fontSize: '0.7rem',
    height: 20,
  },
}))

interface UniProtResultsTableProps {
  entries: UniProtEntry[]
  selectedAccession?: string
  onSelect: (accession: string) => void
}

export default function UniProtResultsTable({
  entries,
  selectedAccession,
  onSelect,
}: UniProtResultsTableProps) {
  const { classes, cx } = useStyles()

  return entries.length === 0 ? null : (
    <div>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Found {entries.length} UniProt entries. Select one:
      </Typography>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className={classes.headerCell} padding="checkbox" />
              <TableCell className={classes.headerCell}>Accession</TableCell>
              <TableCell className={classes.headerCell}>Gene</TableCell>
              <TableCell className={classes.headerCell}>Organism</TableCell>
              <TableCell className={classes.headerCell}>Protein</TableCell>
              <TableCell className={classes.headerCell}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map(entry => (
              <TableRow
                key={entry.accession}
                onClick={() => {
                  onSelect(entry.accession)
                }}
                className={cx(
                  classes.clickableRow,
                  selectedAccession === entry.accession && classes.selectedRow,
                )}
              >
                <TableCell padding="checkbox">
                  <Radio
                    checked={selectedAccession === entry.accession}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <ExternalLink
                    href={`https://www.uniprot.org/uniprotkb/${entry.accession}`}
                  >
                    {entry.accession}
                  </ExternalLink>
                </TableCell>
                <TableCell>{entry.geneName ?? '-'}</TableCell>
                <TableCell>{entry.organismName ?? '-'}</TableCell>
                <TableCell>
                  {entry.proteinName
                    ? entry.proteinName.length > 40
                      ? `${entry.proteinName.slice(0, 40)}...`
                      : entry.proteinName
                    : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={entry.isReviewed ? 'Reviewed' : 'Unreviewed'}
                    size="small"
                    className={
                      entry.isReviewed
                        ? classes.reviewedChip
                        : classes.unreviewedChip
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

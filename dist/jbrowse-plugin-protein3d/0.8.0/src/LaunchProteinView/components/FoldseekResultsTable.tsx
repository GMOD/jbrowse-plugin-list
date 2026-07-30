import React from 'react'

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import FoldseekActionMenu from './FoldseekActionMenu'
import { getStructureUrlFromTarget } from '../utils/launchViewUtils'

import type { FlattenedHit } from './FoldseekActionMenu'
import type { FoldseekResult } from '../services/foldseekApi'
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  tableContainer: {
    maxHeight: 400,
  },
  headerCell: {
    fontWeight: 'bold',
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.grey[900]
        : theme.palette.grey[100],
  },
  noResults: {
    padding: 16,
    textAlign: 'center',
  },
}))

const MAX_HITS = 100

function flattenResults(results: FoldseekResult): FlattenedHit[] {
  const hits = results.results.flatMap(dbResult =>
    (dbResult.alignments ?? []).flat().map(alignment => ({
      ...alignment,
      db: dbResult.db,
      structureUrl: getStructureUrlFromTarget(alignment.target, dbResult.db),
    })),
  )
  hits.sort((a, b) => (a.eval ?? Infinity) - (b.eval ?? Infinity))
  return hits
}

export default function FoldseekResultsTable({
  results,
  session,
  view,
  feature,
  selectedTranscript,
  userProvidedTranscriptSequence,
  onClose,
}: {
  results: FoldseekResult
  session: AbstractSessionModel
  view: LinearGenomeViewModel
  feature: Feature
  selectedTranscript?: Feature
  userProvidedTranscriptSequence?: string
  onClose: () => void
}) {
  const { classes } = useStyles()
  const allHits = flattenResults(results)
  const flatHits = allHits.slice(0, MAX_HITS)

  if (flatHits.length === 0) {
    return (
      <Paper className={classes.noResults}>
        <Typography>No similar structures found</Typography>
      </Paper>
    )
  }

  return (
    <div className={classes.root}>
      <Typography variant="subtitle2">
        Found {allHits.length} similar structures
        {allHits.length > flatHits.length
          ? ` (showing top ${flatHits.length})`
          : ''}
      </Typography>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className={classes.headerCell}>Database</TableCell>
              <TableCell className={classes.headerCell}>Target</TableCell>
              <TableCell className={classes.headerCell}>Organism</TableCell>
              <TableCell className={classes.headerCell}>Prob</TableCell>
              <TableCell className={classes.headerCell}>Seq. Id.</TableCell>
              <TableCell className={classes.headerCell}>Coverage</TableCell>
              <TableCell className={classes.headerCell}>E-value</TableCell>
              <TableCell className={classes.headerCell}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flatHits.map((hit, idx) => (
              <TableRow key={`${hit.db}-${hit.target}-${idx}`}>
                <TableCell>{hit.db}</TableCell>
                <TableCell>{hit.target}</TableCell>
                <TableCell>{hit.taxName ?? '-'}</TableCell>
                <TableCell>
                  {hit.prob != null ? `${(hit.prob * 100).toFixed(1)}%` : '-'}
                </TableCell>
                <TableCell>
                  {hit.seqId != null ? `${hit.seqId.toFixed(1)}%` : '-'}
                </TableCell>
                <TableCell>
                  {hit.alnLength != null && hit.qLen != null
                    ? `${((hit.alnLength / hit.qLen) * 100).toFixed(1)}%`
                    : '-'}
                </TableCell>
                <TableCell>
                  {hit.eval != null ? hit.eval.toExponential(2) : '-'}
                </TableCell>
                <TableCell>
                  <FoldseekActionMenu
                    hit={hit}
                    session={session}
                    view={view}
                    feature={feature}
                    selectedTranscript={selectedTranscript}
                    userProvidedTranscriptSequence={
                      userProvidedTranscriptSequence
                    }
                    onClose={onClose}
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

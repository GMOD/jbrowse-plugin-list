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

const useStyles = makeStyles()({
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
    backgroundColor: '#f5f5f5',
  },
  noResults: {
    padding: 16,
    textAlign: 'center',
  },
})

function flattenResults(results: FoldseekResult): FlattenedHit[] {
  const hits: FlattenedHit[] = []
  for (const dbResult of results.results) {
    if (!dbResult.alignments) {
      continue
    }
    for (const alignmentGroup of dbResult.alignments) {
      if (!alignmentGroup) {
        continue
      }
      for (const alignment of alignmentGroup) {
        if (!alignment) {
          continue
        }
        hits.push({
          ...alignment,
          db: dbResult.db,
          structureUrl: getStructureUrlFromTarget(
            alignment.target,
            dbResult.db,
          ),
        })
      }
    }
  }
  hits.sort((a, b) => (a.eval ?? Infinity) - (b.eval ?? Infinity))
  return hits.slice(0, 100)
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
  const flatHits = flattenResults(results)

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
        Found {flatHits.length} similar structures
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

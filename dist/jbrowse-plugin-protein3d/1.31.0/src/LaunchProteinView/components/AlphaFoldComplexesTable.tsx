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
  Tooltip,
  Typography,
} from '@mui/material'
import { observer } from 'mobx-react'
import { uniprotEntryUrl } from 'p2s_mapper'
import { makeStyles } from 'tss-react/mui'

import ExternalLink from '../../components/ExternalLink'

import type { AlphaFoldComplex, AlphaFoldComplexMember } from 'p2s_mapper'

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

export function alphaFoldEntryUrl(entity: string) {
  return `https://alphafold.ebi.ac.uk/entry/${entity}`
}

function complexKind({ homomer, oligomericState }: AlphaFoldComplex) {
  return `${homomer ? 'Homo' : 'Hetero'}${oligomericState ?? 'mer'}`
}

function fixed(value: number | undefined, digits: number) {
  return value === undefined ? '-' : value.toFixed(digits)
}

const Member = observer(function Member({
  member,
}: {
  member: AlphaFoldComplexMember
}) {
  return (
    <div>
      <strong>{member.gene ?? member.accession}</strong>
      {member.copies > 1 ? ` ×${member.copies}` : ''}{' '}
      {member.description ? `${member.description} ` : ''}
      <ExternalLink href={uniprotEntryUrl(member.accession)}>
        {member.accession}
      </ExternalLink>
    </div>
  )
})

/**
 * The structures AlphaFold DB predicted for a protein: optionally its monomer
 * first, then each complex with the proteins it pairs with. `selected`
 * undefined is the monomer.
 */
const AlphaFoldComplexesTable = observer(function AlphaFoldComplexesTable({
  complexes,
  accession,
  monomer,
  selected,
  onSelect,
}: {
  complexes: readonly AlphaFoldComplex[]
  /** the protein the complexes were listed for, left out of the partners */
  accession: string
  monomer?: { meanPlddt?: number }
  selected?: string
  onSelect: (entity: string | undefined) => void
}) {
  const { classes } = useStyles()
  const entry = accession.replace(/-\d+$/, '')
  const rowClass = (isSelected: boolean) =>
    `${classes.clickableRow} ${isSelected ? classes.selectedRow : ''}`
  return (
    <>
      <Typography variant="body2" color="textSecondary">
        {complexes.length === 0
          ? `AlphaFold DB has predicted no complex with ${entry}`
          : `${complexes.length} complex${complexes.length === 1 ? '' : 'es'} AlphaFold DB predicted with ${entry}, homomers first, then by ipTM`}
      </Typography>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table
          size="small"
          stickyHeader
          data-testid="alphafold-complexes-table"
        >
          <TableHead>
            <TableRow>
              <TableCell className={classes.headerCell} padding="checkbox" />
              <TableCell className={classes.headerCell}>Structure</TableCell>
              <TableCell className={classes.headerCell}>With</TableCell>
              <TableCell className={classes.headerCell}>
                <Tooltip title="Interface predicted TM-score, 0 to 1: how sure the prediction is of how the chains sit against each other. Above 0.8 is confident; below 0.6 the interface is likely wrong.">
                  <span>ipTM</span>
                </Tooltip>
              </TableCell>
              <TableCell className={classes.headerCell}>
                <Tooltip title="Mean per-residue confidence, 0 to 100">
                  <span>pLDDT</span>
                </Tooltip>
              </TableCell>
              <TableCell className={classes.headerCell}>AlphaFold DB</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {monomer ? (
              <TableRow
                className={rowClass(selected === undefined)}
                onClick={() => {
                  onSelect(undefined)
                }}
              >
                <TableCell padding="checkbox">
                  <Radio checked={selected === undefined} size="small" />
                </TableCell>
                <TableCell>Monomer</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>{fixed(monomer.meanPlddt, 1)}</TableCell>
                <TableCell>
                  <ExternalLink href={alphaFoldEntryUrl(entry)}>
                    {entry}
                  </ExternalLink>
                </TableCell>
              </TableRow>
            ) : null}
            {complexes.map(complex => {
              const isSelected = complex.entity === selected
              const partners = complex.homomer
                ? complex.members
                : complex.members.filter(m => m.accession !== entry)
              return (
                <TableRow
                  key={complex.entity}
                  className={rowClass(isSelected)}
                  onClick={() => {
                    onSelect(complex.entity)
                  }}
                >
                  <TableCell padding="checkbox">
                    <Radio checked={isSelected} size="small" />
                  </TableCell>
                  <TableCell>{complexKind(complex)}</TableCell>
                  <TableCell>
                    {partners.map(m => (
                      <Member key={m.accession} member={m} />
                    ))}
                  </TableCell>
                  <TableCell>{fixed(complex.iptm, 2)}</TableCell>
                  <TableCell>{fixed(complex.meanPlddt, 1)}</TableCell>
                  <TableCell>
                    <ExternalLink href={alphaFoldEntryUrl(complex.entity)}>
                      {complex.entity}
                    </ExternalLink>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
})

export default AlphaFoldComplexesTable

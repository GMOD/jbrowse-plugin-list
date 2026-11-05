import React from 'react'

import { Checkbox, Link, Typography } from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import { RESIDUE_COLORS } from '../../ProteinView/residueColors'

import type { StructureRow, StructureTag } from '../utils/structureList'

export const ROW_COLUMNS = '32px 150px minmax(0, 1fr) 170px 150px'

const useStyles = makeStyles()(theme => {
  const dark = theme.palette.mode === 'dark'
  return {
    row: {
      display: 'grid',
      gridTemplateColumns: ROW_COLUMNS,
      gap: 12,
      alignItems: 'center',
      padding: '6px 24px 6px 16px',
      borderBottom: `1px solid ${theme.palette.divider}`,
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    checked: {
      backgroundColor: theme.palette.action.selected,
    },
    idCell: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 3,
    },
    id: {
      fontFamily: 'monospace',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    },
    badge: {
      fontSize: '0.65rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      padding: '0 6px',
      borderRadius: 3,
    },
    experimental: {
      color: dark ? '#8fd19c' : '#2f6b3a',
      background: dark ? '#1c2e21' : '#e4f1e6',
    },
    predicted: {
      color: dark ? '#f0c27a' : '#7a4c0f',
      background: dark ? '#33281a' : '#fbf0dc',
    },
    what: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minWidth: 0,
    },
    tags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 4,
    },
    tag: {
      fontSize: '0.72rem',
      padding: '0 6px',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 3,
      color: theme.palette.text.secondary,
    },
    partner: {
      color: theme.palette.text.primary,
      borderColor: theme.palette.primary.main,
    },
    ligand: {
      fontFamily: 'monospace',
    },
    quality: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      fontVariantNumeric: 'tabular-nums',
    },
    dot: {
      display: 'inline-block',
      width: 9,
      height: 9,
      borderRadius: 2,
      marginRight: 5,
    },
    coverage: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      fontVariantNumeric: 'tabular-nums',
    },
    bar: {
      position: 'relative',
      height: 8,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
    },
    span: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      background: theme.palette.primary.main,
      borderRadius: 1,
    },
  }
})

function plddtColor(value: number) {
  const { domain, range } = RESIDUE_COLORS.plddt
  return range[domain.filter(cut => value > cut).length]
}

const Plddt = observer(function Plddt({ value }: { value?: number }) {
  const { classes } = useStyles()
  return value === undefined ? null : (
    <Typography variant="body2">
      <span className={classes.dot} style={{ background: plddtColor(value) }} />
      pLDDT {value.toFixed(1)}
    </Typography>
  )
})

const Quality = observer(function Quality({ row }: { row: StructureRow }) {
  const { classes } = useStyles()
  const version =
    row.kind === 'alphafold'
      ? /model_v(\d+)/.exec(row.model.url)?.[1]
      : undefined
  return (
    <div className={classes.quality}>
      {row.kind === 'alphafold' ? (
        <>
          <Plddt value={row.model.meanPlddt} />
          <Typography variant="caption" color="textSecondary">
            AlphaFold DB{version ? ` v${version}` : ''}
          </Typography>
        </>
      ) : row.kind === 'complex' ? (
        <>
          {row.complex.iptm === undefined ? null : (
            <Typography variant="body2">
              ipTM {row.complex.iptm.toFixed(2)}
            </Typography>
          )}
          <Plddt value={row.complex.meanPlddt} />
        </>
      ) : (
        <>
          <Typography variant="body2">
            {row.entry.method}
            {row.entry.resolution === undefined
              ? ''
              : ` · ${row.entry.resolution.toFixed(2)} Å`}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {row.entry.chains.length === 1 ? 'chain' : 'chains'}{' '}
            {row.entry.chains.join(', ')}
          </Typography>
        </>
      )}
    </div>
  )
})

const Coverage = observer(function Coverage({
  start,
  end,
  length,
}: {
  start: number
  end: number
  length: number
}) {
  const { classes } = useStyles()
  const share = (end - start + 1) / length
  return (
    <div className={classes.coverage}>
      <div className={classes.bar} aria-hidden>
        <span
          className={classes.span}
          style={{
            left: `${((start - 1) / length) * 100}%`,
            width: `${Math.min(share, 1) * 100}%`,
          }}
        />
      </div>
      <Typography variant="caption" color="textSecondary">
        {start}–{end} of {length} · {Math.round(share * 100)}%
      </Typography>
    </div>
  )
})

const Tags = observer(function Tags({
  tags,
  className,
}: {
  tags: StructureTag[]
  className?: string
}) {
  const { classes, cx } = useStyles()
  return (
    <>
      {tags.map(tag => (
        <span
          key={tag.label}
          className={cx(classes.tag, className)}
          title={tag.title}
        >
          {tag.label}
        </span>
      ))}
    </>
  )
})

/** One structure: what it is, what it shows, how good it is, how much of the
 * protein it covers. Clicking anywhere on it checks it. */
const StructureListRow = observer(function StructureListRow({
  row,
  checked,
  uniprotLength,
  onToggle,
}: {
  row: StructureRow
  checked: boolean
  uniprotLength: number
  onToggle: () => void
}) {
  const { classes, cx } = useStyles()
  const hasTags =
    row.partners.length + row.ligands.length + row.notes.length > 0
  return (
    <div
      className={cx(classes.row, checked && classes.checked)}
      data-testid={`structure-row-${row.key}`}
      onClick={onToggle}
    >
      <Checkbox
        size="small"
        checked={checked}
        onClick={event => {
          event.stopPropagation()
        }}
        onChange={onToggle}
        slotProps={{ input: { 'aria-label': `Open ${row.label}` } }}
      />
      <div className={classes.idCell}>
        <Link
          href={row.href}
          target="_blank"
          rel="noreferrer"
          variant="body2"
          className={classes.id}
          onClick={event => {
            event.stopPropagation()
          }}
        >
          {row.label}
        </Link>
        <span
          className={cx(
            classes.badge,
            row.predicted ? classes.predicted : classes.experimental,
          )}
        >
          {row.predicted ? 'Predicted' : 'Experimental'}
        </span>
      </div>
      <div className={classes.what}>
        <Typography variant="body2">{row.title}</Typography>
        {hasTags ? (
          <div className={classes.tags}>
            <Tags tags={row.partners} className={classes.partner} />
            <Tags tags={row.ligands} className={classes.ligand} />
            <Tags tags={row.notes} />
          </div>
        ) : null}
      </div>
      <Quality row={row} />
      <Coverage start={row.start} end={row.end} length={uniprotLength} />
    </div>
  )
})

export default StructureListRow

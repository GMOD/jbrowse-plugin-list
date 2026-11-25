import React, { useState } from 'react'

import { LoadingEllipses } from '@jbrowse/core/ui'
import { Link, Typography } from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import { SECTIONS, firstRowsAndChecked } from '../utils/structureList'
import NoticeLine from './NoticeLine'
import StructureListRow from './StructureListRow'

import type { SectionStatus } from '../hooks/useGeneStructures'
import type { StructureRow, StructureSection } from '../utils/structureList'

const useStyles = makeStyles()(theme => ({
  list: {
    flex: '1 1 auto',
    minHeight: 160,
    overflowY: 'auto',
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
    padding: '8px 24px 4px',
    background: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  heading: {
    fontSize: '0.8rem',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: theme.palette.text.secondary,
  },
  line: {
    padding: '6px 24px',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}))

// the protein on its own is mostly the same crystal again, so the section
// shows its best few and the partners start above the fold; the partners fold
// to as many, so two dozen complexes do not bury the fragments
const SHOWN = 5

function sectionText(section: StructureSection, geneName: string) {
  return section === 'added'
    ? {
        title: 'Added by PDB ID',
        note: 'any entry, whichever protein RCSB files it under',
      }
    : section === 'alone'
      ? {
          title: `${geneName} on its own`,
          note: 'whole protein or most of it, with any bound nucleotide or drug',
        }
      : section === 'partner'
        ? {
            title: `${geneName} with another protein`,
            note: 'experimental complexes first, then AlphaFold DB predictions',
          }
        : {
            title: 'Short fragments',
            note: 'under half the protein, so each opens on its own',
          }
}

const Section = observer(function Section({
  section,
  geneName,
  rows,
  status,
  checked,
  uniprotLength,
  onToggle,
}: {
  section: StructureSection
  geneName: string
  rows: StructureRow[]
  status?: SectionStatus
  checked: readonly string[]
  uniprotLength: number
  onToggle: (row: StructureRow) => void
}) {
  const { classes } = useStyles()
  const [expanded, setExpanded] = useState(false)
  const { title, note } = sectionText(section, geneName)
  const collapsed =
    section === 'fragment' &&
    !expanded &&
    !rows.some(r => checked.includes(r.key))
  const shown =
    (section === 'alone' || section === 'partner') && !expanded
      ? firstRowsAndChecked(rows, checked, SHOWN)
      : rows
  const hidden = rows.length - shown.length
  const loading = status?.loading ?? []
  const notices = status?.notices ?? []
  return rows.length + loading.length + notices.length === 0 ? null : (
    <div data-testid={`structure-section-${section}`}>
      <div className={classes.header}>
        <span className={classes.heading}>
          {title} · {rows.length}
        </span>
        <Typography variant="caption" color="textSecondary">
          {note}
        </Typography>
      </div>
      {collapsed ? (
        rows.length > 0 ? (
          <div className={classes.line}>
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                setExpanded(true)
              }}
            >
              Show {rows.length} short fragment{rows.length === 1 ? '' : 's'}
            </Link>
          </div>
        ) : null
      ) : (
        <>
          {shown.map(row => (
            <StructureListRow
              key={row.key}
              row={row}
              checked={checked.includes(row.key)}
              uniprotLength={uniprotLength}
              onToggle={() => {
                onToggle(row)
              }}
            />
          ))}
          {hidden > 0 ? (
            <div className={classes.line}>
              <Link
                component="button"
                variant="body2"
                onClick={() => {
                  setExpanded(true)
                }}
              >
                Show {hidden} more
              </Link>
            </div>
          ) : null}
        </>
      )}
      {loading.map(message => (
        <div className={classes.line} key={message}>
          <LoadingEllipses variant="body2" message={message} />
        </div>
      ))}
      {notices.map(notice => (
        <NoticeLine
          key={notice.message}
          className={classes.line}
          color="textSecondary"
          message={notice.message}
          onRetry={notice.retry}
          retrying={notice.retrying}
        />
      ))}
    </div>
  )
})

/** Every structure for the gene, grouped by what it shows of the protein */
const StructureList = observer(function StructureList({
  rows,
  sections,
  geneName,
  empty,
  sourceFailed,
  checked,
  uniprotLength,
  onToggle,
}: {
  rows: readonly StructureRow[]
  sections?: Record<StructureSection, SectionStatus>
  geneName: string
  /** every source has answered and none listed a structure */
  empty: boolean
  /** a source failed, and says so in its section */
  sourceFailed: boolean
  checked: readonly string[]
  uniprotLength: number
  onToggle: (row: StructureRow) => void
}) {
  const { classes } = useStyles()
  return (
    <div className={classes.list} data-testid="structure-list">
      {empty ? (
        <Typography
          className={classes.line}
          variant="body2"
          data-testid="structure-list-empty"
        >
          {sourceFailed
            ? `No structures found for ${geneName} so far: a source below did not answer.`
            : `No structures listed for ${geneName}.`}{' '}
          Pick a UniProt entry above, add one by PDB ID, or use the Similar
          structures (Foldseek) or Your file or URL tab.
        </Typography>
      ) : null}
      {SECTIONS.map(section => (
        <Section
          key={section}
          section={section}
          geneName={geneName}
          rows={rows.filter(r => r.section === section)}
          status={sections?.[section]}
          checked={checked}
          uniprotLength={uniprotLength}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
})

export default StructureList

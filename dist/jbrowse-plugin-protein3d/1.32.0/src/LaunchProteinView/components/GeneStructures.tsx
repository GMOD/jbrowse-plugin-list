import React, { useState } from 'react'

import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui'
import {
  Checkbox,
  Chip,
  DialogActions,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material'
import { observer } from 'mobx-react'
import { isPdbId, stripStopCodon } from 'p2s_mapper'
import { makeStyles } from 'tss-react/mui'

import PartialFailureNotice from './PartialFailureNotice'
import ProteinViewActions from './ProteinViewActions'
import SequenceMismatchNotice from './SequenceMismatchNotice'
import StructureList from './StructureList'
import TranscriptSelector from './TranscriptSelector'
import UniProtSummaryBar from './UniProtSummaryBar'
import useDebouncedValue from '../hooks/useDebouncedValue'
import useGeneStructures from '../hooks/useGeneStructures'
import useStructureLaunch, {
  structureSource,
} from '../hooks/useStructureLaunch'
import useUniProtIdLookup from '../hooks/useUniProtIdLookup'
import { getLaunchMissingReasons } from '../utils/launchHelpers'
import { getLaunchSideBySide, setLaunchSideBySide } from '../utils/sideBySide'
import {
  defaultChecked,
  matchesFilter,
  toggleStructure,
} from '../utils/structureList'
import { getTranscriptDisplayName } from '../utils/util'

import type { LaunchStructure } from '../hooks/useStructureLaunch'
import type { LaunchingGenomeView } from '../utils/genomeView'
import type { StructureFilter, StructureRow } from '../utils/structureList'
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'

const useStyles = makeStyles()(theme => ({
  // Bounded by the window less the dialog's title, tabs and margins, so the
  // list and the UniProt chooser shrink to fit and Launch never scrolls away
  root: {
    width: '80em',
    maxWidth: '100%',
    maxHeight: 'calc(100vh - 180px)',
    display: 'flex',
    flexDirection: 'column',
  },
  toolbar: {
    flex: 'none',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    padding: '8px 24px',
  },
  chips: {
    display: 'flex',
    gap: 6,
  },
  footer: {
    flex: 'none',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    padding: '8px 24px',
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  summary: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minWidth: 0,
    flex: '1 1 400px',
  },
  actions: {
    padding: 0,
    flexWrap: 'wrap',
  },
}))

const FILTERS: { filter: StructureFilter; label: string }[] = [
  { filter: 'all', label: 'All' },
  { filter: 'experimental', label: 'Experimental' },
  { filter: 'predicted', label: 'Predicted' },
]

function launchStructure(row: StructureRow): LaunchStructure {
  return row.kind === 'alphafold'
    ? { key: row.key, kind: 'alphafold', model: row.model }
    : row.kind === 'pdb'
      ? { key: row.key, kind: 'pdb', pdbId: row.entry.pdbId }
      : { key: row.key, kind: 'complex', entity: row.complex.entity }
}

function describeLaunch(
  rows: readonly StructureRow[],
  typedPdbId: string | undefined,
  finding: boolean,
) {
  const [first, ...rest] = rows
  return typedPdbId
    ? `PDB ${typedPdbId.toUpperCase()}, typed above, in place of the checked rows`
    : !first
      ? finding
        ? 'Finding structures…'
        : 'Check a structure to open it'
      : rest.length > 0
        ? `${rows.map(r => r.label).join(' + ')}, superposed onto ${first.label}`
        : first.section === 'fragment'
          ? `${first.label}, a short fragment, on its own`
          : `${first.label}: ${first.title}`
}

/**
 * The default tab: every structure found for the gene in one list, checked
 * rows opening together in one view, superposed onto the first.
 */
const GeneStructures = observer(function GeneStructures({
  feature,
  geneName,
  preferredTranscriptId,
  session,
  view,
  handleClose,
}: {
  feature: Feature
  geneName: string
  preferredTranscriptId?: string
  session: AbstractSessionModel
  view: LaunchingGenomeView
  handleClose: () => void
}) {
  const { classes } = useStyles()
  const lookup = useUniProtIdLookup({ feature, view, preferredTranscriptId })
  const { uniprotId } = lookup
  const structures = useGeneStructures({
    uniprotId,
    geneName,
    feature,
    view,
    preferredTranscriptId,
  })
  const { rows } = structures
  const [filter, setFilter] = useState<StructureFilter>('all')
  // a pick belongs to the accession it was made from
  const [picked, setPicked] = useState<{ uniprotId?: string; keys: string[] }>()
  const userPick =
    picked && picked.uniprotId === uniprotId ? picked.keys : undefined
  // nothing is checked until the default is known, or the first structure to
  // arrive would be ranked against and fetched for nothing
  const defaultPending = lookup.isLookupLoading || !structures.defaultSettled
  const checked = userPick ?? (defaultPending ? [] : defaultChecked(rows))
  const checkedRows = rows.filter(r => checked.includes(r.key))

  const [sideBySide, setSideBySide] = useState(() => getLaunchSideBySide())

  // A typed id reaches entries the accession's listing never offers: a
  // structure of a complex filed under a partner, anything a paper names.
  // Debounced, so the three characters on the way to four are not three
  // fetches.
  const [typedPdbId, setTypedPdbId] = useState('')
  const trimmedTypedPdbId = typedPdbId.trim()
  const debouncedTypedPdbId = useDebouncedValue(trimmedTypedPdbId, 400)
  const typedPdbIdInvalid =
    trimmedTypedPdbId !== '' && !isPdbId(trimmedTypedPdbId)
  const typedId = isPdbId(debouncedTypedPdbId)
    ? debouncedTypedPdbId.toLowerCase()
    : undefined

  const launchStructures: LaunchStructure[] = typedId
    ? [{ key: `typed:${typedId}`, kind: 'pdb', pdbId: typedId }]
    : checkedRows.map(launchStructure)
  const launch = useStructureLaunch({
    structures: launchStructures,
    uniprotId,
    feature,
    view,
    preferredTranscriptId,
  })

  // RCSB answering that it has no such entry, as opposed to failing to
  // answer, means the launch would open a view on a 404
  const typedIdUnknown =
    !!typedId &&
    launch.pdbEntryError instanceof Error &&
    'status' in launch.pdbEntryError &&
    launch.pdbEntryError.status === 404
  const typedPending = trimmedTypedPdbId !== debouncedTypedPdbId
  const isLoading =
    launch.isLoading ||
    typedPending ||
    (!typedId && !userPick && defaultPending)
  const error =
    launch.error ?? (typedIdUnknown ? launch.pdbEntryError : undefined)
  const missingReasons = getLaunchMissingReasons({
    structureCount: launchStructures.length,
    userSelectedProteinSequence: launch.selectedIsoform,
    selectedTranscript: launch.selectedTranscript,
  })
  const ready =
    !isLoading && !error && !typedPdbIdInvalid && missingReasons.length === 0
  const alphaFoldChecked = launchStructures.find(s => s.kind === 'alphafold')
  // Loading or failed, the lookup can still hold the previous query's
  // accession, which would name the view and its 1D entry
  const launchUniprotId =
    typedId && (lookup.isLookupLoading || lookup.lookupError)
      ? undefined
      : launchStructures[0]?.kind === 'alphafold'
        ? launchStructures[0].model.accession
        : uniprotId

  const toggle = (row: StructureRow) => {
    setPicked({ uniprotId, keys: toggleStructure(checked, row, rows) })
  }

  return (
    <div className={classes.root}>
      <UniProtSummaryBar lookup={lookup} />
      <div className={classes.toolbar}>
        <div className={classes.chips} role="group" aria-label="Source">
          {FILTERS.map(f => (
            <Chip
              key={f.filter}
              data-testid={`structure-filter-${f.filter}`}
              label={`${f.label} ${rows.filter(r => matchesFilter(r, f.filter)).length}`}
              color={filter === f.filter ? 'primary' : 'default'}
              variant={filter === f.filter ? 'filled' : 'outlined'}
              aria-pressed={filter === f.filter}
              onClick={() => {
                setFilter(f.filter)
              }}
            />
          ))}
        </div>
        <TextField
          size="small"
          label="Open by PDB ID"
          placeholder="e.g. 1TUP"
          data-testid="pdb-id-input"
          error={typedPdbIdInvalid || typedIdUnknown}
          helperText={
            typedPdbIdInvalid
              ? 'Four characters beginning with a digit'
              : typedIdUnknown
                ? `RCSB has no entry ${debouncedTypedPdbId.toUpperCase()}`
                : undefined
          }
          value={typedPdbId}
          onChange={event => {
            setTypedPdbId(event.target.value)
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 200 }}
        />
      </div>
      <StructureList
        rows={rows.filter(r => matchesFilter(r, filter))}
        sections={structures.sections}
        geneName={geneName}
        checked={typedId ? [] : checked}
        uniprotLength={structures.uniprotLength}
        onToggle={row => {
          setTypedPdbId('')
          toggle(row)
        }}
      />
      <div className={classes.footer}>
        <div className={classes.summary}>
          <Typography variant="body2" data-testid="launch-summary">
            <strong>
              {describeLaunch(
                checkedRows,
                typedId,
                !userPick && defaultPending,
              )}
            </strong>
          </Typography>
          {error ? <ErrorMessage error={error} /> : null}
          {launch.loadingStatuses.map(status => (
            <LoadingEllipses key={status} variant="caption" message={status} />
          ))}
          <PartialFailureNotice message={launch.partialFailure} />
          {launch.ranking && launch.selectedTranscript ? (
            <TranscriptSelector
              val={launch.selectedTranscriptId}
              setVal={launch.setSelectedTranscriptId}
              structureSequence={launch.structureSequence}
              feature={feature}
              isoforms={launch.transcripts}
              ranking={launch.ranking}
              size="small"
            />
          ) : launch.selectedTranscript && launch.selectedIsoform ? (
            // the right-clicked isoform launches before the ranking that
            // fills the picker has run
            <Typography variant="caption" color="textSecondary">
              Mapped through transcript{' '}
              {getTranscriptDisplayName(launch.selectedTranscript)} (
              {stripStopCodon(launch.selectedIsoform.seq).length} aa)
            </Typography>
          ) : null}
          {launch.sequencesMatch === false ? <SequenceMismatchNotice /> : null}
          {!isLoading && !error && missingReasons.length > 0 ? (
            <Typography variant="body2" color="error">
              {missingReasons.join('; ')}
            </Typography>
          ) : null}
        </div>
        <DialogActions className={classes.actions}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={sideBySide}
                data-testid="protein-launch-side-by-side"
                onChange={(_, value) => {
                  setSideBySide(value)
                  setLaunchSideBySide(value)
                }}
              />
            }
            label={
              <Typography variant="body2">
                Open beside the genome view
              </Typography>
            }
          />
          <ProteinViewActions
            handleClose={handleClose}
            ready={ready}
            uniprotId={launchUniprotId}
            userSelectedProteinSequence={launch.selectedIsoform}
            selectedTranscript={launch.selectedTranscript}
            sources={launchStructures.map(structureSource)}
            confidenceUrl={
              alphaFoldChecked?.kind === 'alphafold'
                ? alphaFoldChecked.model.confidenceUrl
                : undefined
            }
            feature={feature}
            view={view}
            session={session}
            sideBySide={sideBySide}
          />
        </DialogActions>
      </div>
    </div>
  )
})

export default GeneStructures

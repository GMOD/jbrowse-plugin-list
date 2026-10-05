import React, { useState } from 'react'

import { ErrorMessage } from '@jbrowse/core/ui'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { Button, ButtonGroup, Typography } from '@mui/material'

import LaunchOptionsMenu from './LaunchOptionsMenu'
import SequenceMismatchNotice from './SequenceMismatchNotice'
import { useSafeLaunch } from '../hooks/useSafeLaunch'
import { getLaunchMissingReasons } from '../utils/launchHelpers'
import {
  PROTEIN_LAUNCH_LABELS,
  getConditionalProteinLaunches,
  launch3DProteinView,
} from '../utils/launchViewUtils'

import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

interface ProteinViewActionsProps {
  handleClose: () => void
  uniprotId?: string
  userSelectedProteinSequence?: { seq: string }
  selectedTranscript?: Feature
  url?: string
  /** the entry a typed PDB id names, which launches without an accession */
  pdbId?: string
  confidenceUrl?: string
  feature: Feature
  view: LinearGenomeViewModel
  session: AbstractSessionModel
  /** owned by the dialog so every tab launches with what the user last chose */
  sideBySide: boolean
  onSideBySideChange: (value: boolean) => void
  sequencesMatch?: boolean
  isLoading?: boolean
  /**
   * Real error from the lookup/data pipeline. When present, "No UniProt ID
   * found" is suppressed so it doesn't compete with the actual error message
   * shown above by <ErrorMessage>.
   */
  error?: unknown
}

export default function ProteinViewActions({
  handleClose,
  uniprotId,
  userSelectedProteinSequence,
  selectedTranscript,
  url,
  pdbId,
  confidenceUrl,
  feature,
  view,
  session,
  sideBySide,
  onSideBySideChange,
  sequencesMatch,
  isLoading,
  error,
}: ProteinViewActionsProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  const missingReasons = getLaunchMissingReasons({
    uniprotId,
    userSelectedProteinSequence,
    selectedTranscript,
    url,
    pdbId,
  })
  // Loading or errored, SWR's keepPreviousData can still hold the previous
  // accession's structure, which Launch would open under the new name.
  const canLaunch = !isLoading && !error && missingReasons.length === 0
  // Suppress the derived reasons while loading or while a real upstream error
  // is displayed above via <ErrorMessage> — a duplicate hint would mislead.
  const showMissingReasons = !isLoading && !error && missingReasons.length > 0

  const closeMenu = () => {
    setMenuAnchor(null)
  }

  const { runLaunch, launchError } = useSafeLaunch(handleClose, closeMenu)

  const launch3DParams = {
    session,
    view,
    feature,
    selectedTranscript,
    uniprotId,
    url,
    userProvidedTranscriptSequence: userSelectedProteinSequence?.seq,
    sideBySide,
  }

  const handleLaunch3DView = runLaunch(() => {
    launch3DProteinView(launch3DParams)
  })

  const { launch1D } = getConditionalProteinLaunches({
    session,
    view,
    feature,
    selectedTranscript,
    uniprotId,
    confidenceUrl,
  })

  const launchOptions = [
    {
      key: '3d',
      title: PROTEIN_LAUNCH_LABELS['3d'],
      description:
        'View protein structure with genome-to-structure coordinate mapping',
      onClick: handleLaunch3DView,
    },
    ...(launch1D
      ? [
          {
            key: '1d',
            title: PROTEIN_LAUNCH_LABELS['1d'],
            description:
              'View protein features and annotations as a linear track',
            onClick: runLaunch(launch1D),
          },
        ]
      : []),
  ]

  return (
    <>
      {launchError ? <ErrorMessage error={launchError} /> : null}
      {sequencesMatch === false ? <SequenceMismatchNotice /> : null}
      <Button
        variant="contained"
        color="secondary"
        size="small"
        onClick={() => {
          handleClose()
        }}
      >
        Cancel
      </Button>
      {showMissingReasons ? (
        // one line each: four reasons run together read as one sentence about
        // the last of them
        <div style={{ marginRight: 16 }}>
          {missingReasons.map(reason => (
            <Typography key={reason} variant="body2" color="error">
              {reason}
            </Typography>
          ))}
        </div>
      ) : null}
      <ButtonGroup variant="contained" color="primary" size="small">
        {/* Tagged rather than found by its "Launch" label: the dialog is not
            the only button on the page, and a label is a UI-copy decision that
            should be free to change without breaking callers. */}
        <Button
          data-testid="protein-launch-button"
          disabled={!canLaunch}
          onClick={handleLaunch3DView}
        >
          Launch
        </Button>
        <Button
          data-testid="protein-launch-options-button"
          disabled={!canLaunch}
          onClick={event => {
            setMenuAnchor(event.currentTarget)
          }}
          aria-label="More launch options"
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <LaunchOptionsMenu
        anchorEl={menuAnchor}
        onClose={closeMenu}
        options={launchOptions}
        sideBySide={sideBySide}
        onSideBySideChange={onSideBySideChange}
      />
    </>
  )
}

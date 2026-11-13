import React, { useState } from 'react'

import { ErrorMessage } from '@jbrowse/core/ui'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { Button, ButtonGroup } from '@mui/material'
import { observer } from 'mobx-react'

import LaunchOptionsMenu from './LaunchOptionsMenu'
import { useSafeLaunch } from '../hooks/useSafeLaunch'
import {
  PROTEIN_LAUNCH_LABELS,
  getConditionalProteinLaunches,
  launch3DProteinView,
} from '../utils/launchViewUtils'

import type { LaunchingGenomeView } from '../utils/genomeView'
import type { StructureSource } from '../utils/launchViewUtils'
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'

const ProteinViewActions = observer(function ProteinViewActions({
  handleClose,
  ready,
  uniprotId,
  userSelectedProteinSequence,
  selectedTranscript,
  sources,
  confidenceUrl,
  feature,
  view,
  session,
  sideBySide,
}: {
  handleClose: () => void
  /** everything the launch needs has arrived */
  ready: boolean
  uniprotId?: string
  userSelectedProteinSequence?: { seq: string }
  selectedTranscript?: Feature
  sources: StructureSource[]
  confidenceUrl?: string
  feature: Feature
  view: LaunchingGenomeView
  session: AbstractSessionModel
  sideBySide: boolean
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const closeMenu = () => {
    setMenuAnchor(null)
  }
  const { runLaunch, launchError, launching } = useSafeLaunch(
    handleClose,
    closeMenu,
  )
  const canLaunch = ready && !launching

  const handleLaunch3DView = runLaunch(() =>
    launch3DProteinView({
      session,
      view,
      feature,
      selectedTranscript,
      uniprotId,
      sources,
      userProvidedTranscriptSequence: userSelectedProteinSequence?.seq,
      sideBySide,
    }),
  )

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
      />
    </>
  )
})

export default ProteinViewActions

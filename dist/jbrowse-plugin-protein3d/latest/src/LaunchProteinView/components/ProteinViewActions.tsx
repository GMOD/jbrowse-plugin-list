import React, { useState } from 'react'

import { ErrorMessage } from '@jbrowse/core/ui'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { Button, ButtonGroup } from '@mui/material'
import { observer } from 'mobx-react'

import { useSafeLaunch } from '../hooks/useSafeLaunch'
import { launchControls } from '../utils/launchHelpers'
import {
  PROTEIN_LAUNCH_LABELS,
  getConditionalProteinLaunches,
  launch3DProteinView,
} from '../utils/launchViewUtils'
import LaunchOptionsMenu from './LaunchOptionsMenu'

import type { LaunchingGenomeView } from '../utils/genomeView'
import type { StructureSource } from '../utils/launchViewUtils'
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'

const ProteinViewActions = observer(function ProteinViewActions({
  handleClose,
  ready,
  ready1D,
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
  /** everything the 3D launch needs has arrived */
  ready: boolean
  /** the 1D annotation view's accession and transcript have arrived; it opens
   * no structure */
  ready1D: boolean
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
  const { can3D, can1D, canOpenOptions } = launchControls({
    ready,
    ready1D,
    launching,
    offers1D: !!launch1D,
  })

  const launchOptions = [
    {
      key: '3d',
      title: PROTEIN_LAUNCH_LABELS['3d'],
      description:
        'View protein structure with genome-to-structure coordinate mapping',
      disabled: !can3D,
      onClick: handleLaunch3DView,
    },
    ...(launch1D
      ? [
          {
            key: '1d',
            title: PROTEIN_LAUNCH_LABELS['1d'],
            description:
              'View protein features and annotations as a linear track',
            disabled: !can1D,
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
          disabled={!can3D}
          onClick={handleLaunch3DView}
        >
          Launch
        </Button>
        <Button
          data-testid="protein-launch-options-button"
          disabled={!canOpenOptions}
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

import React, { useState } from 'react'

import { ErrorMessage } from '@jbrowse/core/ui'
import { Button, Menu, MenuItem } from '@mui/material'

import { useSafeLaunch } from '../hooks/useSafeLaunch'
import { caCoordsToPdb, hasValidCaCoords } from '../utils/caCoordsToPdb'
import {
  getConditionalProteinLaunches,
  getConfidenceUrlFromTarget,
  getUniprotIdFromAlphaFoldTarget,
  launch3DProteinView,
} from '../utils/launchViewUtils'

import type { FoldseekAlignment } from '../services/foldseekApi'
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

export interface FlattenedHit extends FoldseekAlignment {
  db: string
  structureUrl?: string
}

export default function FoldseekActionMenu({
  hit,
  session,
  view,
  feature,
  selectedTranscript,
  userProvidedTranscriptSequence,
  onClose,
}: {
  hit: FlattenedHit
  session: AbstractSessionModel
  view: LinearGenomeViewModel
  feature: Feature
  selectedTranscript?: Feature
  userProvidedTranscriptSequence?: string
  onClose: () => void
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const uniprotId = getUniprotIdFromAlphaFoldTarget(hit.target)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const { runLaunch, launchError } = useSafeLaunch(onClose, handleMenuClose)

  const baseParams = { session, view, feature, selectedTranscript, uniprotId }

  const handleLaunch3D = runLaunch(() => {
    // Use tCa coordinates to generate PDB data if no URL is available
    const pdbData =
      !hit.structureUrl && hasValidCaCoords(hit.tCa, hit.tSeq)
        ? caCoordsToPdb(hit.tCa!, hit.tSeq!, 'A', hit.target)
        : undefined
    launch3DProteinView({
      ...baseParams,
      url: hit.structureUrl,
      data: pdbData,
      userProvidedTranscriptSequence,
    })
  })

  const { launch1D, launchMsa } = getConditionalProteinLaunches({
    ...baseParams,
    confidenceUrl: getConfidenceUrlFromTarget(hit.target),
  })

  const canLoad = !!hit.structureUrl || hasValidCaCoords(hit.tCa, hit.tSeq)
  if (!canLoad) {
    return <span>-</span>
  }

  return (
    <>
      {launchError ? <ErrorMessage error={launchError} /> : null}
      <Button size="small" variant="outlined" onClick={handleClick}>
        Load
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={handleLaunch3D}>Launch 3D protein view</MenuItem>
        {launch1D ? (
          <MenuItem onClick={runLaunch(launch1D)}>
            Launch 1D protein annotation view
          </MenuItem>
        ) : null}
        {launchMsa ? (
          <MenuItem onClick={runLaunch(launchMsa)}>
            Launch MSA view (AlphaFoldDB a3m)
          </MenuItem>
        ) : null}
      </Menu>
    </>
  )
}

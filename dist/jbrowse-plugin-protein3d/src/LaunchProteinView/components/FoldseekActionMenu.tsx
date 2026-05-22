import React, { useState } from 'react'

import { Button, Menu, MenuItem } from '@mui/material'

import { caCoordsToPdb, hasValidCaCoords } from '../utils/caCoordsToPdb'
import { safeLaunch } from '../utils/launchHelpers'
import {
  getConfidenceUrlFromTarget,
  getUniprotIdFromAlphaFoldTarget,
  hasMsaViewPlugin,
  launch1DProteinView,
  launch3DProteinView,
  launchMsaView,
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

  const baseParams = { session, view, feature, selectedTranscript, uniprotId }

  const runLaunch = (fn: () => void | Promise<void>) => () => {
    handleMenuClose()
    void safeLaunch(session, fn, onClose)
  }

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

  const handleLaunch1D = runLaunch(async () => {
    await launch1DProteinView({
      ...baseParams,
      confidenceUrl: getConfidenceUrlFromTarget(hit.target),
    })
  })

  const handleLaunchMSA = runLaunch(() => {
    launchMsaView(baseParams)
  })

  const canLoad = hit.structureUrl ?? hasValidCaCoords(hit.tCa, hit.tSeq)
  if (!canLoad) {
    return <span>-</span>
  }

  return (
    <>
      <Button size="small" variant="outlined" onClick={handleClick}>
        Load
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={handleLaunch3D}>Launch 3D protein view</MenuItem>
        {uniprotId ? (
          <MenuItem onClick={handleLaunch1D}>
            Launch 1D protein annotation view
          </MenuItem>
        ) : null}
        {uniprotId && hasMsaViewPlugin() ? (
          <MenuItem onClick={handleLaunchMSA}>
            Launch MSA view (AlphaFoldDB a3m)
          </MenuItem>
        ) : null}
      </Menu>
    </>
  )
}

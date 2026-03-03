import React, { useState } from 'react'

import { Dialog } from '@jbrowse/core/ui'
import { AbstractTrackModel, Feature } from '@jbrowse/core/util'
import { Tab, Tabs } from '@mui/material'

import AlphaFoldDBSearch from './AlphaFoldDBSearch'
import FoldseekSearch from './FoldseekSearch'
import HelpButton from './HelpButton'
import TabPanel from './TabPanel'
import UserProvidedStructure from './UserProvidedStructure'
import {
  AlignmentAlgorithm,
  DEFAULT_ALIGNMENT_ALGORITHM,
} from '../../ProteinView/types'
import { useLocalStorage } from '../hooks/useLocalStorage'

export default function LaunchProteinViewDialog({
  handleClose,
  feature,
  model,
}: {
  handleClose: () => void
  feature: Feature
  model: AbstractTrackModel
}) {
  const [choice, setChoice] = useState(0)
  const [alignmentAlgorithm, setAlignmentAlgorithm] =
    useLocalStorage<AlignmentAlgorithm>(
      'jbrowse-protein3d-alignment-algorithm',
      DEFAULT_ALIGNMENT_ALGORITHM,
    )

  return (
    <Dialog
      maxWidth="xl"
      title="Launch protein view"
      titleNode={
        <>
          Launch protein view <HelpButton />
        </>
      }
      open
      onClose={() => {
        handleClose()
      }}
    >
      <Tabs
        value={choice}
        onChange={(_, val) => {
          setChoice(val)
        }}
      >
        <Tab value={0} label="AlphaFoldDB search" />
        <Tab value={1} label="Foldseek search" />
        <Tab value={2} label="Open file manually" />
      </Tabs>
      <TabPanel value={choice} index={0}>
        <AlphaFoldDBSearch
          model={model}
          feature={feature}
          handleClose={handleClose}
          alignmentAlgorithm={alignmentAlgorithm}
          onAlignmentAlgorithmChange={setAlignmentAlgorithm}
        />
      </TabPanel>
      <TabPanel value={choice} index={1}>
        <FoldseekSearch
          model={model}
          feature={feature}
          handleClose={handleClose}
        />
      </TabPanel>
      <TabPanel value={choice} index={2}>
        <UserProvidedStructure
          model={model}
          feature={feature}
          handleClose={handleClose}
          alignmentAlgorithm={alignmentAlgorithm}
          onAlignmentAlgorithmChange={setAlignmentAlgorithm}
        />
      </TabPanel>
    </Dialog>
  )
}

import React, { useState } from 'react'

import { Dialog } from '@jbrowse/core/ui'
import { getSession } from '@jbrowse/core/util'
import { Tab, Tabs } from '@mui/material'
import { observer } from 'mobx-react'

import FoldseekSearch from './FoldseekSearch'
import GeneStructures from './GeneStructures'
import HelpButton from './HelpButton'
import TabPanel from './TabPanel'
import UserProvidedStructure from './UserProvidedStructure'
import { getGeneDisplayName } from '../utils/util'

import type { LaunchingGenomeView } from '../utils/genomeView'
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util'

const LaunchProteinViewDialog = observer(function LaunchProteinViewDialog({
  handleClose,
  feature,
  preferredTranscriptId,
  model,
  view,
}: {
  handleClose: () => void
  feature: Feature
  // the isoform the user right-clicked, preselected in every tab's picker
  preferredTranscriptId?: string
  model: AbstractTrackModel
  view: LaunchingGenomeView
}) {
  const [choice, setChoice] = useState(0)
  const session = getSession(model)
  const geneName = getGeneDisplayName(feature) || 'this gene'

  return (
    <Dialog
      data-testid="launch-protein-view-dialog"
      maxWidth="xl"
      title="Launch protein view"
      titleNode={
        <>
          Launch protein view <HelpButton />
        </>
      }
      open
      onClose={handleClose}
    >
      <Tabs
        value={choice}
        onChange={(_, val) => {
          setChoice(val)
        }}
      >
        <Tab value={0} label={`Structures for ${geneName}`} />
        <Tab value={1} label="Similar structures (Foldseek)" />
        <Tab value={2} label="Your file or URL" />
      </Tabs>
      <TabPanel value={choice} index={0}>
        <GeneStructures
          session={session}
          view={view}
          feature={feature}
          geneName={geneName}
          preferredTranscriptId={preferredTranscriptId}
          handleClose={handleClose}
        />
      </TabPanel>
      <TabPanel value={choice} index={1}>
        <FoldseekSearch
          session={session}
          view={view}
          feature={feature}
          preferredTranscriptId={preferredTranscriptId}
          handleClose={handleClose}
        />
      </TabPanel>
      <TabPanel value={choice} index={2}>
        <UserProvidedStructure
          session={session}
          view={view}
          feature={feature}
          preferredTranscriptId={preferredTranscriptId}
          handleClose={handleClose}
        />
      </TabPanel>
    </Dialog>
  )
})

export default LaunchProteinViewDialog

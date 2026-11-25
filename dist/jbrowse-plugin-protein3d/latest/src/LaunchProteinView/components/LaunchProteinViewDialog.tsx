import React, { useId, useState } from 'react'

import { Dialog } from '@jbrowse/core/ui'
import { getSession } from '@jbrowse/core/util'
import { Tab, Tabs } from '@mui/material'
import { observer } from 'mobx-react'

import { getGeneDisplayName } from '../utils/util'
import FoldseekSearch from './FoldseekSearch'
import GeneStructures from './GeneStructures'
import HelpButton from './HelpButton'
import TabPanel, { tabA11yProps } from './TabPanel'
import UserProvidedStructure from './UserProvidedStructure'

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
  const idPrefix = useId()
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
        <Tab
          value={0}
          label={`Structures for ${geneName}`}
          {...tabA11yProps(idPrefix, 0)}
        />
        <Tab
          value={1}
          label="Similar structures (Foldseek)"
          {...tabA11yProps(idPrefix, 1)}
        />
        <Tab
          value={2}
          label="Your file or URL"
          {...tabA11yProps(idPrefix, 2)}
        />
      </Tabs>
      <TabPanel value={choice} index={0} idPrefix={idPrefix}>
        <GeneStructures
          session={session}
          view={view}
          feature={feature}
          geneName={geneName}
          preferredTranscriptId={preferredTranscriptId}
          handleClose={handleClose}
        />
      </TabPanel>
      <TabPanel value={choice} index={1} idPrefix={idPrefix}>
        <FoldseekSearch
          session={session}
          view={view}
          feature={feature}
          preferredTranscriptId={preferredTranscriptId}
          handleClose={handleClose}
        />
      </TabPanel>
      <TabPanel value={choice} index={2} idPrefix={idPrefix}>
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

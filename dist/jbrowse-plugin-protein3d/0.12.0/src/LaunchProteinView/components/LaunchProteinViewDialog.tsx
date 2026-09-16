import React, { useState } from 'react'

import { Dialog } from '@jbrowse/core/ui'
import { getContainingView, getSession } from '@jbrowse/core/util'
import { Tab, Tabs } from '@mui/material'

import AlphaFoldDBSearch from './AlphaFoldDBSearch'
import FoldseekSearch from './FoldseekSearch'
import HelpButton from './HelpButton'
import PdbSearch from './PdbSearch'
import TabPanel from './TabPanel'
import UserProvidedStructure from './UserProvidedStructure'
import useUniProtIdLookup from '../hooks/useUniProtIdLookup'
import { getLaunchSideBySide, setLaunchSideBySide } from '../utils/sideBySide'

import type { AbstractTrackModel, Feature } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

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
  const session = getSession(model)
  const view = getContainingView(model) as LinearGenomeViewModel
  // One lookup for the whole dialog: the tabs stay mounted once visited, so a
  // lookup per tab meant the same UniProt search ran twice and a row picked on
  // one tab left the other pointing at a different gene.
  const lookup = useUniProtIdLookup({ feature, view })
  // Also the dialog's, for the same reason: a tab that has been mounted since
  // before the user changed this would otherwise launch with its own stale copy.
  const [sideBySide, setSideBySide] = useState(() => getLaunchSideBySide())
  const changeSideBySide = (value: boolean) => {
    setSideBySide(value)
    setLaunchSideBySide(value)
  }

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
        <Tab value={0} label="AlphaFoldDB search" />
        <Tab value={1} label="PDB search" />
        <Tab value={2} label="Foldseek search" />
        <Tab value={3} label="File or URL" />
      </Tabs>
      <TabPanel value={choice} index={0}>
        <AlphaFoldDBSearch
          session={session}
          view={view}
          feature={feature}
          handleClose={handleClose}
          lookup={lookup}
          sideBySide={sideBySide}
          onSideBySideChange={changeSideBySide}
        />
      </TabPanel>
      <TabPanel value={choice} index={1}>
        <PdbSearch
          session={session}
          view={view}
          feature={feature}
          handleClose={handleClose}
          lookup={lookup}
          sideBySide={sideBySide}
          onSideBySideChange={changeSideBySide}
        />
      </TabPanel>
      <TabPanel value={choice} index={2}>
        <FoldseekSearch
          session={session}
          view={view}
          feature={feature}
          handleClose={handleClose}
        />
      </TabPanel>
      <TabPanel value={choice} index={3}>
        <UserProvidedStructure
          session={session}
          view={view}
          feature={feature}
          handleClose={handleClose}
        />
      </TabPanel>
    </Dialog>
  )
}

import { useState } from 'react'

import { CascadingMenuButton } from '@jbrowse/core/ui'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SettingsIcon from '@mui/icons-material/Settings'
import { observer } from 'mobx-react'

import GraphSettingsDialog from './GraphSettingsDialog'

import type { GraphGenomeViewModel } from '../model'

const SettingsMenu = observer(function SettingsMenu({
  model,
}: {
  model: GraphGenomeViewModel
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <CascadingMenuButton
        size="small"
        menuItems={[
          {
            type: 'checkbox' as const,
            label: 'Linear layout',
            checked: model.linearLayout,
            onClick: () => {
              model.setLinearLayout(!model.linearLayout)
              void model.recomputeLayout()
            },
          },
          {
            type: 'checkbox' as const,
            label: 'Show deletion edges',
            checked: model.showDeletionEdges,
            onClick: () => {
              model.setShowDeletionEdges(!model.showDeletionEdges)
            },
          },
          {
            type: 'checkbox' as const,
            label: 'Show timings',
            checked: model.showPerf,
            onClick: () => {
              model.setShowPerf(!model.showPerf)
            },
          },
          { type: 'divider' as const },
          {
            label: 'Settings',
            icon: SettingsIcon,
            onClick: () => {
              setSettingsOpen(true)
            },
          },
          { type: 'divider' as const },
          {
            label: 'Return to import form',
            icon: DeleteIcon,
            onClick: () => {
              model.clearGraph()
            },
          },
        ]}
      >
        <MoreVertIcon />
      </CascadingMenuButton>

      <GraphSettingsDialog
        model={model}
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false)
        }}
      />
    </>
  )
})

export default SettingsMenu

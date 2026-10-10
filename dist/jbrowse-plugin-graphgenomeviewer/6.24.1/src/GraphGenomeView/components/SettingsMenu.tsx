import { useState } from 'react'

import { CascadingMenuButton } from '@jbrowse/core/ui'
import CloseIcon from '@mui/icons-material/Close'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import RouteIcon from '@mui/icons-material/Route'
import SettingsIcon from '@mui/icons-material/Settings'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { observer } from 'mobx-react'

import GraphSettingsDialog from './GraphSettingsDialog'

import type { GraphPaneModel } from '../model'

const SettingsMenu = observer(function SettingsMenu({
  model,
}: {
  model: GraphPaneModel
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  // the toolbar beside this menu picks the walks and the repeat
  const haplotypes = model.highlightMenuItems({ picks: false })

  return (
    <>
      <CascadingMenuButton
        size="small"
        tooltip="Graph options"
        menuItems={[
          ...(haplotypes.length > 0
            ? [{ label: 'Haplotypes', icon: RouteIcon, subMenu: haplotypes }]
            : []),
          ...model.layoutOptionMenuItems({ repeat: false }),
          {
            label: 'Show...',
            icon: VisibilityIcon,
            subMenu: [
              ...model.showMenuItems(),
              ...(model.modeDrawsNodes && model.walkChoices.length > 1
                ? [
                    {
                      type: 'checkbox' as const,
                      label: 'Show walk rows under the graph',
                      checked: model.walkStrip,
                      onClick: () => {
                        model.setWalkStrip(!model.walkStrip)
                      },
                    },
                  ]
                : []),
              {
                type: 'checkbox' as const,
                label: 'Show timings',
                checked: model.showPerf,
                onClick: () => {
                  model.setShowPerf(!model.showPerf)
                },
              },
            ],
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
            label: 'Close graph',
            icon: CloseIcon,
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

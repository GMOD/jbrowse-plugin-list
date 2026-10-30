import { CascadingMenuButton } from '@jbrowse/core/ui'
import { getSession } from '@jbrowse/core/util'
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
  // the toolbar beside this menu picks the walks and the repeat
  const haplotypes = model.highlightMenuItems({ picks: false })

  return (
    <CascadingMenuButton
      size="small"
      tooltip="Graph options"
      menuItems={[
        ...(haplotypes.length > 0
          ? [{ label: 'Haplotypes', icon: RouteIcon, subMenu: haplotypes }]
          : []),
        ...model.layoutOptionMenuItems({ repeat: false }),
        {
          label: 'Show',
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
          label: 'Graph settings...',
          icon: SettingsIcon,
          helpText:
            'Subgraph node limit; node width and path colors; the force-directed layout engine',
          onClick: () => {
            getSession(model).queueDialog(onClose => [
              GraphSettingsDialog,
              { model, onClose },
            ])
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
  )
})

export default SettingsMenu

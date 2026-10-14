import { Menu } from '@jbrowse/core/ui'
import FilterListIcon from '@mui/icons-material/FilterList'
import FilterListOffIcon from '@mui/icons-material/FilterListOff'
import LineStyleIcon from '@mui/icons-material/LineStyle'
import { observer } from 'mobx-react'

import { locLabel } from '../../launchFromGraph/contributors'

import type { GraphPaneModel } from '../model'
import type { WalkRows } from '@jbrowse/bandage-core/layout/walkRows'

// A walk row's bar stands for a span of its haplotype's own contig, so the
// question a right-click asks is answered by a linear view on that assembly,
// with its genes
export const WalkRowContextMenu = observer(function WalkRowContextMenu({
  model,
  row,
  bars,
  top,
  left,
  onClose,
}: {
  model: GraphPaneModel
  row: number
  // the rows `row` indexes, walk rows' own unless a strip's
  bars?: WalkRows
  top: number
  left: number
  onClose: () => void
}) {
  const rows = bars ?? model.walkRowBars
  const target = model.walkRowLaunchTarget(row, rows)
  const assembly = target?.assembly
  const walk = row > 0 ? rows?.rows[row - 1] : undefined
  const sample = walk?.sample
  // the strip's rows are not walk rows', and take no sample filter
  const filters = !bars && model.walkRowBars
  const shown = model.walkRowSamples
  return (
    <Menu
      open
      anchorReference="anchorPosition"
      anchorPosition={{ top, left }}
      onClose={() => {
        onClose()
      }}
      onMenuItemClick={callback => {
        callback()
      }}
      menuItems={[
        target && assembly
          ? {
              label: `Linear genome view — ${assembly} ${locLabel(target.location)}`,
              icon: LineStyleIcon,
              onClick: () => {
                model.showInLinearView({ location: target.location, assembly })
              },
            }
          : {
              label: 'Linear genome view',
              icon: LineStyleIcon,
              disabled: true,
              disabledHelpText: target
                ? `No assembly in this session is ${target.location.haplotype ?? target.label}`
                : 'This walk states no contig coordinates',
              onClick: () => {},
            },
        ...(walk && model.liftsWalks && model.modeDrawsNodes
          ? [
              {
                type: 'checkbox' as const,
                label: `Highlight ${walk.label}`,
                checked: model.walkLayers.some(l => l.walk === walk.name),
                onClick: () => {
                  model.toggleWalk(walk.name)
                },
              },
            ]
          : []),
        ...(filters && sample && !(shown?.length === 1 && shown[0] === sample)
          ? [
              {
                label: `Show only ${sample}`,
                icon: FilterListIcon,
                onClick: () => {
                  model.setWalkRowSamples([sample])
                },
              },
            ]
          : []),
        ...(filters && shown
          ? [
              {
                label: 'Show every sample',
                icon: FilterListOffIcon,
                onClick: () => {
                  model.setWalkRowSamples(undefined)
                },
              },
            ]
          : []),
      ]}
    />
  )
})

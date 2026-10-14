import { regionLabel } from '@jbrowse/bandage-core/hoverText'
import { ContextMenu } from '@jbrowse/core/ui'
import FilterListIcon from '@mui/icons-material/FilterList'
import FilterListOffIcon from '@mui/icons-material/FilterListOff'
import InfoIcon from '@mui/icons-material/Info'
import LineStyleIcon from '@mui/icons-material/LineStyle'

import { nodeLaunchMenuItems } from '../../launchFromGraph/graphMenuItems'

import type { GraphPaneModel } from '../model'
import type { WalkRows } from '@jbrowse/bandage-core/layout/walkRows'
import type { ContextMenuAnchor, MenuItem } from '@jbrowse/core/ui'

// What a right-click landed on: a node, or a row of `bars`, walk rows' own
// unless a strip's
export type PaneContextAt = ContextMenuAnchor &
  ({ nodeId: string } | { row: number; bars?: WalkRows })

const AT_POINTER = { x: 0, y: 0 }

// Flat rather than under a "Launch view" submenu, since its two or three items
// are all about the node just clicked
function nodeMenuItems(model: GraphPaneModel, nodeId: string): MenuItem[] {
  const { own, reference, highlight } = model.nodeLaunchTargets(nodeId)
  return [
    {
      label: 'Node details',
      icon: InfoIcon,
      onClick: () => {
        model.showNodeDetails(nodeId)
      },
    },
    ...nodeLaunchMenuItems({
      own,
      reference,
      highlight,
      onShowLinear: target => {
        model.showInLinearView(target)
      },
      onHighlight: model.canHighlightInLinearView
        ? target => {
            model.highlightInLinearView(target)
          }
        : undefined,
    }),
  ]
}

// A walk row's bar stands for a span of its haplotype's own contig, so the
// question a right-click asks is answered by a linear view on that assembly,
// with its genes
function walkRowMenuItems(
  model: GraphPaneModel,
  row: number,
  bars: WalkRows | undefined,
): MenuItem[] {
  const rows = bars ?? model.walkRowBars
  const target = model.walkRowLaunchTarget(row, rows)
  const assembly = target?.assembly
  const walk = row > 0 ? rows?.rows[row - 1] : undefined
  const sample = walk?.sample
  // the strip's rows are not walk rows', and take no sample filter
  const filters = !bars && model.walkRowBars
  const shown = model.walkRowSamples
  return [
    target && assembly
      ? {
          label: `Linear genome view — ${assembly} ${regionLabel(target.location)}`,
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
  ]
}

// core's context menu, opened at the pointer itself rather than beside it
export default function PaneContextMenu({
  model,
  at,
  onClose,
}: {
  model: GraphPaneModel
  at: PaneContextAt | undefined
  onClose: () => void
}) {
  return (
    <ContextMenu
      anchor={at}
      offset={AT_POINTER}
      onClose={onClose}
      menuItems={() =>
        at === undefined
          ? []
          : 'nodeId' in at
            ? nodeMenuItems(model, at.nodeId)
            : walkRowMenuItems(model, at.row, at.bars)
      }
    />
  )
}

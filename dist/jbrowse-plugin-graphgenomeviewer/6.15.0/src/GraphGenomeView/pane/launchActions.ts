import { COLOR_SCHEMES } from '@jbrowse/bandage-core/colorSchemes'
import { FACET_FIELDS } from '@jbrowse/bandage-core/facetGrid'
import {
  LAYOUT_MODES,
  layoutModeByValue,
} from '@jbrowse/bandage-core/layoutModes'
import { pushLaunchViewMenuItem } from '@jbrowse/core/ui'
import { getSession } from '@jbrowse/core/util'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import HubIcon from '@mui/icons-material/Hub'
import PaletteIcon from '@mui/icons-material/Palette'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import VisibilityIcon from '@mui/icons-material/Visibility'

import {
  ChooseSamplesDialog,
  ChooseWalksDialog,
  HighlightColorDialog,
  TUBE_MAP_FOLDS,
  TUBE_MAP_MODES,
  WALK_MENU_ITEMS,
} from './paneBase'
import { withRenderingActions } from './renderingActions'
import { graphLaunchMenuItems } from '../../launchFromGraph/graphMenuItems'
import {
  highlightInLinearView,
  launchSyntenyView,
  showInLinearView,
} from '../../launchFromGraph/launchFromGraph'
import { launchTracks } from '../../launchFromGraph/launchTracks'
import { launchableSyntenyTracks } from '../../launchFromGraph/syntenyTracks'
import { downloadText } from '../download'
import { HOVER_HIGHLIGHT_VALUES } from '../hoverHighlight'

import type { GraphLocation } from '../../launchFromGraph/contributors'
import type { ColorScheme } from '@jbrowse/bandage-core/colorSchemes'
import type { MenuItem } from '@jbrowse/core/ui'

export const withLaunchActions = withRenderingActions
  .actions(self => ({
    // Move the linear view already on screen, or open one if there is none,
    // and pair with whichever it was. A view being created gets the session's
    // annotation for the assembly it opens on (see launchTracks), led by the
    // graph's own segments track when the launch is on the reference — the one
    // assembly that track is configured for.
    //
    // Only a view on the reference is paired with. A node's hover band is on
    // that assembly, so paired with a view on another the band fails that
    // view's assembly check and the reference view's id check, and is drawn
    // nowhere.
    showInLinearView(target: { location: GraphLocation; assembly: string }) {
      const session = getSession(self)
      const onReference = target.assembly === self.graphRegion?.assemblyName
      const viewId = showInLinearView({
        session,
        location: target.location,
        assembly: target.assembly,
        connectedViewId: self.connectedViewId,
        tracks: launchTracks({
          session,
          assemblyName: target.assembly,
          first: onReference ? self.sourceTrackId : undefined,
        }),
      })
      if (onReference) {
        self.pairWithLinearView(viewId)
      }
    },
    // Mark the node's reference interval in the linear view beside the graph.
    // Not an action that opens anything: with no view to mark, the menu does
    // not offer it (see nodeLaunchMenuItems).
    highlightInLinearView(target: {
      location: GraphLocation
      assembly: string
    }) {
      highlightInLinearView({
        session: getSession(self),
        location: target.location,
        assembly: target.assembly,
        connectedViewId: self.connectedViewId,
      })
    },
    showSyntenyView(trackId: string) {
      launchSyntenyView({
        session: getSession(self),
        contributors: self.launchableAssemblies,
        trackId,
        graphTrackId: self.sourceTrackId,
      })
    },
  }))
  .views(self => ({
    // Synteny datasets that could fill the panels of a multi-genome launch.
    // Below two openable contributors there is nothing to compare, so the scan
    // is skipped rather than run and discarded.
    get syntenyLaunchTracks() {
      const samples = self.launchableAssemblies.map(c => c.sample)
      return samples.length >= 2
        ? launchableSyntenyTracks(getSession(self), samples)
        : []
    },
  }))
  .views(self => ({
    // Which samples' walks walk rows show: every one, those whose walk and
    // the picked repeat's call disagree, or a set picked by name
    walkRowSampleMenuItems(): MenuItem[] {
      const { disagreeing } = self.walkRowSampleChoices
      const shown = self.walkRowSamples
      const same = (a: string[]) => a.join('\n') === shown?.join('\n')
      return [
        {
          type: 'radio',
          label: 'Every sample',
          checked: shown === undefined,
          onClick: () => {
            self.setWalkRowSamples(undefined)
          },
        },
        ...(disagreeing.length > 0
          ? [
              {
                type: 'radio' as const,
                label: 'Where walk and call disagree',
                checked: same(disagreeing),
                onClick: () => {
                  self.setWalkRowSamples(disagreeing)
                },
              },
            ]
          : []),
        {
          type: 'radio',
          label: 'Choose samples...',
          checked: shown !== undefined && !same(disagreeing),
          onClick: () => {
            getSession(self).queueDialog(onClose => [
              ChooseSamplesDialog,
              { model: self, onClose },
            ])
          },
        },
      ]
    },
    // Which sample table column walk rows stack into sections by
    walkRowGroupMenuItems(): MenuItem[] {
      const field = self.walkRowGroups ? self.walkRowGroupBy?.field : undefined
      return [
        {
          type: 'radio',
          label: 'None',
          checked: field === undefined,
          onClick: () => {
            self.setWalkRowGroupBy(undefined)
          },
        },
        ...self.walkRowGroupFields.map(column => ({
          type: 'radio' as const,
          label: column,
          checked: field === column,
          onClick: () => {
            self.setWalkRowGroupBy({ field: column })
          },
        })),
      ]
    },
    // `repeat` false where a toolbar already picks the repeat
    layoutOptionMenuItems({ repeat = true } = {}): MenuItem[] {
      return [
        ...(TUBE_MAP_MODES.has(self.chosenLayoutMode)
          ? [
              {
                label: 'Fold variants',
                subMenu: TUBE_MAP_FOLDS.map(({ bp, label }) => ({
                  type: 'radio' as const,
                  label,
                  checked: self.tubeMapFold === bp,
                  disabled: bp > 0 && self.graph?.reads !== undefined,
                  onClick: () => {
                    self.setTubeMapFold(bp)
                    void self.recomputeLayout()
                  },
                })),
              },
            ]
          : []),
        ...(repeat &&
        self.chosenLayoutMode === 'walkrows' &&
        self.repeatChoices.length > 0
          ? [
              {
                label: 'Repeat',
                subMenu: [
                  {
                    type: 'radio' as const,
                    label: 'Whole window',
                    checked: !self.selectedRepeat,
                    onClick: () => {
                      self.setRepeatKey('')
                    },
                  },
                  ...self.repeatChoices.map(({ key, name, unit }) => ({
                    type: 'radio' as const,
                    label: `${name} · ${unit.toLocaleString()} bp unit`,
                    checked: self.repeatKey === key,
                    onClick: () => {
                      self.setRepeatKey(key)
                    },
                  })),
                ],
              },
            ]
          : []),
        ...(self.chosenLayoutMode === 'walkrows' && self.walkRowBars
          ? [{ label: 'Samples', subMenu: this.walkRowSampleMenuItems() }]
          : []),
        ...(self.chosenLayoutMode === 'walkrows' &&
        self.walkRowBars &&
        self.walkRowGroupFields.length > 0
          ? [{ label: 'Group by...', subMenu: this.walkRowGroupMenuItems() }]
          : []),
      ]
    },
    showMenuItems(): MenuItem[] {
      return [
        {
          type: 'checkbox',
          label: 'Show bubble halos',
          checked: self.showBubbles,
          onClick: () => {
            self.setShowBubbles(!self.showBubbles)
          },
        },
        {
          type: 'checkbox',
          label: 'Show deletion edges',
          checked: self.showDeletionEdges,
          onClick: () => {
            void self.toggleDeletionEdges()
          },
        },
        {
          label: 'Hover highlight',
          subMenu: HOVER_HIGHLIGHT_VALUES.map(value => ({
            type: 'radio' as const,
            label: value[0]!.toUpperCase() + value.slice(1),
            checked: self.chosenHover === value,
            onClick: () => {
              self.setHover(value)
            },
          })),
        },
        {
          type: 'checkbox',
          label: 'Show genes on the backbone',
          checked: self.showGenes,
          onClick: () => {
            self.setShowGenes(!self.showGenes)
          },
        },
        ...(self.referenceStripApplies
          ? [
              {
                type: 'checkbox' as const,
                label: 'Show reference strip',
                checked: self.showReferenceStrip,
                onClick: () => {
                  self.setShowReferenceStrip(!self.showReferenceStrip)
                },
              },
            ]
          : []),
      ]
    },
    exportMenuItems(): MenuItem[] {
      return [
        {
          label: 'Export SVG',
          icon: PhotoCameraIcon,
          disabled: self.figureUnavailable !== undefined,
          disabledHelpText: self.figureUnavailable,
          onClick: () => {
            const svg = self.figure()
            if (svg) {
              downloadText(
                svg,
                `${(self.graph?.name ?? 'graph').replaceAll(/[^\w.-]+/g, '_')}.svg`,
              )
            }
          },
        },
        {
          label: 'Copy figure spec',
          icon: ContentCopyIcon,
          disabled: self.figureSpecUnavailable !== undefined,
          disabledHelpText: self.figureSpecUnavailable,
          onClick: () => {
            const spec = self.figureSpec()
            const session = getSession(self)
            navigator.clipboard
              .writeText(`${JSON.stringify(spec, null, 2)}\n`)
              .then(() => {
                session.notify(
                  'Figure spec copied. Save it as spec.json and run: npx -p @jbrowse/bandage-core bandage-figure spec.json -o figure.svg',
                  'info',
                )
              })
              .catch((e: unknown) => {
                session.notify(`Could not copy the figure spec: ${String(e)}`)
              })
          },
        },
      ]
    },
    // `picks` false where a toolbar already picks the walks, leaving what is
    // done with those picked
    highlightMenuItems({ picks = true } = {}): MenuItem[] {
      const walks = picks ? self.walkChoices : []
      if (
        self.walkChoices.length === 0 ||
        !self.liftsWalks ||
        (!picks && self.walkLayers.length === 0)
      ) {
        return []
      }
      const lifted = (name: string) =>
        self.walkLayers.some(l => l.walk === name)
      const many = walks.length > WALK_MENU_ITEMS
      return [
        { type: 'subHeader', label: 'Highlight' },
        ...(many
          ? [
              {
                label: 'Choose haplotypes...',
                onClick: () => {
                  getSession(self).queueDialog(onClose => [
                    ChooseWalksDialog,
                    { model: self, onClose },
                  ])
                },
              },
            ]
          : []),
        ...(many ? walks.filter(walk => lifted(walk.name)) : walks).map(
          walk => ({
            type: 'checkbox' as const,
            label: walk.label,
            checked: lifted(walk.name),
            onClick: () => {
              self.toggleWalk(walk.name)
            },
          }),
        ),
        {
          label: 'Clear highlights',
          disabled: self.walkLayers.length === 0,
          onClick: () => {
            self.setWalkLayers([])
          },
        },
        ...(self.drawnWalks.length > 0
          ? [
              {
                label: 'Color highlighted...',
                onClick: () => {
                  getSession(self).queueDialog(onClose => [
                    HighlightColorDialog,
                    { model: self, onClose },
                  ])
                },
              },
            ]
          : []),
        ...(self.walkLayers.length > 1 && self.modeDrawsNodes
          ? [
              { type: 'subHeader' as const, label: 'Arrange' },
              ...FACET_FIELDS.map(({ value, label }) => ({
                type: 'radio' as const,
                label: value === 'walk' ? 'A panel per haplotype' : label,
                checked: self.facetSetting.field === value,
                onClick: () => {
                  self.setFacet(value)
                },
              })),
            ]
          : []),
      ]
    },
    colorSchemeLabel(value: ColorScheme): string {
      const label = COLOR_SCHEMES.find(s => s.value === value)?.label ?? value
      return value === 'auto'
        ? `${label} (${this.colorSchemeLabel(self.effectiveColorScheme)})`
        : label
    },
    graphMenuItems(): MenuItem[] {
      const options = this.layoutOptionMenuItems()
      return [
        {
          label: `Layout: ${layoutModeByValue(self.chosenLayoutMode).label.replace(/ layout$/, '')}`,
          icon: HubIcon,
          subMenu: [
            ...LAYOUT_MODES.map(mode => ({
              type: 'radio' as const,
              label: mode.label,
              checked: self.chosenLayoutMode === mode.value,
              disabled: self.graph ? !mode.available(self.graph) : false,
              disabledHelpText: mode.description,
              onClick: () => {
                void self.switchLayout(mode.value)
              },
            })),
            ...(options.length > 0
              ? [{ type: 'divider' as const }, ...options]
              : []),
            ...(self.hostPlacesX
              ? []
              : [
                  { type: 'divider' as const },
                  {
                    label: 'Zoom to fit',
                    onClick: () => {
                      self.refitView()
                    },
                  },
                ]),
          ],
        },
        {
          label: `Color: ${this.colorSchemeLabel(self.chosenColorScheme)}`,
          icon: PaletteIcon,
          subMenu: COLOR_SCHEMES.map(scheme => ({
            type: 'radio' as const,
            label: this.colorSchemeLabel(scheme.value),
            checked: self.chosenColorScheme === scheme.value,
            onClick: () => {
              self.setColorScheme(scheme.value)
            },
          })),
        },
        {
          label: 'Show...',
          icon: VisibilityIcon,
          subMenu: this.showMenuItems(),
        },
      ]
    },
    // the graph's way out, in the "Launch view" submenu every view shares
    launchMenuItems(): MenuItem[] {
      const items: MenuItem[] = []
      for (const item of graphLaunchMenuItems({
        contributors: self.launchableAssemblies,
        syntenyTracks: self.syntenyLaunchTracks,
        onShowLinear: target => {
          self.showInLinearView(target)
        },
        onShowSynteny: trackId => {
          self.showSyntenyView(trackId)
        },
      })) {
        pushLaunchViewMenuItem(items, item)
      }
      return items
    },
  }))

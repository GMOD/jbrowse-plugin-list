import { COLOR_SCHEMES } from '@jbrowse/bandage-core/colorSchemes'
import { FACET_FIELDS } from '@jbrowse/bandage-core/facetGrid'
import {
  LAYOUT_MODES,
  layoutModeByValue,
} from '@jbrowse/bandage-core/layoutModes'
import { getSession } from '@jbrowse/core/util'
import { getEnv } from '@jbrowse/mobx-state-tree'
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
  TUBE_MAP_ROUTES,
  WALK_MENU_ITEMS,
} from './paneBase'
import { withRenderingActions } from './renderingActions'
import { graphLaunchMenuItems } from '../../launchFromGraph/graphMenuItems'
import {
  canonicalAssemblyName,
  highlightInLinearView,
  launchSyntenyView,
  showInLinearView,
} from '../../launchFromGraph/launchFromGraph'
import { pushLaunchItem } from '../../launchFromGraph/pushLaunchItem'
import { launchableSyntenyTracks } from '../../launchFromGraph/syntenyTracks'
import { downloadText } from '../download'
import { GENE_ADAPTER_TYPES } from '../genes/geneFeatures'
import { HOVER_HIGHLIGHT_VALUES } from '../hoverHighlight'
import { TUBE_MAP_PANELS, tubeMapPanelGroups } from '../tubeMapPanels'

import type { GraphLocation } from '../../launchFromGraph/contributors'
import type { GraphLayer } from '../graphLayers'
import type { TubeMapPanelSplit } from '../tubeMapPanels'
import type { ColorScheme } from '@jbrowse/bandage-core/colorSchemes'
import type { LayoutEngineKind } from '@jbrowse/bandage-core/layoutEngines'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { MenuItem } from '@jbrowse/core/ui'

const ENGINE_NAMES: readonly (readonly [LayoutEngineKind, string])[] = [
  ['fmmm', 'FMMM'],
  ['stress', 'stress'],
]

const layoutMenuLabel = (mode: { label: string }) =>
  mode.label.replace(/ layout$/, '')

function radioItems<T>(
  options: readonly { value: T; label: string; disabled?: boolean }[],
  current: T | undefined,
  onPick: (value: T) => void,
): MenuItem[] {
  return options.map(({ value, label, disabled }) => ({
    type: 'radio',
    label,
    disabled,
    checked: value === current,
    onClick: () => {
      onPick(value)
    },
  }))
}

export const withLaunchActions = withRenderingActions
  .actions(self => ({
    // Move the linear view already on screen, or open one if there is none,
    // and pair with whichever it was. A view being created gets the graph's
    // own track when the launch is on the reference, plus the one gene track
    // the graph reads for that assembly: a hub config can hold hundreds of
    // FeatureTracks per assembly, and a launch is a jump to a locus.
    //
    // Only a view on the reference is paired with. A node's hover band is on
    // that assembly, so paired with a view on another the band fails that
    // view's assembly check and the reference view's id check, and is drawn
    // nowhere.
    showInLinearView(target: { location: GraphLocation; assembly: string }) {
      const session = getSession(self)
      const onReference = target.assembly === self.graphRegion?.assemblyName
      const assembly = canonicalAssemblyName(session, target.assembly)
      // an assembly whose annotation nothing names as genes, a strain's BED,
      // still opens on its first feature track rather than on none
      const geneTrack =
        (onReference
          ? self.geneTrack
          : self.geneTracksByAssembly.get(assembly)) ??
        self.sessionTracks.find(
          t =>
            t.assemblies.includes(assembly) &&
            GENE_ADAPTER_TYPES.has(t.adapterType),
        )
      const viewId = showInLinearView({
        session,
        location: target.location,
        assembly: target.assembly,
        connectedViewId: self.pairedViewId,
        tracks: [
          ...new Set(
            [
              onReference ? self.sourceTrackId : undefined,
              geneTrack?.trackId,
            ].filter(id => id !== undefined),
          ),
        ],
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
        connectedViewId: self.pairedViewId,
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
        ? launchableSyntenyTracks(
            getSession(self),
            samples,
            getEnv<{ pluginManager: PluginManager }>(self).pluginManager,
          )
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
      return radioItems(
        [
          { value: undefined, label: 'None' },
          ...self.walkRowGroupFields.map(c => ({ value: c, label: c })),
        ],
        field,
        c => {
          self.setWalkRowGroupBy(c === undefined ? undefined : { field: c })
        },
      )
    },
    // A tube map's panels: none, a sample's or a walk's each, or a group of
    // samples' each by a column of the source track's sample table
    tubeMapPanelMenuItems(): MenuItem[] {
      const { graph, walkRowSampleTable: table } = self
      const { field } = self.facetSetting
      const column = field === '' ? self.walkRowGroupBy?.field : undefined
      const splits = (split: TubeMapPanelSplit) =>
        !!graph && tubeMapPanelGroups(graph, split).length > 1
      return [
        ...radioItems(
          TUBE_MAP_PANELS.map(item => ({
            value: item.field,
            label: item.label,
            disabled: item.field !== '' && !splits({ by: item.field }),
          })),
          column ? undefined : field,
          by => {
            self.setFacet(by)
            if (by === '') {
              self.setWalkRowGroupBy(undefined)
            }
          },
        ),
        ...radioItems(
          self.walkRowGroupFields.map(c => ({
            value: c,
            label: `By ${c}`,
            disabled: !table || !splits({ by: 'column', field: c, table }),
          })),
          column,
          c => {
            self.setFacet('')
            self.setWalkRowGroupBy({ field: c })
          },
        ),
      ]
    },
    // `repeat` false where a toolbar already picks the repeat
    layoutOptionMenuItems({ repeat = true } = {}): MenuItem[] {
      return [
        ...(TUBE_MAP_MODES.has(self.chosenLayoutMode)
          ? [
              {
                label: 'Fold variants',
                // reads are placed by the cut's names, which a fold renames
                subMenu: radioItems(
                  TUBE_MAP_FOLDS.map(({ bp, label }) => ({
                    value: bp,
                    label,
                    disabled: bp > 0 && self.graph?.reads !== undefined,
                  })),
                  self.graph?.reads ? 0 : self.tubeMapFold,
                  self.setTubeMapFold,
                ),
              },
              {
                label: 'Panels',
                subMenu: this.tubeMapPanelMenuItems(),
              },
              {
                label: 'Routes',
                subMenu: radioItems(
                  TUBE_MAP_ROUTES,
                  self.tubeMapRoutes,
                  self.setTubeMapRoutes,
                ),
              },
              ...(self.walkRowGroupFields.length > 0
                ? [
                    {
                      label: 'Tube color',
                      subMenu: radioItems(
                        ['', ...self.walkRowGroupFields].map(field => ({
                          value: field,
                          label: field ? `By ${field}` : 'By role',
                        })),
                        self.tubeMapColorBy,
                        self.setTubeMapColorBy,
                      ),
                    },
                  ]
                : []),
            ]
          : []),
        ...(repeat &&
        self.chosenLayoutMode === 'walkrows' &&
        self.repeatChoices.length > 0
          ? [
              {
                label: 'Repeat',
                subMenu: radioItems(
                  self.repeatOptions,
                  self.selectedRepeat?.key ?? '',
                  self.setRepeatKey,
                ),
              },
            ]
          : []),
        ...(self.chosenLayoutMode === 'walkrows' && self.walkRowBars
          ? [
              { label: 'Samples', subMenu: this.walkRowSampleMenuItems() },
              {
                type: 'checkbox' as const,
                label: 'Ribbons between rows',
                checked: self.walkRibbons,
                onClick: () => {
                  self.setLayer('walkRibbons', !self.walkRibbons)
                },
              },
              {
                type: 'checkbox' as const,
                label: 'Letter shared blocks',
                checked: self.layerSet.has('walkBlocks'),
                onClick: () => {
                  self.setLayer('walkBlocks', !self.layerSet.has('walkBlocks'))
                },
              },
              {
                type: 'checkbox' as const,
                label: 'Order rows by shared sequence',
                checked: self.walkRowOrder === 'shared',
                onClick: () => {
                  self.setWalkRowOrder(
                    self.walkRowOrder === 'shared' ? undefined : 'shared',
                  )
                },
              },
            ]
          : []),
        ...(self.chosenLayoutMode === 'walkrows' &&
        self.walkRowBars &&
        self.walkRowGroupFields.length > 0
          ? [{ label: 'Group by...', subMenu: this.walkRowGroupMenuItems() }]
          : []),
      ]
    },
    showMenuItems(): MenuItem[] {
      const layerItem = (label: string, layer: GraphLayer) => ({
        type: 'checkbox' as const,
        label,
        checked: self.layerSet.has(layer),
        onClick: () => {
          self.setLayer(layer, !self.layerSet.has(layer))
        },
      })
      return [
        layerItem('Show bubble halos', 'bubbles'),
        layerItem('Show deletion edges', 'deletions'),
        {
          label: 'Hover highlight',
          subMenu: radioItems(
            HOVER_HIGHLIGHT_VALUES.map(value => ({
              value,
              label: value[0]!.toUpperCase() + value.slice(1),
            })),
            self.chosenHover,
            self.setHover,
          ),
        },
        layerItem('Show genes on the backbone', 'genes'),
        ...(self.referenceStripApplies
          ? [layerItem('Show reference strip', 'referenceStrip')]
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
              ...radioItems(
                FACET_FIELDS.map(({ value, label }) => ({
                  value,
                  label: value === 'walk' ? 'A panel per haplotype' : label,
                })),
                self.facetSetting.field,
                self.setFacet,
              ),
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
      const mode = layoutModeByValue(self.chosenLayoutMode)
      const engine = ENGINE_NAMES.find(([e]) => e === self.layoutEngine)![1]
      return [
        {
          label: `Layout: ${layoutMenuLabel(mode)}${mode.value === 'force' ? ` (${engine})` : ''}`,
          icon: HubIcon,
          subMenu: [
            ...LAYOUT_MODES.flatMap(mode => {
              const item = {
                type: 'radio' as const,
                disabled: self.graph ? !mode.available(self.graph) : false,
                disabledHelpText: mode.description,
              }
              return mode.value === 'force'
                ? ENGINE_NAMES.map(([engine, name]) => ({
                    ...item,
                    label: `${layoutMenuLabel(mode)} (${name})`,
                    checked:
                      self.chosenLayoutMode === mode.value &&
                      self.layoutEngine === engine,
                    onClick: () => {
                      void self.switchForceEngine(engine)
                    },
                  }))
                : [
                    {
                      ...item,
                      label: layoutMenuLabel(mode),
                      checked: self.chosenLayoutMode === mode.value,
                      onClick: () => {
                        void self.switchLayout(mode.value)
                      },
                    },
                  ]
            }),
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
          label: `Color: ${self.colorSchemeLock?.value ?? this.colorSchemeLabel(self.chosenColorScheme)}`,
          icon: PaletteIcon,
          disabled: self.colorSchemeLock !== undefined,
          disabledHelpText: self.colorSchemeLock?.why,
          subMenu: radioItems(
            COLOR_SCHEMES.map(({ value }) => ({
              value,
              label: this.colorSchemeLabel(value),
            })),
            self.chosenColorScheme,
            self.setColorScheme,
          ),
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
      const contributors = self.launchableAssemblies
      const reference = self.graphRegion?.assemblyName
      for (const item of graphLaunchMenuItems({
        contributors,
        linearContributors: self.host
          ? contributors.filter(c => c.sample !== reference)
          : contributors,
        syntenyTracks: self.syntenyLaunchTracks,
        onShowLinear: target => {
          self.showInLinearView(target)
        },
        onShowSynteny: trackId => {
          self.showSyntenyView(trackId)
        },
      })) {
        pushLaunchItem(items, item)
      }
      return items
    },
  }))

import { COLOR_SCHEMES } from '@jbrowse/bandage-core/colorSchemes'
import { LAYOUT_MODES } from '@jbrowse/bandage-core/layoutModes'
import { WALK_FIELDS, WALK_SCHEMES } from '@jbrowse/bandage-core/walkEncoding'
import { pushLaunchViewMenuItem } from '@jbrowse/core/ui'
import { getSession } from '@jbrowse/core/util'

import {
  ChooseWalksDialog,
  FACETS,
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

import type { GraphLocation } from '../../launchFromGraph/contributors'
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
    // The graph's way out, in the same shared "Launch view" submenu every
    // other view contributes to. Until this existed the triangle had two edges:
    // a linear view could open a graph or a synteny view of a locus, and the
    // graph could open nothing at all.
    graphMenuItems(): MenuItem[] {
      const walks = self.walkChoices
      return [
        {
          label: 'Layout',
          subMenu: LAYOUT_MODES.map(mode => ({
            type: 'radio' as const,
            label: mode.label,
            checked: self.chosenLayoutMode === mode.value,
            disabled: self.graph ? !mode.available(self.graph) : false,
            onClick: () => {
              void self.switchLayout(mode.value)
            },
          })),
        },
        {
          label: 'Color',
          subMenu: COLOR_SCHEMES.map(scheme => ({
            type: 'radio' as const,
            label: scheme.label,
            checked: self.chosenColorScheme === scheme.value,
            onClick: () => {
              self.setColorScheme(scheme.value)
            },
          })),
        },
        ...(walks.length > 0 && self.liftsWalks
          ? [
              {
                label: 'Walk',
                subMenu: [
                  {
                    label: 'None',
                    onClick: () => {
                      self.setWalkLayers([])
                    },
                  },
                  ...(self.walkLayers.length > 1 && self.modeDrawsNodes
                    ? [
                        {
                          label: 'Side by side',
                          subMenu: FACETS.map(({ value, label }) => ({
                            type: 'radio' as const,
                            label,
                            checked: self.facet.field === value,
                            onClick: () => {
                              self.setFacet(value)
                            },
                          })),
                        },
                      ]
                    : []),
                  ...(self.facetPanels &&
                  self.facet.field === 'walk' &&
                  !self.hostPlacesX
                    ? [
                        {
                          label: 'Columns',
                          subMenu: [
                            undefined,
                            ...self.facetPanels.map((_, i) => i + 1),
                          ].map(columns => ({
                            type: 'radio' as const,
                            label:
                              columns === undefined ? 'Auto' : `${columns}`,
                            checked: self.facet.columns === columns,
                            onClick: () => {
                              self.setFacetColumns(columns)
                            },
                          })),
                        },
                      ]
                    : []),
                  ...(walks.length > WALK_MENU_ITEMS
                    ? [
                        {
                          label: 'Choose walks...',
                          onClick: () => {
                            getSession(self).queueDialog(onClose => [
                              ChooseWalksDialog,
                              { model: self, onClose },
                            ])
                          },
                        },
                      ]
                    : []),
                  ...(walks.length > WALK_MENU_ITEMS
                    ? walks.filter(walk =>
                        self.walkLayers.some(l => l.walk === walk.name),
                      )
                    : walks
                  ).map(walk => ({
                    type: 'checkbox' as const,
                    label: walk.label,
                    checked: self.walkLayers.some(l => l.walk === walk.name),
                    onClick: () => {
                      self.toggleWalk(walk.name)
                    },
                  })),
                  ...self.drawnWalks.map(lifted => ({
                    label: `Colour ${self.walkLabel(lifted.name)}`,
                    subMenu: [
                      { type: 'subHeader' as const, label: 'Colour by' },
                      ...WALK_FIELDS.map(field => ({
                        type: 'radio' as const,
                        label: field.label,
                        checked: lifted.encoding.field === field.value,
                        onClick: () => {
                          self.setWalkColor(lifted.name, {
                            field: field.value,
                          })
                        },
                      })),
                      { type: 'subHeader' as const, label: 'Palette' },
                      // the rainbow is the reference-position ramp
                      ...WALK_SCHEMES.filter(
                        scheme =>
                          scheme.value !== 'rainbow' ||
                          lifted.encoding.field === 'reference',
                      ).map(scheme => ({
                        type: 'radio' as const,
                        label: scheme.label,
                        checked: lifted.encoding.scheme === scheme.value,
                        onClick: () => {
                          self.setWalkColor(lifted.name, {
                            scheme: scheme.value,
                          })
                        },
                      })),
                    ],
                  })),
                ],
              },
            ]
          : []),
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
        ...(self.chosenLayoutMode === 'walkrows' &&
        self.repeatChoices.length > 0
          ? [
              {
                label: 'Repeat',
                subMenu: [
                  {
                    type: 'radio' as const,
                    label: 'Whole window',
                    checked: self.repeatKey === '',
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
        ...(self.hostPlacesX
          ? []
          : [
              {
                label: 'Zoom in',
                onClick: () => {
                  self.zoom(
                    1.5,
                    self.viewBox.width / 2,
                    self.viewBox.height / 2,
                  )
                },
              },
              {
                label: 'Zoom out',
                onClick: () => {
                  self.zoom(
                    1 / 1.5,
                    self.viewBox.width / 2,
                    self.viewBox.height / 2,
                  )
                },
              },
              {
                label: 'Zoom to fit',
                onClick: () => {
                  self.zoomToFit()
                },
              },
            ]),
        {
          type: 'checkbox',
          label: 'Mark bubbles',
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
          type: 'checkbox',
          label: 'Genes on the backbone',
          checked: self.showGenes,
          onClick: () => {
            self.setShowGenes(!self.showGenes)
          },
        },
        ...(!self.host &&
        self.modeDrawsNodes &&
        (self.graph?.paths?.length ?? 0) > 1
          ? [
              {
                type: 'checkbox' as const,
                label: 'Walk rows under the graph',
                checked: self.walkStrip,
                onClick: () => {
                  self.setWalkStrip(!self.walkStrip)
                },
              },
            ]
          : []),
        ...(self.referenceStripApplies
          ? [
              {
                type: 'checkbox' as const,
                label: 'Reference strip at bp',
                checked: self.showReferenceStrip,
                onClick: () => {
                  self.setShowReferenceStrip(!self.showReferenceStrip)
                },
              },
            ]
          : []),
        {
          label: 'Export SVG',
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

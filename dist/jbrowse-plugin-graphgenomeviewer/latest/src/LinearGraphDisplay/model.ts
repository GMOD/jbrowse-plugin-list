import { lazy } from 'react'

import { ConfigurationReference, getConf } from '@jbrowse/core/configuration'
import { BaseDisplay } from '@jbrowse/core/pluggableElementTypes'
import { getContainingView, getSession } from '@jbrowse/core/util'
import TrackHeightMixin from '@jbrowse/display-kit/TrackHeightMixin'
import { addDisposer, types } from '@jbrowse/mobx-state-tree'
import SettingsIcon from '@mui/icons-material/Settings'
import { autorun } from 'mobx'

import { COLOR_SCHEMES } from '../GraphGenomeView/colorSchemes'
import { isLinearHost } from '../GraphGenomeView/host'
import { LAYOUT_MODES } from '../GraphGenomeView/layoutModes'
import paneModelFactory from '../GraphGenomeView/model'

import type { LinearGraphDisplayConfigModel } from './configSchema'
import type { MenuItem } from '@jbrowse/core/ui'
import type { Instance } from '@jbrowse/mobx-state-tree'

const GraphSettingsDialog = lazy(
  () => import('../GraphGenomeView/components/GraphSettingsDialog'),
)

export function stateModelFactory(configSchema: LinearGraphDisplayConfigModel) {
  const Pane = paneModelFactory()
  return (
    types
      .compose(
        'LinearGraphDisplay',
        BaseDisplay,
        TrackHeightMixin(),
        types.model({
          type: types.literal('LinearGraphDisplay'),
          configuration: ConfigurationReference(configSchema),
          // The graph pane, the same model the standalone view is. Here the
          // linear view above is its host: x is that view's window for a layout
          // whose x is reference bp, and the cut is re-made when the window
          // leaves it (pane.host).
          pane: types.optional(Pane, () => ({
            type: 'GraphGenomeView' as const,
          })),
          // The config's layout and colour reach the pane once, so a choice made
          // in the track menu survives a reload.
          configured: types.optional(types.boolean, false),
        }),
      )
      // A launch that states the pane's props takes them over the config's
      // layout and colour, and names them without the pane's own type.
      .preProcessSnapshot(snapshot => {
        const pane = (snapshot as { pane?: Record<string, unknown> }).pane
        return pane
          ? ({
              configured: true,
              ...snapshot,
              pane:
                pane.type === undefined
                  ? { type: 'GraphGenomeView', ...pane }
                  : pane,
            } as typeof snapshot)
          : snapshot
      })
      .views(self => ({
        get host() {
          let view: unknown
          try {
            view = getContainingView(self)
          } catch {
            return undefined
          }
          return isLinearHost(view) ? view : undefined
        },
        get trackId(): string {
          return getConf(self.parentTrack, 'trackId')
        },
      }))
      .views(self => ({
        trackMenuItems(): MenuItem[] {
          const { pane } = self
          const { graph } = pane
          const walks = pane.walkChoices
          return [
            {
              label: 'Layout',
              subMenu: LAYOUT_MODES.map(mode => ({
                type: 'radio' as const,
                label: mode.label,
                checked: pane.layoutMode === mode.value,
                disabled: graph ? !mode.available(graph) : false,
                onClick: () => {
                  void pane.switchLayout(mode.value)
                },
              })),
            },
            {
              label: 'Color',
              subMenu: COLOR_SCHEMES.map(scheme => ({
                type: 'radio' as const,
                label: scheme.label,
                checked: pane.colorScheme === scheme.value,
                onClick: () => {
                  pane.setColorScheme(scheme.value)
                },
              })),
            },
            ...(walks.length > 0
              ? [
                  {
                    label: 'Walk',
                    subMenu: [
                      {
                        type: 'radio' as const,
                        label: 'None',
                        checked: pane.highlightedPath === '',
                        onClick: () => {
                          pane.setHighlightedPath('')
                        },
                      },
                      ...walks.map(walk => ({
                        type: 'radio' as const,
                        label: walk.label,
                        checked: pane.highlightedPath === walk.name,
                        onClick: () => {
                          pane.setHighlightedPath(walk.name)
                        },
                      })),
                    ],
                  },
                ]
              : []),
            ...(pane.hostPlacesX
              ? []
              : [
                  {
                    label: 'Zoom in',
                    onClick: () => {
                      pane.zoom(1.5, pane.width / 2, pane.canvasHeight / 2)
                    },
                  },
                  {
                    label: 'Zoom out',
                    onClick: () => {
                      pane.zoom(1 / 1.5, pane.width / 2, pane.canvasHeight / 2)
                    },
                  },
                  {
                    label: 'Zoom to fit',
                    onClick: () => {
                      pane.zoomToFit()
                    },
                  },
                ]),
            {
              type: 'checkbox',
              label: 'Mark bubbles',
              checked: pane.showBubbles,
              onClick: () => {
                pane.setShowBubbles(!pane.showBubbles)
              },
            },
            {
              type: 'checkbox',
              label: 'Show deletion edges',
              checked: pane.showDeletionEdges,
              onClick: () => {
                pane.setShowDeletionEdges(!pane.showDeletionEdges)
              },
            },
            {
              type: 'checkbox',
              label: 'Genes on the backbone',
              checked: pane.showGenes,
              onClick: () => {
                pane.setShowGenes(!pane.showGenes)
              },
            },
            {
              label: 'Settings',
              icon: SettingsIcon,
              onClick: () => {
                getSession(self).queueDialog(onClose => [
                  GraphSettingsDialog,
                  { model: pane, open: true, onClose },
                ])
              },
            },
          ]
        },
      }))
      .actions(self => ({
        setConfigured() {
          self.configured = true
        },
        // The track's height is the pane's ceiling: a layout shorter than it
        // takes only what it needs, and a drag on the handle moves the ceiling.
        resizeHeight(distance: number) {
          const before = self.height
          const target = Math.max(before + distance, 40)
          self.pane.setPaneHeight(target)
          return target - before
        },
      }))
      .actions(self => ({
        afterAttach() {
          const { pane } = self
          if (!self.configured) {
            pane.setLayoutMode(getConf(self, 'layoutMode'))
            pane.setColorScheme(getConf(self, 'colorScheme'))
            pane.setPaneHeight(getConf(self, 'height'))
            self.setConfigured()
          }
          pane.adoptTrack(self.trackId)
          pane.startHosting()
          addDisposer(
            self,
            autorun(
              () => {
                const { host } = self
                if (host) {
                  pane.setWidth(host.width)
                  pane.pairWithLinearView(host.id)
                }
              },
              { name: 'LinearGraphDisplayHost' },
            ),
          )
          addDisposer(
            self,
            autorun(
              () => {
                const height = pane.canvasHeight
                if (self.height !== height) {
                  self.setHeight(height)
                }
              },
              { name: 'LinearGraphDisplayHeight' },
            ),
          )
        },
      }))
  )
}

export type LinearGraphDisplayStateModel = ReturnType<typeof stateModelFactory>
export type LinearGraphDisplayModel = Instance<LinearGraphDisplayStateModel>

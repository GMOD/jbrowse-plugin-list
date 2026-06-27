import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes'
import { ElementId } from '@jbrowse/core/util/types/mst'
import { addDisposer, types } from '@jbrowse/mobx-state-tree'
import SettingsIcon from '@mui/icons-material/Settings'
import Visibility from '@mui/icons-material/Visibility'
import { autorun } from 'mobx'

import {
  COLOR_SCHEMES,
  COLOR_SCHEME_VALUES,
  type ProteinColorScheme,
  applyColorTheme,
} from './applyColorTheme'
import { loadStructureData } from './loadStructureData'
import { makeStructureLoader } from './structureLoader'
import Structure from './structureModel'
import { superposeStructures } from './superposeStructures'
import { type AlignmentAlgorithm, DEFAULT_ALIGNMENT_ALGORITHM } from './types'

const SETTINGS_KEY = 'proteinView-settings'
const PERSISTED_SETTINGS = [
  'showAlignment',
  'showProteinTracks',
  'showHighlight',
  'zoomToBaseLevel',
  'autoScrollAlignment',
  'compactTracks',
] as const

import type { Instance } from '@jbrowse/mobx-state-tree'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export interface ProteinViewInitState {
  structures?: {
    url?: string
    data?: string
  }[]
  showControls?: boolean
  showAlignment?: boolean
}

/**
 * #stateModel Protein3dViewPlugin
 * extends
 * - BaseViewModel
 */
function stateModelFactory() {
  return types
    .compose(
      'ProteinView',
      BaseViewModel,
      types.model({
        /**
         * #property
         */
        id: ElementId,
        /**
         * #property
         */
        type: types.literal('ProteinView'),
        /**
         * #property
         */
        structures: types.array(Structure),

        /**
         * #property
         */
        showControls: false,
        /**
         * #property
         */
        height: types.optional(types.number, 650),

        /**
         * #property
         */
        showHighlight: false,
        /**
         * #property
         */
        zoomToBaseLevel: true,
        /**
         * #property
         */
        autoScrollAlignment: false,
        /**
         * #property
         * molstar color-theme name applied to all loaded structures
         */
        colorScheme: types.optional(
          types.enumeration<ProteinColorScheme>(
            'ColorScheme',
            COLOR_SCHEME_VALUES,
          ),
          'default',
        ),
        /**
         * #property
         */
        showAlignment: true,
        /**
         * #property
         */
        showProteinTracks: true,
        /**
         * #property
         * render the feature/residue tracks at reduced height
         */
        compactTracks: true,
        /**
         * #property
         */
        alignmentAlgorithm: types.optional(
          types.string,
          DEFAULT_ALIGNMENT_ALGORITHM,
        ),

        /**
         * #property
         * ID of connected MSA view for hover synchronization
         */
        connectedMsaViewId: types.maybe(types.string),

        /**
         * #property
         * used for loading the protein view via session snapshots, e.g.
         * {
         *   "type": "ProteinView",
         *   "init": {
         *     "structures": [
         *       { "url": "https://files.rcsb.org/download/1A2B.pdb" }
         *     ],
         *     "showControls": true
         *   }
         * }
         */
        init: types.frozen<ProteinViewInitState | undefined>(),
      }),
    )
    .volatile(() => ({
      /**
       * #volatile
       */
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      error: undefined as unknown,
      /**
       * #volatile
       */
      molstarPluginContext: undefined as PluginContext | undefined,
      /**
       * #volatile
       */
      showManualAlignmentDialog: false,
      /**
       * #volatile
       */
      showAddStructureDialog: false,
    }))

    .actions(self => ({
      /**
       * #action
       */
      setHeight(n: number) {
        self.height = n
        return n
      },
      /**
       * #action
       */
      setShowAlignment(f: boolean) {
        self.showAlignment = f
      },

      /**
       * #action
       */
      setShowControls(arg: boolean) {
        self.showControls = arg
      },

      /**
       * #action
       */
      setError(e: unknown) {
        self.error = e
      },

      /**
       * #action
       */
      setShowHighlight(arg: boolean) {
        self.showHighlight = arg
      },
      /**
       * #action
       */
      setShowProteinTracks(arg: boolean) {
        self.showProteinTracks = arg
      },
      /**
       * #action
       */
      setCompactTracks(arg: boolean) {
        self.compactTracks = arg
      },
      /**
       * #action
       */
      setZoomToBaseLevel(arg: boolean) {
        self.zoomToBaseLevel = arg
      },
      /**
       * #action
       */
      setAutoScrollAlignment(arg: boolean) {
        self.autoScrollAlignment = arg
      },
      /**
       * #action
       */
      setAlignmentAlgorithm(algorithm: AlignmentAlgorithm) {
        self.alignmentAlgorithm = algorithm
      },
      /**
       * #action
       */
      setColorScheme(scheme: ProteinColorScheme) {
        self.colorScheme = scheme
      },
      /**
       * #action
       */
      setMolstarPluginContext(p?: PluginContext) {
        // Reset loadedToMolstar for all structures when plugin context changes
        // This ensures structures get reloaded when the view is moved/remounted
        if (p !== self.molstarPluginContext) {
          for (const structure of self.structures) {
            structure.setLoadedToMolstar(false)
          }
        }
        self.molstarPluginContext = p
      },
      /**
       * #action
       */
      setShowManualAlignmentDialog(val: boolean) {
        self.showManualAlignmentDialog = val
      },
      /**
       * #action
       */
      setShowAddStructureDialog(val: boolean) {
        self.showAddStructureDialog = val
      },
      /**
       * #action
       */
      setInit(arg?: ProteinViewInitState) {
        self.init = arg
      },
      /**
       * #action
       */
      setConnectedMsaViewId(id?: string) {
        self.connectedMsaViewId = id
      },
      /**
       * #action
       */
      addStructure(structure: { url?: string; data?: string }) {
        self.structures.push(
          Structure.create({
            url: structure.url,
            data: structure.data,
            userProvidedTranscriptSequence: '',
          }),
        )
      },
    }))
    .actions(self => ({
      /**
       * #action
       */
      async addStructureAndSuperpose(structure: {
        url?: string
        data?: string
      }) {
        const { molstarPluginContext } = self
        if (!molstarPluginContext) {
          return
        }

        const newStructure = Structure.create({
          url: structure.url,
          data: structure.data,
          userProvidedTranscriptSequence: '',
        })
        // Set loadedToMolstar BEFORE pushing to avoid race condition with autorun
        newStructure.setLoadedToMolstar(true)
        self.structures.push(newStructure)

        try {
          newStructure.setStructureData(
            await loadStructureData({
              structure,
              plugin: molstarPluginContext,
            }),
          )
          if (self.structures.length > 1) {
            await superposeStructures(molstarPluginContext)
          }
        } catch (e) {
          self.setError(e)
          console.error(e)
        }
      },
    }))
    .actions(self => ({
      afterAttach() {
        // restore settings from localStorage
        try {
          const stored = localStorage.getItem(SETTINGS_KEY)
          if (stored) {
            const settings = JSON.parse(stored) as Record<string, boolean>
            for (const key of PERSISTED_SETTINGS) {
              if (settings[key] !== undefined) {
                self[key] = settings[key]
              }
            }
          }
        } catch (e) {
          console.error('Failed to restore protein view settings', e)
        }

        // save settings to localStorage when they change
        addDisposer(
          self,
          autorun(() => {
            try {
              const settings: Record<string, boolean> = {}
              for (const key of PERSISTED_SETTINGS) {
                settings[key] = self[key]
              }
              localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
            } catch (e) {
              console.error('Failed to save protein view settings', e)
            }
          }),
        )

        // process init parameter for loading structures from session snapshots
        addDisposer(
          self,
          autorun(() => {
            const { init } = self
            if (init) {
              const { structures, showControls, showAlignment } = init

              if (structures) {
                for (const structure of structures) {
                  self.addStructure(structure)
                }
              }

              if (showControls !== undefined) {
                self.setShowControls(showControls)
              }

              if (showAlignment !== undefined) {
                self.setShowAlignment(showAlignment)
              }

              self.setInit(undefined)
            }
          }),
        )

        // Apply the chosen color theme whenever it changes or once a structure
        // finishes loading (structureSequences is set after its molstar
        // representation is built, so the theme has something to recolor).
        addDisposer(
          self,
          autorun(() => {
            const { molstarPluginContext, colorScheme } = self
            const readyCount = self.structures.filter(
              s => s.structureSequences !== undefined,
            ).length
            if (molstarPluginContext && readyCount > 0) {
              applyColorTheme({
                plugin: molstarPluginContext,
                colorScheme,
              }).catch((e: unknown) => {
                console.error(e)
                self.setError(e)
              })
            }
          }),
        )

        // Load structures into Molstar as they appear or whenever the plugin
        // context changes. See makeStructureLoader for why the autorun body is
        // synchronous and how it guards against duplicate/stale loads.
        addDisposer(self, autorun(makeStructureLoader(self)))
      },
    }))
    .views(self => ({
      get primaryStructure() {
        return self.structures[0]
      },
      menuItems() {
        return [
          {
            label: 'Pairwise alignment',
            icon: Visibility,
            type: 'checkbox',
            checked: self.showAlignment,
            onClick: () => {
              self.setShowAlignment(!self.showAlignment)
            },
          },
          {
            label: 'Protein feature tracks',
            icon: Visibility,
            type: 'checkbox',
            checked: self.showProteinTracks,
            onClick: () => {
              self.setShowProteinTracks(!self.showProteinTracks)
            },
          },
          {
            label: 'Color scheme...',
            subMenu: COLOR_SCHEMES.map(scheme => ({
              label: scheme.label,
              type: 'radio' as const,
              checked: self.colorScheme === scheme.value,
              onClick: () => {
                self.setColorScheme(scheme.value)
              },
            })),
          },
          {
            label: 'Add structure...',
            onClick: () => {
              self.setShowAddStructureDialog(true)
            },
          },
          {
            label: 'Advanced...',
            icon: SettingsIcon,
            subMenu: [
              {
                label: 'Pairwise alignment as green highlight',
                type: 'checkbox',
                checked: self.showHighlight,
                onClick: () => {
                  self.setShowHighlight(!self.showHighlight)
                },
              },
              {
                label: 'Show all protein feature tracks',
                onClick: () => {
                  for (const structure of self.structures) {
                    structure.showAllFeatureTypes()
                  }
                },
              },
              {
                label: 'Import manual alignment...',
                onClick: () => {
                  self.setShowManualAlignmentDialog(true)
                },
              },
              {
                label: 'Re-align structures (TM-align)',
                onClick: () => {
                  if (self.molstarPluginContext) {
                    superposeStructures(self.molstarPluginContext).catch(
                      (e: unknown) => {
                        console.error(e)
                        self.setError(e)
                      },
                    )
                  }
                },
              },
              {
                label: 'Zoom to base level on click',
                type: 'checkbox',
                checked: self.zoomToBaseLevel,
                onClick: () => {
                  self.setZoomToBaseLevel(!self.zoomToBaseLevel)
                },
              },
              {
                label: 'Auto-scroll protein feature view on hover',
                type: 'checkbox',
                checked: self.autoScrollAlignment,
                onClick: () => {
                  self.setAutoScrollAlignment(!self.autoScrollAlignment)
                },
              },
            ],
          },
        ]
      },
    }))
}

export default stateModelFactory

export type JBrowsePluginProteinViewStateModel = ReturnType<
  typeof stateModelFactory
>
export type JBrowsePluginProteinViewModel =
  Instance<JBrowsePluginProteinViewStateModel>

export type {
  JBrowsePluginProteinStructureModel,
  JBrowsePluginProteinStructureStateModel,
} from './structureModel'

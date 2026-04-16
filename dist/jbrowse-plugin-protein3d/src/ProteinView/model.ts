import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes'
import { ElementId } from '@jbrowse/core/util/types/mst'
import { addDisposer, types } from '@jbrowse/mobx-state-tree'
import SettingsIcon from '@mui/icons-material/Settings'
import Visibility from '@mui/icons-material/Visibility'
import { autorun } from 'mobx'

import { addStructureFromData } from './addStructureFromData'
import { addStructureFromURL } from './addStructureFromURL'
import { extractStructureSequences } from './extractStructureSequences'
import highlightResidue from './highlightResidue'
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
        autoScrollAlignment: true,
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
          const { model } = structure.data
            ? await addStructureFromData({
                data: structure.data,
                plugin: molstarPluginContext,
              })
            : structure.url
              ? await addStructureFromURL({
                  url: structure.url,
                  plugin: molstarPluginContext,
                })
              : { model: undefined }

          const sequences = model ? extractStructureSequences(model) : undefined
          newStructure.setSequences(sequences)

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

        addDisposer(
          self,
          autorun(async () => {
            const { structures, molstarPluginContext } = self
            if (molstarPluginContext) {
              for (const structure of structures) {
                if (structure.loadedToMolstar) {
                  continue
                }
                try {
                  const { model } = structure.data
                    ? await addStructureFromData({
                        data: structure.data,
                        plugin: molstarPluginContext,
                      })
                    : structure.url
                      ? await addStructureFromURL({
                          url: structure.url,
                          plugin: molstarPluginContext,
                        })
                      : { model: undefined }

                  const sequences = model
                    ? extractStructureSequences(model)
                    : undefined
                  structure.setSequences(sequences)
                  structure.setLoadedToMolstar(true)
                } catch (e) {
                  self.setError(e)
                  console.error(e)
                }
              }
            }
          }),
        )

        addDisposer(
          self,
          autorun(async () => {
            const { structures, molstarPluginContext } = self
            if (molstarPluginContext) {
              for (const [i, s0] of structures.entries()) {
                const structure =
                  molstarPluginContext.managers.structure.hierarchy.current
                    .structures[i]?.cell.obj?.data
                const pos = s0.structureSeqHoverPos
                if (structure && pos !== undefined) {
                  await highlightResidue({
                    structure,
                    plugin: molstarPluginContext,
                    selectedResidue: pos,
                  })
                }
              }
            }
          }),
        )
      },
    }))
    .views(self => ({
      menuItems() {
        return [
          {
            label: 'Show...',
            icon: Visibility,
            subMenu: [
              {
                label: 'Pairwise alignment',
                type: 'checkbox',
                checked: self.showAlignment,
                onClick: () => {
                  self.setShowAlignment(!self.showAlignment)
                },
              },
              {
                label: 'Protein feature tracks',
                type: 'checkbox',
                checked: self.showProteinTracks,
                onClick: () => {
                  self.setShowProteinTracks(!self.showProteinTracks)
                },
              },
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
            ],
          },
          {
            label: 'Settings...',
            icon: SettingsIcon,
            subMenu: [
              {
                label: 'Zoom to base level on click',
                type: 'checkbox',
                checked: self.zoomToBaseLevel,
                onClick: () => {
                  self.setZoomToBaseLevel(!self.zoomToBaseLevel)
                },
              },
              {
                label: 'Auto-scroll alignment on hover',
                type: 'checkbox',
                checked: self.autoScrollAlignment,
                onClick: () => {
                  self.setAutoScrollAlignment(!self.autoScrollAlignment)
                },
              },
            ],
          },
          {
            label: 'Import manual alignment...',
            onClick: () => {
              self.setShowManualAlignmentDialog(true)
            },
          },
          {
            label: 'Add structure...',
            onClick: () => {
              self.setShowAddStructureDialog(true)
            },
          },
          {
            label: 'Re-align structures (TM-align)',
            onClick: () => {
              if (self.molstarPluginContext) {
                superposeStructures(self.molstarPluginContext).catch(
                  (e: unknown) => {
                    console.error(e)
                  },
                )
              }
            },
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

export type JBrowsePluginProteinStructureStateModel = typeof Structure
export type JBrowsePluginProteinStructureModel =
  Instance<JBrowsePluginProteinStructureStateModel>

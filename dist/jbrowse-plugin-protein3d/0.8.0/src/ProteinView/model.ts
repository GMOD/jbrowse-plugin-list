import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes'
import { ElementId } from '@jbrowse/core/util/types/mst'
import { addDisposer, types } from '@jbrowse/mobx-state-tree'
import SettingsIcon from '@mui/icons-material/Settings'
import Visibility from '@mui/icons-material/Visibility'
import { autorun, reaction } from 'mobx'

import {
  COLOR_SCHEMES,
  COLOR_SCHEME_VALUES,
  type ProteinColorScheme,
  applyColorTheme,
} from './applyColorTheme'
import { makeStructureLoader } from './structureLoader'
import Structure from './structureModel'
import { makeStructureSuperposer } from './structureSuperposer'
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

// Must mirror the property defaults below; the Record type enforces the key set
// so a persisted setting can't be added without giving its default. Used to tell
// "left at default" from "explicitly declared" when restoring preferences.
const SETTING_DEFAULTS: Record<(typeof PERSISTED_SETTINGS)[number], boolean> = {
  showAlignment: true,
  showProteinTracks: true,
  showHighlight: false,
  zoomToBaseLevel: true,
  autoScrollAlignment: false,
  compactTracks: true,
}

import type { ProteinStructureSpec } from './proteinViewSpec'
import type { Instance } from '@jbrowse/mobx-state-tree'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

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
      setConnectedMsaViewId(id?: string) {
        self.connectedMsaViewId = id
      },
      /**
       * #action
       * Adds a structure at runtime (e.g. the Add-structure dialog). Takes the
       * full declarative spec so a dialog-added structure is a first-class
       * citizen, identical to one hydrated from a launch snapshot.
       */
      addStructure(structure: ProteinStructureSpec) {
        self.structures.push(Structure.create(structure))
      },
    }))
    .actions(self => ({
      afterAttach() {
        // Restore persisted UI preferences, but only for settings the launch
        // snapshot left at their default. An explicitly declared value (e.g. a
        // gene-explorer spec's zoomToBaseLevel:false) must win over a sticky
        // preference, so declarative setup is honored.
        try {
          const stored = localStorage.getItem(SETTINGS_KEY)
          if (stored) {
            const settings = JSON.parse(stored) as Record<string, boolean>
            for (const key of PERSISTED_SETTINGS) {
              if (
                settings[key] !== undefined &&
                self[key] === SETTING_DEFAULTS[key]
              ) {
                self[key] = settings[key]
              }
            }
          }
        } catch (e) {
          console.error('Failed to restore protein view settings', e)
        }

        // Persist on user change only. reaction (unlike autorun) skips the
        // initial value, so launching a declaratively-configured view never
        // overwrites the stored preference — only a menu toggle does.
        addDisposer(
          self,
          reaction(
            () => PERSISTED_SETTINGS.map(key => self[key]),
            () => {
              try {
                const settings: Record<string, boolean> = {}
                for (const key of PERSISTED_SETTINGS) {
                  settings[key] = self[key]
                }
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
              } catch (e) {
                console.error('Failed to save protein view settings', e)
              }
            },
          ),
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

        // Superpose (TM-align) whenever the set of loaded structures grows past
        // one. Keeping this reactive means adding a structure only pushes it and
        // lets the loader load it; see makeStructureSuperposer.
        addDisposer(self, autorun(makeStructureSuperposer(self)))
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
                label: 'Auto-scroll alignment to hovered position',
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

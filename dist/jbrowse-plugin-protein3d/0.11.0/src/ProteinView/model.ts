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
import { showLoading } from './showLoading'
import {
  PERSISTED_SETTINGS,
  type PersistedSettings,
  readStoredSettings,
  withStoredSettings,
  writeStoredSettings,
} from './storedSettings'
import { makeStructureLoader } from './structureLoader'
import Structure from './structureModel'
import { makeStructureSuperposer } from './structureSuperposer'
import { superposeStructures } from './superposeStructures'
import {
  ALIGNMENT_ALGORITHM_VALUES,
  type AlignmentAlgorithm,
  DEFAULT_ALIGNMENT_ALGORITHM,
} from './types'

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
          types.enumeration<AlignmentAlgorithm>(
            'AlignmentAlgorithm',
            ALIGNMENT_ALGORITHM_VALUES,
          ),
          DEFAULT_ALIGNMENT_ALGORITHM,
        ),

        /**
         * #property
         * ID of connected MSA view for hover synchronization
         */
        connectedMsaViewId: types.maybe(types.string),
      }),
    )
    .preProcessSnapshot(
      (snapshot: PersistedSettings & Record<string, unknown>) =>
        withStoredSettings(snapshot, readStoredSettings()),
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
        // Persist on user change only. reaction (unlike autorun) skips the
        // initial value, so launching a declaratively-configured view never
        // overwrites the stored preference — only a menu toggle does.
        addDisposer(
          self,
          reaction(
            () => PERSISTED_SETTINGS.map(key => self[key]),
            () => {
              const settings: PersistedSettings = {}
              for (const key of PERSISTED_SETTINGS) {
                settings[key] = self[key]
              }
              writeStoredSettings(settings)
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
      /**
       * #getter
       * JBrowse's per-view readiness hook, see showLoading.ts
       */
      get showLoading() {
        return showLoading(self)
      },
      /**
       * #getter
       * The boolean display settings, in one list so the view menu and the
       * header's settings menu offer the same toggles under the same names.
       */
      get displayToggles() {
        return [
          {
            label: 'Show alignment',
            checked: self.showAlignment,
            toggle: () => {
              self.setShowAlignment(!self.showAlignment)
            },
          },
          {
            label: 'Show feature tracks',
            checked: self.showProteinTracks,
            toggle: () => {
              self.setShowProteinTracks(!self.showProteinTracks)
            },
          },
          {
            label: 'Compact tracks',
            checked: self.compactTracks,
            toggle: () => {
              self.setCompactTracks(!self.compactTracks)
            },
          },
          {
            label: 'Auto-scroll alignment to hovered position',
            checked: self.autoScrollAlignment,
            toggle: () => {
              self.setAutoScrollAlignment(!self.autoScrollAlignment)
            },
          },
        ]
      },
    }))
    .views(self => ({
      menuItems() {
        return [
          ...self.displayToggles.map(({ label, checked, toggle }) => ({
            label,
            icon: Visibility,
            type: 'checkbox' as const,
            checked,
            onClick: toggle,
          })),
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
                label: 'Restore hidden feature tracks',
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

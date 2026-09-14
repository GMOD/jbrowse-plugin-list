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
import { makeSelectionFramer } from './frameSelection'
import { makeLociChannel } from './lociChannel'
import { defaultDisplayName } from './proteinViewSpec'
import { showLoading } from './showLoading'
import {
  type PersistedSetting,
  type PersistedSettings,
  readStoredSettings,
  storeSetting,
  withStoredSettings,
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
      }),
    )
    .preProcessSnapshot(
      (
        snapshot: PersistedSettings & {
          displayName?: string
          structures?: ProteinStructureSpec[]
        } & Record<string, unknown>,
      ) =>
        withStoredSettings(
          {
            ...snapshot,
            displayName:
              snapshot.displayName ??
              defaultDisplayName(snapshot.structures ?? []),
          },
          readStoredSettings(),
        ),
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
      /**
       * #volatile
       * how many loaded structures the last TM-align superposition covered
       */
      superposedCount: 0,
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
      setSuperposedCount(count: number) {
        self.superposedCount = count
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
      /**
       * #action
       * A menu toggle, remembered for views opened later. Only a toggle
       * persists: a spec's value or the view revealing a partial alignment is
       * not the reader's preference.
       */
      toggleSetting(key: PersistedSetting) {
        const value = !self[key]
        self[key] = value
        storeSetting(key, value)
      },
    }))
    .actions(self => ({
      afterAttach() {
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

        // Frame a declared selection once everything is loaded and superposed;
        // see makeSelectionFramer.
        addDisposer(self, autorun(makeSelectionFramer(self)))

        addDisposer(self, autorun(makeLociChannel(self, 'select')))
        addDisposer(self, autorun(makeLociChannel(self, 'highlight')))
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
        return (
          [
            ['showAlignment', 'Show alignment'],
            ['showProteinTracks', 'Show feature tracks'],
            ['compactTracks', 'Compact tracks'],
            [
              'autoScrollAlignment',
              'Auto-scroll alignment to hovered position',
            ],
          ] as const
        ).map(([key, label]) => ({
          label,
          checked: self[key],
          toggle: () => {
            self.toggleSetting(key)
          },
        }))
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
                  self.toggleSetting('showHighlight')
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
                  self.toggleSetting('zoomToBaseLevel')
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

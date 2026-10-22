import { lazy } from 'react'

import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes'
import { getSession, getTrackName } from '@jbrowse/core/util'
import { ElementId } from '@jbrowse/core/util/types/mst'
import { addDisposer, getPath, isAlive, types } from '@jbrowse/mobx-state-tree'
import { autorun } from 'mobx'
import {
  ALIGNMENT_ALGORITHM_VALUES,
  DEFAULT_ALIGNMENT_ALGORITHM,
} from 'p2s_mapper'

import { domainLegend } from './alignmentDomains'
import { syncSiteSticks } from './alignmentSites'
import { applyColorTheme, colorLegendOf } from './applyColorTheme'
import {
  MAX_TRACK_HEIGHT,
  MIN_TRACK_HEIGHT,
  NORMAL_TRACK_HEIGHT,
  trackHeightOf,
} from './constants'
import { applyFigureStyle } from './figureStyle'
import { makeSelectionFramer, structuresSettled } from './frameSelection'
import loadMolstar from './loadMolstar'
import { makeLociChannel } from './lociChannel'
import { checkedLayers } from './markProblems'
import { syncMeasurements } from './measurements'
import { checkedColor, colorOfScheme, resolvedColor } from './proteinColor'
import { defaultDisplayName } from './proteinViewSpec'
import { removeMolstarStructure } from './removeStructure'
import { reportPluginFailure } from './reportPluginFailure'
import { checkedStructureFilters } from './residueFilter'
import { syncResidueMarks } from './residueMarks'
import { applySavedCamera } from './savedCamera'
import {
  highlightCameraSnapshot,
  syncSessionHighlightMarks,
} from './sessionHighlights'
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
import { setStructuresHidden } from './structureVisibility'
import { syncSurfaces } from './surface'
import { isValueField, paintedColor, valueDomain } from './valueScale'
import { attachViewInteractions } from './viewInteractions'

import type { DistanceMeasurement } from './measurements'
import type { ProteinColor } from './proteinColor'
import type { ProteinStructureSpec } from './proteinViewSpec'
import type { ResidueMark } from './residueMarks'
import type { SavedCamera } from './savedCamera'
import type { JBrowsePluginProteinStructureModel } from './structureModel'
import type { ProteinSurface } from './surface'
import type { Instance } from '@jbrowse/mobx-state-tree'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { AlignmentAlgorithm } from 'p2s_mapper'

const MIN_HEIGHT = 100

// Queued on the session rather than mounted in the view's body, which is not
// there while Mol* loads, after it fails, or while the view is minimized
const AddStructureDialog = lazy(() => import('./components/AddStructureDialog'))
const ManualAlignmentDialog = lazy(
  () => import('./components/ManualAlignmentDialog'),
)

interface DisplaySetting {
  key: PersistedSetting
  label: string
  requires?: readonly PersistedSetting[]
}

// `requires` names the settings a toggle does nothing without: the alignment
// panel holds the track rows, and the track rows are all the track settings
// change.
const DISPLAY_SETTINGS: readonly DisplaySetting[] = [
  { key: 'showAlignment', label: 'Show alignment' },
  {
    key: 'showProteinTracks',
    label: 'Show feature tracks',
    requires: ['showAlignment'],
  },
  {
    key: 'showAllFeatureTracks',
    label: 'Show all feature tracks',
    requires: ['showAlignment', 'showProteinTracks'],
  },
  {
    key: 'compactTracks',
    label: 'Compact tracks',
    requires: ['showAlignment', 'showProteinTracks'],
  },
  {
    key: 'autoScrollAlignment',
    label: 'Auto-scroll alignment to hovered position',
    requires: ['showAlignment'],
  },
  { key: 'showControls', label: 'Show Mol* controls' },
]

// What a click and a highlight do, as opposed to what the panel shows. Named
// here rather than in storedSettings because the view deliberately does not
// remember them for the next one.
const BEHAVIOR_SETTINGS = [
  ['showHighlight', 'Highlight aligned residues'],
  ['zoomToBaseLevel', 'Zoom to base level on click'],
] as const

type BehaviorSetting = (typeof BEHAVIOR_SETTINGS)[number][0]

function assemblyItems(structure: JBrowsePluginProteinStructureModel) {
  return structure.assemblyChoices.map(({ value, label, checked }) => ({
    label,
    type: 'radio' as const,
    checked,
    onClick: () => {
      structure.setAssembly(value)
    },
  }))
}

// A structure with one way to build it offers no choice; with several
// structures open, each choice sits under its structure's name.
function assemblyMenu(structures: JBrowsePluginProteinStructureModel[]) {
  const choosable = structures.filter(s => s.assemblyChoices.length > 1)
  const [only] = choosable
  return only === undefined
    ? []
    : [
        {
          label: 'Assembly',
          subMenu:
            structures.length === 1
              ? assemblyItems(only)
              : choosable.map(s => ({
                  label: s.label,
                  subMenu: assemblyItems(s),
                })),
        },
      ]
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
         * the color object every loaded structure is colored by: a `field`
         * (see COLOR_FIELDS), and for a field whose scale is the plugin's the
         * scale's members; `{}` is Mol*'s default
         */
        color: types.optional(types.frozen<ProteinColor>(), {}),
        /**
         * #property
         * a fixed camera (see SavedCamera) that load and Reset Zoom both
         * restore, in place of framing the whole scene or the labelled
         * highlights
         */
        camera: types.frozen<SavedCamera | undefined>(),
        /**
         * #property
         * a translucent molecular surface over each structure's polymer (see
         * ProteinSurface), colored as the cartoon is; absent draws none
         */
        surface: types.frozen<ProteinSurface | undefined>(),
        /**
         * #property
         * dashed distances drawn between two sites of a structure, each
         * labelled in angstroms (see DistanceMeasurement); `structure` is the
         * index into `structures`, the first by default
         */
        distances: types.frozen<DistanceMeasurement[] | undefined>(),
        /**
         * #property
         * sites drawn on their own as spheres, sticks or a cartoon, on any
         * chain (see ResidueMark): a partner's residue, a ligand, a pocket, a
         * partner protein
         */
        marks: types.frozen<ResidueMark[] | undefined>(),
        /**
         * #property
         * silhouettes around every object, for a figure (see applyFigureStyle)
         */
        silhouettes: false,
        /**
         * #property
         * ambient occlusion, darkening crevices and folds, for a figure (see
         * applyFigureStyle)
         */
        occlusion: false,
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
         * px height of one feature-track row once the tracks' resize handle
         * has been dragged; unset, `compactTracks` decides
         */
        trackHeight: types.maybe(types.number),
        /**
         * #property
         * also draw the feature types in MINOR_FEATURE_TYPES and the
         * hydrophobicity track
         */
        showAllFeatureTracks: false,
        /**
         * #property
         * which structure's alignment panel is open; unset opens the seeded
         * structure, else the first
         */
        alignmentStructureIndex: types.maybe(types.number),
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
      ({
        colorScheme,
        ...snapshot
      }: PersistedSettings & {
        displayName?: string
        structures?: ProteinStructureSpec[]
        color?: unknown
        colorScheme?: string
      } & Record<string, unknown>) =>
        withStoredSettings(
          {
            ...checkedLayers(
              snapshot,
              checkedStructureFilters(snapshot.structures),
            ),
            displayName:
              snapshot.displayName ??
              defaultDisplayName(snapshot.structures ?? []),
            color: checkedColor(
              snapshot.color ??
                (colorScheme === undefined ? {} : colorOfScheme(colorScheme)),
            ),
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
       * how many loaded structures the last TM-align superposition covered
       */
      superposedCount: 0,
      /**
       * #volatile
       * color and surface runs queued or in flight; the ready marker waits
       * for zero (see showLoading.ts)
       */
      paintsPending: 0,
    }))

    .actions(self => ({
      /**
       * #action
       */
      countPaint(delta: number) {
        self.paintsPending += delta
      },
    }))

    .actions(self => ({
      /**
       * #action
       */
      setHeight(n: number) {
        self.height = Math.max(n, MIN_HEIGHT)
      },
      /**
       * #action
       * Every lane of every feature track grows by the same px, so the track
       * area scales in proportion.
       */
      resizeTracks(distance: number) {
        self.trackHeight = Math.min(
          MAX_TRACK_HEIGHT,
          Math.max(MIN_TRACK_HEIGHT, trackHeightOf(self) + distance),
        )
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
      setColor(color: ProteinColor) {
        self.color = checkedColor(color)
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
      /**
       * #action
       * Puts every structure's persistent selection down. The Mol* selection
       * is derived from it, so clearing the range clears the magenta.
       */
      clearSelection() {
        for (const structure of self.structures) {
          structure.setClickedStructureRanges([])
          structure.setSelectedFeatureId(undefined)
        }
      },
      /**
       * #action
       */
      openAlignmentOf(structure: JBrowsePluginProteinStructureModel) {
        self.alignmentStructureIndex = self.structures.indexOf(structure)
      },
    }))
    .actions(self => ({
      /**
       * #action
       * Takes a structure out of the view and out of Mol*. The superposed
       * count resets so the remaining structures are re-aligned against a
       * pivot that still exists, and every derived highlight follows the
       * structures array, so nothing is left pointing at a removed model.
       */
      removeStructure(structure: JBrowsePluginProteinStructureModel) {
        const plugin = self.molstarPluginContext
        const molstarStructure = structure.molstarStructure
        const removed = self.structures.indexOf(structure)
        const open = self.alignmentStructureIndex
        if (open !== undefined) {
          self.alignmentStructureIndex =
            removed === open ? undefined : removed < open ? open - 1 : open
        }
        self.structures.remove(structure)
        self.setSuperposedCount(0)
        if (plugin) {
          removeMolstarStructure({ plugin, molstarStructure }).catch(
            reportPluginFailure(self, plugin),
          )
        }
      },
    }))
    .views(self => ({
      /**
       * #getter
       * Whether the track lanes are drawn compact, read from their height
       * because a drag on the resize handle overrides `compactTracks`.
       */
      get tracksCompact() {
        return trackHeightOf(self) < NORMAL_TRACK_HEIGHT
      },
      /**
       * #getter
       * The color object the themes paint with: the session's, and for a
       * field scaled by its data, the ends of the domain it leaves out filled
       * from the scores of every structure, and a title naming the track
       */
      get paintColor() {
        const { color, structures } = self
        if (!isValueField(color)) {
          return color
        }
        const session = getSession(self)
        const conf = color.trackId
          ? session.getTrackById(color.trackId)
          : undefined
        const trackName = conf ? getTrackName(conf, session) : color.trackId
        const needsDomain =
          color.scale !== 'threshold' &&
          (color.domainMin === undefined || color.domainMax === undefined)
        return paintedColor(color, {
          domain: needsDomain
            ? valueDomain(
                structures.flatMap(s => [
                  ...(s.placedValues?.byLabelSeqId.values() ?? []),
                ]),
              )
            : undefined,
          label:
            color.field === 'track'
              ? `${trackName} (${color.stat ?? 'mean'} per codon)`
              : undefined,
        })
      },
    }))
    .actions(self => ({
      /**
       * #action
       * A menu toggle, remembered for views opened later. Only a toggle
       * persists: a spec's value is not the reader's preference.
       */
      toggleSetting(key: PersistedSetting) {
        const value = key === 'compactTracks' ? !self.tracksCompact : !self[key]
        self[key] = value
        if (key === 'compactTracks') {
          self.trackHeight = undefined
        }
        storeSetting(key, value)
      },
      /**
       * #action
       * The same for a toggle that changes behavior, which stays with this
       * view rather than following the reader to the next one.
       */
      toggleBehavior(key: BehaviorSetting) {
        self[key] = !self[key]
      },
    }))
    .actions(self => ({
      afterAttach() {
        // Apply the chosen color theme whenever it changes, a structure
        // finishes loading (entities is set after its molstar
        // representation is built, so the theme has something to recolor),
        // the mapped chain changes, or a placed-value source answers; the
        // surface is built first so it takes the same theme.
        // runs queue so two surface builds never overlap, and only the
        // latest run paints, since an earlier one can finish last
        let colorRun = 0
        let colorQueue: Promise<unknown> = Promise.resolve()
        addDisposer(
          self,
          autorun(() => {
            const { molstarPluginContext, paintColor: color, surface } = self
            const structures = self.structures.flatMap(s =>
              s.entities
                ? s.molstarStructures.map(molstarStructure => ({
                    molstarStructure,
                    entityId: s.mappedEntity?.entityId,
                    placedValues: s.placedValues,
                    placedSites: s.alignmentDomainStatus?.placedSites,
                    domainColor: s.alignmentDomainStatus?.domains?.color,
                  }))
                : [],
            )
            if (molstarPluginContext && structures.length > 0) {
              const run = ++colorRun
              self.countPaint(1)
              colorQueue = colorQueue
                .then(async () => {
                  await syncSurfaces({
                    plugin: molstarPluginContext,
                    structures: structures.map(s => s.molstarStructure),
                    surface,
                  })
                  if (run === colorRun) {
                    await applyColorTheme({
                      plugin: molstarPluginContext,
                      color,
                      structures,
                    })
                  }
                })
                .catch(reportPluginFailure(self, molstarPluginContext))
                .finally(() => {
                  if (isAlive(self)) {
                    self.countPaint(-1)
                  }
                })
            }
          }),
        )

        // The alignment sites' sticks, layer 2 of the alignment domains,
        // follow the scheme, the alignment's domains and each load.
        addDisposer(
          self,
          autorun(() => {
            const plugin = self.molstarPluginContext
            const structures = self.structures.flatMap(s =>
              s.entities
                ? s.molstarStructures.map(molstarStructure => ({
                    molstarStructure,
                    sites: s.alignmentDomainStatus?.placedSites,
                    color: s.alignmentDomainStatus?.domains?.color,
                  }))
                : [],
            )
            if (plugin && structures.length > 0) {
              syncSiteSticks({ plugin, structures }).catch(
                reportPluginFailure(self, plugin),
              )
            }
          }),
        )

        // The session's highlights on the residues each genome region codes
        // for. A plugin's first labelled sync turns the camera toward them,
        // unless a seeded selection frames its own residues
        let orientedPlugin: PluginContext | undefined
        addDisposer(
          self,
          autorun(() => {
            const plugin = self.molstarPluginContext
            const structures = self.structures.flatMap(s =>
              s.entities
                ? s.molstarStructures.map(molstarStructure => ({
                    molstarStructure,
                    marks: s.sessionHighlightMarks,
                    chains: s.chains,
                    filter: s.filter,
                  }))
                : [],
            )
            const seeded = self.structures.some(s => s.seededSelection)
            if (plugin && structures.length > 0) {
              syncSessionHighlightMarks({ plugin, structures })
                .then(async () => {
                  if (orientedPlugin !== plugin && !seeded && !self.camera) {
                    const snapshot = highlightCameraSnapshot(
                      plugin,
                      await loadMolstar(),
                    )
                    if (snapshot) {
                      orientedPlugin = plugin
                      plugin.canvas3d?.requestCameraReset({
                        snapshot: (_, camera) => snapshot(camera),
                      })
                    }
                  }
                })
                .catch(reportPluginFailure(self, plugin))
            }
          }),
        )

        // Reset Zoom frames the scene from the labelled residues' side too.
        // Mol*'s own handler runs first and requests a plain reset, which
        // this request's snapshot then overrides
        let stopTurningResets: (() => void) | undefined
        addDisposer(self, () => stopTurningResets?.())
        addDisposer(
          self,
          autorun(() => {
            stopTurningResets?.()
            stopTurningResets = undefined
            const plugin = self.molstarPluginContext
            if (!plugin) {
              return
            }
            let stopped = false
            stopTurningResets = () => {
              stopped = true
            }
            loadMolstar()
              .then(molstar => {
                if (stopped) {
                  return
                }
                const subscription =
                  molstar.PluginCommands.Camera.Reset.subscribe(
                    plugin,
                    ({ snapshot: requested }) => {
                      if (!requested && self.camera) {
                        applySavedCamera(plugin, molstar, self.camera)
                        return
                      }
                      const snapshot = requested
                        ? undefined
                        : highlightCameraSnapshot(plugin, molstar)
                      if (snapshot) {
                        plugin.canvas3d?.requestCameraReset({
                          snapshot: (_, camera) => snapshot(camera),
                        })
                      }
                    },
                  )
                stopTurningResets = () => {
                  subscription.unsubscribe()
                }
              })
              .catch(reportPluginFailure(self, plugin))
          }),
        )

        addDisposer(
          self,
          autorun(() => {
            const plugin = self.molstarPluginContext
            for (const s of self.structures) {
              const { hidden, molstarStructures: structures } = s
              if (plugin && structures.length > 0) {
                setStructuresHidden({ plugin, structures, hidden }).catch(
                  reportPluginFailure(self, plugin),
                )
              }
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

        // The declared distances, once their structures have loaded
        addDisposer(
          self,
          autorun(() => {
            const plugin = self.molstarPluginContext
            const distances = self.distances ?? []
            const structures = self.structures.map(s =>
              s.entities ? s.molstarStructures[0] : undefined,
            )
            if (plugin && structures.some(Boolean)) {
              syncMeasurements({
                plugin,
                structures,
                measurements: distances,
              }).catch(reportPluginFailure(self, plugin))
            }
          }),
        )

        // The declared residue marks, once their structures have loaded
        addDisposer(
          self,
          autorun(() => {
            const plugin = self.molstarPluginContext
            const marks = self.marks ?? []
            const structures = self.structures.map(s =>
              s.entities ? s.molstarStructures[0] : undefined,
            )
            if (plugin && structures.some(Boolean)) {
              syncResidueMarks({ plugin, structures, marks }).catch(
                reportPluginFailure(self, plugin),
              )
            }
          }),
        )

        addDisposer(
          self,
          autorun(() => {
            const {
              molstarPluginContext: plugin,
              silhouettes,
              occlusion,
            } = self
            if (plugin) {
              loadMolstar()
                .then(({ Color }) => {
                  applyFigureStyle(plugin, Color, { silhouettes, occlusion })
                })
                .catch(reportPluginFailure(self, plugin))
            }
          }),
        )

        // A saved camera, once every structure has loaded
        addDisposer(
          self,
          autorun(() => {
            const { molstarPluginContext: plugin, camera } = self
            if (plugin && camera && structuresSettled(self)) {
              loadMolstar()
                .then(molstar => {
                  applySavedCamera(plugin, molstar, camera)
                })
                .catch(reportPluginFailure(self, plugin))
            }
          }),
        )

        addDisposer(self, autorun(makeLociChannel(self, 'select')))
        addDisposer(self, autorun(makeLociChannel(self, 'highlight')))

        // Mol*'s click and hover, heard once for the whole view
        attachViewInteractions(self)
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
       * Every structure loaded, aligned and, with several, superposed.
       */
      get settled() {
        return structuresSettled(self)
      },
      /**
       * #getter
       * What each still-settling structure is doing, for the canvas overlay.
       * Each line carries its structure's path as an id: two copies of one
       * entry say the same thing, and keying the overlay on the text alone
       * made React complain about duplicate keys — which the e2e's console
       * gate reads as a failure, rightly.
       */
      get loadingMessages() {
        return self.structures.flatMap(s =>
          s.loadingMessage === undefined
            ? []
            : [{ id: getPath(s), message: s.loadingMessage }],
        )
      },
      /**
       * #getter
       * The one structure whose alignment panel is open.
       */
      get alignmentStructure() {
        const { structures, alignmentStructureIndex } = self
        return (
          (alignmentStructureIndex === undefined
            ? undefined
            : structures[alignmentStructureIndex]) ??
          structures.find(s => s.seededSelection) ??
          structures[0]
        )
      },
      /**
       * #getter
       * What the legend of the structure colors is titled
       */
      get colorLegendTitle() {
        return resolvedColor(self.paintColor)?.title ?? 'Structure colors'
      },
      /**
       * #getter
       * The color object's key, from the first structure that has loaded.
       */
      get colorLegend() {
        const plugin = self.molstarPluginContext
        const loaded = self.structures.find(s => s.entities)
        const structure = loaded?.molstarStructures[0]
        return plugin && structure
          ? colorLegendOf({
              plugin,
              color: self.paintColor,
              structure,
              entityId: loaded.mappedEntity?.entityId,
              domainColor: loaded.alignmentDomainStatus?.domains?.color,
            })
          : undefined
      },
      /**
       * #getter
       * The alignment domains' legend, one group per layer, while the view
       * colors by them
       */
      get domainLegend() {
        const domains =
          self.color.field === 'domain'
            ? self.structures.find(s => s.alignmentDomains)?.alignmentDomains
            : undefined
        return domains ? domainLegend(domains) : undefined
      },
      /**
       * #getter
       * What the header's Tune menu offers: the layout choices, remembered for
       * views opened later. The view menu carries actions instead, so a reader
       * looking for a toggle has one place to look. A toggle is disabled while
       * a setting it requires is off, when it would change nothing on screen.
       */
      get displayToggles() {
        return DISPLAY_SETTINGS.map(({ key, label, requires = [] }) => {
          const disabled = requires.some(required => !self[required])
          return {
            key,
            label,
            checked: key === 'compactTracks' ? self.tracksCompact : self[key],
            disabled,
            toggle: () => {
              if (!disabled) {
                self.toggleSetting(key)
              }
            },
          }
        })
      },
      /**
       * #getter
       * Toggles that change what a click or a highlight does rather than what
       * the panel looks like. Offered beside the display ones, not remembered:
       * see storedSettings.
       */
      get behaviorToggles() {
        return BEHAVIOR_SETTINGS.map(([key, label]) => ({
          label,
          checked: self[key],
          toggle: () => {
            self.toggleBehavior(key)
          },
        }))
      },
    }))
    .views(self => ({
      /**
       * #method
       * Whether a structure's header row carries the mapped-chain picker. With
       * the alignment panel hidden every row does, since no row is the open
       * one and the picker is the way out of a wrongly mapped chain.
       */
      offersChainPicker(structure: JBrowsePluginProteinStructureModel) {
        return (
          !self.showAlignment ||
          self.alignmentStructure === structure ||
          !structure.userProvidedTranscriptSequence
        )
      },
      menuItems() {
        return [
          {
            label: 'Add structure...',
            onClick: () => {
              getSession(self).queueDialog(handleClose => [
                AddStructureDialog,
                { model: self, handleClose },
              ])
            },
          },
          ...(self.structures.length > 0
            ? [
                {
                  label: 'Remove structure',
                  subMenu: self.structures.map(structure => ({
                    label: structure.label,
                    onClick: () => {
                      self.removeStructure(structure)
                    },
                  })),
                },
              ]
            : []),
          ...assemblyMenu(self.structures),
          {
            label: 'Clear selection',
            onClick: () => {
              self.clearSelection()
            },
          },
          {
            label: 'Import manual alignment...',
            onClick: () => {
              getSession(self).queueDialog(handleClose => [
                ManualAlignmentDialog,
                { model: self, handleClose },
              ])
            },
          },
          {
            label: 'Re-align structures (TM-align)',
            onClick: () => {
              self.setSuperposedCount(0)
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

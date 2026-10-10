import { lazy } from 'react';
import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes';
import { getSession } from '@jbrowse/core/util';
import { ElementId } from '@jbrowse/core/util/types/mst';
import { addDisposer, getPath, types } from '@jbrowse/mobx-state-tree';
import { autorun } from 'mobx';
import { ALIGNMENT_ALGORITHM_VALUES, DEFAULT_ALIGNMENT_ALGORITHM, } from 'p2s_mapper';
import { COLOR_SCHEME_VALUES, applyColorTheme, colorSchemeLegend, } from './applyColorTheme';
import { MAX_TRACK_HEIGHT, MIN_TRACK_HEIGHT, NORMAL_TRACK_HEIGHT, trackHeightOf, } from './constants';
import { makeSelectionFramer, structuresSettled } from './frameSelection';
import { makeLociChannel } from './lociChannel';
import { defaultDisplayName } from './proteinViewSpec';
import { removeMolstarStructure } from './removeStructure';
import { showLoading } from './showLoading';
import { readStoredSettings, storeSetting, withStoredSettings, } from './storedSettings';
import { makeStructureLoader } from './structureLoader';
import Structure from './structureModel';
import { makeStructureSuperposer } from './structureSuperposer';
import { setStructuresHidden } from './structureVisibility';
import { attachViewInteractions } from './viewInteractions';
const MIN_HEIGHT = 100;
// Queued on the session rather than mounted in the view's body, which is not
// there while Mol* loads, after it fails, or while the view is minimized
const AddStructureDialog = lazy(() => import('./components/AddStructureDialog'));
const ManualAlignmentDialog = lazy(() => import('./components/ManualAlignmentDialog'));
// `requires` names the settings a toggle does nothing without: the alignment
// panel holds the track rows, and the track rows are all the track settings
// change.
const DISPLAY_SETTINGS = [
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
];
// What a click and a highlight do, as opposed to what the panel shows. Named
// here rather than in storedSettings because the view deliberately does not
// remember them for the next one.
const BEHAVIOR_SETTINGS = [
    ['showHighlight', 'Highlight aligned residues'],
    ['zoomToBaseLevel', 'Zoom to base level on click'],
];
/**
 * #stateModel Protein3dViewPlugin
 * extends
 * - BaseViewModel
 */
function stateModelFactory() {
    return types
        .compose('ProteinView', BaseViewModel, types.model({
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
         * color scheme applied to all loaded structures (see COLOR_SCHEMES)
         */
        colorScheme: types.optional(types.enumeration('ColorScheme', COLOR_SCHEME_VALUES), 'default'),
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
         * px height of one feature-track lane once the tracks' resize handle
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
        alignmentAlgorithm: types.optional(types.enumeration('AlignmentAlgorithm', ALIGNMENT_ALGORITHM_VALUES), DEFAULT_ALIGNMENT_ALGORITHM),
    }))
        .preProcessSnapshot((snapshot) => withStoredSettings({
        ...snapshot,
        displayName: snapshot.displayName ??
            defaultDisplayName(snapshot.structures ?? []),
    }, readStoredSettings()))
        .volatile(() => ({
        /**
         * #volatile
         */
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        error: undefined,
        /**
         * #volatile
         */
        molstarPluginContext: undefined,
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
        setHeight(n) {
            self.height = Math.max(n, MIN_HEIGHT);
        },
        /**
         * #action
         * Every lane of every feature track grows by the same px, so the track
         * area scales in proportion.
         */
        resizeTracks(distance) {
            self.trackHeight = Math.min(MAX_TRACK_HEIGHT, Math.max(MIN_TRACK_HEIGHT, trackHeightOf(self) + distance));
        },
        /**
         * #action
         */
        setError(e) {
            self.error = e;
        },
        /**
         * #action
         */
        setColorScheme(scheme) {
            self.colorScheme = scheme;
        },
        /**
         * #action
         */
        setMolstarPluginContext(p) {
            // Reset loadedToMolstar for all structures when plugin context changes
            // This ensures structures get reloaded when the view is moved/remounted
            if (p !== self.molstarPluginContext) {
                for (const structure of self.structures) {
                    structure.setLoadedToMolstar(false);
                }
            }
            self.molstarPluginContext = p;
        },
        setSuperposedCount(count) {
            self.superposedCount = count;
        },
        /**
         * #action
         * Adds a structure at runtime (e.g. the Add-structure dialog). Takes the
         * full declarative spec so a dialog-added structure is a first-class
         * citizen, identical to one hydrated from a launch snapshot.
         */
        addStructure(structure) {
            self.structures.push(Structure.create(structure));
        },
        /**
         * #action
         * Puts every structure's persistent selection down. The Mol* selection
         * is derived from it, so clearing the range clears the magenta.
         */
        clearSelection() {
            for (const structure of self.structures) {
                structure.setClickedStructureRanges([]);
                structure.setSelectedFeatureId(undefined);
            }
        },
        /**
         * #action
         */
        openAlignmentOf(structure) {
            self.alignmentStructureIndex = self.structures.indexOf(structure);
        },
    }))
        .actions(self => ({
        /**
         * #action
         * Takes a structure out of the view and out of Mol*. The superposed
         * count resets so the remaining structures are re-aligned against a
         * pivot that still exists, and every derived highlight follows the
         * structures array, so nothing is left pointing at a removed model.
         *
         * A block of its own so the removal's rejection can report through
         * `setError`: the promise settles after the action returns, and a write
         * to `self` from there throws inside MST.
         */
        removeStructure(structure) {
            const plugin = self.molstarPluginContext;
            const molstarStructure = structure.molstarStructure;
            const removed = self.structures.indexOf(structure);
            const open = self.alignmentStructureIndex;
            if (open !== undefined) {
                self.alignmentStructureIndex =
                    removed === open ? undefined : removed < open ? open - 1 : open;
            }
            self.structures.remove(structure);
            self.setSuperposedCount(0);
            if (plugin) {
                removeMolstarStructure({ plugin, molstarStructure }).catch((e) => {
                    console.error(e);
                    self.setError(e);
                });
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
            return trackHeightOf(self) < NORMAL_TRACK_HEIGHT;
        },
    }))
        .actions(self => ({
        /**
         * #action
         * A menu toggle, remembered for views opened later. Only a toggle
         * persists: a spec's value is not the reader's preference.
         */
        toggleSetting(key) {
            const value = key === 'compactTracks' ? !self.tracksCompact : !self[key];
            self[key] = value;
            if (key === 'compactTracks') {
                self.trackHeight = undefined;
            }
            storeSetting(key, value);
        },
        /**
         * #action
         * The same for a toggle that changes behavior, which stays with this
         * view rather than following the reader to the next one.
         */
        toggleBehavior(key) {
            self[key] = !self[key];
        },
    }))
        .actions(self => ({
        afterAttach() {
            // Apply the chosen color theme whenever it changes, a structure
            // finishes loading (structureSequences is set after its molstar
            // representation is built, so the theme has something to recolor), or
            // the mapped chain changes.
            addDisposer(self, autorun(() => {
                const { molstarPluginContext, colorScheme } = self;
                const structures = self.structures.flatMap(s => s.structureSequences
                    ? s.molstarStructures.map(molstarStructure => ({
                        molstarStructure,
                        entityId: s.mappedEntity?.entityId,
                    }))
                    : []);
                if (molstarPluginContext && structures.length > 0) {
                    applyColorTheme({
                        plugin: molstarPluginContext,
                        colorScheme,
                        structures,
                    }).catch((e) => {
                        console.error(e);
                        self.setError(e);
                    });
                }
            }));
            addDisposer(self, autorun(() => {
                const plugin = self.molstarPluginContext;
                for (const s of self.structures) {
                    const { hidden, molstarStructures: structures } = s;
                    if (plugin && structures.length > 0) {
                        setStructuresHidden({ plugin, structures, hidden }).catch((e) => {
                            console.error(e);
                            self.setError(e);
                        });
                    }
                }
            }));
            // Load structures into Molstar as they appear or whenever the plugin
            // context changes. See makeStructureLoader for why the autorun body is
            // synchronous and how it guards against duplicate/stale loads.
            addDisposer(self, autorun(makeStructureLoader(self)));
            // Superpose (TM-align) whenever the set of loaded structures grows past
            // one. Keeping this reactive means adding a structure only pushes it and
            // lets the loader load it; see makeStructureSuperposer.
            addDisposer(self, autorun(makeStructureSuperposer(self)));
            // Frame a declared selection once everything is loaded and superposed;
            // see makeSelectionFramer.
            addDisposer(self, autorun(makeSelectionFramer(self)));
            addDisposer(self, autorun(makeLociChannel(self, 'select')));
            addDisposer(self, autorun(makeLociChannel(self, 'highlight')));
            // Mol*'s click and hover, heard once for the whole view
            attachViewInteractions(self);
        },
    }))
        .views(self => ({
        get primaryStructure() {
            return self.structures[0];
        },
        /**
         * #getter
         * JBrowse's per-view readiness hook, see showLoading.ts
         */
        get showLoading() {
            return showLoading(self);
        },
        /**
         * #getter
         * Every structure loaded, aligned and, with several, superposed.
         */
        get settled() {
            return structuresSettled(self);
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
            return self.structures.flatMap(s => s.loadingMessage === undefined
                ? []
                : [{ id: getPath(s), message: s.loadingMessage }]);
        },
        /**
         * #getter
         * The one structure whose alignment panel is open.
         */
        get alignmentStructure() {
            const { structures, alignmentStructureIndex } = self;
            return ((alignmentStructureIndex === undefined
                ? undefined
                : structures[alignmentStructureIndex]) ??
                structures.find(s => s.seededSelection) ??
                structures[0]);
        },
        /**
         * #getter
         * The colour scheme's key, from the first structure that has loaded.
         */
        get colorLegend() {
            const plugin = self.molstarPluginContext;
            const loaded = self.structures.find(s => s.structureSequences);
            const structure = loaded?.molstarStructures[0];
            return plugin && structure
                ? colorSchemeLegend({
                    plugin,
                    colorScheme: self.colorScheme,
                    structure,
                    entityId: loaded.mappedEntity?.entityId,
                })
                : undefined;
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
                const disabled = requires.some(required => !self[required]);
                return {
                    key,
                    label,
                    checked: key === 'compactTracks' ? self.tracksCompact : self[key],
                    disabled,
                    toggle: () => {
                        if (!disabled) {
                            self.toggleSetting(key);
                        }
                    },
                };
            });
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
                    self.toggleBehavior(key);
                },
            }));
        },
    }))
        .views(self => ({
        /**
         * #method
         * Whether a structure's header row carries the mapped-chain picker. With
         * the alignment panel hidden every row does, since no row is the open
         * one and the picker is the way out of a wrongly mapped chain.
         */
        offersChainPicker(structure) {
            return (!self.showAlignment ||
                self.alignmentStructure === structure ||
                !structure.userProvidedTranscriptSequence);
        },
        menuItems() {
            return [
                {
                    label: 'Add structure...',
                    onClick: () => {
                        getSession(self).queueDialog(handleClose => [
                            AddStructureDialog,
                            { model: self, handleClose },
                        ]);
                    },
                },
                ...(self.structures.length > 0
                    ? [
                        {
                            label: 'Remove structure',
                            subMenu: self.structures.map(structure => ({
                                label: structure.label,
                                onClick: () => {
                                    self.removeStructure(structure);
                                },
                            })),
                        },
                    ]
                    : []),
                {
                    label: 'Clear selection',
                    onClick: () => {
                        self.clearSelection();
                    },
                },
                {
                    label: 'Import manual alignment...',
                    onClick: () => {
                        getSession(self).queueDialog(handleClose => [
                            ManualAlignmentDialog,
                            { model: self, handleClose },
                        ]);
                    },
                },
                {
                    label: 'Re-align structures (TM-align)',
                    onClick: () => {
                        self.setSuperposedCount(0);
                    },
                },
                {
                    label: 'Restore hidden feature tracks',
                    onClick: () => {
                        for (const structure of self.structures) {
                            structure.showAllFeatureTypes();
                        }
                    },
                },
            ];
        },
    }));
}
export default stateModelFactory;

import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes';
import { ElementId } from '@jbrowse/core/util/types/mst';
import { addDisposer, getPath, types } from '@jbrowse/mobx-state-tree';
import { autorun } from 'mobx';
import { ALIGNMENT_ALGORITHM_VALUES, DEFAULT_ALIGNMENT_ALGORITHM, } from 'p2s_mapper';
import { COLOR_SCHEME_VALUES, applyColorTheme, } from './applyColorTheme';
import { makeSelectionFramer } from './frameSelection';
import { makeLociChannel } from './lociChannel';
import { defaultDisplayName } from './proteinViewSpec';
import { removeMolstarStructure } from './removeStructure';
import { showLoading } from './showLoading';
import { readStoredSettings, storeSetting, withStoredSettings, } from './storedSettings';
import { makeStructureLoader } from './structureLoader';
import Structure from './structureModel';
import { makeStructureSuperposer } from './structureSuperposer';
import { superposeStructures } from './superposeStructures';
// What a click and a highlight do, as opposed to what the panel shows. Named
// here rather than in storedSettings because these are deliberately not
// remembered across views.
const BEHAVIOR_SETTINGS = [
    ['showHighlight', 'Pairwise alignment as green highlight'],
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
         * molstar color-theme name applied to all loaded structures
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
        setHeight(n) {
            self.height = n;
            return n;
        },
        /**
         * #action
         */
        setShowAlignment(f) {
            self.showAlignment = f;
        },
        /**
         * #action
         */
        setShowControls(arg) {
            self.showControls = arg;
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
        setAlignmentAlgorithm(algorithm) {
            self.alignmentAlgorithm = algorithm;
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
        /**
         * #action
         */
        setShowManualAlignmentDialog(val) {
            self.showManualAlignmentDialog = val;
        },
        /**
         * #action
         */
        setShowAddStructureDialog(val) {
            self.showAddStructureDialog = val;
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
                structure.setClickedStructureRange(undefined);
                structure.setSelectedFeatureId(undefined);
            }
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
        .actions(self => ({
        /**
         * #action
         * A menu toggle, remembered for views opened later. Only a toggle
         * persists: a spec's value is not the reader's preference.
         */
        toggleSetting(key) {
            const value = !self[key];
            self[key] = value;
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
                const structures = self.structures.flatMap(s => s.molstarStructure && s.structureSequences
                    ? [
                        {
                            molstarStructure: s.molstarStructure,
                            entityId: s.mappedEntity?.entityId,
                        },
                    ]
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
         * What the header's Tune menu offers: the layout choices, remembered for
         * views opened later. The view menu carries actions instead, so a reader
         * looking for a toggle has one place to look.
         */
        get displayToggles() {
            return [
                ['showAlignment', 'Show alignment'],
                ['showProteinTracks', 'Show feature tracks'],
                ['compactTracks', 'Compact tracks'],
                [
                    'autoScrollAlignment',
                    'Auto-scroll alignment to hovered position',
                ],
                ['showControls', 'Show Mol* controls'],
            ].map(([key, label]) => ({
                label,
                checked: self[key],
                toggle: () => {
                    self.toggleSetting(key);
                },
            }));
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
        menuItems() {
            return [
                {
                    label: 'Add structure...',
                    onClick: () => {
                        self.setShowAddStructureDialog(true);
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
                        self.setShowManualAlignmentDialog(true);
                    },
                },
                {
                    label: 'Re-align structures (TM-align)',
                    onClick: () => {
                        if (self.molstarPluginContext) {
                            superposeStructures(self.molstarPluginContext).catch((e) => {
                                console.error(e);
                                self.setError(e);
                            });
                        }
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

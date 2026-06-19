import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes';
import { ElementId } from '@jbrowse/core/util/types/mst';
import { addDisposer, types } from '@jbrowse/mobx-state-tree';
import SettingsIcon from '@mui/icons-material/Settings';
import Visibility from '@mui/icons-material/Visibility';
import { autorun } from 'mobx';
import { addStructureFromData } from './addStructureFromData';
import { addStructureFromURL } from './addStructureFromURL';
import { COLOR_SCHEMES, COLOR_SCHEME_VALUES, applyColorTheme, } from './applyColorTheme';
import { extractPerResidueConfidence } from './extractPerResidueConfidence';
import { extractStructureSequences } from './extractStructureSequences';
import Structure from './structureModel';
import { superposeStructures } from './superposeStructures';
import { DEFAULT_ALIGNMENT_ALGORITHM } from './types';
const SETTINGS_KEY = 'proteinView-settings';
const PERSISTED_SETTINGS = [
    'showAlignment',
    'showProteinTracks',
    'showHighlight',
    'zoomToBaseLevel',
    'autoScrollAlignment',
];
async function loadStructureData({ structure, plugin, }) {
    const { model } = structure.data
        ? await addStructureFromData({ data: structure.data, plugin })
        : structure.url
            ? await addStructureFromURL({ url: structure.url, plugin })
            : { model: undefined };
    const sequences = model ? extractStructureSequences(model) : undefined;
    const confidence = model
        ? extractPerResidueConfidence(model, sequences?.[0]?.length)
        : undefined;
    return { sequences, confidence };
}
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
         */
        alignmentAlgorithm: types.optional(types.string, DEFAULT_ALIGNMENT_ALGORITHM),
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
        init: types.frozen(),
    }))
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
        setShowHighlight(arg) {
            self.showHighlight = arg;
        },
        /**
         * #action
         */
        setShowProteinTracks(arg) {
            self.showProteinTracks = arg;
        },
        /**
         * #action
         */
        setZoomToBaseLevel(arg) {
            self.zoomToBaseLevel = arg;
        },
        /**
         * #action
         */
        setAutoScrollAlignment(arg) {
            self.autoScrollAlignment = arg;
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
        /**
         * #action
         */
        setInit(arg) {
            self.init = arg;
        },
        /**
         * #action
         */
        setConnectedMsaViewId(id) {
            self.connectedMsaViewId = id;
        },
        /**
         * #action
         */
        addStructure(structure) {
            self.structures.push(Structure.create({
                url: structure.url,
                data: structure.data,
                userProvidedTranscriptSequence: '',
            }));
        },
    }))
        .actions(self => ({
        /**
         * #action
         */
        async addStructureAndSuperpose(structure) {
            const { molstarPluginContext } = self;
            if (!molstarPluginContext) {
                return;
            }
            const newStructure = Structure.create({
                url: structure.url,
                data: structure.data,
                userProvidedTranscriptSequence: '',
            });
            // Set loadedToMolstar BEFORE pushing to avoid race condition with autorun
            newStructure.setLoadedToMolstar(true);
            self.structures.push(newStructure);
            try {
                newStructure.setStructureData(await loadStructureData({
                    structure,
                    plugin: molstarPluginContext,
                }));
                if (self.structures.length > 1) {
                    await superposeStructures(molstarPluginContext);
                }
            }
            catch (e) {
                self.setError(e);
                console.error(e);
            }
        },
    }))
        .actions(self => ({
        afterAttach() {
            // restore settings from localStorage
            try {
                const stored = localStorage.getItem(SETTINGS_KEY);
                if (stored) {
                    const settings = JSON.parse(stored);
                    for (const key of PERSISTED_SETTINGS) {
                        if (settings[key] !== undefined) {
                            self[key] = settings[key];
                        }
                    }
                }
            }
            catch (e) {
                console.error('Failed to restore protein view settings', e);
            }
            // save settings to localStorage when they change
            addDisposer(self, autorun(() => {
                try {
                    const settings = {};
                    for (const key of PERSISTED_SETTINGS) {
                        settings[key] = self[key];
                    }
                    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
                }
                catch (e) {
                    console.error('Failed to save protein view settings', e);
                }
            }));
            // process init parameter for loading structures from session snapshots
            addDisposer(self, autorun(() => {
                const { init } = self;
                if (init) {
                    const { structures, showControls, showAlignment } = init;
                    if (structures) {
                        for (const structure of structures) {
                            self.addStructure(structure);
                        }
                    }
                    if (showControls !== undefined) {
                        self.setShowControls(showControls);
                    }
                    if (showAlignment !== undefined) {
                        self.setShowAlignment(showAlignment);
                    }
                    self.setInit(undefined);
                }
            }));
            // Apply the chosen color theme whenever it changes or once a structure
            // finishes loading (structureSequences is set after its molstar
            // representation is built, so the theme has something to recolor).
            addDisposer(self, autorun(() => {
                const { molstarPluginContext, colorScheme } = self;
                const readyCount = self.structures.filter(s => s.structureSequences !== undefined).length;
                if (molstarPluginContext && readyCount > 0) {
                    applyColorTheme({
                        plugin: molstarPluginContext,
                        colorScheme,
                    }).catch((e) => {
                        console.error(e);
                        self.setError(e);
                    });
                }
            }));
            addDisposer(self, autorun(async () => {
                const { structures, molstarPluginContext } = self;
                if (molstarPluginContext) {
                    for (const structure of structures) {
                        if (!structure.loadedToMolstar) {
                            try {
                                structure.setStructureData(await loadStructureData({
                                    structure,
                                    plugin: molstarPluginContext,
                                }));
                                structure.setLoadedToMolstar(true);
                            }
                            catch (e) {
                                self.setError(e);
                                console.error(e);
                            }
                        }
                    }
                }
            }));
        },
    }))
        .views(self => ({
        get primaryStructure() {
            return self.structures[0];
        },
        menuItems() {
            return [
                {
                    label: 'Pairwise alignment',
                    icon: Visibility,
                    type: 'checkbox',
                    checked: self.showAlignment,
                    onClick: () => {
                        self.setShowAlignment(!self.showAlignment);
                    },
                },
                {
                    label: 'Protein feature tracks',
                    icon: Visibility,
                    type: 'checkbox',
                    checked: self.showProteinTracks,
                    onClick: () => {
                        self.setShowProteinTracks(!self.showProteinTracks);
                    },
                },
                {
                    label: 'Color scheme...',
                    subMenu: COLOR_SCHEMES.map(scheme => ({
                        label: scheme.label,
                        type: 'radio',
                        checked: self.colorScheme === scheme.value,
                        onClick: () => {
                            self.setColorScheme(scheme.value);
                        },
                    })),
                },
                {
                    label: 'Add structure...',
                    onClick: () => {
                        self.setShowAddStructureDialog(true);
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
                                self.setShowHighlight(!self.showHighlight);
                            },
                        },
                        {
                            label: 'Show all protein feature tracks',
                            onClick: () => {
                                for (const structure of self.structures) {
                                    structure.showAllFeatureTypes();
                                }
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
                            label: 'Zoom to base level on click',
                            type: 'checkbox',
                            checked: self.zoomToBaseLevel,
                            onClick: () => {
                                self.setZoomToBaseLevel(!self.zoomToBaseLevel);
                            },
                        },
                        {
                            label: 'Auto-scroll protein feature view on hover',
                            type: 'checkbox',
                            checked: self.autoScrollAlignment,
                            onClick: () => {
                                self.setAutoScrollAlignment(!self.autoScrollAlignment);
                            },
                        },
                    ],
                },
            ];
        },
    }));
}
export default stateModelFactory;

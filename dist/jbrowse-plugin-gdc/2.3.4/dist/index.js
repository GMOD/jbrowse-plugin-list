import { ConfigurationSchema } from '@jbrowse/core/configuration';
import Plugin from '@jbrowse/core/Plugin';
import DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType';
import InternetAccountType from '@jbrowse/core/pluggableElementTypes/InternetAccountType';
import { createBaseTrackConfig, createBaseTrackModel, } from '@jbrowse/core/pluggableElementTypes/models';
import { isAbstractMenuManager } from '@jbrowse/core/util';
import { getFileName } from '@jbrowse/core/util/tracks';
import { DataExploration } from './UI/Icons';
import { version } from '../package.json';
import GDCFilterWidgetF from './GDCFilterWidget';
import { GDCExtraPanel } from './GDCFeatureWidget/GDCFeatureWidget';
import GDCSearchWidgetF from './GDCSearchWidget';
import LinearGDCDisplayF from './LinearGDCDisplay';
import LinearIEQDisplayF from './LinearIEQDisplay';
import LinearMAFDisplay from './LinearMAFDisplay';
import GDCAdapterConfigSchema from './GDCAdapter/configSchema';
import GDCAdapterClass from './GDCAdapter/GDCAdapter';
import { configSchema as segmentCnvConfigSchema, AdapterClass as SegmentCNVAdapter, } from './SegmentCNVAdapter';
import { configSchema as mafConfigSchema, AdapterClass as MafAdapter, } from './MAFAdapter';
import { configSchema as mbvConfigSchema, AdapterClass as MbvAdapter, } from './MBVAdapter';
import { configSchema as ieqConfigSchema, AdapterClass as IeqAdapter, } from './IEQAdapter';
import { configSchema as sjqConfigSchema, AdapterClass as SjqAdapter, } from './SJQAdapter';
import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType';
import TrackType from '@jbrowse/core/pluggableElementTypes/TrackType';
import WidgetType from '@jbrowse/core/pluggableElementTypes/WidgetType';
import { configSchema as GDCInternetAccountConfigSchema, modelFactory as GDCInternetAccountModelFactory, } from './GDCInternetAccount';
export default class GDCPlugin extends Plugin {
    constructor() {
        super(...arguments);
        this.name = 'GDCPlugin';
        this.version = version;
    }
    install(pluginManager) {
        const LGVPlugin = pluginManager.getPlugin('LinearGenomeViewPlugin');
        const { BaseLinearDisplayComponent } = LGVPlugin.exports;
        const adapterCategoryHeader = 'GDC Plugin Adapters';
        pluginManager.addAdapterType(() => new AdapterType({
            name: 'GDCAdapter',
            configSchema: GDCAdapterConfigSchema,
            adapterMetadata: {
                hiddenFromGUI: true,
            },
            AdapterClass: GDCAdapterClass,
        }));
        pluginManager.addAdapterType(() => new AdapterType({
            name: 'SjqAdapter',
            configSchema: sjqConfigSchema,
            displayName: 'Splice Junction Quantification Adapter',
            adapterMetadata: {
                category: adapterCategoryHeader,
                hiddenFromGUI: false,
                description: '',
            },
            AdapterClass: SjqAdapter,
        }));
        pluginManager.addToExtensionPoint('Core-guessAdapterForLocation', (adapterGuesser) => {
            return (file, index, adapterHint) => {
                const adapterName = 'SjqAdapter';
                if (adapterHint === adapterName) {
                    return {
                        type: adapterName,
                        sjqLocation: file,
                    };
                }
                return adapterGuesser(file, index, adapterHint);
            };
        });
        pluginManager.addAdapterType(() => new AdapterType({
            name: 'MbvAdapter',
            configSchema: mbvConfigSchema,
            displayName: 'Methylation Beta Value Adapter',
            adapterMetadata: {
                category: adapterCategoryHeader,
                hiddenFromGUI: false,
                description: '',
            },
            AdapterClass: MbvAdapter,
        }));
        pluginManager.addToExtensionPoint('Core-guessAdapterForLocation', (adapterGuesser) => {
            return (file, index, adapterHint) => {
                const adapterName = 'MbvAdapter';
                if (adapterHint === adapterName) {
                    return {
                        type: adapterName,
                        ieqLocation: file,
                    };
                }
                return adapterGuesser(file, index, adapterHint);
            };
        });
        pluginManager.addAdapterType(() => new AdapterType({
            name: 'MafAdapter',
            configSchema: mafConfigSchema,
            adapterMetadata: {
                category: adapterCategoryHeader,
                hiddenFromGUI: false,
                description: '',
            },
            AdapterClass: MafAdapter,
        }));
        pluginManager.addToExtensionPoint('Core-guessAdapterForLocation', (adapterGuesser) => {
            return (file, index, adapterHint) => {
                const regexGuess = /\.maf$/i;
                const adapterName = 'MafAdapter';
                const fileName = getFileName(file);
                if (regexGuess.test(fileName) || adapterHint === adapterName) {
                    return {
                        type: adapterName,
                        mafLocation: file,
                    };
                }
                return adapterGuesser(file, index, adapterHint);
            };
        });
        pluginManager.addToExtensionPoint('Core-guessTrackTypeForLocation', (trackTypeGuesser) => {
            return (adapterName) => {
                if (adapterName === 'MafAdapter') {
                    return 'MAFTrack';
                }
                return trackTypeGuesser(adapterName);
            };
        });
        pluginManager.addAdapterType(() => new AdapterType({
            name: 'IeqAdapter',
            configSchema: ieqConfigSchema,
            displayName: 'Isoform Expression Quantification Adapter',
            adapterMetadata: {
                category: adapterCategoryHeader,
                hiddenFromGUI: false,
                description: '',
            },
            AdapterClass: IeqAdapter,
        }));
        pluginManager.addToExtensionPoint('Core-guessAdapterForLocation', (adapterGuesser) => {
            return (file, index, adapterHint) => {
                const adapterName = 'IeqAdapter';
                if (adapterHint === adapterName) {
                    return {
                        type: adapterName,
                        ieqLocation: file,
                    };
                }
                return adapterGuesser(file, index, adapterHint);
            };
        });
        pluginManager.addToExtensionPoint('Core-guessTrackTypeForLocation', (trackTypeGuesser) => {
            return (adapterName) => {
                if (adapterName === 'IeqAdapter') {
                    return 'IEQTrack';
                }
                return trackTypeGuesser(adapterName);
            };
        });
        pluginManager.addAdapterType(() => new AdapterType({
            name: 'SegmentCNVAdapter',
            configSchema: segmentCnvConfigSchema,
            displayName: 'Segment Copy Number Variation Adapter',
            adapterMetadata: {
                category: adapterCategoryHeader,
                hiddenFromGUI: false,
                description: '',
            },
            AdapterClass: SegmentCNVAdapter,
        }));
        pluginManager.addToExtensionPoint('Core-guessAdapterForLocation', (adapterGuesser) => {
            return (file, index, adapterHint) => {
                const regexGuess = /\.seg$/i;
                const adapterName = 'SegmentCNVAdapter';
                const fileName = getFileName(file);
                if (regexGuess.test(fileName) || adapterHint === adapterName) {
                    return {
                        type: adapterName,
                        segLocation: file,
                    };
                }
                return adapterGuesser(file, index, adapterHint);
            };
        });
        pluginManager.addToExtensionPoint('Core-guessTrackTypeForLocation', (trackTypeGuesser) => {
            return (adapterName) => {
                if (adapterName === 'SegmentCNVAdapter') {
                    return 'QuantitativeTrack';
                }
                return trackTypeGuesser(adapterName);
            };
        });
        pluginManager.addTrackType(() => {
            const configSchema = ConfigurationSchema('GDCTrack', {}, {
                baseConfiguration: createBaseTrackConfig(pluginManager),
                explicitIdentifier: 'trackId',
            });
            return new TrackType({
                name: 'GDCTrack',
                configSchema,
                stateModel: createBaseTrackModel(pluginManager, 'GDCTrack', configSchema),
            });
        });
        pluginManager.addDisplayType(() => {
            const { configSchema, stateModel } = LinearGDCDisplayF(pluginManager);
            return new DisplayType({
                name: 'LinearGDCDisplay',
                configSchema,
                stateModel,
                trackType: 'GDCTrack',
                viewType: 'LinearGenomeView',
                ReactComponent: BaseLinearDisplayComponent,
            });
        });
        pluginManager.addTrackType(() => {
            const configSchema = ConfigurationSchema('IEQTrack', {}, {
                baseConfiguration: createBaseTrackConfig(pluginManager),
                explicitIdentifier: 'trackId',
            });
            return new TrackType({
                name: 'IEQTrack',
                configSchema,
                stateModel: createBaseTrackModel(pluginManager, 'IEQTrack', configSchema),
            });
        });
        pluginManager.addDisplayType(() => {
            const { configSchema, stateModel } = LinearIEQDisplayF(pluginManager);
            return new DisplayType({
                name: 'LinearIEQDisplay',
                configSchema,
                stateModel,
                trackType: 'IEQTrack',
                viewType: 'LinearGenomeView',
                ReactComponent: BaseLinearDisplayComponent,
            });
        });
        pluginManager.addTrackType(() => {
            const configSchema = ConfigurationSchema('MAFTrack', {}, {
                baseConfiguration: createBaseTrackConfig(pluginManager),
                explicitIdentifier: 'trackId',
            });
            return new TrackType({
                name: 'MAFTrack',
                configSchema,
                stateModel: createBaseTrackModel(pluginManager, 'MAFTrack', configSchema),
            });
        });
        pluginManager.addDisplayType(() => {
            const { configSchema, stateModel } = pluginManager.load(LinearMAFDisplay);
            return new DisplayType({
                name: 'LinearMAFDisplay',
                configSchema,
                stateModel,
                trackType: 'MAFTrack',
                viewType: 'LinearGenomeView',
                ReactComponent: BaseLinearDisplayComponent,
            });
        });
        pluginManager.addWidgetType(() => {
            return new WidgetType({
                name: 'GDCFilterWidget',
                ...GDCFilterWidgetF(pluginManager),
            });
        });
        pluginManager.addToExtensionPoint('Core-extraFeaturePanel', (extendee, props) => {
            const feature = props.feature;
            if ((feature === null || feature === void 0 ? void 0 : feature.ssmId) !== undefined || (feature === null || feature === void 0 ? void 0 : feature.geneId) !== undefined) {
                return { name: 'GDC', Component: GDCExtraPanel };
            }
            return extendee;
        });
        pluginManager.addWidgetType(() => {
            return new WidgetType({
                name: 'GDCSearchWidget',
                heading: 'Search GDC',
                ...GDCSearchWidgetF(pluginManager),
            });
        });
        pluginManager.addInternetAccountType(() => {
            return new InternetAccountType({
                name: 'GDCInternetAccount',
                configSchema: GDCInternetAccountConfigSchema,
                stateModel: GDCInternetAccountModelFactory(GDCInternetAccountConfigSchema),
            });
        });
    }
    configure(pluginManager) {
        if (isAbstractMenuManager(pluginManager.rootModel)) {
            pluginManager.rootModel.appendToMenu('Tools', {
                label: 'GDC Data Import',
                icon: DataExploration,
                onClick: (session) => {
                    session.showWidget(session.addWidget('GDCSearchWidget', 'gdcSearchWidget'));
                },
            });
        }
        pluginManager.jexl.addFunction('vepColouring', (feature) => {
            var _a, _b, _c, _d, _e, _f, _g;
            const colourMap = {
                LOW: 'blue',
                MODIFIER: 'goldenrod',
                MODERATE: 'green',
                HIGH: 'red',
            };
            const edges = (_c = (_b = (_a = feature.get('consequence')) === null || _a === void 0 ? void 0 : _a.hits) === null || _b === void 0 ? void 0 : _b.edges) !== null && _c !== void 0 ? _c : [];
            const canonical = edges.find((e) => e.node.transcript.is_canonical);
            const impact = (_f = (_e = (_d = canonical === null || canonical === void 0 ? void 0 : canonical.node) === null || _d === void 0 ? void 0 : _d.transcript) === null || _e === void 0 ? void 0 : _e.annotation) === null || _f === void 0 ? void 0 : _f.vep_impact;
            return impact ? ((_g = colourMap[impact]) !== null && _g !== void 0 ? _g : 'lightgray') : 'lightgray';
        });
        pluginManager.jexl.addFunction('mafColouring', (feature) => {
            const classification = feature.get('variant_classification');
            switch (classification) {
                case 'Intron':
                    return 'blue';
                case 'Nonsense_Mutation':
                    return 'brown';
                case 'Missense_Mutation':
                    return 'goldenrod';
                case 'Silent':
                    return 'orange';
                case 'Splice_Site':
                    return 'green';
                case 'Translation_Start_Site':
                    return 'skyblue';
                case 'Nonstop_Mutation':
                    return 'red';
                case 'IGR':
                    return 'violet';
                case 'Frame_Shift_Del':
                    return 'pink';
                case 'Frame_Shift_Ins':
                    return 'olive';
                case 'In_Frame_Del':
                    return 'yellowgreen';
                case 'In_Frame_Ins':
                    return 'purple';
                case "3'UTR":
                    return 'lightgray';
                case "3'Flank":
                    return 'maroon';
                case "5'UTR":
                    return 'lime';
                case "5'Flank":
                    return 'magenta';
                case 'RNA':
                    return 'cyan';
                case 'Targeted_Region':
                    return 'crimson';
                default:
                    return 'black';
            }
        });
        pluginManager.jexl.addFunction('switch', (feature, hlBy) => {
            hlBy = JSON.parse(hlBy);
            const filteredConsequence = feature
                .get('consequence')
                .hits.edges.find((cons) => cons.node.transcript.is_canonical);
            const impact = filteredConsequence.node.transcript.annotation[hlBy.attributeName];
            const attrValue = feature.get(hlBy.attributeName);
            const target = impact ? impact : attrValue;
            let colour = 'black';
            hlBy.values.forEach((element) => {
                if (target === element.name) {
                    colour = `${element.colour}`;
                }
            });
            return colour;
        });
        pluginManager.jexl.addFunction('ieqColouring', (feature, attributeName) => {
            const percentage = feature.get(attributeName);
            const denom = Math.ceil(Math.log10(6060));
            const val = Math.abs((100 * Math.log10(percentage)) / denom - 200);
            return `rgb(184,${val},11)`;
        });
        pluginManager.jexl.addFunction('rgb', (feature, attributeName) => {
            const percentage = feature.get(attributeName);
            return `rgb(0,${percentage},0)`;
        });
        pluginManager.jexl.addFunction('cancer', (feature, attributeName) => {
            return feature.get(attributeName) ? 'red' : 'blue';
        });
    }
}
//# sourceMappingURL=index.js.map
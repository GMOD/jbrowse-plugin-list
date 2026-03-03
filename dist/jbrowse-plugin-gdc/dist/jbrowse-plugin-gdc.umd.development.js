(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@jbrowse/core/configuration'), require('@jbrowse/core/Plugin'), require('@jbrowse/core/pluggableElementTypes/DisplayType'), require('mobx-state-tree'), require('@jbrowse/core/pluggableElementTypes/models'), require('@jbrowse/core/util'), require('@jbrowse/core/util/tracks'), require('@mui/material/SvgIcon'), require('react'), require('@jbrowse/core/util/types/mst'), require('@mui/material/utils'), require('react/jsx-runtime'), require('mobx-react'), require('@mui/material'), require('tss-react/mui'), require('@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail'), require('prop-types'), require('@jbrowse/core/ui'), require('@jbrowse/core/data_adapters/BaseAdapter'), require('@jbrowse/core/util/rxjs'), require('@jbrowse/core/util/io'), require('@jbrowse/core/pluggableElementTypes/AdapterType'), require('@jbrowse/core/pluggableElementTypes/TrackType'), require('@jbrowse/core/pluggableElementTypes/WidgetType')) :
	typeof define === 'function' && define.amd ? define(['exports', '@jbrowse/core/configuration', '@jbrowse/core/Plugin', '@jbrowse/core/pluggableElementTypes/DisplayType', 'mobx-state-tree', '@jbrowse/core/pluggableElementTypes/models', '@jbrowse/core/util', '@jbrowse/core/util/tracks', '@mui/material/SvgIcon', 'react', '@jbrowse/core/util/types/mst', '@mui/material/utils', 'react/jsx-runtime', 'mobx-react', '@mui/material', 'tss-react/mui', '@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail', 'prop-types', '@jbrowse/core/ui', '@jbrowse/core/data_adapters/BaseAdapter', '@jbrowse/core/util/rxjs', '@jbrowse/core/util/io', '@jbrowse/core/pluggableElementTypes/AdapterType', '@jbrowse/core/pluggableElementTypes/TrackType', '@jbrowse/core/pluggableElementTypes/WidgetType'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.JBrowsePluginGDC = {}, global.JBrowseExports["@jbrowse/core/configuration"], global.JBrowseExports["@jbrowse/core/Plugin"], global.JBrowseExports["@jbrowse/core/pluggableElementTypes/DisplayType"], global.JBrowseExports["mobx-state-tree"], global.JBrowseExports["@jbrowse/core/pluggableElementTypes/models"], global.JBrowseExports["@jbrowse/core/util"], global.JBrowseExports["@jbrowse/core/util/tracks"], global.JBrowseExports["@mui/material/SvgIcon"], global.JBrowseExports.react, global.JBrowseExports["@jbrowse/core/util/types/mst"], global.JBrowseExports["@mui/material/utils"], global.JBrowseExports["react/jsx-runtime"], global.JBrowseExports["mobx-react"], global.JBrowseExports["@mui/material"], global.JBrowseExports["tss-react/mui"], global.JBrowseExports["@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail"], global.JBrowseExports["prop-types"], global.JBrowseExports["@jbrowse/core/ui"], global.JBrowseExports["@jbrowse/core/data_adapters/BaseAdapter"], global.JBrowseExports["@jbrowse/core/util/rxjs"], global.JBrowseExports["@jbrowse/core/util/io"], global.JBrowseExports["@jbrowse/core/pluggableElementTypes/AdapterType"], global.JBrowseExports["@jbrowse/core/pluggableElementTypes/TrackType"], global.JBrowseExports["@jbrowse/core/pluggableElementTypes/WidgetType"]));
})(this, (function (exports, configuration, Plugin, DisplayType, require$$0, models, util, tracks, SvgIcon, React, mst, require$$0$1, require$$2, mobxReact, material, mui, BaseFeatureDetail, PropTypes, ui, BaseAdapter, rxjs, io, AdapterType, TrackType$1, WidgetType) { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var InternetAccountType$1 = {};

	var PluggableElementBase$1 = {};

	Object.defineProperty(PluggableElementBase$1, "__esModule", { value: true });
	class PluggableElementBase {
	    constructor(args) {
	        this.name = args.name || 'UNKNOWN';
	        this.maybeDisplayName = args.displayName;
	    }
	    get displayName() {
	        return this.maybeDisplayName || this.name;
	    }
	}
	PluggableElementBase$1.default = PluggableElementBase;

	var mstReflection = {};

	Object.defineProperty(mstReflection, "__esModule", { value: true });
	mstReflection.resolveLateType = mstReflection.getEnumerationValues = mstReflection.getDefaultValue = mstReflection.getPropertyType = mstReflection.getUnionSubTypes = mstReflection.getSubType = void 0;
	/* eslint-disable no-underscore-dangle */
	const mobx_state_tree_1 = require$$0;
	/**
	 * get the inner type of an MST optional, array, or late type object
	 */
	function getSubType(type) {
	    let t;
	    if ((0, mobx_state_tree_1.isOptionalType)(type)) {
	        // @ts-expect-error
	        t = type._subtype || type.type;
	    }
	    else if ((0, mobx_state_tree_1.isArrayType)(type) || (0, mobx_state_tree_1.isMapType)(type)) {
	        // @ts-expect-error
	        t = type._subtype || type._subType || type.subType;
	        // @ts-expect-error
	    }
	    else if (typeof type.getSubType === 'function') {
	        // @ts-expect-error
	        return type.getSubType();
	    }
	    else {
	        throw new TypeError('unsupported mst type');
	    }
	    if (!t) {
	        // debugger
	        throw new Error('failed to get subtype');
	    }
	    return t;
	}
	mstReflection.getSubType = getSubType;
	/**
	 * get the array of the subtypes in a union
	 */
	function getUnionSubTypes(unionType) {
	    if (!(0, mobx_state_tree_1.isUnionType)(unionType)) {
	        throw new TypeError('not an MST union type');
	    }
	    const t = 
	    // @ts-expect-error
	    unionType._types ||
	        // @ts-expect-error
	        unionType.types ||
	        // @ts-expect-error
	        getSubType(unionType)._types ||
	        // @ts-expect-error
	        getSubType(unionType).types;
	    if (!t) {
	        // debugger
	        throw new Error('failed to extract subtypes from mst union');
	    }
	    return t;
	}
	mstReflection.getUnionSubTypes = getUnionSubTypes;
	/**
	 * get the type of one of the properties of the given MST model type
	 */
	function getPropertyType(type, propertyName) {
	    return type.properties[propertyName];
	}
	mstReflection.getPropertyType = getPropertyType;
	/**
	 * get the base type from inside an MST optional type
	 */
	function getDefaultValue(type) {
	    if (!(0, mobx_state_tree_1.isOptionalType)(type)) {
	        throw new TypeError('type must be an optional type');
	    }
	    // @ts-expect-error
	    return type._defaultValue || type.defaultValue;
	}
	mstReflection.getDefaultValue = getDefaultValue;
	/** get the string values of an MST enumeration type */
	function getEnumerationValues(type) {
	    const subtypes = getUnionSubTypes(type);
	    // the subtypes should all be literals with a value member
	    return subtypes.map(t => t.value);
	}
	mstReflection.getEnumerationValues = getEnumerationValues;
	function resolveLateType(maybeLate) {
	    if (!(0, mobx_state_tree_1.isUnionType)(maybeLate) &&
	        !(0, mobx_state_tree_1.isArrayType)(maybeLate) &&
	        (0, mobx_state_tree_1.isLateType)(maybeLate)) {
	        // @ts-expect-error
	        return maybeLate.getSubType();
	    }
	    return maybeLate;
	}
	mstReflection.resolveLateType = resolveLateType;

	var __importDefault$2 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(InternetAccountType$1, "__esModule", { value: true });
	const PluggableElementBase_1 = __importDefault$2(PluggableElementBase$1);
	const mst_reflection_1 = mstReflection;
	class InternetAccountType extends PluggableElementBase_1.default {
	    constructor(stuff) {
	        super(stuff);
	        this.stateModel = stuff.stateModel;
	        this.configSchema = stuff.configSchema;
	        if (!this.stateModel) {
	            throw new Error(`no stateModel defined for internet account type ${this.name}`);
	        }
	        if (!this.configSchema) {
	            throw new Error(`no configSchema provided for internet account type ${this.name}`);
	        }
	        if (!(0, mst_reflection_1.getDefaultValue)(this.configSchema).type) {
	            const name = this.configSchema ? this.configSchema.name : 'UNKNOWN';
	            throw new Error(`${name} is not explicitlyTyped`);
	        }
	    }
	}
	var _default$d = InternetAccountType$1.default = InternetAccountType;

	// Icon below come from https://fonts.google.com/icons?selected=Material%20Icons%3Adata_exploration%3A
	function DataExploration(props) {
	    return (React.createElement(SvgIcon, { ...props },
	        React.createElement("path", { d: "M12,2C6.48,2,2,6.48,2,12c0,1.33,0.26,2.61,0.74,3.77L8,10.5l3.3,2.78L14.58,10H13V8h5v5h-2v-1.58L11.41,16l-3.29-2.79 l-4.4,4.4C5.52,20.26,8.56,22,12,22h8c1.1,0,2-0.9,2-2v-8C22,6.48,17.52,2,12,2z M19.5,20.5c-0.55,0-1-0.45-1-1s0.45-1,1-1 s1,0.45,1,1S20.05,20.5,19.5,20.5z" })));
	}

	var version = "2.3.1";

	var stateModel = (function (jbrowse) {
	  var Filter = require$$0.types.model({
	    id: require$$0.types.identifier,
	    category: require$$0.types.string,
	    type: require$$0.types.string,
	    filter: require$$0.types.string
	  }).actions(function (self) {
	    return {
	      setCategory: function setCategory(newCategory) {
	        self.category = newCategory;
	        self.filter = '';
	      },
	      setFilter: function setFilter(newFilter) {
	        self.filter = newFilter;
	      }
	    };
	  });
	  var ColourBy = require$$0.types.model({
	    id: require$$0.types.identifier,
	    value: require$$0.types.string
	  });
	  return require$$0.types.model('GDCFilterWidget', {
	    id: mst.ElementId,
	    type: require$$0.types.literal('GDCFilterWidget'),
	    target: require$$0.types.safeReference(jbrowse.pluggableConfigSchemaType('track')),
	    filters: require$$0.types.array(Filter),
	    colourBy: require$$0.types.map(ColourBy)
	  }).actions(function (self) {
	    return {
	      setTarget: function setTarget(newTarget) {
	        self.target = newTarget;
	      },
	      addFilter: function addFilter(id, category, type, filter) {
	        self.filters.push(Filter.create({
	          id: id,
	          category: category,
	          type: type,
	          filter: filter
	        }));
	      },
	      deleteFilter: function deleteFilter(id) {
	        var pos = self.filters.findIndex(function (filter) {
	          return filter.id === id;
	        });
	        self.filters.remove(self.filters[pos]);
	      },
	      getFiltersByType: function getFiltersByType(type) {
	        return self.filters.filter(function (filter) {
	          return filter.type === type;
	        });
	      },
	      clearFilters: function clearFilters() {
	        // Keep filters that have been added but not set
	        self.filters = self.filters.filter(function (f) {
	          return f.filter.length === 0;
	        });
	      },
	      setColourBy: function setColourBy(newColourBy) {
	        self.colourBy[0] = newColourBy;
	      },
	      getColourBy: function getColourBy() {
	        return self.colourBy[0] ? self.colourBy[0] : {};
	      }
	    };
	  });
	});

	// Unique ID creation requires a high quality random # generator. In the browser we therefore
	// require the crypto API and do not support built-in fallback to lower quality random number
	// generators (like Math.random()).
	let getRandomValues;
	const rnds8 = new Uint8Array(16);
	function rng() {
	  // lazy load so that environments that need to polyfill have a chance to do so
	  if (!getRandomValues) {
	    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
	    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);

	    if (!getRandomValues) {
	      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
	    }
	  }

	  return getRandomValues(rnds8);
	}

	/**
	 * Convert array of 16 byte values to UUID string format of the form:
	 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
	 */

	const byteToHex = [];

	for (let i = 0; i < 256; ++i) {
	  byteToHex.push((i + 0x100).toString(16).slice(1));
	}

	function unsafeStringify(arr, offset = 0) {
	  // Note: Be careful editing this code!  It's been tuned for performance
	  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
	  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
	}

	const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
	var native = {
	  randomUUID
	};

	function v4(options, buf, offset) {
	  if (native.randomUUID && !buf && !options) {
	    return native.randomUUID();
	  }

	  options = options || {};
	  const rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

	  rnds[6] = rnds[6] & 0x0f | 0x40;
	  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

	  if (buf) {
	    offset = offset || 0;

	    for (let i = 0; i < 16; ++i) {
	      buf[offset + i] = rnds[i];
	    }

	    return buf;
	  }

	  return unsafeStringify(rnds);
	}

	var Add = {};

	var interopRequireDefault = {exports: {}};

	(function (module) {
	function _interopRequireDefault(obj) {
	  return obj && obj.__esModule ? obj : {
	    "default": obj
	  };
	}
	module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;
	}(interopRequireDefault));

	var createSvgIcon = {};

	(function (exports) {
	'use client';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	Object.defineProperty(exports, "default", {
	  enumerable: true,
	  get: function () {
	    return _utils.createSvgIcon;
	  }
	});
	var _utils = require$$0$1;
	}(createSvgIcon));

	var _interopRequireDefault$8 = interopRequireDefault.exports;
	Object.defineProperty(Add, "__esModule", {
	  value: true
	});
	var default_1$8 = Add.default = void 0;
	var _createSvgIcon$8 = _interopRequireDefault$8(createSvgIcon);
	var _jsxRuntime$8 = require$$2;
	var _default$c = (0, _createSvgIcon$8.default)( /*#__PURE__*/(0, _jsxRuntime$8.jsx)("path", {
	  d: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
	}), 'Add');
	default_1$8 = Add.default = _default$c;

	var Clear = {};

	var _interopRequireDefault$7 = interopRequireDefault.exports;
	Object.defineProperty(Clear, "__esModule", {
	  value: true
	});
	var default_1$7 = Clear.default = void 0;
	var _createSvgIcon$7 = _interopRequireDefault$7(createSvgIcon);
	var _jsxRuntime$7 = require$$2;
	var _default$b = (0, _createSvgIcon$7.default)( /*#__PURE__*/(0, _jsxRuntime$7.jsx)("path", {
	  d: "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
	}), 'Clear');
	default_1$7 = Clear.default = _default$b;

	/**
	 * An element representing an individual filter with a category and set of
	 * applied values
	 */
	const Filter = mobxReact.observer((props) => {
	    const { schema, filterModel, facets } = props;
	    const [categoryValue, setCategoryValue] = React.useState(filterModel.category
	        ? facets.find((f) => f.name === filterModel.category)
	        : facets[0]);
	    const [filterValue, setFilterValue] = React.useState(filterModel.filter ? filterModel.filter.split(',') : []);
	    /**
	     * Converts filter model objects to a GDC filter query and updates the track
	     * @param {*} filters Array of filter model objects
	     * @param {*} target Track target
	     */
	    function updateTrack(filters, target) {
	        let gdcFilters = {
	            op: 'and',
	            content: [],
	        };
	        if (filters.length > 0) {
	            for (const filter of filters) {
	                if (filter.filter !== '') {
	                    gdcFilters.content?.push({
	                        op: 'in',
	                        content: {
	                            field: `${filter.type}s.${filter.category}`,
	                            value: filter.filter.split(','),
	                        },
	                    });
	                }
	            }
	        }
	        else {
	            gdcFilters = {};
	        }
	        target.adapter.filters.set(JSON.stringify(gdcFilters));
	    }
	    const handleFilterDelete = () => {
	        schema.deleteFilter(filterModel.id);
	        updateTrack(schema.filters, schema.target);
	    };
	    return (React.createElement(React.Fragment, null,
	        React.createElement(material.List, null,
	            React.createElement(material.ListItem, { style: { gap: '4px' } },
	                React.createElement(material.FormControl, { fullWidth: true, size: "small" },
	                    React.createElement(material.Select, { labelId: "category-select-label", id: "category-select", value: categoryValue, onChange: event => {
	                            setCategoryValue(event.target.value);
	                            setFilterValue([]);
	                            filterModel.setCategory(event.target.value.name);
	                        }, label: "Category" }, facets.map((filterOption) => (React.createElement(material.MenuItem, { value: filterOption, key: filterOption.name }, filterOption.prettyName))))),
	                React.createElement(material.FormControl, { fullWidth: true, size: "small" },
	                    React.createElement(material.Select, { labelId: "demo-mutiple-checkbox-label", id: "demo-mutiple-checkbox", multiple: true, value: filterValue, onChange: event => {
	                            setFilterValue(event.target.value);
	                            filterModel.setFilter(event.target.value.join(','));
	                            updateTrack(schema.filters, schema.target);
	                        }, input: React.createElement(material.Input, null), displayEmpty: true, renderValue: selected => {
	                            if (selected.length === 0) {
	                                return React.createElement("em", null, "Filters");
	                            }
	                            return selected.join(', ');
	                        } },
	                        React.createElement(material.MenuItem, { disabled: true, value: "" },
	                            React.createElement("em", null, "Filters")),
	                        categoryValue.values.map((name) => (React.createElement(material.MenuItem, { key: name, value: name },
	                            React.createElement(material.Checkbox, { checked: filterValue.indexOf(name) > -1 }),
	                            React.createElement(material.ListItemText, { primary: name })))))),
	                React.createElement(material.Tooltip, { title: "Remove filter", "aria-label": "remove", placement: "bottom" },
	                    React.createElement(material.IconButton, { "aria-label": "remove filter", onClick: handleFilterDelete },
	                        React.createElement(default_1$7, null)))))));
	});
	/**
	 * A collection of filters along with a button to add new filters
	 */
	const FilterList$1 = mobxReact.observer(({ schema, type, facets }) => {
	    const initialFilterSelection = facets[0].name;
	    const handleClick = () => {
	        schema.addFilter(v4(), initialFilterSelection, type, '');
	    };
	    return (React.createElement(React.Fragment, null,
	        schema.filters.map((filterModel) => {
	            if (filterModel.type === type) {
	                return (React.createElement(Filter, { schema: schema, filterModel, key: filterModel.id, facets: facets }));
	            }
	            return null;
	        }),
	        React.createElement(material.Button, { variant: "outlined", onClick: handleClick, startIcon: React.createElement(default_1$8, null) }, "Add Filter")));
	});

	// TODO: Convert these to use the GDC API
	const ssmFacets = [
	    {
	        name: 'consequence.transcript.annotation.polyphen_impact',
	        prettyName: 'polyphen impact',
	        values: ['benign', 'probably_damaging', 'possibly_damaging', 'unknown'],
	    },
	    {
	        name: 'consequence.transcript.annotation.sift_impact',
	        prettyName: 'sift impact',
	        values: [
	            'deleterious',
	            'tolerated',
	            'deleterious_low_confidence',
	            'tolerated_low_confidence',
	        ],
	    },
	    {
	        name: 'consequence.transcript.annotation.vep_impact',
	        prettyName: 'vep impact',
	        values: ['modifier', 'moderate', 'low', 'high'],
	    },
	    {
	        name: 'consequence.transcript.consequence_type',
	        prettyName: 'consequence type',
	        values: [
	            'missense_variant',
	            'downstream_gene_variant',
	            'non_coding_transcript_exon_variant',
	            'synonymous_variant',
	            'intron_variant',
	            'upstream_gene_variant',
	            '3_prime_UTR_variant',
	            'stop_gained',
	            'frameshift_variant',
	            '5_prime_UTR_variant',
	            'splice_region_variant',
	            'splice_acceptor_variant',
	            'splice_donor_variant',
	            'inframe_deletion',
	            'inframe_insertion',
	            'start_lost',
	            'protein_altering_variant',
	            'stop_lost',
	            'stop_retained_variant',
	            'coding_sequence_variant',
	            'incomplete_terminal_codon_variant',
	            'mature_miRNA_variant',
	        ],
	    },
	    {
	        name: 'mutation_subtype',
	        prettyName: 'mutation subtype',
	        values: ['single base substitution', 'small deletion', 'small insertion'],
	    },
	    {
	        name: 'occurrence.case.observation.variant_calling.variant_caller',
	        prettyName: 'variant caller',
	        values: ['mutect2', 'varscan', 'muse', 'somaticsniper'],
	    },
	];
	const geneFacets = [
	    {
	        name: 'biotype',
	        prettyName: 'biotype',
	        values: [
	            'protein_coding',
	            'lincRNA',
	            'miRNA',
	            'transcribed_unprocessed_pseudogene',
	            'processed_pseudogene',
	            'antisense',
	            'unprocessed_pseudogene',
	            'snoRNA',
	            'IG_V_gene',
	            'processed_transcript',
	            'transcribed_processed_pseudogene',
	            'TR_V_gene',
	            'TR_J_gene',
	            'unitary_pseudogene',
	            'misc_RNA',
	            'snRNA',
	            'IG_V_pseudogene',
	            'polymorphic_pseudogene',
	            'IG_D_gene',
	            'sense_overlapping',
	            'sense_intronic',
	            'IG_C_gene',
	            'TEC',
	            'IG_J_gene',
	            'rRNA',
	            'TR_C_gene',
	            'TR_D_gene',
	            'TR_V_pseudogene',
	            'macro_lncRNA',
	            'transcribed_unitary_pseudogene',
	            'translated_unprocessed_pseudogene',
	            'vaultRNA',
	        ],
	    },
	    {
	        name: 'is_cancer_gene_census',
	        prettyName: 'is cancer gene census',
	        values: ['true'],
	    },
	];
	const caseFacets = [
	    {
	        name: 'demographic.ethnicity',
	        prettyName: 'ethnicity',
	        values: [
	            'not hispanic or latino',
	            'not reported',
	            'hispanic or latino',
	            'unknown',
	        ],
	    },
	    {
	        name: 'demographic.gender',
	        prettyName: 'gender',
	        values: ['female', 'male', 'unknown', 'not reported', 'unspecified'],
	    },
	    {
	        name: 'demographic.race',
	        prettyName: 'race',
	        values: [
	            'white',
	            'not reported',
	            'unknown',
	            'black or african american',
	            'asian',
	            'other',
	            'american indian or alaska native',
	            'native hawaiian or other pacific islander',
	            'not allowed to collect',
	        ],
	    },
	    {
	        name: 'disease_type',
	        prettyName: 'disease type',
	        values: [
	            'adenomas and adenocarcinomas',
	            'ductal and lobular neoplasms',
	            'epithelial neoplasms, nos',
	            'gliomas',
	            'squamous cell neoplasms',
	            'myeloid leukemias',
	            'cystic, mucinous and serous neoplasms',
	            'nevi and melanomas',
	            'lymphoid leukemias',
	            'transitional cell papillomas and carcinomas',
	            'complex mixed and stromal neoplasms',
	            'neuroepitheliomatous neoplasms',
	            'neoplasms, nos',
	            'plasma cell tumors',
	            'germ cell neoplasms',
	            'mesothelial neoplasms',
	            'myomatous neoplasms',
	            'osseous and chondromatous neoplasms',
	            'mature b-cell lymphomas',
	            'chronic myeloproliferative disorders',
	            'lymphoid neoplasm diffuse large b-cell lymphoma',
	            'myelodysplastic syndromes',
	            'lipomatous neoplasms',
	            'fibromatous neoplasms',
	            'acinar cell neoplasms',
	            'meningiomas',
	            'soft tissue tumors and sarcomas, nos',
	            'not reported',
	            'thymic epithelial neoplasms',
	            'complex epithelial neoplasms',
	            'paragangliomas and glomus tumors',
	            'leukemias, nos',
	            'blood vessel tumors',
	            'miscellaneous bone tumors',
	            'specialized gonadal neoplasms',
	            'nerve sheath tumors',
	            'synovial-like neoplasms',
	            'mature t- and nk-cell lymphomas',
	            'not applicable',
	            'miscellaneous tumors',
	            'other leukemias',
	            'neoplasms of histiocytes and accessory lymphoid cells',
	            'mucoepidermoid neoplasms',
	            'adnexal and skin appendage neoplasms',
	            'basal cell neoplasms',
	            'unknown',
	            'malignant lymphomas, nos or diffuse',
	            'fibroepithelial neoplasms',
	            'granular cell tumors and alveolar soft part sarcomas',
	            'hodgkin lymphoma',
	            'trophoblastic neoplasms',
	            'myxomatous neoplasms',
	            'precursor cell lymphoblastic lymphoma',
	            'mast cell tumors',
	            'mesonephromas',
	            'immunoproliferative diseases',
	            'giant cell tumors',
	            'odontogenic tumors',
	            'lymphatic vessel tumors',
	            'other hematologic disorders',
	        ],
	    },
	    {
	        name: 'primary_site',
	        prettyName: 'primary site',
	        values: [
	            'bronchus and lung',
	            'hematopoietic and reticuloendothelial systems',
	            'breast',
	            'colon',
	            'spinal cord, cranial nerves, and other parts of central nervous system',
	            'ovary',
	            'kidney',
	            'unknown',
	            'skin',
	            'pancreas',
	            'prostate gland',
	            'uterus, nos',
	            'bladder',
	            'liver and intrahepatic bile ducts',
	            'connective, subcutaneous and other soft tissues',
	            'thyroid gland',
	            'brain',
	            'esophagus',
	            'stomach',
	            'rectum',
	            'other and ill-defined sites',
	            'adrenal gland',
	            'corpus uteri',
	            'other and ill-defined digestive organs',
	            'heart, mediastinum, and pleura',
	            'cervix uteri',
	            'other and unspecified major salivary glands',
	            'lymph nodes',
	            'testis',
	            'bones, joints and articular cartilage of other and unspecified sites',
	            'retroperitoneum and peritoneum',
	            'other and ill-defined sites in lip, oral cavity and pharynx',
	            'not reported',
	            'thymus',
	            'peripheral nerves and autonomic nervous system',
	            'bones, joints and articular cartilage of limbs',
	            'small intestine',
	            'gallbladder',
	            'meninges',
	            'anus and anal canal',
	            'eye and adnexa',
	            'other and unspecified parts of biliary tract',
	            'other and unspecified urinary organs',
	            'oropharynx',
	            'other endocrine glands and related structures',
	            'larynx',
	            'other and unspecified female genital organs',
	            'other and unspecified parts of tongue',
	            'nasopharynx',
	            'rectosigmoid junction',
	            'vagina',
	            'floor of mouth',
	            'tonsil',
	            'other and unspecified parts of mouth',
	            'nasal cavity and middle ear',
	            'penis',
	            'hypopharynx',
	            'base of tongue',
	            'ureter',
	            'gum',
	            'vulva',
	            'lip',
	            'trachea',
	            'palate',
	            'blood',
	            'other and unspecified male genital organs',
	            'renal pelvis',
	        ],
	    },
	    {
	        name: 'project.program.name',
	        prettyName: 'program name',
	        values: [
	            'GENIE',
	            'FM',
	            'TCGA',
	            'TARGET',
	            'MMRF',
	            'CPTAC',
	            'BEATAML1.0',
	            'NCICCR',
	            'OHSU',
	            'CGCI',
	            'WCDT',
	            'ORGANOID',
	            'CTSP',
	            'HCMI',
	            'VAREPOP',
	        ],
	    },
	    {
	        name: 'project.project_id',
	        prettyName: 'project id',
	        values: [
	            'FM-AD',
	            'GENIE-MSK',
	            'GENIE-DFCI',
	            'GENIE-MDA',
	            'GENIE-JHU',
	            'GENIE-UHN',
	            'TARGET-AML',
	            'GENIE-VICC',
	            'TARGET-ALL-P2',
	            'TARGET-NBL',
	            'TCGA-BRCA',
	            'GENIE-GRCC',
	            'MMRF-COMMPASS',
	            'GENIE-NKI',
	            'TARGET-WT',
	            'TCGA-GBM',
	            'TCGA-OV',
	            'TCGA-LUAD',
	            'BEATAML1.0-COHORT',
	            'TCGA-UCEC',
	            'TCGA-KIRC',
	            'TCGA-HNSC',
	            'TCGA-LGG',
	            'TCGA-THCA',
	            'TCGA-LUSC',
	            'TCGA-PRAD',
	            'NCICCR-DLBCL',
	            'TCGA-SKCM',
	            'TCGA-COAD',
	            'TCGA-STAD',
	            'CPTAC-3',
	            'TCGA-BLCA',
	            'TARGET-OS',
	            'TCGA-LIHC',
	            'CPTAC-2',
	            'TCGA-CESC',
	            'TCGA-KIRP',
	            'TCGA-SARC',
	            'TCGA-LAML',
	            'TARGET-ALL-P3',
	            'TCGA-ESCA',
	            'TCGA-PAAD',
	            'TCGA-PCPG',
	            'OHSU-CNL',
	            'TCGA-READ',
	            'TCGA-TGCT',
	            'TCGA-THYM',
	            'CGCI-BLGSP',
	            'TCGA-KICH',
	            'WCDT-MCRPC',
	            'TCGA-ACC',
	            'TCGA-MESO',
	            'TCGA-UVM',
	            'ORGANOID-PANCREATIC',
	            'TARGET-RT',
	            'TCGA-DLBC',
	            'TCGA-UCS',
	            'BEATAML1.0-CRENOLANIB',
	            'TCGA-CHOL',
	            'CTSP-DLBCL1',
	            'TARGET-ALL-P1',
	            'HCMI-CMDC',
	            'TARGET-CCSK',
	            'VAREPOP-APOLLO',
	        ],
	    },
	    {
	        name: 'samples.sample_type',
	        prettyName: 'sample type',
	        values: [
	            'primary tumor',
	            'metastatic',
	            'blood derived normal',
	            'primary blood derived cancer - bone marrow',
	            'solid tissue normal',
	            'tumor',
	            'not reported',
	            'bone marrow normal',
	            'primary blood derived cancer - peripheral blood',
	            'recurrent blood derived cancer - bone marrow',
	            'recurrent blood derived cancer - peripheral blood',
	            'blood derived cancer - peripheral blood',
	            'recurrent tumor',
	            'next generation cancer model',
	            'blood derived cancer - bone marrow, post-treatment',
	            'granulocytes',
	            'fibroblasts from bone marrow normal',
	            'primary xenograft tissue',
	            'buccal cell normal',
	            'blood derived cancer - bone marrow',
	            'unknown',
	            'additional - new primary',
	            'mononuclear cells from bone marrow normal',
	            'blood derived cancer - peripheral blood, post-treatment',
	            'cell lines',
	            'ffpe scrolls',
	            'expanded next generation cancer model',
	            'additional metastatic',
	            'lymphoid normal',
	            'post neo-adjuvant therapy',
	            'control analyte',
	            'slides',
	        ],
	    },
	    {
	        name: 'summary.experimental_strategies.experimental_strategy',
	        prettyName: 'experimental strategy',
	        values: [
	            'Targeted Sequencing',
	            'WXS',
	            'RNA-Seq',
	            'miRNA-Seq',
	            'Genotyping Array',
	            'Methylation Array',
	            'Tissue Slide',
	            'Diagnostic Slide',
	            'WGS',
	            'ATAC-Seq',
	        ],
	    },
	];
	const mutationHighlightFeatures = [
	    {
	        name: 'VEP',
	        attributeName: 'vep_impact',
	        type: 'category',
	        description: 'Colour by VEP impact (canonical transcript).',
	        values: [
	            { name: 'LOW', colour: 'blue' },
	            { name: 'MODIFIER', colour: 'goldenrod' },
	            { name: 'MODERATE', colour: 'green' },
	            { name: 'HIGH', colour: 'red' },
	            { name: '', colour: 'lightgrey' },
	        ],
	    },
	    {
	        name: 'PolyPhen',
	        type: 'category',
	        attributeName: 'polyphen_impact',
	        description: 'Colour by PolyPhen impact (canonical transcript).',
	        values: [
	            { name: 'benign', colour: 'green' },
	            { name: 'possibly_damaging', colour: 'orange' },
	            { name: 'probably_damaging', colour: 'red' },
	            { name: 'unknown', colour: 'grey' },
	            { name: '', colour: 'lightgrey' },
	        ],
	    },
	    {
	        name: 'SIFT',
	        type: 'category',
	        attributeName: 'sift_impact',
	        description: 'Colour by SIFT impact (canonical transcript).',
	        values: [
	            { name: 'deleterious', colour: 'red' },
	            { name: 'tolerated', colour: 'green' },
	            { name: 'deleterious_low_confidence', colour: 'lightcoral' },
	            { name: 'tolerated_low_confidence', colour: 'lightgreen' },
	            { name: '', colour: 'lightgrey' },
	        ],
	    },
	    {
	        name: 'Mutation Subtype',
	        type: 'category',
	        attributeName: 'mutationSubtype',
	        description: 'Colour by the type of mutation.',
	        values: [
	            { name: 'Single base substitution', colour: 'green' },
	            { name: 'Small deletion', colour: 'red' },
	            { name: 'Small insertion', colour: 'blue' },
	            { name: '', colour: 'lightgrey' },
	        ],
	    },
	    {
	        name: 'Mutation Count',
	        type: 'threshold',
	        description: 'Colour by mutation occurrence count across the current cohort.',
	        attributeName: 'score',
	        values: [{ name: 'Count', colour1: 'red', colour2: 'blue', threshold: 2 }],
	    },
	    {
	        name: 'Mutation Frequency',
	        type: 'percentage',
	        description: 'Frequency of mutation occurrence across the current cohort.',
	        attributeName: 'percentage',
	        values: [
	            { name: 'Percentage', colour1: 'darkgreen', colour2: 'lightgreen' },
	        ],
	    },
	];
	const geneHighlightFeatures = [
	    {
	        name: 'Is Cancer Gene Census',
	        attributeName: 'isCancerGeneCensus',
	        type: 'boolean',
	        description: 'Colour by cancer gene census status.',
	        values: [
	            { name: 'Is Cancer Gene Census', colour1: 'red', colour2: 'blue' },
	        ],
	    },
	];

	const useStyles$6 = mui.makeStyles()(theme => ({
	    root: {
	        padding: theme.spacing(1, 3, 1, 1),
	        background: theme.palette.background.default,
	        overflowX: 'hidden',
	    },
	    formControl: {
	        margin: theme.spacing(1),
	        minWidth: 150,
	    },
	    text: {
	        display: 'flex',
	        alignItems: 'center',
	    },
	    paper: {
	        padding: theme.spacing(2),
	    },
	}));
	/**
	 * Render a highlight/colour by element for colouring features
	 */
	const HighlightFeature = mobxReact.observer(({ schema, type }) => {
	    const { classes } = useStyles$6();
	    const [colourBy, setColourBy] = React.useState(Object.keys(schema.getColourBy()).length !== 0
	        ? JSON.parse(schema.getColourBy())
	        : '');
	    const highlightFeatures = type === 'mutation' ? mutationHighlightFeatures : geneHighlightFeatures;
	    return (React.createElement(React.Fragment, null,
	        React.createElement(material.Paper, { className: classes.paper },
	            React.createElement(material.Typography, { variant: "h6" }, "Colour Features"),
	            React.createElement(material.FormControl, { size: "small" },
	                React.createElement(material.InputLabel, null, "Attribute"),
	                React.createElement(material.Select, { labelId: "track-type-select-label", id: "track-type-select", value: colourBy, onChange: event => {
	                        const hlBy = event.target.value;
	                        setColourBy(hlBy);
	                        let colourFunction = '';
	                        if (hlBy.type === 'threshold') {
	                            colourFunction = `jexl:get(feature,'${hlBy.attributeName}') >= ${hlBy.values[0].threshold} ? '${hlBy.values[0].colour1}' : '${hlBy.values[0].colour2}'`;
	                        }
	                        else if (hlBy.type === 'category') {
	                            colourFunction = `jexl:switch(feature,'${JSON.stringify(hlBy)}')`;
	                        }
	                        else if (hlBy.type === 'boolean') {
	                            colourFunction = `jexl:cancer(feature,'${hlBy.attributeName}')`;
	                        }
	                        else if (hlBy.type === 'percentage') {
	                            colourFunction = `jexl:rgb(feature,'${hlBy.attributeName}')`;
	                        }
	                        else {
	                            colourFunction = `jexl:cast('goldenrod')`;
	                        }
	                        // Set to function
	                        schema.target.displays[0].renderer.color1.set(colourFunction);
	                        // Set to colour array element
	                        schema.setColourBy(JSON.stringify(hlBy));
	                        schema.target.adapter.colourBy.set(JSON.stringify(hlBy));
	                    }, renderValue: selected => selected.name }, highlightFeatures.map(element => (React.createElement(material.MenuItem, { value: element.name, key: element.name }, element.name)))),
	                React.createElement(material.FormHelperText, null, "Select how to colour features on the track based on feature attributes.")),
	            colourBy?.values && (React.createElement("div", null,
	                React.createElement(material.Typography, { variant: "subtitle2", className: classes.text }, colourBy.symbol),
	                colourBy.values && colourBy.type === 'category' && (React.createElement(material.Table, null,
	                    React.createElement(material.TableHead, null,
	                        React.createElement(material.TableRow, null,
	                            React.createElement(material.TableCell, null, "Value"),
	                            React.createElement(material.TableCell, null, "Corresponding colour"))),
	                    React.createElement(material.TableBody, null, colourBy.values?.map((value) => (React.createElement(material.TableRow, { key: value.name },
	                        React.createElement(material.TableCell, null, value.name !== '' ? value.name : 'n/a'),
	                        React.createElement(material.TableCell, null,
	                            React.createElement(material.Chip, { label: value.colour, style: {
	                                    backgroundColor: value.colour,
	                                    color: 'white',
	                                } })))))))),
	                colourBy.values && colourBy.type === 'threshold' && (React.createElement(material.Table, null,
	                    React.createElement(material.TableHead, null,
	                        React.createElement(material.TableRow, null,
	                            React.createElement(material.TableCell, null, "Value"),
	                            React.createElement(material.TableCell, null, "Threshold"),
	                            React.createElement(material.TableCell, null, "Below"),
	                            React.createElement(material.TableCell, null, "Equal or Above"))),
	                    React.createElement(material.TableBody, null, colourBy.values?.map((value) => (React.createElement(material.TableRow, { key: value.name },
	                        React.createElement(material.TableCell, null, value.name !== '' ? value.name : 'n/a'),
	                        React.createElement(material.TableCell, null, value.threshold),
	                        React.createElement(material.TableCell, null,
	                            React.createElement(material.Chip, { label: value.colour2, style: {
	                                    backgroundColor: value.colour2,
	                                    color: 'white',
	                                } })),
	                        React.createElement(material.TableCell, null,
	                            React.createElement(material.Chip, { label: value.colour1, style: {
	                                    backgroundColor: value.colour1,
	                                    color: 'white',
	                                } })))))))),
	                colourBy.values && colourBy.type === 'boolean' && (React.createElement(material.Table, null,
	                    React.createElement(material.TableHead, null,
	                        React.createElement(material.TableRow, null,
	                            React.createElement(material.TableCell, null, "Value"),
	                            React.createElement(material.TableCell, null, "True"),
	                            React.createElement(material.TableCell, null, "False"))),
	                    React.createElement(material.TableBody, null, colourBy.values?.map((value) => (React.createElement(material.TableRow, { key: value.name },
	                        React.createElement(material.TableCell, null, value.name !== '' ? value.name : 'n/a'),
	                        React.createElement(material.TableCell, null,
	                            React.createElement(material.Chip, { label: value.colour1, style: {
	                                    backgroundColor: value.colour1,
	                                    color: 'white',
	                                } })),
	                        React.createElement(material.TableCell, null,
	                            React.createElement(material.Chip, { label: value.colour2, style: {
	                                    backgroundColor: value.colour2,
	                                    color: 'white',
	                                } })))))))),
	                colourBy.values && colourBy.type === 'percentage' && (React.createElement(material.Table, null,
	                    React.createElement(material.TableHead, null,
	                        React.createElement(material.TableRow, null,
	                            React.createElement(material.TableCell, null, "Value"),
	                            React.createElement(material.TableCell, null, "Low"),
	                            React.createElement(material.TableCell, null, "High"))),
	                    React.createElement(material.TableBody, null, colourBy.values?.map((value) => (React.createElement(material.TableRow, { key: value.name },
	                        React.createElement(material.TableCell, null, value.name !== '' ? value.name : 'n/a'),
	                        React.createElement(material.TableCell, null,
	                            React.createElement(material.Chip, { label: value.colour1, style: {
	                                    backgroundColor: value.colour1,
	                                    color: 'white',
	                                } })),
	                        React.createElement(material.TableCell, null,
	                            React.createElement(material.Chip, { label: value.colour2, style: {
	                                    backgroundColor: value.colour2,
	                                    color: 'white',
	                                } })))))))))))));
	});

	const useStyles$5 = mui.makeStyles()(theme => ({
	    root: {
	        display: 'flex',
	        flexDirection: 'column',
	        gap: theme.spacing(2),
	    },
	    paper: {
	        padding: theme.spacing(2),
	    },
	}));
	/**
	 * A component for changing the track type
	 */
	var TrackType = mobxReact.observer((schema) => {
	    const { classes } = useStyles$5();
	    const [trackType, setTrackType] = React.useState(schema.schema.target.adapter.featureType.value);
	    return (React.createElement("div", { className: classes.root },
	        React.createElement(material.Paper, { className: classes.paper },
	            React.createElement(material.Typography, { variant: "h6" }, "Track Type"),
	            React.createElement(material.FormControl, { size: "small" },
	                React.createElement(material.Select, { labelId: "track-type-select-label", id: "track-type-select", value: trackType, onChange: event => {
	                        setTrackType(event.target.value);
	                        schema.schema.target.adapter.featureType.set(event.target.value);
	                        // Set to function
	                        schema.schema.target.displays[0].renderer.color1.set(`jexl:cast('goldenrod')`);
	                        // Set to colour array element
	                        schema.schema.setColourBy('{}');
	                        schema.schema.target.adapter.colourBy.set('{}');
	                    } },
	                    React.createElement(material.MenuItem, { value: "mutation" }, "Mutation"),
	                    React.createElement(material.MenuItem, { value: "gene" }, "Gene")),
	                React.createElement(material.FormHelperText, null, "Select what to retrieve from the GDC with your selected filters.")))));
	});

	var Undo = {};

	var _interopRequireDefault$6 = interopRequireDefault.exports;
	Object.defineProperty(Undo, "__esModule", {
	  value: true
	});
	var default_1$6 = Undo.default = void 0;
	var _createSvgIcon$6 = _interopRequireDefault$6(createSvgIcon);
	var _jsxRuntime$6 = require$$2;
	var _default$a = (0, _createSvgIcon$6.default)( /*#__PURE__*/(0, _jsxRuntime$6.jsx)("path", {
	  d: "M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"
	}), 'Undo');
	default_1$6 = Undo.default = _default$a;

	const useStyles$4 = mui.makeStyles()(theme => ({
	    root: {
	        margin: theme.spacing(1),
	    },
	    paper: {
	        padding: theme.spacing(2),
	    },
	    tabRoot: {
	        width: '33%',
	        minWidth: '100px',
	    },
	    formControl: {
	        margin: theme.spacing(1),
	        minWidth: 150,
	    },
	    filterCard: {
	        margin: theme.spacing(1),
	    },
	    text: {
	        display: 'flex',
	        alignItems: 'center',
	    },
	}));
	function TabPanel(props) {
	    const { children, value, index, ...other } = props;
	    return (React.createElement("div", { role: "tabpanel", hidden: value !== index, id: `simple-tabpanel-${index}`, "aria-labelledby": `simple-tab-${index}`, ...other }, value === index && React.createElement(material.Box, { style: { padding: 3 } }, children)));
	}
	/**
	 * Creates the form for interacting with the track filters
	 */
	const GDCQueryBuilder = mobxReact.observer(({ schema }) => {
	    const [isValidGDCFilter, setIsValidGDCFilter] = React.useState(true);
	    const [isValidColourBy, setIsValidColourBy] = React.useState(true);
	    const [validationMessage, setFilterValidationMessage] = React.useState('');
	    const [colourValidationMessage, setColourValidationMessage] = React.useState('');
	    const [value, setValue] = React.useState(0);
	    schema.clearFilters();
	    React.useEffect(() => {
	        try {
	            const filters = JSON.parse(schema.target.adapter.filters.value);
	            if (filters.content && filters.content.length > 0) {
	                for (const filter of filters.content) {
	                    let type;
	                    if (filter.content.field.startsWith('cases.')) {
	                        type = 'case';
	                    }
	                    else if (filter.content.field.startsWith('ssms.')) {
	                        type = 'ssm';
	                    }
	                    else if (filter.content.field.startsWith('genes.')) {
	                        type = 'gene';
	                    }
	                    else {
	                        setIsValidGDCFilter(false);
	                        setFilterValidationMessage(`The filter ${filter.content.field} is missing a type prefix and is invalid. Any changes on this panel will overwrite invalid filters.`);
	                    }
	                    if (type) {
	                        const name = filter.content.field.replace(`${type}s.`, '');
	                        schema.addFilter(v4(), name, type, filter.content.value.join(','));
	                    }
	                }
	            }
	        }
	        catch (error) {
	            setIsValidGDCFilter(false);
	            setFilterValidationMessage('The current filters are not in the expected format. Any changes on this panel will overwrite invalid filters.');
	        }
	    }, [schema, value, schema.target.adapter.featureType.value]);
	    React.useEffect(() => {
	        try {
	            const colourBy = JSON.parse(schema.target.adapter.colourBy.value);
	            const expectedAttributes = [
	                'name',
	                'type',
	                'attributeName',
	                'values',
	                'description',
	            ];
	            let matchingKeys = true;
	            expectedAttributes.forEach(key => {
	                if (!(key in colourBy)) {
	                    matchingKeys = false;
	                }
	            });
	            if (matchingKeys || Object.keys(colourBy).length === 0) {
	                schema.setColourBy(colourBy);
	            }
	            else {
	                setIsValidColourBy(false);
	                setColourValidationMessage('The current colour by option is not in the expected format. Any changes on this panel will overwrite the invalid selection.');
	            }
	        }
	        catch (error) {
	            setIsValidColourBy(false);
	            setColourValidationMessage('The current colour by option is not in the expected format. Any changes on this panel will overwrite the invalid selection.');
	        }
	    }, [schema]);
	    const { classes } = useStyles$4();
	    return (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
	        !isValidGDCFilter && React.createElement(material.Alert, { severity: "info" }, validationMessage),
	        React.createElement(TrackType, { schema: schema }),
	        React.createElement(material.Paper, { className: classes.paper },
	            React.createElement(material.Grid, { container: true, style: { gap: '4px' } },
	                React.createElement(material.Typography, { variant: "h6" }, "Filters"),
	                React.createElement(material.Tooltip, { title: "Clear all filters", "aria-label": "clear all filters", onClick: () => {
	                        schema.clearFilters();
	                        schema.target.adapter.filters.set('{}');
	                    } },
	                    React.createElement(material.IconButton, { size: "small", color: "primary", "data-testid": "clear_all_filters_icon_button" },
	                        React.createElement(default_1$6, null)))),
	            React.createElement(material.Box, null,
	                React.createElement(material.Tabs, { value: value, onChange: (_, val) => setValue(val), "aria-label": "filtering tabs" },
	                    React.createElement(material.Tab, { classes: { root: classes.tabRoot }, label: "Cases" }),
	                    React.createElement(material.Tab, { classes: { root: classes.tabRoot }, label: "Genes" }),
	                    React.createElement(material.Tab, { classes: { root: classes.tabRoot }, label: "Mutations" }))),
	            React.createElement(TabPanel, { value: value, index: 0 },
	                React.createElement(FilterList$1, { schema: schema, type: "case", facets: caseFacets })),
	            React.createElement(TabPanel, { value: value, index: 1 },
	                React.createElement(FilterList$1, { schema: schema, type: "gene", facets: geneFacets })),
	            React.createElement(TabPanel, { value: value, index: 2 },
	                React.createElement(FilterList$1, { schema: schema, type: "ssm", facets: ssmFacets }))),
	        !isValidColourBy && (React.createElement(material.Alert, { severity: "info" }, colourValidationMessage)),
	        schema.target.adapter.featureType.value === 'mutation' && (React.createElement(HighlightFeature, { schema: schema, type: "mutation" })),
	        schema.target.adapter.featureType.value === 'gene' && (React.createElement(HighlightFeature, { schema: schema, type: "gene" }))));
	});
	const ConfigurationEditor = mobxReact.observer(({ model }) => {
	    const { classes } = useStyles$4();
	    return (React.createElement("div", { className: classes.root, "data-testid": "configEditor" }, !model.target ? ('no target set') : (React.createElement(GDCQueryBuilder, { schema: model, key: "configEditor" }))));
	});

	var GDCFilterWidgetF = (jbrowse) => {
	    return {
	        configSchema: configuration.ConfigurationSchema('GDCFilterWidget', {}),
	        ReactComponent: ConfigurationEditor,
	        stateModel: jbrowse.load(stateModel),
	        HeadingComponent: () => React.createElement(React.Fragment, null, "GDC Filters"),
	    };
	};

	const configSchema = configuration.ConfigurationSchema('GDCFeatureWidget', {});
	function stateModelFactory$1(_pluginManager) {
	    const stateModel = require$$0.types
	        .model('GDCFeatureWidget', {
	        id: mst.ElementId,
	        type: require$$0.types.literal('GDCFeatureWidget'),
	        featureData: require$$0.types.frozen({}),
	    })
	        .actions(self => ({
	        setFeatureData(data) {
	            self.featureData = data;
	        },
	        clearFeatureData() {
	            self.featureData = {};
	        },
	    }));
	    return stateModel;
	}

	var Remove = {};

	var _interopRequireDefault$5 = interopRequireDefault.exports;
	Object.defineProperty(Remove, "__esModule", {
	  value: true
	});
	var default_1$5 = Remove.default = void 0;
	var _createSvgIcon$5 = _interopRequireDefault$5(createSvgIcon);
	var _jsxRuntime$5 = require$$2;
	var _default$9 = (0, _createSvgIcon$5.default)( /*#__PURE__*/(0, _jsxRuntime$5.jsx)("path", {
	  d: "M19 13H5v-2h14v2z"
	}), 'Remove');
	default_1$5 = Remove.default = _default$9;

	/**
	 * Query the GDC API for project information related to the given gene
	 * @param {String} featureId Gene ID
	 */
	async function getGeneProjectsAsync(featureId) {
	    const query = {
	        query: `query ProjectTable( $caseAggsFilters: FiltersArgument $ssmTested: FiltersArgument $cnvGain: FiltersArgument $cnvLoss: FiltersArgument $cnvTested: FiltersArgument $projectCount: Int ) { viewer { explore { cases { gain: aggregations(filters: $cnvGain) { project__project_id { buckets { docCount: doc_count projectId: key } } } loss: aggregations(filters: $cnvLoss) { project__project_id { buckets { docCount: doc_count projectId: key } } } cnvTotal: aggregations(filters: $cnvTested) { project__project_id { buckets { docCount: doc_count projectId: key } } } filtered: aggregations(filters: $caseAggsFilters) { project__project_id { buckets { docCount: doc_count projectId: key } } } total: aggregations(filters: $ssmTested) { project__project_id { buckets { docCount: doc_count projectId: key } } } } } } projects { hits(first: $projectCount) { edges { node { primary_site disease_type project_id id } } } } }`,
	        variables: {
	            caseAggsFilters: {
	                op: 'and',
	                content: [
	                    {
	                        op: 'in',
	                        content: {
	                            field: 'cases.available_variation_data',
	                            value: ['ssm'],
	                        },
	                    },
	                    {
	                        op: 'NOT',
	                        content: {
	                            field: 'cases.gene.ssm.observation.observation_id',
	                            value: 'MISSING',
	                        },
	                    },
	                    { op: 'in', content: { field: 'genes.gene_id', value: [featureId] } },
	                ],
	            },
	            ssmTested: {
	                op: 'and',
	                content: [
	                    {
	                        op: 'in',
	                        content: {
	                            field: 'cases.available_variation_data',
	                            value: ['ssm'],
	                        },
	                    },
	                ],
	            },
	            cnvGain: {
	                op: 'and',
	                content: [
	                    {
	                        op: 'in',
	                        content: {
	                            field: 'cases.available_variation_data',
	                            value: ['cnv'],
	                        },
	                    },
	                    { op: 'in', content: { field: 'cnvs.cnv_change', value: ['Gain'] } },
	                    { op: 'in', content: { field: 'genes.gene_id', value: [featureId] } },
	                ],
	            },
	            cnvLoss: {
	                op: 'and',
	                content: [
	                    {
	                        op: 'in',
	                        content: {
	                            field: 'cases.available_variation_data',
	                            value: ['cnv'],
	                        },
	                    },
	                    { op: 'in', content: { field: 'cnvs.cnv_change', value: ['Loss'] } },
	                    { op: 'in', content: { field: 'genes.gene_id', value: [featureId] } },
	                ],
	            },
	            cnvTested: {
	                op: 'and',
	                content: [
	                    {
	                        op: 'in',
	                        content: {
	                            field: 'cases.available_variation_data',
	                            value: ['cnv'],
	                        },
	                    },
	                ],
	            },
	            projectCount: 100,
	        },
	    };
	    const response = await fetch('https://api.gdc.cancer.gov/v0/graphql/geneProjects', {
	        method: 'POST',
	        body: JSON.stringify(query),
	        headers: { 'Content-Type': 'application/json' },
	    });
	    if (!response.ok) {
	        throw new Error(`Failed to fetch ${response.status} ${response.statusText}`);
	    }
	    return response.json();
	}
	/**
	 * Query the GDC API for project information related to the given mutation
	 * @param {String} featureId Mutation ID
	 */
	async function getMutationProjectsAsync(featureId) {
	    const query = {
	        query: `query projectsTable($ssmTested: FiltersArgument, $caseAggsFilter: FiltersArgument, $projectCount: Int) { viewer { explore { cases { filtered: aggregations(filters: $caseAggsFilter) { project__project_id { buckets { docCount: doc_count projectId: key } } } total: aggregations(filters: $ssmTested) { project__project_id { buckets { docCount: doc_count projectId: key } } } } } } projects { hits(first: $projectCount) { edges { node { primary_site disease_type project_id id } } } } }`,
	        variables: {
	            ssmTested: {
	                op: 'and',
	                content: [
	                    {
	                        op: 'in',
	                        content: {
	                            field: 'cases.available_variation_data',
	                            value: ['ssm'],
	                        },
	                    },
	                ],
	            },
	            caseAggsFilter: {
	                op: 'and',
	                content: [
	                    { op: 'in', content: { field: 'ssms.ssm_id', value: [featureId] } },
	                    {
	                        op: 'in',
	                        content: {
	                            field: 'cases.available_variation_data',
	                            value: ['ssm'],
	                        },
	                    },
	                ],
	            },
	            projectCount: 100,
	        },
	    };
	    const response = await fetch('https://api.gdc.cancer.gov/v0/graphql/mutationProjects', {
	        method: 'POST',
	        body: JSON.stringify(query),
	        headers: { 'Content-Type': 'application/json' },
	    });
	    if (!response.ok) {
	        throw new Error(`Failed to fetch ${response.status} ${response.statusText}`);
	    }
	    return response.json();
	}

	const useStyles$3 = mui.makeStyles()({
	    table: {
	        padding: 0,
	    },
	    link: {
	        color: 'rgb(0, 0, 238)',
	    },
	});
	/**
	 * Render the consequence table for a simple somatic mutation
	 * @param {*} props
	 */
	function Consequence(props) {
	    const { classes } = useStyles$3();
	    const { feature } = props;
	    if (!feature.consequence) {
	        return null;
	    }
	    const consequences = feature.consequence.hits.edges;
	    return (React.createElement(BaseFeatureDetail.BaseCard, { title: "Consequence" },
	        React.createElement("div", { style: { width: '100%', maxHeight: 600, overflow: 'auto' } },
	            React.createElement(material.Table, { className: classes.table },
	                React.createElement(material.TableHead, null,
	                    React.createElement(material.TableRow, null,
	                        React.createElement(material.TableCell, null, "Gene"),
	                        React.createElement(material.TableCell, null, "AA Change"),
	                        React.createElement(material.TableCell, null, "Consequence"),
	                        React.createElement(material.TableCell, null, "Coding DNA Change"),
	                        React.createElement(material.TableCell, null, "Impact"),
	                        React.createElement(material.TableCell, null, "Gene Strand"),
	                        React.createElement(material.TableCell, null, "Transcript"))),
	                React.createElement(material.TableBody, null, Object.entries(consequences).map(([key, value]) => value ? (React.createElement(material.TableRow, { key: key },
	                    React.createElement(material.TableCell, null,
	                        React.createElement(material.Link, { className: classes.link, target: "_blank", rel: "noopener", href: `https://portal.gdc.cancer.gov/genes/${value.node.transcript.gene.gene_id}`, underline: "always" }, value.node.transcript.gene.symbol)),
	                    React.createElement(material.TableCell, null, value.node.transcript.aa_change),
	                    React.createElement(material.TableCell, null, value.node.transcript.consequence_type),
	                    React.createElement(material.TableCell, null, value.node.transcript.annotation.hgvsc),
	                    React.createElement(material.TableCell, null,
	                        value.node.transcript.annotation.vep_impact ? (React.createElement(material.Tooltip, { title: `VEP ${value.node.transcript.annotation.vep_impact}`, "aria-label": "help", placement: "left" },
	                            React.createElement("div", null,
	                                React.createElement(material.Chip, { label: value.node.transcript.annotation.vep_impact })))) : null,
	                        value.node.transcript.annotation.sift_impact ? (React.createElement(material.Tooltip, { title: `SIFT ${value.node.transcript.annotation.sift_impact} (${value.node.transcript.annotation.sift_score})`, "aria-label": "help", placement: "left" },
	                            React.createElement("div", null,
	                                React.createElement(material.Chip, { label: value.node.transcript.annotation.sift_impact })))) : null,
	                        value.node.transcript.annotation.polyphen_impact ? (React.createElement(material.Tooltip, { title: `PolyPhen ${value.node.transcript.annotation.polyphen_impact} (${value.node.transcript.annotation.polyphen_score})`, "aria-label": "help", placement: "left" },
	                            React.createElement("div", null,
	                                React.createElement(material.Chip, { label: value.node.transcript.annotation.polyphen_impact })))) : null),
	                    React.createElement(material.TableCell, null, value.node.transcript.gene.gene_strand === 1 ? (React.createElement(default_1$8, null)) : (React.createElement(default_1$5, null))),
	                    React.createElement(material.TableCell, null,
	                        React.createElement(material.Link, { className: classes.link, target: "_blank", rel: "noopener", href: `http://may2015.archive.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${value.node.transcript.transcript_id}`, underline: "always" }, value.node.transcript.transcript_id),
	                        value.node.transcript.is_canonical ? (React.createElement(material.Tooltip, { title: "Canonical transcript", "aria-label": "help", placement: "right" },
	                            React.createElement("div", null,
	                                React.createElement(material.Chip, { label: "C" })))) : null))) : null))))));
	}
	/**
	 * Render a single table row for an external link
	 */
	const ExternalLink = mobxReact.observer((props) => {
	    const { classes } = useStyles$3();
	    const { id, name, link } = props;
	    return (React.createElement(material.TableRow, { key: `${id}-${name}` },
	        React.createElement(material.TableCell, null, name),
	        React.createElement(material.TableCell, null,
	            React.createElement(material.Link, { className: classes.link, target: "_blank", rel: "noopener", href: `${link}${id}`, underline: "always" }, id))));
	});
	/**
	 * Render a section for external gene links
	 * @param {*} props
	 */
	function GeneExternalLinks(props) {
	    const { classes } = useStyles$3();
	    const { feature } = props;
	    const externalLinkArray = [
	        {
	            id: feature.geneId,
	            name: 'GDC',
	            link: 'https://portal.gdc.cancer.gov/genes/',
	        },
	        {
	            id: feature.geneId,
	            name: 'ENSEMBL',
	            link: 'http://www.ensembl.org/id/',
	        },
	        {
	            id: feature.canonicalTranscriptId,
	            name: 'Canonical Transcript ID',
	            link: 'http://www.ensembl.org/id/',
	        },
	        {
	            id: feature.externalDbIds.hgnc[0],
	            name: 'HGNC',
	            link: 'https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/',
	        },
	        {
	            id: feature.externalDbIds.uniprotkbSwissprot[0],
	            name: 'UniProtKB Swiss-Prot',
	            link: 'http://www.uniprot.org/uniprot/',
	        },
	        {
	            id: feature.externalDbIds.entrezGene[0],
	            name: 'NCBI',
	            link: 'http://www.ncbi.nlm.nih.gov/gene/',
	        },
	        {
	            id: feature.externalDbIds.omimGene[0],
	            name: 'OMIM',
	            link: 'https://www.omim.org/entry/',
	        },
	    ];
	    return (React.createElement(BaseFeatureDetail.BaseCard, { title: "External Links" },
	        React.createElement("div", { style: { width: '100%', maxHeight: 600, overflow: 'auto' } },
	            React.createElement(material.Table, { className: classes.table },
	                React.createElement(material.TableBody, null, externalLinkArray.map((externalLink, key) => (React.createElement(ExternalLink, { ...externalLink, key: key }))))))));
	}
	/**
	 * Removes prefix from cosmic ID
	 * @param {*} cosmicId Cosmic ID for a mutation
	 */
	function removeCosmicPrefix(cosmicId) {
	    return cosmicId.replace('COSM', '').replace('COSN', '');
	}
	/**
	 * Render a row with cosmic links for a mutation
	 */
	const CosmicLinks = mobxReact.observer((props) => {
	    const { classes } = useStyles$3();
	    const { cosmicId } = props;
	    return (React.createElement(material.TableRow, { key: "0" },
	        React.createElement(material.TableCell, null, "Cosmic"),
	        React.createElement(material.TableCell, null, cosmicId?.map(value => (React.createElement(material.Link, { className: classes.link, target: "_blank", rel: "noopener", href: `https://cancer.sanger.ac.uk/cosmic/mutation/overview?id=${removeCosmicPrefix(value)}`, key: value, underline: "always" }, value))))));
	});
	/**
	 * Render a section for external mutation links
	 * @param {*} props
	 */
	function SSMExternalLinks(props) {
	    const { classes } = useStyles$3();
	    const { feature } = props;
	    const externalLinkArray = [
	        {
	            id: feature.ssmId,
	            name: 'GDC',
	            link: 'https://portal.gdc.cancer.gov/ssms/',
	        },
	    ];
	    return (React.createElement(BaseFeatureDetail.BaseCard, { title: "External Links" },
	        React.createElement("div", { style: { width: '100%', maxHeight: 600, overflow: 'auto' } },
	            React.createElement(material.Table, { className: classes.table },
	                React.createElement(material.TableBody, null,
	                    externalLinkArray.map((externalLink, key) => (React.createElement(ExternalLink, { ...externalLink, key: key }))),
	                    feature.cosmicId ? (React.createElement(CosmicLinks, { cosmicId: feature.cosmicId })) : null)))));
	}
	/**
	 * Render a table row for a project related to the mutation
	 * @param {*} props
	 */
	function SSMProject(props) {
	    const { classes } = useStyles$3();
	    const { projectId, docCount, projectsInformation, gdcProjectsCounts } = props;
	    const projectInfo = projectsInformation.find((x) => x.node.project_id === projectId);
	    const gdcProjectCount = gdcProjectsCounts.find((x) => x.projectId === projectId);
	    return (React.createElement(material.TableRow, { key: projectId },
	        React.createElement(material.TableCell, null,
	            React.createElement(material.Link, { className: classes.link, target: "_blank", rel: "noopener", href: `https://portal.gdc.cancer.gov/projects/${projectId}`, underline: "always" }, projectId)),
	        React.createElement(material.TableCell, null, projectInfo.node.disease_type.join(', ')),
	        React.createElement(material.TableCell, null, projectInfo.node.primary_site.join(', ')),
	        React.createElement(material.TableCell, null,
	            docCount,
	            " / ",
	            gdcProjectCount.docCount)));
	}
	/**
	 * Render a table of projects based on the selected mutation feature
	 * @param {*} props
	 */
	function SSMProjects(props) {
	    const { classes } = useStyles$3();
	    const { featureId } = props;
	    // Case counts for projects associated with the given mutation
	    const [mutationProjectsCounts, setMutationProjectsCounts] = React.useState([]);
	    // General information regarding all projects
	    const [projectsInformation, setProjectsInformation] = React.useState([]);
	    // Case counts for projects across the GDC
	    const [gdcProjectsCounts, setGdcProjectsCounts] = React.useState([]);
	    React.useEffect(() => {
	        // eslint-disable-next-line @typescript-eslint/no-floating-promises
	        getMutationProjectsAsync(featureId).then(data => {
	            setProjectsInformation(data.data.projects.hits.edges);
	            setGdcProjectsCounts(data.data.viewer.explore.cases.total.project__project_id.buckets);
	            setMutationProjectsCounts(data.data.viewer.explore.cases.filtered.project__project_id.buckets);
	        });
	    }, [featureId]);
	    return (React.createElement(BaseFeatureDetail.BaseCard, { title: "Projects" },
	        React.createElement("div", { style: { width: '100%', maxHeight: 600, overflow: 'auto' } },
	            React.createElement(material.Table, { className: classes.table },
	                React.createElement(material.TableHead, null,
	                    React.createElement(material.TableRow, null,
	                        React.createElement(material.TableCell, null, "Project"),
	                        React.createElement(material.TableCell, null, "Disease Type"),
	                        React.createElement(material.TableCell, null, "Site"),
	                        React.createElement(material.TableCell, null, "# Mutation Affected Cases"))),
	                React.createElement(material.TableBody, null, mutationProjectsCounts &&
	                    projectsInformation &&
	                    gdcProjectsCounts &&
	                    mutationProjectsCounts.map((project, key) => (React.createElement(SSMProject, { projectsInformation: projectsInformation, gdcProjectsCounts: gdcProjectsCounts, key: `${key}-${project.projectId}`, ...project }))))))));
	}
	/**
	 * Render a table row for a project related to the gene
	 * @param {*} props
	 */
	function GeneProject(props) {
	    const { classes } = useStyles$3();
	    const { projectId, docCount, projectsInformation, cases } = props;
	    const projectInfo = projectsInformation.find((x) => x.node.project_id === projectId);
	    const totalProjectCaseCount = cases.total.project__project_id.buckets.find((x) => x.projectId === projectId);
	    const cnvGainCaseCount = cases.gain.project__project_id.buckets.find((x) => x.projectId === projectId);
	    const cnvLossCaseCount = cases.loss.project__project_id.buckets.find((x) => x.projectId === projectId);
	    const cnvTotalCaseCount = cases.cnvTotal.project__project_id.buckets.find((x) => x.projectId === projectId);
	    return (React.createElement(material.TableRow, { key: projectId },
	        React.createElement(material.TableCell, null,
	            React.createElement(material.Link, { className: classes.link, target: "_blank", rel: "noopener", href: `https://portal.gdc.cancer.gov/projects/${projectId}`, underline: "always" }, projectId)),
	        React.createElement(material.TableCell, null, projectInfo.node.disease_type.join(', ')),
	        React.createElement(material.TableCell, null, projectInfo.node.primary_site.join(', ')),
	        React.createElement(material.TableCell, null,
	            docCount,
	            " / ",
	            totalProjectCaseCount.docCount),
	        React.createElement(material.TableCell, null,
	            cnvGainCaseCount ? cnvGainCaseCount.docCount : '0',
	            " /",
	            ' ',
	            cnvTotalCaseCount ? cnvTotalCaseCount.docCount : '0'),
	        React.createElement(material.TableCell, null,
	            cnvLossCaseCount ? cnvLossCaseCount.docCount : '0',
	            " /",
	            ' ',
	            cnvTotalCaseCount ? cnvTotalCaseCount.docCount : '0')));
	}
	/**
	 * Render a table of projects based on the selected gene feature
	 * @param {*} props
	 */
	function GeneProjects(props) {
	    const { classes } = useStyles$3();
	    const { featureId } = props;
	    const [projectsInformation, setProjectsInformation] = React.useState([]); // General information regarding all projects
	    const [geneProjectsCounts, setGeneProjectsCounts] = React.useState([]); // Case counts for projects associated with the given gene
	    const [cases, setCases] = React.useState([]); // Case counts for various projects and filters
	    React.useEffect(() => {
	        // eslint-disable-next-line @typescript-eslint/no-floating-promises
	        getGeneProjectsAsync(featureId).then(data => {
	            setProjectsInformation(data.data.projects.hits.edges);
	            setCases(data.data.viewer.explore.cases);
	            setGeneProjectsCounts(data.data.viewer.explore.cases.filtered.project__project_id.buckets);
	        });
	    }, [featureId]);
	    return (React.createElement(BaseFeatureDetail.BaseCard, { ...props, title: "Projects" },
	        React.createElement("div", { style: { width: '100%', maxHeight: 600, overflow: 'auto' } },
	            React.createElement(material.Table, { className: classes.table },
	                React.createElement(material.TableHead, null,
	                    React.createElement(material.TableRow, null,
	                        React.createElement(material.TableCell, null, "Project"),
	                        React.createElement(material.TableCell, null, "Disease Type"),
	                        React.createElement(material.TableCell, null, "Site"),
	                        React.createElement(material.TableCell, null, "# Mutation Affected Cases"),
	                        React.createElement(material.TableCell, null, "# CNV Gains"),
	                        React.createElement(material.TableCell, null, "# CNV Losses"))),
	                React.createElement(material.TableBody, null, cases &&
	                    projectsInformation &&
	                    geneProjectsCounts?.map((project, key) => (React.createElement(GeneProject, { cases: cases, projectsInformation: projectsInformation, key: `${key}-${project.projectId}`, ...project }))))))));
	}
	/**
	 * Extended feature detail widget for GDC features
	 * @param {*} props
	 */
	function GDCFeatureDetails(props) {
	    const { model } = props;
	    const feat = JSON.parse(JSON.stringify(model.featureData));
	    const { consequence, geneId, ssmId, cosmicId, canonicalTranscriptId, externalDbIds, percentage, numOfCasesInCohort, ...rest } = feat;
	    return (React.createElement(material.Paper, { "data-testid": "variant-widget" },
	        React.createElement(BaseFeatureDetail.FeatureDetails, { feature: rest, model: model, ...props }),
	        React.createElement(material.Divider, null),
	        feat.geneId !== undefined ? React.createElement(GeneExternalLinks, { feature: feat }) : null,
	        feat.ssmId !== undefined ? React.createElement(SSMExternalLinks, { feature: feat }) : null,
	        React.createElement(material.Divider, null),
	        feat.ssmId !== undefined ? React.createElement(Consequence, { feature: feat }) : null,
	        React.createElement(material.Divider, null),
	        feat.geneId !== undefined ? (React.createElement(GeneProjects, { featureId: feat.geneId })) : null,
	        feat.ssmId !== undefined ? React.createElement(SSMProjects, { featureId: feat.ssmId }) : null));
	}
	var GDCFeatureWidgetComponent = mobxReact.observer(GDCFeatureDetails);

	function f(_pluginManager) {
	    return require$$0.types
	        .model('GDCSearchWidget', {
	        id: mst.ElementId,
	        type: require$$0.types.literal('GDCSearchWidget'),
	    })
	        .volatile(() => ({
	        trackData: undefined,
	        indexTrackData: undefined,
	    }))
	        .actions(self => ({
	        setTrackData(obj) {
	            self.trackData = obj;
	        },
	        setIndexTrackData(obj) {
	            self.indexTrackData = obj;
	        },
	        clearData() {
	            self.indexTrackData = undefined;
	            self.trackData = undefined;
	        },
	    }));
	}

	/******************************************************************************
	Copyright (c) Microsoft Corporation.

	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted.

	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	PERFORMANCE OF THIS SOFTWARE.
	***************************************************************************** */
	/* global Reflect, Promise, SuppressedError, Symbol */


	function __awaiter(thisArg, _arguments, P, generator) {
	  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	  return new (P || (P = Promise))(function (resolve, reject) {
	      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	      step((generator = generator.apply(thisArg, _arguments || [])).next());
	  });
	}

	function __generator(thisArg, body) {
	  var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
	  function verb(n) { return function (v) { return step([n, v]); }; }
	  function step(op) {
	      if (f) throw new TypeError("Generator is already executing.");
	      while (g && (g = 0, op[0] && (_ = 0)), _) try {
	          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	          if (y = 0, t) op = [op[0] & 2, t.value];
	          switch (op[0]) {
	              case 0: case 1: t = op; break;
	              case 4: _.label++; return { value: op[1], done: false };
	              case 5: _.label++; y = op[1]; op = [0]; continue;
	              case 7: op = _.ops.pop(); _.trys.pop(); continue;
	              default:
	                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
	                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
	                  if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
	                  if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
	                  if (t[2]) _.ops.pop();
	                  _.trys.pop(); continue;
	          }
	          op = body.call(thisArg, _);
	      } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
	      if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	  }
	}

	function __read(o, n) {
	  var m = typeof Symbol === "function" && o[Symbol.iterator];
	  if (!m) return o;
	  var i = m.call(o), r, ar = [], e;
	  try {
	      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
	  }
	  catch (error) { e = { error: error }; }
	  finally {
	      try {
	          if (r && !r.done && (m = i["return"])) m.call(i);
	      }
	      finally { if (e) throw e.error; }
	  }
	  return ar;
	}

	function __spreadArray(to, from, pack) {
	  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
	      if (ar || !(i in from)) {
	          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
	          ar[i] = from[i];
	      }
	  }
	  return to.concat(ar || Array.prototype.slice.call(from));
	}

	typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
	  var e = new Error(message);
	  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
	};

	var COMMON_MIME_TYPES = new Map([
	    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
	    ['aac', 'audio/aac'],
	    ['abw', 'application/x-abiword'],
	    ['arc', 'application/x-freearc'],
	    ['avif', 'image/avif'],
	    ['avi', 'video/x-msvideo'],
	    ['azw', 'application/vnd.amazon.ebook'],
	    ['bin', 'application/octet-stream'],
	    ['bmp', 'image/bmp'],
	    ['bz', 'application/x-bzip'],
	    ['bz2', 'application/x-bzip2'],
	    ['cda', 'application/x-cdf'],
	    ['csh', 'application/x-csh'],
	    ['css', 'text/css'],
	    ['csv', 'text/csv'],
	    ['doc', 'application/msword'],
	    ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
	    ['eot', 'application/vnd.ms-fontobject'],
	    ['epub', 'application/epub+zip'],
	    ['gz', 'application/gzip'],
	    ['gif', 'image/gif'],
	    ['heic', 'image/heic'],
	    ['heif', 'image/heif'],
	    ['htm', 'text/html'],
	    ['html', 'text/html'],
	    ['ico', 'image/vnd.microsoft.icon'],
	    ['ics', 'text/calendar'],
	    ['jar', 'application/java-archive'],
	    ['jpeg', 'image/jpeg'],
	    ['jpg', 'image/jpeg'],
	    ['js', 'text/javascript'],
	    ['json', 'application/json'],
	    ['jsonld', 'application/ld+json'],
	    ['mid', 'audio/midi'],
	    ['midi', 'audio/midi'],
	    ['mjs', 'text/javascript'],
	    ['mp3', 'audio/mpeg'],
	    ['mp4', 'video/mp4'],
	    ['mpeg', 'video/mpeg'],
	    ['mpkg', 'application/vnd.apple.installer+xml'],
	    ['odp', 'application/vnd.oasis.opendocument.presentation'],
	    ['ods', 'application/vnd.oasis.opendocument.spreadsheet'],
	    ['odt', 'application/vnd.oasis.opendocument.text'],
	    ['oga', 'audio/ogg'],
	    ['ogv', 'video/ogg'],
	    ['ogx', 'application/ogg'],
	    ['opus', 'audio/opus'],
	    ['otf', 'font/otf'],
	    ['png', 'image/png'],
	    ['pdf', 'application/pdf'],
	    ['php', 'application/x-httpd-php'],
	    ['ppt', 'application/vnd.ms-powerpoint'],
	    ['pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
	    ['rar', 'application/vnd.rar'],
	    ['rtf', 'application/rtf'],
	    ['sh', 'application/x-sh'],
	    ['svg', 'image/svg+xml'],
	    ['swf', 'application/x-shockwave-flash'],
	    ['tar', 'application/x-tar'],
	    ['tif', 'image/tiff'],
	    ['tiff', 'image/tiff'],
	    ['ts', 'video/mp2t'],
	    ['ttf', 'font/ttf'],
	    ['txt', 'text/plain'],
	    ['vsd', 'application/vnd.visio'],
	    ['wav', 'audio/wav'],
	    ['weba', 'audio/webm'],
	    ['webm', 'video/webm'],
	    ['webp', 'image/webp'],
	    ['woff', 'font/woff'],
	    ['woff2', 'font/woff2'],
	    ['xhtml', 'application/xhtml+xml'],
	    ['xls', 'application/vnd.ms-excel'],
	    ['xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
	    ['xml', 'application/xml'],
	    ['xul', 'application/vnd.mozilla.xul+xml'],
	    ['zip', 'application/zip'],
	    ['7z', 'application/x-7z-compressed'],
	    // Others
	    ['mkv', 'video/x-matroska'],
	    ['mov', 'video/quicktime'],
	    ['msg', 'application/vnd.ms-outlook']
	]);
	function toFileWithPath(file, path) {
	    var f = withMimeType(file);
	    if (typeof f.path !== 'string') { // on electron, path is already set to the absolute path
	        var webkitRelativePath = file.webkitRelativePath;
	        Object.defineProperty(f, 'path', {
	            value: typeof path === 'string'
	                ? path
	                // If <input webkitdirectory> is set,
	                // the File will have a {webkitRelativePath} property
	                // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory
	                : typeof webkitRelativePath === 'string' && webkitRelativePath.length > 0
	                    ? webkitRelativePath
	                    : file.name,
	            writable: false,
	            configurable: false,
	            enumerable: true
	        });
	    }
	    return f;
	}
	function withMimeType(file) {
	    var name = file.name;
	    var hasExtension = name && name.lastIndexOf('.') !== -1;
	    if (hasExtension && !file.type) {
	        var ext = name.split('.')
	            .pop().toLowerCase();
	        var type = COMMON_MIME_TYPES.get(ext);
	        if (type) {
	            Object.defineProperty(file, 'type', {
	                value: type,
	                writable: false,
	                configurable: false,
	                enumerable: true
	            });
	        }
	    }
	    return file;
	}

	var FILES_TO_IGNORE = [
	    // Thumbnail cache files for macOS and Windows
	    '.DS_Store',
	    'Thumbs.db' // Windows
	];
	/**
	 * Convert a DragEvent's DataTrasfer object to a list of File objects
	 * NOTE: If some of the items are folders,
	 * everything will be flattened and placed in the same list but the paths will be kept as a {path} property.
	 *
	 * EXPERIMENTAL: A list of https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle objects can also be passed as an arg
	 * and a list of File objects will be returned.
	 *
	 * @param evt
	 */
	function fromEvent(evt) {
	    return __awaiter(this, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            if (isObject(evt) && isDataTransfer(evt.dataTransfer)) {
	                return [2 /*return*/, getDataTransferFiles(evt.dataTransfer, evt.type)];
	            }
	            else if (isChangeEvt(evt)) {
	                return [2 /*return*/, getInputFiles(evt)];
	            }
	            else if (Array.isArray(evt) && evt.every(function (item) { return 'getFile' in item && typeof item.getFile === 'function'; })) {
	                return [2 /*return*/, getFsHandleFiles(evt)];
	            }
	            return [2 /*return*/, []];
	        });
	    });
	}
	function isDataTransfer(value) {
	    return isObject(value);
	}
	function isChangeEvt(value) {
	    return isObject(value) && isObject(value.target);
	}
	function isObject(v) {
	    return typeof v === 'object' && v !== null;
	}
	function getInputFiles(evt) {
	    return fromList(evt.target.files).map(function (file) { return toFileWithPath(file); });
	}
	// Ee expect each handle to be https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle
	function getFsHandleFiles(handles) {
	    return __awaiter(this, void 0, void 0, function () {
	        var files;
	        return __generator(this, function (_a) {
	            switch (_a.label) {
	                case 0: return [4 /*yield*/, Promise.all(handles.map(function (h) { return h.getFile(); }))];
	                case 1:
	                    files = _a.sent();
	                    return [2 /*return*/, files.map(function (file) { return toFileWithPath(file); })];
	            }
	        });
	    });
	}
	function getDataTransferFiles(dt, type) {
	    return __awaiter(this, void 0, void 0, function () {
	        var items, files;
	        return __generator(this, function (_a) {
	            switch (_a.label) {
	                case 0:
	                    if (!dt.items) return [3 /*break*/, 2];
	                    items = fromList(dt.items)
	                        .filter(function (item) { return item.kind === 'file'; });
	                    // According to https://html.spec.whatwg.org/multipage/dnd.html#dndevents,
	                    // only 'dragstart' and 'drop' has access to the data (source node)
	                    if (type !== 'drop') {
	                        return [2 /*return*/, items];
	                    }
	                    return [4 /*yield*/, Promise.all(items.map(toFilePromises))];
	                case 1:
	                    files = _a.sent();
	                    return [2 /*return*/, noIgnoredFiles(flatten(files))];
	                case 2: return [2 /*return*/, noIgnoredFiles(fromList(dt.files)
	                        .map(function (file) { return toFileWithPath(file); }))];
	            }
	        });
	    });
	}
	function noIgnoredFiles(files) {
	    return files.filter(function (file) { return FILES_TO_IGNORE.indexOf(file.name) === -1; });
	}
	// IE11 does not support Array.from()
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Browser_compatibility
	// https://developer.mozilla.org/en-US/docs/Web/API/FileList
	// https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItemList
	function fromList(items) {
	    if (items === null) {
	        return [];
	    }
	    var files = [];
	    // tslint:disable: prefer-for-of
	    for (var i = 0; i < items.length; i++) {
	        var file = items[i];
	        files.push(file);
	    }
	    return files;
	}
	// https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem
	function toFilePromises(item) {
	    if (typeof item.webkitGetAsEntry !== 'function') {
	        return fromDataTransferItem(item);
	    }
	    var entry = item.webkitGetAsEntry();
	    // Safari supports dropping an image node from a different window and can be retrieved using
	    // the DataTransferItem.getAsFile() API
	    // NOTE: FileSystemEntry.file() throws if trying to get the file
	    if (entry && entry.isDirectory) {
	        return fromDirEntry(entry);
	    }
	    return fromDataTransferItem(item);
	}
	function flatten(items) {
	    return items.reduce(function (acc, files) { return __spreadArray(__spreadArray([], __read(acc), false), __read((Array.isArray(files) ? flatten(files) : [files])), false); }, []);
	}
	function fromDataTransferItem(item) {
	    var file = item.getAsFile();
	    if (!file) {
	        return Promise.reject("".concat(item, " is not a File"));
	    }
	    var fwp = toFileWithPath(file);
	    return Promise.resolve(fwp);
	}
	// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry
	function fromEntry(entry) {
	    return __awaiter(this, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, entry.isDirectory ? fromDirEntry(entry) : fromFileEntry(entry)];
	        });
	    });
	}
	// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry
	function fromDirEntry(entry) {
	    var reader = entry.createReader();
	    return new Promise(function (resolve, reject) {
	        var entries = [];
	        function readEntries() {
	            var _this = this;
	            // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry/createReader
	            // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryReader/readEntries
	            reader.readEntries(function (batch) { return __awaiter(_this, void 0, void 0, function () {
	                var files, err_1, items;
	                return __generator(this, function (_a) {
	                    switch (_a.label) {
	                        case 0:
	                            if (!!batch.length) return [3 /*break*/, 5];
	                            _a.label = 1;
	                        case 1:
	                            _a.trys.push([1, 3, , 4]);
	                            return [4 /*yield*/, Promise.all(entries)];
	                        case 2:
	                            files = _a.sent();
	                            resolve(files);
	                            return [3 /*break*/, 4];
	                        case 3:
	                            err_1 = _a.sent();
	                            reject(err_1);
	                            return [3 /*break*/, 4];
	                        case 4: return [3 /*break*/, 6];
	                        case 5:
	                            items = Promise.all(batch.map(fromEntry));
	                            entries.push(items);
	                            // Continue reading
	                            readEntries();
	                            _a.label = 6;
	                        case 6: return [2 /*return*/];
	                    }
	                });
	            }); }, function (err) {
	                reject(err);
	            });
	        }
	        readEntries();
	    });
	}
	// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileEntry
	function fromFileEntry(entry) {
	    return __awaiter(this, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, new Promise(function (resolve, reject) {
	                    entry.file(function (file) {
	                        var fwp = toFileWithPath(file, entry.fullPath);
	                        resolve(fwp);
	                    }, function (err) {
	                        reject(err);
	                    });
	                })];
	        });
	    });
	}

	var _default$8 = function (file, acceptedFiles) {
	  if (file && acceptedFiles) {
	    var acceptedFilesArray = Array.isArray(acceptedFiles) ? acceptedFiles : acceptedFiles.split(',');
	    var fileName = file.name || '';
	    var mimeType = (file.type || '').toLowerCase();
	    var baseMimeType = mimeType.replace(/\/.*$/, '');
	    return acceptedFilesArray.some(function (type) {
	      var validType = type.trim().toLowerCase();

	      if (validType.charAt(0) === '.') {
	        return fileName.toLowerCase().endsWith(validType);
	      } else if (validType.endsWith('/*')) {
	        // This is something like a image/* mime type
	        return baseMimeType === validType.replace(/\/.*$/, '');
	      }

	      return mimeType === validType;
	    });
	  }

	  return true;
	};

	function _toConsumableArray$1(arr) { return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _unsupportedIterableToArray$1(arr) || _nonIterableSpread$1(); }

	function _nonIterableSpread$1() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

	function _iterableToArray$1(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

	function _arrayWithoutHoles$1(arr) { if (Array.isArray(arr)) return _arrayLikeToArray$1(arr); }

	function ownKeys$2(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

	function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$2(Object(source), !0).forEach(function (key) { _defineProperty$2(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$2(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

	function _defineProperty$2(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _slicedToArray$1(arr, i) { return _arrayWithHoles$1(arr) || _iterableToArrayLimit$1(arr, i) || _unsupportedIterableToArray$1(arr, i) || _nonIterableRest$1(); }

	function _nonIterableRest$1() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

	function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

	function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

	function _iterableToArrayLimit$1(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

	function _arrayWithHoles$1(arr) { if (Array.isArray(arr)) return arr; }

	var FILE_INVALID_TYPE = "file-invalid-type";
	var FILE_TOO_LARGE = "file-too-large";
	var FILE_TOO_SMALL = "file-too-small";
	var TOO_MANY_FILES = "too-many-files";

	var getInvalidTypeRejectionErr = function getInvalidTypeRejectionErr(accept) {
	  accept = Array.isArray(accept) && accept.length === 1 ? accept[0] : accept;
	  var messageSuffix = Array.isArray(accept) ? "one of ".concat(accept.join(", ")) : accept;
	  return {
	    code: FILE_INVALID_TYPE,
	    message: "File type must be ".concat(messageSuffix)
	  };
	};
	var getTooLargeRejectionErr = function getTooLargeRejectionErr(maxSize) {
	  return {
	    code: FILE_TOO_LARGE,
	    message: "File is larger than ".concat(maxSize, " ").concat(maxSize === 1 ? "byte" : "bytes")
	  };
	};
	var getTooSmallRejectionErr = function getTooSmallRejectionErr(minSize) {
	  return {
	    code: FILE_TOO_SMALL,
	    message: "File is smaller than ".concat(minSize, " ").concat(minSize === 1 ? "byte" : "bytes")
	  };
	};
	var TOO_MANY_FILES_REJECTION = {
	  code: TOO_MANY_FILES,
	  message: "Too many files"
	}; // Firefox versions prior to 53 return a bogus MIME type for every file drag, so dragovers with
	// that MIME type will always be accepted

	function fileAccepted(file, accept) {
	  var isAcceptable = file.type === "application/x-moz-file" || _default$8(file, accept);
	  return [isAcceptable, isAcceptable ? null : getInvalidTypeRejectionErr(accept)];
	}
	function fileMatchSize(file, minSize, maxSize) {
	  if (isDefined(file.size)) {
	    if (isDefined(minSize) && isDefined(maxSize)) {
	      if (file.size > maxSize) return [false, getTooLargeRejectionErr(maxSize)];
	      if (file.size < minSize) return [false, getTooSmallRejectionErr(minSize)];
	    } else if (isDefined(minSize) && file.size < minSize) return [false, getTooSmallRejectionErr(minSize)];else if (isDefined(maxSize) && file.size > maxSize) return [false, getTooLargeRejectionErr(maxSize)];
	  }

	  return [true, null];
	}

	function isDefined(value) {
	  return value !== undefined && value !== null;
	}
	/**
	 *
	 * @param {object} options
	 * @param {File[]} options.files
	 * @param {string|string[]} [options.accept]
	 * @param {number} [options.minSize]
	 * @param {number} [options.maxSize]
	 * @param {boolean} [options.multiple]
	 * @param {number} [options.maxFiles]
	 * @param {(f: File) => FileError|FileError[]|null} [options.validator]
	 * @returns
	 */


	function allFilesAccepted(_ref) {
	  var files = _ref.files,
	      accept = _ref.accept,
	      minSize = _ref.minSize,
	      maxSize = _ref.maxSize,
	      multiple = _ref.multiple,
	      maxFiles = _ref.maxFiles,
	      validator = _ref.validator;

	  if (!multiple && files.length > 1 || multiple && maxFiles >= 1 && files.length > maxFiles) {
	    return false;
	  }

	  return files.every(function (file) {
	    var _fileAccepted = fileAccepted(file, accept),
	        _fileAccepted2 = _slicedToArray$1(_fileAccepted, 1),
	        accepted = _fileAccepted2[0];

	    var _fileMatchSize = fileMatchSize(file, minSize, maxSize),
	        _fileMatchSize2 = _slicedToArray$1(_fileMatchSize, 1),
	        sizeMatch = _fileMatchSize2[0];

	    var customErrors = validator ? validator(file) : null;
	    return accepted && sizeMatch && !customErrors;
	  });
	} // React's synthetic events has event.isPropagationStopped,
	// but to remain compatibility with other libs (Preact) fall back
	// to check event.cancelBubble

	function isPropagationStopped(event) {
	  if (typeof event.isPropagationStopped === "function") {
	    return event.isPropagationStopped();
	  } else if (typeof event.cancelBubble !== "undefined") {
	    return event.cancelBubble;
	  }

	  return false;
	}
	function isEvtWithFiles(event) {
	  if (!event.dataTransfer) {
	    return !!event.target && !!event.target.files;
	  } // https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/types
	  // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types#file


	  return Array.prototype.some.call(event.dataTransfer.types, function (type) {
	    return type === "Files" || type === "application/x-moz-file";
	  });
	}

	function onDocumentDragOver(event) {
	  event.preventDefault();
	}

	function isIe(userAgent) {
	  return userAgent.indexOf("MSIE") !== -1 || userAgent.indexOf("Trident/") !== -1;
	}

	function isEdge(userAgent) {
	  return userAgent.indexOf("Edge/") !== -1;
	}

	function isIeOrEdge() {
	  var userAgent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.navigator.userAgent;
	  return isIe(userAgent) || isEdge(userAgent);
	}
	/**
	 * This is intended to be used to compose event handlers
	 * They are executed in order until one of them calls `event.isPropagationStopped()`.
	 * Note that the check is done on the first invoke too,
	 * meaning that if propagation was stopped before invoking the fns,
	 * no handlers will be executed.
	 *
	 * @param {Function} fns the event hanlder functions
	 * @return {Function} the event handler to add to an element
	 */

	function composeEventHandlers() {
	  for (var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++) {
	    fns[_key] = arguments[_key];
	  }

	  return function (event) {
	    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	      args[_key2 - 1] = arguments[_key2];
	    }

	    return fns.some(function (fn) {
	      if (!isPropagationStopped(event) && fn) {
	        fn.apply(void 0, [event].concat(args));
	      }

	      return isPropagationStopped(event);
	    });
	  };
	}
	/**
	 * canUseFileSystemAccessAPI checks if the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
	 * is supported by the browser.
	 * @returns {boolean}
	 */

	function canUseFileSystemAccessAPI() {
	  return "showOpenFilePicker" in window;
	}
	/**
	 * Convert the `{accept}` dropzone prop to the
	 * `{types}` option for https://developer.mozilla.org/en-US/docs/Web/API/window/showOpenFilePicker
	 *
	 * @param {AcceptProp} accept
	 * @returns {{accept: string[]}[]}
	 */

	function pickerOptionsFromAccept(accept) {
	  if (isDefined(accept)) {
	    var acceptForPicker = Object.entries(accept).filter(function (_ref2) {
	      var _ref3 = _slicedToArray$1(_ref2, 2),
	          mimeType = _ref3[0],
	          ext = _ref3[1];

	      var ok = true;

	      if (!isMIMEType(mimeType)) {
	        console.warn("Skipped \"".concat(mimeType, "\" because it is not a valid MIME type. Check https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types for a list of valid MIME types."));
	        ok = false;
	      }

	      if (!Array.isArray(ext) || !ext.every(isExt)) {
	        console.warn("Skipped \"".concat(mimeType, "\" because an invalid file extension was provided."));
	        ok = false;
	      }

	      return ok;
	    }).reduce(function (agg, _ref4) {
	      var _ref5 = _slicedToArray$1(_ref4, 2),
	          mimeType = _ref5[0],
	          ext = _ref5[1];

	      return _objectSpread$1(_objectSpread$1({}, agg), {}, _defineProperty$2({}, mimeType, ext));
	    }, {});
	    return [{
	      // description is required due to https://crbug.com/1264708
	      description: "Files",
	      accept: acceptForPicker
	    }];
	  }

	  return accept;
	}
	/**
	 * Convert the `{accept}` dropzone prop to an array of MIME types/extensions.
	 * @param {AcceptProp} accept
	 * @returns {string}
	 */

	function acceptPropAsAcceptAttr(accept) {
	  if (isDefined(accept)) {
	    return Object.entries(accept).reduce(function (a, _ref6) {
	      var _ref7 = _slicedToArray$1(_ref6, 2),
	          mimeType = _ref7[0],
	          ext = _ref7[1];

	      return [].concat(_toConsumableArray$1(a), [mimeType], _toConsumableArray$1(ext));
	    }, []) // Silently discard invalid entries as pickerOptionsFromAccept warns about these
	    .filter(function (v) {
	      return isMIMEType(v) || isExt(v);
	    }).join(",");
	  }

	  return undefined;
	}
	/**
	 * Check if v is an exception caused by aborting a request (e.g window.showOpenFilePicker()).
	 *
	 * See https://developer.mozilla.org/en-US/docs/Web/API/DOMException.
	 * @param {any} v
	 * @returns {boolean} True if v is an abort exception.
	 */

	function isAbort(v) {
	  return v instanceof DOMException && (v.name === "AbortError" || v.code === v.ABORT_ERR);
	}
	/**
	 * Check if v is a security error.
	 *
	 * See https://developer.mozilla.org/en-US/docs/Web/API/DOMException.
	 * @param {any} v
	 * @returns {boolean} True if v is a security error.
	 */

	function isSecurityError(v) {
	  return v instanceof DOMException && (v.name === "SecurityError" || v.code === v.SECURITY_ERR);
	}
	/**
	 * Check if v is a MIME type string.
	 *
	 * See accepted format: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers.
	 *
	 * @param {string} v
	 */

	function isMIMEType(v) {
	  return v === "audio/*" || v === "video/*" || v === "image/*" || v === "text/*" || /\w+\/[-+.\w]+/g.test(v);
	}
	/**
	 * Check if v is a file extension.
	 * @param {string} v
	 */

	function isExt(v) {
	  return /^.*\.[\w]+$/.test(v);
	}
	/**
	 * @typedef {Object.<string, string[]>} AcceptProp
	 */

	/**
	 * @typedef {object} FileError
	 * @property {string} message
	 * @property {ErrorCode|string} code
	 */

	/**
	 * @typedef {"file-invalid-type"|"file-too-large"|"file-too-small"|"too-many-files"} ErrorCode
	 */

	var _excluded = ["children"],
	    _excluded2 = ["open"],
	    _excluded3 = ["refKey", "role", "onKeyDown", "onFocus", "onBlur", "onClick", "onDragEnter", "onDragOver", "onDragLeave", "onDrop"],
	    _excluded4 = ["refKey", "onChange", "onClick"];

	function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

	function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

	function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

	function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

	function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

	function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

	function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

	function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

	function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

	function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

	function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

	function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$1(Object(source), !0).forEach(function (key) { _defineProperty$1(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

	function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

	function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
	/**
	 * Convenience wrapper component for the `useDropzone` hook
	 *
	 * ```jsx
	 * <Dropzone>
	 *   {({getRootProps, getInputProps}) => (
	 *     <div {...getRootProps()}>
	 *       <input {...getInputProps()} />
	 *       <p>Drag 'n' drop some files here, or click to select files</p>
	 *     </div>
	 *   )}
	 * </Dropzone>
	 * ```
	 */

	var Dropzone = /*#__PURE__*/React.forwardRef(function (_ref, ref) {
	  var children = _ref.children,
	      params = _objectWithoutProperties(_ref, _excluded);

	  var _useDropzone = useDropzone(params),
	      open = _useDropzone.open,
	      props = _objectWithoutProperties(_useDropzone, _excluded2);

	  React.useImperativeHandle(ref, function () {
	    return {
	      open: open
	    };
	  }, [open]); // TODO: Figure out why react-styleguidist cannot create docs if we don't return a jsx element

	  return /*#__PURE__*/React.createElement(React.Fragment, null, children(_objectSpread(_objectSpread({}, props), {}, {
	    open: open
	  })));
	});
	Dropzone.displayName = "Dropzone"; // Add default props for react-docgen

	var defaultProps = {
	  disabled: false,
	  getFilesFromEvent: fromEvent,
	  maxSize: Infinity,
	  minSize: 0,
	  multiple: true,
	  maxFiles: 0,
	  preventDropOnDocument: true,
	  noClick: false,
	  noKeyboard: false,
	  noDrag: false,
	  noDragEventsBubbling: false,
	  validator: null,
	  useFsAccessApi: true,
	  autoFocus: false
	};
	Dropzone.defaultProps = defaultProps;
	Dropzone.propTypes = {
	  /**
	   * Render function that exposes the dropzone state and prop getter fns
	   *
	   * @param {object} params
	   * @param {Function} params.getRootProps Returns the props you should apply to the root drop container you render
	   * @param {Function} params.getInputProps Returns the props you should apply to hidden file input you render
	   * @param {Function} params.open Open the native file selection dialog
	   * @param {boolean} params.isFocused Dropzone area is in focus
	   * @param {boolean} params.isFileDialogActive File dialog is opened
	   * @param {boolean} params.isDragActive Active drag is in progress
	   * @param {boolean} params.isDragAccept Dragged files are accepted
	   * @param {boolean} params.isDragReject Some dragged files are rejected
	   * @param {File[]} params.acceptedFiles Accepted files
	   * @param {FileRejection[]} params.fileRejections Rejected files and why they were rejected
	   */
	  children: PropTypes.func,

	  /**
	   * Set accepted file types.
	   * Checkout https://developer.mozilla.org/en-US/docs/Web/API/window/showOpenFilePicker types option for more information.
	   * Keep in mind that mime type determination is not reliable across platforms. CSV files,
	   * for example, are reported as text/plain under macOS but as application/vnd.ms-excel under
	   * Windows. In some cases there might not be a mime type set at all (https://github.com/react-dropzone/react-dropzone/issues/276).
	   */
	  accept: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),

	  /**
	   * Allow drag 'n' drop (or selection from the file dialog) of multiple files
	   */
	  multiple: PropTypes.bool,

	  /**
	   * If false, allow dropped items to take over the current browser window
	   */
	  preventDropOnDocument: PropTypes.bool,

	  /**
	   * If true, disables click to open the native file selection dialog
	   */
	  noClick: PropTypes.bool,

	  /**
	   * If true, disables SPACE/ENTER to open the native file selection dialog.
	   * Note that it also stops tracking the focus state.
	   */
	  noKeyboard: PropTypes.bool,

	  /**
	   * If true, disables drag 'n' drop
	   */
	  noDrag: PropTypes.bool,

	  /**
	   * If true, stops drag event propagation to parents
	   */
	  noDragEventsBubbling: PropTypes.bool,

	  /**
	   * Minimum file size (in bytes)
	   */
	  minSize: PropTypes.number,

	  /**
	   * Maximum file size (in bytes)
	   */
	  maxSize: PropTypes.number,

	  /**
	   * Maximum accepted number of files
	   * The default value is 0 which means there is no limitation to how many files are accepted.
	   */
	  maxFiles: PropTypes.number,

	  /**
	   * Enable/disable the dropzone
	   */
	  disabled: PropTypes.bool,

	  /**
	   * Use this to provide a custom file aggregator
	   *
	   * @param {(DragEvent|Event)} event A drag event or input change event (if files were selected via the file dialog)
	   */
	  getFilesFromEvent: PropTypes.func,

	  /**
	   * Cb for when closing the file dialog with no selection
	   */
	  onFileDialogCancel: PropTypes.func,

	  /**
	   * Cb for when opening the file dialog
	   */
	  onFileDialogOpen: PropTypes.func,

	  /**
	   * Set to true to use the https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
	   * to open the file picker instead of using an `<input type="file">` click event.
	   */
	  useFsAccessApi: PropTypes.bool,

	  /**
	   * Set to true to focus the root element on render
	   */
	  autoFocus: PropTypes.bool,

	  /**
	   * Cb for when the `dragenter` event occurs.
	   *
	   * @param {DragEvent} event
	   */
	  onDragEnter: PropTypes.func,

	  /**
	   * Cb for when the `dragleave` event occurs
	   *
	   * @param {DragEvent} event
	   */
	  onDragLeave: PropTypes.func,

	  /**
	   * Cb for when the `dragover` event occurs
	   *
	   * @param {DragEvent} event
	   */
	  onDragOver: PropTypes.func,

	  /**
	   * Cb for when the `drop` event occurs.
	   * Note that this callback is invoked after the `getFilesFromEvent` callback is done.
	   *
	   * Files are accepted or rejected based on the `accept`, `multiple`, `minSize` and `maxSize` props.
	   * `accept` must be a valid [MIME type](http://www.iana.org/assignments/media-types/media-types.xhtml) according to [input element specification](https://www.w3.org/wiki/HTML/Elements/input/file) or a valid file extension.
	   * If `multiple` is set to false and additional files are dropped,
	   * all files besides the first will be rejected.
	   * Any file which does not have a size in the [`minSize`, `maxSize`] range, will be rejected as well.
	   *
	   * Note that the `onDrop` callback will always be invoked regardless if the dropped files were accepted or rejected.
	   * If you'd like to react to a specific scenario, use the `onDropAccepted`/`onDropRejected` props.
	   *
	   * `onDrop` will provide you with an array of [File](https://developer.mozilla.org/en-US/docs/Web/API/File) objects which you can then process and send to a server.
	   * For example, with [SuperAgent](https://github.com/visionmedia/superagent) as a http/ajax library:
	   *
	   * ```js
	   * function onDrop(acceptedFiles) {
	   *   const req = request.post('/upload')
	   *   acceptedFiles.forEach(file => {
	   *     req.attach(file.name, file)
	   *   })
	   *   req.end(callback)
	   * }
	   * ```
	   *
	   * @param {File[]} acceptedFiles
	   * @param {FileRejection[]} fileRejections
	   * @param {(DragEvent|Event)} event A drag event or input change event (if files were selected via the file dialog)
	   */
	  onDrop: PropTypes.func,

	  /**
	   * Cb for when the `drop` event occurs.
	   * Note that if no files are accepted, this callback is not invoked.
	   *
	   * @param {File[]} files
	   * @param {(DragEvent|Event)} event
	   */
	  onDropAccepted: PropTypes.func,

	  /**
	   * Cb for when the `drop` event occurs.
	   * Note that if no files are rejected, this callback is not invoked.
	   *
	   * @param {FileRejection[]} fileRejections
	   * @param {(DragEvent|Event)} event
	   */
	  onDropRejected: PropTypes.func,

	  /**
	   * Cb for when there's some error from any of the promises.
	   *
	   * @param {Error} error
	   */
	  onError: PropTypes.func,

	  /**
	   * Custom validation function. It must return null if there's no errors.
	   * @param {File} file
	   * @returns {FileError|FileError[]|null}
	   */
	  validator: PropTypes.func
	};
	/**
	 * A function that is invoked for the `dragenter`,
	 * `dragover` and `dragleave` events.
	 * It is not invoked if the items are not files (such as link, text, etc.).
	 *
	 * @callback dragCb
	 * @param {DragEvent} event
	 */

	/**
	 * A function that is invoked for the `drop` or input change event.
	 * It is not invoked if the items are not files (such as link, text, etc.).
	 *
	 * @callback dropCb
	 * @param {File[]} acceptedFiles List of accepted files
	 * @param {FileRejection[]} fileRejections List of rejected files and why they were rejected
	 * @param {(DragEvent|Event)} event A drag event or input change event (if files were selected via the file dialog)
	 */

	/**
	 * A function that is invoked for the `drop` or input change event.
	 * It is not invoked if the items are files (such as link, text, etc.).
	 *
	 * @callback dropAcceptedCb
	 * @param {File[]} files List of accepted files that meet the given criteria
	 * (`accept`, `multiple`, `minSize`, `maxSize`)
	 * @param {(DragEvent|Event)} event A drag event or input change event (if files were selected via the file dialog)
	 */

	/**
	 * A function that is invoked for the `drop` or input change event.
	 *
	 * @callback dropRejectedCb
	 * @param {File[]} files List of rejected files that do not meet the given criteria
	 * (`accept`, `multiple`, `minSize`, `maxSize`)
	 * @param {(DragEvent|Event)} event A drag event or input change event (if files were selected via the file dialog)
	 */

	/**
	 * A function that is used aggregate files,
	 * in a asynchronous fashion, from drag or input change events.
	 *
	 * @callback getFilesFromEvent
	 * @param {(DragEvent|Event)} event A drag event or input change event (if files were selected via the file dialog)
	 * @returns {(File[]|Promise<File[]>)}
	 */

	/**
	 * An object with the current dropzone state.
	 *
	 * @typedef {object} DropzoneState
	 * @property {boolean} isFocused Dropzone area is in focus
	 * @property {boolean} isFileDialogActive File dialog is opened
	 * @property {boolean} isDragActive Active drag is in progress
	 * @property {boolean} isDragAccept Dragged files are accepted
	 * @property {boolean} isDragReject Some dragged files are rejected
	 * @property {File[]} acceptedFiles Accepted files
	 * @property {FileRejection[]} fileRejections Rejected files and why they were rejected
	 */

	/**
	 * An object with the dropzone methods.
	 *
	 * @typedef {object} DropzoneMethods
	 * @property {Function} getRootProps Returns the props you should apply to the root drop container you render
	 * @property {Function} getInputProps Returns the props you should apply to hidden file input you render
	 * @property {Function} open Open the native file selection dialog
	 */

	var initialState = {
	  isFocused: false,
	  isFileDialogActive: false,
	  isDragActive: false,
	  isDragAccept: false,
	  isDragReject: false,
	  acceptedFiles: [],
	  fileRejections: []
	};
	/**
	 * A React hook that creates a drag 'n' drop area.
	 *
	 * ```jsx
	 * function MyDropzone(props) {
	 *   const {getRootProps, getInputProps} = useDropzone({
	 *     onDrop: acceptedFiles => {
	 *       // do something with the File objects, e.g. upload to some server
	 *     }
	 *   });
	 *   return (
	 *     <div {...getRootProps()}>
	 *       <input {...getInputProps()} />
	 *       <p>Drag and drop some files here, or click to select files</p>
	 *     </div>
	 *   )
	 * }
	 * ```
	 *
	 * @function useDropzone
	 *
	 * @param {object} props
	 * @param {import("./utils").AcceptProp} [props.accept] Set accepted file types.
	 * Checkout https://developer.mozilla.org/en-US/docs/Web/API/window/showOpenFilePicker types option for more information.
	 * Keep in mind that mime type determination is not reliable across platforms. CSV files,
	 * for example, are reported as text/plain under macOS but as application/vnd.ms-excel under
	 * Windows. In some cases there might not be a mime type set at all (https://github.com/react-dropzone/react-dropzone/issues/276).
	 * @param {boolean} [props.multiple=true] Allow drag 'n' drop (or selection from the file dialog) of multiple files
	 * @param {boolean} [props.preventDropOnDocument=true] If false, allow dropped items to take over the current browser window
	 * @param {boolean} [props.noClick=false] If true, disables click to open the native file selection dialog
	 * @param {boolean} [props.noKeyboard=false] If true, disables SPACE/ENTER to open the native file selection dialog.
	 * Note that it also stops tracking the focus state.
	 * @param {boolean} [props.noDrag=false] If true, disables drag 'n' drop
	 * @param {boolean} [props.noDragEventsBubbling=false] If true, stops drag event propagation to parents
	 * @param {number} [props.minSize=0] Minimum file size (in bytes)
	 * @param {number} [props.maxSize=Infinity] Maximum file size (in bytes)
	 * @param {boolean} [props.disabled=false] Enable/disable the dropzone
	 * @param {getFilesFromEvent} [props.getFilesFromEvent] Use this to provide a custom file aggregator
	 * @param {Function} [props.onFileDialogCancel] Cb for when closing the file dialog with no selection
	 * @param {boolean} [props.useFsAccessApi] Set to true to use the https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
	 * to open the file picker instead of using an `<input type="file">` click event.
	 * @param {boolean} autoFocus Set to true to auto focus the root element.
	 * @param {Function} [props.onFileDialogOpen] Cb for when opening the file dialog
	 * @param {dragCb} [props.onDragEnter] Cb for when the `dragenter` event occurs.
	 * @param {dragCb} [props.onDragLeave] Cb for when the `dragleave` event occurs
	 * @param {dragCb} [props.onDragOver] Cb for when the `dragover` event occurs
	 * @param {dropCb} [props.onDrop] Cb for when the `drop` event occurs.
	 * Note that this callback is invoked after the `getFilesFromEvent` callback is done.
	 *
	 * Files are accepted or rejected based on the `accept`, `multiple`, `minSize` and `maxSize` props.
	 * `accept` must be an object with keys as a valid [MIME type](http://www.iana.org/assignments/media-types/media-types.xhtml) according to [input element specification](https://www.w3.org/wiki/HTML/Elements/input/file) and the value an array of file extensions (optional).
	 * If `multiple` is set to false and additional files are dropped,
	 * all files besides the first will be rejected.
	 * Any file which does not have a size in the [`minSize`, `maxSize`] range, will be rejected as well.
	 *
	 * Note that the `onDrop` callback will always be invoked regardless if the dropped files were accepted or rejected.
	 * If you'd like to react to a specific scenario, use the `onDropAccepted`/`onDropRejected` props.
	 *
	 * `onDrop` will provide you with an array of [File](https://developer.mozilla.org/en-US/docs/Web/API/File) objects which you can then process and send to a server.
	 * For example, with [SuperAgent](https://github.com/visionmedia/superagent) as a http/ajax library:
	 *
	 * ```js
	 * function onDrop(acceptedFiles) {
	 *   const req = request.post('/upload')
	 *   acceptedFiles.forEach(file => {
	 *     req.attach(file.name, file)
	 *   })
	 *   req.end(callback)
	 * }
	 * ```
	 * @param {dropAcceptedCb} [props.onDropAccepted]
	 * @param {dropRejectedCb} [props.onDropRejected]
	 * @param {(error: Error) => void} [props.onError]
	 *
	 * @returns {DropzoneState & DropzoneMethods}
	 */

	function useDropzone() {
	  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	  var _defaultProps$props = _objectSpread(_objectSpread({}, defaultProps), props),
	      accept = _defaultProps$props.accept,
	      disabled = _defaultProps$props.disabled,
	      getFilesFromEvent = _defaultProps$props.getFilesFromEvent,
	      maxSize = _defaultProps$props.maxSize,
	      minSize = _defaultProps$props.minSize,
	      multiple = _defaultProps$props.multiple,
	      maxFiles = _defaultProps$props.maxFiles,
	      onDragEnter = _defaultProps$props.onDragEnter,
	      onDragLeave = _defaultProps$props.onDragLeave,
	      onDragOver = _defaultProps$props.onDragOver,
	      onDrop = _defaultProps$props.onDrop,
	      onDropAccepted = _defaultProps$props.onDropAccepted,
	      onDropRejected = _defaultProps$props.onDropRejected,
	      onFileDialogCancel = _defaultProps$props.onFileDialogCancel,
	      onFileDialogOpen = _defaultProps$props.onFileDialogOpen,
	      useFsAccessApi = _defaultProps$props.useFsAccessApi,
	      autoFocus = _defaultProps$props.autoFocus,
	      preventDropOnDocument = _defaultProps$props.preventDropOnDocument,
	      noClick = _defaultProps$props.noClick,
	      noKeyboard = _defaultProps$props.noKeyboard,
	      noDrag = _defaultProps$props.noDrag,
	      noDragEventsBubbling = _defaultProps$props.noDragEventsBubbling,
	      onError = _defaultProps$props.onError,
	      validator = _defaultProps$props.validator;

	  var acceptAttr = React.useMemo(function () {
	    return acceptPropAsAcceptAttr(accept);
	  }, [accept]);
	  var pickerTypes = React.useMemo(function () {
	    return pickerOptionsFromAccept(accept);
	  }, [accept]);
	  var onFileDialogOpenCb = React.useMemo(function () {
	    return typeof onFileDialogOpen === "function" ? onFileDialogOpen : noop;
	  }, [onFileDialogOpen]);
	  var onFileDialogCancelCb = React.useMemo(function () {
	    return typeof onFileDialogCancel === "function" ? onFileDialogCancel : noop;
	  }, [onFileDialogCancel]);
	  /**
	   * @constant
	   * @type {React.MutableRefObject<HTMLElement>}
	   */

	  var rootRef = React.useRef(null);
	  var inputRef = React.useRef(null);

	  var _useReducer = React.useReducer(reducer, initialState),
	      _useReducer2 = _slicedToArray(_useReducer, 2),
	      state = _useReducer2[0],
	      dispatch = _useReducer2[1];

	  var isFocused = state.isFocused,
	      isFileDialogActive = state.isFileDialogActive;
	  var fsAccessApiWorksRef = React.useRef(typeof window !== "undefined" && window.isSecureContext && useFsAccessApi && canUseFileSystemAccessAPI()); // Update file dialog active state when the window is focused on

	  var onWindowFocus = function onWindowFocus() {
	    // Execute the timeout only if the file dialog is opened in the browser
	    if (!fsAccessApiWorksRef.current && isFileDialogActive) {
	      setTimeout(function () {
	        if (inputRef.current) {
	          var files = inputRef.current.files;

	          if (!files.length) {
	            dispatch({
	              type: "closeDialog"
	            });
	            onFileDialogCancelCb();
	          }
	        }
	      }, 300);
	    }
	  };

	  React.useEffect(function () {
	    window.addEventListener("focus", onWindowFocus, false);
	    return function () {
	      window.removeEventListener("focus", onWindowFocus, false);
	    };
	  }, [inputRef, isFileDialogActive, onFileDialogCancelCb, fsAccessApiWorksRef]);
	  var dragTargetsRef = React.useRef([]);

	  var onDocumentDrop = function onDocumentDrop(event) {
	    if (rootRef.current && rootRef.current.contains(event.target)) {
	      // If we intercepted an event for our instance, let it propagate down to the instance's onDrop handler
	      return;
	    }

	    event.preventDefault();
	    dragTargetsRef.current = [];
	  };

	  React.useEffect(function () {
	    if (preventDropOnDocument) {
	      document.addEventListener("dragover", onDocumentDragOver, false);
	      document.addEventListener("drop", onDocumentDrop, false);
	    }

	    return function () {
	      if (preventDropOnDocument) {
	        document.removeEventListener("dragover", onDocumentDragOver);
	        document.removeEventListener("drop", onDocumentDrop);
	      }
	    };
	  }, [rootRef, preventDropOnDocument]); // Auto focus the root when autoFocus is true

	  React.useEffect(function () {
	    if (!disabled && autoFocus && rootRef.current) {
	      rootRef.current.focus();
	    }

	    return function () {};
	  }, [rootRef, autoFocus, disabled]);
	  var onErrCb = React.useCallback(function (e) {
	    if (onError) {
	      onError(e);
	    } else {
	      // Let the user know something's gone wrong if they haven't provided the onError cb.
	      console.error(e);
	    }
	  }, [onError]);
	  var onDragEnterCb = React.useCallback(function (event) {
	    event.preventDefault(); // Persist here because we need the event later after getFilesFromEvent() is done

	    event.persist();
	    stopPropagation(event);
	    dragTargetsRef.current = [].concat(_toConsumableArray(dragTargetsRef.current), [event.target]);

	    if (isEvtWithFiles(event)) {
	      Promise.resolve(getFilesFromEvent(event)).then(function (files) {
	        if (isPropagationStopped(event) && !noDragEventsBubbling) {
	          return;
	        }

	        var fileCount = files.length;
	        var isDragAccept = fileCount > 0 && allFilesAccepted({
	          files: files,
	          accept: acceptAttr,
	          minSize: minSize,
	          maxSize: maxSize,
	          multiple: multiple,
	          maxFiles: maxFiles,
	          validator: validator
	        });
	        var isDragReject = fileCount > 0 && !isDragAccept;
	        dispatch({
	          isDragAccept: isDragAccept,
	          isDragReject: isDragReject,
	          isDragActive: true,
	          type: "setDraggedFiles"
	        });

	        if (onDragEnter) {
	          onDragEnter(event);
	        }
	      }).catch(function (e) {
	        return onErrCb(e);
	      });
	    }
	  }, [getFilesFromEvent, onDragEnter, onErrCb, noDragEventsBubbling, acceptAttr, minSize, maxSize, multiple, maxFiles, validator]);
	  var onDragOverCb = React.useCallback(function (event) {
	    event.preventDefault();
	    event.persist();
	    stopPropagation(event);
	    var hasFiles = isEvtWithFiles(event);

	    if (hasFiles && event.dataTransfer) {
	      try {
	        event.dataTransfer.dropEffect = "copy";
	      } catch (_unused) {}
	      /* eslint-disable-line no-empty */

	    }

	    if (hasFiles && onDragOver) {
	      onDragOver(event);
	    }

	    return false;
	  }, [onDragOver, noDragEventsBubbling]);
	  var onDragLeaveCb = React.useCallback(function (event) {
	    event.preventDefault();
	    event.persist();
	    stopPropagation(event); // Only deactivate once the dropzone and all children have been left

	    var targets = dragTargetsRef.current.filter(function (target) {
	      return rootRef.current && rootRef.current.contains(target);
	    }); // Make sure to remove a target present multiple times only once
	    // (Firefox may fire dragenter/dragleave multiple times on the same element)

	    var targetIdx = targets.indexOf(event.target);

	    if (targetIdx !== -1) {
	      targets.splice(targetIdx, 1);
	    }

	    dragTargetsRef.current = targets;

	    if (targets.length > 0) {
	      return;
	    }

	    dispatch({
	      type: "setDraggedFiles",
	      isDragActive: false,
	      isDragAccept: false,
	      isDragReject: false
	    });

	    if (isEvtWithFiles(event) && onDragLeave) {
	      onDragLeave(event);
	    }
	  }, [rootRef, onDragLeave, noDragEventsBubbling]);
	  var setFiles = React.useCallback(function (files, event) {
	    var acceptedFiles = [];
	    var fileRejections = [];
	    files.forEach(function (file) {
	      var _fileAccepted = fileAccepted(file, acceptAttr),
	          _fileAccepted2 = _slicedToArray(_fileAccepted, 2),
	          accepted = _fileAccepted2[0],
	          acceptError = _fileAccepted2[1];

	      var _fileMatchSize = fileMatchSize(file, minSize, maxSize),
	          _fileMatchSize2 = _slicedToArray(_fileMatchSize, 2),
	          sizeMatch = _fileMatchSize2[0],
	          sizeError = _fileMatchSize2[1];

	      var customErrors = validator ? validator(file) : null;

	      if (accepted && sizeMatch && !customErrors) {
	        acceptedFiles.push(file);
	      } else {
	        var errors = [acceptError, sizeError];

	        if (customErrors) {
	          errors = errors.concat(customErrors);
	        }

	        fileRejections.push({
	          file: file,
	          errors: errors.filter(function (e) {
	            return e;
	          })
	        });
	      }
	    });

	    if (!multiple && acceptedFiles.length > 1 || multiple && maxFiles >= 1 && acceptedFiles.length > maxFiles) {
	      // Reject everything and empty accepted files
	      acceptedFiles.forEach(function (file) {
	        fileRejections.push({
	          file: file,
	          errors: [TOO_MANY_FILES_REJECTION]
	        });
	      });
	      acceptedFiles.splice(0);
	    }

	    dispatch({
	      acceptedFiles: acceptedFiles,
	      fileRejections: fileRejections,
	      type: "setFiles"
	    });

	    if (onDrop) {
	      onDrop(acceptedFiles, fileRejections, event);
	    }

	    if (fileRejections.length > 0 && onDropRejected) {
	      onDropRejected(fileRejections, event);
	    }

	    if (acceptedFiles.length > 0 && onDropAccepted) {
	      onDropAccepted(acceptedFiles, event);
	    }
	  }, [dispatch, multiple, acceptAttr, minSize, maxSize, maxFiles, onDrop, onDropAccepted, onDropRejected, validator]);
	  var onDropCb = React.useCallback(function (event) {
	    event.preventDefault(); // Persist here because we need the event later after getFilesFromEvent() is done

	    event.persist();
	    stopPropagation(event);
	    dragTargetsRef.current = [];

	    if (isEvtWithFiles(event)) {
	      Promise.resolve(getFilesFromEvent(event)).then(function (files) {
	        if (isPropagationStopped(event) && !noDragEventsBubbling) {
	          return;
	        }

	        setFiles(files, event);
	      }).catch(function (e) {
	        return onErrCb(e);
	      });
	    }

	    dispatch({
	      type: "reset"
	    });
	  }, [getFilesFromEvent, setFiles, onErrCb, noDragEventsBubbling]); // Fn for opening the file dialog programmatically

	  var openFileDialog = React.useCallback(function () {
	    // No point to use FS access APIs if context is not secure
	    // https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts#feature_detection
	    if (fsAccessApiWorksRef.current) {
	      dispatch({
	        type: "openDialog"
	      });
	      onFileDialogOpenCb(); // https://developer.mozilla.org/en-US/docs/Web/API/window/showOpenFilePicker

	      var opts = {
	        multiple: multiple,
	        types: pickerTypes
	      };
	      window.showOpenFilePicker(opts).then(function (handles) {
	        return getFilesFromEvent(handles);
	      }).then(function (files) {
	        setFiles(files, null);
	        dispatch({
	          type: "closeDialog"
	        });
	      }).catch(function (e) {
	        // AbortError means the user canceled
	        if (isAbort(e)) {
	          onFileDialogCancelCb(e);
	          dispatch({
	            type: "closeDialog"
	          });
	        } else if (isSecurityError(e)) {
	          fsAccessApiWorksRef.current = false; // CORS, so cannot use this API
	          // Try using the input

	          if (inputRef.current) {
	            inputRef.current.value = null;
	            inputRef.current.click();
	          } else {
	            onErrCb(new Error("Cannot open the file picker because the https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API is not supported and no <input> was provided."));
	          }
	        } else {
	          onErrCb(e);
	        }
	      });
	      return;
	    }

	    if (inputRef.current) {
	      dispatch({
	        type: "openDialog"
	      });
	      onFileDialogOpenCb();
	      inputRef.current.value = null;
	      inputRef.current.click();
	    }
	  }, [dispatch, onFileDialogOpenCb, onFileDialogCancelCb, useFsAccessApi, setFiles, onErrCb, pickerTypes, multiple]); // Cb to open the file dialog when SPACE/ENTER occurs on the dropzone

	  var onKeyDownCb = React.useCallback(function (event) {
	    // Ignore keyboard events bubbling up the DOM tree
	    if (!rootRef.current || !rootRef.current.isEqualNode(event.target)) {
	      return;
	    }

	    if (event.key === " " || event.key === "Enter" || event.keyCode === 32 || event.keyCode === 13) {
	      event.preventDefault();
	      openFileDialog();
	    }
	  }, [rootRef, openFileDialog]); // Update focus state for the dropzone

	  var onFocusCb = React.useCallback(function () {
	    dispatch({
	      type: "focus"
	    });
	  }, []);
	  var onBlurCb = React.useCallback(function () {
	    dispatch({
	      type: "blur"
	    });
	  }, []); // Cb to open the file dialog when click occurs on the dropzone

	  var onClickCb = React.useCallback(function () {
	    if (noClick) {
	      return;
	    } // In IE11/Edge the file-browser dialog is blocking, therefore, use setTimeout()
	    // to ensure React can handle state changes
	    // See: https://github.com/react-dropzone/react-dropzone/issues/450


	    if (isIeOrEdge()) {
	      setTimeout(openFileDialog, 0);
	    } else {
	      openFileDialog();
	    }
	  }, [noClick, openFileDialog]);

	  var composeHandler = function composeHandler(fn) {
	    return disabled ? null : fn;
	  };

	  var composeKeyboardHandler = function composeKeyboardHandler(fn) {
	    return noKeyboard ? null : composeHandler(fn);
	  };

	  var composeDragHandler = function composeDragHandler(fn) {
	    return noDrag ? null : composeHandler(fn);
	  };

	  var stopPropagation = function stopPropagation(event) {
	    if (noDragEventsBubbling) {
	      event.stopPropagation();
	    }
	  };

	  var getRootProps = React.useMemo(function () {
	    return function () {
	      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	          _ref2$refKey = _ref2.refKey,
	          refKey = _ref2$refKey === void 0 ? "ref" : _ref2$refKey,
	          role = _ref2.role,
	          onKeyDown = _ref2.onKeyDown,
	          onFocus = _ref2.onFocus,
	          onBlur = _ref2.onBlur,
	          onClick = _ref2.onClick,
	          onDragEnter = _ref2.onDragEnter,
	          onDragOver = _ref2.onDragOver,
	          onDragLeave = _ref2.onDragLeave,
	          onDrop = _ref2.onDrop,
	          rest = _objectWithoutProperties(_ref2, _excluded3);

	      return _objectSpread(_objectSpread(_defineProperty$1({
	        onKeyDown: composeKeyboardHandler(composeEventHandlers(onKeyDown, onKeyDownCb)),
	        onFocus: composeKeyboardHandler(composeEventHandlers(onFocus, onFocusCb)),
	        onBlur: composeKeyboardHandler(composeEventHandlers(onBlur, onBlurCb)),
	        onClick: composeHandler(composeEventHandlers(onClick, onClickCb)),
	        onDragEnter: composeDragHandler(composeEventHandlers(onDragEnter, onDragEnterCb)),
	        onDragOver: composeDragHandler(composeEventHandlers(onDragOver, onDragOverCb)),
	        onDragLeave: composeDragHandler(composeEventHandlers(onDragLeave, onDragLeaveCb)),
	        onDrop: composeDragHandler(composeEventHandlers(onDrop, onDropCb)),
	        role: typeof role === "string" && role !== "" ? role : "presentation"
	      }, refKey, rootRef), !disabled && !noKeyboard ? {
	        tabIndex: 0
	      } : {}), rest);
	    };
	  }, [rootRef, onKeyDownCb, onFocusCb, onBlurCb, onClickCb, onDragEnterCb, onDragOverCb, onDragLeaveCb, onDropCb, noKeyboard, noDrag, disabled]);
	  var onInputElementClick = React.useCallback(function (event) {
	    event.stopPropagation();
	  }, []);
	  var getInputProps = React.useMemo(function () {
	    return function () {
	      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	          _ref3$refKey = _ref3.refKey,
	          refKey = _ref3$refKey === void 0 ? "ref" : _ref3$refKey,
	          onChange = _ref3.onChange,
	          onClick = _ref3.onClick,
	          rest = _objectWithoutProperties(_ref3, _excluded4);

	      var inputProps = _defineProperty$1({
	        accept: acceptAttr,
	        multiple: multiple,
	        type: "file",
	        style: {
	          display: "none"
	        },
	        onChange: composeHandler(composeEventHandlers(onChange, onDropCb)),
	        onClick: composeHandler(composeEventHandlers(onClick, onInputElementClick)),
	        tabIndex: -1
	      }, refKey, inputRef);

	      return _objectSpread(_objectSpread({}, inputProps), rest);
	    };
	  }, [inputRef, accept, multiple, onDropCb, disabled]);
	  return _objectSpread(_objectSpread({}, state), {}, {
	    isFocused: isFocused && !disabled,
	    getRootProps: getRootProps,
	    getInputProps: getInputProps,
	    rootRef: rootRef,
	    inputRef: inputRef,
	    open: composeHandler(openFileDialog)
	  });
	}
	/**
	 * @param {DropzoneState} state
	 * @param {{type: string} & DropzoneState} action
	 * @returns {DropzoneState}
	 */

	function reducer(state, action) {
	  /* istanbul ignore next */
	  switch (action.type) {
	    case "focus":
	      return _objectSpread(_objectSpread({}, state), {}, {
	        isFocused: true
	      });

	    case "blur":
	      return _objectSpread(_objectSpread({}, state), {}, {
	        isFocused: false
	      });

	    case "openDialog":
	      return _objectSpread(_objectSpread({}, initialState), {}, {
	        isFileDialogActive: true
	      });

	    case "closeDialog":
	      return _objectSpread(_objectSpread({}, state), {}, {
	        isFileDialogActive: false
	      });

	    case "setDraggedFiles":
	      return _objectSpread(_objectSpread({}, state), {}, {
	        isDragActive: action.isDragActive,
	        isDragAccept: action.isDragAccept,
	        isDragReject: action.isDragReject
	      });

	    case "setFiles":
	      return _objectSpread(_objectSpread({}, state), {}, {
	        acceptedFiles: action.acceptedFiles,
	        fileRejections: action.fileRejections
	      });

	    case "reset":
	      return _objectSpread({}, initialState);

	    default:
	      return state;
	  }
	}

	function noop() {}

	var CloudUpload = {};

	var _interopRequireDefault$4 = interopRequireDefault.exports;
	Object.defineProperty(CloudUpload, "__esModule", {
	  value: true
	});
	var default_1$4 = CloudUpload.default = void 0;
	var _createSvgIcon$4 = _interopRequireDefault$4(createSvgIcon);
	var _jsxRuntime$4 = require$$2;
	var _default$7 = (0, _createSvgIcon$4.default)( /*#__PURE__*/(0, _jsxRuntime$4.jsx)("path", {
	  d: "M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
	}), 'CloudUpload');
	default_1$4 = CloudUpload.default = _default$7;

	var InsertDriveFile = {};

	var _interopRequireDefault$3 = interopRequireDefault.exports;
	Object.defineProperty(InsertDriveFile, "__esModule", {
	  value: true
	});
	var default_1$3 = InsertDriveFile.default = void 0;
	var _createSvgIcon$3 = _interopRequireDefault$3(createSvgIcon);
	var _jsxRuntime$3 = require$$2;
	var _default$6 = (0, _createSvgIcon$3.default)( /*#__PURE__*/(0, _jsxRuntime$3.jsx)("path", {
	  d: "M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"
	}), 'InsertDriveFile');
	default_1$3 = InsertDriveFile.default = _default$6;

	var Info = {};

	var _interopRequireDefault$2 = interopRequireDefault.exports;
	Object.defineProperty(Info, "__esModule", {
	  value: true
	});
	var default_1$2 = Info.default = void 0;
	var _createSvgIcon$2 = _interopRequireDefault$2(createSvgIcon);
	var _jsxRuntime$2 = require$$2;
	var _default$5 = (0, _createSvgIcon$2.default)( /*#__PURE__*/(0, _jsxRuntime$2.jsx)("path", {
	  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
	}), 'Info');
	default_1$2 = Info.default = _default$5;

	var ArrowForward = {};

	var _interopRequireDefault$1 = interopRequireDefault.exports;
	Object.defineProperty(ArrowForward, "__esModule", {
	  value: true
	});
	var default_1$1 = ArrowForward.default = void 0;
	var _createSvgIcon$1 = _interopRequireDefault$1(createSvgIcon);
	var _jsxRuntime$1 = require$$2;
	var _default$4 = (0, _createSvgIcon$1.default)( /*#__PURE__*/(0, _jsxRuntime$1.jsx)("path", {
	  d: "m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
	}), 'ArrowForward');
	default_1$1 = ArrowForward.default = _default$4;

	const THEME_SPACING_A$1 = 8; // theme.spacing(2)
	const THEME_SPACING_B$1 = 6; // theme.spacing(1)
	const useStyles$2 = mui.makeStyles()(theme => ({
	    closeButton: {
	        position: 'absolute',
	        left: '80px',
	        color: theme.palette.grey[500],
	    },
	    root: {
	        margin: THEME_SPACING_B$1,
	    },
	    paper: {
	        display: 'flex',
	        flexDirection: 'column',
	        padding: THEME_SPACING_A$1,
	    },
	    imgContainer: {
	        display: 'flex',
	        justifyContent: 'center',
	    },
	    img: {
	        maxWidth: '100%',
	        maxHeight: '100%',
	        verticalAlign: 'middle',
	    },
	    helperTextContainer: {
	        paddingTop: THEME_SPACING_A$1,
	        paddingBottom: THEME_SPACING_A$1,
	    },
	    textContainer: {
	        display: 'flex',
	        flexDirection: 'row',
	        gap: THEME_SPACING_A$1,
	        alignItems: 'center',
	        background: theme.palette.grey[100],
	        padding: THEME_SPACING_B$1,
	        marginTop: THEME_SPACING_A$1,
	        marginBottom: THEME_SPACING_A$1,
	    },
	    buttonContainer: {
	        display: 'flex',
	        justifyContent: 'flex-end',
	    },
	}));
	function TipDialogue({ handleClose, }) {
	    const { classes } = useStyles$2();
	    return (React.createElement(ui.Dialog, { open: true, onClose: handleClose, maxWidth: "sm", title: "How to upload bulk files from the GDC to JBrowse" },
	        React.createElement(material.DialogContent, null,
	            React.createElement("div", { className: classes.root },
	                React.createElement("div", { className: classes.paper },
	                    React.createElement("div", { className: classes.imgContainer },
	                        React.createElement("img", { className: classes.img, src: "https://i.imgur.com/jCKe4of.png" })),
	                    React.createElement(material.Paper, { className: classes.textContainer, elevation: 0 },
	                        React.createElement("div", { className: classes.helperTextContainer },
	                            React.createElement(material.Typography, { variant: "body1", align: "center" },
	                                React.createElement("b", null, "Step 1")),
	                            React.createElement(material.Typography, { variant: "body2", align: "center" }, "Perform a query on the GDC")),
	                        React.createElement(default_1$1, null),
	                        React.createElement("div", { className: classes.helperTextContainer },
	                            React.createElement(material.Typography, { variant: "body1", align: "center" },
	                                React.createElement("b", null, "Step 2")),
	                            React.createElement(material.Typography, { variant: "body2", align: "center" }, "Enable column for 'File UUID'")),
	                        React.createElement(default_1$1, null),
	                        React.createElement("div", { className: classes.helperTextContainer },
	                            React.createElement(material.Typography, { variant: "body1", align: "center" },
	                                React.createElement("b", null, "Step 3")),
	                            React.createElement(material.Typography, { variant: "body2", align: "center" }, "Click JSON button to Export")),
	                        React.createElement(default_1$1, null),
	                        React.createElement("div", { className: classes.helperTextContainer },
	                            React.createElement(material.Typography, { variant: "body1", align: "center" },
	                                React.createElement("b", null, "Step 4")),
	                            React.createElement(material.Typography, { variant: "body2", align: "center" }, "Drop JSON file into the GDC Widget on JBrowse"))),
	                    React.createElement("div", { className: classes.buttonContainer },
	                        React.createElement(material.Button, { color: "primary", variant: "contained", size: "large", onClick: handleClose }, "Close")))))));
	}

	const mapToAdapter = new Map([
	    [
	        'bam',
	        {
	            config: { type: 'AlignmentsTrack', adapter: { type: 'BamAdapter' } },
	            prefix: 'bam',
	        },
	    ],
	    [
	        'maf',
	        {
	            config: { type: 'MAFTrack', adapter: { type: 'MafAdapter' } },
	            prefix: 'maf',
	        },
	    ],
	    [
	        'vcf',
	        {
	            config: { type: 'VariantTrack', adapter: { type: 'VcfAdapter' } },
	            prefix: 'vcf',
	        },
	    ],
	    [
	        'Copy Number Variation',
	        {
	            config: {
	                type: 'QuantitativeTrack',
	                adapter: { type: 'SegmentCNVAdapter' },
	            },
	            prefix: 'seg',
	        },
	    ],
	    [
	        'Methylation Beta Value',
	        {
	            config: {
	                type: 'FeatureTrack',
	                adapter: { type: 'MbvAdapter' },
	            },
	            prefix: 'mbv',
	        },
	    ],
	    [
	        'Isoform Expression Quantification',
	        {
	            config: {
	                type: 'IEQTrack',
	                adapter: { type: 'IeqAdapter' },
	            },
	            prefix: 'ieq',
	        },
	    ],
	    [
	        'Splice Junction Quantification',
	        {
	            config: {
	                type: 'FeatureTrack',
	                adapter: { type: 'SjqAdapter' },
	                displays: [{ type: 'LinearArcDisplay' }],
	            },
	            prefix: 'sjq',
	        },
	    ],
	    [
	        'GDC Explore',
	        {
	            config: { type: 'GDCTrack', adapter: { type: 'GDCAdapter' } },
	        },
	    ],
	    [
	        'SSM or Gene',
	        {
	            config: { type: 'GDCTrack', adapter: { type: 'GDCJSONAdapter' } },
	        },
	    ],
	]);
	function getPriorityProperty(fileInfo) {
	    if (mapToAdapter.has(fileInfo.type)) {
	        return fileInfo.type;
	    }
	    else if (mapToAdapter.has(fileInfo.category)) {
	        return fileInfo.category;
	    }
	    else if (mapToAdapter.has(fileInfo.format)) {
	        return fileInfo.format;
	    }
	    else {
	        return '';
	    }
	}
	/**
	 * retrieves the config object with appropriate adapter using file info
	 *
	 * @param fileInfo an array of the format, category, and type of the file
	 *
	 * @param uri the uri of the data
	 *
	 * @param indexFileId the fileId of the index file that the data may require
	 * (BAM)
	 *
	 * @returns an object containing the config type and the adapter object
	 */
	function mapDataInfo(fileInfo, uri, indexFileId, fileBlob) {
	    const configObject = mapToAdapter.get(getPriorityProperty(fileInfo));
	    if (configObject) {
	        if (configObject.config.displays) {
	            const datenow = Date.now();
	            //@ts-expect-error
	            configObject.config.displays[0].displayId = `gdc_plugin_track_linear_basic-${datenow}`;
	        }
	        if (fileBlob) {
	            // @ts-expect-error
	            configObject.config.adapter[`${configObject.prefix}Location`] =
	                tracks.storeBlobLocation({ blob: fileBlob });
	        }
	        else {
	            //@ts-expect-error
	            configObject.config.adapter[`${configObject.prefix}Location`] = {
	                uri: uri,
	                authHeader: 'X-Auth-Token',
	                locationType: 'UriLocation',
	                internetAccountId: 'GDCExternalToken',
	            };
	            if (indexFileId) {
	                //@ts-expect-error
	                configObject.config.adapter.index = {
	                    location: {
	                        uri: `http://localhost:8010/proxy/data/${indexFileId}`,
	                        authHeader: 'X-Auth-Token',
	                        locationType: 'UriLocation',
	                        internetAccountId: 'GDCExternalToken',
	                    },
	                };
	            }
	        }
	    }
	    return configObject;
	}
	/**
	 * creates a specialized config for a GDC explore track using filters that have
	 * been parsed from a given url
	 *
	 * @param category 'GDC Explore' or 'SSM or Gene' indicating what kind of
	 * adapter to use
	 *
	 * @param featureType mutation or gene indicating what kind of feature is being
	 * displayed
	 *
	 * @param adapterPropertyValue filters or data indicating what kind of data has
	 * been fed to the function
	 *
	 * @param trackId the id for the track, needs to be passed in to be specified
	 * against the unique identifier
	 *
	 * @returns a configuration object that will create the track
	 */
	function mapGDCExploreConfig(category, featureType, adapterPropertyValue, trackId) {
	    const configObject = mapToAdapter.get(category);
	    const adapterProperty = category == 'GDC Explore' ? 'filters' : 'data';
	    if (configObject) {
	        const datenow = Date.now();
	        const color1 = featureType == 'mutation'
	            ? "jexl:cast({LOW: 'blue', MODIFIER: 'goldenrod', MODERATE: 'green', HIGH: 'red'})[get(feature,'consequence').hits.edges[.node.transcript.is_canonical == true][0].node.transcript.annotation.vep_impact] || 'lightgray'"
	            : "jexl:cast('goldenrod')";
	        configObject.config = {
	            adapter: {
	                ...configObject.config.adapter,
	                // @ts-expect-error
	                GDCAdapterId: trackId,
	                [adapterProperty]: adapterPropertyValue,
	                featureType,
	            },
	            category: undefined,
	            displays: [
	                {
	                    // @ts-expect-error
	                    displayId: `gdc_plugin_track_linear-${datenow}`,
	                    renderer: {
	                        color1,
	                        labels: {
	                            name: "jexl:get(feature,'genomicDnaChange')",
	                            type: 'SvgFeatureRenderer',
	                        },
	                    },
	                    type: 'LinearGDCDisplay',
	                },
	            ],
	            type: configObject.config.type,
	        };
	    }
	    return configObject;
	}

	const MAX_FILE_SIZE = 512 * 1024 ** 2; // 512 MiB
	const MAX_FILES = 25;
	const THEME_SPACING_A = 8; // theme.spacing(2)
	const THEME_SPACING_B = 10; // theme.spacing(4)
	const useStyles$1 = mui.makeStyles()(theme => ({
	    container: {
	        margin: THEME_SPACING_A,
	    },
	    fileInput: {
	        marginBottom: THEME_SPACING_A,
	    },
	    root: {
	        margin: 2,
	    },
	    paper: {
	        display: 'flex',
	        flexDirection: 'column',
	        gap: THEME_SPACING_B,
	        padding: THEME_SPACING_A,
	        margin: `2px 4px ${THEME_SPACING_A}px 4px`,
	    },
	    dragAndDropContainer: {
	        margin: `${THEME_SPACING_A}px ${THEME_SPACING_A}px 0px ${THEME_SPACING_A}px`,
	    },
	    dropZone: {
	        textAlign: 'center',
	        borderWidth: 2,
	        borderRadius: 2,
	        padding: THEME_SPACING_A,
	        borderStyle: 'dashed',
	        outline: 'none',
	        transition: 'border .24s ease-in-out',
	        '&:focus': {
	            borderColor: theme.palette.secondary.light,
	        },
	    },
	    uploadIcon: {
	        color: theme.palette.text.secondary,
	    },
	    rejectedFiles: {
	        marginTop: THEME_SPACING_B,
	    },
	    listItem: {
	        padding: THEME_SPACING_B,
	    },
	    expandIcon: {
	        color: '#FFFFFF',
	    },
	    error: {
	        margin: THEME_SPACING_A,
	    },
	    errorHeader: {
	        background: theme.palette.error.light,
	        color: theme.palette.error.contrastText,
	        padding: THEME_SPACING_A,
	        textAlign: 'center',
	    },
	    errorMessage: {
	        padding: THEME_SPACING_A,
	    },
	    submitContainer: {
	        display: 'flex',
	        flexDirection: 'column',
	    },
	    buttonContainer: {
	        display: 'flex',
	        justifyContent: 'flex-end',
	        marginTop: '4px',
	    },
	    addTrackButtonContainer: {
	        display: 'flex',
	        justifyContent: 'center',
	    },
	    loginPromptContainer: {
	        display: 'flex',
	        flexDirection: 'row',
	        alignItems: 'center',
	    },
	    typoContainer: {
	        width: '100%',
	    },
	    tipContainer: {
	        display: 'flex',
	        paddingTop: THEME_SPACING_A,
	    },
	    tipPaper: {
	        display: 'flex',
	        background: theme.palette.grey[100],
	    },
	    tipMessageContainer: {
	        display: 'flex',
	        flexDirection: 'row',
	        padding: THEME_SPACING_A,
	        gap: THEME_SPACING_A,
	        alignItems: 'center',
	    },
	}));
	async function fetchFileInfo(query) {
	    const response = await fetch(`http://localhost:8010/proxy/files/${query}?expand=index_files`, {
	        method: 'GET',
	    });
	    if (!response.ok) {
	        throw new Error(`Failed to fetch ${response.status} ${await response.text()}`);
	    }
	    return response.json();
	}
	const Panel = ({ model }) => {
	    const [dragErrorMessage, setDragErrorMessage] = React.useState();
	    const [success, setSuccess] = React.useState(false);
	    const [dragSuccess, setDragSuccess] = React.useState(false);
	    const [exploreSuccess, setExploreSuccess] = React.useState(false);
	    const [trackErrorMessage, setTrackErrorMessage] = React.useState();
	    const [trackInfoMessage, setTrackInfoMessage] = React.useState();
	    const [uploadInfoMessage, setUploadInfoMessage] = React.useState();
	    const [fileChip, setFileChip] = React.useState();
	    const session = util.getSession(model);
	    const inputRef = React.useRef();
	    /**
	     * uses information about the BEDPE file to display the contents in a spreadsheet view
	     * @param uri optional the uri of the BEDPE file being added to be passed to the track
	     * @param fileUUID the UUID of the file being added for the title of the view
	     * @param fileBlob optional the file being populated from the local machine
	     */
	    async function addBEDPEView(fileUUID, uri, fileBlob) {
	        session.addView('SpreadsheetView', {});
	        const xView = session.views.length - 1;
	        session.views[xView].setDisplayName(`GDC BEDPE ${fileUUID}`);
	        if (uri) {
	            // @ts-expect-error
	            session.views[xView].importWizard.setFileSource({
	                uri,
	                locationType: 'UriLocation',
	                authHeader: 'X-Auth-Token',
	                internetAccountId: 'GDCExternalToken',
	            });
	        }
	        if (fileBlob) {
	            // @ts-expect-error
	            session.views[xView].importWizard.setFileSource(tracks.storeBlobLocation({ blob: fileBlob }));
	        }
	        // @ts-expect-error
	        session.views[xView].importWizard.setFileType('BEDPE');
	        // @ts-expect-error
	        session.views[xView].importWizard.setSelectedAssemblyName('hg38');
	        // @ts-expect-error
	        await session.views[xView].importWizard.import('hg38');
	    }
	    /**
	     * uses the provided configuration to add the track to the session and then displays it
	     * displays an error message if typeAdapterObject is null
	     * @param typeAdapterObject the object from GDCDataInfo with some of the configuration for the track
	     * @param trackId the trackId of the track
	     * @param name the name of the track
	     */
	    function addAndShowTrack(typeAdapterObject, trackId, name, paper) {
	        if (typeAdapterObject) {
	            const conf = {
	                ...typeAdapterObject.config,
	                trackId,
	                name,
	                assemblyNames: ['hg38'],
	            };
	            //@ts-expect-error
	            session.addTrackConf({
	                ...conf,
	            });
	            if (session.views.length === 0) {
	                session.addView('LinearGenomeView', {});
	            }
	            //@ts-expect-error
	            session.views[0].showTrack(trackId, {}, {
	                height: 200,
	                constraints: { max: 2, min: -2 },
	                rendererTypeNameState: 'density',
	            });
	            if (paper === 'drag') {
	                setDragSuccess(true);
	            }
	            else if (paper === 'explore') {
	                setExploreSuccess(true);
	            }
	            else {
	                setSuccess(true);
	            }
	        }
	        else {
	            if (paper === 'drag') {
	                setDragErrorMessage('Failed to add track.\nThe configuration of this file is not currently supported.');
	            }
	            else {
	                setTrackErrorMessage('Failed to add track.\nThe configuration of this file is not currently supported.');
	            }
	        }
	    }
	    /**
	     * helper function to determine the file type of a dragged file. needed
	     * because files like BAM and VCF do not have inherent types to extract from
	     * the File object
	     *
	     * @param fileName the name of the file to determine the extension
	     * @returns an object of type fileInfo that contains the file format, type,
	     * and/or category of the file based on its name
	     */
	    function determineFileInfo(fileName) {
	        const format = fileName.split('.')[-1];
	        if (fileName.includes('Methylation')) {
	            return {
	                format,
	                type: 'Methylation Beta Value',
	                category: 'DNA Methylation',
	            };
	        }
	        if (fileName.includes('splice')) {
	            return {
	                format,
	                type: 'Splice Junction Quantification',
	                category: 'Transcriptome Profiling',
	            };
	        }
	        return { format, type: '', category: '' };
	    }
	    function resetErrorMessages() {
	        setTrackErrorMessage(undefined);
	        setTrackInfoMessage(undefined);
	        setDragErrorMessage(undefined);
	        setUploadInfoMessage(undefined);
	        setSuccess(false);
	        setDragSuccess(false);
	        setExploreSuccess(false);
	    }
	    const handleDelete = () => {
	        model.setTrackData(undefined);
	        model.setIndexTrackData(undefined);
	        setFileChip(undefined);
	        setUploadInfoMessage(undefined);
	    };
	    const { getRootProps, getInputProps } = useDropzone({
	        maxSize: MAX_FILE_SIZE,
	        multiple: false,
	        // eslint-disable-next-line @typescript-eslint/no-misused-promises
	        onDrop: async (acceptedFiles, rejectedFiles) => {
	            resetErrorMessages();
	            if (rejectedFiles.length) {
	                if (acceptedFiles.length || rejectedFiles.length > 1) {
	                    const message = 'Only one session at a time may be imported';
	                    console.error(message);
	                    setDragErrorMessage(message);
	                }
	                else if (rejectedFiles[0].file.size > MAX_FILE_SIZE) {
	                    const message = `File size is too large (${Math.round(rejectedFiles[0].file.size / 1024 ** 2)} MiB), max size is ${MAX_FILE_SIZE / 1024 ** 2} MiB`;
	                    console.error(message);
	                    setDragErrorMessage(message);
	                }
	                else {
	                    const message = 'Unknown file import error';
	                    console.error(message);
	                    setDragErrorMessage(message);
	                }
	            }
	            const [file] = acceptedFiles;
	            if (file) {
	                const fileInfo = determineFileInfo(file.name);
	                try {
	                    /**
	                     * JSON files are for bulk import of files from the GDC site
	                     */
	                    if (fileInfo.format == 'json') {
	                        const res = await new Promise(resolve => {
	                            const reader = new FileReader();
	                            reader.addEventListener('load', event => resolve(JSON.parse(event.target?.result)));
	                            reader.readAsText(file);
	                        });
	                        // if the file is json we need to look at the properties to determine how to process it
	                        const propertyArray = [];
	                        //@ts-expect-error
	                        for (const property in res.slice(0, 1)[0]) {
	                            propertyArray.push(property);
	                        }
	                        // key properties dictate how a file should be processed and displayed, i.e. the file_id
	                        if (propertyArray.includes('file_id')) {
	                            //@ts-expect-error
	                            const ele = res.slice(0, MAX_FILES); //TODO: it only gets the first 25 files
	                            ele.map((file) => {
	                                const iterFileInfo = determineFileInfo(file.file_name);
	                                const uri = `http://localhost:8010/proxy/data/${file.file_id}`;
	                                const typeAdapterObject = mapDataInfo(iterFileInfo, uri);
	                                addAndShowTrack(typeAdapterObject, file.file_id, file.file_name, 'drag');
	                            });
	                        }
	                        else {
	                            const message = 'Failed to add track.\nThe configuration of this file is not currently supported. Ensure that you have enabled the "File UUID" column on the GDC explore page table before exporting.';
	                            console.error(message);
	                            setDragErrorMessage(message);
	                        }
	                    }
	                    else if (fileInfo.type === 'bedpe') {
	                        await addBEDPEView(file.name, undefined, file);
	                        setDragSuccess(true);
	                    }
	                    else {
	                        // BAM files are a special case w drag and drop that require forcing the user to upload a bai file
	                        if (/\.bam$/i.test(file.name)) {
	                            if (!model.indexTrackData) {
	                                setUploadInfoMessage('Please upload a corresponding BAI file.');
	                                setFileChip(file.name);
	                            }
	                            // @ts-expect-error
	                            model.setTrackData(tracks.storeBlobLocation({ blob: file }));
	                        }
	                        if (/\.bai$/i.test(file.name)) {
	                            if (!model.trackData) {
	                                setUploadInfoMessage('Please upload a corresponding BAM file.');
	                                setFileChip(file.name);
	                            }
	                            // @ts-expect-error
	                            model.setIndexTrackData(tracks.storeBlobLocation({ blob: file }));
	                        }
	                        if ((/\.bam$/i.test(file.name) || /\.bai$/i.test(file.name)) &&
	                            model.indexTrackData &&
	                            model.trackData) {
	                            const trackId = `gdc_plugin_track-${Date.now()}`;
	                            //TODO: update this to go through the enahancement 2135 workflow
	                            const typeAdapterObject = {
	                                config: {
	                                    type: 'AlignmentsTrack',
	                                    adapter: {
	                                        type: 'BamAdapter',
	                                        bamLocation: model.trackData,
	                                        index: {
	                                            location: model.indexTrackData,
	                                            indexType: 'BAI',
	                                        },
	                                    },
	                                },
	                            };
	                            addAndShowTrack(typeAdapterObject, trackId, 
	                            // @ts-expect-error
	                            model.trackData.name, 'drag');
	                            model.setTrackData(undefined);
	                            model.setIndexTrackData(undefined);
	                            setFileChip(undefined);
	                            setUploadInfoMessage(undefined);
	                        }
	                        // all other files go through this channel
	                        if (!(/\.bam$/i.test(file.name) || /\.bai$/i.test(file.name))) {
	                            const trackId = `gdc_plugin_track-${Date.now()}`;
	                            const typeAdapterObject = mapDataInfo(fileInfo, undefined, undefined, file);
	                            addAndShowTrack(typeAdapterObject, trackId, file.name, 'drag');
	                        }
	                    }
	                }
	                catch (e) {
	                    console.error(e);
	                    const message = 
	                    // @ts-expect-error
	                    e.message.length > 100 ? `${e.message.substring(0, 99)}...` : e;
	                    setDragErrorMessage(`Failed to add track.\n ${message}.`);
	                }
	            }
	        },
	    });
	    function processExplorationURI(uri, source) {
	        const query = uri.split('?')[1];
	        const queryParams = new URLSearchParams(query);
	        const featureType = queryParams.get('searchTableTab') === 'genes' ||
	            queryParams.get('searchTableTab') === 'mutations'
	            ? // @ts-expect-error
	                queryParams.get('searchTableTab').slice(0, -1)
	            : 'mutation';
	        const filterString = queryParams.get('filters')
	            ? queryParams.get('filters')
	            : '{}';
	        // @ts-expect-error
	        const filters = decodeURIComponent(filterString);
	        const datenow = Date.now();
	        const trackId = `gdc_plugin_track-${datenow}`;
	        const trackName = `GDC Explore session-${datenow}`;
	        const typeAdapterObject = mapGDCExploreConfig('GDC Explore', featureType, filters, trackId);
	        addAndShowTrack(typeAdapterObject, trackId, trackName, source);
	    }
	    const { classes } = useStyles$1();
	    return (React.createElement("div", { className: classes.root },
	        React.createElement(material.Paper, { className: classes.paper, elevation: 3 },
	            React.createElement(material.Typography, { variant: "h6", component: "h1", align: "center" }, "Drag and Drop Local GDC Files"),
	            React.createElement("div", { className: classes.dragAndDropContainer },
	                React.createElement("div", { ...getRootProps({ className: classes.dropZone }) },
	                    React.createElement("input", { ...getInputProps() }),
	                    React.createElement(default_1$4, { className: classes.uploadIcon, fontSize: "large" }),
	                    React.createElement(material.Typography, { color: "textSecondary", align: "center", variant: "body1" }, "Drag and drop files here"),
	                    React.createElement(material.Typography, { color: "textSecondary", align: "center", variant: "body2" }, "or"),
	                    React.createElement(material.Button, { color: "primary", variant: "contained" }, "Browse Files")),
	                React.createElement("div", { className: classes.tipContainer },
	                    React.createElement(material.Paper, { className: classes.tipPaper, elevation: 0 },
	                        React.createElement("div", { className: classes.tipMessageContainer },
	                            React.createElement(default_1$2, null),
	                            React.createElement(material.Typography, { color: "textSecondary", variant: "caption" }, "You can bulk import files from the GDC Repository using the JSON export button."),
	                            React.createElement(material.Button, { variant: "text", onClick: () => {
	                                    session.queueDialog(doneCallback => [
	                                        TipDialogue,
	                                        {
	                                            handleClose: () => {
	                                                doneCallback();
	                                            },
	                                        },
	                                    ]);
	                                } },
	                                React.createElement("b", null, "Learn More")))))),
	            dragSuccess ? (React.createElement(material.Alert, { severity: "success" }, "The requested track(s) from the file have been added.")) : null,
	            dragErrorMessage ? (React.createElement(material.Alert, { severity: "error" }, dragErrorMessage)) : null,
	            fileChip ? (React.createElement(material.Chip, { label: fileChip, avatar: React.createElement(default_1$3, null), onDelete: handleDelete })) : null,
	            uploadInfoMessage ? (React.createElement(material.Alert, { severity: "info" }, uploadInfoMessage)) : null),
	        React.createElement(material.Paper, { className: classes.paper, elevation: 3 },
	            React.createElement(material.Typography, { variant: "h6", component: "h1", align: "center" }, "Import File or Exploration by UUID or URL"),
	            React.createElement(material.Typography, { variant: "body1", align: "center" }, "Add a track by providing the UUID or URL of a file, including controlled data, or by providing the URL of an Exploration session."),
	            trackErrorMessage ? (React.createElement(material.Alert, { severity: "error" }, trackErrorMessage)) : null,
	            trackInfoMessage ? (React.createElement(material.Alert, { severity: "info" }, trackInfoMessage)) : null,
	            success ? (React.createElement(material.Alert, { severity: "success" }, "The requested track has been added.")) : null,
	            React.createElement("div", { className: classes.submitContainer },
	                React.createElement(material.TextField, { color: "primary", variant: "outlined", label: "Enter UUID or URL", inputRef: inputRef }),
	                React.createElement("div", { className: classes.buttonContainer },
	                    React.createElement(material.Button, { color: "primary", variant: "contained", size: "large", 
	                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
	                        onClick: async () => {
	                            resetErrorMessages();
	                            try {
	                                // @ts-expect-error
	                                let query = inputRef ? inputRef.current.value : undefined;
	                                if (query.includes('exploration')) {
	                                    processExplorationURI(query);
	                                }
	                                else if (!query) {
	                                    setTrackErrorMessage('Failed to add track.\nUUID or URL must be provided.');
	                                }
	                                else {
	                                    if (query.includes('files/')) {
	                                        query = query.split('/')[4];
	                                    }
	                                    const response = await fetchFileInfo(query);
	                                    const fileInfo = {
	                                        category: response.data.data_category,
	                                        format: response.data.data_format.toLowerCase(),
	                                        type: response.data.data_type,
	                                    };
	                                    // BAM files require an index file, if the response
	                                    // contains index_files, then we want to utilize it
	                                    const indexFileId = response.data.index_files
	                                        ? response.data.index_files[0].file_id
	                                        : undefined;
	                                    const uri = `http://localhost:8010/proxy/data/${query}`;
	                                    const trackId = `${response.data.file_id}`;
	                                    const trackName = `${response.data.file_name}`;
	                                    if (fileInfo.type !== 'bedpe') {
	                                        const typeAdapterObject = mapDataInfo(fileInfo, uri, indexFileId);
	                                        addAndShowTrack(typeAdapterObject, trackId, trackName);
	                                    }
	                                    else {
	                                        await addBEDPEView(response.data.file_id, uri);
	                                        setSuccess(true);
	                                    }
	                                }
	                            }
	                            catch (e) {
	                                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
	                                const err = `${e}`;
	                                if (!err.includes('unable to determine size of file at')) {
	                                    console.error(e);
	                                    const message = err.length > 100 ? `${err.substring(0, 99)}...` : err;
	                                    setTrackErrorMessage(`Failed to add track.\n ${message}.`);
	                                }
	                            }
	                            // @ts-expect-error
	                            inputRef.current.value = null;
	                        } }, "Submit")))),
	        React.createElement(material.Paper, { className: classes.paper, elevation: 3 },
	            React.createElement("div", { className: classes.typoContainer },
	                React.createElement(material.Typography, { variant: "h6", component: "h1", align: "center" }, "Quick-add a GDC Explore Track"),
	                React.createElement(material.Typography, { variant: "body1", align: "center" }, "Add additional Explore tracks to your current view by clicking this button.")),
	            exploreSuccess ? (React.createElement(material.Alert, { severity: "success" }, "The requested Explore track has been added.")) : null,
	            React.createElement("div", { className: classes.addTrackButtonContainer },
	                React.createElement(material.Button, { color: "primary", variant: "contained", size: "small", startIcon: React.createElement(default_1$8, null), onClick: () => {
	                        processExplorationURI('https://portal.gdc.cancer.gov/exploration?facetTab=mutations', 'explore');
	                    } }, "Add New GDC Explore Track")))));
	};
	var ReactComponent = mobxReact.observer(Panel);

	var GDCSearchWidgetF = (jbrowse) => {
	    return {
	        configSchema: configuration.ConfigurationSchema('GDCSearchWidget', {}),
	        ReactComponent,
	        stateModel: jbrowse.load(f),
	        HeadingComponent: () => React.createElement(React.Fragment, null, "GDC Data Import"),
	    };
	};

	var configSchemaF$2 = (pluginManager) => {
	    const { baseLinearDisplayConfigSchema } = pluginManager.getPlugin('LinearGenomeViewPlugin').exports;
	    return configuration.ConfigurationSchema('LinearGDCDisplay', { renderer: pluginManager.pluggableConfigSchemaType('renderer') }, { baseConfiguration: baseLinearDisplayConfigSchema, explicitlyTyped: true });
	};

	var FilterList = {};

	var _interopRequireDefault = interopRequireDefault.exports;
	Object.defineProperty(FilterList, "__esModule", {
	  value: true
	});
	var default_1 = FilterList.default = void 0;
	var _createSvgIcon = _interopRequireDefault(createSvgIcon);
	var _jsxRuntime = require$$2;
	var _default$3 = (0, _createSvgIcon.default)( /*#__PURE__*/(0, _jsxRuntime.jsx)("path", {
	  d: "M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"
	}), 'FilterList');
	default_1 = FilterList.default = _default$3;

	var modelF$2 = (pluginManager, configSchema) => {
	    const { BaseLinearDisplay } = pluginManager.getPlugin('LinearGenomeViewPlugin')?.exports;
	    return require$$0.types
	        .compose('LinearGDCDisplay', BaseLinearDisplay, require$$0.types.model({
	        type: require$$0.types.literal('LinearGDCDisplay'),
	        configuration: configuration.ConfigurationReference(configSchema),
	    }))
	        .actions(self => ({
	        openFilterConfig() {
	            const session = util.getSession(self);
	            if (util.isSessionModelWithWidgets(session)) {
	                const editor = session.addWidget('GDCFilterWidget', 'gdcFilter', {
	                    target: self.parentTrack.configuration,
	                });
	                session.showWidget(editor);
	            }
	        },
	        selectFeature(feature) {
	            const session = util.getSession(self);
	            if (feature && util.isSessionModelWithWidgets(session)) {
	                const featureWidget = session.addWidget('GDCFeatureWidget', 'gdcFeature', { featureData: feature.toJSON() });
	                session.showWidget(featureWidget);
	                session.setSelection(feature);
	            }
	        },
	    }))
	        .views(self => {
	        const { renderProps: superRenderProps, trackMenuItems: superTrackMenuItems, } = self;
	        return {
	            renderProps() {
	                return {
	                    ...superRenderProps(),
	                    ...tracks.getParentRenderProps(self),
	                    displayModel: self,
	                    config: self.configuration.renderer,
	                };
	            },
	            get rendererTypeName() {
	                return self.configuration.renderer.type;
	            },
	            trackMenuItems() {
	                return [
	                    ...superTrackMenuItems(),
	                    {
	                        label: 'Filter',
	                        onClick: () => self.openFilterConfig(),
	                        icon: default_1,
	                    },
	                ];
	            },
	        };
	    });
	};

	var LinearGDCDisplayF = (pluginManager) => {
	    const schema = configSchemaF$2(pluginManager);
	    return {
	        configSchema: schema,
	        stateModel: modelF$2(pluginManager, schema),
	    };
	};

	var configSchemaF$1 = (function (pluginManager) {
	  var baseLinearDisplayConfigSchema = pluginManager.getPlugin('LinearGenomeViewPlugin').exports.baseLinearDisplayConfigSchema;
	  return configuration.ConfigurationSchema('LinearIEQDisplay', {
	    renderer: pluginManager.pluggableConfigSchemaType('renderer')
	  }, {
	    baseConfiguration: baseLinearDisplayConfigSchema,
	    explicitlyTyped: true
	  });
	});

	function ownKeys(e, r) {
	  var t = Object.keys(e);
	  if (Object.getOwnPropertySymbols) {
	    var o = Object.getOwnPropertySymbols(e);
	    r && (o = o.filter(function (r) {
	      return Object.getOwnPropertyDescriptor(e, r).enumerable;
	    })), t.push.apply(t, o);
	  }
	  return t;
	}
	function _objectSpread2(e) {
	  for (var r = 1; r < arguments.length; r++) {
	    var t = null != arguments[r] ? arguments[r] : {};
	    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
	      _defineProperty(e, r, t[r]);
	    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
	      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
	    });
	  }
	  return e;
	}
	function _defineProperty(obj, key, value) {
	  key = _toPropertyKey(key);
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }
	  return obj;
	}
	function _toPrimitive(input, hint) {
	  if (typeof input !== "object" || input === null) return input;
	  var prim = input[Symbol.toPrimitive];
	  if (prim !== undefined) {
	    var res = prim.call(input, hint || "default");
	    if (typeof res !== "object") return res;
	    throw new TypeError("@@toPrimitive must return a primitive value.");
	  }
	  return (hint === "string" ? String : Number)(input);
	}
	function _toPropertyKey(arg) {
	  var key = _toPrimitive(arg, "string");
	  return typeof key === "symbol" ? key : String(key);
	}

	var modelF$1 = (function (jbrowse) {
	  var configSchema = jbrowse.jbrequire(configSchemaF$1);
	  var BaseLinearDisplay = jbrowse.getPlugin('LinearGenomeViewPlugin').exports.BaseLinearDisplay;
	  return require$$0.types.compose('LinearIEQDisplay', BaseLinearDisplay, require$$0.types.model({
	    type: require$$0.types.literal('LinearIEQDisplay'),
	    configuration: configuration.ConfigurationReference(configSchema)
	  })).actions(function (self) {
	    return {
	      selectFeature: function selectFeature(feature) {
	        if (feature) {
	          var session = util.getSession(self);
	          var featureWidget = session.addWidget('GDCFeatureWidget', 'gdcFeature', {
	            featureData: feature.toJSON()
	          });
	          session.showWidget(featureWidget);
	          session.setSelection(feature);
	        }
	      }
	    };
	  }).views(function (self) {
	    var superRenderProps = self.renderProps;
	    return {
	      renderProps: function renderProps() {
	        var config = self.rendererType.configSchema.create({
	          color1: "jexl:ieqColouring(feature, 'reads_per_million_mirna_mapped')"
	        }, require$$0.getEnv(self));
	        return _objectSpread2(_objectSpread2(_objectSpread2({}, superRenderProps()), tracks.getParentRenderProps(self)), {}, {
	          displayModel: self,
	          config: config
	        });
	      },
	      get rendererTypeName() {
	        return self.configuration.renderer.type;
	      }
	    };
	  });
	});

	var LinearIEQDisplayF = (function (pluginManager) {
	  return {
	    configSchema: pluginManager.jbrequire(configSchemaF$1),
	    stateModel: pluginManager.jbrequire(modelF$1)
	  };
	});

	var configSchemaF = (function (pluginManager) {
	  var baseLinearDisplayConfigSchema = pluginManager.getPlugin('LinearGenomeViewPlugin').exports.baseLinearDisplayConfigSchema;
	  return configuration.ConfigurationSchema('LinearMAFDisplay', {
	    renderer: pluginManager.pluggableConfigSchemaType('renderer')
	  }, {
	    baseConfiguration: baseLinearDisplayConfigSchema,
	    explicitlyTyped: true
	  });
	});

	var modelF = (function (jbrowse) {
	  var configSchema = jbrowse.jbrequire(configSchemaF);
	  var BaseLinearDisplay = jbrowse.getPlugin('LinearGenomeViewPlugin').exports.BaseLinearDisplay;
	  return require$$0.types.compose('LinearMAFDisplay', BaseLinearDisplay, require$$0.types.model({
	    type: require$$0.types.literal('LinearMAFDisplay'),
	    configuration: configuration.ConfigurationReference(configSchema)
	  })).actions(function (self) {
	    return {
	      selectFeature: function selectFeature(feature) {
	        if (feature) {
	          var session = util.getSession(self);
	          var featureWidget = session.addWidget('GDCFeatureWidget', 'gdcFeature', {
	            featureData: feature.toJSON()
	          });
	          session.showWidget(featureWidget);
	          session.setSelection(feature);
	        }
	      }
	    };
	  }).views(function (self) {
	    var superRenderProps = self.renderProps;
	    return {
	      renderProps: function renderProps() {
	        var config = self.rendererType.configSchema.create({
	          color1: "jexl:mafColouring(feature)"
	        }, require$$0.getEnv(self));
	        return _objectSpread2(_objectSpread2(_objectSpread2({}, superRenderProps()), tracks.getParentRenderProps(self)), {}, {
	          displayModel: self,
	          config: config
	        });
	      },
	      get rendererTypeName() {
	        return self.configuration.renderer.type;
	      }
	    };
	  });
	});

	var LinearMAFDisplay = (function (pluginManager) {
	  return {
	    configSchema: pluginManager.jbrequire(configSchemaF),
	    stateModel: pluginManager.jbrequire(modelF)
	  };
	});

	var GDCAdapterConfigSchema = configuration.ConfigurationSchema('GDCAdapter', {
	    filters: {
	        type: 'string',
	        defaultValue: '{}',
	        description: 'The filters to be applied to the track. Only edit if you know what you are doing.',
	    },
	    colourBy: {
	        type: 'string',
	        defaultValue: '{}',
	        description: 'Colour features based on track attributes. Only edit if you know what you are doing.',
	    },
	    featureType: {
	        type: 'stringEnum',
	        model: require$$0.types.enumeration('Feature Type', ['mutation', 'gene']),
	        defaultValue: 'mutation',
	        description: 'The type of track to add',
	    },
	    cases: {
	        type: 'stringArray',
	        defaultValue: [],
	        description: 'GDC case UUIDs',
	    },
	    size: {
	        type: 'integer',
	        defaultValue: 5000,
	        description: 'The max number of features to show.',
	    },
	}, { explicitlyTyped: true, explicitIdentifier: 'GDCAdapterId' });

	class GDCFeature {
	    // eslint-disable-next-line @typescript-eslint/no-explicit-any
	    gdcObject;
	    data;
	    uniqueId;
	    featureType;
	    constructor(args) {
	        this.gdcObject = args.gdcObject;
	        this.featureType = args.featureType ? args.featureType : 'mutation';
	        this.data = this.dataFromGDCObject(this.gdcObject, this.featureType);
	        this.uniqueId = args.id;
	    }
	    get(field) {
	        return this.gdcObject[field] || this.data[field];
	    }
	    set() { }
	    parent() {
	        return undefined;
	    }
	    children() {
	        return undefined;
	    }
	    tags() {
	        const t = [...Object.keys(this.data), ...Object.keys(this.gdcObject)];
	        return t;
	    }
	    id() {
	        return this.uniqueId;
	    }
	    // eslint-disable-next-line @typescript-eslint/no-explicit-any
	    dataFromGDCObject(gdcObject, featureType) {
	        // Defaults to mutation values
	        const featureData = {
	            refName: gdcObject.chromosome,
	            type: gdcObject.mutationType,
	            start: gdcObject.startPosition - 1,
	            end: gdcObject.endPosition,
	        };
	        switch (featureType) {
	            case 'gene': {
	                featureData.start = gdcObject.geneStart - 1;
	                featureData.end = gdcObject.geneEnd;
	                featureData.refName = gdcObject.geneChromosome;
	                featureData.type = gdcObject.biotype;
	                featureData.note = gdcObject.symbol;
	                break;
	            }
	        }
	        return featureData;
	    }
	    toJSON() {
	        return {
	            uniqueId: this.uniqueId,
	            ...this.data,
	            ...this.gdcObject,
	        };
	    }
	}

	var esm = {};

	var AbortablePromiseCache$1 = {};

	var abortcontrollerPonyfill = {};

	var cjsPonyfill = {};

	Object.defineProperty(cjsPonyfill, '__esModule', { value: true });

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  Object.defineProperty(Constructor, "prototype", {
	    writable: false
	  });
	  return Constructor;
	}

	function _inherits(subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function");
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      writable: true,
	      configurable: true
	    }
	  });
	  Object.defineProperty(subClass, "prototype", {
	    writable: false
	  });
	  if (superClass) _setPrototypeOf(subClass, superClass);
	}

	function _getPrototypeOf(o) {
	  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
	    return o.__proto__ || Object.getPrototypeOf(o);
	  };
	  return _getPrototypeOf(o);
	}

	function _setPrototypeOf(o, p) {
	  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
	    o.__proto__ = p;
	    return o;
	  };
	  return _setPrototypeOf(o, p);
	}

	function _isNativeReflectConstruct() {
	  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
	  if (Reflect.construct.sham) return false;
	  if (typeof Proxy === "function") return true;

	  try {
	    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
	    return true;
	  } catch (e) {
	    return false;
	  }
	}

	function _assertThisInitialized(self) {
	  if (self === void 0) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return self;
	}

	function _possibleConstructorReturn(self, call) {
	  if (call && (typeof call === "object" || typeof call === "function")) {
	    return call;
	  } else if (call !== void 0) {
	    throw new TypeError("Derived constructors may only return object or undefined");
	  }

	  return _assertThisInitialized(self);
	}

	function _createSuper(Derived) {
	  var hasNativeReflectConstruct = _isNativeReflectConstruct();

	  return function _createSuperInternal() {
	    var Super = _getPrototypeOf(Derived),
	        result;

	    if (hasNativeReflectConstruct) {
	      var NewTarget = _getPrototypeOf(this).constructor;

	      result = Reflect.construct(Super, arguments, NewTarget);
	    } else {
	      result = Super.apply(this, arguments);
	    }

	    return _possibleConstructorReturn(this, result);
	  };
	}

	function _superPropBase(object, property) {
	  while (!Object.prototype.hasOwnProperty.call(object, property)) {
	    object = _getPrototypeOf(object);
	    if (object === null) break;
	  }

	  return object;
	}

	function _get() {
	  if (typeof Reflect !== "undefined" && Reflect.get) {
	    _get = Reflect.get.bind();
	  } else {
	    _get = function _get(target, property, receiver) {
	      var base = _superPropBase(target, property);

	      if (!base) return;
	      var desc = Object.getOwnPropertyDescriptor(base, property);

	      if (desc.get) {
	        return desc.get.call(arguments.length < 3 ? target : receiver);
	      }

	      return desc.value;
	    };
	  }

	  return _get.apply(this, arguments);
	}

	var Emitter = /*#__PURE__*/function () {
	  function Emitter() {
	    _classCallCheck(this, Emitter);

	    Object.defineProperty(this, 'listeners', {
	      value: {},
	      writable: true,
	      configurable: true
	    });
	  }

	  _createClass(Emitter, [{
	    key: "addEventListener",
	    value: function addEventListener(type, callback, options) {
	      if (!(type in this.listeners)) {
	        this.listeners[type] = [];
	      }

	      this.listeners[type].push({
	        callback: callback,
	        options: options
	      });
	    }
	  }, {
	    key: "removeEventListener",
	    value: function removeEventListener(type, callback) {
	      if (!(type in this.listeners)) {
	        return;
	      }

	      var stack = this.listeners[type];

	      for (var i = 0, l = stack.length; i < l; i++) {
	        if (stack[i].callback === callback) {
	          stack.splice(i, 1);
	          return;
	        }
	      }
	    }
	  }, {
	    key: "dispatchEvent",
	    value: function dispatchEvent(event) {
	      if (!(event.type in this.listeners)) {
	        return;
	      }

	      var stack = this.listeners[event.type];
	      var stackToCall = stack.slice();

	      for (var i = 0, l = stackToCall.length; i < l; i++) {
	        var listener = stackToCall[i];

	        try {
	          listener.callback.call(this, event);
	        } catch (e) {
	          Promise.resolve().then(function () {
	            throw e;
	          });
	        }

	        if (listener.options && listener.options.once) {
	          this.removeEventListener(event.type, listener.callback);
	        }
	      }

	      return !event.defaultPrevented;
	    }
	  }]);

	  return Emitter;
	}();

	var AbortSignal$1 = /*#__PURE__*/function (_Emitter) {
	  _inherits(AbortSignal, _Emitter);

	  var _super = _createSuper(AbortSignal);

	  function AbortSignal() {
	    var _this;

	    _classCallCheck(this, AbortSignal);

	    _this = _super.call(this); // Some versions of babel does not transpile super() correctly for IE <= 10, if the parent
	    // constructor has failed to run, then "this.listeners" will still be undefined and then we call
	    // the parent constructor directly instead as a workaround. For general details, see babel bug:
	    // https://github.com/babel/babel/issues/3041
	    // This hack was added as a fix for the issue described here:
	    // https://github.com/Financial-Times/polyfill-library/pull/59#issuecomment-477558042

	    if (!_this.listeners) {
	      Emitter.call(_assertThisInitialized(_this));
	    } // Compared to assignment, Object.defineProperty makes properties non-enumerable by default and
	    // we want Object.keys(new AbortController().signal) to be [] for compat with the native impl


	    Object.defineProperty(_assertThisInitialized(_this), 'aborted', {
	      value: false,
	      writable: true,
	      configurable: true
	    });
	    Object.defineProperty(_assertThisInitialized(_this), 'onabort', {
	      value: null,
	      writable: true,
	      configurable: true
	    });
	    Object.defineProperty(_assertThisInitialized(_this), 'reason', {
	      value: undefined,
	      writable: true,
	      configurable: true
	    });
	    return _this;
	  }

	  _createClass(AbortSignal, [{
	    key: "toString",
	    value: function toString() {
	      return '[object AbortSignal]';
	    }
	  }, {
	    key: "dispatchEvent",
	    value: function dispatchEvent(event) {
	      if (event.type === 'abort') {
	        this.aborted = true;

	        if (typeof this.onabort === 'function') {
	          this.onabort.call(this, event);
	        }
	      }

	      _get(_getPrototypeOf(AbortSignal.prototype), "dispatchEvent", this).call(this, event);
	    }
	  }]);

	  return AbortSignal;
	}(Emitter);
	var AbortController$1 = /*#__PURE__*/function () {
	  function AbortController() {
	    _classCallCheck(this, AbortController);

	    // Compared to assignment, Object.defineProperty makes properties non-enumerable by default and
	    // we want Object.keys(new AbortController()) to be [] for compat with the native impl
	    Object.defineProperty(this, 'signal', {
	      value: new AbortSignal$1(),
	      writable: true,
	      configurable: true
	    });
	  }

	  _createClass(AbortController, [{
	    key: "abort",
	    value: function abort(reason) {
	      var event;

	      try {
	        event = new Event('abort');
	      } catch (e) {
	        if (typeof document !== 'undefined') {
	          if (!document.createEvent) {
	            // For Internet Explorer 8:
	            event = document.createEventObject();
	            event.type = 'abort';
	          } else {
	            // For Internet Explorer 11:
	            event = document.createEvent('Event');
	            event.initEvent('abort', false, false);
	          }
	        } else {
	          // Fallback where document isn't available:
	          event = {
	            type: 'abort',
	            bubbles: false,
	            cancelable: false
	          };
	        }
	      }

	      var signalReason = reason;

	      if (signalReason === undefined) {
	        if (typeof document === 'undefined') {
	          signalReason = new Error('This operation was aborted');
	          signalReason.name = 'AbortError';
	        } else {
	          try {
	            signalReason = new DOMException('signal is aborted without reason');
	          } catch (err) {
	            // IE 11 does not support calling the DOMException constructor, use a
	            // regular error object on it instead.
	            signalReason = new Error('This operation was aborted');
	            signalReason.name = 'AbortError';
	          }
	        }
	      }

	      this.signal.reason = signalReason;
	      this.signal.dispatchEvent(event);
	    }
	  }, {
	    key: "toString",
	    value: function toString() {
	      return '[object AbortController]';
	    }
	  }]);

	  return AbortController;
	}();

	if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
	  // These are necessary to make sure that we get correct output for:
	  // Object.prototype.toString.call(new AbortController())
	  AbortController$1.prototype[Symbol.toStringTag] = 'AbortController';
	  AbortSignal$1.prototype[Symbol.toStringTag] = 'AbortSignal';
	}

	function polyfillNeeded(self) {
	  if (self.__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL) {
	    console.log('__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL=true is set, will force install polyfill');
	    return true;
	  } // Note that the "unfetch" minimal fetch polyfill defines fetch() without
	  // defining window.Request, and this polyfill need to work on top of unfetch
	  // so the below feature detection needs the !self.AbortController part.
	  // The Request.prototype check is also needed because Safari versions 11.1.2
	  // up to and including 12.1.x has a window.AbortController present but still
	  // does NOT correctly implement abortable fetch:
	  // https://bugs.webkit.org/show_bug.cgi?id=174980#c2


	  return typeof self.Request === 'function' && !self.Request.prototype.hasOwnProperty('signal') || !self.AbortController;
	}

	/**
	 * Note: the "fetch.Request" default value is available for fetch imported from
	 * the "node-fetch" package and not in browsers. This is OK since browsers
	 * will be importing umd-polyfill.js from that path "self" is passed the
	 * decorator so the default value will not be used (because browsers that define
	 * fetch also has Request). One quirky setup where self.fetch exists but
	 * self.Request does not is when the "unfetch" minimal fetch polyfill is used
	 * on top of IE11; for this case the browser will try to use the fetch.Request
	 * default value which in turn will be undefined but then then "if (Request)"
	 * will ensure that you get a patched fetch but still no Request (as expected).
	 * @param {fetch, Request = fetch.Request}
	 * @returns {fetch: abortableFetch, Request: AbortableRequest}
	 */

	function abortableFetchDecorator(patchTargets) {
	  if ('function' === typeof patchTargets) {
	    patchTargets = {
	      fetch: patchTargets
	    };
	  }

	  var _patchTargets = patchTargets,
	      fetch = _patchTargets.fetch,
	      _patchTargets$Request = _patchTargets.Request,
	      NativeRequest = _patchTargets$Request === void 0 ? fetch.Request : _patchTargets$Request,
	      NativeAbortController = _patchTargets.AbortController,
	      _patchTargets$__FORCE = _patchTargets.__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL,
	      __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL = _patchTargets$__FORCE === void 0 ? false : _patchTargets$__FORCE;

	  if (!polyfillNeeded({
	    fetch: fetch,
	    Request: NativeRequest,
	    AbortController: NativeAbortController,
	    __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL: __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL
	  })) {
	    return {
	      fetch: fetch,
	      Request: Request
	    };
	  }

	  var Request = NativeRequest; // Note that the "unfetch" minimal fetch polyfill defines fetch() without
	  // defining window.Request, and this polyfill need to work on top of unfetch
	  // hence we only patch it if it's available. Also we don't patch it if signal
	  // is already available on the Request prototype because in this case support
	  // is present and the patching below can cause a crash since it assigns to
	  // request.signal which is technically a read-only property. This latter error
	  // happens when you run the main5.js node-fetch example in the repo
	  // "abortcontroller-polyfill-examples". The exact error is:
	  //   request.signal = init.signal;
	  //   ^
	  // TypeError: Cannot set property signal of #<Request> which has only a getter

	  if (Request && !Request.prototype.hasOwnProperty('signal') || __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL) {
	    Request = function Request(input, init) {
	      var signal;

	      if (init && init.signal) {
	        signal = init.signal; // Never pass init.signal to the native Request implementation when the polyfill has
	        // been installed because if we're running on top of a browser with a
	        // working native AbortController (i.e. the polyfill was installed due to
	        // __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL being set), then passing our
	        // fake AbortSignal to the native fetch will trigger:
	        // TypeError: Failed to construct 'Request': member signal is not of type AbortSignal.

	        delete init.signal;
	      }

	      var request = new NativeRequest(input, init);

	      if (signal) {
	        Object.defineProperty(request, 'signal', {
	          writable: false,
	          enumerable: false,
	          configurable: true,
	          value: signal
	        });
	      }

	      return request;
	    };

	    Request.prototype = NativeRequest.prototype;
	  }

	  var realFetch = fetch;

	  var abortableFetch = function abortableFetch(input, init) {
	    var signal = Request && Request.prototype.isPrototypeOf(input) ? input.signal : init ? init.signal : undefined;

	    if (signal) {
	      var abortError;

	      try {
	        abortError = new DOMException('Aborted', 'AbortError');
	      } catch (err) {
	        // IE 11 does not support calling the DOMException constructor, use a
	        // regular error object on it instead.
	        abortError = new Error('Aborted');
	        abortError.name = 'AbortError';
	      } // Return early if already aborted, thus avoiding making an HTTP request


	      if (signal.aborted) {
	        return Promise.reject(abortError);
	      } // Turn an event into a promise, reject it once `abort` is dispatched


	      var cancellation = new Promise(function (_, reject) {
	        signal.addEventListener('abort', function () {
	          return reject(abortError);
	        }, {
	          once: true
	        });
	      });

	      if (init && init.signal) {
	        // Never pass .signal to the native implementation when the polyfill has
	        // been installed because if we're running on top of a browser with a
	        // working native AbortController (i.e. the polyfill was installed due to
	        // __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL being set), then passing our
	        // fake AbortSignal to the native fetch will trigger:
	        // TypeError: Failed to execute 'fetch' on 'Window': member signal is not of type AbortSignal.
	        delete init.signal;
	      } // Return the fastest promise (don't need to wait for request to finish)


	      return Promise.race([cancellation, realFetch(input, init)]);
	    }

	    return realFetch(input, init);
	  };

	  return {
	    fetch: abortableFetch,
	    Request: Request
	  };
	}

	cjsPonyfill.AbortController = AbortController$1;
	cjsPonyfill.AbortSignal = AbortSignal$1;
	cjsPonyfill.abortableFetch = abortableFetchDecorator;

	/* eslint-disable */
	Object.defineProperty(abortcontrollerPonyfill, "__esModule", { value: true });
	abortcontrollerPonyfill.AbortSignal = abortcontrollerPonyfill.AbortController = void 0;
	const cjs_ponyfill_1 = cjsPonyfill;
	var getGlobal = function () {
	    // the only reliable means to get the global object is
	    // `Function('return this')()`
	    // However, this causes CSP violations in Chrome apps.
	    if (typeof self !== 'undefined') {
	        return self;
	    }
	    if (typeof window !== 'undefined') {
	        return window;
	    }
	    if (typeof commonjsGlobal !== 'undefined') {
	        return commonjsGlobal;
	    }
	    throw new Error('unable to locate global object');
	};
	//@ts-ignore
	let AbortController = typeof getGlobal().AbortController === 'undefined' ? cjs_ponyfill_1.AbortController : getGlobal().AbortController;
	abortcontrollerPonyfill.AbortController = AbortController;
	//@ts-ignore
	let AbortSignal = typeof getGlobal().AbortController === 'undefined' ? cjs_ponyfill_1.AbortSignal : getGlobal().AbortSignal;
	abortcontrollerPonyfill.AbortSignal = AbortSignal;

	var AggregateAbortController$1 = {};

	Object.defineProperty(AggregateAbortController$1, "__esModule", { value: true });
	const abortcontroller_ponyfill_1$1 = abortcontrollerPonyfill;
	class NullSignal {
	}
	/**
	 * aggregates a number of abort signals, will only fire the aggregated
	 * abort if all of the input signals have been aborted
	 */
	class AggregateAbortController {
	    constructor() {
	        this.signals = new Set();
	        this.abortController = new abortcontroller_ponyfill_1$1.AbortController();
	    }
	    /**
	     * @param {AbortSignal} [signal] optional AbortSignal to add. if falsy,
	     *  will be treated as a null-signal, and this abortcontroller will no
	     *  longer be abortable.
	     */
	    //@ts-ignore
	    addSignal(signal = new NullSignal()) {
	        if (this.signal.aborted) {
	            throw new Error('cannot add a signal, already aborted!');
	        }
	        // note that a NullSignal will never fire, so if we
	        // have one this thing will never actually abort
	        this.signals.add(signal);
	        if (signal.aborted) {
	            // handle the abort immediately if it is already aborted
	            // for some reason
	            this.handleAborted(signal);
	        }
	        else if (typeof signal.addEventListener === 'function') {
	            signal.addEventListener('abort', () => {
	                this.handleAborted(signal);
	            });
	        }
	    }
	    handleAborted(signal) {
	        this.signals.delete(signal);
	        if (this.signals.size === 0) {
	            this.abortController.abort();
	        }
	    }
	    get signal() {
	        return this.abortController.signal;
	    }
	    abort() {
	        this.abortController.abort();
	    }
	}
	AggregateAbortController$1.default = AggregateAbortController;

	var AggregateStatusReporter$1 = {};

	Object.defineProperty(AggregateStatusReporter$1, "__esModule", { value: true });
	class AggregateStatusReporter {
	    constructor() {
	        this.callbacks = new Set();
	    }
	    addCallback(callback = () => { }) {
	        this.callbacks.add(callback);
	        callback(this.currentMessage);
	    }
	    callback(message) {
	        this.currentMessage = message;
	        this.callbacks.forEach(elt => {
	            elt(message);
	        });
	    }
	}
	AggregateStatusReporter$1.default = AggregateStatusReporter;

	var __importDefault$1 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(AbortablePromiseCache$1, "__esModule", { value: true });
	const abortcontroller_ponyfill_1 = abortcontrollerPonyfill;
	const AggregateAbortController_1 = __importDefault$1(AggregateAbortController$1);
	const AggregateStatusReporter_1 = __importDefault$1(AggregateStatusReporter$1);
	class AbortablePromiseCache {
	    constructor({ fill, cache, }) {
	        if (typeof fill !== 'function') {
	            throw new TypeError('must pass a fill function');
	        }
	        if (typeof cache !== 'object') {
	            throw new TypeError('must pass a cache object');
	        }
	        if (typeof cache.get !== 'function' ||
	            typeof cache.set !== 'function' ||
	            typeof cache.delete !== 'function') {
	            throw new TypeError('cache must implement get(key), set(key, val), and and delete(key)');
	        }
	        this.cache = cache;
	        this.fillCallback = fill;
	    }
	    static isAbortException(exception) {
	        return (
	        // DOMException
	        exception.name === 'AbortError' ||
	            // standard-ish non-DOM abort exception
	            //@ts-ignore
	            exception.code === 'ERR_ABORTED' ||
	            // stringified DOMException
	            exception.message === 'AbortError: aborted' ||
	            // stringified standard-ish exception
	            exception.message === 'Error: aborted');
	    }
	    evict(key, entry) {
	        if (this.cache.get(key) === entry) {
	            this.cache.delete(key);
	        }
	    }
	    fill(key, data, signal, statusCallback) {
	        const aborter = new AggregateAbortController_1.default();
	        const statusReporter = new AggregateStatusReporter_1.default();
	        statusReporter.addCallback(statusCallback);
	        const newEntry = {
	            aborter: aborter,
	            promise: this.fillCallback(data, aborter.signal, (message) => {
	                statusReporter.callback(message);
	            }),
	            settled: false,
	            statusReporter,
	            get aborted() {
	                return this.aborter.signal.aborted;
	            },
	        };
	        newEntry.aborter.addSignal(signal);
	        // remove the fill from the cache when its abortcontroller fires, if still in there
	        newEntry.aborter.signal.addEventListener('abort', () => {
	            if (!newEntry.settled) {
	                this.evict(key, newEntry);
	            }
	        });
	        // chain off the cached promise to record when it settles
	        newEntry.promise
	            .then(() => {
	            newEntry.settled = true;
	        }, () => {
	            newEntry.settled = true;
	            // if the fill throws an error (including abort) and is still in the cache, remove it
	            this.evict(key, newEntry);
	        })
	            .catch(e => {
	            // this will only be reached if there is some kind of
	            // bad bug in this library
	            console.error(e);
	            throw e;
	        });
	        this.cache.set(key, newEntry);
	    }
	    static checkSinglePromise(promise, signal) {
	        // check just this signal for having been aborted, and abort the
	        // promise if it was, regardless of what happened with the cached
	        // response
	        function checkForSingleAbort() {
	            if (signal && signal.aborted) {
	                throw Object.assign(new Error('aborted'), { code: 'ERR_ABORTED' });
	            }
	        }
	        return promise.then(result => {
	            checkForSingleAbort();
	            return result;
	        }, error => {
	            checkForSingleAbort();
	            throw error;
	        });
	    }
	    has(key) {
	        return this.cache.has(key);
	    }
	    /**
	     * Callback for getting status of the pending async
	     *
	     * @callback statusCallback
	     * @param {any} status, current status string or message object
	     */
	    /**
	     * @param {any} key cache key to use for this request
	     * @param {any} data data passed as the first argument to the fill callback
	     * @param {AbortSignal} [signal] optional AbortSignal object that aborts the request
	     * @param {statusCallback} a callback to get the current status of a pending async operation
	     */
	    get(key, data, signal, statusCallback) {
	        if (!signal && data instanceof abortcontroller_ponyfill_1.AbortSignal) {
	            throw new TypeError('second get argument appears to be an AbortSignal, perhaps you meant to pass `null` for the fill data?');
	        }
	        const cacheEntry = this.cache.get(key);
	        if (cacheEntry) {
	            if (cacheEntry.aborted && !cacheEntry.settled) {
	                // if it's aborted but has not realized it yet, evict it and redispatch
	                this.evict(key, cacheEntry);
	                return this.get(key, data, signal, statusCallback);
	            }
	            if (cacheEntry.settled) {
	                // too late to abort, just return it
	                return cacheEntry.promise;
	            }
	            // request is in-flight, add this signal to its list of signals,
	            // or if there is no signal, the aborter will become non-abortable
	            cacheEntry.aborter.addSignal(signal);
	            cacheEntry.statusReporter.addCallback(statusCallback);
	            return AbortablePromiseCache.checkSinglePromise(cacheEntry.promise, signal);
	        }
	        // if we got here, it is not in the cache. fill.
	        this.fill(key, data, signal, statusCallback);
	        return AbortablePromiseCache.checkSinglePromise(
	        //see https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-
	        //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	        this.cache.get(key).promise, signal);
	    }
	    /**
	     * delete the given entry from the cache. if it exists and its fill request has
	     * not yet settled, the fill will be signaled to abort.
	     *
	     * @param {any} key
	     */
	    delete(key) {
	        const cachedEntry = this.cache.get(key);
	        if (cachedEntry) {
	            if (!cachedEntry.settled) {
	                cachedEntry.aborter.abort();
	            }
	            this.cache.delete(key);
	        }
	    }
	    /**
	     * Clear all requests from the cache. Aborts any that have not settled.
	     * @returns {number} count of entries deleted
	     */
	    clear() {
	        // iterate without needing regenerator-runtime
	        const keyIter = this.cache.keys();
	        let deleteCount = 0;
	        for (let result = keyIter.next(); !result.done; result = keyIter.next()) {
	            this.delete(result.value);
	            deleteCount += 1;
	        }
	        return deleteCount;
	    }
	}
	AbortablePromiseCache$1.default = AbortablePromiseCache;

	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(esm, "__esModule", { value: true });
	const AbortablePromiseCache_1 = __importDefault(AbortablePromiseCache$1);
	var _default$2 = esm.default = AbortablePromiseCache_1.default;

	var QuickLRU$1 = {};

	// vendored from quick-lru@6.1.1, didn't like being compiled as a 'pure-esm' nodejs dependency
	// the license is reproduced below https://github.com/sindresorhus/quick-lru/blob/main/license
	// MIT License
	Object.defineProperty(QuickLRU$1, "__esModule", { value: true });
	// Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
	// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
	// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	class QuickLRU extends Map {
	    constructor(options = {}) {
	        super();
	        if (!(options.maxSize && options.maxSize > 0)) {
	            throw new TypeError('`maxSize` must be a number greater than 0');
	        }
	        if (typeof options.maxAge === 'number' && options.maxAge === 0) {
	            throw new TypeError('`maxAge` must be a number greater than 0');
	        }
	        // TODO: Use private class fields when ESLint supports them.
	        this.maxSize = options.maxSize;
	        this.maxAge = options.maxAge || Number.POSITIVE_INFINITY;
	        this.onEviction = options.onEviction;
	        this.cache = new Map();
	        this.oldCache = new Map();
	        this._size = 0;
	    }
	    // TODO: Use private class methods when targeting Node.js 16.
	    _emitEvictions(cache) {
	        if (typeof this.onEviction !== 'function') {
	            return;
	        }
	        for (const [key, item] of cache) {
	            this.onEviction(key, item.value);
	        }
	    }
	    _deleteIfExpired(key, item) {
	        if (typeof item.expiry === 'number' && item.expiry <= Date.now()) {
	            if (typeof this.onEviction === 'function') {
	                this.onEviction(key, item.value);
	            }
	            return this.delete(key);
	        }
	        return false;
	    }
	    _getOrDeleteIfExpired(key, item) {
	        const deleted = this._deleteIfExpired(key, item);
	        if (deleted === false) {
	            return item.value;
	        }
	    }
	    _getItemValue(key, item) {
	        return item.expiry ? this._getOrDeleteIfExpired(key, item) : item.value;
	    }
	    _peek(key, cache) {
	        const item = cache.get(key);
	        return this._getItemValue(key, item);
	    }
	    _set(key, value) {
	        this.cache.set(key, value);
	        this._size++;
	        if (this._size >= this.maxSize) {
	            this._size = 0;
	            this._emitEvictions(this.oldCache);
	            this.oldCache = this.cache;
	            this.cache = new Map();
	        }
	    }
	    _moveToRecent(key, item) {
	        this.oldCache.delete(key);
	        this._set(key, item);
	    }
	    *_entriesAscending() {
	        for (const item of this.oldCache) {
	            const [key, value] = item;
	            if (!this.cache.has(key)) {
	                const deleted = this._deleteIfExpired(key, value);
	                if (deleted === false) {
	                    yield item;
	                }
	            }
	        }
	        for (const item of this.cache) {
	            const [key, value] = item;
	            const deleted = this._deleteIfExpired(key, value);
	            if (deleted === false) {
	                yield item;
	            }
	        }
	    }
	    get(key) {
	        if (this.cache.has(key)) {
	            const item = this.cache.get(key);
	            return this._getItemValue(key, item);
	        }
	        if (this.oldCache.has(key)) {
	            const item = this.oldCache.get(key);
	            if (this._deleteIfExpired(key, item) === false) {
	                this._moveToRecent(key, item);
	                return item.value;
	            }
	        }
	    }
	    set(key, value, { maxAge = this.maxAge } = {}) {
	        const expiry = typeof maxAge === 'number' && maxAge !== Number.POSITIVE_INFINITY
	            ? Date.now() + maxAge
	            : undefined;
	        if (this.cache.has(key)) {
	            this.cache.set(key, {
	                value,
	                expiry,
	            });
	        }
	        else {
	            this._set(key, { value, expiry });
	        }
	    }
	    has(key) {
	        if (this.cache.has(key)) {
	            return !this._deleteIfExpired(key, this.cache.get(key));
	        }
	        if (this.oldCache.has(key)) {
	            return !this._deleteIfExpired(key, this.oldCache.get(key));
	        }
	        return false;
	    }
	    peek(key) {
	        if (this.cache.has(key)) {
	            return this._peek(key, this.cache);
	        }
	        if (this.oldCache.has(key)) {
	            return this._peek(key, this.oldCache);
	        }
	    }
	    delete(key) {
	        const deleted = this.cache.delete(key);
	        if (deleted) {
	            this._size--;
	        }
	        return this.oldCache.delete(key) || deleted;
	    }
	    clear() {
	        this.cache.clear();
	        this.oldCache.clear();
	        this._size = 0;
	    }
	    resize(newSize) {
	        if (!(newSize && newSize > 0)) {
	            throw new TypeError('`maxSize` must be a number greater than 0');
	        }
	        const items = [...this._entriesAscending()];
	        const removeCount = items.length - newSize;
	        if (removeCount < 0) {
	            this.cache = new Map(items);
	            this.oldCache = new Map();
	            this._size = items.length;
	        }
	        else {
	            if (removeCount > 0) {
	                this._emitEvictions(items.slice(0, removeCount));
	            }
	            this.oldCache = new Map(items.slice(removeCount));
	            this.cache = new Map();
	            this._size = 0;
	        }
	        this.maxSize = newSize;
	    }
	    *keys() {
	        for (const [key] of this) {
	            yield key;
	        }
	    }
	    *values() {
	        for (const [, value] of this) {
	            yield value;
	        }
	    }
	    *[Symbol.iterator]() {
	        for (const item of this.cache) {
	            const [key, value] = item;
	            const deleted = this._deleteIfExpired(key, value);
	            if (deleted === false) {
	                yield [key, value.value];
	            }
	        }
	        for (const item of this.oldCache) {
	            const [key, value] = item;
	            if (!this.cache.has(key)) {
	                const deleted = this._deleteIfExpired(key, value);
	                if (deleted === false) {
	                    yield [key, value.value];
	                }
	            }
	        }
	    }
	    *entriesDescending() {
	        let items = [...this.cache];
	        for (let i = items.length - 1; i >= 0; --i) {
	            const item = items[i];
	            const [key, value] = item;
	            const deleted = this._deleteIfExpired(key, value);
	            if (deleted === false) {
	                yield [key, value.value];
	            }
	        }
	        items = [...this.oldCache];
	        for (let i = items.length - 1; i >= 0; --i) {
	            const item = items[i];
	            const [key, value] = item;
	            if (!this.cache.has(key)) {
	                const deleted = this._deleteIfExpired(key, value);
	                if (deleted === false) {
	                    yield [key, value.value];
	                }
	            }
	        }
	    }
	    *entriesAscending() {
	        for (const [key, value] of this._entriesAscending()) {
	            yield [key, value.value];
	        }
	    }
	    get size() {
	        if (!this._size) {
	            return this.oldCache.size;
	        }
	        let oldCacheSize = 0;
	        for (const key of this.oldCache.keys()) {
	            if (!this.cache.has(key)) {
	                oldCacheSize++;
	            }
	        }
	        return Math.min(this._size + oldCacheSize, this.maxSize);
	    }
	    entries() {
	        return this.entriesAscending();
	    }
	    forEach(callbackFunction, thisArgument = this) {
	        for (const [key, value] of this.entriesAscending()) {
	            callbackFunction.call(thisArgument, value, key, this);
	        }
	    }
	    get [Symbol.toStringTag]() {
	        return JSON.stringify([...this.entriesAscending()]);
	    }
	}
	var _default$1 = QuickLRU$1.default = QuickLRU;

	class GDCAdapter extends BaseAdapter.BaseFeatureDataAdapter {
	    filters;
	    cases;
	    size;
	    featureType;
	    static capabilities = ['getFeatures', 'getRefNames'];
	    featureCache = new _default$2({
	        cache: new _default$1({ maxSize: 200 }),
	        fill: async (query, abortSignal) => {
	            return this.fetchFeatures(query, abortSignal);
	        },
	    });
	    async fetchFeatures(query, signal) {
	        const response = await fetch('https://api.gdc.cancer.gov/v0/graphql', {
	            method: 'POST',
	            headers: { 'content-type': 'application/json' },
	            body: JSON.stringify(query),
	            signal,
	        });
	        if (!response.ok) {
	            throw new Error(`Failed to fetch ${response.status} ${response.statusText}`);
	        }
	        return response.json();
	    }
	    constructor(config) {
	        super(config);
	        const filters = configuration.readConfObject(config, 'filters');
	        const cases = configuration.readConfObject(config, 'cases');
	        const size = configuration.readConfObject(config, 'size');
	        const featureType = configuration.readConfObject(config, 'featureType');
	        this.filters = filters;
	        this.cases = cases;
	        this.size = size;
	        this.featureType = featureType;
	    }
	    async getRefNames() {
	        return [
	            'chr1',
	            'chr10',
	            'chr11',
	            'chr12',
	            'chr13',
	            'chr14',
	            'chr15',
	            'chr16',
	            'chr17',
	            'chr18',
	            'chr19',
	            'chr2',
	            'chr20',
	            'chr21',
	            'chr22',
	            'chr3',
	            'chr4',
	            'chr5',
	            'chr6',
	            'chr7',
	            'chr8',
	            'chr9',
	            'chrX',
	            'chrY',
	        ];
	    }
	    getFeatures(region, opts = {}) {
	        const { refName, start, end } = region;
	        return rxjs.ObservableCreate(async (observer) => {
	            try {
	                let query = {};
	                let idField = 'ssmId';
	                switch (this.featureType) {
	                    case 'mutation': {
	                        query = this.createMutationQuery(refName.replace(/chr/, ''), start, end);
	                        idField = 'ssmId';
	                        break;
	                    }
	                    case 'gene': {
	                        query = this.createGeneQuery(refName.replace(/chr/, ''), start, end);
	                        idField = 'geneId';
	                        break;
	                    }
	                    default: {
	                        observer.error(`Not a valid type: ${this.featureType}`);
	                    }
	                }
	                const result = await this.featureCache.get(JSON.stringify(query), query, opts.signal);
	                const queryResults = result.data.viewer.explore.features.hits.edges;
	                if (this.featureType === 'mutation') {
	                    const cohortCount = result.data.viewer.explore.filteredCases.hits.total;
	                    const denom = Math.ceil(Math.log10(cohortCount));
	                    for (const hit of queryResults) {
	                        const gdcObject = hit.node;
	                        gdcObject.numOfCasesInCohort = cohortCount;
	                        gdcObject.percentage =
	                            (100 * Math.log10(gdcObject.score)) / denom + 100;
	                        gdcObject.occurrenceInCohort = `${gdcObject.score} / ${cohortCount}`;
	                        const feature = new GDCFeature({
	                            gdcObject,
	                            id: gdcObject[idField],
	                            featureType: this.featureType,
	                        });
	                        observer.next(feature);
	                    }
	                }
	                else {
	                    for (const hit of queryResults) {
	                        const gdcObject = hit.node;
	                        gdcObject.strand = gdcObject.geneStrand;
	                        gdcObject.id = gdcObject[idField];
	                        const feature = new GDCFeature({
	                            gdcObject,
	                            id: gdcObject[idField],
	                            featureType: this.featureType,
	                        });
	                        observer.next(feature);
	                    }
	                }
	            }
	            catch (e) {
	                observer.error(e);
	            }
	            observer.complete();
	        }, opts.signal);
	    }
	    freeResources() { }
	    /**
	     * Create a GraphQL query for GDC mutations
	     * @param ref - chromosome reference
	     * @param start - start position
	     * @param end - end position
	     */
	    createMutationQuery(ref, start, end) {
	        const ssmQuery = `query mutationsQuery( $size: Int $offset: Int $filters: FiltersArgument $filtersWithoutLocation: FiltersArgument $score: String $sort: [Sort] ) { viewer { explore { filteredCases: cases { hits(first: 0, filters: $filtersWithoutLocation) { total } } features: ssms { hits(first: $size, offset: $offset, filters: $filters, score: $score, sort: $sort) { total edges { node { score startPosition: start_position endPosition: end_position mutationType: mutation_type cosmicId: cosmic_id referenceAllele: reference_allele ncbiBuild: ncbi_build genomicDnaChange: genomic_dna_change mutationSubtype: mutation_subtype ssmId: ssm_id chromosome consequence { hits { edges { node { transcript { is_canonical annotation { vep_impact polyphen_impact polyphen_score sift_score sift_impact hgvsc } consequence_type gene { gene_id symbol gene_strand } aa_change transcript_id } id } } } } } } } } } } }`;
	        const combinedFilters = this.getFilterQuery(ref, start, end, false);
	        const filtersNoLocation = this.getFilterQuery(ref, start, end, true);
	        const body = {
	            query: ssmQuery,
	            variables: {
	                size: this.size ? this.size : 5000,
	                offset: 0,
	                filters: combinedFilters,
	                filtersWithoutLocation: filtersNoLocation,
	                score: 'occurrence.case.project.project_id',
	                sort: [
	                    { field: '_score', order: 'desc' },
	                    { field: '_uid', order: 'asc' },
	                ],
	            },
	        };
	        return body;
	    }
	    /**
	     * Create a GraphQL query for GDC genes
	     * @param ref - chromosome reference
	     * @param start - start position
	     * @param end - end position
	     */
	    createGeneQuery(ref, start, end) {
	        const geneQuery = `query genesQuery( $filters: FiltersArgument $size: Int $offset: Int $score: String ) { viewer { explore { features: genes { hits(first: $size, offset: $offset, filters: $filters, score: $score) { total edges { node { geneId: gene_id id geneStrand: gene_strand synonyms symbol name geneStart: gene_start geneEnd: gene_end geneChromosome: gene_chromosome description canonicalTranscriptId: canonical_transcript_id externalDbIds: external_db_ids { hgnc omimGene: omim_gene uniprotkbSwissprot: uniprotkb_swissprot entrezGene: entrez_gene } biotype isCancerGeneCensus: is_cancer_gene_census } } } } } } }`;
	        const combinedFilters = this.getFilterQuery(ref, start, end, false);
	        const body = {
	            query: geneQuery,
	            variables: {
	                filters: combinedFilters,
	                size: this.size ? this.size : 5000,
	                offset: 0,
	                score: 'case.project.project_id',
	            },
	        };
	        return body;
	    }
	    /**
	     * Create the full filter based on the given filter, location and case(s)
	     * @param chr - chromosome (ex. 1)
	     * @param start - start position
	     * @param end - end position
	     */
	    getFilterQuery(chr, start, end, skipLocation) {
	        const resultingFilterQuery = {
	            op: 'and',
	            content: [
	                this.addLocationAndCasesToFilter(chr, start, end, skipLocation),
	            ],
	        };
	        const filterObject = JSON.parse(this.filters);
	        if (filterObject && Object.keys(filterObject).length > 0) {
	            resultingFilterQuery.content.push(filterObject);
	        }
	        return resultingFilterQuery;
	    }
	    /**
	     * Create a filter for the current visible location and case(s)
	     * @param chr - chromosome (ex. 1)
	     * @param start - start position
	     * @param end - end position
	     */
	    addLocationAndCasesToFilter(chr, start, end, skipLocation) {
	        // eslint-disable-next-line @typescript-eslint/no-explicit-any
	        let locationFilter;
	        if (!skipLocation) {
	            switch (this.featureType) {
	                case 'mutation': {
	                    locationFilter = {
	                        op: 'and',
	                        content: [
	                            {
	                                op: '<=',
	                                content: { field: 'ssms.start_position', value: end },
	                            },
	                            {
	                                op: '>=',
	                                content: { field: 'ssms.end_position', value: start },
	                            },
	                            {
	                                op: '=',
	                                content: { field: 'ssms.chromosome', value: [`chr${chr}`] },
	                            },
	                        ],
	                    };
	                    break;
	                }
	                case 'gene': {
	                    locationFilter = {
	                        op: 'and',
	                        content: [
	                            {
	                                op: '<=',
	                                content: { field: 'genes.gene_start', value: end },
	                            },
	                            { op: '>=', content: { field: 'genes.gene_end', value: start } },
	                            {
	                                op: '=',
	                                content: { field: 'genes.gene_chromosome', value: [chr] },
	                            },
	                        ],
	                    };
	                    break;
	                }
	                default:
	                    throw new Error(`invalid featureType ${this.featureType}`);
	            }
	        }
	        else {
	            locationFilter = {
	                op: 'and',
	                content: [
	                    {
	                        op: 'in',
	                        content: {
	                            field: 'available_variation_data',
	                            value: ['ssm'],
	                        },
	                    },
	                ],
	            };
	        }
	        if (this.cases && this.cases.length > 0) {
	            const caseFilter = {
	                op: 'in',
	                content: { field: 'cases.case_id', value: this.cases },
	            };
	            locationFilter.content.push(caseFilter);
	        }
	        return locationFilter;
	    }
	}

	var segmentCnvConfigSchema = configuration.ConfigurationSchema('SegmentCNVAdapter', {
	    segLocation: {
	        type: 'fileLocation',
	        defaultValue: { uri: '/path/to/myfile.seg', locationType: 'UriLocation' },
	    },
	}, { explicitlyTyped: true });

	var simpleFeature = {};

	Object.defineProperty(simpleFeature, "__esModule", { value: true });
	simpleFeature.isFeature = void 0;
	function isFeature(thing) {
	    return (typeof thing === 'object' &&
	        thing !== null &&
	        typeof thing.get === 'function' &&
	        typeof thing.id === 'function');
	}
	simpleFeature.isFeature = isFeature;
	function isSimpleFeatureSerialized(args) {
	    return 'uniqueId' in args && typeof args.data !== 'object';
	}
	/**
	 * Simple implementation of a feature object.
	 */
	class SimpleFeature {
	    /**
	     * @param args - SimpleFeature args
	     *
	     * Note: args.data.subfeatures can be an array of these same args,
	     * which will be inflated to more instances of this class.
	     */
	    constructor(args) {
	        var _a;
	        if (isSimpleFeatureSerialized(args)) {
	            this.data = args;
	        }
	        else {
	            this.data = args.data || {};
	            // load handle from args.parent (not args.data.parent)
	            // this reason is because if args is an object, it likely isn't properly loaded with
	            // parent as a Feature reference (probably a raw parent ID or something instead)
	            this.parentHandle = args.parent;
	        }
	        // the feature id comes from
	        // args.id, args.data.uniqueId, or args.uniqueId due to this initialization
	        const id = isSimpleFeatureSerialized(args) ? args.uniqueId : args.id;
	        if (id === undefined || id === null) {
	            throw new Error('SimpleFeature requires a unique `id` or `data.uniqueId` attribute');
	        }
	        this.uniqueId = String(id);
	        if (!(this.data.aliases || this.data.end - this.data.start >= 0)) {
	            throw new Error(`invalid feature data, end less than start. end: ${this.data.end} start: ${this.data.start}`);
	        }
	        if (this.data.subfeatures) {
	            this.subfeatures = (_a = this.data.subfeatures) === null || _a === void 0 ? void 0 : _a.map(
	            // eslint-disable-next-line @typescript-eslint/no-explicit-any
	            (f, i) => typeof f.get !== 'function'
	                ? new SimpleFeature({
	                    id: f.uniqueId || `${id}-${i}`,
	                    data: {
	                        strand: this.data.strand,
	                        ...f,
	                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
	                    },
	                    parent: this,
	                })
	                : f);
	        }
	    }
	    /**
	     * Get a piece of data about the feature.  All features must have
	     * 'start' and 'end', but everything else is optional.
	     */
	    // eslint-disable-next-line @typescript-eslint/no-explicit-any
	    get(name) {
	        return name === 'subfeatures'
	            ? this.subfeatures
	            : name === 'parent'
	                ? this.parent()
	                : this.data[name];
	    }
	    /**
	     * Set an item of data.
	     */
	    // eslint-disable-next-line @typescript-eslint/no-explicit-any
	    set(name, val) {
	        this.data[name] = val;
	    }
	    /**
	     * Get an array listing which data keys are present in this feature.
	     */
	    tags() {
	        return Object.keys(this.data);
	    }
	    /**
	     * Get the unique ID of this feature.
	     */
	    id() {
	        return this.uniqueId;
	    }
	    /**
	     * Get this feature's parent feature, or undefined if none.
	     */
	    parent() {
	        return this.parentHandle;
	    }
	    /**
	     * Get an array of child features, or undefined if none.
	     */
	    children() {
	        return this.get('subfeatures');
	    }
	    toJSON() {
	        const d = { ...this.data, uniqueId: this.id() };
	        const p = this.parent();
	        if (p) {
	            d.parentId = p.id();
	        }
	        const c = this.children();
	        if (c) {
	            d.subfeatures = c.map(child => child.toJSON());
	        }
	        return d;
	    }
	    static fromJSON(json) {
	        return new SimpleFeature({ ...json });
	    }
	}
	var _default = simpleFeature.default = SimpleFeature;

	class SegmentCNVAdapter extends BaseAdapter.BaseFeatureDataAdapter {
	    static capabilities = ['getFeatures', 'getRefNames'];
	    setupP;
	    async readSeg() {
	        const segLocation = configuration.readConfObject(this.config, 'segLocation');
	        const fileContents = await io.openLocation(segLocation, this.pluginManager).readFile('utf8');
	        const lines = fileContents.split('\n');
	        const refNames = [];
	        const rows = [];
	        let columns = [];
	        let refNameColumnIndex = 0;
	        lines.forEach(line => {
	            if (columns.length === 0) {
	                columns = line.split('\t');
	                refNameColumnIndex = columns.findIndex(element => element.toLowerCase() === 'chromosome');
	            }
	            else {
	                if (line.split('\t')[refNameColumnIndex] !== undefined) {
	                    rows.push(line);
	                    refNames.push(line.split('\t')[refNameColumnIndex]);
	                }
	            }
	        });
	        return {
	            lines: rows,
	            columns,
	            refNames: Array.from(new Set(refNames)),
	        };
	    }
	    parseLine(line, columns) {
	        const segment = {};
	        line.split('\t').forEach((property, i) => {
	            if (property) {
	                if (i === 0) {
	                    segment.id = property;
	                }
	                else {
	                    // some SEG files have different data, this logic is to ensure that
	                    // we don't need special colouring functions to accomodate for those
	                    // differences...mean and copy number indicate the track colouring
	                    if (columns[i].toLowerCase() === 'segment_mean' ||
	                        columns[i].toLowerCase() === 'copy_number') {
	                        segment.score = +property;
	                    }
	                    segment[columns[i].toLowerCase()] = property;
	                }
	            }
	        });
	        return segment;
	    }
	    async getLines() {
	        const { columns, lines } = await this.readSeg();
	        return lines.map(line => {
	            const segment = this.parseLine(line, columns);
	            return new _default({
	                ...segment,
	                uniqueId: segment.id,
	                id: segment.id,
	                start: +segment.start,
	                end: +segment.end,
	                refName: segment.chromosome,
	                score: +segment.score,
	            });
	        });
	    }
	    async setup() {
	        if (!this.setupP) {
	            this.setupP = this.getLines();
	        }
	        return this.setupP;
	    }
	    async getRefNames(_ = {}) {
	        const { refNames } = await this.readSeg();
	        return refNames;
	    }
	    getFeatures(region, opts = {}) {
	        return rxjs.ObservableCreate(async (observer) => {
	            const feats = await this.setup();
	            feats.forEach(f => {
	                if (f.get('refName') === region.refName &&
	                    f.get('end') > region.start &&
	                    f.get('start') < region.end) {
	                    observer.next(f);
	                }
	            });
	            observer.complete();
	        }, opts.signal);
	    }
	    freeResources() { }
	}

	var mafConfigSchema = configuration.ConfigurationSchema('MafAdapter', {
	    mafLocation: {
	        type: 'fileLocation',
	        defaultValue: { uri: '/path/to/myfile.maf', locationType: 'UriLocation' },
	    },
	}, { explicitlyTyped: true });

	class MafFeature {
	    mutation;
	    data;
	    _id;
	    constructor(args) {
	        this.mutation = args.mutation;
	        this.data = this.dataFromMutation(this.mutation);
	        this._id = args.id;
	    }
	    get(field) {
	        return this.data[field] || this.mutation[field];
	    }
	    set() { }
	    parent() {
	        return undefined;
	    }
	    children() {
	        return undefined;
	    }
	    tags() {
	        const t = [...Object.keys(this.data), ...Object.keys(this.mutation)];
	        return t;
	    }
	    id() {
	        return this._id;
	    }
	    dataFromMutation(mutation) {
	        const featureData = {
	            refName: mutation.chromosome,
	            start: +mutation.start_position - 1,
	            end: +mutation.end_position,
	            name: `${mutation.chromosome}:g.${mutation.start_position}${mutation.tumor_seq_allele1}>${mutation.tumor_seq_allele2}`,
	            note: mutation.hgvsc,
	            //score: +mutation.score,
	        };
	        return featureData;
	    }
	    toJSON() {
	        return {
	            uniqueId: this._id,
	            ...this.mutation,
	            ...this.data,
	        };
	    }
	}

	/*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */
	// (C) 1995-2013 Jean-loup Gailly and Mark Adler
	// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
	//
	// This software is provided 'as-is', without any express or implied
	// warranty. In no event will the authors be held liable for any damages
	// arising from the use of this software.
	//
	// Permission is granted to anyone to use this software for any purpose,
	// including commercial applications, and to alter it and redistribute it
	// freely, subject to the following restrictions:
	//
	// 1. The origin of this software must not be misrepresented; you must not
	//   claim that you wrote the original software. If you use this software
	//   in a product, an acknowledgment in the product documentation would be
	//   appreciated but is not required.
	// 2. Altered source versions must be plainly marked as such, and must not be
	//   misrepresented as being the original software.
	// 3. This notice may not be removed or altered from any source distribution.

	/* eslint-disable space-unary-ops */

	/* Public constants ==========================================================*/
	/* ===========================================================================*/


	//const Z_FILTERED          = 1;
	//const Z_HUFFMAN_ONLY      = 2;
	//const Z_RLE               = 3;
	const Z_FIXED$1               = 4;
	//const Z_DEFAULT_STRATEGY  = 0;

	/* Possible values of the data_type field (though see inflate()) */
	const Z_BINARY              = 0;
	const Z_TEXT                = 1;
	//const Z_ASCII             = 1; // = Z_TEXT
	const Z_UNKNOWN$1             = 2;

	/*============================================================================*/


	function zero$1(buf) { let len = buf.length; while (--len >= 0) { buf[len] = 0; } }

	// From zutil.h

	const STORED_BLOCK = 0;
	const STATIC_TREES = 1;
	const DYN_TREES    = 2;
	/* The three kinds of block type */

	const MIN_MATCH$1    = 3;
	const MAX_MATCH$1    = 258;
	/* The minimum and maximum match lengths */

	// From deflate.h
	/* ===========================================================================
	 * Internal compression state.
	 */

	const LENGTH_CODES$1  = 29;
	/* number of length codes, not counting the special END_BLOCK code */

	const LITERALS$1      = 256;
	/* number of literal bytes 0..255 */

	const L_CODES$1       = LITERALS$1 + 1 + LENGTH_CODES$1;
	/* number of Literal or Length codes, including the END_BLOCK code */

	const D_CODES$1       = 30;
	/* number of distance codes */

	const BL_CODES$1      = 19;
	/* number of codes used to transfer the bit lengths */

	const HEAP_SIZE$1     = 2 * L_CODES$1 + 1;
	/* maximum heap size */

	const MAX_BITS$1      = 15;
	/* All codes must not exceed MAX_BITS bits */

	const Buf_size      = 16;
	/* size of bit buffer in bi_buf */


	/* ===========================================================================
	 * Constants
	 */

	const MAX_BL_BITS = 7;
	/* Bit length codes must not exceed MAX_BL_BITS bits */

	const END_BLOCK   = 256;
	/* end of block literal code */

	const REP_3_6     = 16;
	/* repeat previous bit length 3-6 times (2 bits of repeat count) */

	const REPZ_3_10   = 17;
	/* repeat a zero length 3-10 times  (3 bits of repeat count) */

	const REPZ_11_138 = 18;
	/* repeat a zero length 11-138 times  (7 bits of repeat count) */

	/* eslint-disable comma-spacing,array-bracket-spacing */
	const extra_lbits =   /* extra bits for each length code */
	  new Uint8Array([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0]);

	const extra_dbits =   /* extra bits for each distance code */
	  new Uint8Array([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13]);

	const extra_blbits =  /* extra bits for each bit length code */
	  new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7]);

	const bl_order =
	  new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);
	/* eslint-enable comma-spacing,array-bracket-spacing */

	/* The lengths of the bit length codes are sent in order of decreasing
	 * probability, to avoid transmitting the lengths for unused bit length codes.
	 */

	/* ===========================================================================
	 * Local data. These are initialized only once.
	 */

	// We pre-fill arrays with 0 to avoid uninitialized gaps

	const DIST_CODE_LEN = 512; /* see definition of array dist_code below */

	// !!!! Use flat array instead of structure, Freq = i*2, Len = i*2+1
	const static_ltree  = new Array((L_CODES$1 + 2) * 2);
	zero$1(static_ltree);
	/* The static literal tree. Since the bit lengths are imposed, there is no
	 * need for the L_CODES extra codes used during heap construction. However
	 * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
	 * below).
	 */

	const static_dtree  = new Array(D_CODES$1 * 2);
	zero$1(static_dtree);
	/* The static distance tree. (Actually a trivial tree since all codes use
	 * 5 bits.)
	 */

	const _dist_code    = new Array(DIST_CODE_LEN);
	zero$1(_dist_code);
	/* Distance codes. The first 256 values correspond to the distances
	 * 3 .. 258, the last 256 values correspond to the top 8 bits of
	 * the 15 bit distances.
	 */

	const _length_code  = new Array(MAX_MATCH$1 - MIN_MATCH$1 + 1);
	zero$1(_length_code);
	/* length code for each normalized match length (0 == MIN_MATCH) */

	const base_length   = new Array(LENGTH_CODES$1);
	zero$1(base_length);
	/* First normalized length for each code (0 = MIN_MATCH) */

	const base_dist     = new Array(D_CODES$1);
	zero$1(base_dist);
	/* First normalized distance for each code (0 = distance of 1) */


	function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {

	  this.static_tree  = static_tree;  /* static tree or NULL */
	  this.extra_bits   = extra_bits;   /* extra bits for each code or NULL */
	  this.extra_base   = extra_base;   /* base index for extra_bits */
	  this.elems        = elems;        /* max number of elements in the tree */
	  this.max_length   = max_length;   /* max bit length for the codes */

	  // show if `static_tree` has data or dummy - needed for monomorphic objects
	  this.has_stree    = static_tree && static_tree.length;
	}


	let static_l_desc;
	let static_d_desc;
	let static_bl_desc;


	function TreeDesc(dyn_tree, stat_desc) {
	  this.dyn_tree = dyn_tree;     /* the dynamic tree */
	  this.max_code = 0;            /* largest code with non zero frequency */
	  this.stat_desc = stat_desc;   /* the corresponding static tree */
	}



	const d_code = (dist) => {

	  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
	};


	/* ===========================================================================
	 * Output a short LSB first on the stream.
	 * IN assertion: there is enough room in pendingBuf.
	 */
	const put_short = (s, w) => {
	//    put_byte(s, (uch)((w) & 0xff));
	//    put_byte(s, (uch)((ush)(w) >> 8));
	  s.pending_buf[s.pending++] = (w) & 0xff;
	  s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
	};


	/* ===========================================================================
	 * Send a value on a given number of bits.
	 * IN assertion: length <= 16 and value fits in length bits.
	 */
	const send_bits = (s, value, length) => {

	  if (s.bi_valid > (Buf_size - length)) {
	    s.bi_buf |= (value << s.bi_valid) & 0xffff;
	    put_short(s, s.bi_buf);
	    s.bi_buf = value >> (Buf_size - s.bi_valid);
	    s.bi_valid += length - Buf_size;
	  } else {
	    s.bi_buf |= (value << s.bi_valid) & 0xffff;
	    s.bi_valid += length;
	  }
	};


	const send_code = (s, c, tree) => {

	  send_bits(s, tree[c * 2]/*.Code*/, tree[c * 2 + 1]/*.Len*/);
	};


	/* ===========================================================================
	 * Reverse the first len bits of a code, using straightforward code (a faster
	 * method would use a table)
	 * IN assertion: 1 <= len <= 15
	 */
	const bi_reverse = (code, len) => {

	  let res = 0;
	  do {
	    res |= code & 1;
	    code >>>= 1;
	    res <<= 1;
	  } while (--len > 0);
	  return res >>> 1;
	};


	/* ===========================================================================
	 * Flush the bit buffer, keeping at most 7 bits in it.
	 */
	const bi_flush = (s) => {

	  if (s.bi_valid === 16) {
	    put_short(s, s.bi_buf);
	    s.bi_buf = 0;
	    s.bi_valid = 0;

	  } else if (s.bi_valid >= 8) {
	    s.pending_buf[s.pending++] = s.bi_buf & 0xff;
	    s.bi_buf >>= 8;
	    s.bi_valid -= 8;
	  }
	};


	/* ===========================================================================
	 * Compute the optimal bit lengths for a tree and update the total bit length
	 * for the current block.
	 * IN assertion: the fields freq and dad are set, heap[heap_max] and
	 *    above are the tree nodes sorted by increasing frequency.
	 * OUT assertions: the field len is set to the optimal bit length, the
	 *     array bl_count contains the frequencies for each bit length.
	 *     The length opt_len is updated; static_len is also updated if stree is
	 *     not null.
	 */
	const gen_bitlen = (s, desc) => {
	//    deflate_state *s;
	//    tree_desc *desc;    /* the tree descriptor */

	  const tree            = desc.dyn_tree;
	  const max_code        = desc.max_code;
	  const stree           = desc.stat_desc.static_tree;
	  const has_stree       = desc.stat_desc.has_stree;
	  const extra           = desc.stat_desc.extra_bits;
	  const base            = desc.stat_desc.extra_base;
	  const max_length      = desc.stat_desc.max_length;
	  let h;              /* heap index */
	  let n, m;           /* iterate over the tree elements */
	  let bits;           /* bit length */
	  let xbits;          /* extra bits */
	  let f;              /* frequency */
	  let overflow = 0;   /* number of elements with bit length too large */

	  for (bits = 0; bits <= MAX_BITS$1; bits++) {
	    s.bl_count[bits] = 0;
	  }

	  /* In a first pass, compute the optimal bit lengths (which may
	   * overflow in the case of the bit length tree).
	   */
	  tree[s.heap[s.heap_max] * 2 + 1]/*.Len*/ = 0; /* root of the heap */

	  for (h = s.heap_max + 1; h < HEAP_SIZE$1; h++) {
	    n = s.heap[h];
	    bits = tree[tree[n * 2 + 1]/*.Dad*/ * 2 + 1]/*.Len*/ + 1;
	    if (bits > max_length) {
	      bits = max_length;
	      overflow++;
	    }
	    tree[n * 2 + 1]/*.Len*/ = bits;
	    /* We overwrite tree[n].Dad which is no longer needed */

	    if (n > max_code) { continue; } /* not a leaf node */

	    s.bl_count[bits]++;
	    xbits = 0;
	    if (n >= base) {
	      xbits = extra[n - base];
	    }
	    f = tree[n * 2]/*.Freq*/;
	    s.opt_len += f * (bits + xbits);
	    if (has_stree) {
	      s.static_len += f * (stree[n * 2 + 1]/*.Len*/ + xbits);
	    }
	  }
	  if (overflow === 0) { return; }

	  // Tracev((stderr,"\nbit length overflow\n"));
	  /* This happens for example on obj2 and pic of the Calgary corpus */

	  /* Find the first bit length which could increase: */
	  do {
	    bits = max_length - 1;
	    while (s.bl_count[bits] === 0) { bits--; }
	    s.bl_count[bits]--;      /* move one leaf down the tree */
	    s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
	    s.bl_count[max_length]--;
	    /* The brother of the overflow item also moves one step up,
	     * but this does not affect bl_count[max_length]
	     */
	    overflow -= 2;
	  } while (overflow > 0);

	  /* Now recompute all bit lengths, scanning in increasing frequency.
	   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
	   * lengths instead of fixing only the wrong ones. This idea is taken
	   * from 'ar' written by Haruhiko Okumura.)
	   */
	  for (bits = max_length; bits !== 0; bits--) {
	    n = s.bl_count[bits];
	    while (n !== 0) {
	      m = s.heap[--h];
	      if (m > max_code) { continue; }
	      if (tree[m * 2 + 1]/*.Len*/ !== bits) {
	        // Tracev((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
	        s.opt_len += (bits - tree[m * 2 + 1]/*.Len*/) * tree[m * 2]/*.Freq*/;
	        tree[m * 2 + 1]/*.Len*/ = bits;
	      }
	      n--;
	    }
	  }
	};


	/* ===========================================================================
	 * Generate the codes for a given tree and bit counts (which need not be
	 * optimal).
	 * IN assertion: the array bl_count contains the bit length statistics for
	 * the given tree and the field len is set for all tree elements.
	 * OUT assertion: the field code is set for all tree elements of non
	 *     zero code length.
	 */
	const gen_codes = (tree, max_code, bl_count) => {
	//    ct_data *tree;             /* the tree to decorate */
	//    int max_code;              /* largest code with non zero frequency */
	//    ushf *bl_count;            /* number of codes at each bit length */

	  const next_code = new Array(MAX_BITS$1 + 1); /* next code value for each bit length */
	  let code = 0;              /* running code value */
	  let bits;                  /* bit index */
	  let n;                     /* code index */

	  /* The distribution counts are first used to generate the code values
	   * without bit reversal.
	   */
	  for (bits = 1; bits <= MAX_BITS$1; bits++) {
	    code = (code + bl_count[bits - 1]) << 1;
	    next_code[bits] = code;
	  }
	  /* Check that the bit counts in bl_count are consistent. The last code
	   * must be all ones.
	   */
	  //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
	  //        "inconsistent bit counts");
	  //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

	  for (n = 0;  n <= max_code; n++) {
	    let len = tree[n * 2 + 1]/*.Len*/;
	    if (len === 0) { continue; }
	    /* Now reverse the bits */
	    tree[n * 2]/*.Code*/ = bi_reverse(next_code[len]++, len);

	    //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
	    //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
	  }
	};


	/* ===========================================================================
	 * Initialize the various 'constant' tables.
	 */
	const tr_static_init = () => {

	  let n;        /* iterates over tree elements */
	  let bits;     /* bit counter */
	  let length;   /* length value */
	  let code;     /* code value */
	  let dist;     /* distance index */
	  const bl_count = new Array(MAX_BITS$1 + 1);
	  /* number of codes at each bit length for an optimal tree */

	  // do check in _tr_init()
	  //if (static_init_done) return;

	  /* For some embedded targets, global variables are not initialized: */
	/*#ifdef NO_INIT_GLOBAL_POINTERS
	  static_l_desc.static_tree = static_ltree;
	  static_l_desc.extra_bits = extra_lbits;
	  static_d_desc.static_tree = static_dtree;
	  static_d_desc.extra_bits = extra_dbits;
	  static_bl_desc.extra_bits = extra_blbits;
	#endif*/

	  /* Initialize the mapping length (0..255) -> length code (0..28) */
	  length = 0;
	  for (code = 0; code < LENGTH_CODES$1 - 1; code++) {
	    base_length[code] = length;
	    for (n = 0; n < (1 << extra_lbits[code]); n++) {
	      _length_code[length++] = code;
	    }
	  }
	  //Assert (length == 256, "tr_static_init: length != 256");
	  /* Note that the length 255 (match length 258) can be represented
	   * in two different ways: code 284 + 5 bits or code 285, so we
	   * overwrite length_code[255] to use the best encoding:
	   */
	  _length_code[length - 1] = code;

	  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
	  dist = 0;
	  for (code = 0; code < 16; code++) {
	    base_dist[code] = dist;
	    for (n = 0; n < (1 << extra_dbits[code]); n++) {
	      _dist_code[dist++] = code;
	    }
	  }
	  //Assert (dist == 256, "tr_static_init: dist != 256");
	  dist >>= 7; /* from now on, all distances are divided by 128 */
	  for (; code < D_CODES$1; code++) {
	    base_dist[code] = dist << 7;
	    for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
	      _dist_code[256 + dist++] = code;
	    }
	  }
	  //Assert (dist == 256, "tr_static_init: 256+dist != 512");

	  /* Construct the codes of the static literal tree */
	  for (bits = 0; bits <= MAX_BITS$1; bits++) {
	    bl_count[bits] = 0;
	  }

	  n = 0;
	  while (n <= 143) {
	    static_ltree[n * 2 + 1]/*.Len*/ = 8;
	    n++;
	    bl_count[8]++;
	  }
	  while (n <= 255) {
	    static_ltree[n * 2 + 1]/*.Len*/ = 9;
	    n++;
	    bl_count[9]++;
	  }
	  while (n <= 279) {
	    static_ltree[n * 2 + 1]/*.Len*/ = 7;
	    n++;
	    bl_count[7]++;
	  }
	  while (n <= 287) {
	    static_ltree[n * 2 + 1]/*.Len*/ = 8;
	    n++;
	    bl_count[8]++;
	  }
	  /* Codes 286 and 287 do not exist, but we must include them in the
	   * tree construction to get a canonical Huffman tree (longest code
	   * all ones)
	   */
	  gen_codes(static_ltree, L_CODES$1 + 1, bl_count);

	  /* The static distance tree is trivial: */
	  for (n = 0; n < D_CODES$1; n++) {
	    static_dtree[n * 2 + 1]/*.Len*/ = 5;
	    static_dtree[n * 2]/*.Code*/ = bi_reverse(n, 5);
	  }

	  // Now data ready and we can init static trees
	  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS$1 + 1, L_CODES$1, MAX_BITS$1);
	  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0,          D_CODES$1, MAX_BITS$1);
	  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0,         BL_CODES$1, MAX_BL_BITS);

	  //static_init_done = true;
	};


	/* ===========================================================================
	 * Initialize a new block.
	 */
	const init_block = (s) => {

	  let n; /* iterates over tree elements */

	  /* Initialize the trees. */
	  for (n = 0; n < L_CODES$1;  n++) { s.dyn_ltree[n * 2]/*.Freq*/ = 0; }
	  for (n = 0; n < D_CODES$1;  n++) { s.dyn_dtree[n * 2]/*.Freq*/ = 0; }
	  for (n = 0; n < BL_CODES$1; n++) { s.bl_tree[n * 2]/*.Freq*/ = 0; }

	  s.dyn_ltree[END_BLOCK * 2]/*.Freq*/ = 1;
	  s.opt_len = s.static_len = 0;
	  s.sym_next = s.matches = 0;
	};


	/* ===========================================================================
	 * Flush the bit buffer and align the output on a byte boundary
	 */
	const bi_windup = (s) =>
	{
	  if (s.bi_valid > 8) {
	    put_short(s, s.bi_buf);
	  } else if (s.bi_valid > 0) {
	    //put_byte(s, (Byte)s->bi_buf);
	    s.pending_buf[s.pending++] = s.bi_buf;
	  }
	  s.bi_buf = 0;
	  s.bi_valid = 0;
	};

	/* ===========================================================================
	 * Compares to subtrees, using the tree depth as tie breaker when
	 * the subtrees have equal frequency. This minimizes the worst case length.
	 */
	const smaller = (tree, n, m, depth) => {

	  const _n2 = n * 2;
	  const _m2 = m * 2;
	  return (tree[_n2]/*.Freq*/ < tree[_m2]/*.Freq*/ ||
	         (tree[_n2]/*.Freq*/ === tree[_m2]/*.Freq*/ && depth[n] <= depth[m]));
	};

	/* ===========================================================================
	 * Restore the heap property by moving down the tree starting at node k,
	 * exchanging a node with the smallest of its two sons if necessary, stopping
	 * when the heap property is re-established (each father smaller than its
	 * two sons).
	 */
	const pqdownheap = (s, tree, k) => {
	//    deflate_state *s;
	//    ct_data *tree;  /* the tree to restore */
	//    int k;               /* node to move down */

	  const v = s.heap[k];
	  let j = k << 1;  /* left son of k */
	  while (j <= s.heap_len) {
	    /* Set j to the smallest of the two sons: */
	    if (j < s.heap_len &&
	      smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
	      j++;
	    }
	    /* Exit if v is smaller than both sons */
	    if (smaller(tree, v, s.heap[j], s.depth)) { break; }

	    /* Exchange v with the smallest son */
	    s.heap[k] = s.heap[j];
	    k = j;

	    /* And continue down the tree, setting j to the left son of k */
	    j <<= 1;
	  }
	  s.heap[k] = v;
	};


	// inlined manually
	// const SMALLEST = 1;

	/* ===========================================================================
	 * Send the block data compressed using the given Huffman trees
	 */
	const compress_block = (s, ltree, dtree) => {
	//    deflate_state *s;
	//    const ct_data *ltree; /* literal tree */
	//    const ct_data *dtree; /* distance tree */

	  let dist;           /* distance of matched string */
	  let lc;             /* match length or unmatched char (if dist == 0) */
	  let sx = 0;         /* running index in sym_buf */
	  let code;           /* the code to send */
	  let extra;          /* number of extra bits to send */

	  if (s.sym_next !== 0) {
	    do {
	      dist = s.pending_buf[s.sym_buf + sx++] & 0xff;
	      dist += (s.pending_buf[s.sym_buf + sx++] & 0xff) << 8;
	      lc = s.pending_buf[s.sym_buf + sx++];
	      if (dist === 0) {
	        send_code(s, lc, ltree); /* send a literal byte */
	        //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
	      } else {
	        /* Here, lc is the match length - MIN_MATCH */
	        code = _length_code[lc];
	        send_code(s, code + LITERALS$1 + 1, ltree); /* send the length code */
	        extra = extra_lbits[code];
	        if (extra !== 0) {
	          lc -= base_length[code];
	          send_bits(s, lc, extra);       /* send the extra length bits */
	        }
	        dist--; /* dist is now the match distance - 1 */
	        code = d_code(dist);
	        //Assert (code < D_CODES, "bad d_code");

	        send_code(s, code, dtree);       /* send the distance code */
	        extra = extra_dbits[code];
	        if (extra !== 0) {
	          dist -= base_dist[code];
	          send_bits(s, dist, extra);   /* send the extra distance bits */
	        }
	      } /* literal or match pair ? */

	      /* Check that the overlay between pending_buf and sym_buf is ok: */
	      //Assert(s->pending < s->lit_bufsize + sx, "pendingBuf overflow");

	    } while (sx < s.sym_next);
	  }

	  send_code(s, END_BLOCK, ltree);
	};


	/* ===========================================================================
	 * Construct one Huffman tree and assigns the code bit strings and lengths.
	 * Update the total bit length for the current block.
	 * IN assertion: the field freq is set for all tree elements.
	 * OUT assertions: the fields len and code are set to the optimal bit length
	 *     and corresponding code. The length opt_len is updated; static_len is
	 *     also updated if stree is not null. The field max_code is set.
	 */
	const build_tree = (s, desc) => {
	//    deflate_state *s;
	//    tree_desc *desc; /* the tree descriptor */

	  const tree     = desc.dyn_tree;
	  const stree    = desc.stat_desc.static_tree;
	  const has_stree = desc.stat_desc.has_stree;
	  const elems    = desc.stat_desc.elems;
	  let n, m;          /* iterate over heap elements */
	  let max_code = -1; /* largest code with non zero frequency */
	  let node;          /* new node being created */

	  /* Construct the initial heap, with least frequent element in
	   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
	   * heap[0] is not used.
	   */
	  s.heap_len = 0;
	  s.heap_max = HEAP_SIZE$1;

	  for (n = 0; n < elems; n++) {
	    if (tree[n * 2]/*.Freq*/ !== 0) {
	      s.heap[++s.heap_len] = max_code = n;
	      s.depth[n] = 0;

	    } else {
	      tree[n * 2 + 1]/*.Len*/ = 0;
	    }
	  }

	  /* The pkzip format requires that at least one distance code exists,
	   * and that at least one bit should be sent even if there is only one
	   * possible code. So to avoid special checks later on we force at least
	   * two codes of non zero frequency.
	   */
	  while (s.heap_len < 2) {
	    node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
	    tree[node * 2]/*.Freq*/ = 1;
	    s.depth[node] = 0;
	    s.opt_len--;

	    if (has_stree) {
	      s.static_len -= stree[node * 2 + 1]/*.Len*/;
	    }
	    /* node is 0 or 1 so it does not have extra bits */
	  }
	  desc.max_code = max_code;

	  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
	   * establish sub-heaps of increasing lengths:
	   */
	  for (n = (s.heap_len >> 1/*int /2*/); n >= 1; n--) { pqdownheap(s, tree, n); }

	  /* Construct the Huffman tree by repeatedly combining the least two
	   * frequent nodes.
	   */
	  node = elems;              /* next internal node of the tree */
	  do {
	    //pqremove(s, tree, n);  /* n = node of least frequency */
	    /*** pqremove ***/
	    n = s.heap[1/*SMALLEST*/];
	    s.heap[1/*SMALLEST*/] = s.heap[s.heap_len--];
	    pqdownheap(s, tree, 1/*SMALLEST*/);
	    /***/

	    m = s.heap[1/*SMALLEST*/]; /* m = node of next least frequency */

	    s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
	    s.heap[--s.heap_max] = m;

	    /* Create a new node father of n and m */
	    tree[node * 2]/*.Freq*/ = tree[n * 2]/*.Freq*/ + tree[m * 2]/*.Freq*/;
	    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
	    tree[n * 2 + 1]/*.Dad*/ = tree[m * 2 + 1]/*.Dad*/ = node;

	    /* and insert the new node in the heap */
	    s.heap[1/*SMALLEST*/] = node++;
	    pqdownheap(s, tree, 1/*SMALLEST*/);

	  } while (s.heap_len >= 2);

	  s.heap[--s.heap_max] = s.heap[1/*SMALLEST*/];

	  /* At this point, the fields freq and dad are set. We can now
	   * generate the bit lengths.
	   */
	  gen_bitlen(s, desc);

	  /* The field len is now set, we can generate the bit codes */
	  gen_codes(tree, max_code, s.bl_count);
	};


	/* ===========================================================================
	 * Scan a literal or distance tree to determine the frequencies of the codes
	 * in the bit length tree.
	 */
	const scan_tree = (s, tree, max_code) => {
	//    deflate_state *s;
	//    ct_data *tree;   /* the tree to be scanned */
	//    int max_code;    /* and its largest code of non zero frequency */

	  let n;                     /* iterates over all tree elements */
	  let prevlen = -1;          /* last emitted length */
	  let curlen;                /* length of current code */

	  let nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

	  let count = 0;             /* repeat count of the current code */
	  let max_count = 7;         /* max repeat count */
	  let min_count = 4;         /* min repeat count */

	  if (nextlen === 0) {
	    max_count = 138;
	    min_count = 3;
	  }
	  tree[(max_code + 1) * 2 + 1]/*.Len*/ = 0xffff; /* guard */

	  for (n = 0; n <= max_code; n++) {
	    curlen = nextlen;
	    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

	    if (++count < max_count && curlen === nextlen) {
	      continue;

	    } else if (count < min_count) {
	      s.bl_tree[curlen * 2]/*.Freq*/ += count;

	    } else if (curlen !== 0) {

	      if (curlen !== prevlen) { s.bl_tree[curlen * 2]/*.Freq*/++; }
	      s.bl_tree[REP_3_6 * 2]/*.Freq*/++;

	    } else if (count <= 10) {
	      s.bl_tree[REPZ_3_10 * 2]/*.Freq*/++;

	    } else {
	      s.bl_tree[REPZ_11_138 * 2]/*.Freq*/++;
	    }

	    count = 0;
	    prevlen = curlen;

	    if (nextlen === 0) {
	      max_count = 138;
	      min_count = 3;

	    } else if (curlen === nextlen) {
	      max_count = 6;
	      min_count = 3;

	    } else {
	      max_count = 7;
	      min_count = 4;
	    }
	  }
	};


	/* ===========================================================================
	 * Send a literal or distance tree in compressed form, using the codes in
	 * bl_tree.
	 */
	const send_tree = (s, tree, max_code) => {
	//    deflate_state *s;
	//    ct_data *tree; /* the tree to be scanned */
	//    int max_code;       /* and its largest code of non zero frequency */

	  let n;                     /* iterates over all tree elements */
	  let prevlen = -1;          /* last emitted length */
	  let curlen;                /* length of current code */

	  let nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

	  let count = 0;             /* repeat count of the current code */
	  let max_count = 7;         /* max repeat count */
	  let min_count = 4;         /* min repeat count */

	  /* tree[max_code+1].Len = -1; */  /* guard already set */
	  if (nextlen === 0) {
	    max_count = 138;
	    min_count = 3;
	  }

	  for (n = 0; n <= max_code; n++) {
	    curlen = nextlen;
	    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

	    if (++count < max_count && curlen === nextlen) {
	      continue;

	    } else if (count < min_count) {
	      do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);

	    } else if (curlen !== 0) {
	      if (curlen !== prevlen) {
	        send_code(s, curlen, s.bl_tree);
	        count--;
	      }
	      //Assert(count >= 3 && count <= 6, " 3_6?");
	      send_code(s, REP_3_6, s.bl_tree);
	      send_bits(s, count - 3, 2);

	    } else if (count <= 10) {
	      send_code(s, REPZ_3_10, s.bl_tree);
	      send_bits(s, count - 3, 3);

	    } else {
	      send_code(s, REPZ_11_138, s.bl_tree);
	      send_bits(s, count - 11, 7);
	    }

	    count = 0;
	    prevlen = curlen;
	    if (nextlen === 0) {
	      max_count = 138;
	      min_count = 3;

	    } else if (curlen === nextlen) {
	      max_count = 6;
	      min_count = 3;

	    } else {
	      max_count = 7;
	      min_count = 4;
	    }
	  }
	};


	/* ===========================================================================
	 * Construct the Huffman tree for the bit lengths and return the index in
	 * bl_order of the last bit length code to send.
	 */
	const build_bl_tree = (s) => {

	  let max_blindex;  /* index of last bit length code of non zero freq */

	  /* Determine the bit length frequencies for literal and distance trees */
	  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
	  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

	  /* Build the bit length tree: */
	  build_tree(s, s.bl_desc);
	  /* opt_len now includes the length of the tree representations, except
	   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
	   */

	  /* Determine the number of bit length codes to send. The pkzip format
	   * requires that at least 4 bit length codes be sent. (appnote.txt says
	   * 3 but the actual value used is 4.)
	   */
	  for (max_blindex = BL_CODES$1 - 1; max_blindex >= 3; max_blindex--) {
	    if (s.bl_tree[bl_order[max_blindex] * 2 + 1]/*.Len*/ !== 0) {
	      break;
	    }
	  }
	  /* Update opt_len to include the bit length tree and counts */
	  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
	  //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
	  //        s->opt_len, s->static_len));

	  return max_blindex;
	};


	/* ===========================================================================
	 * Send the header for a block using dynamic Huffman trees: the counts, the
	 * lengths of the bit length codes, the literal tree and the distance tree.
	 * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
	 */
	const send_all_trees = (s, lcodes, dcodes, blcodes) => {
	//    deflate_state *s;
	//    int lcodes, dcodes, blcodes; /* number of codes for each tree */

	  let rank;                    /* index in bl_order */

	  //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
	  //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
	  //        "too many codes");
	  //Tracev((stderr, "\nbl counts: "));
	  send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
	  send_bits(s, dcodes - 1,   5);
	  send_bits(s, blcodes - 4,  4); /* not -3 as stated in appnote.txt */
	  for (rank = 0; rank < blcodes; rank++) {
	    //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
	    send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1]/*.Len*/, 3);
	  }
	  //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

	  send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
	  //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

	  send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
	  //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
	};


	/* ===========================================================================
	 * Check if the data type is TEXT or BINARY, using the following algorithm:
	 * - TEXT if the two conditions below are satisfied:
	 *    a) There are no non-portable control characters belonging to the
	 *       "block list" (0..6, 14..25, 28..31).
	 *    b) There is at least one printable character belonging to the
	 *       "allow list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
	 * - BINARY otherwise.
	 * - The following partially-portable control characters form a
	 *   "gray list" that is ignored in this detection algorithm:
	 *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
	 * IN assertion: the fields Freq of dyn_ltree are set.
	 */
	const detect_data_type = (s) => {
	  /* block_mask is the bit mask of block-listed bytes
	   * set bits 0..6, 14..25, and 28..31
	   * 0xf3ffc07f = binary 11110011111111111100000001111111
	   */
	  let block_mask = 0xf3ffc07f;
	  let n;

	  /* Check for non-textual ("block-listed") bytes. */
	  for (n = 0; n <= 31; n++, block_mask >>>= 1) {
	    if ((block_mask & 1) && (s.dyn_ltree[n * 2]/*.Freq*/ !== 0)) {
	      return Z_BINARY;
	    }
	  }

	  /* Check for textual ("allow-listed") bytes. */
	  if (s.dyn_ltree[9 * 2]/*.Freq*/ !== 0 || s.dyn_ltree[10 * 2]/*.Freq*/ !== 0 ||
	      s.dyn_ltree[13 * 2]/*.Freq*/ !== 0) {
	    return Z_TEXT;
	  }
	  for (n = 32; n < LITERALS$1; n++) {
	    if (s.dyn_ltree[n * 2]/*.Freq*/ !== 0) {
	      return Z_TEXT;
	    }
	  }

	  /* There are no "block-listed" or "allow-listed" bytes:
	   * this stream either is empty or has tolerated ("gray-listed") bytes only.
	   */
	  return Z_BINARY;
	};


	let static_init_done = false;

	/* ===========================================================================
	 * Initialize the tree data structures for a new zlib stream.
	 */
	const _tr_init$1 = (s) =>
	{

	  if (!static_init_done) {
	    tr_static_init();
	    static_init_done = true;
	  }

	  s.l_desc  = new TreeDesc(s.dyn_ltree, static_l_desc);
	  s.d_desc  = new TreeDesc(s.dyn_dtree, static_d_desc);
	  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

	  s.bi_buf = 0;
	  s.bi_valid = 0;

	  /* Initialize the first block of the first file: */
	  init_block(s);
	};


	/* ===========================================================================
	 * Send a stored block
	 */
	const _tr_stored_block$1 = (s, buf, stored_len, last) => {
	//DeflateState *s;
	//charf *buf;       /* input block */
	//ulg stored_len;   /* length of input block */
	//int last;         /* one if this is the last block for a file */

	  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);    /* send block type */
	  bi_windup(s);        /* align on byte boundary */
	  put_short(s, stored_len);
	  put_short(s, ~stored_len);
	  if (stored_len) {
	    s.pending_buf.set(s.window.subarray(buf, buf + stored_len), s.pending);
	  }
	  s.pending += stored_len;
	};


	/* ===========================================================================
	 * Send one empty static block to give enough lookahead for inflate.
	 * This takes 10 bits, of which 7 may remain in the bit buffer.
	 */
	const _tr_align$1 = (s) => {
	  send_bits(s, STATIC_TREES << 1, 3);
	  send_code(s, END_BLOCK, static_ltree);
	  bi_flush(s);
	};


	/* ===========================================================================
	 * Determine the best encoding for the current block: dynamic trees, static
	 * trees or store, and write out the encoded block.
	 */
	const _tr_flush_block$1 = (s, buf, stored_len, last) => {
	//DeflateState *s;
	//charf *buf;       /* input block, or NULL if too old */
	//ulg stored_len;   /* length of input block */
	//int last;         /* one if this is the last block for a file */

	  let opt_lenb, static_lenb;  /* opt_len and static_len in bytes */
	  let max_blindex = 0;        /* index of last bit length code of non zero freq */

	  /* Build the Huffman trees unless a stored block is forced */
	  if (s.level > 0) {

	    /* Check if the file is binary or text */
	    if (s.strm.data_type === Z_UNKNOWN$1) {
	      s.strm.data_type = detect_data_type(s);
	    }

	    /* Construct the literal and distance trees */
	    build_tree(s, s.l_desc);
	    // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
	    //        s->static_len));

	    build_tree(s, s.d_desc);
	    // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
	    //        s->static_len));
	    /* At this point, opt_len and static_len are the total bit lengths of
	     * the compressed block data, excluding the tree representations.
	     */

	    /* Build the bit length tree for the above two trees, and get the index
	     * in bl_order of the last bit length code to send.
	     */
	    max_blindex = build_bl_tree(s);

	    /* Determine the best encoding. Compute the block lengths in bytes. */
	    opt_lenb = (s.opt_len + 3 + 7) >>> 3;
	    static_lenb = (s.static_len + 3 + 7) >>> 3;

	    // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
	    //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
	    //        s->sym_next / 3));

	    if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }

	  } else {
	    // Assert(buf != (char*)0, "lost buf");
	    opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
	  }

	  if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
	    /* 4: two words for the lengths */

	    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
	     * Otherwise we can't have processed more than WSIZE input bytes since
	     * the last block flush, because compression would have been
	     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
	     * transform a block into a stored block.
	     */
	    _tr_stored_block$1(s, buf, stored_len, last);

	  } else if (s.strategy === Z_FIXED$1 || static_lenb === opt_lenb) {

	    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
	    compress_block(s, static_ltree, static_dtree);

	  } else {
	    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
	    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
	    compress_block(s, s.dyn_ltree, s.dyn_dtree);
	  }
	  // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
	  /* The above check is made mod 2^32, for files larger than 512 MB
	   * and uLong implemented on 32 bits.
	   */
	  init_block(s);

	  if (last) {
	    bi_windup(s);
	  }
	  // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
	  //       s->compressed_len-7*last));
	};

	/* ===========================================================================
	 * Save the match info and tally the frequency counts. Return true if
	 * the current block must be flushed.
	 */
	const _tr_tally$1 = (s, dist, lc) => {
	//    deflate_state *s;
	//    unsigned dist;  /* distance of matched string */
	//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */

	  s.pending_buf[s.sym_buf + s.sym_next++] = dist;
	  s.pending_buf[s.sym_buf + s.sym_next++] = dist >> 8;
	  s.pending_buf[s.sym_buf + s.sym_next++] = lc;
	  if (dist === 0) {
	    /* lc is the unmatched char */
	    s.dyn_ltree[lc * 2]/*.Freq*/++;
	  } else {
	    s.matches++;
	    /* Here, lc is the match length - MIN_MATCH */
	    dist--;             /* dist = match distance - 1 */
	    //Assert((ush)dist < (ush)MAX_DIST(s) &&
	    //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
	    //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

	    s.dyn_ltree[(_length_code[lc] + LITERALS$1 + 1) * 2]/*.Freq*/++;
	    s.dyn_dtree[d_code(dist) * 2]/*.Freq*/++;
	  }

	  return (s.sym_next === s.sym_end);
	};

	var _tr_init_1  = _tr_init$1;
	var _tr_stored_block_1 = _tr_stored_block$1;
	var _tr_flush_block_1  = _tr_flush_block$1;
	var _tr_tally_1 = _tr_tally$1;
	var _tr_align_1 = _tr_align$1;

	var trees = {
		_tr_init: _tr_init_1,
		_tr_stored_block: _tr_stored_block_1,
		_tr_flush_block: _tr_flush_block_1,
		_tr_tally: _tr_tally_1,
		_tr_align: _tr_align_1
	};

	// Note: adler32 takes 12% for level 0 and 2% for level 6.
	// It isn't worth it to make additional optimizations as in original.
	// Small size is preferable.

	// (C) 1995-2013 Jean-loup Gailly and Mark Adler
	// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
	//
	// This software is provided 'as-is', without any express or implied
	// warranty. In no event will the authors be held liable for any damages
	// arising from the use of this software.
	//
	// Permission is granted to anyone to use this software for any purpose,
	// including commercial applications, and to alter it and redistribute it
	// freely, subject to the following restrictions:
	//
	// 1. The origin of this software must not be misrepresented; you must not
	//   claim that you wrote the original software. If you use this software
	//   in a product, an acknowledgment in the product documentation would be
	//   appreciated but is not required.
	// 2. Altered source versions must be plainly marked as such, and must not be
	//   misrepresented as being the original software.
	// 3. This notice may not be removed or altered from any source distribution.

	const adler32 = (adler, buf, len, pos) => {
	  let s1 = (adler & 0xffff) |0,
	      s2 = ((adler >>> 16) & 0xffff) |0,
	      n = 0;

	  while (len !== 0) {
	    // Set limit ~ twice less than 5552, to keep
	    // s2 in 31-bits, because we force signed ints.
	    // in other case %= will fail.
	    n = len > 2000 ? 2000 : len;
	    len -= n;

	    do {
	      s1 = (s1 + buf[pos++]) |0;
	      s2 = (s2 + s1) |0;
	    } while (--n);

	    s1 %= 65521;
	    s2 %= 65521;
	  }

	  return (s1 | (s2 << 16)) |0;
	};


	var adler32_1 = adler32;

	// Note: we can't get significant speed boost here.
	// So write code to minimize size - no pregenerated tables
	// and array tools dependencies.

	// (C) 1995-2013 Jean-loup Gailly and Mark Adler
	// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
	//
	// This software is provided 'as-is', without any express or implied
	// warranty. In no event will the authors be held liable for any damages
	// arising from the use of this software.
	//
	// Permission is granted to anyone to use this software for any purpose,
	// including commercial applications, and to alter it and redistribute it
	// freely, subject to the following restrictions:
	//
	// 1. The origin of this software must not be misrepresented; you must not
	//   claim that you wrote the original software. If you use this software
	//   in a product, an acknowledgment in the product documentation would be
	//   appreciated but is not required.
	// 2. Altered source versions must be plainly marked as such, and must not be
	//   misrepresented as being the original software.
	// 3. This notice may not be removed or altered from any source distribution.

	// Use ordinary array, since untyped makes no boost here
	const makeTable = () => {
	  let c, table = [];

	  for (var n = 0; n < 256; n++) {
	    c = n;
	    for (var k = 0; k < 8; k++) {
	      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
	    }
	    table[n] = c;
	  }

	  return table;
	};

	// Create table on load. Just 255 signed longs. Not a problem.
	const crcTable = new Uint32Array(makeTable());


	const crc32 = (crc, buf, len, pos) => {
	  const t = crcTable;
	  const end = pos + len;

	  crc ^= -1;

	  for (let i = pos; i < end; i++) {
	    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
	  }

	  return (crc ^ (-1)); // >>> 0;
	};


	var crc32_1 = crc32;

	// (C) 1995-2013 Jean-loup Gailly and Mark Adler
	// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
	//
	// This software is provided 'as-is', without any express or implied
	// warranty. In no event will the authors be held liable for any damages
	// arising from the use of this software.
	//
	// Permission is granted to anyone to use this software for any purpose,
	// including commercial applications, and to alter it and redistribute it
	// freely, subject to the following restrictions:
	//
	// 1. The origin of this software must not be misrepresented; you must not
	//   claim that you wrote the original software. If you use this software
	//   in a product, an acknowledgment in the product documentation would be
	//   appreciated but is not required.
	// 2. Altered source versions must be plainly marked as such, and must not be
	//   misrepresented as being the original software.
	// 3. This notice may not be removed or altered from any source distribution.

	var messages = {
	  2:      'need dictionary',     /* Z_NEED_DICT       2  */
	  1:      'stream end',          /* Z_STREAM_END      1  */
	  0:      '',                    /* Z_OK              0  */
	  '-1':   'file error',          /* Z_ERRNO         (-1) */
	  '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
	  '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
	  '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
	  '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
	  '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
	};

	// (C) 1995-2013 Jean-loup Gailly and Mark Adler
	// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
	//
	// This software is provided 'as-is', without any express or implied
	// warranty. In no event will the authors be held liable for any damages
	// arising from the use of this software.
	//
	// Permission is granted to anyone to use this software for any purpose,
	// including commercial applications, and to alter it and redistribute it
	// freely, subject to the following restrictions:
	//
	// 1. The origin of this software must not be misrepresented; you must not
	//   claim that you wrote the original software. If you use this software
	//   in a product, an acknowledgment in the product documentation would be
	//   appreciated but is not required.
	// 2. Altered source versions must be plainly marked as such, and must not be
	//   misrepresented as being the original software.
	// 3. This notice may not be removed or altered from any source distribution.

	var constants$2 = {

	  /* Allowed flush values; see deflate() and inflate() below for details */
	  Z_NO_FLUSH:         0,
	  Z_PARTIAL_FLUSH:    1,
	  Z_SYNC_FLUSH:       2,
	  Z_FULL_FLUSH:       3,
	  Z_FINISH:           4,
	  Z_BLOCK:            5,
	  Z_TREES:            6,

	  /* Return codes for the compression/decompression functions. Negative values
	  * are errors, positive values are used for special but normal events.
	  */
	  Z_OK:               0,
	  Z_STREAM_END:       1,
	  Z_NEED_DICT:        2,
	  Z_ERRNO:           -1,
	  Z_STREAM_ERROR:    -2,
	  Z_DATA_ERROR:      -3,
	  Z_MEM_ERROR:       -4,
	  Z_BUF_ERROR:       -5,
	  //Z_VERSION_ERROR: -6,

	  /* compression levels */
	  Z_NO_COMPRESSION:         0,
	  Z_BEST_SPEED:             1,
	  Z_BEST_COMPRESSION:       9,
	  Z_DEFAULT_COMPRESSION:   -1,


	  Z_FILTERED:               1,
	  Z_HUFFMAN_ONLY:           2,
	  Z_RLE:                    3,
	  Z_FIXED:                  4,
	  Z_DEFAULT_STRATEGY:       0,

	  /* Possible values of the data_type field (though see inflate()) */
	  Z_BINARY:                 0,
	  Z_TEXT:                   1,
	  //Z_ASCII:                1, // = Z_TEXT (deprecated)
	  Z_UNKNOWN:                2,

	  /* The deflate compression method */
	  Z_DEFLATED:               8
	  //Z_NULL:                 null // Use -1 or null inline, depending on var type
	};

	// (C) 1995-2013 Jean-loup Gailly and Mark Adler
	// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
	//
	// This software is provided 'as-is', without any express or implied
	// warranty. In no event will the authors be held liable for any damages
	// arising from the use of this software.
	//
	// Permission is granted to anyone to use this software for any purpose,
	// including commercial applications, and to alter it and redistribute it
	// freely, subject to the following restrictions:
	//
	// 1. The origin of this software must not be misrepresented; you must not
	//   claim that you wrote the original software. If you use this software
	//   in a product, an acknowledgment in the product documentation would be
	//   appreciated but is not required.
	// 2. Altered source versions must be plainly marked as such, and must not be
	//   misrepresented as being the original software.
	// 3. This notice may not be removed or altered from any source distribution.

	const { _tr_init, _tr_stored_block, _tr_flush_block, _tr_tally, _tr_align } = trees;




	/* Public constants ==========================================================*/
	/* ===========================================================================*/

	const {
	  Z_NO_FLUSH: Z_NO_FLUSH$2, Z_PARTIAL_FLUSH, Z_FULL_FLUSH: Z_FULL_FLUSH$1, Z_FINISH: Z_FINISH$3, Z_BLOCK: Z_BLOCK$1,
	  Z_OK: Z_OK$3, Z_STREAM_END: Z_STREAM_END$3, Z_STREAM_ERROR: Z_STREAM_ERROR$2, Z_DATA_ERROR: Z_DATA_ERROR$2, Z_BUF_ERROR: Z_BUF_ERROR$1,
	  Z_DEFAULT_COMPRESSION: Z_DEFAULT_COMPRESSION$1,
	  Z_FILTERED, Z_HUFFMAN_ONLY, Z_RLE, Z_FIXED, Z_DEFAULT_STRATEGY: Z_DEFAULT_STRATEGY$1,
	  Z_UNKNOWN,
	  Z_DEFLATED: Z_DEFLATED$2
	} = constants$2;

	/*============================================================================*/


	const MAX_MEM_LEVEL = 9;
	/* Maximum value for memLevel in deflateInit2 */
	const MAX_WBITS$1 = 15;
	/* 32K LZ77 window */
	const DEF_MEM_LEVEL = 8;


	const LENGTH_CODES  = 29;
	/* number of length codes, not counting the special END_BLOCK code */
	const LITERALS      = 256;
	/* number of literal bytes 0..255 */
	const L_CODES       = LITERALS + 1 + LENGTH_CODES;
	/* number of Literal or Length codes, including the END_BLOCK code */
	const D_CODES       = 30;
	/* number of distance codes */
	const BL_CODES      = 19;
	/* number of codes used to transfer the bit lengths */
	const HEAP_SIZE     = 2 * L_CODES + 1;
	/* maximum heap size */
	const MAX_BITS  = 15;
	/* All codes must not exceed MAX_BITS bits */

	const MIN_MATCH = 3;
	const MAX_MATCH = 258;
	const MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

	const PRESET_DICT = 0x20;

	const INIT_STATE    =  42;    /* zlib header -> BUSY_STATE */
	//#ifdef GZIP
	const GZIP_STATE    =  57;    /* gzip header -> BUSY_STATE | EXTRA_STATE */
	//#endif
	const EXTRA_STATE   =  69;    /* gzip extra block -> NAME_STATE */
	const NAME_STATE    =  73;    /* gzip file name -> COMMENT_STATE */
	const COMMENT_STATE =  91;    /* gzip comment -> HCRC_STATE */
	const HCRC_STATE    = 103;    /* gzip header CRC -> BUSY_STATE */
	const BUSY_STATE    = 113;    /* deflate -> FINISH_STATE */
	const FINISH_STATE  = 666;    /* stream complete */

	const BS_NEED_MORE      = 1; /* block not completed, need more input or more output */
	const BS_BLOCK_DONE     = 2; /* block flush performed */
	const BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
	const BS_FINISH_DONE    = 4; /* finish done, accept no more input or output */

	const OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

	const err = (strm, errorCode) => {
	  strm.msg = messages[errorCode];
	  return errorCode;
	};

	const rank = (f) => {
	  return ((f) * 2) - ((f) > 4 ? 9 : 0);
	};

	const zero = (buf) => {
	  let len = buf.length; while (--len >= 0) { buf[len] = 0; }
	};

	/* ===========================================================================
	 * Slide the hash table when sliding the window down (could be avoided with 32
	 * bit values at the expense of memory usage). We slide even when level == 0 to
	 * keep the hash table consistent if we switch back to level > 0 later.
	 */
	const slide_hash = (s) => {
	  let n, m;
	  let p;
	  let wsize = s.w_size;

	  n = s.hash_size;
	  p = n;
	  do {
	    m = s.head[--p];
	    s.head[p] = (m >= wsize ? m - wsize : 0);
	  } while (--n);
	  n = wsize;
	//#ifndef FASTEST
	  p = n;
	  do {
	    m = s.prev[--p];
	    s.prev[p] = (m >= wsize ? m - wsize : 0);
	    /* If n is not on any hash chain, prev[n] is garbage but
	     * its value will never be used.
	     */
	  } while (--n);
	//#endif
	};

	/* eslint-disable new-cap */
	let HASH_ZLIB = (s, prev, data) => ((prev << s.hash_shift) ^ data) & s.hash_mask;
	// This hash causes less collisions, https://github.com/nodeca/pako/issues/135
	// But breaks binary compatibility
	//let HASH_FAST = (s, prev, data) => ((prev << 8) + (prev >> 8) + (data << 4)) & s.hash_mask;
	let HASH = HASH_ZLIB;


	/* =========================================================================
	 * Flush as much pending output as possible. All deflate() output, except for
	 * some deflate_stored() output, goes through this function so some
	 * applications may wish to modify it to avoid allocating a large
	 * strm->next_out buffer and copying into it. (See also read_buf()).
	 */
	const flush_pending = (strm) => {
	  const s = strm.state;

	  //_tr_flush_bits(s);
	  let len = s.pending;
	  if (len > strm.avail_out) {
	    len = strm.avail_out;
	  }
	  if (len === 0) { return; }

	  strm.output.set(s.pending_buf.subarray(s.pending_out, s.pending_out + len), strm.next_out);
	  strm.next_out  += len;
	  s.pending_out  += len;
	  strm.total_out += len;
	  strm.avail_out -= len;
	  s.pending      -= len;
	  if (s.pending === 0) {
	    s.pending_out = 0;
	  }
	};


	const flush_block_only = (s, last) => {
	  _tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
	  s.block_start = s.strstart;
	  flush_pending(s.strm);
	};


	const put_byte = (s, b) => {
	  s.pending_buf[s.pending++] = b;
	};


	/* =========================================================================
	 * Put a short in the pending buffer. The 16-bit value is put in MSB order.
	 * IN assertion: the stream state is correct and there is enough room in
	 * pending_buf.
	 */
	const putShortMSB = (s, b) => {

	  //  put_byte(s, (Byte)(b >> 8));
	//  put_byte(s, (Byte)(b & 0xff));
	  s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
	  s.pending_buf[s.pending++] = b & 0xff;
	};


	/* ===========================================================================
	 * Read a new buffer from the current input stream, update the adler32
	 * and total number of bytes read.  All deflate() input goes through
	 * this function so some applications may wish to modify it to avoid
	 * allocating a large strm->input buffer and copying from it.
	 * (See also flush_pending()).
	 */
	const read_buf = (strm, buf, start, size) => {

	  let len = strm.avail_in;

	  if (len > size) { len = size; }
	  if (len === 0) { return 0; }

	  strm.avail_in -= len;

	  // zmemcpy(buf, strm->next_in, len);
	  buf.set(strm.input.subarray(strm.next_in, strm.next_in + len), start);
	  if (strm.state.wrap === 1) {
	    strm.adler = adler32_1(strm.adler, buf, len, start);
	  }

	  else if (strm.state.wrap === 2) {
	    strm.adler = crc32_1(strm.adler, buf, len, start);
	  }

	  strm.next_in += len;
	  strm.total_in += len;

	  return len;
	};


	/* ===========================================================================
	 * Set match_start to the longest match starting at the given string and
	 * return its length. Matches shorter or equal to prev_length are discarded,
	 * in which case the result is equal to prev_length and match_start is
	 * garbage.
	 * IN assertions: cur_match is the head of the hash chain for the current
	 *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
	 * OUT assertion: the match length is not greater than s->lookahead.
	 */
	const longest_match = (s, cur_match) => {

	  let chain_length = s.max_chain_length;      /* max hash chain length */
	  let scan = s.strstart; /* current string */
	  let match;                       /* matched string */
	  let len;                           /* length of current match */
	  let best_len = s.prev_length;              /* best match length so far */
	  let nice_match = s.nice_match;             /* stop if match long enough */
	  const limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
	      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0/*NIL*/;

	  const _win = s.window; // shortcut

	  const wmask = s.w_mask;
	  const prev  = s.prev;

	  /* Stop when cur_match becomes <= limit. To simplify the code,
	   * we prevent matches with the string of window index 0.
	   */

	  const strend = s.strstart + MAX_MATCH;
	  let scan_end1  = _win[scan + best_len - 1];
	  let scan_end   = _win[scan + best_len];

	  /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
	   * It is easy to get rid of this optimization if necessary.
	   */
	  // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

	  /* Do not waste too much time if we already have a good match: */
	  if (s.prev_length >= s.good_match) {
	    chain_length >>= 2;
	  }
	  /* Do not look for matches beyond the end of the input. This is necessary
	   * to make deflate deterministic.
	   */
	  if (nice_match > s.lookahead) { nice_match = s.lookahead; }

	  // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

	  do {
	    // Assert(cur_match < s->strstart, "no future");
	    match = cur_match;

	    /* Skip to next match if the match length cannot increase
	     * or if the match length is less than 2.  Note that the checks below
	     * for insufficient lookahead only occur occasionally for performance
	     * reasons.  Therefore uninitialized memory will be accessed, and
	     * conditional jumps will be made that depend on those values.
	     * However the length of the match is limited to the lookahead, so
	     * the output of deflate is not affected by the uninitialized values.
	     */

	    if (_win[match + best_len]     !== scan_end  ||
	        _win[match + best_len - 1] !== scan_end1 ||
	        _win[match]                !== _win[scan] ||
	        _win[++match]              !== _win[scan + 1]) {
	      continue;
	    }

	    /* The check at best_len-1 can be removed because it will be made
	     * again later. (This heuristic is not always a win.)
	     * It is not necessary to compare scan[2] and match[2] since they
	     * are always equal when the other bytes match, given that
	     * the hash keys are equal and that HASH_BITS >= 8.
	     */
	    scan += 2;
	    match++;
	    // Assert(*scan == *match, "match[2]?");

	    /* We check for insufficient lookahead only every 8th comparison;
	     * the 256th check will be made at strstart+258.
	     */
	    do {
	      /*jshint noempty:false*/
	    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
	             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
	             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
	             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
	             scan < strend);

	    // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

	    len = MAX_MATCH - (strend - scan);
	    scan = strend - MAX_MATCH;

	    if (len > best_len) {
	      s.match_start = cur_match;
	      best_len = len;
	      if (len >= nice_match) {
	        break;
	      }
	      scan_end1  = _win[scan + best_len - 1];
	      scan_end   = _win[scan + best_len];
	    }
	  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

	  if (best_len <= s.lookahead) {
	    return best_len;
	  }
	  return s.lookahead;
	};


	/* ===========================================================================
	 * Fill the window when the lookahead becomes insufficient.
	 * Updates strstart and lookahead.
	 *
	 * IN assertion: lookahead < MIN_LOOKAHEAD
	 * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
	 *    At least one byte has been read, or avail_in == 0; reads are
	 *    performed for at least two bytes (required for the zip translate_eol
	 *    option -- not supported here).
	 */
	const fill_window = (s) => {

	  const _w_size = s.w_size;
	  let n, more, str;

	  //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

	  do {
	    more = s.window_size - s.lookahead - s.strstart;

	    // JS ints have 32 bit, block below not needed
	    /* Deal with !@#$% 64K limit: */
	    //if (sizeof(int) <= 2) {
	    //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
	    //        more = wsize;
	    //
	    //  } else if (more == (unsigned)(-1)) {
	    //        /* Very unlikely, but possible on 16 bit machine if
	    //         * strstart == 0 && lookahead == 1 (input done a byte at time)
	    //         */
	    //        more--;
	    //    }
	    //}


	    /* If the window is almost full and there is insufficient lookahead,
	     * move the upper half to the lower one to make room in the upper half.
	     */
	    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

	      s.window.set(s.window.subarray(_w_size, _w_size + _w_size - more), 0);
	      s.match_start -= _w_size;
	      s.strstart -= _w_size;
	      /* we now have strstart >= MAX_DIST */
	      s.block_start -= _w_size;
	      if (s.insert > s.strstart) {
	        s.insert = s.strstart;
	      }
	      slide_hash(s);
	      more += _w_size;
	    }
	    if (s.strm.avail_in === 0) {
	      break;
	    }

	    /* If there was no sliding:
	     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
	     *    more == window_size - lookahead - strstart
	     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
	     * => more >= window_size - 2*WSIZE + 2
	     * In the BIG_MEM or MMAP case (not yet supported),
	     *   window_size == input_size + MIN_LOOKAHEAD  &&
	     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
	     * Otherwise, window_size == 2*WSIZE so more >= 2.
	     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
	     */
	    //Assert(more >= 2, "more < 2");
	    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
	    s.lookahead += n;

	    /* Initialize the hash value now that we have some input: */
	    if (s.lookahead + s.insert >= MIN_MATCH) {
	      str = s.strstart - s.insert;
	      s.ins_h = s.window[str];

	      /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
	      s.ins_h = HASH(s, s.ins_h, s.window[str + 1]);
	//#if MIN_MATCH != 3
	//        Call update_hash() MIN_MATCH-3 more times
	//#endif
	      while (s.insert) {
	        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
	        s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);

	        s.prev[str & s.w_mask] = s.head[s.ins_h];
	        s.head[s.ins_h] = str;
	        str++;
	        s.insert--;
	        if (s.lookahead + s.insert < MIN_MATCH) {
	          break;
	        }
	      }
	    }
	    /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
	     * but this is not important since only literal bytes will be emitted.
	     */

	  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

	  /* If the WIN_INIT bytes after the end of the current data have never been
	   * written, then zero those bytes in order to avoid memory check reports of
	   * the use of uninitialized (or uninitialised as Julian writes) bytes by
	   * the longest match routines.  Update the high water mark for the next
	   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
	   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
	   */
	//  if (s.high_water < s.window_size) {
	//    const curr = s.strstart + s.lookahead;
	//    let init = 0;
	//
	//    if (s.high_water < curr) {
	//      /* Previous high water mark below current data -- zero WIN_INIT
	//       * bytes or up to end of window, whichever is less.
	//       */
	//      init = s.window_size - curr;
	//      if (init > WIN_INIT)
	//        init = WIN_INIT;
	//      zmemzero(s->window + curr, (unsigned)init);
	//      s->high_water = curr + init;
	//    }
	//    else if (s->high_water < (ulg)curr + WIN_INIT) {
	//      /* High water mark at or above current data, but below current data
	//       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
	//       * to end of window, whichever is less.
	//       */
	//      init = (ulg)curr + WIN_INIT - s->high_water;
	//      if (init > s->window_size - s->high_water)
	//        init = s->window_size - s->high_water;
	//      zmemzero(s->window + s->high_water, (unsigned)init);
	//      s->high_water += init;
	//    }
	//  }
	//
	//  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
	//    "not enough room for search");
	};

	/* ===========================================================================
	 * Copy without compression as much as possible from the input stream, return
	 * the current block state.
	 *
	 * In case deflateParams() is used to later switch to a non-zero compression
	 * level, s->matches (otherwise unused when storing) keeps track of the number
	 * of hash table slides to perform. If s->matches is 1, then one hash table
	 * slide will be done when switching. If s->matches is 2, the maximum value
	 * allowed here, then the hash table will be cleared, since two or more slides
	 * is the same as a clear.
	 *
	 * deflate_stored() is written to minimize the number of times an input byte is
	 * copied. It is most efficient with large input and output buffers, which
	 * maximizes the opportunites to have a single copy from next_in to next_out.
	 */
	const deflate_stored = (s, flush) => {

	  /* Smallest worthy block size when not flushing or finishing. By default
	   * this is 32K. This can be as small as 507 bytes for memLevel == 1. For
	   * large input and output buffers, the stored block size will be larger.
	   */
	  let min_block = s.pending_buf_size - 5 > s.w_size ? s.w_size : s.pending_buf_size - 5;

	  /* Copy as many min_block or larger stored blocks directly to next_out as
	   * possible. If flushing, copy the remaining available input to next_out as
	   * stored blocks, if there is enough space.
	   */
	  let len, left, have, last = 0;
	  let used = s.strm.avail_in;
	  do {
	    /* Set len to the maximum size block that we can copy directly with the
	     * available input data and output space. Set left to how much of that
	     * would be copied from what's left in the window.
	     */
	    len = 65535/* MAX_STORED */;     /* maximum deflate stored block length */
	    have = (s.bi_valid + 42) >> 3;     /* number of header bytes */
	    if (s.strm.avail_out < have) {         /* need room for header */
	      break;
	    }
	      /* maximum stored block length that will fit in avail_out: */
	    have = s.strm.avail_out - have;
	    left = s.strstart - s.block_start;  /* bytes left in window */
	    if (len > left + s.strm.avail_in) {
	      len = left + s.strm.avail_in;   /* limit len to the input */
	    }
	    if (len > have) {
	      len = have;             /* limit len to the output */
	    }

	    /* If the stored block would be less than min_block in length, or if
	     * unable to copy all of the available input when flushing, then try
	     * copying to the window and the pending buffer instead. Also don't
	     * write an empty block when flushing -- deflate() does that.
	     */
	    if (len < min_block && ((len === 0 && flush !== Z_FINISH$3) ||
	                        flush === Z_NO_FLUSH$2 ||
	                        len !== left + s.strm.avail_in)) {
	      break;
	    }

	    /* Make a dummy stored block in pending to get the header bytes,
	     * including any pending bits. This also updates the debugging counts.
	     */
	    last = flush === Z_FINISH$3 && len === left + s.strm.avail_in ? 1 : 0;
	    _tr_stored_block(s, 0, 0, last);

	    /* Replace the lengths in the dummy stored block with len. */
	    s.pending_buf[s.pending - 4] = len;
	    s.pending_buf[s.pending - 3] = len >> 8;
	    s.pending_buf[s.pending - 2] = ~len;
	    s.pending_buf[s.pending - 1] = ~len >> 8;

	    /* Write the stored block header bytes. */
	    flush_pending(s.strm);

	//#ifdef ZLIB_DEBUG
	//    /* Update debugging counts for the data about to be copied. */
	//    s->compressed_len += len << 3;
	//    s->bits_sent += len << 3;
	//#endif

	    /* Copy uncompressed bytes from the window to next_out. */
	    if (left) {
	      if (left > len) {
	        left = len;
	      }
	      //zmemcpy(s->strm->next_out, s->window + s->block_start, left);
	      s.strm.output.set(s.window.subarray(s.block_start, s.block_start + left), s.strm.next_out);
	      s.strm.next_out += left;
	      s.strm.avail_out -= left;
	      s.strm.total_out += left;
	      s.block_start += left;
	      len -= left;
	    }

	    /* Copy uncompressed bytes directly from next_in to next_out, updating
	     * the check value.
	     */
	    if (len) {
	      read_buf(s.strm, s.strm.output, s.strm.next_out, len);
	      s.strm.next_out += len;
	      s.strm.avail_out -= len;
	      s.strm.total_out += len;
	    }
	  } while (last === 0);

	  /* Update the sliding window with the last s->w_size bytes of the copied
	   * data, or append all of the copied data to the existing window if less
	   * than s->w_size bytes were copied. Also update the number of bytes to
	   * insert in the hash tables, in the event that deflateParams() switches to
	   * a non-zero compression level.
	   */
	  used -= s.strm.avail_in;    /* number of input bytes directly copied */
	  if (used) {
	    /* If any input was used, then no unused input remains in the window,
	     * therefore s->block_start == s->strstart.
	     */
	    if (used >= s.w_size) {  /* supplant the previous history */
	      s.matches = 2;     /* clear hash */
	      //zmemcpy(s->window, s->strm->next_in - s->w_size, s->w_size);
	      s.window.set(s.strm.input.subarray(s.strm.next_in - s.w_size, s.strm.next_in), 0);
	      s.strstart = s.w_size;
	      s.insert = s.strstart;
	    }
	    else {
	      if (s.window_size - s.strstart <= used) {
	        /* Slide the window down. */
	        s.strstart -= s.w_size;
	        //zmemcpy(s->window, s->window + s->w_size, s->strstart);
	        s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
	        if (s.matches < 2) {
	          s.matches++;   /* add a pending slide_hash() */
	        }
	        if (s.insert > s.strstart) {
	          s.insert = s.strstart;
	        }
	      }
	      //zmemcpy(s->window + s->strstart, s->strm->next_in - used, used);
	      s.window.set(s.strm.input.subarray(s.strm.next_in - used, s.strm.next_in), s.strstart);
	      s.strstart += used;
	      s.insert += used > s.w_size - s.insert ? s.w_size - s.insert : used;
	    }
	    s.block_start = s.strstart;
	  }
	  if (s.high_water < s.strstart) {
	    s.high_water = s.strstart;
	  }

	  /* If the last block was written to next_out, then done. */
	  if (last) {
	    return BS_FINISH_DONE;
	  }

	  /* If flushing and all input has been consumed, then done. */
	  if (flush !== Z_NO_FLUSH$2 && flush !== Z_FINISH$3 &&
	    s.strm.avail_in === 0 && s.strstart === s.block_start) {
	    return BS_BLOCK_DONE;
	  }

	  /* Fill the window with any remaining input. */
	  have = s.window_size - s.strstart;
	  if (s.strm.avail_in > have && s.block_start >= s.w_size) {
	    /* Slide the window down. */
	    s.block_start -= s.w_size;
	    s.strstart -= s.w_size;
	    //zmemcpy(s->window, s->window + s->w_size, s->strstart);
	    s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
	    if (s.matches < 2) {
	      s.matches++;       /* add a pending slide_hash() */
	    }
	    have += s.w_size;      /* more space now */
	    if (s.insert > s.strstart) {
	      s.insert = s.strstart;
	    }
	  }
	  if (have > s.strm.avail_in) {
	    have = s.strm.avail_in;
	  }
	  if (have) {
	    read_buf(s.strm, s.window, s.strstart, have);
	    s.strstart += have;
	    s.insert += have > s.w_size - s.insert ? s.w_size - s.insert : have;
	  }
	  if (s.high_water < s.strstart) {
	    s.high_water = s.strstart;
	  }

	  /* There was not enough avail_out to write a complete worthy or flushed
	   * stored block to next_out. Write a stored block to pending instead, if we
	   * have enough input for a worthy block, or if flushing and there is enough
	   * room for the remaining input as a stored block in the pending buffer.
	   */
	  have = (s.bi_valid + 42) >> 3;     /* number of header bytes */
	    /* maximum stored block length that will fit in pending: */
	  have = s.pending_buf_size - have > 65535/* MAX_STORED */ ? 65535/* MAX_STORED */ : s.pending_buf_size - have;
	  min_block = have > s.w_size ? s.w_size : have;
	  left = s.strstart - s.block_start;
	  if (left >= min_block ||
	     ((left || flush === Z_FINISH$3) && flush !== Z_NO_FLUSH$2 &&
	     s.strm.avail_in === 0 && left <= have)) {
	    len = left > have ? have : left;
	    last = flush === Z_FINISH$3 && s.strm.avail_in === 0 &&
	         len === left ? 1 : 0;
	    _tr_stored_block(s, s.block_start, len, last);
	    s.block_start += len;
	    flush_pending(s.strm);
	  }

	  /* We've done all we can with the available input and output. */
	  return last ? BS_FINISH_STARTED : BS_NEED_MORE;
	};


	/* ===========================================================================
	 * Compress as much as possible from the input stream, return the current
	 * block state.
	 * This function does not perform lazy evaluation of matches and inserts
	 * new strings in the dictionary only for unmatched strings or for short
	 * matches. It is used only for the fast compression options.
	 */
	const deflate_fast = (s, flush) => {

	  let hash_head;        /* head of the hash chain */
	  let bflush;           /* set if current block must be flushed */

	  for (;;) {
	    /* Make sure that we always have enough lookahead, except
	     * at the end of the input file. We need MAX_MATCH bytes
	     * for the next match, plus MIN_MATCH bytes to insert the
	     * string following the next match.
	     */
	    if (s.lookahead < MIN_LOOKAHEAD) {
	      fill_window(s);
	      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
	        return BS_NEED_MORE;
	      }
	      if (s.lookahead === 0) {
	        break; /* flush the current block */
	      }
	    }

	    /* Insert the string window[strstart .. strstart+2] in the
	     * dictionary, and set hash_head to the head of the hash chain:
	     */
	    hash_head = 0/*NIL*/;
	    if (s.lookahead >= MIN_MATCH) {
	      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
	      s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
	      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
	      s.head[s.ins_h] = s.strstart;
	      /***/
	    }

	    /* Find the longest match, discarding those <= prev_length.
	     * At this point we have always match_length < MIN_MATCH
	     */
	    if (hash_head !== 0/*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
	      /* To simplify the code, we prevent matches with the string
	       * of window index 0 (in particular we have to avoid a match
	       * of the string with itself at the start of the input file).
	       */
	      s.match_length = longest_match(s, hash_head);
	      /* longest_match() sets match_start */
	    }
	    if (s.match_length >= MIN_MATCH) {
	      // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

	      /*** _tr_tally_dist(s, s.strstart - s.match_start,
	                     s.match_length - MIN_MATCH, bflush); ***/
	      bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

	      s.lookahead -= s.match_length;

	      /* Insert new strings in the hash table only if the match length
	       * is not too large. This saves time but degrades compression.
	       */
	      if (s.match_length <= s.max_lazy_match/*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
	        s.match_length--; /* string at strstart already in table */
	        do {
	          s.strstart++;
	          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
	          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
	          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
	          s.head[s.ins_h] = s.strstart;
	          /***/
	          /* strstart never exceeds WSIZE-MAX_MATCH, so there are
	           * always MIN_MATCH bytes ahead.
	           */
	        } while (--s.match_length !== 0);
	        s.strstart++;
	      } else
	      {
	        s.strstart += s.match_length;
	        s.match_length = 0;
	        s.ins_h = s.window[s.strstart];
	        /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
	        s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + 1]);

	//#if MIN_MATCH != 3
	//                Call UPDATE_HASH() MIN_MATCH-3 more times
	//#endif
	        /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
	         * matter since it will be recomputed at next deflate call.
	         */
	      }
	    } else {
	      /* No match, output a literal byte */
	      //Tracevv((stderr,"%c", s.window[s.strstart]));
	      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
	      bflush = _tr_tally(s, 0, s.window[s.strstart]);

	      s.lookahead--;
	      s.strstart++;
	    }
	    if (bflush) {
	      /*** FLUSH_BLOCK(s, 0); ***/
	      flush_block_only(s, false);
	      if (s.strm.avail_out === 0) {
	        return BS_NEED_MORE;
	      }
	      /***/
	    }
	  }
	  s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
	  if (flush === Z_FINISH$3) {
	    /*** FLUSH_BLOCK(s, 1); ***/
	    flush_block_only(s, true);
	    if (s.strm.avail_out === 0) {
	      return BS_FINISH_STARTED;
	    }
	    /***/
	    return BS_FINISH_DONE;
	  }
	  if (s.sym_next) {
	    /*** FLUSH_BLOCK(s, 0); ***/
	    flush_block_only(s, false);
	    if (s.strm.avail_out === 0) {
	      return BS_NEED_MORE;
	    }
	    /***/
	  }
	  return BS_BLOCK_DONE;
	};

	/* ===========================================================================
	 * Same as above, but achieves better compression. We use a lazy
	 * evaluation for matches: a match is finally adopted only if there is
	 * no better match at the next window position.
	 */
	const deflate_slow = (s, flush) => {

	  let hash_head;          /* head of hash chain */
	  let bflush;              /* set if current block must be flushed */

	  let max_insert;

	  /* Process the input block. */
	  for (;;) {
	    /* Make sure that we always have enough lookahead, except
	     * at the end of the input file. We need MAX_MATCH bytes
	     * for the next match, plus MIN_MATCH bytes to insert the
	     * string following the next match.
	     */
	    if (s.lookahead < MIN_LOOKAHEAD) {
	      fill_window(s);
	      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
	        return BS_NEED_MORE;
	      }
	      if (s.lookahead === 0) { break; } /* flush the current block */
	    }

	    /* Insert the string window[strstart .. strstart+2] in the
	     * dictionary, and set hash_head to the head of the hash chain:
	     */
	    hash_head = 0/*NIL*/;
	    if (s.lookahead >= MIN_MATCH) {
	      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
	      s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
	      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
	      s.head[s.ins_h] = s.strstart;
	      /***/
	    }

	    /* Find the longest match, discarding those <= prev_length.
	     */
	    s.prev_length = s.match_length;
	    s.prev_match = s.match_start;
	    s.match_length = MIN_MATCH - 1;

	    if (hash_head !== 0/*NIL*/ && s.prev_length < s.max_lazy_match &&
	        s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)/*MAX_DIST(s)*/) {
	      /* To simplify the code, we prevent matches with the string
	       * of window index 0 (in particular we have to avoid a match
	       * of the string with itself at the start of the input file).
	       */
	      s.match_length = longest_match(s, hash_head);
	      /* longest_match() sets match_start */

	      if (s.match_length <= 5 &&
	         (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096/*TOO_FAR*/))) {

	        /* If prev_match is also MIN_MATCH, match_start is garbage
	         * but we will ignore the current match anyway.
	         */
	        s.match_length = MIN_MATCH - 1;
	      }
	    }
	    /* If there was a match at the previous step and the current
	     * match is not better, output the previous match:
	     */
	    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
	      max_insert = s.strstart + s.lookahead - MIN_MATCH;
	      /* Do not insert strings in hash table beyond this. */

	      //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

	      /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
	                     s.prev_length - MIN_MATCH, bflush);***/
	      bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
	      /* Insert in hash table all strings up to the end of the match.
	       * strstart-1 and strstart are already inserted. If there is not
	       * enough lookahead, the last two strings are not inserted in
	       * the hash table.
	       */
	      s.lookahead -= s.prev_length - 1;
	      s.prev_length -= 2;
	      do {
	        if (++s.strstart <= max_insert) {
	          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
	          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
	          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
	          s.head[s.ins_h] = s.strstart;
	          /***/
	        }
	      } while (--s.prev_length !== 0);
	      s.match_available = 0;
	      s.match_length = MIN_MATCH - 1;
	      s.strstart++;

	      if (bflush) {
	        /*** FLUSH_BLOCK(s, 0); ***/
	        flush_block_only(s, false);
	        if (s.strm.avail_out === 0) {
	          return BS_NEED_MORE;
	        }
	        /***/
	      }

	    } else if (s.match_available) {
	      /* If there was no match at the previous position, output a
	       * single literal. If there was a match but the current match
	       * is longer, truncate the previous match to a single literal.
	       */
	      //Tracevv((stderr,"%c", s->window[s->strstart-1]));
	      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
	      bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);

	      if (bflush) {
	        /*** FLUSH_BLOCK_ONLY(s, 0) ***/
	        flush_block_only(s, false);
	        /***/
	      }
	      s.strstart++;
	      s.lookahead--;
	      if (s.strm.avail_out === 0) {
	        return BS_NEED_MORE;
	      }
	    } else {
	      /* There is no previous match to compare with, wait for
	       * the next step to decide.
	       */
	      s.match_available = 1;
	      s.strstart++;
	      s.lookahead--;
	    }
	  }
	  //Assert (flush != Z_NO_FLUSH, "no flush?");
	  if (s.match_available) {
	    //Tracevv((stderr,"%c", s->window[s->strstart-1]));
	    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
	    bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);

	    s.match_available = 0;
	  }
	  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
	  if (flush === Z_FINISH$3) {
	    /*** FLUSH_BLOCK(s, 1); ***/
	    flush_block_only(s, true);
	    if (s.strm.avail_out === 0) {
	      return BS_FINISH_STARTED;
	    }
	    /***/
	    return BS_FINISH_DONE;
	  }
	  if (s.sym_next) {
	    /*** FLUSH_BLOCK(s, 0); ***/
	    flush_block_only(s, false);
	    if (s.strm.avail_out === 0) {
	      return BS_NEED_MORE;
	    }
	    /***/
	  }

	  return BS_BLOCK_DONE;
	};


	/* ===========================================================================
	 * For Z_RLE, simply look for runs of bytes, generate matches only of distance
	 * one.  Do not maintain a hash table.  (It will be regenerated if this run of
	 * deflate switches away from Z_RLE.)
	 */
	const deflate_rle = (s, flush) => {

	  let bflush;            /* set if current block must be flushed */
	  let prev;              /* byte at distance one to match */
	  let scan, strend;      /* scan goes up to strend for length of run */

	  const _win = s.window;

	  for (;;) {
	    /* Make sure that we always have enough lookahead, except
	     * at the end of the input file. We need MAX_MATCH bytes
	     * for the longest run, plus one for the unrolled loop.
	     */
	    if (s.lookahead <= MAX_MATCH) {
	      fill_window(s);
	      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH$2) {
	        return BS_NEED_MORE;
	      }
	      if (s.lookahead === 0) { break; } /* flush the current block */
	    }

	    /* See how many times the previous byte repeats */
	    s.match_length = 0;
	    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
	      scan = s.strstart - 1;
	      prev = _win[scan];
	      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
	        strend = s.strstart + MAX_MATCH;
	        do {
	          /*jshint noempty:false*/
	        } while (prev === _win[++scan] && prev === _win[++scan] &&
	                 prev === _win[++scan] && prev === _win[++scan] &&
	                 prev === _win[++scan] && prev === _win[++scan] &&
	                 prev === _win[++scan] && prev === _win[++scan] &&
	                 scan < strend);
	        s.match_length = MAX_MATCH - (strend - scan);
	        if (s.match_length > s.lookahead) {
	          s.match_length = s.lookahead;
	        }
	      }
	      //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
	    }

	    /* Emit match if have run of MIN_MATCH or longer, else emit literal */
	    if (s.match_length >= MIN_MATCH) {
	      //check_match(s, s.strstart, s.strstart - 1, s.match_length);

	      /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
	      bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH);

	      s.lookahead -= s.match_length;
	      s.strstart += s.match_length;
	      s.match_length = 0;
	    } else {
	      /* No match, output a literal byte */
	      //Tracevv((stderr,"%c", s->window[s->strstart]));
	      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
	      bflush = _tr_tally(s, 0, s.window[s.strstart]);

	      s.lookahead--;
	      s.strstart++;
	    }
	    if (bflush) {
	      /*** FLUSH_BLOCK(s, 0); ***/
	      flush_block_only(s, false);
	      if (s.strm.avail_out === 0) {
	        return BS_NEED_MORE;
	      }
	      /***/
	    }
	  }
	  s.insert = 0;
	  if (flush === Z_FINISH$3) {
	    /*** FLUSH_BLOCK(s, 1); ***/
	    flush_block_only(s, true);
	    if (s.strm.avail_out === 0) {
	      return BS_FINISH_STARTED;
	    }
	    /***/
	    return BS_FINISH_DONE;
	  }
	  if (s.sym_next) {
	    /*** FLUSH_BLOCK(s, 0); ***/
	    flush_block_only(s, false);
	    if (s.strm.avail_out === 0) {
	      return BS_NEED_MORE;
	    }
	    /***/
	  }
	  return BS_BLOCK_DONE;
	};

	/* ===========================================================================
	 * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
	 * (It will be regenerated if this run of deflate switches away from Huffman.)
	 */
	const deflate_huff = (s, flush) => {

	  let bflush;             /* set if current block must be flushed */

	  for (;;) {
	    /* Make sure that we have a literal to write. */
	    if (s.lookahead === 0) {
	      fill_window(s);
	      if (s.lookahead === 0) {
	        if (flush === Z_NO_FLUSH$2) {
	          return BS_NEED_MORE;
	        }
	        break;      /* flush the current block */
	      }
	    }

	    /* Output a literal byte */
	    s.match_length = 0;
	    //Tracevv((stderr,"%c", s->window[s->strstart]));
	    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
	    bflush = _tr_tally(s, 0, s.window[s.strstart]);
	    s.lookahead--;
	    s.strstart++;
	    if (bflush) {
	      /*** FLUSH_BLOCK(s, 0); ***/
	      flush_block_only(s, false);
	      if (s.strm.avail_out === 0) {
	        return BS_NEED_MORE;
	      }
	      /***/
	    }
	  }
	  s.insert = 0;
	  if (flush === Z_FINISH$3) {
	    /*** FLUSH_BLOCK(s, 1); ***/
	    flush_block_only(s, true);
	    if (s.strm.avail_out === 0) {
	      return BS_FINISH_STARTED;
	    }
	    /***/
	    return BS_FINISH_DONE;
	  }
	  if (s.sym_next) {
	    /*** FLUSH_BLOCK(s, 0); ***/
	    flush_block_only(s, false);
	    if (s.strm.avail_out === 0) {
	      return BS_NEED_MORE;
	    }
	    /***/
	  }
	  return BS_BLOCK_DONE;
	};

	/* Values for max_lazy_match, good_match and max_chain_length, depending on
	 * the desired pack level (0..9). The values given below have been tuned to
	 * exclude worst case performance for pathological files. Better values may be
	 * found for specific files.
	 */
	function Config(good_length, max_lazy, nice_length, max_chain, func) {

	  this.good_length = good_length;
	  this.max_lazy = max_lazy;
	  this.nice_length = nice_length;
	  this.max_chain = max_chain;
	  this.func = func;
	}

	const configuration_table = [
	  /*      good lazy nice chain */
	  new Config(0, 0, 0, 0, deflate_stored),          /* 0 store only */
	  new Config(4, 4, 8, 4, deflate_fast),            /* 1 max speed, no lazy matches */
	  new Config(4, 5, 16, 8, deflate_fast),           /* 2 */
	  new Config(4, 6, 32, 32, deflate_fast),          /* 3 */

	  new Config(4, 4, 16, 16, deflate_slow),          /* 4 lazy matches */
	  new Config(8, 16, 32, 32, deflate_slow),         /* 5 */
	  new Config(8, 16, 128, 128, deflate_slow),       /* 6 */
	  new Config(8, 32, 128, 256, deflate_slow),       /* 7 */
	  new Config(32, 128, 258, 1024, deflate_slow),    /* 8 */
	  new Config(32, 258, 258, 4096, deflate_slow)     /* 9 max compression */
	];


	/* ===========================================================================
	 * Initialize the "longest match" routines for a new zlib stream
	 */
	const lm_init = (s) => {

	  s.window_size = 2 * s.w_size;

	  /*** CLEAR_HASH(s); ***/
	  zero(s.head); // Fill with NIL (= 0);

	  /* Set the default configuration parameters:
	   */
	  s.max_lazy_match = configuration_table[s.level].max_lazy;
	  s.good_match = configuration_table[s.level].good_length;
	  s.nice_match = configuration_table[s.level].nice_length;
	  s.max_chain_length = configuration_table[s.level].max_chain;

	  s.strstart = 0;
	  s.block_start = 0;
	  s.lookahead = 0;
	  s.insert = 0;
	  s.match_length = s.prev_length = MIN_MATCH - 1;
	  s.match_available = 0;
	  s.ins_h = 0;
	};


	function DeflateState() {
	  this.strm = null;            /* pointer back to this zlib stream */
	  this.status = 0;            /* as the name implies */
	  this.pending_buf = null;      /* output still pending */
	  this.pending_buf_size = 0;  /* size of pending_buf */
	  this.pending_out = 0;       /* next pending byte to output to the stream */
	  this.pending = 0;           /* nb of bytes in the pending buffer */
	  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
	  this.gzhead = null;         /* gzip header information to write */
	  this.gzindex = 0;           /* where in extra, name, or comment */
	  this.method = Z_DEFLATED$2; /* can only be DEFLATED */
	  this.last_flush = -1;   /* value of flush param for previous deflate call */

	  this.w_size = 0;  /* LZ77 window size (32K by default) */
	  this.w_bits = 0;  /* log2(w_size)  (8..16) */
	  this.w_mask = 0;  /* w_size - 1 */

	  this.window = null;
	  /* Sliding window. Input bytes are read into the second half of the window,
	   * and move to the first half later to keep a dictionary of at least wSize
	   * bytes. With this organization, matches are limited to a distance of
	   * wSize-MAX_MATCH bytes, but this ensures that IO is always
	   * performed with a length multiple of the block size.
	   */

	  this.window_size = 0;
	  /* Actual size of window: 2*wSize, except when the user input buffer
	   * is directly used as sliding window.
	   */

	  this.prev = null;
	  /* Link to older string with same hash index. To limit the size of this
	   * array to 64K, this link is maintained only for the last 32K strings.
	   * An index in this array is thus a window index modulo 32K.
	   */

	  this.head = null;   /* Heads of the hash chains or NIL. */

	  this.ins_h = 0;       /* hash index of string to be inserted */
	  this.hash_size = 0;   /* number of elements in hash table */
	  this.hash_bits = 0;   /* log2(hash_size) */
	  this.hash_mask = 0;   /* hash_size-1 */

	  this.hash_shift = 0;
	  /* Number of bits by which ins_h must be shifted at each input
	   * step. It must be such that after MIN_MATCH steps, the oldest
	   * byte no longer takes part in the hash key, that is:
	   *   hash_shift * MIN_MATCH >= hash_bits
	   */

	  this.block_start = 0;
	  /* Window position at the beginning of the current output block. Gets
	   * negative when the window is moved backwards.
	   */

	  this.match_length = 0;      /* length of best match */
	  this.prev_match = 0;        /* previous match */
	  this.match_available = 0;   /* set if previous match exists */
	  this.strstart = 0;          /* start of string to insert */
	  this.match_start = 0;       /* start of matching string */
	  this.lookahead = 0;         /* number of valid bytes ahead in window */

	  this.prev_length = 0;
	  /* Length of the best match at previous step. Matches not greater than this
	   * are discarded. This is used in the lazy match evaluation.
	   */

	  this.max_chain_length = 0;
	  /* To speed up deflation, hash chains are never searched beyond this
	   * length.  A higher limit improves compression ratio but degrades the
	   * speed.
	   */

	  this.max_lazy_match = 0;
	  /* Attempt to find a better match only when the current match is strictly
	   * smaller than this value. This mechanism is used only for compression
	   * levels >= 4.
	   */
	  // That's alias to max_lazy_match, don't use directly
	  //this.max_insert_length = 0;
	  /* Insert new strings in the hash table only if the match length is not
	   * greater than this length. This saves time but degrades compression.
	   * max_insert_length is used only for compression levels <= 3.
	   */

	  this.level = 0;     /* compression level (1..9) */
	  this.strategy = 0;  /* favor or force Huffman coding*/

	  this.good_match = 0;
	  /* Use a faster search when the previous match is longer than this */

	  this.nice_match = 0; /* Stop searching when current match exceeds this */

	              /* used by trees.c: */

	  /* Didn't use ct_data typedef below to suppress compiler warning */

	  // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
	  // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
	  // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

	  // Use flat array of DOUBLE size, with interleaved fata,
	  // because JS does not support effective
	  this.dyn_ltree  = new Uint16Array(HEAP_SIZE * 2);
	  this.dyn_dtree  = new Uint16Array((2 * D_CODES + 1) * 2);
	  this.bl_tree    = new Uint16Array((2 * BL_CODES + 1) * 2);
	  zero(this.dyn_ltree);
	  zero(this.dyn_dtree);
	  zero(this.bl_tree);

	  this.l_desc   = null;         /* desc. for literal tree */
	  this.d_desc   = null;         /* desc. for distance tree */
	  this.bl_desc  = null;         /* desc. for bit length tree */

	  //ush bl_count[MAX_BITS+1];
	  this.bl_count = new Uint16Array(MAX_BITS + 1);
	  /* number of codes at each bit length for an optimal tree */

	  //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
	  this.heap = new Uint16Array(2 * L_CODES + 1);  /* heap used to build the Huffman trees */
	  zero(this.heap);

	  this.heap_len = 0;               /* number of elements in the heap */
	  this.heap_max = 0;               /* element of largest frequency */
	  /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
	   * The same heap array is used to build all trees.
	   */

	  this.depth = new Uint16Array(2 * L_CODES + 1); //uch depth[2*L_CODES+1];
	  zero(this.depth);
	  /* Depth of each subtree used as tie breaker for trees of equal frequency
	   */

	  this.sym_buf = 0;        /* buffer for distances and literals/lengths */

	  this.lit_bufsize = 0;
	  /* Size of match buffer for literals/lengths.  There are 4 reasons for
	   * limiting lit_bufsize to 64K:
	   *   - frequencies can be kept in 16 bit counters
	   *   - if compression is not successful for the first block, all input
	   *     data is still in the window so we can still emit a stored block even
	   *     when input comes from standard input.  (This can also be done for
	   *     all blocks if lit_bufsize is not greater than 32K.)
	   *   - if compression is not successful for a file smaller than 64K, we can
	   *     even emit a stored file instead of a stored block (saving 5 bytes).
	   *     This is applicable only for zip (not gzip or zlib).
	   *   - creating new Huffman trees less frequently may not provide fast
	   *     adaptation to changes in the input data statistics. (Take for
	   *     example a binary file with poorly compressible code followed by
	   *     a highly compressible string table.) Smaller buffer sizes give
	   *     fast adaptation but have of course the overhead of transmitting
	   *     trees more frequently.
	   *   - I can't count above 4
	   */

	  this.sym_next = 0;      /* running index in sym_buf */
	  this.sym_end = 0;       /* symbol table full when sym_next reaches this */

	  this.opt_len = 0;       /* bit length of current block with optimal trees */
	  this.static_len = 0;    /* bit length of current block with static trees */
	  this.matches = 0;       /* number of string matches in current block */
	  this.insert = 0;        /* bytes at end of window left to insert */


	  this.bi_buf = 0;
	  /* Output buffer. bits are inserted starting at the bottom (least
	   * significant bits).
	   */
	  this.bi_valid = 0;
	  /* Number of valid bits in bi_buf.  All bits above the last valid bit
	   * are always zero.
	   */

	  // Used for window memory init. We safely ignore it for JS. That makes
	  // sense only for pointers and memory check tools.
	  //this.high_water = 0;
	  /* High water mark offset in window for initialized bytes -- bytes above
	   * this are set to zero in order to avoid memory check warnings when
	   * longest match routines access bytes past the input.  This is then
	   * updated to the new high water mark.
	   */
	}


	/* =========================================================================
	 * Check for a valid deflate stream state. Return 0 if ok, 1 if not.
	 */
	const deflateStateCheck = (strm) => {

	  if (!strm) {
	    return 1;
	  }
	  const s = strm.state;
	  if (!s || s.strm !== strm || (s.status !== INIT_STATE &&
	//#ifdef GZIP
	                                s.status !== GZIP_STATE &&
	//#endif
	                                s.status !== EXTRA_STATE &&
	                                s.status !== NAME_STATE &&
	                                s.status !== COMMENT_STATE &&
	                                s.status !== HCRC_STATE &&
	                                s.status !== BUSY_STATE &&
	                                s.status !== FINISH_STATE)) {
	    return 1;
	  }
	  return 0;
	};


	const deflateResetKeep = (strm) => {

	  if (deflateStateCheck(strm)) {
	    return err(strm, Z_STREAM_ERROR$2);
	  }

	  strm.total_in = strm.total_out = 0;
	  strm.data_type = Z_UNKNOWN;

	  const s = strm.state;
	  s.pending = 0;
	  s.pending_out = 0;

	  if (s.wrap < 0) {
	    s.wrap = -s.wrap;
	    /* was made negative by deflate(..., Z_FINISH); */
	  }
	  s.status =
	//#ifdef GZIP
	    s.wrap === 2 ? GZIP_STATE :
	//#endif
	    s.wrap ? INIT_STATE : BUSY_STATE;
	  strm.adler = (s.wrap === 2) ?
	    0  // crc32(0, Z_NULL, 0)
	  :
	    1; // adler32(0, Z_NULL, 0)
	  s.last_flush = -2;
	  _tr_init(s);
	  return Z_OK$3;
	};


	const deflateReset = (strm) => {

	  const ret = deflateResetKeep(strm);
	  if (ret === Z_OK$3) {
	    lm_init(strm.state);
	  }
	  return ret;
	};


	const deflateSetHeader = (strm, head) => {

	  if (deflateStateCheck(strm) || strm.state.wrap !== 2) {
	    return Z_STREAM_ERROR$2;
	  }
	  strm.state.gzhead = head;
	  return Z_OK$3;
	};


	const deflateInit2 = (strm, level, method, windowBits, memLevel, strategy) => {

	  if (!strm) { // === Z_NULL
	    return Z_STREAM_ERROR$2;
	  }
	  let wrap = 1;

	  if (level === Z_DEFAULT_COMPRESSION$1) {
	    level = 6;
	  }

	  if (windowBits < 0) { /* suppress zlib wrapper */
	    wrap = 0;
	    windowBits = -windowBits;
	  }

	  else if (windowBits > 15) {
	    wrap = 2;           /* write gzip wrapper instead */
	    windowBits -= 16;
	  }


	  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED$2 ||
	    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
	    strategy < 0 || strategy > Z_FIXED || (windowBits === 8 && wrap !== 1)) {
	    return err(strm, Z_STREAM_ERROR$2);
	  }


	  if (windowBits === 8) {
	    windowBits = 9;
	  }
	  /* until 256-byte window bug fixed */

	  const s = new DeflateState();

	  strm.state = s;
	  s.strm = strm;
	  s.status = INIT_STATE;     /* to pass state test in deflateReset() */

	  s.wrap = wrap;
	  s.gzhead = null;
	  s.w_bits = windowBits;
	  s.w_size = 1 << s.w_bits;
	  s.w_mask = s.w_size - 1;

	  s.hash_bits = memLevel + 7;
	  s.hash_size = 1 << s.hash_bits;
	  s.hash_mask = s.hash_size - 1;
	  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

	  s.window = new Uint8Array(s.w_size * 2);
	  s.head = new Uint16Array(s.hash_size);
	  s.prev = new Uint16Array(s.w_size);

	  // Don't need mem init magic for JS.
	  //s.high_water = 0;  /* nothing written to s->window yet */

	  s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

	  /* We overlay pending_buf and sym_buf. This works since the average size
	   * for length/distance pairs over any compressed block is assured to be 31
	   * bits or less.
	   *
	   * Analysis: The longest fixed codes are a length code of 8 bits plus 5
	   * extra bits, for lengths 131 to 257. The longest fixed distance codes are
	   * 5 bits plus 13 extra bits, for distances 16385 to 32768. The longest
	   * possible fixed-codes length/distance pair is then 31 bits total.
	   *
	   * sym_buf starts one-fourth of the way into pending_buf. So there are
	   * three bytes in sym_buf for every four bytes in pending_buf. Each symbol
	   * in sym_buf is three bytes -- two for the distance and one for the
	   * literal/length. As each symbol is consumed, the pointer to the next
	   * sym_buf value to read moves forward three bytes. From that symbol, up to
	   * 31 bits are written to pending_buf. The closest the written pending_buf
	   * bits gets to the next sym_buf symbol to read is just before the last
	   * code is written. At that time, 31*(n-2) bits have been written, just
	   * after 24*(n-2) bits have been consumed from sym_buf. sym_buf starts at
	   * 8*n bits into pending_buf. (Note that the symbol buffer fills when n-1
	   * symbols are written.) The closest the writing gets to what is unread is
	   * then n+14 bits. Here n is lit_bufsize, which is 16384 by default, and
	   * can range from 128 to 32768.
	   *
	   * Therefore, at a minimum, there are 142 bits of space between what is
	   * written and what is read in the overlain buffers, so the symbols cannot
	   * be overwritten by the compressed data. That space is actually 139 bits,
	   * due to the three-bit fixed-code block header.
	   *
	   * That covers the case where either Z_FIXED is specified, forcing fixed
	   * codes, or when the use of fixed codes is chosen, because that choice
	   * results in a smaller compressed block than dynamic codes. That latter
	   * condition then assures that the above analysis also covers all dynamic
	   * blocks. A dynamic-code block will only be chosen to be emitted if it has
	   * fewer bits than a fixed-code block would for the same set of symbols.
	   * Therefore its average symbol length is assured to be less than 31. So
	   * the compressed data for a dynamic block also cannot overwrite the
	   * symbols from which it is being constructed.
	   */

	  s.pending_buf_size = s.lit_bufsize * 4;
	  s.pending_buf = new Uint8Array(s.pending_buf_size);

	  // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)
	  //s->sym_buf = s->pending_buf + s->lit_bufsize;
	  s.sym_buf = s.lit_bufsize;

	  //s->sym_end = (s->lit_bufsize - 1) * 3;
	  s.sym_end = (s.lit_bufsize - 1) * 3;
	  /* We avoid equality with lit_bufsize*3 because of wraparound at 64K
	   * on 16 bit machines and because stored blocks are restricted to
	   * 64K-1 bytes.
	   */

	  s.level = level;
	  s.strategy = strategy;
	  s.method = method;

	  return deflateReset(strm);
	};

	const deflateInit = (strm, level) => {

	  return deflateInit2(strm, level, Z_DEFLATED$2, MAX_WBITS$1, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY$1);
	};


	/* ========================================================================= */
	const deflate$2 = (strm, flush) => {

	  if (deflateStateCheck(strm) || flush > Z_BLOCK$1 || flush < 0) {
	    return strm ? err(strm, Z_STREAM_ERROR$2) : Z_STREAM_ERROR$2;
	  }

	  const s = strm.state;

	  if (!strm.output ||
	      (strm.avail_in !== 0 && !strm.input) ||
	      (s.status === FINISH_STATE && flush !== Z_FINISH$3)) {
	    return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR$1 : Z_STREAM_ERROR$2);
	  }

	  const old_flush = s.last_flush;
	  s.last_flush = flush;

	  /* Flush as much pending output as possible */
	  if (s.pending !== 0) {
	    flush_pending(strm);
	    if (strm.avail_out === 0) {
	      /* Since avail_out is 0, deflate will be called again with
	       * more output space, but possibly with both pending and
	       * avail_in equal to zero. There won't be anything to do,
	       * but this is not an error situation so make sure we
	       * return OK instead of BUF_ERROR at next call of deflate:
	       */
	      s.last_flush = -1;
	      return Z_OK$3;
	    }

	    /* Make sure there is something to do and avoid duplicate consecutive
	     * flushes. For repeated and useless calls with Z_FINISH, we keep
	     * returning Z_STREAM_END instead of Z_BUF_ERROR.
	     */
	  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
	    flush !== Z_FINISH$3) {
	    return err(strm, Z_BUF_ERROR$1);
	  }

	  /* User must not provide more input after the first FINISH: */
	  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
	    return err(strm, Z_BUF_ERROR$1);
	  }

	  /* Write the header */
	  if (s.status === INIT_STATE && s.wrap === 0) {
	    s.status = BUSY_STATE;
	  }
	  if (s.status === INIT_STATE) {
	    /* zlib header */
	    let header = (Z_DEFLATED$2 + ((s.w_bits - 8) << 4)) << 8;
	    let level_flags = -1;

	    if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
	      level_flags = 0;
	    } else if (s.level < 6) {
	      level_flags = 1;
	    } else if (s.level === 6) {
	      level_flags = 2;
	    } else {
	      level_flags = 3;
	    }
	    header |= (level_flags << 6);
	    if (s.strstart !== 0) { header |= PRESET_DICT; }
	    header += 31 - (header % 31);

	    putShortMSB(s, header);

	    /* Save the adler32 of the preset dictionary: */
	    if (s.strstart !== 0) {
	      putShortMSB(s, strm.adler >>> 16);
	      putShortMSB(s, strm.adler & 0xffff);
	    }
	    strm.adler = 1; // adler32(0L, Z_NULL, 0);
	    s.status = BUSY_STATE;

	    /* Compression must start with an empty pending buffer */
	    flush_pending(strm);
	    if (s.pending !== 0) {
	      s.last_flush = -1;
	      return Z_OK$3;
	    }
	  }
	//#ifdef GZIP
	  if (s.status === GZIP_STATE) {
	    /* gzip header */
	    strm.adler = 0;  //crc32(0L, Z_NULL, 0);
	    put_byte(s, 31);
	    put_byte(s, 139);
	    put_byte(s, 8);
	    if (!s.gzhead) { // s->gzhead == Z_NULL
	      put_byte(s, 0);
	      put_byte(s, 0);
	      put_byte(s, 0);
	      put_byte(s, 0);
	      put_byte(s, 0);
	      put_byte(s, s.level === 9 ? 2 :
	                  (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
	                   4 : 0));
	      put_byte(s, OS_CODE);
	      s.status = BUSY_STATE;

	      /* Compression must start with an empty pending buffer */
	      flush_pending(strm);
	      if (s.pending !== 0) {
	        s.last_flush = -1;
	        return Z_OK$3;
	      }
	    }
	    else {
	      put_byte(s, (s.gzhead.text ? 1 : 0) +
	                  (s.gzhead.hcrc ? 2 : 0) +
	                  (!s.gzhead.extra ? 0 : 4) +
	                  (!s.gzhead.name ? 0 : 8) +
	                  (!s.gzhead.comment ? 0 : 16)
	      );
	      put_byte(s, s.gzhead.time & 0xff);
	      put_byte(s, (s.gzhead.time >> 8) & 0xff);
	      put_byte(s, (s.gzhead.time >> 16) & 0xff);
	      put_byte(s, (s.gzhead.time >> 24) & 0xff);
	      put_byte(s, s.level === 9 ? 2 :
	                  (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
	                   4 : 0));
	      put_byte(s, s.gzhead.os & 0xff);
	      if (s.gzhead.extra && s.gzhead.extra.length) {
	        put_byte(s, s.gzhead.extra.length & 0xff);
	        put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
	      }
	      if (s.gzhead.hcrc) {
	        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending, 0);
	      }
	      s.gzindex = 0;
	      s.status = EXTRA_STATE;
	    }
	  }
	  if (s.status === EXTRA_STATE) {
	    if (s.gzhead.extra/* != Z_NULL*/) {
	      let beg = s.pending;   /* start of bytes to update crc */
	      let left = (s.gzhead.extra.length & 0xffff) - s.gzindex;
	      while (s.pending + left > s.pending_buf_size) {
	        let copy = s.pending_buf_size - s.pending;
	        // zmemcpy(s.pending_buf + s.pending,
	        //    s.gzhead.extra + s.gzindex, copy);
	        s.pending_buf.set(s.gzhead.extra.subarray(s.gzindex, s.gzindex + copy), s.pending);
	        s.pending = s.pending_buf_size;
	        //--- HCRC_UPDATE(beg) ---//
	        if (s.gzhead.hcrc && s.pending > beg) {
	          strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
	        }
	        //---//
	        s.gzindex += copy;
	        flush_pending(strm);
	        if (s.pending !== 0) {
	          s.last_flush = -1;
	          return Z_OK$3;
	        }
	        beg = 0;
	        left -= copy;
	      }
	      // JS specific: s.gzhead.extra may be TypedArray or Array for backward compatibility
	      //              TypedArray.slice and TypedArray.from don't exist in IE10-IE11
	      let gzhead_extra = new Uint8Array(s.gzhead.extra);
	      // zmemcpy(s->pending_buf + s->pending,
	      //     s->gzhead->extra + s->gzindex, left);
	      s.pending_buf.set(gzhead_extra.subarray(s.gzindex, s.gzindex + left), s.pending);
	      s.pending += left;
	      //--- HCRC_UPDATE(beg) ---//
	      if (s.gzhead.hcrc && s.pending > beg) {
	        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
	      }
	      //---//
	      s.gzindex = 0;
	    }
	    s.status = NAME_STATE;
	  }
	  if (s.status === NAME_STATE) {
	    if (s.gzhead.name/* != Z_NULL*/) {
	      let beg = s.pending;   /* start of bytes to update crc */
	      let val;
	      do {
	        if (s.pending === s.pending_buf_size) {
	          //--- HCRC_UPDATE(beg) ---//
	          if (s.gzhead.hcrc && s.pending > beg) {
	            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
	          }
	          //---//
	          flush_pending(strm);
	          if (s.pending !== 0) {
	            s.last_flush = -1;
	            return Z_OK$3;
	          }
	          beg = 0;
	        }
	        // JS specific: little magic to add zero terminator to end of string
	        if (s.gzindex < s.gzhead.name.length) {
	          val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
	        } else {
	          val = 0;
	        }
	        put_byte(s, val);
	      } while (val !== 0);
	      //--- HCRC_UPDATE(beg) ---//
	      if (s.gzhead.hcrc && s.pending > beg) {
	        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
	      }
	      //---//
	      s.gzindex = 0;
	    }
	    s.status = COMMENT_STATE;
	  }
	  if (s.status === COMMENT_STATE) {
	    if (s.gzhead.comment/* != Z_NULL*/) {
	      let beg = s.pending;   /* start of bytes to update crc */
	      let val;
	      do {
	        if (s.pending === s.pending_buf_size) {
	          //--- HCRC_UPDATE(beg) ---//
	          if (s.gzhead.hcrc && s.pending > beg) {
	            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
	          }
	          //---//
	          flush_pending(strm);
	          if (s.pending !== 0) {
	            s.last_flush = -1;
	            return Z_OK$3;
	          }
	          beg = 0;
	        }
	        // JS specific: little magic to add zero terminator to end of string
	        if (s.gzindex < s.gzhead.comment.length) {
	          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
	        } else {
	          val = 0;
	        }
	        put_byte(s, val);
	      } while (val !== 0);
	      //--- HCRC_UPDATE(beg) ---//
	      if (s.gzhead.hcrc && s.pending > beg) {
	        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
	      }
	      //---//
	    }
	    s.status = HCRC_STATE;
	  }
	  if (s.status === HCRC_STATE) {
	    if (s.gzhead.hcrc) {
	      if (s.pending + 2 > s.pending_buf_size) {
	        flush_pending(strm);
	        if (s.pending !== 0) {
	          s.last_flush = -1;
	          return Z_OK$3;
	        }
	      }
	      put_byte(s, strm.adler & 0xff);
	      put_byte(s, (strm.adler >> 8) & 0xff);
	      strm.adler = 0; //crc32(0L, Z_NULL, 0);
	    }
	    s.status = BUSY_STATE;

	    /* Compression must start with an empty pending buffer */
	    flush_pending(strm);
	    if (s.pending !== 0) {
	      s.last_flush = -1;
	      return Z_OK$3;
	    }
	  }
	//#endif

	  /* Start a new block or continue the current one.
	   */
	  if (strm.avail_in !== 0 || s.lookahead !== 0 ||
	    (flush !== Z_NO_FLUSH$2 && s.status !== FINISH_STATE)) {
	    let bstate = s.level === 0 ? deflate_stored(s, flush) :
	                 s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) :
	                 s.strategy === Z_RLE ? deflate_rle(s, flush) :
	                 configuration_table[s.level].func(s, flush);

	    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
	      s.status = FINISH_STATE;
	    }
	    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
	      if (strm.avail_out === 0) {
	        s.last_flush = -1;
	        /* avoid BUF_ERROR next call, see above */
	      }
	      return Z_OK$3;
	      /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
	       * of deflate should use the same flush parameter to make sure
	       * that the flush is complete. So we don't have to output an
	       * empty block here, this will be done at next call. This also
	       * ensures that for a very small output buffer, we emit at most
	       * one empty block.
	       */
	    }
	    if (bstate === BS_BLOCK_DONE) {
	      if (flush === Z_PARTIAL_FLUSH) {
	        _tr_align(s);
	      }
	      else if (flush !== Z_BLOCK$1) { /* FULL_FLUSH or SYNC_FLUSH */

	        _tr_stored_block(s, 0, 0, false);
	        /* For a full flush, this empty block will be recognized
	         * as a special marker by inflate_sync().
	         */
	        if (flush === Z_FULL_FLUSH$1) {
	          /*** CLEAR_HASH(s); ***/             /* forget history */
	          zero(s.head); // Fill with NIL (= 0);

	          if (s.lookahead === 0) {
	            s.strstart = 0;
	            s.block_start = 0;
	            s.insert = 0;
	          }
	        }
	      }
	      flush_pending(strm);
	      if (strm.avail_out === 0) {
	        s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
	        return Z_OK$3;
	      }
	    }
	  }

	  if (flush !== Z_FINISH$3) { return Z_OK$3; }
	  if (s.wrap <= 0) { return Z_STREAM_END$3; }

	  /* Write the trailer */
	  if (s.wrap === 2) {
	    put_byte(s, strm.adler & 0xff);
	    put_byte(s, (strm.adler >> 8) & 0xff);
	    put_byte(s, (strm.adler >> 16) & 0xff);
	    put_byte(s, (strm.adler >> 24) & 0xff);
	    put_byte(s, strm.total_in & 0xff);
	    put_byte(s, (strm.total_in >> 8) & 0xff);
	    put_byte(s, (strm.total_in >> 16) & 0xff);
	    put_byte(s, (strm.total_in >> 24) & 0xff);
	  }
	  else
	  {
	    putShortMSB(s, strm.adler >>> 16);
	    putShortMSB(s, strm.adler & 0xffff);
	  }

	  flush_pending(strm);
	  /* If avail_out is zero, the application will call deflate again
	   * to flush the rest.
	   */
	  if (s.wrap > 0) { s.wrap = -s.wrap; }
	  /* write the trailer only once! */
	  return s.pending !== 0 ? Z_OK$3 : Z_STREAM_END$3;
	};


	const deflateEnd = (strm) => {

	  if (deflateStateCheck(strm)) {
	    return Z_STREAM_ERROR$2;
	  }

	  const status = strm.state.status;

	  strm.state = null;

	  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR$2) : Z_OK$3;
	};


	/* =========================================================================
	 * Initializes the compression dictionary from the given byte
	 * sequence without producing any compressed output.
	 */
	const deflateSetDictionary = (strm, dictionary) => {

	  let dictLength = dictionary.length;

	  if (deflateStateCheck(strm)) {
	    return Z_STREAM_ERROR$2;
	  }

	  const s = strm.state;
	  const wrap = s.wrap;

	  if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {
	    return Z_STREAM_ERROR$2;
	  }

	  /* when using zlib wrappers, compute Adler-32 for provided dictionary */
	  if (wrap === 1) {
	    /* adler32(strm->adler, dictionary, dictLength); */
	    strm.adler = adler32_1(strm.adler, dictionary, dictLength, 0);
	  }

	  s.wrap = 0;   /* avoid computing Adler-32 in read_buf */

	  /* if dictionary would fill window, just replace the history */
	  if (dictLength >= s.w_size) {
	    if (wrap === 0) {            /* already empty otherwise */
	      /*** CLEAR_HASH(s); ***/
	      zero(s.head); // Fill with NIL (= 0);
	      s.strstart = 0;
	      s.block_start = 0;
	      s.insert = 0;
	    }
	    /* use the tail */
	    // dictionary = dictionary.slice(dictLength - s.w_size);
	    let tmpDict = new Uint8Array(s.w_size);
	    tmpDict.set(dictionary.subarray(dictLength - s.w_size, dictLength), 0);
	    dictionary = tmpDict;
	    dictLength = s.w_size;
	  }
	  /* insert dictionary into window and hash */
	  const avail = strm.avail_in;
	  const next = strm.next_in;
	  const input = strm.input;
	  strm.avail_in = dictLength;
	  strm.next_in = 0;
	  strm.input = dictionary;
	  fill_window(s);
	  while (s.lookahead >= MIN_MATCH) {
	    let str = s.strstart;
	    let n = s.lookahead - (MIN_MATCH - 1);
	    do {
	      /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
	      s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);

	      s.prev[str & s.w_mask] = s.head[s.ins_h];

	      s.head[s.ins_h] = str;
	      str++;
	    } while (--n);
	    s.strstart = str;
	    s.lookahead = MIN_MATCH - 1;
	    fill_window(s);
	  }
	  s.strstart += s.lookahead;
	  s.block_start = s.strstart;
	  s.insert = s.lookahead;
	  s.lookahead = 0;
	  s.match_length = s.prev_length = MIN_MATCH - 1;
	  s.match_available = 0;
	  strm.next_in = next;
	  strm.input = input;
	  strm.avail_in = avail;
	  s.wrap = wrap;
	  return Z_OK$3;
	};


	var deflateInit_1 = deflateInit;
	var deflateInit2_1 = deflateInit2;
	var deflateReset_1 = deflateReset;
	var deflateResetKeep_1 = deflateResetKeep;
	var deflateSetHeader_1 = deflateSetHeader;
	var deflate_2$1 = deflate$2;
	var deflateEnd_1 = deflateEnd;
	var deflateSetDictionary_1 = deflateSetDictionary;
	var deflateInfo = 'pako deflate (from Nodeca project)';

	/* Not implemented
	module.exports.deflateBound = deflateBound;
	module.exports.deflateCopy = deflateCopy;
	module.exports.deflateGetDictionary = deflateGetDictionary;
	module.exports.deflateParams = deflateParams;
	module.exports.deflatePending = deflatePending;
	module.exports.deflatePrime = deflatePrime;
	module.exports.deflateTune = deflateTune;
	*/

	var deflate_1$2 = {
		deflateInit: deflateInit_1,
		deflateInit2: deflateInit2_1,
		deflateReset: deflateReset_1,
		deflateResetKeep: deflateResetKeep_1,
		deflateSetHeader: deflateSetHeader_1,
		deflate: deflate_2$1,
		deflateEnd: deflateEnd_1,
		deflateSetDictionary: deflateSetDictionary_1,
		deflateInfo: deflateInfo
	};

	const _has = (obj, key) => {
	  return Object.prototype.hasOwnProperty.call(obj, key);
	};

	var assign = function (obj /*from1, from2, from3, ...*/) {
	  const sources = Array.prototype.slice.call(arguments, 1);
	  while (sources.length) {
	    const source = sources.shift();
	    if (!source) { continue; }

	    if (typeof source !== 'object') {
	      throw new TypeError(source + 'must be non-object');
	    }

	    for (const p in source) {
	      if (_has(source, p)) {
	        obj[p] = source[p];
	      }
	    }
	  }

	  return obj;
	};


	// Join array of chunks to single array.
	var flattenChunks = (chunks) => {
	  // calculate data length
	  let len = 0;

	  for (let i = 0, l = chunks.length; i < l; i++) {
	    len += chunks[i].length;
	  }

	  // join chunks
	  const result = new Uint8Array(len);

	  for (let i = 0, pos = 0, l = chunks.length; i < l; i++) {
	    let chunk = chunks[i];
	    result.set(chunk, pos);
	    pos += chunk.length;
	  }

	  return result;
	};

	var common = {
		assign: assign,
		flattenChunks: flattenChunks
	};

	// String encode/decode helpers


	// Quick check if we can use fast array to bin string conversion
	//
	// - apply(Array) can fail on Android 2.2
	// - apply(Uint8Array) can fail on iOS 5.1 Safari
	//
	let STR_APPLY_UIA_OK = true;

	try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch (__) { STR_APPLY_UIA_OK = false; }


	// Table with utf8 lengths (calculated by first byte of sequence)
	// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
	// because max possible codepoint is 0x10ffff
	const _utf8len = new Uint8Array(256);
	for (let q = 0; q < 256; q++) {
	  _utf8len[q] = (q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1);
	}
	_utf8len[254] = _utf8len[254] = 1; // Invalid sequence start


	// convert string to array (typed, when possible)
	var string2buf = (str) => {
	  if (typeof TextEncoder === 'function' && TextEncoder.prototype.encode) {
	    return new TextEncoder().encode(str);
	  }

	  let buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

	  // count binary size
	  for (m_pos = 0; m_pos < str_len; m_pos++) {
	    c = str.charCodeAt(m_pos);
	    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
	      c2 = str.charCodeAt(m_pos + 1);
	      if ((c2 & 0xfc00) === 0xdc00) {
	        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
	        m_pos++;
	      }
	    }
	    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
	  }

	  // allocate buffer
	  buf = new Uint8Array(buf_len);

	  // convert
	  for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
	    c = str.charCodeAt(m_pos);
	    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
	      c2 = str.charCodeAt(m_pos + 1);
	      if ((c2 & 0xfc00) === 0xdc00) {
	        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
	        m_pos++;
	      }
	    }
	    if (c < 0x80) {
	      /* one byte */
	      buf[i++] = c;
	    } else if (c < 0x800) {
	      /* two bytes */
	      buf[i++] = 0xC0 | (c >>> 6);
	      buf[i++] = 0x80 | (c & 0x3f);
	    } else if (c < 0x10000) {
	      /* three bytes */
	      buf[i++] = 0xE0 | (c >>> 12);
	      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
	      buf[i++] = 0x80 | (c & 0x3f);
	    } else {
	      /* four bytes */
	      buf[i++] = 0xf0 | (c >>> 18);
	      buf[i++] = 0x80 | (c >>> 12 & 0x3f);
	      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
	      buf[i++] = 0x80 | (c & 0x3f);
	    }
	  }

	  return buf;
	};

	// Helper
	const buf2binstring = (buf, len) => {
	  // On Chrome, the arguments in a function call that are allowed is `65534`.
	  // If the length of the buffer is smaller than that, we can use this optimization,
	  // otherwise we will take a slower path.
	  if (len < 65534) {
	    if (buf.subarray && STR_APPLY_UIA_OK) {
	      return String.fromCharCode.apply(null, buf.length === len ? buf : buf.subarray(0, len));
	    }
	  }

	  let result = '';
	  for (let i = 0; i < len; i++) {
	    result += String.fromCharCode(buf[i]);
	  }
	  return result;
	};


	// convert array to string
	var buf2string = (buf, max) => {
	  const len = max || buf.length;

	  if (typeof TextDecoder === 'function' && TextDecoder.prototype.decode) {
	    return new TextDecoder().decode(buf.subarray(0, max));
	  }

	  let i, out;

	  // Reserve max possible length (2 words per char)
	  // NB: by unknown reasons, Array is significantly faster for
	  //     String.fromCharCode.apply than Uint16Array.
	  const utf16buf = new Array(len * 2);

	  for (out = 0, i = 0; i < len;) {
	    let c = buf[i++];
	    // quick process ascii
	    if (c < 0x80) { utf16buf[out++] = c; continue; }

	    let c_len = _utf8len[c];
	    // skip 5 & 6 byte codes
	    if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len - 1; continue; }

	    // apply mask on first byte
	    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
	    // join the rest
	    while (c_len > 1 && i < len) {
	      c = (c << 6) | (buf[i++] & 0x3f);
	      c_len--;
	    }

	    // terminated by end of string?
	    if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

	    if (c < 0x10000) {
	      utf16buf[out++] = c;
	    } else {
	      c -= 0x10000;
	      utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
	      utf16buf[out++] = 0xdc00 | (c & 0x3ff);
	    }
	  }

	  return buf2binstring(utf16buf, out);
	};


	// Calculate max possible position in utf8 buffer,
	// that will not break sequence. If that's not possible
	// - (very small limits) return max size as is.
	//
	// buf[] - utf8 bytes array
	// max   - length limit (mandatory);
	var utf8border = (buf, max) => {

	  max = max || buf.length;
	  if (max > buf.length) { max = buf.length; }

	  // go back from last position, until start of sequence found
	  let pos = max - 1;
	  while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

	  // Very small and broken sequence,
	  // return max, because we should return something anyway.
	  if (pos < 0) { return max; }

	  // If we came to start of buffer - that means buffer is too small,
	  // return max too.
	  if (pos === 0) { return max; }

	  return (pos + _utf8len[buf[pos]] > max) ? pos : max;
	};

	var strings = {
		string2buf: string2buf,
		buf2string: buf2string,
		utf8border: utf8border
	};

	// (C) 1995-2013 Jean-loup Gailly and Mark Adler
	// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
	//
	// This software is provided 'as-is', without any express or implied
	// warranty. In no event will the authors be held liable for any damages
	// arising from the use of this software.
	//
	// Permission is granted to anyone to use this software for any purpose,
	// including commercial applications, and to alter it and redistribute it
	// freely, subject to the following restrictions:
	//
	// 1. The origin of this software must not be misrepresented; you must not
	//   claim that you wrote the original software. If you use this software
	//   in a product, an acknowledgment in the product documentation would be
	//   appreciated but is not required.
	// 2. Altered source versions must be plainly marked as such, and must not be
	//   misrepresented as being the original software.
	// 3. This notice may not be removed or altered from any source distribution.

	function ZStream() {
	  /* next input byte */
	  this.input = null; // JS specific, because we have no pointers
	  this.next_in = 0;
	  /* number of bytes available at input */
	  this.avail_in = 0;
	  /* total number of input bytes read so far */
	  this.total_in = 0;
	  /* next output byte should be put there */
	  this.output = null; // JS specific, because we have no pointers
	  this.next_out = 0;
	  /* remaining free space at output */
	  this.avail_out = 0;
	  /* total number of bytes output so far */
	  this.total_out = 0;
	  /* last error message, NULL if no error */
	  this.msg = ''/*Z_NULL*/;
	  /* not visible by applications */
	  this.state = null;
	  /* best guess about the data type: binary or text */
	  this.data_type = 2/*Z_UNKNOWN*/;
	  /* adler32 value of the uncompressed data */
	  this.adler = 0;
	}

	var zstream = ZStream;

	const toString$1 = Object.prototype.toString;

	/* Public constants ==========================================================*/
	/* ===========================================================================*/

	const {
	  Z_NO_FLUSH: Z_NO_FLUSH$1, Z_SYNC_FLUSH, Z_FULL_FLUSH, Z_FINISH: Z_FINISH$2,
	  Z_OK: Z_OK$2, Z_STREAM_END: Z_STREAM_END$2,
	  Z_DEFAULT_COMPRESSION,
	  Z_DEFAULT_STRATEGY,
	  Z_DEFLATED: Z_DEFLATED$1
	} = constants$2;

	/* ===========================================================================*/


	/**
	 * class Deflate
	 *
	 * Generic JS-style wrapper for zlib calls. If you don't need
	 * streaming behaviour - use more simple functions: [[deflate]],
	 * [[deflateRaw]] and [[gzip]].
	 **/

	/* internal
	 * Deflate.chunks -> Array
	 *
	 * Chunks of output data, if [[Deflate#onData]] not overridden.
	 **/

	/**
	 * Deflate.result -> Uint8Array
	 *
	 * Compressed result, generated by default [[Deflate#onData]]
	 * and [[Deflate#onEnd]] handlers. Filled after you push last chunk
	 * (call [[Deflate#push]] with `Z_FINISH` / `true` param).
	 **/

	/**
	 * Deflate.err -> Number
	 *
	 * Error code after deflate finished. 0 (Z_OK) on success.
	 * You will not need it in real life, because deflate errors
	 * are possible only on wrong options or bad `onData` / `onEnd`
	 * custom handlers.
	 **/

	/**
	 * Deflate.msg -> String
	 *
	 * Error message, if [[Deflate.err]] != 0
	 **/


	/**
	 * new Deflate(options)
	 * - options (Object): zlib deflate options.
	 *
	 * Creates new deflator instance with specified params. Throws exception
	 * on bad params. Supported options:
	 *
	 * - `level`
	 * - `windowBits`
	 * - `memLevel`
	 * - `strategy`
	 * - `dictionary`
	 *
	 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
	 * for more information on these.
	 *
	 * Additional options, for internal needs:
	 *
	 * - `chunkSize` - size of generated data chunks (16K by default)
	 * - `raw` (Boolean) - do raw deflate
	 * - `gzip` (Boolean) - create gzip wrapper
	 * - `header` (Object) - custom header for gzip
	 *   - `text` (Boolean) - true if compressed data believed to be text
	 *   - `time` (Number) - modification time, unix timestamp
	 *   - `os` (Number) - operation system code
	 *   - `extra` (Array) - array of bytes with extra data (max 65536)
	 *   - `name` (String) - file name (binary string)
	 *   - `comment` (String) - comment (binary string)
	 *   - `hcrc` (Boolean) - true if header crc should be added
	 *
	 * ##### Example:
	 *
	 * ```javascript
	 * const pako = require('pako')
	 *   , chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
	 *   , chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
	 *
	 * const deflate = new pako.Deflate({ level: 3});
	 *
	 * deflate.push(chunk1, false);
	 * deflate.push(chunk2, true);  // true -> last chunk
	 *
	 * if (deflate.err) { throw new Error(deflate.err); }
	 *
	 * console.log(deflate.result);
	 * ```
	 **/
	function Deflate$1(options) {
	  this.options = common.assign({
	    level: Z_DEFAULT_COMPRESSION,
	    method: Z_DEFLATED$1,
	    chunkSize: 16384,
	    windowBits: 15,
	    memLevel: 8,
	    strategy: Z_DEFAULT_STRATEGY
	  }, options || {});

	  let opt = this.options;

	  if (opt.raw && (opt.windowBits > 0)) {
	    opt.windowBits = -opt.windowBits;
	  }

	  else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {
	    opt.windowBits += 16;
	  }

	  this.err    = 0;      // error code, if happens (0 = Z_OK)
	  this.msg    = '';     // error message
	  this.ended  = false;  // used to avoid multiple onEnd() calls
	  this.chunks = [];     // chunks of compressed data

	  this.strm = new zstream();
	  this.strm.avail_out = 0;

	  let status = deflate_1$2.deflateInit2(
	    this.strm,
	    opt.level,
	    opt.method,
	    opt.windowBits,
	    opt.memLevel,
	    opt.strategy
	  );

	  if (status !== Z_OK$2) {
	    throw new Error(messages[status]);
	  }

	  if (opt.header) {
	    deflate_1$2.deflateSetHeader(this.strm, opt.header);
	  }

	  if (opt.dictionary) {
	    let dict;
	    // Convert data if needed
	    if (typeof opt.dictionary === 'string') {
	      // If we need to compress text, change encoding to utf8.
	      dict = strings.string2buf(opt.dictionary);
	    } else if (toString$1.call(opt.dictionary) === '[object ArrayBuffer]') {
	      dict = new Uint8Array(opt.dictionary);
	    } else {
	      dict = opt.dictionary;
	    }

	    status = deflate_1$2.deflateSetDictionary(this.strm, dict);

	    if (status !== Z_OK$2) {
	      throw new Error(messages[status]);
	    }

	    this._dict_set = true;
	  }
	}

	/**
	 * Deflate#push(data[, flush_mode]) -> Boolean
	 * - data (Uint8Array|ArrayBuffer|String): input data. Strings will be
	 *   converted to utf8 byte sequence.
	 * - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
	 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
	 *
	 * Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
	 * new compressed chunks. Returns `true` on success. The last data block must
	 * have `flush_mode` Z_FINISH (or `true`). That will flush internal pending
	 * buffers and call [[Deflate#onEnd]].
	 *
	 * On fail call [[Deflate#onEnd]] with error code and return false.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * push(chunk, false); // push one of data chunks
	 * ...
	 * push(chunk, true);  // push last chunk
	 * ```
	 **/
	Deflate$1.prototype.push = function (data, flush_mode) {
	  const strm = this.strm;
	  const chunkSize = this.options.chunkSize;
	  let status, _flush_mode;

	  if (this.ended) { return false; }

	  if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
	  else _flush_mode = flush_mode === true ? Z_FINISH$2 : Z_NO_FLUSH$1;

	  // Convert data if needed
	  if (typeof data === 'string') {
	    // If we need to compress text, change encoding to utf8.
	    strm.input = strings.string2buf(data);
	  } else if (toString$1.call(data) === '[object ArrayBuffer]') {
	    strm.input = new Uint8Array(data);
	  } else {
	    strm.input = data;
	  }

	  strm.next_in = 0;
	  strm.avail_in = strm.input.length;

	  for (;;) {
	    if (strm.avail_out === 0) {
	      strm.output = new Uint8Array(chunkSize);
	      strm.next_out = 0;
	      strm.avail_out = chunkSize;
	    }

	    // Make sure avail_out > 6 to avoid repeating markers
	    if ((_flush_mode === Z_SYNC_FLUSH || _flush_mode === Z_FULL_FLUSH) && strm.avail_out <= 6) {
	      this.onData(strm.output.subarray(0, strm.next_out));
	      strm.avail_out = 0;
	      continue;
	    }

	    status = deflate_1$2.deflate(strm, _flush_mode);

	    // Ended => flush and finish
	    if (status === Z_STREAM_END$2) {
	      if (strm.next_out > 0) {
	        this.onData(strm.output.subarray(0, strm.next_out));
	      }
	      status = deflate_1$2.deflateEnd(this.strm);
	      this.onEnd(status);
	      this.ended = true;
	      return status === Z_OK$2;
	    }

	    // Flush if out buffer full
	    if (strm.avail_out === 0) {
	      this.onData(strm.output);
	      continue;
	    }

	    // Flush if requested and has data
	    if (_flush_mode > 0 && strm.next_out > 0) {
	      this.onData(strm.output.subarray(0, strm.next_out));
	      strm.avail_out = 0;
	      continue;
	    }

	    if (strm.avail_in === 0) break;
	  }

	  return true;
	};


	/**
	 * Deflate#onData(chunk) -> Void
	 * - chunk (Uint8Array): output data.
	 *
	 * By default, stores data blocks in `chunks[]` property and glue
	 * those in `onEnd`. Override this handler, if you need another behaviour.
	 **/
	Deflate$1.prototype.onData = function (chunk) {
	  this.chunks.push(chunk);
	};


	/**
	 * Deflate#onEnd(status) -> Void
	 * - status (Number): deflate status. 0 (Z_OK) on success,
	 *   other if not.
	 *
	 * Called once after you tell deflate that the input stream is
	 * complete (Z_FINISH). By default - join collected chunks,
	 * free memory and fill `results` / `err` properties.
	 **/
	Deflate$1.prototype.onEnd = function (status) {
	  // On success - join
	  if (status === Z_OK$2) {
	    this.result = common.flattenChunks(this.chunks);
	  }
	  this.chunks = [];
	  this.err = status;
	  this.msg = this.strm.msg;
	};


	/**
	 * deflate(data[, options]) -> Uint8Array
	 * - data (Uint8Array|ArrayBuffer|String): input data to compress.
	 * - options (Object): zlib deflate options.
	 *
	 * Compress `data` with deflate algorithm and `options`.
	 *
	 * Supported options are:
	 *
	 * - level
	 * - windowBits
	 * - memLevel
	 * - strategy
	 * - dictionary
	 *
	 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
	 * for more information on these.
	 *
	 * Sugar (options):
	 *
	 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
	 *   negative windowBits implicitly.
	 *
	 * ##### Example:
	 *
	 * ```javascript
	 * const pako = require('pako')
	 * const data = new Uint8Array([1,2,3,4,5,6,7,8,9]);
	 *
	 * console.log(pako.deflate(data));
	 * ```
	 **/
	function deflate$1(input, options) {
	  const deflator = new Deflate$1(options);

	  deflator.push(input, true);

	  // That will never happens, if you don't cheat with options :)
	  if (deflator.err) { throw deflator.msg || messages[deflator.err]; }

	  return deflator.result;
	}


	/**
	 * deflateRaw(data[, options]) -> Uint8Array
	 * - data (Uint8Array|ArrayBuffer|String): input data to compress.
	 * - options (Object): zlib deflate options.
	 *
	 * The same as [[deflate]], but creates raw data, without wrapper
	 * (header and adler32 crc).
	 **/
	function deflateRaw$1(input, options) {
	  options = options || {};
	  options.raw = true;
	  return deflate$1(input, options);
	}


	/**
	 * gzip(data[, options]) -> Uint8Array
	 * - data (Uint8Array|ArrayBuffer|String): input data to compress.
	 * - options (Object): zlib deflate options.
	 *
	 * The same as [[deflate]], but create gzip wrapper instead of
	 * deflate one.
	 **/
	function gzip$1(input, options) {
	  options = options || {};
	  options.gzip = true;
	  return deflate$1(input, options);
	}


	var Deflate_1$1 = Deflate$1;
	var deflate_2 = deflate$1;
	var deflateRaw_1$1 = deflateRaw$1;
	var gzip_1$1 = gzip$1;
	var constants$1 = constants$2;

	var deflate_1$1 = {
		Deflate: Deflate_1$1,
		deflate: deflate_2,
		deflateRaw: deflateRaw_1$1,
		gzip: gzip_1$1,
		constants: constants$1
	};

	// (C) 1995-2013 Jean-loup Gailly and Mark Adler
	// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
	//
	// This software is provided 'as-is', without any express or implied
	// warranty. In no event will the authors be held liable for any damages
	// arising from the use of this software.
	//
	// Permission is granted to anyone to use this software for any purpose,
	// including commercial applications, and to alter it and redistribute it
	// freely, subject to the following restrictions:
	//
	// 1. The origin of this software must not be misrepresented; you must not
	//   claim that you wrote the original software. If you use this software
	//   in a product, an acknowledgment in the product documentation would be
	//   appreciated but is not required.
	// 2. Altered source versions must be plainly marked as such, and must not be
	//   misrepresented as being the original software.
	// 3. This notice may not be removed or altered from any source distribution.

	// See state defs from inflate.js
	const BAD$1 = 16209;       /* got a data error -- remain here until reset */
	const TYPE$1 = 16191;      /* i: waiting for type bits, including last-flag bit */

	/*
	   Decode literal, length, and distance codes and write out the resulting
	   literal and match bytes until either not enough input or output is
	   available, an end-of-block is encountered, or a data error is encountered.
	   When large enough input and output buffers are supplied to inflate(), for
	   example, a 16K input buffer and a 64K output buffer, more than 95% of the
	   inflate execution time is spent in this routine.

	   Entry assumptions:

	        state.mode === LEN
	        strm.avail_in >= 6
	        strm.avail_out >= 258
	        start >= strm.avail_out
	        state.bits < 8

	   On return, state.mode is one of:

	        LEN -- ran out of enough output space or enough available input
	        TYPE -- reached end of block code, inflate() to interpret next block
	        BAD -- error in block data

	   Notes:

	    - The maximum input bits used by a length/distance pair is 15 bits for the
	      length code, 5 bits for the length extra, 15 bits for the distance code,
	      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
	      Therefore if strm.avail_in >= 6, then there is enough input to avoid
	      checking for available input while decoding.

	    - The maximum bytes that a single length/distance pair can output is 258
	      bytes, which is the maximum length that can be coded.  inflate_fast()
	      requires strm.avail_out >= 258 for each loop to avoid checking for
	      output space.
	 */
	var inffast = function inflate_fast(strm, start) {
	  let _in;                    /* local strm.input */
	  let last;                   /* have enough input while in < last */
	  let _out;                   /* local strm.output */
	  let beg;                    /* inflate()'s initial strm.output */
	  let end;                    /* while out < end, enough space available */
	//#ifdef INFLATE_STRICT
	  let dmax;                   /* maximum distance from zlib header */
	//#endif
	  let wsize;                  /* window size or zero if not using window */
	  let whave;                  /* valid bytes in the window */
	  let wnext;                  /* window write index */
	  // Use `s_window` instead `window`, avoid conflict with instrumentation tools
	  let s_window;               /* allocated sliding window, if wsize != 0 */
	  let hold;                   /* local strm.hold */
	  let bits;                   /* local strm.bits */
	  let lcode;                  /* local strm.lencode */
	  let dcode;                  /* local strm.distcode */
	  let lmask;                  /* mask for first level of length codes */
	  let dmask;                  /* mask for first level of distance codes */
	  let here;                   /* retrieved table entry */
	  let op;                     /* code bits, operation, extra bits, or */
	                              /*  window position, window bytes to copy */
	  let len;                    /* match length, unused bytes */
	  let dist;                   /* match distance */
	  let from;                   /* where to copy match from */
	  let from_source;


	  let input, output; // JS specific, because we have no pointers

	  /* copy state to local variables */
	  const state = strm.state;
	  //here = state.here;
	  _in = strm.next_in;
	  input = strm.input;
	  last = _in + (strm.avail_in - 5);
	  _out = strm.next_out;
	  output = strm.output;
	  beg = _out - (start - strm.avail_out);
	  end = _out + (strm.avail_out - 257);
	//#ifdef INFLATE_STRICT
	  dmax = state.dmax;
	//#endif
	  wsize = state.wsize;
	  whave = state.whave;
	  wnext = state.wnext;
	  s_window = state.window;
	  hold = state.hold;
	  bits = state.bits;
	  lcode = state.lencode;
	  dcode = state.distcode;
	  lmask = (1 << state.lenbits) - 1;
	  dmask = (1 << state.distbits) - 1;


	  /* decode literals and length/distances until end-of-block or not enough
	     input data or output space */

	  top:
	  do {
	    if (bits < 15) {
	      hold += input[_in++] << bits;
	      bits += 8;
	      hold += input[_in++] << bits;
	      bits += 8;
	    }

	    here = lcode[hold & lmask];

	    dolen:
	    for (;;) { // Goto emulation
	      op = here >>> 24/*here.bits*/;
	      hold >>>= op;
	      bits -= op;
	      op = (here >>> 16) & 0xff/*here.op*/;
	      if (op === 0) {                          /* literal */
	        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
	        //        "inflate:         literal '%c'\n" :
	        //        "inflate:         literal 0x%02x\n", here.val));
	        output[_out++] = here & 0xffff/*here.val*/;
	      }
	      else if (op & 16) {                     /* length base */
	        len = here & 0xffff/*here.val*/;
	        op &= 15;                           /* number of extra bits */
	        if (op) {
	          if (bits < op) {
	            hold += input[_in++] << bits;
	            bits += 8;
	          }
	          len += hold & ((1 << op) - 1);
	          hold >>>= op;
	          bits -= op;
	        }
	        //Tracevv((stderr, "inflate:         length %u\n", len));
	        if (bits < 15) {
	          hold += input[_in++] << bits;
	          bits += 8;
	          hold += input[_in++] << bits;
	          bits += 8;
	        }
	        here = dcode[hold & dmask];

	        dodist:
	        for (;;) { // goto emulation
	          op = here >>> 24/*here.bits*/;
	          hold >>>= op;
	          bits -= op;
	          op = (here >>> 16) & 0xff/*here.op*/;

	          if (op & 16) {                      /* distance base */
	            dist = here & 0xffff/*here.val*/;
	            op &= 15;                       /* number of extra bits */
	            if (bits < op) {
	              hold += input[_in++] << bits;
	              bits += 8;
	              if (bits < op) {
	                hold += input[_in++] << bits;
	                bits += 8;
	              }
	            }
	            dist += hold & ((1 << op) - 1);
	//#ifdef INFLATE_STRICT
	            if (dist > dmax) {
	              strm.msg = 'invalid distance too far back';
	              state.mode = BAD$1;
	              break top;
	            }
	//#endif
	            hold >>>= op;
	            bits -= op;
	            //Tracevv((stderr, "inflate:         distance %u\n", dist));
	            op = _out - beg;                /* max distance in output */
	            if (dist > op) {                /* see if copy from window */
	              op = dist - op;               /* distance back in window */
	              if (op > whave) {
	                if (state.sane) {
	                  strm.msg = 'invalid distance too far back';
	                  state.mode = BAD$1;
	                  break top;
	                }

	// (!) This block is disabled in zlib defaults,
	// don't enable it for binary compatibility
	//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
	//                if (len <= op - whave) {
	//                  do {
	//                    output[_out++] = 0;
	//                  } while (--len);
	//                  continue top;
	//                }
	//                len -= op - whave;
	//                do {
	//                  output[_out++] = 0;
	//                } while (--op > whave);
	//                if (op === 0) {
	//                  from = _out - dist;
	//                  do {
	//                    output[_out++] = output[from++];
	//                  } while (--len);
	//                  continue top;
	//                }
	//#endif
	              }
	              from = 0; // window index
	              from_source = s_window;
	              if (wnext === 0) {           /* very common case */
	                from += wsize - op;
	                if (op < len) {         /* some from window */
	                  len -= op;
	                  do {
	                    output[_out++] = s_window[from++];
	                  } while (--op);
	                  from = _out - dist;  /* rest from output */
	                  from_source = output;
	                }
	              }
	              else if (wnext < op) {      /* wrap around window */
	                from += wsize + wnext - op;
	                op -= wnext;
	                if (op < len) {         /* some from end of window */
	                  len -= op;
	                  do {
	                    output[_out++] = s_window[from++];
	                  } while (--op);
	                  from = 0;
	                  if (wnext < len) {  /* some from start of window */
	                    op = wnext;
	                    len -= op;
	                    do {
	                      output[_out++] = s_window[from++];
	                    } while (--op);
	                    from = _out - dist;      /* rest from output */
	                    from_source = output;
	                  }
	                }
	              }
	              else {                      /* contiguous in window */
	                from += wnext - op;
	                if (op < len) {         /* some from window */
	                  len -= op;
	                  do {
	                    output[_out++] = s_window[from++];
	                  } while (--op);
	                  from = _out - dist;  /* rest from output */
	                  from_source = output;
	                }
	              }
	              while (len > 2) {
	                output[_out++] = from_source[from++];
	                output[_out++] = from_source[from++];
	                output[_out++] = from_source[from++];
	                len -= 3;
	              }
	              if (len) {
	                output[_out++] = from_source[from++];
	                if (len > 1) {
	                  output[_out++] = from_source[from++];
	                }
	              }
	            }
	            else {
	              from = _out - dist;          /* copy direct from output */
	              do {                        /* minimum length is three */
	                output[_out++] = output[from++];
	                output[_out++] = output[from++];
	                output[_out++] = output[from++];
	                len -= 3;
	              } while (len > 2);
	              if (len) {
	                output[_out++] = output[from++];
	                if (len > 1) {
	                  output[_out++] = output[from++];
	                }
	              }
	            }
	          }
	          else if ((op & 64) === 0) {          /* 2nd level distance code */
	            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
	            continue dodist;
	          }
	          else {
	            strm.msg = 'invalid distance code';
	            state.mode = BAD$1;
	            break top;
	          }

	          break; // need to emulate goto via "continue"
	        }
	      }
	      else if ((op & 64) === 0) {              /* 2nd level length code */
	        here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
	        continue dolen;
	      }
	      else if (op & 32) {                     /* end-of-block */
	        //Tracevv((stderr, "inflate:         end of block\n"));
	        state.mode = TYPE$1;
	        break top;
	      }
	      else {
	        strm.msg = 'invalid literal/length code';
	        state.mode = BAD$1;
	        break top;
	      }

	      break; // need to emulate goto via "continue"
	    }
	  } while (_in < last && _out < end);

	  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
	  len = bits >> 3;
	  _in -= len;
	  bits -= len << 3;
	  hold &= (1 << bits) - 1;

	  /* update state and return */
	  strm.next_in = _in;
	  strm.next_out = _out;
	  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
	  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
	  state.hold = hold;
	  state.bits = bits;
	  return;
	};

	// (C) 1995-2013 Jean-loup Gailly and Mark Adler
	// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
	//
	// This software is provided 'as-is', without any express or implied
	// warranty. In no event will the authors be held liable for any damages
	// arising from the use of this software.
	//
	// Permission is granted to anyone to use this software for any purpose,
	// including commercial applications, and to alter it and redistribute it
	// freely, subject to the following restrictions:
	//
	// 1. The origin of this software must not be misrepresented; you must not
	//   claim that you wrote the original software. If you use this software
	//   in a product, an acknowledgment in the product documentation would be
	//   appreciated but is not required.
	// 2. Altered source versions must be plainly marked as such, and must not be
	//   misrepresented as being the original software.
	// 3. This notice may not be removed or altered from any source distribution.

	const MAXBITS = 15;
	const ENOUGH_LENS$1 = 852;
	const ENOUGH_DISTS$1 = 592;
	//const ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

	const CODES$1 = 0;
	const LENS$1 = 1;
	const DISTS$1 = 2;

	const lbase = new Uint16Array([ /* Length codes 257..285 base */
	  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
	  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
	]);

	const lext = new Uint8Array([ /* Length codes 257..285 extra */
	  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
	  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
	]);

	const dbase = new Uint16Array([ /* Distance codes 0..29 base */
	  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
	  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
	  8193, 12289, 16385, 24577, 0, 0
	]);

	const dext = new Uint8Array([ /* Distance codes 0..29 extra */
	  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
	  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
	  28, 28, 29, 29, 64, 64
	]);

	const inflate_table = (type, lens, lens_index, codes, table, table_index, work, opts) =>
	{
	  const bits = opts.bits;
	      //here = opts.here; /* table entry for duplication */

	  let len = 0;               /* a code's length in bits */
	  let sym = 0;               /* index of code symbols */
	  let min = 0, max = 0;          /* minimum and maximum code lengths */
	  let root = 0;              /* number of index bits for root table */
	  let curr = 0;              /* number of index bits for current table */
	  let drop = 0;              /* code bits to drop for sub-table */
	  let left = 0;                   /* number of prefix codes available */
	  let used = 0;              /* code entries in table used */
	  let huff = 0;              /* Huffman code */
	  let incr;              /* for incrementing code, index */
	  let fill;              /* index for replicating entries */
	  let low;               /* low bits for current root entry */
	  let mask;              /* mask for low root bits */
	  let next;             /* next available space in table */
	  let base = null;     /* base value table to use */
	//  let shoextra;    /* extra bits table to use */
	  let match;                  /* use base and extra for symbol >= match */
	  const count = new Uint16Array(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
	  const offs = new Uint16Array(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
	  let extra = null;

	  let here_bits, here_op, here_val;

	  /*
	   Process a set of code lengths to create a canonical Huffman code.  The
	   code lengths are lens[0..codes-1].  Each length corresponds to the
	   symbols 0..codes-1.  The Huffman code is generated by first sorting the
	   symbols by length from short to long, and retaining the symbol order
	   for codes with equal lengths.  Then the code starts with all zero bits
	   for the first code of the shortest length, and the codes are integer
	   increments for the same length, and zeros are appended as the length
	   increases.  For the deflate format, these bits are stored backwards
	   from their more natural integer increment ordering, and so when the
	   decoding tables are built in the large loop below, the integer codes
	   are incremented backwards.

	   This routine assumes, but does not check, that all of the entries in
	   lens[] are in the range 0..MAXBITS.  The caller must assure this.
	   1..MAXBITS is interpreted as that code length.  zero means that that
	   symbol does not occur in this code.

	   The codes are sorted by computing a count of codes for each length,
	   creating from that a table of starting indices for each length in the
	   sorted table, and then entering the symbols in order in the sorted
	   table.  The sorted table is work[], with that space being provided by
	   the caller.

	   The length counts are used for other purposes as well, i.e. finding
	   the minimum and maximum length codes, determining if there are any
	   codes at all, checking for a valid set of lengths, and looking ahead
	   at length counts to determine sub-table sizes when building the
	   decoding tables.
	   */

	  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
	  for (len = 0; len <= MAXBITS; len++) {
	    count[len] = 0;
	  }
	  for (sym = 0; sym < codes; sym++) {
	    count[lens[lens_index + sym]]++;
	  }

	  /* bound code lengths, force root to be within code lengths */
	  root = bits;
	  for (max = MAXBITS; max >= 1; max--) {
	    if (count[max] !== 0) { break; }
	  }
	  if (root > max) {
	    root = max;
	  }
	  if (max === 0) {                     /* no symbols to code at all */
	    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
	    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
	    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
	    table[table_index++] = (1 << 24) | (64 << 16) | 0;


	    //table.op[opts.table_index] = 64;
	    //table.bits[opts.table_index] = 1;
	    //table.val[opts.table_index++] = 0;
	    table[table_index++] = (1 << 24) | (64 << 16) | 0;

	    opts.bits = 1;
	    return 0;     /* no symbols, but wait for decoding to report error */
	  }
	  for (min = 1; min < max; min++) {
	    if (count[min] !== 0) { break; }
	  }
	  if (root < min) {
	    root = min;
	  }

	  /* check for an over-subscribed or incomplete set of lengths */
	  left = 1;
	  for (len = 1; len <= MAXBITS; len++) {
	    left <<= 1;
	    left -= count[len];
	    if (left < 0) {
	      return -1;
	    }        /* over-subscribed */
	  }
	  if (left > 0 && (type === CODES$1 || max !== 1)) {
	    return -1;                      /* incomplete set */
	  }

	  /* generate offsets into symbol table for each length for sorting */
	  offs[1] = 0;
	  for (len = 1; len < MAXBITS; len++) {
	    offs[len + 1] = offs[len] + count[len];
	  }

	  /* sort symbols by length, by symbol order within each length */
	  for (sym = 0; sym < codes; sym++) {
	    if (lens[lens_index + sym] !== 0) {
	      work[offs[lens[lens_index + sym]]++] = sym;
	    }
	  }

	  /*
	   Create and fill in decoding tables.  In this loop, the table being
	   filled is at next and has curr index bits.  The code being used is huff
	   with length len.  That code is converted to an index by dropping drop
	   bits off of the bottom.  For codes where len is less than drop + curr,
	   those top drop + curr - len bits are incremented through all values to
	   fill the table with replicated entries.

	   root is the number of index bits for the root table.  When len exceeds
	   root, sub-tables are created pointed to by the root entry with an index
	   of the low root bits of huff.  This is saved in low to check for when a
	   new sub-table should be started.  drop is zero when the root table is
	   being filled, and drop is root when sub-tables are being filled.

	   When a new sub-table is needed, it is necessary to look ahead in the
	   code lengths to determine what size sub-table is needed.  The length
	   counts are used for this, and so count[] is decremented as codes are
	   entered in the tables.

	   used keeps track of how many table entries have been allocated from the
	   provided *table space.  It is checked for LENS and DIST tables against
	   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
	   the initial root table size constants.  See the comments in inftrees.h
	   for more information.

	   sym increments through all symbols, and the loop terminates when
	   all codes of length max, i.e. all codes, have been processed.  This
	   routine permits incomplete codes, so another loop after this one fills
	   in the rest of the decoding tables with invalid code markers.
	   */

	  /* set up for code type */
	  // poor man optimization - use if-else instead of switch,
	  // to avoid deopts in old v8
	  if (type === CODES$1) {
	    base = extra = work;    /* dummy value--not used */
	    match = 20;

	  } else if (type === LENS$1) {
	    base = lbase;
	    extra = lext;
	    match = 257;

	  } else {                    /* DISTS */
	    base = dbase;
	    extra = dext;
	    match = 0;
	  }

	  /* initialize opts for loop */
	  huff = 0;                   /* starting code */
	  sym = 0;                    /* starting code symbol */
	  len = min;                  /* starting code length */
	  next = table_index;              /* current table to fill in */
	  curr = root;                /* current table index bits */
	  drop = 0;                   /* current bits to drop from code for index */
	  low = -1;                   /* trigger new sub-table when len > root */
	  used = 1 << root;          /* use root table entries */
	  mask = used - 1;            /* mask for comparing low */

	  /* check available table space */
	  if ((type === LENS$1 && used > ENOUGH_LENS$1) ||
	    (type === DISTS$1 && used > ENOUGH_DISTS$1)) {
	    return 1;
	  }

	  /* process all codes and make table entries */
	  for (;;) {
	    /* create table entry */
	    here_bits = len - drop;
	    if (work[sym] + 1 < match) {
	      here_op = 0;
	      here_val = work[sym];
	    }
	    else if (work[sym] >= match) {
	      here_op = extra[work[sym] - match];
	      here_val = base[work[sym] - match];
	    }
	    else {
	      here_op = 32 + 64;         /* end of block */
	      here_val = 0;
	    }

	    /* replicate for those indices with low len bits equal to huff */
	    incr = 1 << (len - drop);
	    fill = 1 << curr;
	    min = fill;                 /* save offset to next table */
	    do {
	      fill -= incr;
	      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
	    } while (fill !== 0);

	    /* backwards increment the len-bit code huff */
	    incr = 1 << (len - 1);
	    while (huff & incr) {
	      incr >>= 1;
	    }
	    if (incr !== 0) {
	      huff &= incr - 1;
	      huff += incr;
	    } else {
	      huff = 0;
	    }

	    /* go to next symbol, update count, len */
	    sym++;
	    if (--count[len] === 0) {
	      if (len === max) { break; }
	      len = lens[lens_index + work[sym]];
	    }

	    /* create new sub-table if needed */
	    if (len > root && (huff & mask) !== low) {
	      /* if first time, transition to sub-tables */
	      if (drop === 0) {
	        drop = root;
	      }

	      /* increment past last table */
	      next += min;            /* here min is 1 << curr */

	      /* determine length of next table */
	      curr = len - drop;
	      left = 1 << curr;
	      while (curr + drop < max) {
	        left -= count[curr + drop];
	        if (left <= 0) { break; }
	        curr++;
	        left <<= 1;
	      }

	      /* check for enough space */
	      used += 1 << curr;
	      if ((type === LENS$1 && used > ENOUGH_LENS$1) ||
	        (type === DISTS$1 && used > ENOUGH_DISTS$1)) {
	        return 1;
	      }

	      /* point entry in root table to sub-table */
	      low = huff & mask;
	      /*table.op[low] = curr;
	      table.bits[low] = root;
	      table.val[low] = next - opts.table_index;*/
	      table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
	    }
	  }

	  /* fill in remaining table entry if code is incomplete (guaranteed to have
	   at most one remaining entry, since if the code is incomplete, the
	   maximum code length that was allowed to get this far is one bit) */
	  if (huff !== 0) {
	    //table.op[next + huff] = 64;            /* invalid code marker */
	    //table.bits[next + huff] = len - drop;
	    //table.val[next + huff] = 0;
	    table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
	  }

	  /* set return parameters */
	  //opts.table_index += used;
	  opts.bits = root;
	  return 0;
	};


	var inftrees = inflate_table;

	// (C) 1995-2013 Jean-loup Gailly and Mark Adler
	// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
	//
	// This software is provided 'as-is', without any express or implied
	// warranty. In no event will the authors be held liable for any damages
	// arising from the use of this software.
	//
	// Permission is granted to anyone to use this software for any purpose,
	// including commercial applications, and to alter it and redistribute it
	// freely, subject to the following restrictions:
	//
	// 1. The origin of this software must not be misrepresented; you must not
	//   claim that you wrote the original software. If you use this software
	//   in a product, an acknowledgment in the product documentation would be
	//   appreciated but is not required.
	// 2. Altered source versions must be plainly marked as such, and must not be
	//   misrepresented as being the original software.
	// 3. This notice may not be removed or altered from any source distribution.






	const CODES = 0;
	const LENS = 1;
	const DISTS = 2;

	/* Public constants ==========================================================*/
	/* ===========================================================================*/

	const {
	  Z_FINISH: Z_FINISH$1, Z_BLOCK, Z_TREES,
	  Z_OK: Z_OK$1, Z_STREAM_END: Z_STREAM_END$1, Z_NEED_DICT: Z_NEED_DICT$1, Z_STREAM_ERROR: Z_STREAM_ERROR$1, Z_DATA_ERROR: Z_DATA_ERROR$1, Z_MEM_ERROR: Z_MEM_ERROR$1, Z_BUF_ERROR,
	  Z_DEFLATED
	} = constants$2;


	/* STATES ====================================================================*/
	/* ===========================================================================*/


	const    HEAD = 16180;       /* i: waiting for magic header */
	const    FLAGS = 16181;      /* i: waiting for method and flags (gzip) */
	const    TIME = 16182;       /* i: waiting for modification time (gzip) */
	const    OS = 16183;         /* i: waiting for extra flags and operating system (gzip) */
	const    EXLEN = 16184;      /* i: waiting for extra length (gzip) */
	const    EXTRA = 16185;      /* i: waiting for extra bytes (gzip) */
	const    NAME = 16186;       /* i: waiting for end of file name (gzip) */
	const    COMMENT = 16187;    /* i: waiting for end of comment (gzip) */
	const    HCRC = 16188;       /* i: waiting for header crc (gzip) */
	const    DICTID = 16189;    /* i: waiting for dictionary check value */
	const    DICT = 16190;      /* waiting for inflateSetDictionary() call */
	const        TYPE = 16191;      /* i: waiting for type bits, including last-flag bit */
	const        TYPEDO = 16192;    /* i: same, but skip check to exit inflate on new block */
	const        STORED = 16193;    /* i: waiting for stored size (length and complement) */
	const        COPY_ = 16194;     /* i/o: same as COPY below, but only first time in */
	const        COPY = 16195;      /* i/o: waiting for input or output to copy stored block */
	const        TABLE = 16196;     /* i: waiting for dynamic block table lengths */
	const        LENLENS = 16197;   /* i: waiting for code length code lengths */
	const        CODELENS = 16198;  /* i: waiting for length/lit and distance code lengths */
	const            LEN_ = 16199;      /* i: same as LEN below, but only first time in */
	const            LEN = 16200;       /* i: waiting for length/lit/eob code */
	const            LENEXT = 16201;    /* i: waiting for length extra bits */
	const            DIST = 16202;      /* i: waiting for distance code */
	const            DISTEXT = 16203;   /* i: waiting for distance extra bits */
	const            MATCH = 16204;     /* o: waiting for output space to copy string */
	const            LIT = 16205;       /* o: waiting for output space to write literal */
	const    CHECK = 16206;     /* i: waiting for 32-bit check value */
	const    LENGTH = 16207;    /* i: waiting for 32-bit length (gzip) */
	const    DONE = 16208;      /* finished check, done -- remain here until reset */
	const    BAD = 16209;       /* got a data error -- remain here until reset */
	const    MEM = 16210;       /* got an inflate() memory error -- remain here until reset */
	const    SYNC = 16211;      /* looking for synchronization bytes to restart inflate() */

	/* ===========================================================================*/



	const ENOUGH_LENS = 852;
	const ENOUGH_DISTS = 592;
	//const ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

	const MAX_WBITS = 15;
	/* 32K LZ77 window */
	const DEF_WBITS = MAX_WBITS;


	const zswap32 = (q) => {

	  return  (((q >>> 24) & 0xff) +
	          ((q >>> 8) & 0xff00) +
	          ((q & 0xff00) << 8) +
	          ((q & 0xff) << 24));
	};


	function InflateState() {
	  this.strm = null;           /* pointer back to this zlib stream */
	  this.mode = 0;              /* current inflate mode */
	  this.last = false;          /* true if processing last block */
	  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip,
	                                 bit 2 true to validate check value */
	  this.havedict = false;      /* true if dictionary provided */
	  this.flags = 0;             /* gzip header method and flags (0 if zlib), or
	                                 -1 if raw or no header yet */
	  this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */
	  this.check = 0;             /* protected copy of check value */
	  this.total = 0;             /* protected copy of output count */
	  // TODO: may be {}
	  this.head = null;           /* where to save gzip header information */

	  /* sliding window */
	  this.wbits = 0;             /* log base 2 of requested window size */
	  this.wsize = 0;             /* window size or zero if not using window */
	  this.whave = 0;             /* valid bytes in the window */
	  this.wnext = 0;             /* window write index */
	  this.window = null;         /* allocated sliding window, if needed */

	  /* bit accumulator */
	  this.hold = 0;              /* input bit accumulator */
	  this.bits = 0;              /* number of bits in "in" */

	  /* for string and stored block copying */
	  this.length = 0;            /* literal or length of data to copy */
	  this.offset = 0;            /* distance back to copy string from */

	  /* for table and code decoding */
	  this.extra = 0;             /* extra bits needed */

	  /* fixed and dynamic code tables */
	  this.lencode = null;          /* starting table for length/literal codes */
	  this.distcode = null;         /* starting table for distance codes */
	  this.lenbits = 0;           /* index bits for lencode */
	  this.distbits = 0;          /* index bits for distcode */

	  /* dynamic table building */
	  this.ncode = 0;             /* number of code length code lengths */
	  this.nlen = 0;              /* number of length code lengths */
	  this.ndist = 0;             /* number of distance code lengths */
	  this.have = 0;              /* number of code lengths in lens[] */
	  this.next = null;              /* next available space in codes[] */

	  this.lens = new Uint16Array(320); /* temporary storage for code lengths */
	  this.work = new Uint16Array(288); /* work area for code table building */

	  /*
	   because we don't have pointers in js, we use lencode and distcode directly
	   as buffers so we don't need codes
	  */
	  //this.codes = new Int32Array(ENOUGH);       /* space for code tables */
	  this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */
	  this.distdyn = null;             /* dynamic table for distance codes (JS specific) */
	  this.sane = 0;                   /* if false, allow invalid distance too far */
	  this.back = 0;                   /* bits back of last unprocessed length/lit */
	  this.was = 0;                    /* initial length of match */
	}


	const inflateStateCheck = (strm) => {

	  if (!strm) {
	    return 1;
	  }
	  const state = strm.state;
	  if (!state || state.strm !== strm ||
	    state.mode < HEAD || state.mode > SYNC) {
	    return 1;
	  }
	  return 0;
	};


	const inflateResetKeep = (strm) => {

	  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
	  const state = strm.state;
	  strm.total_in = strm.total_out = state.total = 0;
	  strm.msg = ''; /*Z_NULL*/
	  if (state.wrap) {       /* to support ill-conceived Java test suite */
	    strm.adler = state.wrap & 1;
	  }
	  state.mode = HEAD;
	  state.last = 0;
	  state.havedict = 0;
	  state.flags = -1;
	  state.dmax = 32768;
	  state.head = null/*Z_NULL*/;
	  state.hold = 0;
	  state.bits = 0;
	  //state.lencode = state.distcode = state.next = state.codes;
	  state.lencode = state.lendyn = new Int32Array(ENOUGH_LENS);
	  state.distcode = state.distdyn = new Int32Array(ENOUGH_DISTS);

	  state.sane = 1;
	  state.back = -1;
	  //Tracev((stderr, "inflate: reset\n"));
	  return Z_OK$1;
	};


	const inflateReset = (strm) => {

	  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
	  const state = strm.state;
	  state.wsize = 0;
	  state.whave = 0;
	  state.wnext = 0;
	  return inflateResetKeep(strm);

	};


	const inflateReset2 = (strm, windowBits) => {
	  let wrap;

	  /* get the state */
	  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
	  const state = strm.state;

	  /* extract wrap request from windowBits parameter */
	  if (windowBits < 0) {
	    wrap = 0;
	    windowBits = -windowBits;
	  }
	  else {
	    wrap = (windowBits >> 4) + 5;
	    if (windowBits < 48) {
	      windowBits &= 15;
	    }
	  }

	  /* set number of window bits, free window if different */
	  if (windowBits && (windowBits < 8 || windowBits > 15)) {
	    return Z_STREAM_ERROR$1;
	  }
	  if (state.window !== null && state.wbits !== windowBits) {
	    state.window = null;
	  }

	  /* update state and reset the rest of it */
	  state.wrap = wrap;
	  state.wbits = windowBits;
	  return inflateReset(strm);
	};


	const inflateInit2 = (strm, windowBits) => {

	  if (!strm) { return Z_STREAM_ERROR$1; }
	  //strm.msg = Z_NULL;                 /* in case we return an error */

	  const state = new InflateState();

	  //if (state === Z_NULL) return Z_MEM_ERROR;
	  //Tracev((stderr, "inflate: allocated\n"));
	  strm.state = state;
	  state.strm = strm;
	  state.window = null/*Z_NULL*/;
	  state.mode = HEAD;     /* to pass state test in inflateReset2() */
	  const ret = inflateReset2(strm, windowBits);
	  if (ret !== Z_OK$1) {
	    strm.state = null/*Z_NULL*/;
	  }
	  return ret;
	};


	const inflateInit = (strm) => {

	  return inflateInit2(strm, DEF_WBITS);
	};


	/*
	 Return state with length and distance decoding tables and index sizes set to
	 fixed code decoding.  Normally this returns fixed tables from inffixed.h.
	 If BUILDFIXED is defined, then instead this routine builds the tables the
	 first time it's called, and returns those tables the first time and
	 thereafter.  This reduces the size of the code by about 2K bytes, in
	 exchange for a little execution time.  However, BUILDFIXED should not be
	 used for threaded applications, since the rewriting of the tables and virgin
	 may not be thread-safe.
	 */
	let virgin = true;

	let lenfix, distfix; // We have no pointers in JS, so keep tables separate


	const fixedtables = (state) => {

	  /* build fixed huffman tables if first call (may not be thread safe) */
	  if (virgin) {
	    lenfix = new Int32Array(512);
	    distfix = new Int32Array(32);

	    /* literal/length table */
	    let sym = 0;
	    while (sym < 144) { state.lens[sym++] = 8; }
	    while (sym < 256) { state.lens[sym++] = 9; }
	    while (sym < 280) { state.lens[sym++] = 7; }
	    while (sym < 288) { state.lens[sym++] = 8; }

	    inftrees(LENS,  state.lens, 0, 288, lenfix,   0, state.work, { bits: 9 });

	    /* distance table */
	    sym = 0;
	    while (sym < 32) { state.lens[sym++] = 5; }

	    inftrees(DISTS, state.lens, 0, 32,   distfix, 0, state.work, { bits: 5 });

	    /* do this just once */
	    virgin = false;
	  }

	  state.lencode = lenfix;
	  state.lenbits = 9;
	  state.distcode = distfix;
	  state.distbits = 5;
	};


	/*
	 Update the window with the last wsize (normally 32K) bytes written before
	 returning.  If window does not exist yet, create it.  This is only called
	 when a window is already in use, or when output has been written during this
	 inflate call, but the end of the deflate stream has not been reached yet.
	 It is also called to create a window for dictionary data when a dictionary
	 is loaded.

	 Providing output buffers larger than 32K to inflate() should provide a speed
	 advantage, since only the last 32K of output is copied to the sliding window
	 upon return from inflate(), and since all distances after the first 32K of
	 output will fall in the output data, making match copies simpler and faster.
	 The advantage may be dependent on the size of the processor's data caches.
	 */
	const updatewindow = (strm, src, end, copy) => {

	  let dist;
	  const state = strm.state;

	  /* if it hasn't been done already, allocate space for the window */
	  if (state.window === null) {
	    state.wsize = 1 << state.wbits;
	    state.wnext = 0;
	    state.whave = 0;

	    state.window = new Uint8Array(state.wsize);
	  }

	  /* copy state->wsize or less output bytes into the circular window */
	  if (copy >= state.wsize) {
	    state.window.set(src.subarray(end - state.wsize, end), 0);
	    state.wnext = 0;
	    state.whave = state.wsize;
	  }
	  else {
	    dist = state.wsize - state.wnext;
	    if (dist > copy) {
	      dist = copy;
	    }
	    //zmemcpy(state->window + state->wnext, end - copy, dist);
	    state.window.set(src.subarray(end - copy, end - copy + dist), state.wnext);
	    copy -= dist;
	    if (copy) {
	      //zmemcpy(state->window, end - copy, copy);
	      state.window.set(src.subarray(end - copy, end), 0);
	      state.wnext = copy;
	      state.whave = state.wsize;
	    }
	    else {
	      state.wnext += dist;
	      if (state.wnext === state.wsize) { state.wnext = 0; }
	      if (state.whave < state.wsize) { state.whave += dist; }
	    }
	  }
	  return 0;
	};


	const inflate$2 = (strm, flush) => {

	  let state;
	  let input, output;          // input/output buffers
	  let next;                   /* next input INDEX */
	  let put;                    /* next output INDEX */
	  let have, left;             /* available input and output */
	  let hold;                   /* bit buffer */
	  let bits;                   /* bits in bit buffer */
	  let _in, _out;              /* save starting available input and output */
	  let copy;                   /* number of stored or match bytes to copy */
	  let from;                   /* where to copy match bytes from */
	  let from_source;
	  let here = 0;               /* current decoding table entry */
	  let here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
	  //let last;                   /* parent table entry */
	  let last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
	  let len;                    /* length to copy for repeats, bits to drop */
	  let ret;                    /* return code */
	  const hbuf = new Uint8Array(4);    /* buffer for gzip header crc calculation */
	  let opts;

	  let n; // temporary variable for NEED_BITS

	  const order = /* permutation of code lengths */
	    new Uint8Array([ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ]);


	  if (inflateStateCheck(strm) || !strm.output ||
	      (!strm.input && strm.avail_in !== 0)) {
	    return Z_STREAM_ERROR$1;
	  }

	  state = strm.state;
	  if (state.mode === TYPE) { state.mode = TYPEDO; }    /* skip check */


	  //--- LOAD() ---
	  put = strm.next_out;
	  output = strm.output;
	  left = strm.avail_out;
	  next = strm.next_in;
	  input = strm.input;
	  have = strm.avail_in;
	  hold = state.hold;
	  bits = state.bits;
	  //---

	  _in = have;
	  _out = left;
	  ret = Z_OK$1;

	  inf_leave: // goto emulation
	  for (;;) {
	    switch (state.mode) {
	      case HEAD:
	        if (state.wrap === 0) {
	          state.mode = TYPEDO;
	          break;
	        }
	        //=== NEEDBITS(16);
	        while (bits < 16) {
	          if (have === 0) { break inf_leave; }
	          have--;
	          hold += input[next++] << bits;
	          bits += 8;
	        }
	        //===//
	        if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
	          if (state.wbits === 0) {
	            state.wbits = 15;
	          }
	          state.check = 0/*crc32(0L, Z_NULL, 0)*/;
	          //=== CRC2(state.check, hold);
	          hbuf[0] = hold & 0xff;
	          hbuf[1] = (hold >>> 8) & 0xff;
	          state.check = crc32_1(state.check, hbuf, 2, 0);
	          //===//

	          //=== INITBITS();
	          hold = 0;
	          bits = 0;
	          //===//
	          state.mode = FLAGS;
	          break;
	        }
	        if (state.head) {
	          state.head.done = false;
	        }
	        if (!(state.wrap & 1) ||   /* check if zlib header allowed */
	          (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
	          strm.msg = 'incorrect header check';
	          state.mode = BAD;
	          break;
	        }
	        if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {
	          strm.msg = 'unknown compression method';
	          state.mode = BAD;
	          break;
	        }
	        //--- DROPBITS(4) ---//
	        hold >>>= 4;
	        bits -= 4;
	        //---//
	        len = (hold & 0x0f)/*BITS(4)*/ + 8;
	        if (state.wbits === 0) {
	          state.wbits = len;
	        }
	        if (len > 15 || len > state.wbits) {
	          strm.msg = 'invalid window size';
	          state.mode = BAD;
	          break;
	        }

	        // !!! pako patch. Force use `options.windowBits` if passed.
	        // Required to always use max window size by default.
	        state.dmax = 1 << state.wbits;
	        //state.dmax = 1 << len;

	        state.flags = 0;               /* indicate zlib header */
	        //Tracev((stderr, "inflate:   zlib header ok\n"));
	        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
	        state.mode = hold & 0x200 ? DICTID : TYPE;
	        //=== INITBITS();
	        hold = 0;
	        bits = 0;
	        //===//
	        break;
	      case FLAGS:
	        //=== NEEDBITS(16); */
	        while (bits < 16) {
	          if (have === 0) { break inf_leave; }
	          have--;
	          hold += input[next++] << bits;
	          bits += 8;
	        }
	        //===//
	        state.flags = hold;
	        if ((state.flags & 0xff) !== Z_DEFLATED) {
	          strm.msg = 'unknown compression method';
	          state.mode = BAD;
	          break;
	        }
	        if (state.flags & 0xe000) {
	          strm.msg = 'unknown header flags set';
	          state.mode = BAD;
	          break;
	        }
	        if (state.head) {
	          state.head.text = ((hold >> 8) & 1);
	        }
	        if ((state.flags & 0x0200) && (state.wrap & 4)) {
	          //=== CRC2(state.check, hold);
	          hbuf[0] = hold & 0xff;
	          hbuf[1] = (hold >>> 8) & 0xff;
	          state.check = crc32_1(state.check, hbuf, 2, 0);
	          //===//
	        }
	        //=== INITBITS();
	        hold = 0;
	        bits = 0;
	        //===//
	        state.mode = TIME;
	        /* falls through */
	      case TIME:
	        //=== NEEDBITS(32); */
	        while (bits < 32) {
	          if (have === 0) { break inf_leave; }
	          have--;
	          hold += input[next++] << bits;
	          bits += 8;
	        }
	        //===//
	        if (state.head) {
	          state.head.time = hold;
	        }
	        if ((state.flags & 0x0200) && (state.wrap & 4)) {
	          //=== CRC4(state.check, hold)
	          hbuf[0] = hold & 0xff;
	          hbuf[1] = (hold >>> 8) & 0xff;
	          hbuf[2] = (hold >>> 16) & 0xff;
	          hbuf[3] = (hold >>> 24) & 0xff;
	          state.check = crc32_1(state.check, hbuf, 4, 0);
	          //===
	        }
	        //=== INITBITS();
	        hold = 0;
	        bits = 0;
	        //===//
	        state.mode = OS;
	        /* falls through */
	      case OS:
	        //=== NEEDBITS(16); */
	        while (bits < 16) {
	          if (have === 0) { break inf_leave; }
	          have--;
	          hold += input[next++] << bits;
	          bits += 8;
	        }
	        //===//
	        if (state.head) {
	          state.head.xflags = (hold & 0xff);
	          state.head.os = (hold >> 8);
	        }
	        if ((state.flags & 0x0200) && (state.wrap & 4)) {
	          //=== CRC2(state.check, hold);
	          hbuf[0] = hold & 0xff;
	          hbuf[1] = (hold >>> 8) & 0xff;
	          state.check = crc32_1(state.check, hbuf, 2, 0);
	          //===//
	        }
	        //=== INITBITS();
	        hold = 0;
	        bits = 0;
	        //===//
	        state.mode = EXLEN;
	        /* falls through */
	      case EXLEN:
	        if (state.flags & 0x0400) {
	          //=== NEEDBITS(16); */
	          while (bits < 16) {
	            if (have === 0) { break inf_leave; }
	            have--;
	            hold += input[next++] << bits;
	            bits += 8;
	          }
	          //===//
	          state.length = hold;
	          if (state.head) {
	            state.head.extra_len = hold;
	          }
	          if ((state.flags & 0x0200) && (state.wrap & 4)) {
	            //=== CRC2(state.check, hold);
	            hbuf[0] = hold & 0xff;
	            hbuf[1] = (hold >>> 8) & 0xff;
	            state.check = crc32_1(state.check, hbuf, 2, 0);
	            //===//
	          }
	          //=== INITBITS();
	          hold = 0;
	          bits = 0;
	          //===//
	        }
	        else if (state.head) {
	          state.head.extra = null/*Z_NULL*/;
	        }
	        state.mode = EXTRA;
	        /* falls through */
	      case EXTRA:
	        if (state.flags & 0x0400) {
	          copy = state.length;
	          if (copy > have) { copy = have; }
	          if (copy) {
	            if (state.head) {
	              len = state.head.extra_len - state.length;
	              if (!state.head.extra) {
	                // Use untyped array for more convenient processing later
	                state.head.extra = new Uint8Array(state.head.extra_len);
	              }
	              state.head.extra.set(
	                input.subarray(
	                  next,
	                  // extra field is limited to 65536 bytes
	                  // - no need for additional size check
	                  next + copy
	                ),
	                /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
	                len
	              );
	              //zmemcpy(state.head.extra + len, next,
	              //        len + copy > state.head.extra_max ?
	              //        state.head.extra_max - len : copy);
	            }
	            if ((state.flags & 0x0200) && (state.wrap & 4)) {
	              state.check = crc32_1(state.check, input, copy, next);
	            }
	            have -= copy;
	            next += copy;
	            state.length -= copy;
	          }
	          if (state.length) { break inf_leave; }
	        }
	        state.length = 0;
	        state.mode = NAME;
	        /* falls through */
	      case NAME:
	        if (state.flags & 0x0800) {
	          if (have === 0) { break inf_leave; }
	          copy = 0;
	          do {
	            // TODO: 2 or 1 bytes?
	            len = input[next + copy++];
	            /* use constant limit because in js we should not preallocate memory */
	            if (state.head && len &&
	                (state.length < 65536 /*state.head.name_max*/)) {
	              state.head.name += String.fromCharCode(len);
	            }
	          } while (len && copy < have);

	          if ((state.flags & 0x0200) && (state.wrap & 4)) {
	            state.check = crc32_1(state.check, input, copy, next);
	          }
	          have -= copy;
	          next += copy;
	          if (len) { break inf_leave; }
	        }
	        else if (state.head) {
	          state.head.name = null;
	        }
	        state.length = 0;
	        state.mode = COMMENT;
	        /* falls through */
	      case COMMENT:
	        if (state.flags & 0x1000) {
	          if (have === 0) { break inf_leave; }
	          copy = 0;
	          do {
	            len = input[next + copy++];
	            /* use constant limit because in js we should not preallocate memory */
	            if (state.head && len &&
	                (state.length < 65536 /*state.head.comm_max*/)) {
	              state.head.comment += String.fromCharCode(len);
	            }
	          } while (len && copy < have);
	          if ((state.flags & 0x0200) && (state.wrap & 4)) {
	            state.check = crc32_1(state.check, input, copy, next);
	          }
	          have -= copy;
	          next += copy;
	          if (len) { break inf_leave; }
	        }
	        else if (state.head) {
	          state.head.comment = null;
	        }
	        state.mode = HCRC;
	        /* falls through */
	      case HCRC:
	        if (state.flags & 0x0200) {
	          //=== NEEDBITS(16); */
	          while (bits < 16) {
	            if (have === 0) { break inf_leave; }
	            have--;
	            hold += input[next++] << bits;
	            bits += 8;
	          }
	          //===//
	          if ((state.wrap & 4) && hold !== (state.check & 0xffff)) {
	            strm.msg = 'header crc mismatch';
	            state.mode = BAD;
	            break;
	          }
	          //=== INITBITS();
	          hold = 0;
	          bits = 0;
	          //===//
	        }
	        if (state.head) {
	          state.head.hcrc = ((state.flags >> 9) & 1);
	          state.head.done = true;
	        }
	        strm.adler = state.check = 0;
	        state.mode = TYPE;
	        break;
	      case DICTID:
	        //=== NEEDBITS(32); */
	        while (bits < 32) {
	          if (have === 0) { break inf_leave; }
	          have--;
	          hold += input[next++] << bits;
	          bits += 8;
	        }
	        //===//
	        strm.adler = state.check = zswap32(hold);
	        //=== INITBITS();
	        hold = 0;
	        bits = 0;
	        //===//
	        state.mode = DICT;
	        /* falls through */
	      case DICT:
	        if (state.havedict === 0) {
	          //--- RESTORE() ---
	          strm.next_out = put;
	          strm.avail_out = left;
	          strm.next_in = next;
	          strm.avail_in = have;
	          state.hold = hold;
	          state.bits = bits;
	          //---
	          return Z_NEED_DICT$1;
	        }
	        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
	        state.mode = TYPE;
	        /* falls through */
	      case TYPE:
	        if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
	        /* falls through */
	      case TYPEDO:
	        if (state.last) {
	          //--- BYTEBITS() ---//
	          hold >>>= bits & 7;
	          bits -= bits & 7;
	          //---//
	          state.mode = CHECK;
	          break;
	        }
	        //=== NEEDBITS(3); */
	        while (bits < 3) {
	          if (have === 0) { break inf_leave; }
	          have--;
	          hold += input[next++] << bits;
	          bits += 8;
	        }
	        //===//
	        state.last = (hold & 0x01)/*BITS(1)*/;
	        //--- DROPBITS(1) ---//
	        hold >>>= 1;
	        bits -= 1;
	        //---//

	        switch ((hold & 0x03)/*BITS(2)*/) {
	          case 0:                             /* stored block */
	            //Tracev((stderr, "inflate:     stored block%s\n",
	            //        state.last ? " (last)" : ""));
	            state.mode = STORED;
	            break;
	          case 1:                             /* fixed block */
	            fixedtables(state);
	            //Tracev((stderr, "inflate:     fixed codes block%s\n",
	            //        state.last ? " (last)" : ""));
	            state.mode = LEN_;             /* decode codes */
	            if (flush === Z_TREES) {
	              //--- DROPBITS(2) ---//
	              hold >>>= 2;
	              bits -= 2;
	              //---//
	              break inf_leave;
	            }
	            break;
	          case 2:                             /* dynamic block */
	            //Tracev((stderr, "inflate:     dynamic codes block%s\n",
	            //        state.last ? " (last)" : ""));
	            state.mode = TABLE;
	            break;
	          case 3:
	            strm.msg = 'invalid block type';
	            state.mode = BAD;
	        }
	        //--- DROPBITS(2) ---//
	        hold >>>= 2;
	        bits -= 2;
	        //---//
	        break;
	      case STORED:
	        //--- BYTEBITS() ---// /* go to byte boundary */
	        hold >>>= bits & 7;
	        bits -= bits & 7;
	        //---//
	        //=== NEEDBITS(32); */
	        while (bits < 32) {
	          if (have === 0) { break inf_leave; }
	          have--;
	          hold += input[next++] << bits;
	          bits += 8;
	        }
	        //===//
	        if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
	          strm.msg = 'invalid stored block lengths';
	          state.mode = BAD;
	          break;
	        }
	        state.length = hold & 0xffff;
	        //Tracev((stderr, "inflate:       stored length %u\n",
	        //        state.length));
	        //=== INITBITS();
	        hold = 0;
	        bits = 0;
	        //===//
	        state.mode = COPY_;
	        if (flush === Z_TREES) { break inf_leave; }
	        /* falls through */
	      case COPY_:
	        state.mode = COPY;
	        /* falls through */
	      case COPY:
	        copy = state.length;
	        if (copy) {
	          if (copy > have) { copy = have; }
	          if (copy > left) { copy = left; }
	          if (copy === 0) { break inf_leave; }
	          //--- zmemcpy(put, next, copy); ---
	          output.set(input.subarray(next, next + copy), put);
	          //---//
	          have -= copy;
	          next += copy;
	          left -= copy;
	          put += copy;
	          state.length -= copy;
	          break;
	        }
	        //Tracev((stderr, "inflate:       stored end\n"));
	        state.mode = TYPE;
	        break;
	      case TABLE:
	        //=== NEEDBITS(14); */
	        while (bits < 14) {
	          if (have === 0) { break inf_leave; }
	          have--;
	          hold += input[next++] << bits;
	          bits += 8;
	        }
	        //===//
	        state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
	        //--- DROPBITS(5) ---//
	        hold >>>= 5;
	        bits -= 5;
	        //---//
	        state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
	        //--- DROPBITS(5) ---//
	        hold >>>= 5;
	        bits -= 5;
	        //---//
	        state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
	        //--- DROPBITS(4) ---//
	        hold >>>= 4;
	        bits -= 4;
	        //---//
	//#ifndef PKZIP_BUG_WORKAROUND
	        if (state.nlen > 286 || state.ndist > 30) {
	          strm.msg = 'too many length or distance symbols';
	          state.mode = BAD;
	          break;
	        }
	//#endif
	        //Tracev((stderr, "inflate:       table sizes ok\n"));
	        state.have = 0;
	        state.mode = LENLENS;
	        /* falls through */
	      case LENLENS:
	        while (state.have < state.ncode) {
	          //=== NEEDBITS(3);
	          while (bits < 3) {
	            if (have === 0) { break inf_leave; }
	            have--;
	            hold += input[next++] << bits;
	            bits += 8;
	          }
	          //===//
	          state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
	          //--- DROPBITS(3) ---//
	          hold >>>= 3;
	          bits -= 3;
	          //---//
	        }
	        while (state.have < 19) {
	          state.lens[order[state.have++]] = 0;
	        }
	        // We have separate tables & no pointers. 2 commented lines below not needed.
	        //state.next = state.codes;
	        //state.lencode = state.next;
	        // Switch to use dynamic table
	        state.lencode = state.lendyn;
	        state.lenbits = 7;

	        opts = { bits: state.lenbits };
	        ret = inftrees(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
	        state.lenbits = opts.bits;

	        if (ret) {
	          strm.msg = 'invalid code lengths set';
	          state.mode = BAD;
	          break;
	        }
	        //Tracev((stderr, "inflate:       code lengths ok\n"));
	        state.have = 0;
	        state.mode = CODELENS;
	        /* falls through */
	      case CODELENS:
	        while (state.have < state.nlen + state.ndist) {
	          for (;;) {
	            here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/
	            here_bits = here >>> 24;
	            here_op = (here >>> 16) & 0xff;
	            here_val = here & 0xffff;

	            if ((here_bits) <= bits) { break; }
	            //--- PULLBYTE() ---//
	            if (have === 0) { break inf_leave; }
	            have--;
	            hold += input[next++] << bits;
	            bits += 8;
	            //---//
	          }
	          if (here_val < 16) {
	            //--- DROPBITS(here.bits) ---//
	            hold >>>= here_bits;
	            bits -= here_bits;
	            //---//
	            state.lens[state.have++] = here_val;
	          }
	          else {
	            if (here_val === 16) {
	              //=== NEEDBITS(here.bits + 2);
	              n = here_bits + 2;
	              while (bits < n) {
	                if (have === 0) { break inf_leave; }
	                have--;
	                hold += input[next++] << bits;
	                bits += 8;
	              }
	              //===//
	              //--- DROPBITS(here.bits) ---//
	              hold >>>= here_bits;
	              bits -= here_bits;
	              //---//
	              if (state.have === 0) {
	                strm.msg = 'invalid bit length repeat';
	                state.mode = BAD;
	                break;
	              }
	              len = state.lens[state.have - 1];
	              copy = 3 + (hold & 0x03);//BITS(2);
	              //--- DROPBITS(2) ---//
	              hold >>>= 2;
	              bits -= 2;
	              //---//
	            }
	            else if (here_val === 17) {
	              //=== NEEDBITS(here.bits + 3);
	              n = here_bits + 3;
	              while (bits < n) {
	                if (have === 0) { break inf_leave; }
	                have--;
	                hold += input[next++] << bits;
	                bits += 8;
	              }
	              //===//
	              //--- DROPBITS(here.bits) ---//
	              hold >>>= here_bits;
	              bits -= here_bits;
	              //---//
	              len = 0;
	              copy = 3 + (hold & 0x07);//BITS(3);
	              //--- DROPBITS(3) ---//
	              hold >>>= 3;
	              bits -= 3;
	              //---//
	            }
	            else {
	              //=== NEEDBITS(here.bits + 7);
	              n = here_bits + 7;
	              while (bits < n) {
	                if (have === 0) { break inf_leave; }
	                have--;
	                hold += input[next++] << bits;
	                bits += 8;
	              }
	              //===//
	              //--- DROPBITS(here.bits) ---//
	              hold >>>= here_bits;
	              bits -= here_bits;
	              //---//
	              len = 0;
	              copy = 11 + (hold & 0x7f);//BITS(7);
	              //--- DROPBITS(7) ---//
	              hold >>>= 7;
	              bits -= 7;
	              //---//
	            }
	            if (state.have + copy > state.nlen + state.ndist) {
	              strm.msg = 'invalid bit length repeat';
	              state.mode = BAD;
	              break;
	            }
	            while (copy--) {
	              state.lens[state.have++] = len;
	            }
	          }
	        }

	        /* handle error breaks in while */
	        if (state.mode === BAD) { break; }

	        /* check for end-of-block code (better have one) */
	        if (state.lens[256] === 0) {
	          strm.msg = 'invalid code -- missing end-of-block';
	          state.mode = BAD;
	          break;
	        }

	        /* build code tables -- note: do not change the lenbits or distbits
	           values here (9 and 6) without reading the comments in inftrees.h
	           concerning the ENOUGH constants, which depend on those values */
	        state.lenbits = 9;

	        opts = { bits: state.lenbits };
	        ret = inftrees(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
	        // We have separate tables & no pointers. 2 commented lines below not needed.
	        // state.next_index = opts.table_index;
	        state.lenbits = opts.bits;
	        // state.lencode = state.next;

	        if (ret) {
	          strm.msg = 'invalid literal/lengths set';
	          state.mode = BAD;
	          break;
	        }

	        state.distbits = 6;
	        //state.distcode.copy(state.codes);
	        // Switch to use dynamic table
	        state.distcode = state.distdyn;
	        opts = { bits: state.distbits };
	        ret = inftrees(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
	        // We have separate tables & no pointers. 2 commented lines below not needed.
	        // state.next_index = opts.table_index;
	        state.distbits = opts.bits;
	        // state.distcode = state.next;

	        if (ret) {
	          strm.msg = 'invalid distances set';
	          state.mode = BAD;
	          break;
	        }
	        //Tracev((stderr, 'inflate:       codes ok\n'));
	        state.mode = LEN_;
	        if (flush === Z_TREES) { break inf_leave; }
	        /* falls through */
	      case LEN_:
	        state.mode = LEN;
	        /* falls through */
	      case LEN:
	        if (have >= 6 && left >= 258) {
	          //--- RESTORE() ---
	          strm.next_out = put;
	          strm.avail_out = left;
	          strm.next_in = next;
	          strm.avail_in = have;
	          state.hold = hold;
	          state.bits = bits;
	          //---
	          inffast(strm, _out);
	          //--- LOAD() ---
	          put = strm.next_out;
	          output = strm.output;
	          left = strm.avail_out;
	          next = strm.next_in;
	          input = strm.input;
	          have = strm.avail_in;
	          hold = state.hold;
	          bits = state.bits;
	          //---

	          if (state.mode === TYPE) {
	            state.back = -1;
	          }
	          break;
	        }
	        state.back = 0;
	        for (;;) {
	          here = state.lencode[hold & ((1 << state.lenbits) - 1)];  /*BITS(state.lenbits)*/
	          here_bits = here >>> 24;
	          here_op = (here >>> 16) & 0xff;
	          here_val = here & 0xffff;

	          if (here_bits <= bits) { break; }
	          //--- PULLBYTE() ---//
	          if (have === 0) { break inf_leave; }
	          have--;
	          hold += input[next++] << bits;
	          bits += 8;
	          //---//
	        }
	        if (here_op && (here_op & 0xf0) === 0) {
	          last_bits = here_bits;
	          last_op = here_op;
	          last_val = here_val;
	          for (;;) {
	            here = state.lencode[last_val +
	                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
	            here_bits = here >>> 24;
	            here_op = (here >>> 16) & 0xff;
	            here_val = here & 0xffff;

	            if ((last_bits + here_bits) <= bits) { break; }
	            //--- PULLBYTE() ---//
	            if (have === 0) { break inf_leave; }
	            have--;
	            hold += input[next++] << bits;
	            bits += 8;
	            //---//
	          }
	          //--- DROPBITS(last.bits) ---//
	          hold >>>= last_bits;
	          bits -= last_bits;
	          //---//
	          state.back += last_bits;
	        }
	        //--- DROPBITS(here.bits) ---//
	        hold >>>= here_bits;
	        bits -= here_bits;
	        //---//
	        state.back += here_bits;
	        state.length = here_val;
	        if (here_op === 0) {
	          //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
	          //        "inflate:         literal '%c'\n" :
	          //        "inflate:         literal 0x%02x\n", here.val));
	          state.mode = LIT;
	          break;
	        }
	        if (here_op & 32) {
	          //Tracevv((stderr, "inflate:         end of block\n"));
	          state.back = -1;
	          state.mode = TYPE;
	          break;
	        }
	        if (here_op & 64) {
	          strm.msg = 'invalid literal/length code';
	          state.mode = BAD;
	          break;
	        }
	        state.extra = here_op & 15;
	        state.mode = LENEXT;
	        /* falls through */
	      case LENEXT:
	        if (state.extra) {
	          //=== NEEDBITS(state.extra);
	          n = state.extra;
	          while (bits < n) {
	            if (have === 0) { break inf_leave; }
	            have--;
	            hold += input[next++] << bits;
	            bits += 8;
	          }
	          //===//
	          state.length += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
	          //--- DROPBITS(state.extra) ---//
	          hold >>>= state.extra;
	          bits -= state.extra;
	          //---//
	          state.back += state.extra;
	        }
	        //Tracevv((stderr, "inflate:         length %u\n", state.length));
	        state.was = state.length;
	        state.mode = DIST;
	        /* falls through */
	      case DIST:
	        for (;;) {
	          here = state.distcode[hold & ((1 << state.distbits) - 1)];/*BITS(state.distbits)*/
	          here_bits = here >>> 24;
	          here_op = (here >>> 16) & 0xff;
	          here_val = here & 0xffff;

	          if ((here_bits) <= bits) { break; }
	          //--- PULLBYTE() ---//
	          if (have === 0) { break inf_leave; }
	          have--;
	          hold += input[next++] << bits;
	          bits += 8;
	          //---//
	        }
	        if ((here_op & 0xf0) === 0) {
	          last_bits = here_bits;
	          last_op = here_op;
	          last_val = here_val;
	          for (;;) {
	            here = state.distcode[last_val +
	                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
	            here_bits = here >>> 24;
	            here_op = (here >>> 16) & 0xff;
	            here_val = here & 0xffff;

	            if ((last_bits + here_bits) <= bits) { break; }
	            //--- PULLBYTE() ---//
	            if (have === 0) { break inf_leave; }
	            have--;
	            hold += input[next++] << bits;
	            bits += 8;
	            //---//
	          }
	          //--- DROPBITS(last.bits) ---//
	          hold >>>= last_bits;
	          bits -= last_bits;
	          //---//
	          state.back += last_bits;
	        }
	        //--- DROPBITS(here.bits) ---//
	        hold >>>= here_bits;
	        bits -= here_bits;
	        //---//
	        state.back += here_bits;
	        if (here_op & 64) {
	          strm.msg = 'invalid distance code';
	          state.mode = BAD;
	          break;
	        }
	        state.offset = here_val;
	        state.extra = (here_op) & 15;
	        state.mode = DISTEXT;
	        /* falls through */
	      case DISTEXT:
	        if (state.extra) {
	          //=== NEEDBITS(state.extra);
	          n = state.extra;
	          while (bits < n) {
	            if (have === 0) { break inf_leave; }
	            have--;
	            hold += input[next++] << bits;
	            bits += 8;
	          }
	          //===//
	          state.offset += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
	          //--- DROPBITS(state.extra) ---//
	          hold >>>= state.extra;
	          bits -= state.extra;
	          //---//
	          state.back += state.extra;
	        }
	//#ifdef INFLATE_STRICT
	        if (state.offset > state.dmax) {
	          strm.msg = 'invalid distance too far back';
	          state.mode = BAD;
	          break;
	        }
	//#endif
	        //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
	        state.mode = MATCH;
	        /* falls through */
	      case MATCH:
	        if (left === 0) { break inf_leave; }
	        copy = _out - left;
	        if (state.offset > copy) {         /* copy from window */
	          copy = state.offset - copy;
	          if (copy > state.whave) {
	            if (state.sane) {
	              strm.msg = 'invalid distance too far back';
	              state.mode = BAD;
	              break;
	            }
	// (!) This block is disabled in zlib defaults,
	// don't enable it for binary compatibility
	//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
	//          Trace((stderr, "inflate.c too far\n"));
	//          copy -= state.whave;
	//          if (copy > state.length) { copy = state.length; }
	//          if (copy > left) { copy = left; }
	//          left -= copy;
	//          state.length -= copy;
	//          do {
	//            output[put++] = 0;
	//          } while (--copy);
	//          if (state.length === 0) { state.mode = LEN; }
	//          break;
	//#endif
	          }
	          if (copy > state.wnext) {
	            copy -= state.wnext;
	            from = state.wsize - copy;
	          }
	          else {
	            from = state.wnext - copy;
	          }
	          if (copy > state.length) { copy = state.length; }
	          from_source = state.window;
	        }
	        else {                              /* copy from output */
	          from_source = output;
	          from = put - state.offset;
	          copy = state.length;
	        }
	        if (copy > left) { copy = left; }
	        left -= copy;
	        state.length -= copy;
	        do {
	          output[put++] = from_source[from++];
	        } while (--copy);
	        if (state.length === 0) { state.mode = LEN; }
	        break;
	      case LIT:
	        if (left === 0) { break inf_leave; }
	        output[put++] = state.length;
	        left--;
	        state.mode = LEN;
	        break;
	      case CHECK:
	        if (state.wrap) {
	          //=== NEEDBITS(32);
	          while (bits < 32) {
	            if (have === 0) { break inf_leave; }
	            have--;
	            // Use '|' instead of '+' to make sure that result is signed
	            hold |= input[next++] << bits;
	            bits += 8;
	          }
	          //===//
	          _out -= left;
	          strm.total_out += _out;
	          state.total += _out;
	          if ((state.wrap & 4) && _out) {
	            strm.adler = state.check =
	                /*UPDATE_CHECK(state.check, put - _out, _out);*/
	                (state.flags ? crc32_1(state.check, output, _out, put - _out) : adler32_1(state.check, output, _out, put - _out));

	          }
	          _out = left;
	          // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
	          if ((state.wrap & 4) && (state.flags ? hold : zswap32(hold)) !== state.check) {
	            strm.msg = 'incorrect data check';
	            state.mode = BAD;
	            break;
	          }
	          //=== INITBITS();
	          hold = 0;
	          bits = 0;
	          //===//
	          //Tracev((stderr, "inflate:   check matches trailer\n"));
	        }
	        state.mode = LENGTH;
	        /* falls through */
	      case LENGTH:
	        if (state.wrap && state.flags) {
	          //=== NEEDBITS(32);
	          while (bits < 32) {
	            if (have === 0) { break inf_leave; }
	            have--;
	            hold += input[next++] << bits;
	            bits += 8;
	          }
	          //===//
	          if ((state.wrap & 4) && hold !== (state.total & 0xffffffff)) {
	            strm.msg = 'incorrect length check';
	            state.mode = BAD;
	            break;
	          }
	          //=== INITBITS();
	          hold = 0;
	          bits = 0;
	          //===//
	          //Tracev((stderr, "inflate:   length matches trailer\n"));
	        }
	        state.mode = DONE;
	        /* falls through */
	      case DONE:
	        ret = Z_STREAM_END$1;
	        break inf_leave;
	      case BAD:
	        ret = Z_DATA_ERROR$1;
	        break inf_leave;
	      case MEM:
	        return Z_MEM_ERROR$1;
	      case SYNC:
	        /* falls through */
	      default:
	        return Z_STREAM_ERROR$1;
	    }
	  }

	  // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

	  /*
	     Return from inflate(), updating the total counts and the check value.
	     If there was no progress during the inflate() call, return a buffer
	     error.  Call updatewindow() to create and/or update the window state.
	     Note: a memory error from inflate() is non-recoverable.
	   */

	  //--- RESTORE() ---
	  strm.next_out = put;
	  strm.avail_out = left;
	  strm.next_in = next;
	  strm.avail_in = have;
	  state.hold = hold;
	  state.bits = bits;
	  //---

	  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
	                      (state.mode < CHECK || flush !== Z_FINISH$1))) {
	    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) ;
	  }
	  _in -= strm.avail_in;
	  _out -= strm.avail_out;
	  strm.total_in += _in;
	  strm.total_out += _out;
	  state.total += _out;
	  if ((state.wrap & 4) && _out) {
	    strm.adler = state.check = /*UPDATE_CHECK(state.check, strm.next_out - _out, _out);*/
	      (state.flags ? crc32_1(state.check, output, _out, strm.next_out - _out) : adler32_1(state.check, output, _out, strm.next_out - _out));
	  }
	  strm.data_type = state.bits + (state.last ? 64 : 0) +
	                    (state.mode === TYPE ? 128 : 0) +
	                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
	  if (((_in === 0 && _out === 0) || flush === Z_FINISH$1) && ret === Z_OK$1) {
	    ret = Z_BUF_ERROR;
	  }
	  return ret;
	};


	const inflateEnd = (strm) => {

	  if (inflateStateCheck(strm)) {
	    return Z_STREAM_ERROR$1;
	  }

	  let state = strm.state;
	  if (state.window) {
	    state.window = null;
	  }
	  strm.state = null;
	  return Z_OK$1;
	};


	const inflateGetHeader = (strm, head) => {

	  /* check state */
	  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
	  const state = strm.state;
	  if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR$1; }

	  /* save header structure */
	  state.head = head;
	  head.done = false;
	  return Z_OK$1;
	};


	const inflateSetDictionary = (strm, dictionary) => {
	  const dictLength = dictionary.length;

	  let state;
	  let dictid;
	  let ret;

	  /* check state */
	  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
	  state = strm.state;

	  if (state.wrap !== 0 && state.mode !== DICT) {
	    return Z_STREAM_ERROR$1;
	  }

	  /* check for correct dictionary identifier */
	  if (state.mode === DICT) {
	    dictid = 1; /* adler32(0, null, 0)*/
	    /* dictid = adler32(dictid, dictionary, dictLength); */
	    dictid = adler32_1(dictid, dictionary, dictLength, 0);
	    if (dictid !== state.check) {
	      return Z_DATA_ERROR$1;
	    }
	  }
	  /* copy dictionary to window using updatewindow(), which will amend the
	   existing dictionary if appropriate */
	  ret = updatewindow(strm, dictionary, dictLength, dictLength);
	  if (ret) {
	    state.mode = MEM;
	    return Z_MEM_ERROR$1;
	  }
	  state.havedict = 1;
	  // Tracev((stderr, "inflate:   dictionary set\n"));
	  return Z_OK$1;
	};


	var inflateReset_1 = inflateReset;
	var inflateReset2_1 = inflateReset2;
	var inflateResetKeep_1 = inflateResetKeep;
	var inflateInit_1 = inflateInit;
	var inflateInit2_1 = inflateInit2;
	var inflate_2$1 = inflate$2;
	var inflateEnd_1 = inflateEnd;
	var inflateGetHeader_1 = inflateGetHeader;
	var inflateSetDictionary_1 = inflateSetDictionary;
	var inflateInfo = 'pako inflate (from Nodeca project)';

	/* Not implemented
	module.exports.inflateCodesUsed = inflateCodesUsed;
	module.exports.inflateCopy = inflateCopy;
	module.exports.inflateGetDictionary = inflateGetDictionary;
	module.exports.inflateMark = inflateMark;
	module.exports.inflatePrime = inflatePrime;
	module.exports.inflateSync = inflateSync;
	module.exports.inflateSyncPoint = inflateSyncPoint;
	module.exports.inflateUndermine = inflateUndermine;
	module.exports.inflateValidate = inflateValidate;
	*/

	var inflate_1$2 = {
		inflateReset: inflateReset_1,
		inflateReset2: inflateReset2_1,
		inflateResetKeep: inflateResetKeep_1,
		inflateInit: inflateInit_1,
		inflateInit2: inflateInit2_1,
		inflate: inflate_2$1,
		inflateEnd: inflateEnd_1,
		inflateGetHeader: inflateGetHeader_1,
		inflateSetDictionary: inflateSetDictionary_1,
		inflateInfo: inflateInfo
	};

	// (C) 1995-2013 Jean-loup Gailly and Mark Adler
	// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
	//
	// This software is provided 'as-is', without any express or implied
	// warranty. In no event will the authors be held liable for any damages
	// arising from the use of this software.
	//
	// Permission is granted to anyone to use this software for any purpose,
	// including commercial applications, and to alter it and redistribute it
	// freely, subject to the following restrictions:
	//
	// 1. The origin of this software must not be misrepresented; you must not
	//   claim that you wrote the original software. If you use this software
	//   in a product, an acknowledgment in the product documentation would be
	//   appreciated but is not required.
	// 2. Altered source versions must be plainly marked as such, and must not be
	//   misrepresented as being the original software.
	// 3. This notice may not be removed or altered from any source distribution.

	function GZheader() {
	  /* true if compressed data believed to be text */
	  this.text       = 0;
	  /* modification time */
	  this.time       = 0;
	  /* extra flags (not used when writing a gzip file) */
	  this.xflags     = 0;
	  /* operating system */
	  this.os         = 0;
	  /* pointer to extra field or Z_NULL if none */
	  this.extra      = null;
	  /* extra field length (valid if extra != Z_NULL) */
	  this.extra_len  = 0; // Actually, we don't need it in JS,
	                       // but leave for few code modifications

	  //
	  // Setup limits is not necessary because in js we should not preallocate memory
	  // for inflate use constant limit in 65536 bytes
	  //

	  /* space at extra (only when reading header) */
	  // this.extra_max  = 0;
	  /* pointer to zero-terminated file name or Z_NULL */
	  this.name       = '';
	  /* space at name (only when reading header) */
	  // this.name_max   = 0;
	  /* pointer to zero-terminated comment or Z_NULL */
	  this.comment    = '';
	  /* space at comment (only when reading header) */
	  // this.comm_max   = 0;
	  /* true if there was or will be a header crc */
	  this.hcrc       = 0;
	  /* true when done reading gzip header (not used when writing a gzip file) */
	  this.done       = false;
	}

	var gzheader = GZheader;

	const toString = Object.prototype.toString;

	/* Public constants ==========================================================*/
	/* ===========================================================================*/

	const {
	  Z_NO_FLUSH, Z_FINISH,
	  Z_OK, Z_STREAM_END, Z_NEED_DICT, Z_STREAM_ERROR, Z_DATA_ERROR, Z_MEM_ERROR
	} = constants$2;

	/* ===========================================================================*/


	/**
	 * class Inflate
	 *
	 * Generic JS-style wrapper for zlib calls. If you don't need
	 * streaming behaviour - use more simple functions: [[inflate]]
	 * and [[inflateRaw]].
	 **/

	/* internal
	 * inflate.chunks -> Array
	 *
	 * Chunks of output data, if [[Inflate#onData]] not overridden.
	 **/

	/**
	 * Inflate.result -> Uint8Array|String
	 *
	 * Uncompressed result, generated by default [[Inflate#onData]]
	 * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
	 * (call [[Inflate#push]] with `Z_FINISH` / `true` param).
	 **/

	/**
	 * Inflate.err -> Number
	 *
	 * Error code after inflate finished. 0 (Z_OK) on success.
	 * Should be checked if broken data possible.
	 **/

	/**
	 * Inflate.msg -> String
	 *
	 * Error message, if [[Inflate.err]] != 0
	 **/


	/**
	 * new Inflate(options)
	 * - options (Object): zlib inflate options.
	 *
	 * Creates new inflator instance with specified params. Throws exception
	 * on bad params. Supported options:
	 *
	 * - `windowBits`
	 * - `dictionary`
	 *
	 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
	 * for more information on these.
	 *
	 * Additional options, for internal needs:
	 *
	 * - `chunkSize` - size of generated data chunks (16K by default)
	 * - `raw` (Boolean) - do raw inflate
	 * - `to` (String) - if equal to 'string', then result will be converted
	 *   from utf8 to utf16 (javascript) string. When string output requested,
	 *   chunk length can differ from `chunkSize`, depending on content.
	 *
	 * By default, when no options set, autodetect deflate/gzip data format via
	 * wrapper header.
	 *
	 * ##### Example:
	 *
	 * ```javascript
	 * const pako = require('pako')
	 * const chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
	 * const chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
	 *
	 * const inflate = new pako.Inflate({ level: 3});
	 *
	 * inflate.push(chunk1, false);
	 * inflate.push(chunk2, true);  // true -> last chunk
	 *
	 * if (inflate.err) { throw new Error(inflate.err); }
	 *
	 * console.log(inflate.result);
	 * ```
	 **/
	function Inflate$1(options) {
	  this.options = common.assign({
	    chunkSize: 1024 * 64,
	    windowBits: 15,
	    to: ''
	  }, options || {});

	  const opt = this.options;

	  // Force window size for `raw` data, if not set directly,
	  // because we have no header for autodetect.
	  if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
	    opt.windowBits = -opt.windowBits;
	    if (opt.windowBits === 0) { opt.windowBits = -15; }
	  }

	  // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
	  if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
	      !(options && options.windowBits)) {
	    opt.windowBits += 32;
	  }

	  // Gzip header has no info about windows size, we can do autodetect only
	  // for deflate. So, if window size not set, force it to max when gzip possible
	  if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
	    // bit 3 (16) -> gzipped data
	    // bit 4 (32) -> autodetect gzip/deflate
	    if ((opt.windowBits & 15) === 0) {
	      opt.windowBits |= 15;
	    }
	  }

	  this.err    = 0;      // error code, if happens (0 = Z_OK)
	  this.msg    = '';     // error message
	  this.ended  = false;  // used to avoid multiple onEnd() calls
	  this.chunks = [];     // chunks of compressed data

	  this.strm   = new zstream();
	  this.strm.avail_out = 0;

	  let status  = inflate_1$2.inflateInit2(
	    this.strm,
	    opt.windowBits
	  );

	  if (status !== Z_OK) {
	    throw new Error(messages[status]);
	  }

	  this.header = new gzheader();

	  inflate_1$2.inflateGetHeader(this.strm, this.header);

	  // Setup dictionary
	  if (opt.dictionary) {
	    // Convert data if needed
	    if (typeof opt.dictionary === 'string') {
	      opt.dictionary = strings.string2buf(opt.dictionary);
	    } else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {
	      opt.dictionary = new Uint8Array(opt.dictionary);
	    }
	    if (opt.raw) { //In raw mode we need to set the dictionary early
	      status = inflate_1$2.inflateSetDictionary(this.strm, opt.dictionary);
	      if (status !== Z_OK) {
	        throw new Error(messages[status]);
	      }
	    }
	  }
	}

	/**
	 * Inflate#push(data[, flush_mode]) -> Boolean
	 * - data (Uint8Array|ArrayBuffer): input data
	 * - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE
	 *   flush modes. See constants. Skipped or `false` means Z_NO_FLUSH,
	 *   `true` means Z_FINISH.
	 *
	 * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
	 * new output chunks. Returns `true` on success. If end of stream detected,
	 * [[Inflate#onEnd]] will be called.
	 *
	 * `flush_mode` is not needed for normal operation, because end of stream
	 * detected automatically. You may try to use it for advanced things, but
	 * this functionality was not tested.
	 *
	 * On fail call [[Inflate#onEnd]] with error code and return false.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * push(chunk, false); // push one of data chunks
	 * ...
	 * push(chunk, true);  // push last chunk
	 * ```
	 **/
	Inflate$1.prototype.push = function (data, flush_mode) {
	  const strm = this.strm;
	  const chunkSize = this.options.chunkSize;
	  const dictionary = this.options.dictionary;
	  let status, _flush_mode, last_avail_out;

	  if (this.ended) return false;

	  if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
	  else _flush_mode = flush_mode === true ? Z_FINISH : Z_NO_FLUSH;

	  // Convert data if needed
	  if (toString.call(data) === '[object ArrayBuffer]') {
	    strm.input = new Uint8Array(data);
	  } else {
	    strm.input = data;
	  }

	  strm.next_in = 0;
	  strm.avail_in = strm.input.length;

	  for (;;) {
	    if (strm.avail_out === 0) {
	      strm.output = new Uint8Array(chunkSize);
	      strm.next_out = 0;
	      strm.avail_out = chunkSize;
	    }

	    status = inflate_1$2.inflate(strm, _flush_mode);

	    if (status === Z_NEED_DICT && dictionary) {
	      status = inflate_1$2.inflateSetDictionary(strm, dictionary);

	      if (status === Z_OK) {
	        status = inflate_1$2.inflate(strm, _flush_mode);
	      } else if (status === Z_DATA_ERROR) {
	        // Replace code with more verbose
	        status = Z_NEED_DICT;
	      }
	    }

	    // Skip snyc markers if more data follows and not raw mode
	    while (strm.avail_in > 0 &&
	           status === Z_STREAM_END &&
	           strm.state.wrap > 0 &&
	           data[strm.next_in] !== 0)
	    {
	      inflate_1$2.inflateReset(strm);
	      status = inflate_1$2.inflate(strm, _flush_mode);
	    }

	    switch (status) {
	      case Z_STREAM_ERROR:
	      case Z_DATA_ERROR:
	      case Z_NEED_DICT:
	      case Z_MEM_ERROR:
	        this.onEnd(status);
	        this.ended = true;
	        return false;
	    }

	    // Remember real `avail_out` value, because we may patch out buffer content
	    // to align utf8 strings boundaries.
	    last_avail_out = strm.avail_out;

	    if (strm.next_out) {
	      if (strm.avail_out === 0 || status === Z_STREAM_END) {

	        if (this.options.to === 'string') {

	          let next_out_utf8 = strings.utf8border(strm.output, strm.next_out);

	          let tail = strm.next_out - next_out_utf8;
	          let utf8str = strings.buf2string(strm.output, next_out_utf8);

	          // move tail & realign counters
	          strm.next_out = tail;
	          strm.avail_out = chunkSize - tail;
	          if (tail) strm.output.set(strm.output.subarray(next_out_utf8, next_out_utf8 + tail), 0);

	          this.onData(utf8str);

	        } else {
	          this.onData(strm.output.length === strm.next_out ? strm.output : strm.output.subarray(0, strm.next_out));
	        }
	      }
	    }

	    // Must repeat iteration if out buffer is full
	    if (status === Z_OK && last_avail_out === 0) continue;

	    // Finalize if end of stream reached.
	    if (status === Z_STREAM_END) {
	      status = inflate_1$2.inflateEnd(this.strm);
	      this.onEnd(status);
	      this.ended = true;
	      return true;
	    }

	    if (strm.avail_in === 0) break;
	  }

	  return true;
	};


	/**
	 * Inflate#onData(chunk) -> Void
	 * - chunk (Uint8Array|String): output data. When string output requested,
	 *   each chunk will be string.
	 *
	 * By default, stores data blocks in `chunks[]` property and glue
	 * those in `onEnd`. Override this handler, if you need another behaviour.
	 **/
	Inflate$1.prototype.onData = function (chunk) {
	  this.chunks.push(chunk);
	};


	/**
	 * Inflate#onEnd(status) -> Void
	 * - status (Number): inflate status. 0 (Z_OK) on success,
	 *   other if not.
	 *
	 * Called either after you tell inflate that the input stream is
	 * complete (Z_FINISH). By default - join collected chunks,
	 * free memory and fill `results` / `err` properties.
	 **/
	Inflate$1.prototype.onEnd = function (status) {
	  // On success - join
	  if (status === Z_OK) {
	    if (this.options.to === 'string') {
	      this.result = this.chunks.join('');
	    } else {
	      this.result = common.flattenChunks(this.chunks);
	    }
	  }
	  this.chunks = [];
	  this.err = status;
	  this.msg = this.strm.msg;
	};


	/**
	 * inflate(data[, options]) -> Uint8Array|String
	 * - data (Uint8Array|ArrayBuffer): input data to decompress.
	 * - options (Object): zlib inflate options.
	 *
	 * Decompress `data` with inflate/ungzip and `options`. Autodetect
	 * format via wrapper header by default. That's why we don't provide
	 * separate `ungzip` method.
	 *
	 * Supported options are:
	 *
	 * - windowBits
	 *
	 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
	 * for more information.
	 *
	 * Sugar (options):
	 *
	 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
	 *   negative windowBits implicitly.
	 * - `to` (String) - if equal to 'string', then result will be converted
	 *   from utf8 to utf16 (javascript) string. When string output requested,
	 *   chunk length can differ from `chunkSize`, depending on content.
	 *
	 *
	 * ##### Example:
	 *
	 * ```javascript
	 * const pako = require('pako');
	 * const input = pako.deflate(new Uint8Array([1,2,3,4,5,6,7,8,9]));
	 * let output;
	 *
	 * try {
	 *   output = pako.inflate(input);
	 * } catch (err) {
	 *   console.log(err);
	 * }
	 * ```
	 **/
	function inflate$1(input, options) {
	  const inflator = new Inflate$1(options);

	  inflator.push(input);

	  // That will never happens, if you don't cheat with options :)
	  if (inflator.err) throw inflator.msg || messages[inflator.err];

	  return inflator.result;
	}


	/**
	 * inflateRaw(data[, options]) -> Uint8Array|String
	 * - data (Uint8Array|ArrayBuffer): input data to decompress.
	 * - options (Object): zlib inflate options.
	 *
	 * The same as [[inflate]], but creates raw data, without wrapper
	 * (header and adler32 crc).
	 **/
	function inflateRaw$1(input, options) {
	  options = options || {};
	  options.raw = true;
	  return inflate$1(input, options);
	}


	/**
	 * ungzip(data[, options]) -> Uint8Array|String
	 * - data (Uint8Array|ArrayBuffer): input data to decompress.
	 * - options (Object): zlib inflate options.
	 *
	 * Just shortcut to [[inflate]], because it autodetects format
	 * by header.content. Done for convenience.
	 **/


	var Inflate_1$1 = Inflate$1;
	var inflate_2 = inflate$1;
	var inflateRaw_1$1 = inflateRaw$1;
	var ungzip$1 = inflate$1;
	var constants = constants$2;

	var inflate_1$1 = {
		Inflate: Inflate_1$1,
		inflate: inflate_2,
		inflateRaw: inflateRaw_1$1,
		ungzip: ungzip$1,
		constants: constants
	};

	const { Deflate, deflate, deflateRaw, gzip } = deflate_1$1;

	const { Inflate, inflate, inflateRaw, ungzip } = inflate_1$1;



	var Deflate_1 = Deflate;
	var deflate_1 = deflate;
	var deflateRaw_1 = deflateRaw;
	var gzip_1 = gzip;
	var Inflate_1 = Inflate;
	var inflate_1 = inflate;
	var inflateRaw_1 = inflateRaw;
	var ungzip_1 = ungzip;
	var constants_1 = constants$2;

	var pako = {
		Deflate: Deflate_1,
		deflate: deflate_1,
		deflateRaw: deflateRaw_1,
		gzip: gzip_1,
		Inflate: Inflate_1,
		inflate: inflate_1,
		inflateRaw: inflateRaw_1,
		ungzip: ungzip_1,
		constants: constants_1
	};

	class MafAdapter extends BaseAdapter.BaseFeatureDataAdapter {
	    static capabilities = ['getFeatures', 'getRefNames'];
	    setupP;
	    readMaf(fileContents) {
	        const lines = fileContents.split('\n');
	        const header = [];
	        const refNames = [];
	        const rows = [];
	        let columns = [];
	        let refNameColumnIndex = 0;
	        lines.forEach(line => {
	            if (line.startsWith('#')) {
	                header.push(line);
	            }
	            else if (line) {
	                if (columns.length === 0) {
	                    columns = line.split('\t');
	                    refNameColumnIndex = columns.findIndex(element => element.toLowerCase() === 'chromosome');
	                }
	                else {
	                    rows.push(line);
	                    refNames.push(line.split('\t')[refNameColumnIndex]);
	                }
	            }
	        });
	        return {
	            header: header.join('\n'),
	            lines: rows,
	            columns,
	            refNames: Array.from(new Set(refNames)),
	        };
	    }
	    parseLine(line, columns) {
	        const mutationObject = {};
	        line.split('\t').forEach((property, i) => {
	            if (property) {
	                mutationObject[columns[i].toLowerCase()] = property;
	            }
	        });
	        return mutationObject;
	    }
	    async decodeFileContents() {
	        const mafLocation = configuration.readConfObject(this.config, 'mafLocation');
	        const fileContents = await io.openLocation(mafLocation, this.pluginManager).readFile();
	        let str;
	        if (typeof fileContents[0] === 'number' &&
	            fileContents[0] === 31 &&
	            typeof fileContents[1] === 'number' &&
	            fileContents[1] === 139 &&
	            typeof fileContents[2] === 'number' &&
	            fileContents[2] === 8) {
	            str = new TextDecoder().decode(pako.inflate(fileContents));
	        }
	        else {
	            str = fileContents.toString();
	        }
	        return this.readMaf(str);
	    }
	    async getLines() {
	        const { columns, lines } = await this.decodeFileContents();
	        return lines.map((line, index) => {
	            return new MafFeature({
	                mutation: this.parseLine(line, columns),
	                id: `${this.id}-maf-${index}`,
	            });
	        });
	    }
	    async setup() {
	        if (!this.setupP) {
	            this.setupP = this.getLines();
	        }
	        return this.setupP;
	    }
	    async getRefNames(_ = {}) {
	        const { refNames } = await this.decodeFileContents();
	        return refNames;
	    }
	    getFeatures(region, opts = {}) {
	        return rxjs.ObservableCreate(async (observer) => {
	            const feats = await this.setup();
	            feats.forEach(f => {
	                if (f.get('refName') === region.refName &&
	                    f.get('end') > region.start &&
	                    f.get('start') < region.end) {
	                    observer.next(f);
	                }
	            });
	            observer.complete();
	        }, opts.signal);
	    }
	    freeResources() { }
	}

	var mbvConfigSchema = configuration.ConfigurationSchema('MbvAdapter', {
	    mbvLocation: {
	        type: 'fileLocation',
	        defaultValue: { uri: '/path/to/myfile.txt', locationType: 'UriLocation' },
	    },
	}, { explicitlyTyped: true });

	class MbvFeature {
	    value;
	    data;
	    _id;
	    constructor(args) {
	        this.value = args.value;
	        this.data = this.dataFromValue(this.value);
	        this._id = args.id;
	    }
	    get(field) {
	        return this.data[field] || this.value[field];
	    }
	    set() { }
	    parent() {
	        return undefined;
	    }
	    children() {
	        return undefined;
	    }
	    tags() {
	        const t = [...Object.keys(this.data), ...Object.keys(this.value)];
	        return t;
	    }
	    id() {
	        return this._id;
	    }
	    dataFromValue(value) {
	        const featureData = {
	            refName: value.chromosome,
	            start: +value.start - 1,
	            end: +value.end,
	            name: `${value['composite element ref']}`,
	            note: value.beta_value,
	        };
	        return featureData;
	    }
	    toJSON() {
	        return {
	            uniqueId: this._id,
	            ...this.value,
	            ...this.data,
	        };
	    }
	}

	class MbvAdapter extends BaseAdapter.BaseFeatureDataAdapter {
	    static capabilities = ['getFeatures', 'getRefNames'];
	    setupP;
	    readMbv(fileContents) {
	        const lines = fileContents.split('\n');
	        const refNames = [];
	        const rows = [];
	        let columns = [];
	        let refNameColumnIndex = 0;
	        lines.forEach(line => {
	            if (columns.length === 0) {
	                columns = line.split('\t');
	                refNameColumnIndex = columns.findIndex(element => element.toLowerCase() === 'chromosome');
	            }
	            else {
	                if (line.split('\t')[refNameColumnIndex] !== '*' &&
	                    line.split('\t')[refNameColumnIndex] !== undefined) {
	                    rows.push(line);
	                    refNames.push(line.split('\t')[refNameColumnIndex]);
	                }
	            }
	        });
	        return {
	            lines: rows,
	            columns,
	            refNames: Array.from(new Set(refNames)),
	        };
	    }
	    parseLine(line, columns) {
	        const mutationObject = {};
	        line.split('\t').forEach((property, i) => {
	            if (property) {
	                mutationObject[columns[i].toLowerCase()] = property;
	            }
	        });
	        return mutationObject;
	    }
	    async decodeFileContents() {
	        const mbvLocation = configuration.readConfObject(this.config, 'mbvLocation');
	        const fileContents = await io.openLocation(mbvLocation, this.pluginManager).readFile();
	        let str;
	        if (typeof fileContents[0] === 'number' &&
	            fileContents[0] === 31 &&
	            typeof fileContents[1] === 'number' &&
	            fileContents[1] === 139 &&
	            typeof fileContents[2] === 'number' &&
	            fileContents[2] === 8) {
	            str = new TextDecoder().decode(pako.inflate(fileContents));
	        }
	        else {
	            str = fileContents.toString();
	        }
	        return this.readMbv(str);
	    }
	    async getLines() {
	        const { columns, lines } = await this.decodeFileContents();
	        return lines.map((line, index) => {
	            return new MbvFeature({
	                value: this.parseLine(line, columns),
	                id: `${this.id}-mbv-${index}`,
	            });
	        });
	    }
	    async setup() {
	        if (!this.setupP) {
	            this.setupP = this.getLines();
	        }
	        return this.setupP;
	    }
	    async getRefNames(_ = {}) {
	        const { refNames } = await this.decodeFileContents();
	        return refNames;
	    }
	    getFeatures(region, opts = {}) {
	        return rxjs.ObservableCreate(async (observer) => {
	            const feats = await this.setup();
	            feats.forEach(f => {
	                if (f.get('refName') === region.refName &&
	                    f.get('end') > region.start &&
	                    f.get('start') < region.end) {
	                    observer.next(f);
	                }
	            });
	            observer.complete();
	        }, opts.signal);
	    }
	    freeResources() { }
	}

	var ieqConfigSchema = configuration.ConfigurationSchema('IeqAdapter', {
	    ieqLocation: {
	        type: 'fileLocation',
	        defaultValue: { uri: '/path/to/myfile.tsv', locationType: 'UriLocation' },
	    },
	}, { explicitlyTyped: true });

	/**
	 * Isoform Expression Quantification Adapter
	 */
	class IeqFeature {
	    iso;
	    data;
	    _id;
	    constructor(args) {
	        this.iso = args.iso;
	        this.data = this.dataFromIso(this.iso);
	        this._id = args.id;
	    }
	    get(field) {
	        return this.data[field] || this.iso[field];
	    }
	    set() { }
	    parent() {
	        return undefined;
	    }
	    children() {
	        return undefined;
	    }
	    tags() {
	        const t = [...Object.keys(this.data), ...Object.keys(this.iso)];
	        return t;
	    }
	    id() {
	        return this._id;
	    }
	    dataFromIso(iso) {
	        const featureData = {
	            refName: iso.chromosome,
	            start: +iso.start - 1,
	            end: +iso.end,
	            name: `${iso.mirna_id}, ${iso.read_count} reads`,
	            strand: 1,
	        };
	        return featureData;
	    }
	    toJSON() {
	        return {
	            uniqueId: this._id,
	            ...this.iso,
	            ...this.data,
	        };
	    }
	}

	/**
	 * Isoform Expression Quantification Adapter
	 */
	class IeqAdapter extends BaseAdapter.BaseFeatureDataAdapter {
	    static capabilities = ['getFeatures', 'getRefNames'];
	    setupP;
	    async readIeq() {
	        const ieqLocation = configuration.readConfObject(this.config, 'ieqLocation');
	        const fileContents = await io.openLocation(ieqLocation, this.pluginManager).readFile('utf8');
	        const lines = fileContents.split('\n');
	        const rows = [];
	        let columns = [];
	        lines.forEach(line => {
	            if (line) {
	                if (columns.length === 0) {
	                    columns = line.split('\t');
	                }
	                else {
	                    rows.push(line);
	                }
	            }
	        });
	        return {
	            lines: rows,
	            columns,
	        };
	    }
	    parseCoords(property) {
	        const splitProperty = property.split(':');
	        return {
	            chromosome: splitProperty[1],
	            start: splitProperty[2].split('-')[0],
	            end: splitProperty[2].split('-')[1],
	            strand: splitProperty[3] === '+' ? 1 : 0,
	        };
	    }
	    parseLine(line, columns) {
	        let iso = {};
	        line.split('\t').forEach((property, i) => {
	            if (property) {
	                if (columns[i] === 'isoform_coords') {
	                    const parsedProperties = this.parseCoords(property);
	                    iso = {
	                        ...iso,
	                        ...parsedProperties,
	                    };
	                }
	                else {
	                    iso[columns[i].toLowerCase()] = property;
	                }
	            }
	        });
	        return iso;
	    }
	    async getLines() {
	        const { columns, lines } = await this.readIeq();
	        return lines.map((line, index) => {
	            return new IeqFeature({
	                iso: this.parseLine(line, columns),
	                id: `${this.id}-ieq-${index}`,
	            });
	        });
	    }
	    async setup() {
	        if (!this.setupP) {
	            this.setupP = this.getLines();
	        }
	        return this.setupP;
	    }
	    async getRefNames(_ = {}) {
	        return [
	            'chr1',
	            'chr2',
	            'chr3',
	            'chr4',
	            'chr5',
	            'chr6',
	            'chr7',
	            'chr8',
	            'chr9',
	            'chr10',
	            'chr11',
	            'chr12',
	            'chr13',
	            'chr14',
	            'chr15',
	            'chr16',
	            'chr17',
	            'chr18',
	            'chr19',
	            'chr20',
	            'chr21',
	            'chr22',
	            'chrX',
	            'chrY',
	        ];
	    }
	    getFeatures(region, opts = {}) {
	        return rxjs.ObservableCreate(async (observer) => {
	            const feats = await this.setup();
	            feats.forEach(f => {
	                if (f.get('refName') === region.refName &&
	                    f.get('end') > region.start &&
	                    f.get('start') < region.end) {
	                    observer.next(f);
	                }
	            });
	            observer.complete();
	        }, opts.signal);
	    }
	    freeResources() { }
	}

	var sjqConfigSchema = configuration.ConfigurationSchema('SjqAdapter', {
	    sjqLocation: {
	        type: 'fileLocation',
	        defaultValue: { uri: '/path/to/myfile.tsv', locationType: 'UriLocation' },
	    },
	}, { explicitlyTyped: true });

	/**
	 * Splice Junction Quantification Adapter
	 */
	class SjqFeature {
	    sjq;
	    data;
	    _id;
	    constructor(args) {
	        this.sjq = args.sjq;
	        this.data = this.dataFromSjq(this.sjq);
	        this._id = args.id;
	    }
	    get(field) {
	        return this.data[field] || this.sjq[field];
	    }
	    set() { }
	    parent() {
	        return undefined;
	    }
	    children() {
	        return undefined;
	    }
	    tags() {
	        const t = [...Object.keys(this.data), ...Object.keys(this.sjq)];
	        return t;
	    }
	    id() {
	        return this._id;
	    }
	    // #chromosome	intron_start	intron_end	strand	intron_motif	annotation	n_unique_map	n_multi_map	max_splice_overhang
	    dataFromSjq(sjq) {
	        const featureData = {
	            refName: sjq.chromosome,
	            start: +sjq.intron_start - 1,
	            end: +sjq.intron_end,
	            score: +sjq.n_unique_map + +sjq.n_multi_map,
	            name: `unique: ${sjq.n_unique_map}, multi: ${sjq.n_multi_map}`,
	        };
	        return featureData;
	    }
	    toJSON() {
	        return {
	            uniqueId: this._id,
	            ...this.sjq,
	            ...this.data,
	        };
	    }
	}

	/**
	 * Splice Junction Quantification Adapter
	 */
	class SjqAdapter extends BaseAdapter.BaseFeatureDataAdapter {
	    static capabilities = ['getFeatures', 'getRefNames'];
	    setupP;
	    readSjq(fileContents) {
	        const lines = fileContents.split('\n');
	        const rows = [];
	        let columns = [];
	        lines.forEach(line => {
	            if (line) {
	                if (columns.length === 0) {
	                    columns = line.split('\t');
	                }
	                else {
	                    rows.push(line);
	                }
	            }
	        });
	        return {
	            lines: rows,
	            columns,
	        };
	    }
	    async decodeFileContents() {
	        const sjqLocation = configuration.readConfObject(this.config, 'sjqLocation');
	        const fileContents = await io.openLocation(sjqLocation, this.pluginManager).readFile();
	        let str;
	        if (typeof fileContents[0] === 'number' &&
	            fileContents[0] === 31 &&
	            typeof fileContents[1] === 'number' &&
	            fileContents[1] === 139 &&
	            typeof fileContents[2] === 'number' &&
	            fileContents[2] === 8) {
	            str = new TextDecoder().decode(pako.inflate(fileContents));
	        }
	        else {
	            str = fileContents.toString();
	        }
	        return this.readSjq(str);
	    }
	    parseLine(line, columns) {
	        const sjq = {};
	        line.split('\t').forEach((property, i) => {
	            // Source: https://stackoverflow.com/questions/4374822/remove-all-special-characters-with-regexp
	            columns[i] = columns[i].toLowerCase().replace(/[^\w\s]/gi, '');
	            if (property) {
	                sjq[columns[i].toLowerCase()] = property;
	            }
	        });
	        return sjq;
	    }
	    async getLines() {
	        const { columns, lines } = await this.decodeFileContents();
	        return lines.map((line, index) => {
	            return new SjqFeature({
	                sjq: this.parseLine(line, columns),
	                id: `${this.id}-sjq-${index}`,
	            });
	        });
	    }
	    async setup() {
	        if (!this.setupP) {
	            this.setupP = this.getLines();
	        }
	        return this.setupP;
	    }
	    async getRefNames(_ = {}) {
	        return [
	            'chr1',
	            'chr2',
	            'chr3',
	            'chr4',
	            'chr5',
	            'chr6',
	            'chr7',
	            'chr8',
	            'chr9',
	            'chr10',
	            'chr11',
	            'chr12',
	            'chr13',
	            'chr14',
	            'chr15',
	            'chr16',
	            'chr17',
	            'chr18',
	            'chr19',
	            'chr20',
	            'chr21',
	            'chr22',
	            'chrX',
	            'chrY',
	        ];
	    }
	    getFeatures(region, opts = {}) {
	        return rxjs.ObservableCreate(async (observer) => {
	            const feats = await this.setup();
	            feats.forEach(f => {
	                if (f.get('refName') === region.refName &&
	                    f.get('end') > region.start &&
	                    f.get('start') < region.end) {
	                    observer.next(f);
	                }
	            });
	            observer.complete();
	        }, opts.signal);
	    }
	    freeResources() { }
	}

	const GDCConfigSchema = configuration.ConfigurationSchema('GDCInternetAccount', {
	    authHeader: {
	        description: 'custom auth header for authorization',
	        type: 'string',
	        defaultValue: 'X-Auth-Token',
	    },
	    customEndpoint: {
	        description: 'custom endpoint for the external token resource',
	        type: 'string',
	        defaultValue: '',
	    },
	}, {
	    baseConfiguration: models.BaseInternetAccountConfig,
	    explicitlyTyped: true,
	});

	const useStyles = mui.makeStyles()(theme => ({
	    root: {
	        margin: theme.spacing(1),
	    },
	    paper: {
	        display: 'flex',
	        flexDirection: 'column',
	        padding: theme.spacing(2),
	    },
	    imgContainer: {
	        display: 'flex',
	        justifyContent: 'center',
	    },
	    img: {
	        width: 100,
	        maxWidth: '100%',
	        maxHeight: '100%',
	        verticalAlign: 'middle',
	    },
	    helperTextContainer: {
	        paddingTop: theme.spacing(2),
	        paddingBottom: theme.spacing(2),
	    },
	    submitTokenContainer: {
	        display: 'flex',
	        flexDirection: 'column',
	    },
	    buttonContainer: {
	        display: 'flex',
	        justifyContent: 'flex-end',
	    },
	    alertContainer: {
	        paddingBottom: theme.spacing(2),
	    },
	}));
	function LoginDialogue({ handleClose, }) {
	    const [token, setToken] = React.useState('');
	    const { classes } = useStyles();
	    return (React.createElement(ui.Dialog, { open: true, onClose: () => handleClose(), maxWidth: "sm", title: "Login to access controlled GDC data" },
	        React.createElement(material.DialogContent, null,
	            React.createElement("div", { className: classes.root },
	                React.createElement("div", { className: classes.paper },
	                    React.createElement(material.Typography, { variant: "h4", align: "center" }, "GDC Data Portal"),
	                    React.createElement("div", { className: classes.helperTextContainer },
	                        React.createElement(material.Typography, { variant: "h6", component: "h1", align: "center" }, "Login to access controlled data"),
	                        React.createElement(material.Typography, { variant: "body1", align: "center" }, "An authentication token is required to access controlled data."),
	                        React.createElement(material.Typography, { variant: "body2", align: "center" }, "You will need to provide your authentication token every time you start a new session, as the token is deleted when the session expires.")),
	                    React.createElement("div", { className: classes.submitTokenContainer },
	                        React.createElement(material.TextField, { color: "primary", variant: "outlined", label: "Enter token", onChange: event => {
	                                setToken(event.target.value);
	                            } }),
	                        React.createElement("div", { className: classes.buttonContainer },
	                            React.createElement(material.Button, { color: "primary", variant: "contained", size: "large", onClick: () => {
	                                    handleClose(token);
	                                } }, "Login"))))))));
	}

	const stateModelFactory = (configSchema) => {
	    return require$$0.types
	        .compose('GDCInternetAccount', models.InternetAccount, require$$0.types.model({
	        id: 'GDCToken',
	        type: require$$0.types.literal('GDCInternetAccount'),
	        configuration: configuration.ConfigurationReference(configSchema),
	    }))
	        .volatile(() => ({
	        needsToken: false,
	    }))
	        .views(self => ({
	        get authHeader() {
	            return configuration.getConf(self, 'authHeader');
	        },
	        get customEndpoint() {
	            return configuration.getConf(self, 'customEndpoint');
	        },
	        get internetAccountType() {
	            return 'GDCInternetAccount';
	        },
	    }))
	        .actions(self => ({
	        setNeedsToken(bool) {
	            self.needsToken = bool;
	        },
	    }))
	        .actions(self => ({
	        getTokenFromUser(resolve, reject) {
	            util.getSession(self).queueDialog(doneCallback => [
	                LoginDialogue,
	                {
	                    handleClose: (token) => {
	                        if (token) {
	                            resolve(token);
	                        }
	                        else {
	                            reject(new Error('failed to add track: this is a controlled resource that requires an authenticated token to access. Please verify your credentials and try again.'));
	                        }
	                        doneCallback();
	                    },
	                },
	            ]);
	        },
	        getFetcher(location) {
	            return async (input, init) => {
	                const authToken = await self.getToken(location);
	                let newInit = init;
	                if (authToken !== 'none') {
	                    newInit = self.addAuthHeaderToInit(init, authToken);
	                }
	                let query = String(input);
	                if (query.includes('files/')) {
	                    query = `${self.customEndpoint}/data/${query.split('/')[4]}`;
	                }
	                return fetch(query, newInit);
	            };
	        },
	    }))
	        .actions(self => {
	        // eslint-disable-next-line @typescript-eslint/unbound-method
	        const superGetToken = self.getToken;
	        const needsToken = new Map();
	        return {
	            /**
	             * uses the location of the resource to fetch the 'metadata' of the
	             * file, which contains the index files (if applicable) and the
	             * property 'controlled' which determines whether the user needs a
	             * token to be checked against the resource or not. if controlled =
	             * false, then the user will not be prompted with a token dialogue
	             *
	             * @param location the uri location of the resource to be fetched
	             */
	            async getToken(location) {
	                if (location && needsToken.has(location.uri)) {
	                    if (needsToken.get(location.uri)) {
	                        return superGetToken(location);
	                    }
	                    else {
	                        return 'none';
	                    }
	                }
	                // determine if the resource requires a token
	                const query = location?.uri.split('/').pop();
	                const response = await fetch(`${self.customEndpoint}/data/${query}`);
	                if (response.status === 403) {
	                    needsToken.set(location?.uri, true);
	                    return superGetToken(location);
	                }
	                else {
	                    if (!response.ok) {
	                        throw new Error(`HTTP ${response.status} (${await response.text()})`);
	                    }
	                }
	                needsToken.set(location?.uri, false);
	                return 'none';
	            },
	        };
	    });
	};

	class GDCPlugin extends Plugin {
	    name = 'GDCPlugin';
	    version = version;
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
	            AdapterClass: GDCAdapter,
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
	                const fileName = tracks.getFileName(file);
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
	                const fileName = tracks.getFileName(file);
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
	            const configSchema = configuration.ConfigurationSchema('GDCTrack', {}, {
	                baseConfiguration: models.createBaseTrackConfig(pluginManager),
	                explicitIdentifier: 'trackId',
	            });
	            return new TrackType$1({
	                name: 'GDCTrack',
	                configSchema,
	                stateModel: models.createBaseTrackModel(pluginManager, 'GDCTrack', configSchema),
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
	            const configSchema = configuration.ConfigurationSchema('IEQTrack', {}, {
	                baseConfiguration: models.createBaseTrackConfig(pluginManager),
	                explicitIdentifier: 'trackId',
	            });
	            return new TrackType$1({
	                name: 'IEQTrack',
	                configSchema,
	                stateModel: models.createBaseTrackModel(pluginManager, 'IEQTrack', configSchema),
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
	            const configSchema = configuration.ConfigurationSchema('MAFTrack', {}, {
	                baseConfiguration: models.createBaseTrackConfig(pluginManager),
	                explicitIdentifier: 'trackId',
	            });
	            return new TrackType$1({
	                name: 'MAFTrack',
	                configSchema,
	                stateModel: models.createBaseTrackModel(pluginManager, 'MAFTrack', configSchema),
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
	        pluginManager.addWidgetType(() => {
	            return new WidgetType({
	                name: 'GDCFeatureWidget',
	                heading: 'Feature Details',
	                configSchema: configSchema,
	                stateModel: stateModelFactory$1(),
	                ReactComponent: GDCFeatureWidgetComponent,
	            });
	        });
	        pluginManager.addWidgetType(() => {
	            return new WidgetType({
	                name: 'GDCSearchWidget',
	                heading: 'Search GDC',
	                ...GDCSearchWidgetF(pluginManager),
	            });
	        });
	        pluginManager.addInternetAccountType(() => {
	            return new _default$d({
	                name: 'GDCInternetAccount',
	                configSchema: GDCConfigSchema,
	                stateModel: stateModelFactory(GDCConfigSchema),
	            });
	        });
	    }
	    configure(pluginManager) {
	        if (util.isAbstractMenuManager(pluginManager.rootModel)) {
	            pluginManager.rootModel.appendToMenu('Tools', {
	                label: 'GDC Data Import',
	                icon: DataExploration,
	                onClick: (session) => {
	                    session.showWidget(session.addWidget('GDCSearchWidget', 'gdcSearchWidget'));
	                },
	            });
	        }
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
	            const filteredConsequences = feature
	                .get('consequence')
	                .hits.edges.filter((cons) => cons.node.transcript.is_canonical);
	            const impact = filteredConsequences[0].node.transcript.annotation[hlBy.attributeName];
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

	exports.default = GDCPlugin;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=jbrowse-plugin-gdc.umd.development.js.map

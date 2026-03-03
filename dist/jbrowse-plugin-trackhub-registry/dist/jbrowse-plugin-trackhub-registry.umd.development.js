(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@jbrowse/core/Plugin'), require('@jbrowse/core/configuration'), require('@jbrowse/core/pluggableElementTypes/models'), require('@jbrowse/core/util'), require('mobx-state-tree'), require('@jbrowse/core/util/tracks'), require('react'), require('@jbrowse/core/util/io'), require('@mui/material'), require('tss-react/mui'), require('@jbrowse/core/ui'), require('@mui/material/utils')) :
	typeof define === 'function' && define.amd ? define(['exports', '@jbrowse/core/Plugin', '@jbrowse/core/configuration', '@jbrowse/core/pluggableElementTypes/models', '@jbrowse/core/util', 'mobx-state-tree', '@jbrowse/core/util/tracks', 'react', '@jbrowse/core/util/io', '@mui/material', 'tss-react/mui', '@jbrowse/core/ui', '@mui/material/utils'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.JBrowsePluginTrackHubRegistry = {}, global.JBrowseExports["@jbrowse/core/Plugin"], global.JBrowseExports["@jbrowse/core/configuration"], global.JBrowseExports["@jbrowse/core/pluggableElementTypes/models"], global.JBrowseExports["@jbrowse/core/util"], global.JBrowseExports["mobx-state-tree"], global.JBrowseExports["@jbrowse/core/util/tracks"], global.JBrowseExports.react, global.JBrowseExports["@jbrowse/core/util/io"], global.JBrowseExports["@mui/material"], global.JBrowseExports["tss-react/mui"], global.JBrowseExports["@jbrowse/core/ui"], global.JBrowseExports["@mui/material/utils"]));
})(this, (function (exports, Plugin, configuration, models, util, mobxStateTree, tracks, React, io, material, mui, ui, require$$0) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var Plugin__default = /*#__PURE__*/_interopDefaultLegacy(Plugin);
	var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
	var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var ConnectionType$1 = {};

	var PluggableElementBase$1 = {};

	Object.defineProperty(PluggableElementBase$1, "__esModule", { value: true });
	class PluggableElementBase {
	    constructor(args) {
	        this.name = '';
	        this.name = args.name;
	    }
	}
	PluggableElementBase$1.default = PluggableElementBase;

	var __importDefault$5 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(ConnectionType$1, "__esModule", { value: true });
	const PluggableElementBase_1 = __importDefault$5(PluggableElementBase$1);
	class ConnectionType extends PluggableElementBase_1.default {
	    constructor(stuff) {
	        super(stuff);
	        this.stateModel = stuff.stateModel;
	        this.configSchema = stuff.configSchema;
	        this.displayName = stuff.displayName;
	        this.description = stuff.description;
	        this.url = stuff.url;
	        this.configEditorComponent = stuff.configEditorComponent;
	        if (!this.stateModel) {
	            throw new Error(`no stateModel defined for connection ${this.name}`);
	        }
	        if (!this.configSchema) {
	            throw new Error(`no configSchema defined for connection ${this.name}`);
	        }
	    }
	}
	var _default$2 = ConnectionType$1.default = ConnectionType;

	var configSchema = configuration.ConfigurationSchema('TheTrackHubRegistryConnection', {
	    /**
	     * #slot
	     */
	    trackDbId: {
	        type: 'string',
	        defaultValue: '',
	        description: 'id of the trackDb in The Track Hub Registry',
	    },
	}, {
	    /**
	     * #baseConfiguration
	     */
	    baseConfiguration: models.baseConnectionConfig,
	});

	function ownKeys(object, enumerableOnly) {
	  var keys = Object.keys(object);
	  if (Object.getOwnPropertySymbols) {
	    var symbols = Object.getOwnPropertySymbols(object);
	    enumerableOnly && (symbols = symbols.filter(function (sym) {
	      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
	    })), keys.push.apply(keys, symbols);
	  }
	  return keys;
	}
	function _objectSpread2(target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = null != arguments[i] ? arguments[i] : {};
	    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
	      _defineProperty(target, key, source[key]);
	    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
	      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
	    });
	  }
	  return target;
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

	function getSubtracks(track) {
	  var trackPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
	  if (track.members) {
	    return Object.values(track.members).map(function (subTrack) {
	      return getSubtracks(subTrack, track.shortLabel ? trackPath.concat([track.shortLabel]) : trackPath);
	    }).flat();
	  }
	  track.categories = trackPath;
	  return [track];
	}
	function generateTracks(trackDb, assemblyName, sequenceAdapter) {
	  // eslint-disable-next-line no-underscore-dangle
	  var configuration = trackDb.configuration;
	  var subTracks = getSubtracks({
	    members: configuration
	  });
	  return subTracks.map(function (subTrack) {
	    var ret = makeTrackConfig(subTrack, trackDb.hub.url, sequenceAdapter);
	    return _objectSpread2(_objectSpread2({}, makeTrackConfig(subTrack, trackDb.hub.url, sequenceAdapter)), {}, {
	      trackId: "trackhub-registry-".concat(util.objectHash(ret)),
	      assemblyNames: [assemblyName]
	    });
	  });
	}
	function makeTrackConfig(track, trackDbUrl, sequenceAdapter) {
	  var trackType = track.type;
	  var baseTrackType = trackType.split(' ')[0].toLowerCase();
	  if (baseTrackType === 'bam' && track.bigDataUrl.toLowerCase().endsWith('cram')) {
	    baseTrackType = 'cram';
	  }
	  var bigDataUrl = track.bigDataUrl;
	  var bigDataLocation = {
	    uri: new URL(bigDataUrl, trackDbUrl).href,
	    locationType: 'UriLocation'
	  };
	  var categories = track.categories;
	  var bigDataIndexLocation;
	  switch (baseTrackType) {
	    case 'bam':
	      if (trackDbUrl) {
	        bigDataIndexLocation = track.bigDataIndex ? {
	          uri: new URL(track.bigDataIndex, trackDbUrl).href,
	          locationType: 'UriLocation'
	        } : {
	          uri: new URL("".concat(track.bigDataUrl, ".bai"), trackDbUrl).href,
	          locationType: 'UriLocation'
	        };
	      } else {
	        bigDataIndexLocation = track.bigDataIndex ? {
	          localPath: track.bigDataIndex,
	          locationType: 'LocalPathLocation'
	        } : {
	          localPath: "".concat(track.bigDataUrl, ".bai"),
	          locationType: 'LocalPathLocation'
	        };
	      }
	      return {
	        type: 'AlignmentsTrack',
	        name: track.shortLabel,
	        description: track.longLabel,
	        category: categories,
	        adapter: {
	          type: 'BamAdapter',
	          bamLocation: bigDataLocation,
	          index: {
	            location: bigDataIndexLocation
	          }
	        }
	      };
	    case 'bed':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    case 'bed5floatscore':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    case 'bedgraph':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    case 'bedrnaelements':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    case 'bigbarchart':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    case 'bigbed':
	      return {
	        type: 'FeatureTrack',
	        name: track.shortLabel,
	        description: track.longLabel,
	        category: categories,
	        adapter: {
	          type: 'BigBedAdapter',
	          bigBedLocation: bigDataLocation
	        }
	      };
	    case 'bigchain':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    case 'biginteract':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    case 'bigmaf':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    case 'bigpsl':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    case 'bigwig':
	      return {
	        type: 'QuantitativeTrack',
	        name: track.shortLabel,
	        description: track.longLabel,
	        category: categories,
	        adapter: {
	          type: 'BigWigAdapter',
	          bigWigLocation: bigDataLocation
	        }
	      };
	    case 'broadpeak':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    case 'coloredexon':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    case 'cram':
	      if (trackDbUrl) {
	        bigDataIndexLocation = track.bigDataIndex ? {
	          uri: new URL(track.bigDataIndex, trackDbUrl).href,
	          locationType: 'UriLocation'
	        } : {
	          uri: new URL("".concat(track.bigDataUrl, ".bai"), trackDbUrl).href,
	          locationType: 'UriLocation'
	        };
	      } else {
	        bigDataIndexLocation = track.bigDataIndex ? {
	          localPath: track.bigDataIndex,
	          locationType: 'LocalPathLocation'
	        } : {
	          localPath: "".concat(track.bigDataUrl, ".bai"),
	          locationType: 'LocalPathLocation'
	        };
	      }
	      return {
	        type: 'AlignmentsTrack',
	        name: track.shortLabel,
	        description: track.longLabel,
	        category: categories,
	        adapter: {
	          type: 'CramAdapter',
	          bamLocation: bigDataLocation,
	          index: {
	            location: bigDataIndexLocation
	          },
	          sequenceAdapter: sequenceAdapter
	        }
	      };
	    case 'gvf':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    case 'ld2':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    case 'narrowpeak':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    case 'peptidemapping':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    case 'vcftabix':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    case 'wig':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    case 'wigmaf':
	      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
	    default:
	      throw new Error("Unsupported track type: ".concat(baseTrackType));
	  }
	}

	async function mfetch(url, request) {
	    const response = await fetch(url, request);
	    if (!response.ok) {
	        throw new Error(`HTTP
          ${response.status}: ${await response.text()} from
          ${url}`);
	    }
	    return response.json();
	}
	async function post_with_params(url, params = {}, options = {}) {
	    const urlParams = Object.keys(params)
	        .map(param => `${param}=${params[param]}`)
	        .join('&');
	    return mfetch(`${url}${urlParams ? `?${urlParams}` : ''}`, {
	        ...options,
	        method: 'POST',
	    });
	}

	function stateModelFactory(pluginManager) {
	    return mobxStateTree.types
	        .compose('TheTrackHubRegistryConnection', models.BaseConnectionModelFactory(pluginManager), mobxStateTree.types.model({
	        type: mobxStateTree.types.literal('TheTrackHubRegistryConnection'),
	        configuration: configuration.ConfigurationReference(configSchema),
	    }))
	        .volatile(() => ({
	        error: undefined,
	    }))
	        .actions(self => ({
	        async connect(connectionConf) {
	            // @ts-ignore
	            self.clear();
	            const trackDbId = configuration.readConfObject(connectionConf, 'trackDbId');
	            try {
	                const trackDb = await mfetch(`https://www.trackhubregistry.org/api/search/trackdb/${trackDbId}`);
	                const assemblyName = trackDb.assembly.name;
	                const session = util.getSession(self);
	                const assembly = session.assemblyManager.get(assemblyName);
	                if (!assembly) {
	                    throw new Error(`unknown assembly ${assemblyName}`);
	                }
	                const sequenceAdapter = configuration.getConf(assembly, ['sequence', 'adapter']);
	                const tracks = generateTracks(trackDb, assemblyName, sequenceAdapter);
	                self.setTrackConfs(tracks);
	            }
	            catch (e) {
	                console.error(e);
	                this.setError(e);
	            }
	        },
	        setError(e) {
	            self.error = e;
	        },
	    }));
	}

	var dist = {};

	var raFile = {};

	var raStanza = {};

	Object.defineProperty(raStanza, "__esModule", { value: true });
	/**
	 * Class representing an ra file stanza. Each stanza line is split into its key
	 * and value and stored as a Map, so the usual Map methods can be used on the
	 * stanza. An additional method `add()` is available to take a raw line of text
	 * and break it up into a key and value and add them to the class. This should
	 * be favored over `set()` when possible, as it performs more validity checks
	 * than using `set()`.
	 *
	 * @extends Map
	 * @property {undefined|string} nameKey - The key of the first line of the
	 * stanza (`undefined` if the stanza has no lines yet).
	 *
	 * @property {undefined|string} name - The value of the first line of the
	 * stanza, by which it is identified in an ra file  (`undefined` if the stanza
	 * has no lines yet).
	 *
	 * @property {undefined|string} indent - The leading indent of the stanza,
	 * which is the same for every line (`undefined` if the stanza has no lines
	 * yet, `''` if there is no indent).
	 *
	 * @throws {Error} Throws if the stanza has blank lines, if the first line
	 * doesn't have both a key and a value, if a key in the stanza is
	 * duplicated, or if lines in the stanza have inconsistent indentation.
	 * @param {(string|string[])} [stanza=[]] - An ra file stanza, either as a
	 * string or a array of strings with one line per entry. Supports both LF and
	 * CRLF line terminators.
	 *
	 * @param {object} options
	 *
	 * @param {boolean} options.checkIndent [true] - Check if a stanza is indented
	 * consistently and keep track of the indentation
	 */
	class RaStanza extends Map {
	    constructor(stanza, options = { checkIndent: true }) {
	        super();
	        const { checkIndent } = options;
	        this._checkIndent = checkIndent;
	        let stanzaLines;
	        if (typeof stanza === 'string') {
	            stanzaLines = stanza.trimEnd().split(/\r?\n/);
	        }
	        else if (!stanza) {
	            stanzaLines = [];
	        }
	        else {
	            stanzaLines = stanza;
	        }
	        this._keyAndCommentOrder = [];
	        stanzaLines.forEach(line => {
	            this.add(line);
	        });
	    }
	    /**
	     * Add a single line to the stanza. If the exact line already exists, does
	     * nothing.
	     * @param {string} line A stanza line
	     * @returns {RaStanza} The RaStanza object
	     */
	    add(line) {
	        if (line === '') {
	            throw new Error('Invalid stanza, contained blank lines');
	        }
	        if (line.trim().startsWith('#')) {
	            this._keyAndCommentOrder.push(line.trim());
	            return this;
	        }
	        if (line.trimEnd().endsWith('\\')) {
	            const trimmedLine = line.trimEnd().slice(0, -1);
	            if (this._continuedLine) {
	                this._continuedLine += trimmedLine.trimStart();
	            }
	            else {
	                this._continuedLine = trimmedLine;
	            }
	            return this;
	        }
	        let combinedLine = line;
	        if (this._continuedLine) {
	            combinedLine = this._continuedLine + combinedLine.trimStart();
	            this._continuedLine = undefined;
	        }
	        if (this.indent || this._checkIndent) {
	            const indent = combinedLine.match(/^([ \t]+)/);
	            if (this.indent === undefined) {
	                if (indent) {
	                    [, this.indent] = indent;
	                }
	                else {
	                    this.indent = '';
	                }
	            }
	            else if ((this.indent === '' && indent !== null) ||
	                (this.indent && indent && this.indent !== indent[1])) {
	                throw new Error('Inconsistent indentation of stanza');
	            }
	        }
	        else {
	            this.indent = '';
	        }
	        const trimmedLine = combinedLine.trim();
	        const sep = trimmedLine.indexOf(' ');
	        if (sep === -1) {
	            if (!this.nameKey) {
	                throw new Error('First line in a stanza must have both a key and a value');
	            }
	            // Adding a key that already exists and has no value is a no-op
	            if (this.has(trimmedLine)) {
	                return this;
	            }
	            this._keyAndCommentOrder.push(trimmedLine);
	            return super.set(trimmedLine, '');
	        }
	        const key = trimmedLine.slice(0, sep);
	        const value = trimmedLine.slice(sep + 1);
	        if (this.has(key) && value !== this.get(key)) {
	            throw new Error('Got duplicate key with a different value in stanza: ' +
	                `"${key}" key has both ${this.get(key)} and ${value}`);
	        }
	        this._keyAndCommentOrder.push(key);
	        if (!this.nameKey) {
	            this.nameKey = key;
	            this.name = trimmedLine.slice(sep + 1);
	        }
	        return super.set(key, value);
	    }
	    /**
	     * Use `add()` if possible instead of this method. If using this, be aware
	     * that no checks are made for comments, indentation, duplicate keys, etc.
	     * @param {string} key The key of the stanza line
	     * @param {string} value The value of the stanza line
	     * @returns {RaStanza} The RaStanza object
	     */
	    set(key, value) {
	        if (!(typeof value === 'string')) {
	            throw new Error(`Value of ${key} must be a string, got ${typeof value}`);
	        }
	        return super.set(key, value);
	    }
	    /**
	     * Delete a line
	     * @param {string} key The key of the line to delete
	     * @returns {boolean} true if the deleted line existed, false if it did not
	     */
	    delete(key) {
	        if (key === this.nameKey) {
	            throw new Error('Cannot delete the first line in a stanza (you can still overwrite it with set()).');
	        }
	        if (this._keyAndCommentOrder.includes(key)) {
	            this._keyAndCommentOrder = this._keyAndCommentOrder.filter(value => value !== key);
	        }
	        return super.delete(key);
	    }
	    /**
	     * Clear all lines and comments
	     */
	    clear() {
	        this._keyAndCommentOrder.length = 0;
	        this._continuedLine = undefined;
	        this.indent = undefined;
	        this.name = undefined;
	        this.nameKey = undefined;
	        super.clear();
	    }
	    /**
	     * @returns {string} Returns the stanza as a string fit for writing to a ra
	     * file. Original leading indent is preserved. It may not be the same as the
	     * input stanza as lines that were joined with `\` in the input will be output
	     * as a single line and all comments will have the same indentations as the
	     * rest of the stanza. Comments between joined lines will move before that
	     * line.
	     */
	    toString() {
	        if (this.size === 0) {
	            return '';
	        }
	        const lines = [];
	        this._keyAndCommentOrder.forEach(entry => {
	            if (entry.startsWith('#')) {
	                lines.push(`${this.indent}${entry}`);
	            }
	            else {
	                lines.push(`${this.indent}${entry} ${this.get(entry)}`.trimEnd());
	            }
	        });
	        return `${lines.join('\n')}\n`;
	    }
	}
	raStanza.default = RaStanza;

	var __importDefault$4 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(raFile, "__esModule", { value: true });
	const raStanza_1$2 = __importDefault$4(raStanza);
	/**
	 * Class representing an ra file. Each file is composed of multiple stanzas, and
	 * each stanza is separated by one or more blank lines. Each stanza is stored in
	 * a Map with the key being the value of the first key-value pair in the stanza.
	 * The usual Map methods can be used on the file. An additional method `add()`
	 * is available to take a raw line of text and break it up into a key and value
	 * and add them to the class. This should be favored over `set()` when possible,
	 * as it performs more validity checks than using `set()`.
	 * @extends Map
	 * @property {undefined|string} nameKey - The key of the first line of all the
	 * stanzas (`undefined` if the stanza has no lines yet).
	 * @throws {Error} Throws if an empty stanza is added, if the key in the first
	 * key-value pair of each stanze isn't the same, or if two stanzas have the same
	 * value for the key-value pair in their first lines.
	 * @param {(string|string[])} [raFile=[]] - An ra file, either as a single
	 * string or an array of strings with one stanza per entry. Supports both LF
	 * and CRLF line terminators.
	 * @param {object} options
	 * @param {boolean} options.checkIndent [true] - Check if a the stanzas within
	 * the file are indented consistently and keep track of the indentation
	 */
	class RaFile extends Map {
	    constructor(raFile, options = { checkIndent: true }) {
	        super();
	        const { checkIndent } = options;
	        this._checkIndent = checkIndent;
	        let stanzas;
	        if (typeof raFile === 'string') {
	            stanzas = raFile.trimEnd().split(/(?:[\t ]*\r?\n){2,}/);
	        }
	        else if (!raFile) {
	            stanzas = [];
	        }
	        else {
	            stanzas = raFile;
	        }
	        this._stanzaAndCommentOrder = [];
	        stanzas.forEach(stanza => {
	            this.add(stanza);
	        });
	    }
	    /**
	     * Add a single stanza to the file
	     * @param {string} stanza A single stanza
	     * @returns {RaFile} The RaFile object
	     */
	    add(stanza) {
	        if (stanza === '') {
	            throw new Error('Invalid stanza, was empty');
	        }
	        if (stanza.trim().startsWith('#')) {
	            const stanzaLines = stanza
	                .trimEnd()
	                .split(/\r?\n/)
	                .map(line => line.trim());
	            if (stanzaLines.every(line => line.startsWith('#'))) {
	                this._stanzaAndCommentOrder.push(stanzaLines.join('\n'));
	                return this;
	            }
	        }
	        const raStanza = new raStanza_1$2.default(stanza, { checkIndent: this._checkIndent });
	        if (!this.nameKey) {
	            this.nameKey = raStanza.nameKey;
	        }
	        else if (raStanza.nameKey !== this.nameKey) {
	            throw new Error('The first line in each stanza must have the same key. ' +
	                `Saw both ${this.nameKey} and ${raStanza.nameKey}`);
	        }
	        if (!raStanza.name) {
	            throw new Error(`No stanza name: ${raStanza.name}`);
	        }
	        if (this.has(raStanza.name)) {
	            throw new Error(`Got duplicate stanza name: ${raStanza.name}`);
	        }
	        this._stanzaAndCommentOrder.push(raStanza.name);
	        return super.set(raStanza.name, raStanza);
	    }
	    /**
	     * Use `add()` if possible instead of this method. If using this, be aware
	     * that no checks are made for comments, empty stanzas, duplicate keys, etc.
	     * @param {string} key The key of the RaFile stanza
	     * @param {RaStanza} value The RaFile stanza used to replace the prior one
	     */
	    update(key, value) {
	        if (!(value instanceof raStanza_1$2.default)) {
	            throw new Error(`Value of ${key} is not an RaStanza`);
	        }
	        super.set(key, value);
	    }
	    /**
	     * Delete a stanza
	     * @param {string} stanza The name of the stanza to delete (the value in its
	     * first key-value pair)
	     * @returns {boolean} true if the deleted stanza existed, false if it did not
	     */
	    delete(stanza) {
	        if (this._stanzaAndCommentOrder.includes(stanza)) {
	            this._stanzaAndCommentOrder = this._stanzaAndCommentOrder.filter(value => value !== stanza);
	        }
	        return super.delete(stanza);
	    }
	    /**
	     * Clear all stanzas and comments
	     */
	    clear() {
	        this._stanzaAndCommentOrder.length = 0;
	        this.nameKey = undefined;
	        super.clear();
	    }
	    /**
	     * @returns {string} Returns the stanza as a string fit for writing to a ra
	     * file. Original leading indent is preserved. It may not be the same as the
	     * input stanza as lines that were joined with `\` in the input will be output
	     *  as a single line and all comments will have the same indentations as the
	     * rest of the stanza. Comments between joined lines will move before that
	     * line.
	     */
	    toString() {
	        if (this.size === 0) {
	            return '';
	        }
	        const stanzas = [];
	        this._stanzaAndCommentOrder.forEach(entry => {
	            if (entry.startsWith('#')) {
	                stanzas.push(`${entry}\n`);
	            }
	            else {
	                const e = this.get(entry);
	                if (e) {
	                    stanzas.push(e.toString());
	                }
	            }
	        });
	        return stanzas.join('\n');
	    }
	}
	raFile.default = RaFile;

	var trackDbFile = {};

	var __importDefault$3 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(trackDbFile, "__esModule", { value: true });
	const raFile_1$2 = __importDefault$3(raFile);
	/**
	 * Class representing a genomes.txt file.
	 * @extends RaFile
	 * @param {(string|string[])} [trackDbFile=[]] - A trackDb.txt file as a string
	 * @throws {Error} Throws if "track" is not the first key in each track or if a
	 * track is missing required keys
	 */
	class TrackDbFile extends raFile_1$2.default {
	    constructor(trackDbFile) {
	        super(trackDbFile, { checkIndent: false });
	        if (this.nameKey !== 'track') {
	            throw new Error(`trackDb has "${this.nameKey}" instead of "track" as the first line in each track`);
	        }
	        this.forEach((track, trackName) => {
	            var _a;
	            const trackKeys = Array.from(track.keys());
	            const missingKeys = [];
	            const requiredKeys = ['track', 'shortLabel'];
	            requiredKeys.forEach(key => {
	                if (!trackKeys.includes(key)) {
	                    missingKeys.push(key);
	                }
	            });
	            if (missingKeys.length > 0) {
	                throw new Error(`Track ${trackName} is missing required key(s): ${missingKeys.join(', ')}`);
	            }
	            const parentTrackKeys = [
	                'superTrack',
	                'compositeTrack',
	                'container',
	                'view',
	            ];
	            if (!trackKeys.some(key => parentTrackKeys.includes(key))) {
	                if (!trackKeys.includes('bigDataUrl')) {
	                    throw new Error(`Track ${trackName} is missing required key "bigDataUrl"`);
	                }
	                if (!trackKeys.includes('type')) {
	                    const settings = this.settings(trackName);
	                    const settingsKeys = Array.from(settings.keys());
	                    if (!settingsKeys.includes('type')) {
	                        throw new Error(`Neither track ${trackName} nor any of its parent tracks have the required key "type"`);
	                    }
	                }
	            }
	            let indent = '';
	            let currentTrackName = trackName;
	            do {
	                currentTrackName = (_a = this.get(currentTrackName)) === null || _a === void 0 ? void 0 : _a.get('parent');
	                if (currentTrackName) {
	                    [currentTrackName] = currentTrackName.split(' ');
	                    indent += '    ';
	                }
	            } while (currentTrackName);
	            const currentTrack = this.get(trackName);
	            if (currentTrack) {
	                currentTrack.indent = indent;
	                this.set(trackName, currentTrack);
	            }
	        });
	    }
	    /**
	     * Gets all track entries including those of parent tracks, with closer
	     * entries overriding more distant ones
	     * @param {string} trackName The name of a track
	     * @throws {Error} Throws if track name does not exist in the trackDb
	     */
	    settings(trackName) {
	        var _a;
	        if (!this.has(trackName)) {
	            throw new Error(`Track ${trackName} does not exist`);
	        }
	        const parentTracks = [trackName];
	        let currentTrackName = trackName;
	        do {
	            currentTrackName = (_a = this.get(currentTrackName)) === null || _a === void 0 ? void 0 : _a.get('parent');
	            if (currentTrackName) {
	                parentTracks.push(currentTrackName);
	            }
	        } while (currentTrackName);
	        const settings = new Map();
	        parentTracks.reverse();
	        parentTracks.forEach(parentTrack => {
	            var _a;
	            (_a = this.get(parentTrack)) === null || _a === void 0 ? void 0 : _a.forEach((value, key) => {
	                settings.set(key, value);
	            });
	        });
	        return settings;
	    }
	}
	trackDbFile.default = TrackDbFile;

	var hubFile = {};

	var __importDefault$2 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(hubFile, "__esModule", { value: true });
	const raStanza_1$1 = __importDefault$2(raStanza);
	/**
	 * Class representing a hub.txt file.
	 * @extends RaStanza
	 * @param {(string|string[])} [hubFile=[]] - A hub.txt file as a string
	 * @throws {Error} Throws if the first line of the hub.txt file doesn't start
	 * with "hub <hub_name>", if it has invalid entries, or is missing required
	 * entries
	 */
	class HubFile$1 extends raStanza_1$1.default {
	    constructor(hubFile) {
	        super(hubFile);
	        if (this.nameKey !== 'hub') {
	            throw new Error('Hub file must begin with a line like "hub <hub_name>"');
	        }
	        const hubTxtFields = [
	            'hub',
	            'shortLabel',
	            'longLabel',
	            'genomesFile',
	            'email',
	            'descriptionUrl',
	        ];
	        const extraFields = [];
	        this.forEach((_value, key) => {
	            if (!hubTxtFields.includes(key)) {
	                extraFields.push(key);
	            }
	        });
	        if (extraFields.length > 0) {
	            throw new Error(`Hub file has invalid entr${extraFields.length === 1 ? 'y' : 'ies'}: ${extraFields.join(', ')}`);
	        }
	        const missingFields = [];
	        hubTxtFields.forEach(field => {
	            if (field !== 'descriptionUrl' && !this.get(field)) {
	                missingFields.push(field);
	            }
	        });
	        if (missingFields.length > 0) {
	            throw new Error(`Hub file is missing required entr${missingFields.length === 1 ? 'y' : 'ies'}: ${missingFields.join(', ')}`);
	        }
	    }
	}
	hubFile.default = HubFile$1;

	var genomesFile = {};

	var __importDefault$1 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(genomesFile, "__esModule", { value: true });
	const raFile_1$1 = __importDefault$1(raFile);
	/**
	 * Class representing a genomes.txt file.
	 * @extends RaFile
	 * @param {(string|string[])} [genomesFile=[]] - A genomes.txt file as a string
	 * @throws {Error} Throws if the first line of the hub.txt file doesn't start
	 * with "genome <genome_name>" or if it has invalid entries
	 */
	class GenomesFile extends raFile_1$1.default {
	    constructor(genomesFile) {
	        super(genomesFile);
	        if (this.nameKey !== 'genome') {
	            throw new Error('Genomes file must begin with a line like "genome <genome_name>"');
	        }
	        // TODO: check if genome is hosted by UCSC and if not, require twoBitPath and groups
	        const requiredFields = [
	            'genome',
	            'trackDb',
	            // 'twoBitPath',
	            // 'groups',
	        ];
	        this.forEach((genome, genomeName) => {
	            const missingFields = [];
	            requiredFields.forEach(field => {
	                if (!genome.get(field)) {
	                    missingFields.push(field);
	                }
	            });
	            if (missingFields.length > 0) {
	                throw new Error(`Genomes file entry ${genomeName} is missing required entr${missingFields.length === 1 ? 'y' : 'ies'}: ${missingFields.join(', ')}`);
	            }
	        });
	    }
	}
	genomesFile.default = GenomesFile;

	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(dist, "__esModule", { value: true });
	dist.GenomesFile = HubFile = dist.HubFile = dist.TrackDbFile = dist.RaStanza = dist.RaFile = void 0;
	const raFile_1 = __importDefault(raFile);
	dist.RaFile = raFile_1.default;
	const raStanza_1 = __importDefault(raStanza);
	dist.RaStanza = raStanza_1.default;
	const trackDbFile_1 = __importDefault(trackDbFile);
	dist.TrackDbFile = trackDbFile_1.default;
	const hubFile_1 = __importDefault(hubFile);
	var HubFile = dist.HubFile = hubFile_1.default;
	const genomesFile_1 = __importDefault(genomesFile);
	dist.GenomesFile = genomesFile_1.default;

	var Email = {};

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

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	Object.defineProperty(exports, "default", {
	  enumerable: true,
	  get: function () {
	    return _utils.createSvgIcon;
	  }
	});
	var _utils = require$$0__default["default"];
	}(createSvgIcon));

	var global$1 = (typeof global !== "undefined" ? global :
	            typeof self !== "undefined" ? self :
	            typeof window !== "undefined" ? window : {});

	// shim for using process in browser
	// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	var cachedSetTimeout = defaultSetTimout;
	var cachedClearTimeout = defaultClearTimeout;
	if (typeof global$1.setTimeout === 'function') {
	    cachedSetTimeout = setTimeout;
	}
	if (typeof global$1.clearTimeout === 'function') {
	    cachedClearTimeout = clearTimeout;
	}

	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	function nextTick(fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	}
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	var title = 'browser';
	var platform = 'browser';
	var browser = true;
	var env = {};
	var argv = [];
	var version = ''; // empty string to avoid regexp issues
	var versions = {};
	var release = {};
	var config = {};

	function noop() {}

	var on = noop;
	var addListener = noop;
	var once = noop;
	var off = noop;
	var removeListener = noop;
	var removeAllListeners = noop;
	var emit = noop;

	function binding(name) {
	    throw new Error('process.binding is not supported');
	}

	function cwd () { return '/' }
	function chdir (dir) {
	    throw new Error('process.chdir is not supported');
	}function umask() { return 0; }

	// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
	var performance = global$1.performance || {};
	var performanceNow =
	  performance.now        ||
	  performance.mozNow     ||
	  performance.msNow      ||
	  performance.oNow       ||
	  performance.webkitNow  ||
	  function(){ return (new Date()).getTime() };

	// generate timestamp or delta
	// see http://nodejs.org/api/process.html#process_process_hrtime
	function hrtime(previousTimestamp){
	  var clocktime = performanceNow.call(performance)*1e-3;
	  var seconds = Math.floor(clocktime);
	  var nanoseconds = Math.floor((clocktime%1)*1e9);
	  if (previousTimestamp) {
	    seconds = seconds - previousTimestamp[0];
	    nanoseconds = nanoseconds - previousTimestamp[1];
	    if (nanoseconds<0) {
	      seconds--;
	      nanoseconds += 1e9;
	    }
	  }
	  return [seconds,nanoseconds]
	}

	var startTime = new Date();
	function uptime() {
	  var currentTime = new Date();
	  var dif = currentTime - startTime;
	  return dif / 1000;
	}

	var process = {
	  nextTick: nextTick,
	  title: title,
	  browser: browser,
	  env: env,
	  argv: argv,
	  version: version,
	  versions: versions,
	  on: on,
	  addListener: addListener,
	  once: once,
	  off: off,
	  removeListener: removeListener,
	  removeAllListeners: removeAllListeners,
	  emit: emit,
	  binding: binding,
	  cwd: cwd,
	  chdir: chdir,
	  umask: umask,
	  hrtime: hrtime,
	  platform: platform,
	  release: release,
	  config: config,
	  uptime: uptime
	};

	var jsxRuntime = {exports: {}};

	var reactJsxRuntime_production_min = {};

	/*
	object-assign
	(c) Sindre Sorhus
	@license MIT
	*/
	/* eslint-disable no-unused-vars */
	var getOwnPropertySymbols = Object.getOwnPropertySymbols;
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}

			// Detect buggy property enumeration order in older V8 versions.

			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}

			return true;
		} catch (err) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}

	var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (getOwnPropertySymbols) {
				symbols = getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};

	/** @license React v17.0.2
	 * react-jsx-runtime.production.min.js
	 *
	 * Copyright (c) Facebook, Inc. and its affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */
	var f=React__default["default"],g=60103;reactJsxRuntime_production_min.Fragment=60107;if("function"===typeof Symbol&&Symbol.for){var h=Symbol.for;g=h("react.element");reactJsxRuntime_production_min.Fragment=h("react.fragment");}var m=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,n=Object.prototype.hasOwnProperty,p={key:!0,ref:!0,__self:!0,__source:!0};
	function q(c,a,k){var b,d={},e=null,l=null;void 0!==k&&(e=""+k);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(l=a.ref);for(b in a)n.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a)void 0===d[b]&&(d[b]=a[b]);return {$$typeof:g,type:c,key:e,ref:l,props:d,_owner:m.current}}reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;

	var reactJsxRuntime_development = {};

	(function (exports) {

	if (process.env.NODE_ENV !== "production") {
	  (function() {

	var React = React__default["default"];
	var _assign = objectAssign;

	// ATTENTION
	// When adding new symbols to this file,
	// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
	// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
	// nor polyfill, then a plain number is used for performance.
	var REACT_ELEMENT_TYPE = 0xeac7;
	var REACT_PORTAL_TYPE = 0xeaca;
	exports.Fragment = 0xeacb;
	var REACT_STRICT_MODE_TYPE = 0xeacc;
	var REACT_PROFILER_TYPE = 0xead2;
	var REACT_PROVIDER_TYPE = 0xeacd;
	var REACT_CONTEXT_TYPE = 0xeace;
	var REACT_FORWARD_REF_TYPE = 0xead0;
	var REACT_SUSPENSE_TYPE = 0xead1;
	var REACT_SUSPENSE_LIST_TYPE = 0xead8;
	var REACT_MEMO_TYPE = 0xead3;
	var REACT_LAZY_TYPE = 0xead4;
	var REACT_BLOCK_TYPE = 0xead9;
	var REACT_SERVER_BLOCK_TYPE = 0xeada;
	var REACT_FUNDAMENTAL_TYPE = 0xead5;
	var REACT_DEBUG_TRACING_MODE_TYPE = 0xeae1;
	var REACT_LEGACY_HIDDEN_TYPE = 0xeae3;

	if (typeof Symbol === 'function' && Symbol.for) {
	  var symbolFor = Symbol.for;
	  REACT_ELEMENT_TYPE = symbolFor('react.element');
	  REACT_PORTAL_TYPE = symbolFor('react.portal');
	  exports.Fragment = symbolFor('react.fragment');
	  REACT_STRICT_MODE_TYPE = symbolFor('react.strict_mode');
	  REACT_PROFILER_TYPE = symbolFor('react.profiler');
	  REACT_PROVIDER_TYPE = symbolFor('react.provider');
	  REACT_CONTEXT_TYPE = symbolFor('react.context');
	  REACT_FORWARD_REF_TYPE = symbolFor('react.forward_ref');
	  REACT_SUSPENSE_TYPE = symbolFor('react.suspense');
	  REACT_SUSPENSE_LIST_TYPE = symbolFor('react.suspense_list');
	  REACT_MEMO_TYPE = symbolFor('react.memo');
	  REACT_LAZY_TYPE = symbolFor('react.lazy');
	  REACT_BLOCK_TYPE = symbolFor('react.block');
	  REACT_SERVER_BLOCK_TYPE = symbolFor('react.server.block');
	  REACT_FUNDAMENTAL_TYPE = symbolFor('react.fundamental');
	  symbolFor('react.scope');
	  symbolFor('react.opaque.id');
	  REACT_DEBUG_TRACING_MODE_TYPE = symbolFor('react.debug_trace_mode');
	  symbolFor('react.offscreen');
	  REACT_LEGACY_HIDDEN_TYPE = symbolFor('react.legacy_hidden');
	}

	var MAYBE_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
	var FAUX_ITERATOR_SYMBOL = '@@iterator';
	function getIteratorFn(maybeIterable) {
	  if (maybeIterable === null || typeof maybeIterable !== 'object') {
	    return null;
	  }

	  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

	  if (typeof maybeIterator === 'function') {
	    return maybeIterator;
	  }

	  return null;
	}

	var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

	function error(format) {
	  {
	    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	      args[_key2 - 1] = arguments[_key2];
	    }

	    printWarning('error', format, args);
	  }
	}

	function printWarning(level, format, args) {
	  // When changing this logic, you might want to also
	  // update consoleWithStackDev.www.js as well.
	  {
	    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
	    var stack = ReactDebugCurrentFrame.getStackAddendum();

	    if (stack !== '') {
	      format += '%s';
	      args = args.concat([stack]);
	    }

	    var argsWithFormat = args.map(function (item) {
	      return '' + item;
	    }); // Careful: RN currently depends on this prefix

	    argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
	    // breaks IE9: https://github.com/facebook/react/issues/13610
	    // eslint-disable-next-line react-internal/no-production-logging

	    Function.prototype.apply.call(console[level], console, argsWithFormat);
	  }
	}

	// Filter certain DOM attributes (e.g. src, href) if their values are empty strings.

	var enableScopeAPI = false; // Experimental Create Event Handle API.

	function isValidElementType(type) {
	  if (typeof type === 'string' || typeof type === 'function') {
	    return true;
	  } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


	  if (type === exports.Fragment || type === REACT_PROFILER_TYPE || type === REACT_DEBUG_TRACING_MODE_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || type === REACT_LEGACY_HIDDEN_TYPE || enableScopeAPI ) {
	    return true;
	  }

	  if (typeof type === 'object' && type !== null) {
	    if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_BLOCK_TYPE || type[0] === REACT_SERVER_BLOCK_TYPE) {
	      return true;
	    }
	  }

	  return false;
	}

	function getWrappedName(outerType, innerType, wrapperName) {
	  var functionName = innerType.displayName || innerType.name || '';
	  return outerType.displayName || (functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName);
	}

	function getContextName(type) {
	  return type.displayName || 'Context';
	}

	function getComponentName(type) {
	  if (type == null) {
	    // Host root, text node or just invalid type.
	    return null;
	  }

	  {
	    if (typeof type.tag === 'number') {
	      error('Received an unexpected object in getComponentName(). ' + 'This is likely a bug in React. Please file an issue.');
	    }
	  }

	  if (typeof type === 'function') {
	    return type.displayName || type.name || null;
	  }

	  if (typeof type === 'string') {
	    return type;
	  }

	  switch (type) {
	    case exports.Fragment:
	      return 'Fragment';

	    case REACT_PORTAL_TYPE:
	      return 'Portal';

	    case REACT_PROFILER_TYPE:
	      return 'Profiler';

	    case REACT_STRICT_MODE_TYPE:
	      return 'StrictMode';

	    case REACT_SUSPENSE_TYPE:
	      return 'Suspense';

	    case REACT_SUSPENSE_LIST_TYPE:
	      return 'SuspenseList';
	  }

	  if (typeof type === 'object') {
	    switch (type.$$typeof) {
	      case REACT_CONTEXT_TYPE:
	        var context = type;
	        return getContextName(context) + '.Consumer';

	      case REACT_PROVIDER_TYPE:
	        var provider = type;
	        return getContextName(provider._context) + '.Provider';

	      case REACT_FORWARD_REF_TYPE:
	        return getWrappedName(type, type.render, 'ForwardRef');

	      case REACT_MEMO_TYPE:
	        return getComponentName(type.type);

	      case REACT_BLOCK_TYPE:
	        return getComponentName(type._render);

	      case REACT_LAZY_TYPE:
	        {
	          var lazyComponent = type;
	          var payload = lazyComponent._payload;
	          var init = lazyComponent._init;

	          try {
	            return getComponentName(init(payload));
	          } catch (x) {
	            return null;
	          }
	        }
	    }
	  }

	  return null;
	}

	// Helpers to patch console.logs to avoid logging during side-effect free
	// replaying on render function. This currently only patches the object
	// lazily which won't cover if the log function was extracted eagerly.
	// We could also eagerly patch the method.
	var disabledDepth = 0;
	var prevLog;
	var prevInfo;
	var prevWarn;
	var prevError;
	var prevGroup;
	var prevGroupCollapsed;
	var prevGroupEnd;

	function disabledLog() {}

	disabledLog.__reactDisabledLog = true;
	function disableLogs() {
	  {
	    if (disabledDepth === 0) {
	      /* eslint-disable react-internal/no-production-logging */
	      prevLog = console.log;
	      prevInfo = console.info;
	      prevWarn = console.warn;
	      prevError = console.error;
	      prevGroup = console.group;
	      prevGroupCollapsed = console.groupCollapsed;
	      prevGroupEnd = console.groupEnd; // https://github.com/facebook/react/issues/19099

	      var props = {
	        configurable: true,
	        enumerable: true,
	        value: disabledLog,
	        writable: true
	      }; // $FlowFixMe Flow thinks console is immutable.

	      Object.defineProperties(console, {
	        info: props,
	        log: props,
	        warn: props,
	        error: props,
	        group: props,
	        groupCollapsed: props,
	        groupEnd: props
	      });
	      /* eslint-enable react-internal/no-production-logging */
	    }

	    disabledDepth++;
	  }
	}
	function reenableLogs() {
	  {
	    disabledDepth--;

	    if (disabledDepth === 0) {
	      /* eslint-disable react-internal/no-production-logging */
	      var props = {
	        configurable: true,
	        enumerable: true,
	        writable: true
	      }; // $FlowFixMe Flow thinks console is immutable.

	      Object.defineProperties(console, {
	        log: _assign({}, props, {
	          value: prevLog
	        }),
	        info: _assign({}, props, {
	          value: prevInfo
	        }),
	        warn: _assign({}, props, {
	          value: prevWarn
	        }),
	        error: _assign({}, props, {
	          value: prevError
	        }),
	        group: _assign({}, props, {
	          value: prevGroup
	        }),
	        groupCollapsed: _assign({}, props, {
	          value: prevGroupCollapsed
	        }),
	        groupEnd: _assign({}, props, {
	          value: prevGroupEnd
	        })
	      });
	      /* eslint-enable react-internal/no-production-logging */
	    }

	    if (disabledDepth < 0) {
	      error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
	    }
	  }
	}

	var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
	var prefix;
	function describeBuiltInComponentFrame(name, source, ownerFn) {
	  {
	    if (prefix === undefined) {
	      // Extract the VM specific prefix used by each line.
	      try {
	        throw Error();
	      } catch (x) {
	        var match = x.stack.trim().match(/\n( *(at )?)/);
	        prefix = match && match[1] || '';
	      }
	    } // We use the prefix to ensure our stacks line up with native stack frames.


	    return '\n' + prefix + name;
	  }
	}
	var reentry = false;
	var componentFrameCache;

	{
	  var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
	  componentFrameCache = new PossiblyWeakMap();
	}

	function describeNativeComponentFrame(fn, construct) {
	  // If something asked for a stack inside a fake render, it should get ignored.
	  if (!fn || reentry) {
	    return '';
	  }

	  {
	    var frame = componentFrameCache.get(fn);

	    if (frame !== undefined) {
	      return frame;
	    }
	  }

	  var control;
	  reentry = true;
	  var previousPrepareStackTrace = Error.prepareStackTrace; // $FlowFixMe It does accept undefined.

	  Error.prepareStackTrace = undefined;
	  var previousDispatcher;

	  {
	    previousDispatcher = ReactCurrentDispatcher.current; // Set the dispatcher in DEV because this might be call in the render function
	    // for warnings.

	    ReactCurrentDispatcher.current = null;
	    disableLogs();
	  }

	  try {
	    // This should throw.
	    if (construct) {
	      // Something should be setting the props in the constructor.
	      var Fake = function () {
	        throw Error();
	      }; // $FlowFixMe


	      Object.defineProperty(Fake.prototype, 'props', {
	        set: function () {
	          // We use a throwing setter instead of frozen or non-writable props
	          // because that won't throw in a non-strict mode function.
	          throw Error();
	        }
	      });

	      if (typeof Reflect === 'object' && Reflect.construct) {
	        // We construct a different control for this case to include any extra
	        // frames added by the construct call.
	        try {
	          Reflect.construct(Fake, []);
	        } catch (x) {
	          control = x;
	        }

	        Reflect.construct(fn, [], Fake);
	      } else {
	        try {
	          Fake.call();
	        } catch (x) {
	          control = x;
	        }

	        fn.call(Fake.prototype);
	      }
	    } else {
	      try {
	        throw Error();
	      } catch (x) {
	        control = x;
	      }

	      fn();
	    }
	  } catch (sample) {
	    // This is inlined manually because closure doesn't do it for us.
	    if (sample && control && typeof sample.stack === 'string') {
	      // This extracts the first frame from the sample that isn't also in the control.
	      // Skipping one frame that we assume is the frame that calls the two.
	      var sampleLines = sample.stack.split('\n');
	      var controlLines = control.stack.split('\n');
	      var s = sampleLines.length - 1;
	      var c = controlLines.length - 1;

	      while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
	        // We expect at least one stack frame to be shared.
	        // Typically this will be the root most one. However, stack frames may be
	        // cut off due to maximum stack limits. In this case, one maybe cut off
	        // earlier than the other. We assume that the sample is longer or the same
	        // and there for cut off earlier. So we should find the root most frame in
	        // the sample somewhere in the control.
	        c--;
	      }

	      for (; s >= 1 && c >= 0; s--, c--) {
	        // Next we find the first one that isn't the same which should be the
	        // frame that called our sample function and the control.
	        if (sampleLines[s] !== controlLines[c]) {
	          // In V8, the first line is describing the message but other VMs don't.
	          // If we're about to return the first line, and the control is also on the same
	          // line, that's a pretty good indicator that our sample threw at same line as
	          // the control. I.e. before we entered the sample frame. So we ignore this result.
	          // This can happen if you passed a class to function component, or non-function.
	          if (s !== 1 || c !== 1) {
	            do {
	              s--;
	              c--; // We may still have similar intermediate frames from the construct call.
	              // The next one that isn't the same should be our match though.

	              if (c < 0 || sampleLines[s] !== controlLines[c]) {
	                // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
	                var _frame = '\n' + sampleLines[s].replace(' at new ', ' at ');

	                {
	                  if (typeof fn === 'function') {
	                    componentFrameCache.set(fn, _frame);
	                  }
	                } // Return the line we found.


	                return _frame;
	              }
	            } while (s >= 1 && c >= 0);
	          }

	          break;
	        }
	      }
	    }
	  } finally {
	    reentry = false;

	    {
	      ReactCurrentDispatcher.current = previousDispatcher;
	      reenableLogs();
	    }

	    Error.prepareStackTrace = previousPrepareStackTrace;
	  } // Fallback to just using the name if we couldn't make it throw.


	  var name = fn ? fn.displayName || fn.name : '';
	  var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';

	  {
	    if (typeof fn === 'function') {
	      componentFrameCache.set(fn, syntheticFrame);
	    }
	  }

	  return syntheticFrame;
	}
	function describeFunctionComponentFrame(fn, source, ownerFn) {
	  {
	    return describeNativeComponentFrame(fn, false);
	  }
	}

	function shouldConstruct(Component) {
	  var prototype = Component.prototype;
	  return !!(prototype && prototype.isReactComponent);
	}

	function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {

	  if (type == null) {
	    return '';
	  }

	  if (typeof type === 'function') {
	    {
	      return describeNativeComponentFrame(type, shouldConstruct(type));
	    }
	  }

	  if (typeof type === 'string') {
	    return describeBuiltInComponentFrame(type);
	  }

	  switch (type) {
	    case REACT_SUSPENSE_TYPE:
	      return describeBuiltInComponentFrame('Suspense');

	    case REACT_SUSPENSE_LIST_TYPE:
	      return describeBuiltInComponentFrame('SuspenseList');
	  }

	  if (typeof type === 'object') {
	    switch (type.$$typeof) {
	      case REACT_FORWARD_REF_TYPE:
	        return describeFunctionComponentFrame(type.render);

	      case REACT_MEMO_TYPE:
	        // Memo may contain any component type so we recursively resolve it.
	        return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);

	      case REACT_BLOCK_TYPE:
	        return describeFunctionComponentFrame(type._render);

	      case REACT_LAZY_TYPE:
	        {
	          var lazyComponent = type;
	          var payload = lazyComponent._payload;
	          var init = lazyComponent._init;

	          try {
	            // Lazy may contain any component type so we recursively resolve it.
	            return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
	          } catch (x) {}
	        }
	    }
	  }

	  return '';
	}

	var loggedTypeFailures = {};
	var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;

	function setCurrentlyValidatingElement(element) {
	  {
	    if (element) {
	      var owner = element._owner;
	      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
	      ReactDebugCurrentFrame.setExtraStackFrame(stack);
	    } else {
	      ReactDebugCurrentFrame.setExtraStackFrame(null);
	    }
	  }
	}

	function checkPropTypes(typeSpecs, values, location, componentName, element) {
	  {
	    // $FlowFixMe This is okay but Flow doesn't know it.
	    var has = Function.call.bind(Object.prototype.hasOwnProperty);

	    for (var typeSpecName in typeSpecs) {
	      if (has(typeSpecs, typeSpecName)) {
	        var error$1 = void 0; // Prop type validation may throw. In case they do, we don't want to
	        // fail the render phase where it didn't fail before. So we log it.
	        // After these have been cleaned up, we'll let them throw.

	        try {
	          // This is intentionally an invariant that gets caught. It's the same
	          // behavior as without this statement except with a better message.
	          if (typeof typeSpecs[typeSpecName] !== 'function') {
	            var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
	            err.name = 'Invariant Violation';
	            throw err;
	          }

	          error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
	        } catch (ex) {
	          error$1 = ex;
	        }

	        if (error$1 && !(error$1 instanceof Error)) {
	          setCurrentlyValidatingElement(element);

	          error('%s: type specification of %s' + ' `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error$1);

	          setCurrentlyValidatingElement(null);
	        }

	        if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
	          // Only monitor this failure once because there tends to be a lot of the
	          // same error.
	          loggedTypeFailures[error$1.message] = true;
	          setCurrentlyValidatingElement(element);

	          error('Failed %s type: %s', location, error$1.message);

	          setCurrentlyValidatingElement(null);
	        }
	      }
	    }
	  }
	}

	var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var RESERVED_PROPS = {
	  key: true,
	  ref: true,
	  __self: true,
	  __source: true
	};
	var specialPropKeyWarningShown;
	var specialPropRefWarningShown;
	var didWarnAboutStringRefs;

	{
	  didWarnAboutStringRefs = {};
	}

	function hasValidRef(config) {
	  {
	    if (hasOwnProperty.call(config, 'ref')) {
	      var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;

	      if (getter && getter.isReactWarning) {
	        return false;
	      }
	    }
	  }

	  return config.ref !== undefined;
	}

	function hasValidKey(config) {
	  {
	    if (hasOwnProperty.call(config, 'key')) {
	      var getter = Object.getOwnPropertyDescriptor(config, 'key').get;

	      if (getter && getter.isReactWarning) {
	        return false;
	      }
	    }
	  }

	  return config.key !== undefined;
	}

	function warnIfStringRefCannotBeAutoConverted(config, self) {
	  {
	    if (typeof config.ref === 'string' && ReactCurrentOwner.current && self && ReactCurrentOwner.current.stateNode !== self) {
	      var componentName = getComponentName(ReactCurrentOwner.current.type);

	      if (!didWarnAboutStringRefs[componentName]) {
	        error('Component "%s" contains the string ref "%s". ' + 'Support for string refs will be removed in a future major release. ' + 'This case cannot be automatically converted to an arrow function. ' + 'We ask you to manually fix this case by using useRef() or createRef() instead. ' + 'Learn more about using refs safely here: ' + 'https://reactjs.org/link/strict-mode-string-ref', getComponentName(ReactCurrentOwner.current.type), config.ref);

	        didWarnAboutStringRefs[componentName] = true;
	      }
	    }
	  }
	}

	function defineKeyPropWarningGetter(props, displayName) {
	  {
	    var warnAboutAccessingKey = function () {
	      if (!specialPropKeyWarningShown) {
	        specialPropKeyWarningShown = true;

	        error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
	      }
	    };

	    warnAboutAccessingKey.isReactWarning = true;
	    Object.defineProperty(props, 'key', {
	      get: warnAboutAccessingKey,
	      configurable: true
	    });
	  }
	}

	function defineRefPropWarningGetter(props, displayName) {
	  {
	    var warnAboutAccessingRef = function () {
	      if (!specialPropRefWarningShown) {
	        specialPropRefWarningShown = true;

	        error('%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
	      }
	    };

	    warnAboutAccessingRef.isReactWarning = true;
	    Object.defineProperty(props, 'ref', {
	      get: warnAboutAccessingRef,
	      configurable: true
	    });
	  }
	}
	/**
	 * Factory method to create a new React element. This no longer adheres to
	 * the class pattern, so do not use new to call it. Also, instanceof check
	 * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
	 * if something is a React Element.
	 *
	 * @param {*} type
	 * @param {*} props
	 * @param {*} key
	 * @param {string|object} ref
	 * @param {*} owner
	 * @param {*} self A *temporary* helper to detect places where `this` is
	 * different from the `owner` when React.createElement is called, so that we
	 * can warn. We want to get rid of owner and replace string `ref`s with arrow
	 * functions, and as long as `this` and owner are the same, there will be no
	 * change in behavior.
	 * @param {*} source An annotation object (added by a transpiler or otherwise)
	 * indicating filename, line number, and/or other information.
	 * @internal
	 */


	var ReactElement = function (type, key, ref, self, source, owner, props) {
	  var element = {
	    // This tag allows us to uniquely identify this as a React Element
	    $$typeof: REACT_ELEMENT_TYPE,
	    // Built-in properties that belong on the element
	    type: type,
	    key: key,
	    ref: ref,
	    props: props,
	    // Record the component responsible for creating this element.
	    _owner: owner
	  };

	  {
	    // The validation flag is currently mutative. We put it on
	    // an external backing store so that we can freeze the whole object.
	    // This can be replaced with a WeakMap once they are implemented in
	    // commonly used development environments.
	    element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
	    // the validation flag non-enumerable (where possible, which should
	    // include every environment we run tests in), so the test framework
	    // ignores it.

	    Object.defineProperty(element._store, 'validated', {
	      configurable: false,
	      enumerable: false,
	      writable: true,
	      value: false
	    }); // self and source are DEV only properties.

	    Object.defineProperty(element, '_self', {
	      configurable: false,
	      enumerable: false,
	      writable: false,
	      value: self
	    }); // Two elements created in two different places should be considered
	    // equal for testing purposes and therefore we hide it from enumeration.

	    Object.defineProperty(element, '_source', {
	      configurable: false,
	      enumerable: false,
	      writable: false,
	      value: source
	    });

	    if (Object.freeze) {
	      Object.freeze(element.props);
	      Object.freeze(element);
	    }
	  }

	  return element;
	};
	/**
	 * https://github.com/reactjs/rfcs/pull/107
	 * @param {*} type
	 * @param {object} props
	 * @param {string} key
	 */

	function jsxDEV(type, config, maybeKey, source, self) {
	  {
	    var propName; // Reserved names are extracted

	    var props = {};
	    var key = null;
	    var ref = null; // Currently, key can be spread in as a prop. This causes a potential
	    // issue if key is also explicitly declared (ie. <div {...props} key="Hi" />
	    // or <div key="Hi" {...props} /> ). We want to deprecate key spread,
	    // but as an intermediary step, we will use jsxDEV for everything except
	    // <div {...props} key="Hi" />, because we aren't currently able to tell if
	    // key is explicitly declared to be undefined or not.

	    if (maybeKey !== undefined) {
	      key = '' + maybeKey;
	    }

	    if (hasValidKey(config)) {
	      key = '' + config.key;
	    }

	    if (hasValidRef(config)) {
	      ref = config.ref;
	      warnIfStringRefCannotBeAutoConverted(config, self);
	    } // Remaining properties are added to a new props object


	    for (propName in config) {
	      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
	        props[propName] = config[propName];
	      }
	    } // Resolve default props


	    if (type && type.defaultProps) {
	      var defaultProps = type.defaultProps;

	      for (propName in defaultProps) {
	        if (props[propName] === undefined) {
	          props[propName] = defaultProps[propName];
	        }
	      }
	    }

	    if (key || ref) {
	      var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;

	      if (key) {
	        defineKeyPropWarningGetter(props, displayName);
	      }

	      if (ref) {
	        defineRefPropWarningGetter(props, displayName);
	      }
	    }

	    return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
	  }
	}

	var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
	var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;

	function setCurrentlyValidatingElement$1(element) {
	  {
	    if (element) {
	      var owner = element._owner;
	      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
	      ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
	    } else {
	      ReactDebugCurrentFrame$1.setExtraStackFrame(null);
	    }
	  }
	}

	var propTypesMisspellWarningShown;

	{
	  propTypesMisspellWarningShown = false;
	}
	/**
	 * Verifies the object is a ReactElement.
	 * See https://reactjs.org/docs/react-api.html#isvalidelement
	 * @param {?object} object
	 * @return {boolean} True if `object` is a ReactElement.
	 * @final
	 */

	function isValidElement(object) {
	  {
	    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
	  }
	}

	function getDeclarationErrorAddendum() {
	  {
	    if (ReactCurrentOwner$1.current) {
	      var name = getComponentName(ReactCurrentOwner$1.current.type);

	      if (name) {
	        return '\n\nCheck the render method of `' + name + '`.';
	      }
	    }

	    return '';
	  }
	}

	function getSourceInfoErrorAddendum(source) {
	  {
	    if (source !== undefined) {
	      var fileName = source.fileName.replace(/^.*[\\\/]/, '');
	      var lineNumber = source.lineNumber;
	      return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
	    }

	    return '';
	  }
	}
	/**
	 * Warn if there's no key explicitly set on dynamic arrays of children or
	 * object keys are not valid. This allows us to keep track of children between
	 * updates.
	 */


	var ownerHasKeyUseWarning = {};

	function getCurrentComponentErrorInfo(parentType) {
	  {
	    var info = getDeclarationErrorAddendum();

	    if (!info) {
	      var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;

	      if (parentName) {
	        info = "\n\nCheck the top-level render call using <" + parentName + ">.";
	      }
	    }

	    return info;
	  }
	}
	/**
	 * Warn if the element doesn't have an explicit key assigned to it.
	 * This element is in an array. The array could grow and shrink or be
	 * reordered. All children that haven't already been validated are required to
	 * have a "key" property assigned to it. Error statuses are cached so a warning
	 * will only be shown once.
	 *
	 * @internal
	 * @param {ReactElement} element Element that requires a key.
	 * @param {*} parentType element's parent's type.
	 */


	function validateExplicitKey(element, parentType) {
	  {
	    if (!element._store || element._store.validated || element.key != null) {
	      return;
	    }

	    element._store.validated = true;
	    var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);

	    if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
	      return;
	    }

	    ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
	    // property, it may be the creator of the child that's responsible for
	    // assigning it a key.

	    var childOwner = '';

	    if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
	      // Give the component that originally created this child.
	      childOwner = " It was passed a child from " + getComponentName(element._owner.type) + ".";
	    }

	    setCurrentlyValidatingElement$1(element);

	    error('Each child in a list should have a unique "key" prop.' + '%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);

	    setCurrentlyValidatingElement$1(null);
	  }
	}
	/**
	 * Ensure that every element either is passed in a static location, in an
	 * array with an explicit keys property defined, or in an object literal
	 * with valid key property.
	 *
	 * @internal
	 * @param {ReactNode} node Statically passed child of any type.
	 * @param {*} parentType node's parent's type.
	 */


	function validateChildKeys(node, parentType) {
	  {
	    if (typeof node !== 'object') {
	      return;
	    }

	    if (Array.isArray(node)) {
	      for (var i = 0; i < node.length; i++) {
	        var child = node[i];

	        if (isValidElement(child)) {
	          validateExplicitKey(child, parentType);
	        }
	      }
	    } else if (isValidElement(node)) {
	      // This element was passed in a valid location.
	      if (node._store) {
	        node._store.validated = true;
	      }
	    } else if (node) {
	      var iteratorFn = getIteratorFn(node);

	      if (typeof iteratorFn === 'function') {
	        // Entry iterators used to provide implicit keys,
	        // but now we print a separate warning for them later.
	        if (iteratorFn !== node.entries) {
	          var iterator = iteratorFn.call(node);
	          var step;

	          while (!(step = iterator.next()).done) {
	            if (isValidElement(step.value)) {
	              validateExplicitKey(step.value, parentType);
	            }
	          }
	        }
	      }
	    }
	  }
	}
	/**
	 * Given an element, validate that its props follow the propTypes definition,
	 * provided by the type.
	 *
	 * @param {ReactElement} element
	 */


	function validatePropTypes(element) {
	  {
	    var type = element.type;

	    if (type === null || type === undefined || typeof type === 'string') {
	      return;
	    }

	    var propTypes;

	    if (typeof type === 'function') {
	      propTypes = type.propTypes;
	    } else if (typeof type === 'object' && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
	    // Inner props are checked in the reconciler.
	    type.$$typeof === REACT_MEMO_TYPE)) {
	      propTypes = type.propTypes;
	    } else {
	      return;
	    }

	    if (propTypes) {
	      // Intentionally inside to avoid triggering lazy initializers:
	      var name = getComponentName(type);
	      checkPropTypes(propTypes, element.props, 'prop', name, element);
	    } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
	      propTypesMisspellWarningShown = true; // Intentionally inside to avoid triggering lazy initializers:

	      var _name = getComponentName(type);

	      error('Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', _name || 'Unknown');
	    }

	    if (typeof type.getDefaultProps === 'function' && !type.getDefaultProps.isReactClassApproved) {
	      error('getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
	    }
	  }
	}
	/**
	 * Given a fragment, validate that it can only be provided with fragment props
	 * @param {ReactElement} fragment
	 */


	function validateFragmentProps(fragment) {
	  {
	    var keys = Object.keys(fragment.props);

	    for (var i = 0; i < keys.length; i++) {
	      var key = keys[i];

	      if (key !== 'children' && key !== 'key') {
	        setCurrentlyValidatingElement$1(fragment);

	        error('Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.', key);

	        setCurrentlyValidatingElement$1(null);
	        break;
	      }
	    }

	    if (fragment.ref !== null) {
	      setCurrentlyValidatingElement$1(fragment);

	      error('Invalid attribute `ref` supplied to `React.Fragment`.');

	      setCurrentlyValidatingElement$1(null);
	    }
	  }
	}

	function jsxWithValidation(type, props, key, isStaticChildren, source, self) {
	  {
	    var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
	    // succeed and there will likely be errors in render.

	    if (!validType) {
	      var info = '';

	      if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
	        info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
	      }

	      var sourceInfo = getSourceInfoErrorAddendum(source);

	      if (sourceInfo) {
	        info += sourceInfo;
	      } else {
	        info += getDeclarationErrorAddendum();
	      }

	      var typeString;

	      if (type === null) {
	        typeString = 'null';
	      } else if (Array.isArray(type)) {
	        typeString = 'array';
	      } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
	        typeString = "<" + (getComponentName(type.type) || 'Unknown') + " />";
	        info = ' Did you accidentally export a JSX literal instead of a component?';
	      } else {
	        typeString = typeof type;
	      }

	      error('React.jsx: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
	    }

	    var element = jsxDEV(type, props, key, source, self); // The result can be nullish if a mock or a custom function is used.
	    // TODO: Drop this when these are no longer allowed as the type argument.

	    if (element == null) {
	      return element;
	    } // Skip key warning if the type isn't valid since our key validation logic
	    // doesn't expect a non-string/function type and can throw confusing errors.
	    // We don't want exception behavior to differ between dev and prod.
	    // (Rendering will throw with a helpful message and as soon as the type is
	    // fixed, the key warnings will appear.)


	    if (validType) {
	      var children = props.children;

	      if (children !== undefined) {
	        if (isStaticChildren) {
	          if (Array.isArray(children)) {
	            for (var i = 0; i < children.length; i++) {
	              validateChildKeys(children[i], type);
	            }

	            if (Object.freeze) {
	              Object.freeze(children);
	            }
	          } else {
	            error('React.jsx: Static children should always be an array. ' + 'You are likely explicitly calling React.jsxs or React.jsxDEV. ' + 'Use the Babel transform instead.');
	          }
	        } else {
	          validateChildKeys(children, type);
	        }
	      }
	    }

	    if (type === exports.Fragment) {
	      validateFragmentProps(element);
	    } else {
	      validatePropTypes(element);
	    }

	    return element;
	  }
	} // These two functions exist to still get child warnings in dev
	// even with the prod transform. This means that jsxDEV is purely
	// opt-in behavior for better messages but that we won't stop
	// giving you warnings if you use production apis.

	function jsxWithValidationStatic(type, props, key) {
	  {
	    return jsxWithValidation(type, props, key, true);
	  }
	}
	function jsxWithValidationDynamic(type, props, key) {
	  {
	    return jsxWithValidation(type, props, key, false);
	  }
	}

	var jsx =  jsxWithValidationDynamic ; // we may want to special case jsxs internally to take advantage of static children.
	// for now we can ship identical prod functions

	var jsxs =  jsxWithValidationStatic ;

	exports.jsx = jsx;
	exports.jsxs = jsxs;
	  })();
	}
	}(reactJsxRuntime_development));

	if (process.env.NODE_ENV === 'production') {
	  jsxRuntime.exports = reactJsxRuntime_production_min;
	} else {
	  jsxRuntime.exports = reactJsxRuntime_development;
	}

	var _interopRequireDefault$1 = interopRequireDefault.exports;
	Object.defineProperty(Email, "__esModule", {
	  value: true
	});
	var default_1$1 = Email.default = void 0;
	var _createSvgIcon$1 = _interopRequireDefault$1(createSvgIcon);
	var _jsxRuntime$1 = jsxRuntime.exports;
	var _default$1 = (0, _createSvgIcon$1.default)( /*#__PURE__*/(0, _jsxRuntime$1.jsx)("path", {
	  d: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"
	}), 'Email');
	default_1$1 = Email.default = _default$1;

	var OpenInNew = {};

	var _interopRequireDefault = interopRequireDefault.exports;
	Object.defineProperty(OpenInNew, "__esModule", {
	  value: true
	});
	var default_1 = OpenInNew.default = void 0;
	var _createSvgIcon = _interopRequireDefault(createSvgIcon);
	var _jsxRuntime = jsxRuntime.exports;
	var _default = (0, _createSvgIcon.default)( /*#__PURE__*/(0, _jsxRuntime.jsx)("path", {
	  d: "M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"
	}), 'OpenInNew');
	default_1 = OpenInNew.default = _default;

	function HubDetails(props) {
	    const [hubFile, setHubFile] = React.useState();
	    const [error, setError] = React.useState();
	    const { hub } = props;
	    const { url: hubUrl, longLabel, shortLabel } = hub;
	    React.useEffect(() => {
	        (async () => {
	            try {
	                const hubHandle = io.openLocation({
	                    uri: hubUrl,
	                    locationType: 'UriLocation',
	                });
	                const hubTxt = await hubHandle.readFile('utf8');
	                const newHubFile = new HubFile(hubTxt);
	                setHubFile(newHubFile);
	            }
	            catch (error) {
	                console.error(error);
	                setError(error);
	            }
	        })();
	    }, [hubUrl]);
	    if (error) {
	        return (React__default["default"].createElement(material.Card, null,
	            React__default["default"].createElement(material.CardContent, null,
	                React__default["default"].createElement(material.Typography, { color: "error" }, `${error}`))));
	    }
	    if (hubFile) {
	        return (React__default["default"].createElement(material.Card, null,
	            React__default["default"].createElement(material.CardHeader, { title: shortLabel }),
	            React__default["default"].createElement(material.CardContent, null,
	                React__default["default"].createElement(ui.SanitizedHTML, { html: longLabel })),
	            React__default["default"].createElement(material.CardActions, null,
	                React__default["default"].createElement(material.IconButton, { href: `mailto:${hubFile.get('email')}`, rel: "noopener noreferrer", target: "_blank", color: "secondary" },
	                    React__default["default"].createElement(default_1$1, null)),
	                hubFile.get('descriptionUrl') ? (React__default["default"].createElement(material.IconButton, { href: new URL(hubFile.get('descriptionUrl') || '', new URL(hubUrl))
	                        .href, rel: "noopener noreferrer", target: "_blank" },
	                    React__default["default"].createElement(default_1, { color: "secondary" }))) : null)));
	    }
	    return React__default["default"].createElement(material.LinearProgress, { variant: "query" });
	}

	const useStyles$1 = mui.makeStyles()(theme => ({
	    formControl: {
	        minWidth: 192,
	        marginLeft: theme.spacing(2),
	        marginRight: theme.spacing(2),
	    },
	}));
	function SelectBox({ selectList, selectedItem, handleSelect, label, helpText, }) {
	    const { classes } = useStyles$1();
	    return (React__default["default"].createElement(material.FormControl, { className: classes.formControl },
	        React__default["default"].createElement(material.InputLabel, null, label),
	        React__default["default"].createElement(material.Select, { value: selectedItem, onChange: handleSelect, label: helpText }, selectList.map(item => {
	            let value;
	            let description;
	            if (item.name) {
	                value = item.name;
	                description = `${item.name} (${item.synonyms.join(' ')})`;
	            }
	            return (React__default["default"].createElement(material.MenuItem, { key: description || item, value: value || item }, description || item));
	        })),
	        React__default["default"].createElement(material.FormHelperText, null, helpText)));
	}

	function QueryStatus({ status }) {
	    return (React__default["default"].createElement(React__default["default"].Fragment, null,
	        React__default["default"].createElement(material.LinearProgress, { variant: "query" }),
	        React__default["default"].createElement(material.Typography, null, status)));
	}
	// Need this for FormControlLabel to work with Tooltip
	// https://github.com/mui-org/material-ui/issues/2225#issuecomment-460041878
	function Wire({ children, ...props }) {
	    return children(props);
	}
	const useStyles = mui.makeStyles()(theme => ({
	    hubList: {
	        maxHeight: 400,
	        overflowY: 'auto',
	    },
	    genomeSelector: {
	        marginTop: theme.spacing(1),
	    },
	}));
	function TrackHubRegistrySelect({ model }) {
	    const [error, setError] = React.useState();
	    const [assemblies, setAssemblies] = React.useState();
	    const [selectedSpecies, setSelectedSpecies] = React.useState('');
	    const [selectedTrackhubAssembly, setSelectedTrackhubAssembly] = React.useState('');
	    const [hubs, setHubs] = React.useState(new Map());
	    const [allHubsRetrieved, setAllHubsRetrieved] = React.useState(false);
	    const [selectedHub, setSelectedHub] = React.useState('');
	    const { classes } = useStyles();
	    React.useEffect(() => {
	        const controller = new AbortController();
	        const { signal } = controller;
	        (async () => {
	            try {
	                const pingResponse = await mfetch('https://www.trackhubregistry.org/api/info/ping', { signal });
	                if (pingResponse.ping !== 1) {
	                    setError('Registry is not available');
	                    return;
	                }
	                const assembliesResponse = await mfetch('https://www.trackhubregistry.org/api/info/assemblies', { signal });
	                setAssemblies(assembliesResponse);
	            }
	            catch (e) {
	                if (!util.isAbortException(e)) {
	                    console.error(e);
	                    setError(e);
	                }
	            }
	        })();
	        return () => {
	            controller.abort();
	        };
	    }, []);
	    React.useEffect(() => {
	        const controller = new AbortController();
	        const { signal } = controller;
	        async function getHubs(reset) {
	            const entriesPerPage = 10;
	            const newHubs = reset ? new Map() : new Map(hubs);
	            const page = Math.floor(hubs.size / entriesPerPage) + 1;
	            const response = await post_with_params('https://www.trackhubregistry.org/api/search', { page, entries_per_page: entriesPerPage }, {
	                headers: { 'Content-Type': 'application/json' },
	                body: JSON.stringify({ assembly: selectedTrackhubAssembly }),
	                signal,
	            });
	            if (response) {
	                for (const item of response.items) {
	                    if (item.hub.url.startsWith('ftp://')) {
	                        item.error = 'JBrowse cannot add connections from FTP sources';
	                    }
	                    else {
	                        const hub = io.openLocation({
	                            uri: item.hub.url,
	                            locationType: 'UriLocation',
	                        });
	                        try {
	                            await hub.stat();
	                        }
	                        catch (error) {
	                            item.error = `${error}`;
	                        }
	                    }
	                    // currently an int, but stringify it
	                    newHubs.set(`${item.trackdb_id}`, item);
	                }
	                setHubs(newHubs);
	                if (newHubs.size === response.total_entries) {
	                    setAllHubsRetrieved(true);
	                }
	            }
	        }
	        (async () => {
	            try {
	                if (!error) {
	                    if (selectedTrackhubAssembly && !hubs.size) {
	                        await getHubs(true);
	                    }
	                    else if (hubs.size && !allHubsRetrieved) {
	                        await getHubs();
	                    }
	                }
	            }
	            catch (e) {
	                if (!util.isAbortException(e)) {
	                    console.error(e);
	                    setError(e);
	                }
	            }
	        })();
	        return () => {
	            controller.abort();
	        };
	    }, [selectedTrackhubAssembly, error, hubs, allHubsRetrieved]);
	    const renderItems = [
	        React__default["default"].createElement(material.Typography, { key: "heading", variant: "h6" }, "The Track Hub Registry"),
	    ];
	    if (error) {
	        renderItems.push(React__default["default"].createElement(material.Typography, { key: "error", color: "error" }, `${error}`));
	        return React__default["default"].createElement("div", null, renderItems);
	    }
	    if (!assemblies) {
	        renderItems.push(React__default["default"].createElement(QueryStatus, { key: "queryStatus", status: "Connecting to registry..." }));
	        return React__default["default"].createElement("div", null, renderItems);
	    }
	    const speciesList = Object.keys(assemblies).sort();
	    renderItems.push(React__default["default"].createElement(SelectBox, { key: "speciesSelect", selectList: speciesList, selectedItem: selectedSpecies, handleSelect: event => {
	            setSelectedSpecies(event.target.value);
	            setSelectedTrackhubAssembly('');
	            setHubs(new Map());
	            setSelectedHub('');
	            setAllHubsRetrieved(false);
	        }, label: "Species", helpText: "Select a species" }));
	    if (selectedSpecies) {
	        // trackhubregistry has this nonsense hg19 with alias hg38 entry, filter it out
	        const ret = assemblies[selectedSpecies].filter(s => !(s.name === 'GRCh37' && s.synonyms[0] === 'hg38'));
	        renderItems.push(React__default["default"].createElement(SelectBox, { key: "assemblySelect", selectList: ret, selectedItem: selectedTrackhubAssembly, handleSelect: event => {
	                setSelectedTrackhubAssembly(event.target.value);
	                setHubs(new Map());
	                setSelectedHub('');
	                setAllHubsRetrieved(false);
	            }, label: "Assembly", helpText: "Select an assembly" }));
	    }
	    if (selectedTrackhubAssembly) {
	        renderItems.push(React__default["default"].createElement("div", { key: "hubSelect" },
	            React__default["default"].createElement(material.Typography, null, "Select an assembly from our local tracklist if it doesn't match the assembly name on the remote trackhub"),
	            React__default["default"].createElement("br", null),
	            React__default["default"].createElement(material.FormControl, null,
	                React__default["default"].createElement(material.FormLabel, null, "Hubs:"),
	                React__default["default"].createElement("div", { className: classes.hubList },
	                    React__default["default"].createElement(material.RadioGroup, { value: selectedHub, onChange: event => {
	                            const newHub = event.target.value;
	                            setSelectedHub(newHub);
	                            console.log({ newHub }, hubs);
	                            // set values on a trackhub registry configSchema
	                            model.target.name.set(hubs.get(newHub).hub.shortLabel);
	                            model.target.assemblyNames.set([selectedTrackhubAssembly]);
	                            model.target.trackDbId.set(newHub);
	                        } }, Array.from(hubs.values())
	                        .filter(({ assembly }) => assembly.name === selectedTrackhubAssembly ||
	                        assembly.synonyms.includes(selectedTrackhubAssembly))
	                        .map(h => {
	                        const { error, trackdb_id, hub } = h;
	                        const { shortLabel, longLabel } = hub;
	                        return (React__default["default"].createElement(Wire, { key: trackdb_id, value: trackdb_id }, formControlProps => (React__default["default"].createElement(material.Tooltip, { title: error || React__default["default"].createElement(ui.SanitizedHTML, { html: longLabel }), placement: "left" },
	                            React__default["default"].createElement(material.FormControlLabel, { key: trackdb_id, value: trackdb_id, label: React__default["default"].createElement(ui.SanitizedHTML, { html: shortLabel }), disabled: Boolean(error), control: React__default["default"].createElement(material.Radio, null), ...formControlProps })))));
	                    }))))));
	        if (!allHubsRetrieved) {
	            renderItems.push(React__default["default"].createElement(QueryStatus, { key: "hubStatus", status: "Retrieving hubs" }));
	        }
	    }
	    if (selectedHub) {
	        renderItems.push(React__default["default"].createElement(HubDetails, { key: "hubDetails", hub: hubs.get(selectedHub).hub }));
	    }
	    return React__default["default"].createElement(React__default["default"].Fragment, null, renderItems);
	}

	class TrackHubRegistryPlugin extends Plugin__default["default"] {
	    name = 'TrackHubRegistryPlugin';
	    install(pluginManager) {
	        pluginManager.addConnectionType(() => new _default$2({
	            name: 'TheTrackHubRegistryConnection',
	            configSchema,
	            configEditorComponent: TrackHubRegistrySelect,
	            stateModel: stateModelFactory(pluginManager),
	            displayName: 'The Track Hub Registry',
	            description: 'A hub from The Track Hub Registry',
	            url: '//trackhubregistry.org/',
	        }));
	    }
	}

	exports["default"] = TrackHubRegistryPlugin;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=jbrowse-plugin-trackhub-registry.umd.development.js.map

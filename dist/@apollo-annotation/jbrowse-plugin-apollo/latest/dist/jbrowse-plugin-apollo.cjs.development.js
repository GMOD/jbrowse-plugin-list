Object.defineProperties(exports, {
	__esModule: { value: true },
	[Symbol.toStringTag]: { value: "Module" }
});
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let _apollo_annotation_common = require("@apollo-annotation/common");
let _apollo_annotation_shared = require("@apollo-annotation/shared");
let _jbrowse_core_Plugin = require("@jbrowse/core/Plugin");
_jbrowse_core_Plugin = __toESM(_jbrowse_core_Plugin, 1);
let _jbrowse_core_configuration = require("@jbrowse/core/configuration");
let _jbrowse_core_pluggableElementTypes = require("@jbrowse/core/pluggableElementTypes");
let _jbrowse_core_util = require("@jbrowse/core/util");
let _mui_icons_material_Add = require("@mui/icons-material/Add");
_mui_icons_material_Add = __toESM(_mui_icons_material_Add, 1);
let _mui_material = require("@mui/material");
let _jbrowse_mobx_state_tree = require("@jbrowse/mobx-state-tree");
let _mui_icons_material_LockPerson = require("@mui/icons-material/LockPerson");
_mui_icons_material_LockPerson = __toESM(_mui_icons_material_LockPerson, 1);
let _mui_icons_material_Login = require("@mui/icons-material/Login");
_mui_icons_material_Login = __toESM(_mui_icons_material_Login, 1);
let mobx = require("mobx");
let socket_io_client = require("socket.io-client");
let _mui_icons_material_AdminPanelSettings = require("@mui/icons-material/AdminPanelSettings");
_mui_icons_material_AdminPanelSettings = __toESM(_mui_icons_material_AdminPanelSettings, 1);
let _mui_icons_material_Delete = require("@mui/icons-material/Delete");
_mui_icons_material_Delete = __toESM(_mui_icons_material_Delete, 1);
let _mui_icons_material_Input = require("@mui/icons-material/Input");
_mui_icons_material_Input = __toESM(_mui_icons_material_Input, 1);
let _mui_icons_material_Person = require("@mui/icons-material/Person");
_mui_icons_material_Person = __toESM(_mui_icons_material_Person, 1);
let _mui_icons_material_Rule = require("@mui/icons-material/Rule");
_mui_icons_material_Rule = __toESM(_mui_icons_material_Rule, 1);
let _mui_icons_material_Info = require("@mui/icons-material/Info");
_mui_icons_material_Info = __toESM(_mui_icons_material_Info, 1);
let _mui_icons_material_Link = require("@mui/icons-material/Link");
_mui_icons_material_Link = __toESM(_mui_icons_material_Link, 1);
let _mui_icons_material_RadioButtonChecked = require("@mui/icons-material/RadioButtonChecked");
_mui_icons_material_RadioButtonChecked = __toESM(_mui_icons_material_RadioButtonChecked, 1);
let _mui_icons_material_RadioButtonUnchecked = require("@mui/icons-material/RadioButtonUnchecked");
_mui_icons_material_RadioButtonUnchecked = __toESM(_mui_icons_material_RadioButtonUnchecked, 1);
let bson_objectid = require("bson-objectid");
bson_objectid = __toESM(bson_objectid, 1);
let react = require("react");
react = __toESM(react, 1);
let tss_react_mui = require("tss-react/mui");
let _mui_icons_material_SkipNextRounded = require("@mui/icons-material/SkipNextRounded");
_mui_icons_material_SkipNextRounded = __toESM(_mui_icons_material_SkipNextRounded, 1);
let _mui_icons_material_SkipPreviousRounded = require("@mui/icons-material/SkipPreviousRounded");
_mui_icons_material_SkipPreviousRounded = __toESM(_mui_icons_material_SkipPreviousRounded, 1);
let _jbrowse_core_util_types_mst = require("@jbrowse/core/util/types/mst");
let idb_with_async_ittr = require("idb/with-async-ittr");
let _jbrowse_core_util_aborting = require("@jbrowse/core/util/aborting");
let jsonpath_plus = require("jsonpath-plus");
let _jbrowse_core_util_io = require("@jbrowse/core/util/io");
let fast_deep_equal_es6 = require("fast-deep-equal/es6");
fast_deep_equal_es6 = __toESM(fast_deep_equal_es6, 1);
let _jbrowse_core_ui = require("@jbrowse/core/ui");
let _mui_icons_material_Close = require("@mui/icons-material/Close");
_mui_icons_material_Close = __toESM(_mui_icons_material_Close, 1);
let mobx_react = require("mobx-react");
let react_jsx_runtime = require("react/jsx-runtime");
let _mui_x_data_grid = require("@mui/x-data-grid");
let _gmod_gff = require("@gmod/gff");
let file_saver = require("file-saver");
let _mui_icons_material_PersonAdd = require("@mui/icons-material/PersonAdd");
_mui_icons_material_PersonAdd = __toESM(_mui_icons_material_PersonAdd, 1);
let _mui_icons_material_AccountCircle = require("@mui/icons-material/AccountCircle");
_mui_icons_material_AccountCircle = __toESM(_mui_icons_material_AccountCircle, 1);
let _mui_icons_material_Business = require("@mui/icons-material/Business");
_mui_icons_material_Business = __toESM(_mui_icons_material_Business, 1);
let _jbrowse_core_pluggableElementTypes_AdapterType = require("@jbrowse/core/pluggableElementTypes/AdapterType");
_jbrowse_core_pluggableElementTypes_AdapterType = __toESM(_jbrowse_core_pluggableElementTypes_AdapterType, 1);
let _jbrowse_core_data_adapters_BaseAdapter = require("@jbrowse/core/data_adapters/BaseAdapter");
let nanoid = require("nanoid");
let _jbrowse_core_util_rxjs = require("@jbrowse/core/util/rxjs");
let _jbrowse_core_util_simpleFeature = require("@jbrowse/core/util/simpleFeature");
_jbrowse_core_util_simpleFeature = __toESM(_jbrowse_core_util_simpleFeature, 1);
let _jbrowse_core_TextSearch_BaseResults = require("@jbrowse/core/TextSearch/BaseResults");
_jbrowse_core_TextSearch_BaseResults = __toESM(_jbrowse_core_TextSearch_BaseResults, 1);
let _mui_icons_material_ExpandMore = require("@mui/icons-material/ExpandMore");
_mui_icons_material_ExpandMore = __toESM(_mui_icons_material_ExpandMore, 1);
let _mui_icons_material_Edit = require("@mui/icons-material/Edit");
_mui_icons_material_Edit = __toESM(_mui_icons_material_Edit, 1);
let _mui_icons_material_MoreHoriz = require("@mui/icons-material/MoreHoriz");
_mui_icons_material_MoreHoriz = __toESM(_mui_icons_material_MoreHoriz, 1);
let _mui_icons_material_AddBox = require("@mui/icons-material/AddBox");
_mui_icons_material_AddBox = __toESM(_mui_icons_material_AddBox, 1);
let _apollo_annotation_mst = require("@apollo-annotation/mst");
let _mui_material_styles = require("@mui/material/styles");
let _mui_icons_material_Remove = require("@mui/icons-material/Remove");
_mui_icons_material_Remove = __toESM(_mui_icons_material_Remove, 1);
let _mui_icons_material_ContentCopy = require("@mui/icons-material/ContentCopy");
_mui_icons_material_ContentCopy = __toESM(_mui_icons_material_ContentCopy, 1);
let _mui_icons_material_ContentCut = require("@mui/icons-material/ContentCut");
_mui_icons_material_ContentCut = __toESM(_mui_icons_material_ContentCut, 1);
let _mui_icons_material_Clear = require("@mui/icons-material/Clear");
_mui_icons_material_Clear = __toESM(_mui_icons_material_Clear, 1);
let _mui_icons_material_UnfoldLess = require("@mui/icons-material/UnfoldLess");
_mui_icons_material_UnfoldLess = __toESM(_mui_icons_material_UnfoldLess, 1);
let _jbrowse_core_util_tracks = require("@jbrowse/core/util/tracks");
let _mui_icons_material_FactCheck = require("@mui/icons-material/FactCheck");
_mui_icons_material_FactCheck = __toESM(_mui_icons_material_FactCheck, 1);
let _mui_icons_material_TrackChanges = require("@mui/icons-material/TrackChanges");
_mui_icons_material_TrackChanges = __toESM(_mui_icons_material_TrackChanges, 1);
let _mui_icons_material_ExpandLess = require("@mui/icons-material/ExpandLess");
_mui_icons_material_ExpandLess = __toESM(_mui_icons_material_ExpandLess, 1);
let _mui_icons_material_Lock = require("@mui/icons-material/Lock");
_mui_icons_material_Lock = __toESM(_mui_icons_material_Lock, 1);
let _mui_icons_material_Error = require("@mui/icons-material/Error");
_mui_icons_material_Error = __toESM(_mui_icons_material_Error, 1);
let _mui_icons_material_Logout = require("@mui/icons-material/Logout");
_mui_icons_material_Logout = __toESM(_mui_icons_material_Logout, 1);
let _mui_icons_material_Redo = require("@mui/icons-material/Redo");
_mui_icons_material_Redo = __toESM(_mui_icons_material_Redo, 1);
let _mui_icons_material_Undo = require("@mui/icons-material/Undo");
_mui_icons_material_Undo = __toESM(_mui_icons_material_Undo, 1);
let _mui_icons_material_Save = require("@mui/icons-material/Save");
_mui_icons_material_Save = __toESM(_mui_icons_material_Save, 1);
//#region package.json
var version = "1.2.0";
//#endregion
//#region src/ApolloInternetAccount/configSchema.ts
const ApolloConfigSchema = (0, _jbrowse_core_configuration.ConfigurationSchema)("ApolloInternetAccount", {
	baseURL: {
		description: "Location of Apollo server",
		type: "string",
		defaultValue: ""
	},
	tokenType: {
		description: "A custom name for a token to include in the header",
		type: "string",
		defaultValue: "Bearer"
	}
}, {
	baseConfiguration: _jbrowse_core_pluggableElementTypes.BaseInternetAccountConfig,
	explicitlyTyped: true
});
//#endregion
//#region src/util/annotationFeatureUtils.ts
function getFeatureName$1(feature) {
	const { attributes } = feature;
	const name = attributes.get("gff_name");
	if (name) return name[0];
	return "";
}
function getFeatureId$1(feature) {
	const { attributes } = feature;
	const id = attributes.get("gff_id");
	const transcript_id = attributes.get("transcript_id");
	const exon_id = attributes.get("exon_id");
	const protein_id = attributes.get("protein_id");
	if (id) return id[0];
	if (transcript_id) return transcript_id[0];
	if (exon_id) return exon_id[0];
	if (protein_id) return protein_id[0];
	return "";
}
function getFeatureNameOrId$1(feature) {
	const name = getFeatureName$1(feature);
	const id = getFeatureId$1(feature);
	if (name) return `: ${name}`;
	if (id) return `: ${id}`;
	return "";
}
function getStrand(strand) {
	if (strand === 1) return "Forward";
	if (strand === -1) return "Reverse";
	return "";
}
function getChildren(feature) {
	const children = [];
	if (feature.children) for (const [, ff] of feature.children) children.push(ff);
	return children;
}
function getParents(feature) {
	const parents = [];
	let { parent } = feature;
	while (parent) {
		parents.push(parent);
		({parent} = parent);
	}
	return parents;
}
function getRelatedFeatures(feature, bp, includeSiblings = false) {
	const relatedFeatures = [];
	relatedFeatures.push(feature);
	for (const x of getParents(feature)) relatedFeatures.push(x);
	const children = getChildren(feature);
	for (const child of children) if (child.min < bp && child.max >= bp) relatedFeatures.push(child);
	if (!includeSiblings) return relatedFeatures;
	if (feature.parent) {
		const siblings = feature.parent.children;
		if (siblings) for (const [, sib] of siblings) {
			if (sib._id == feature._id) continue;
			if (sib.min < bp && sib.max >= bp) relatedFeatures.push(sib);
		}
	}
	return relatedFeatures;
}
function removeSkippedAttributes(feature, skippedAttributes) {
	if (feature.attributes) {
		const newAttributes = {};
		for (const [attribute, values] of Object.entries(feature.attributes)) if (!skippedAttributes.has(attribute)) newAttributes[attribute] = values;
		feature.attributes = Object.keys(newAttributes).length === 0 ? void 0 : newAttributes;
	}
	if (feature.children) {
		const newChildren = {};
		for (const [childId, child] of Object.entries(feature.children)) {
			const newChild = { ...child };
			removeSkippedAttributes(newChild, skippedAttributes);
			newChildren[childId] = newChild;
		}
		feature.children = newChildren;
	}
}
/**
* The set of stopwords we use for fulltext indexing. Currently
* just generic English stopwords, but will likely be expanded over time.
*/
const stopwords = /* @__PURE__ */ new Set([
	"i",
	"me",
	"my",
	"myself",
	"we",
	"our",
	"ours",
	"ourselves",
	"you",
	"your",
	"yours",
	"yourself",
	"yourselves",
	"he",
	"him",
	"his",
	"himself",
	"she",
	"her",
	"hers",
	"herself",
	"it",
	"its",
	"itself",
	"they",
	"them",
	"their",
	"theirs",
	"themselves",
	"what",
	"which",
	"who",
	"whom",
	"this",
	"that",
	"these",
	"those",
	"am",
	"is",
	"are",
	"was",
	"were",
	"be",
	"been",
	"being",
	"have",
	"has",
	"had",
	"having",
	"do",
	"does",
	"did",
	"doing",
	"a",
	"an",
	"the",
	"and",
	"but",
	"if",
	"or",
	"because",
	"as",
	"until",
	"while",
	"of",
	"at",
	"by",
	"for",
	"with",
	"about",
	"against",
	"between",
	"into",
	"through",
	"during",
	"before",
	"after",
	"above",
	"below",
	"to",
	"from",
	"up",
	"down",
	"in",
	"out",
	"on",
	"off",
	"over",
	"under",
	"again",
	"further",
	"then",
	"once",
	"here",
	"there",
	"when",
	"where",
	"why",
	"how",
	"all",
	"any",
	"both",
	"each",
	"few",
	"more",
	"most",
	"other",
	"some",
	"such",
	"no",
	"nor",
	"not",
	"only",
	"own",
	"same",
	"so",
	"than",
	"too",
	"very",
	"s",
	"t",
	"can",
	"will",
	"just",
	"don",
	"should",
	"now",
	"0",
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9"
]);
//#endregion
//#region src/OntologyManager/OntologyStore/prefixes.ts
/**
* compact the given URI using the given prefixes
*/
function applyPrefixes(uri, prefixes) {
	for (const [prefix, uriBase] of prefixes.entries()) if (uri.startsWith(uriBase)) return uri.replace(uriBase, String(prefix));
	return uri;
}
/**
* expand the given compacted URI using given prefixes
*/
function expandPrefixes(uri, prefixes) {
	for (const [prefix, uriBase] of prefixes.entries()) if (uri.startsWith(String(prefix))) return uri.replace(String(prefix), uriBase);
	return uri;
}
//#endregion
//#region src/OntologyManager/OntologyStore/fulltext.ts
/** special value of jsonPath that gets the IRI (that is, ID) of the node with the configured prefixes applied */
const PREFIXED_ID_PATH = "$PREFIXED_ID";
/** @returns array of all values in `json` matched by the JSONPath `path` */
function query(json, path) {
	return (0, jsonpath_plus.JSONPath)({
		path,
		json,
		wrap: true
	});
}
/** small wrapper for query that intercepts requests for the special prefixed ID path */
function jsonPathQuery(node, path, prefixes) {
	if (path === "$PREFIXED_ID") return [applyPrefixes(node.id, prefixes)];
	return query(node, path);
}
function wordsInString(str) {
	return str.toLowerCase().split(/[^\d:A-Za-z]+/).filter((word) => word && !stopwords.has(word));
}
/**
* recursively get the indexable words from an iterator
* of any objects
**/
function* extractWords(strings) {
	for (const str of strings) yield* wordsInString(str);
}
function* extractStrings(things) {
	for (const thing of things) if (typeof thing === "string") yield thing;
	else if (typeof thing === "object" && thing !== null) yield* extractStrings(query(thing, "$..*"));
}
/** @returns generator of tuples of [jsonpath, word] */
function* getWords(node, jsonPaths, prefixes) {
	for (const path of jsonPaths) {
		const queryResult = jsonPathQuery(node, path, prefixes);
		if (queryResult.length > 0) for (const word of extractWords(extractStrings(queryResult))) yield [path, word];
	}
}
/**
*
**/
async function textSearch(text, tx, signal) {
	const db = await this.db;
	const myTx = tx ?? db.transaction(["nodes"]);
	(0, _jbrowse_core_util_aborting.checkAbortSignal)(signal);
	const queryWords = [...wordsInString(text)];
	const queries = [];
	/**
	* Build a structure of which terms match which words.
	* This is a Map of term.id -\> Set\<query word number\>
	**/
	const initialMatches = /* @__PURE__ */ new Map();
	queries.push(...queryWords.map(async (queryWord, queryWordIndex) => {
		(0, _jbrowse_core_util_aborting.checkAbortSignal)(signal);
		const idx = myTx.objectStore("nodes").index("full-text-words");
		for await (const cursor of idx.iterate(IDBKeyRange.bound(queryWord, `${queryWord}\uFFFF`, false, false))) {
			(0, _jbrowse_core_util_aborting.checkAbortSignal)(signal);
			const term = cursor.value;
			const termMatches = initialMatches.get(term.id) ?? [term, /* @__PURE__ */ new Set()];
			termMatches[1].add(queryWordIndex);
			initialMatches.set(term.id, termMatches);
		}
	}));
	await Promise.all(queries);
	(0, _jbrowse_core_util_aborting.checkAbortSignal)(signal);
	const results = [];
	for (const [, [term, wordIndexes]] of initialMatches) {
		(0, _jbrowse_core_util_aborting.checkAbortSignal)(signal);
		results.push(...elaborateMatch(this.textIndexFields, term, wordIndexes, queryWords, this.prefixes));
	}
	results.sort((a, b) => b.score - a.score);
	return results.slice(0, this.options.maxSearchResults ?? this.DEFAULT_MAX_SEARCH_RESULTS);
}
function elaborateMatch(textIndexPaths, term, queryWordIndexes, queryWords, prefixes) {
	const matchedQueryWords = [...queryWordIndexes].sort().map((i) => queryWords[i]);
	const queryWordRegexps = matchedQueryWords.map((queryWord) => {
		const escaped = queryWord.replaceAll(/[$()*+./?[\\\]^{|}-]/g, String.raw`\$&`);
		return new RegExp(`\\b${escaped}`, "gi");
	});
	const FIELD_PRIORITY_WEIGHT = 1;
	const MATCH_WORDS_CLOSENESS_WEIGHT = .05;
	const MATCH_ADJACENCY_BONUS = 1;
	const MATCH_RIGHT_ORDER_BONUS = 1;
	const MATCH_LENGTH_WEIGHT = .01;
	const PCT_OF_STRING_WEIGHT = .05;
	const WORD_BONUS = 100;
	let matches = [];
	let maxScore = 0;
	for (const [fieldIdx, field] of textIndexPaths.entries()) {
		const wordsMatched = /* @__PURE__ */ new Set();
		const fieldPriorityBonus = textIndexPaths.length - fieldIdx - 1;
		const termStrings = [...extractStrings(jsonPathQuery(term, field.jsonPath, prefixes))];
		for (const str of termStrings) {
			let score = 0;
			const wordMatches = [];
			for (const [wordIndex, re] of queryWordRegexps.entries()) for (const match of str.matchAll(re)) {
				score += 1 + fieldPriorityBonus * FIELD_PRIORITY_WEIGHT;
				wordsMatched.add(wordIndex);
				const position = match.index;
				const queryWord = queryWords[wordIndex];
				if (position !== void 0) {
					score += queryWord.length * MATCH_LENGTH_WEIGHT;
					score += queryWord.length / str.length * 100 * PCT_OF_STRING_WEIGHT;
					wordMatches.push({
						wordIndex,
						position
					});
				}
			}
			score += wordsMatched.size * WORD_BONUS;
			if (maxScore < score) maxScore = score;
			wordMatches.sort((a, b) => a.position - b.position);
			if (wordMatches.length > 0) matches.push({
				term,
				field,
				str,
				score,
				wordMatches
			});
		}
	}
	matches = matches.filter((m) => m.score === maxScore);
	for (const match of matches) {
		const { wordMatches } = match;
		for (let i = 0; i < wordMatches.length - 1; i++) {
			const m1 = wordMatches[i];
			const m2 = wordMatches[i + 1];
			const wdiff = m2.wordIndex - m1.wordIndex;
			if (wdiff === 1 || wdiff === -1) {
				match.score += MATCH_ADJACENCY_BONUS;
				if (wdiff === 1) match.score += MATCH_RIGHT_ORDER_BONUS;
				const spacing = Math.abs(m2.position - (m1.position + matchedQueryWords[m1.wordIndex].length)) - 1;
				match.score -= spacing * MATCH_WORDS_CLOSENESS_WEIGHT;
			}
		}
	}
	return matches;
}
//#endregion
//#region src/OntologyManager/OntologyStore/indexeddb-schema.ts
function isOntologyDBNode(node) {
	return typeof node.id === "string";
}
function isOntologyDBEdge(edge) {
	return typeof edge.sub === "string" && typeof edge.pred === "string" && typeof edge.obj === "string";
}
function isDeprecated(thing) {
	return Boolean(thing.meta?.deprecated);
}
//#endregion
//#region src/OntologyManager/OntologyStore/types.ts
function isOntologyClass(term) {
	return term.type === "CLASS";
}
function isOntologyProperty(term) {
	return term.type === "PROPERTY";
}
const defaultTextIndexFields = [
	{
		displayName: "Label",
		jsonPath: "$.lbl"
	},
	{
		displayName: "Synonym",
		jsonPath: "$.meta.synonyms[*].val"
	},
	{
		displayName: "Definition",
		jsonPath: "$.meta.definition.val"
	}
];
//#endregion
//#region src/OntologyManager/OntologyStore/indexeddb-storage.ts
/** schema version we are currently on, used for the IndexedDB schema open call */
const schemaVersion = 2;
/** open the IndexedDB and create the DB schema if necessary */
async function openDatabase(dbName) {
	return (0, idb_with_async_ittr.openDB)(dbName, schemaVersion, { upgrade(database, oldVersion, newVersion, transaction, _event) {
		if (oldVersion < schemaVersion) {
			if (database.objectStoreNames.contains("meta")) database.deleteObjectStore("meta");
			if (database.objectStoreNames.contains("nodes")) database.deleteObjectStore("nodes");
			if (database.objectStoreNames.contains("edges")) database.deleteObjectStore("edges");
		}
		if (!database.objectStoreNames.contains("meta")) database.createObjectStore("meta");
		if (!database.objectStoreNames.contains("nodes")) {
			database.createObjectStore("nodes", { keyPath: "id" });
			const nodes = transaction.objectStore("nodes");
			nodes.createIndex("by-label", "lbl");
			nodes.createIndex("by-type", "type");
			nodes.createIndex("by-synonym", [
				"meta",
				"synonyms",
				"val"
			]);
			nodes.createIndex("full-text-words", "fullTextWords", { multiEntry: true });
		}
		if (!database.objectStoreNames.contains("edges")) {
			database.createObjectStore("edges", { autoIncrement: true });
			const edges = transaction.objectStore("edges");
			edges.createIndex("by-subject", "sub");
			edges.createIndex("by-object", "obj");
			edges.createIndex("by-predicate", "pred");
		}
	} });
}
/** serialize all our words in the DB node so they can be indexed */
function serializeWords(foundWords) {
	const allWords = /* @__PURE__ */ new Set();
	for (const [, word] of foundWords) allWords.add(word);
	return [...allWords];
}
/** load a OBO Graph JSON file into a database */
async function loadOboGraphJson(db) {
	const startTime = Date.now();
	let percentProgress = 1;
	this.options.update?.("Parsing JSON", percentProgress);
	let oboGraph;
	try {
		oboGraph = JSON.parse(await (0, _jbrowse_core_util_io.openLocation)(this.sourceLocation).readFile("utf8"));
	} catch {
		throw new Error("Error in loading ontology");
	}
	percentProgress += 5;
	this.options.update?.("Parsing JSON complete", percentProgress);
	const parseTime = Date.now();
	const [graph, ...additionalGraphs] = oboGraph.graphs ?? [];
	if (!graph) return;
	if (additionalGraphs.length > 0) throw new Error("multiple graphs not supported");
	try {
		const tx = db.transaction([
			"meta",
			"nodes",
			"edges"
		], "readwrite");
		await tx.objectStore("meta").clear();
		await tx.objectStore("nodes").clear();
		await tx.objectStore("edges").clear();
		const nodeStore = tx.objectStore("nodes");
		const fullTextIndexPaths = getTextIndexFields.call(this).map((def) => def.jsonPath);
		if (graph.nodes) {
			let lastProgress = Math.round(percentProgress);
			for (const [, node] of graph.nodes.entries()) {
				percentProgress += 64 * (1 / graph.nodes.length);
				if (Math.round(percentProgress) != lastProgress && percentProgress < 100) {
					this.options.update?.("Processing nodes", percentProgress);
					lastProgress = Math.round(percentProgress);
				}
				if (isOntologyDBNode(node)) await nodeStore.add({
					...node,
					fullTextWords: serializeWords(getWords(node, fullTextIndexPaths, this.prefixes))
				});
			}
		}
		const edgeStore = tx.objectStore("edges");
		if (graph.edges) {
			let lastProgress = Math.round(percentProgress);
			for (const [, edge] of graph.edges.entries()) {
				percentProgress += 30 * (1 / graph.edges.length);
				if (Math.round(percentProgress) != lastProgress && percentProgress < 100) {
					this.options.update?.("Processing edges", percentProgress);
					lastProgress = Math.round(percentProgress);
				}
				if (isOntologyDBEdge(edge)) await edgeStore.add(edge);
			}
		}
		await tx.done;
		const tx2 = db.transaction("meta", "readwrite");
		const { update, ...otherOptions } = this.options;
		await tx2.objectStore("meta").delete("meta");
		await tx2.objectStore("meta").add({
			ontologyRecord: {
				name: this.ontologyName,
				version: this.ontologyVersion,
				sourceLocation: this.sourceLocation
			},
			storeOptions: otherOptions,
			graphMeta: graph.meta,
			timestamp: String(/* @__PURE__ */ new Date()),
			schemaVersion,
			timings: {
				overall: Date.now() - startTime,
				load: Date.now() - parseTime
			}
		}, "meta");
		await tx2.done;
	} catch (error) {
		await db.transaction("meta", "readwrite").objectStore("meta").clear();
		throw error;
	}
}
function getTextIndexFields() {
	return [{
		displayName: "ID",
		jsonPath: PREFIXED_ID_PATH
	}, ...this.options.textIndexing?.indexFields ?? defaultTextIndexFields];
}
async function isDatabaseCurrent(db) {
	const [meta] = await db.transaction("meta").objectStore("meta").getAll();
	if (!meta) return false;
	return (0, fast_deep_equal_es6.default)(this.options.prefixes, meta.storeOptions.prefixes) && (0, fast_deep_equal_es6.default)(this.options.textIndexing, meta.storeOptions.textIndexing);
}
//#endregion
//#region src/OntologyManager/OntologyStore/index.ts
async function arrayFromAsync(iter) {
	const a = [];
	for await (const i of iter) a.push(i);
	return a;
}
/** query interface for a specific ontology */
var OntologyStore = class {
	ontologyName;
	ontologyVersion;
	sourceLocation;
	db;
	options;
	loadOboGraphJson = loadOboGraphJson;
	getTermsByFulltext = textSearch;
	openDatabase = openDatabase;
	isDatabaseCurrent = isDatabaseCurrent;
	get textIndexFields() {
		return getTextIndexFields.call(this);
	}
	get prefixes() {
		return this.options.prefixes ?? /* @__PURE__ */ new Map();
	}
	DEFAULT_MAX_SEARCH_RESULTS = 100;
	constructor(name, version, source, options) {
		this.ontologyName = name;
		this.ontologyVersion = version;
		this.sourceLocation = source;
		this.options = options ?? {};
		this.db = this.prepareDatabase();
	}
	/**
	* check that the configuration of this ontology appears valid. Does not
	* try to do any fetches, however.
	*/
	validate() {
		const errors = [];
		const { sourceLocation, sourceType } = this;
		if (!sourceType) errors.push(/* @__PURE__ */ new Error(`unable to determine format of ontology source file ${JSON.stringify(sourceLocation)}, file name must end with ".json", ".obo", or ".owl"`));
		else if (sourceType !== "obo-graph-json") errors.push(/* @__PURE__ */ new Error(`ontology source file ${JSON.stringify(sourceLocation)} has type ${sourceType}, which is not yet supported`));
		return errors;
	}
	get sourceType() {
		if ((0, _jbrowse_core_util.isUriLocation)(this.sourceLocation)) {
			if (this.sourceLocation.uri.endsWith(".json")) return "obo-graph-json";
		} else if ((0, _jbrowse_core_util.isLocalPathLocation)(this.sourceLocation) && this.sourceLocation.localPath.endsWith(".json")) return "obo-graph-json";
	}
	/** base name of the IndexedDB database for this ontology */
	get dbName() {
		return `Apollo Ontology "${this.ontologyName}" "${this.ontologyVersion}"`;
	}
	async prepareDatabase() {
		const errors = this.validate();
		if (errors.length > 0) throw errors;
		const db = await this.openDatabase(this.dbName);
		if (await this.isDatabaseCurrent(db)) return db;
		try {
			const { options, sourceLocation, sourceType } = this;
			if (sourceType === "obo-graph-json") {
				options.update?.("", 0);
				await this.loadOboGraphJson(db);
				options.update?.("", 100);
			} else throw new Error(`ontology source file ${JSON.stringify(sourceLocation)} has type ${sourceType}, which is not yet supported`);
			return db;
		} catch (error) {
			db.close();
			await (0, idb_with_async_ittr.deleteDB)(this.dbName);
			throw error;
		}
	}
	async termCount(tx) {
		const db = await this.db;
		return (tx ?? db.transaction("nodes")).objectStore("nodes").count();
	}
	unique(nodes) {
		const seen = /* @__PURE__ */ new Map();
		const result = [];
		for (const node of nodes) if (!seen.has(node.id)) {
			seen.set(node.id, true);
			result.push(node);
		}
		return result;
	}
	async getTermsWithLabelOrSynonym(termLabelOrSynonym, options, tx) {
		const includeSubclasses = options?.includeSubclasses ?? true;
		const db = await this.db;
		const myTx = tx ?? db.transaction(["nodes", "edges"]);
		const nodes = myTx.objectStore("nodes");
		const resultNodes = [...await nodes.index("by-label").getAll(termLabelOrSynonym), ...await nodes.index("by-synonym").getAll(termLabelOrSynonym)];
		if (includeSubclasses) {
			const subclassIds = await this.recurseEdges("by-object", resultNodes.map((n) => n.id), (edge) => edge.pred === "is_a", "sub", myTx);
			for (const nodeId of subclassIds) {
				const node = await nodes.get(nodeId);
				if (node) resultNodes.push(node);
			}
		}
		return resultNodes;
	}
	/**
	* Get the ontology term for the property with the given label,
	* plus all the terms for the properties that are "subPropertyOf"
	* that property.
	*
	* If there is more than one property with that label, treats it as
	* equivalent and just returns all the properties and their subproperties.
	*
	* options.includeSubProperties default is true
	*/
	async getPropertiesByLabel(propertyLabel, options, tx) {
		const includeSubProperties = options?.includeSubProperties ?? true;
		const db = await this.db;
		const myTx = tx ?? db.transaction(["nodes", "edges"]);
		const properties = (await this.getTermsWithLabelOrSynonym(propertyLabel, { includeSubclasses: false }, myTx)).filter((p) => isOntologyProperty(p));
		if (includeSubProperties) {
			const subPropertyIds = await this.recurseEdges("by-object", properties.map((p) => p.id), (edge) => edge.pred === "subPropertyOf", "sub", myTx);
			const nodes = myTx.objectStore("nodes");
			for (const subPropertyId of subPropertyIds) {
				const property = await nodes.get(subPropertyId);
				if (property && isOntologyProperty(property)) properties.push(property);
			}
		}
		return properties;
	}
	/** private helper for traversing the edges of the ontology graph. Does a breadth-first search of the graph */
	async recurseEdges(queryIndex, inputQueryIds, filterEdge, resultProp, myTx) {
		const resultIds = /* @__PURE__ */ new Set();
		async function recur(queryIds) {
			await Promise.all([...queryIds].map(async (queryId) => {
				const theseResults = (await myTx.objectStore("edges").index(queryIndex).getAll(queryId)).filter((element) => filterEdge(element)).map((edge) => edge[resultProp]);
				if (theseResults.length > 0) {
					for (const resultId of theseResults) resultIds.add(resultId);
					await recur(theseResults);
				}
			}));
		}
		await recur(inputQueryIds);
		return resultIds.values();
	}
	/**
	* given an array of node IDs, augment it with all of their subclasses or
	* superclasses, and return the augmented array
	**/
	async *expandNodeSet(startingNodeIds, subclassRelation = "is_a", direction, tx) {
		const db = await this.db;
		const myTx = tx ?? db.transaction(["edges"]);
		const startingNodes = [...startingNodeIds];
		const subclassIds = await this.recurseEdges(direction === "subclasses" ? "by-object" : "by-subject", startingNodes, (edge) => edge.pred === subclassRelation, direction === "subclasses" ? "sub" : "obj", myTx);
		for (const n of startingNodes) yield n;
		for (const id of subclassIds) yield id;
	}
	/**
	* given an iterator of node IDs, return a new iterator of those nodes plus all of their subclasses
	*/
	expandSubclasses(startingNodeIds, subclassRelation = "is_a", tx) {
		return this.expandNodeSet(startingNodeIds, subclassRelation, "subclasses", tx);
	}
	/**
	* given an iterator of node IDs, return a new iterator of those nodes plus all of their superclasses
	*/
	expandSuperclasses(startingNodeIds, subclassRelation = "is_a", tx) {
		return this.expandNodeSet(startingNodeIds, subclassRelation, "superclasses", tx);
	}
	/**
	* example: for the Sequence Ontology, store.getTermsThat('part_of', [geneTerm])
	* would return all terms that are part_of, member_of, or integral_part_of a gene
	*/
	async getClassesThat(propertyLabel, targetTerms, tx) {
		const db = await this.db;
		const myTx = tx ?? db.transaction(["nodes", "edges"]);
		const relatingProperties = await this.getPropertiesByLabel(propertyLabel, { includeSubProperties: true }, myTx);
		const relatingPropertyIds = new Set(relatingProperties.map((p) => p.id));
		const targetTermsWithSuperClasses = await arrayFromAsync(this.expandSuperclasses(targetTerms.map((t) => t.id), "is_a", myTx));
		const termIds = await this.recurseEdges("by-object", targetTermsWithSuperClasses, (edge) => relatingPropertyIds.has(edge.pred), "sub", myTx);
		const expanded = this.expandSubclasses(termIds, "is_a", myTx);
		const terms = [];
		for await (const termId of expanded) {
			const node = await myTx.objectStore("nodes").get(termId);
			if (node && isOntologyClass(node) && !isDeprecated(node)) terms.push(node);
		}
		return terms;
	}
	async getClassesWithoutPropertyLabeled(propertyLabel, options, tx) {
		const db = await this.db;
		const myTx = tx ?? db.transaction(["nodes", "edges"]);
		const nodeStore = myTx.objectStore("nodes");
		const edgeStore = myTx.objectStore("edges");
		const relatingPropertyIds = (await this.getPropertiesByLabel(propertyLabel, options, myTx)).map((p) => p.id);
		const termIdsWithProperties = await (async () => {
			const ids = /* @__PURE__ */ new Set();
			for (const propertyId of relatingPropertyIds) for await (const cursor of edgeStore.index("by-predicate").iterate(propertyId)) ids.add(cursor.value.sub);
			const expanded = /* @__PURE__ */ new Set();
			for await (const id of this.expandSubclasses(ids, "is_a", myTx)) expanded.add(id);
			return expanded;
		})();
		const termIds = [];
		for await (const cursor of nodeStore) {
			const node = cursor.value;
			if (isOntologyClass(node) && !termIdsWithProperties.has(node.id)) termIds.push(node.id);
		}
		const terms = [];
		for (const termId of termIds) {
			const node = await myTx.objectStore("nodes").get(termId);
			if (node && isOntologyClass(node) && !isDeprecated(node)) terms.push(node);
		}
		return terms;
	}
	async getAllClasses(tx) {
		const db = await this.db;
		return (await (tx ?? db.transaction(["nodes"])).objectStore("nodes").index("by-type").getAll("CLASS")).filter((term) => !isDeprecated(term));
	}
	async getAllTerms(tx) {
		const db = await this.db;
		return (await (tx ?? db.transaction(["nodes"])).objectStore("nodes").getAll()).filter((term) => !isDeprecated(term));
	}
};
//#endregion
//#region src/OntologyManager/index.ts
const OntologyRecordType = _jbrowse_mobx_state_tree.types.model("OntologyRecord", {
	name: _jbrowse_mobx_state_tree.types.string,
	version: "unversioned",
	source: _jbrowse_mobx_state_tree.types.union(_jbrowse_core_util_types_mst.LocalPathLocation, _jbrowse_core_util_types_mst.UriLocation, _jbrowse_core_util_types_mst.BlobLocation),
	options: _jbrowse_mobx_state_tree.types.frozen(),
	equivalentTypes: _jbrowse_mobx_state_tree.types.map(_jbrowse_mobx_state_tree.types.array(_jbrowse_mobx_state_tree.types.string))
}).volatile((_self) => ({
	dataStore: void 0,
	equivalentTypeRequests: /* @__PURE__ */ new Map()
})).actions((self) => ({
	/** does nothing, just used to access the model to force its lifecycle hooks to run */
	ping() {},
	initDataStore() {
		self.dataStore = new OntologyStore(self.name, self.version, (0, _jbrowse_mobx_state_tree.getSnapshot)(self.source), self.options);
	},
	afterCreate() {
		(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)(() => {
			this.initDataStore();
		}));
	},
	setEquivalentTypes(type, equivalentTypes) {
		self.equivalentTypes.set(type, equivalentTypes);
	}
})).actions((self) => {
	const fetchEquivalentTypes = (0, _jbrowse_mobx_state_tree.flow)(function* fetchEquivalentTypes(dataStore, type) {
		const equivalents = (yield dataStore.getTermsWithLabelOrSynonym(type)).map((term) => term.lbl).filter((term) => term != void 0);
		if ((0, _jbrowse_mobx_state_tree.isAlive)(self)) self.setEquivalentTypes(type, equivalents);
	});
	return { 
	/**
	* Load the types equivalent to `type` so `isTypeOf` can use them.
	* Resolves once they're loaded, even if another caller started loading
	* them first.
	*/
loadEquivalentTypes(type) {
		const { dataStore } = self;
		if (!dataStore || self.equivalentTypes.has(type)) return Promise.resolve();
		let request = self.equivalentTypeRequests.get(type);
		if (!request) {
			request = fetchEquivalentTypes(dataStore, type);
			self.equivalentTypeRequests.set(type, request);
		}
		return request;
	} };
}).actions((self) => ({
	afterCreate() {
		(0, mobx.autorun)((reaction) => {
			if (!self.dataStore) return;
			self.loadEquivalentTypes("gene");
			self.loadEquivalentTypes("pseudogene");
			self.loadEquivalentTypes("transcript");
			self.loadEquivalentTypes("pseudogenic_transcript");
			self.loadEquivalentTypes("CDS");
			self.loadEquivalentTypes("mRNA");
			self.loadEquivalentTypes("exon");
			reaction.dispose();
		});
	},
	setEquivalentTypes(type, equivalentTypes) {
		self.equivalentTypes.set(type, equivalentTypes);
	}
})).views((self) => ({ isTypeOf(queryType, typeOf) {
	if (queryType === typeOf) return true;
	if (!self.dataStore) return false;
	const equivalents = self.equivalentTypes.get(typeOf);
	if (!equivalents) {
		self.loadEquivalentTypes(typeOf);
		return false;
	}
	return equivalents.includes(queryType);
} }));
const OntologyManagerType = _jbrowse_mobx_state_tree.types.model("OntologyManager", {
	ontologies: _jbrowse_mobx_state_tree.types.array(OntologyRecordType),
	prefixes: _jbrowse_mobx_state_tree.types.optional(_jbrowse_mobx_state_tree.types.map(_jbrowse_mobx_state_tree.types.string), {
		"GO:": "http://purl.obolibrary.org/obo/GO_",
		"SO:": "http://purl.obolibrary.org/obo/SO_"
	})
}).views((self) => ({ get featureTypeOntologyName() {
	const pluginConfiguration = (0, _jbrowse_mobx_state_tree.getRoot)(self).jbrowse.configuration.ApolloPlugin;
	return (0, _jbrowse_core_configuration.readConfObject)(pluginConfiguration, "featureTypeOntologyName");
} })).views((self) => ({
	/**
	* gets the OntologyRecord for the ontology we should be
	* using for feature types (e.g. SO or maybe biotypes)
	**/
	get featureTypeOntology() {
		return this.findOntology(self.featureTypeOntologyName);
	},
	findOntology(name, version) {
		return self.ontologies.find((record) => {
			return record.name === name && (version === void 0 || record.version === version);
		});
	},
	openOntology(name, version) {
		return this.findOntology(name, version)?.dataStore;
	},
	/**
	* compact the given URI using the currently configured
	* prefixes
	*/
	applyPrefixes(uri) {
		return applyPrefixes(uri, self.prefixes);
	},
	/**
	* expand the given compacted URI using the currently
	* configured prefixes
	*/
	expandPrefixes(uri) {
		return expandPrefixes(uri, self.prefixes);
	}
})).actions((self) => ({ addOntology(name, version, source, options) {
	const newlen = self.ontologies.push({
		name,
		version,
		source,
		options: {
			prefixes: new Map(self.prefixes.entries()),
			...options
		}
	});
	self.ontologies[newlen - 1].ping();
} }));
const OntologyRecordConfiguration = (0, _jbrowse_core_configuration.ConfigurationSchema)("OntologyRecord", {
	name: {
		type: "string",
		description: "the full name of the ontology, e.g. \"Gene Ontology\"",
		defaultValue: "My Ontology"
	},
	version: {
		type: "string",
		description: "the ontology's version string",
		defaultValue: "unversioned"
	},
	source: {
		type: "fileLocation",
		description: "the download location for the ontology's source file",
		defaultValue: {
			locationType: "UriLocation",
			uri: "http://example.com/myontology.json"
		}
	},
	textIndexFields: {
		type: "frozen",
		description: "JSON paths for text fields that will be indexed for text searching",
		defaultValue: defaultTextIndexFields
	}
});
//#endregion
//#region src/OntologyManager/util.ts
async function fetchValidDescendantTerms(parentFeature, ontologyStore, _signal) {
	if (!parentFeature) return;
	const parentTypeTerms = await ontologyStore.getTermsWithLabelOrSynonym(parentFeature.type, { includeSubclasses: false });
	const parentTypeClassTerms = parentTypeTerms.filter(isOntologyClass);
	if (parentTypeTerms.length === 0) return;
	const subpartTerms = await ontologyStore.getClassesThat("part_of", parentTypeClassTerms);
	if (subpartTerms.length === 0) return;
	return subpartTerms;
}
//#endregion
//#region src/components/Dialog.tsx
const useStyles$15 = (0, tss_react_mui.makeStyles)()((theme) => ({
	dialogTitle: {
		background: theme.palette.primary.main,
		color: theme.palette.primary.contrastText,
		padding: theme.spacing(2)
	},
	closeButton: {
		position: "absolute",
		right: theme.spacing(1),
		top: theme.spacing(1.5),
		color: theme.palette.primary.contrastText
	}
}));
const Dialog$1 = (0, mobx_react.observer)(function JBrowseDialog(props) {
	const { classes } = useStyles$15();
	const { handleClose, title, ...other } = props;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_jbrowse_core_ui.Dialog, {
		...other,
		header: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogTitle, {
			className: classes.dialogTitle,
			children: title
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.IconButton, {
			"aria-label": "close",
			onClick: handleClose,
			className: classes.closeButton,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Close.default, {})
		})] })
	});
});
//#endregion
//#region src/components/OntologyTermAutocomplete.tsx
function OntologyTermAutocomplete({ fetchValidTerms, filterTerms: filterTermsProp, includeDeprecated, onChange, ontologyName, ontologyVersion, renderInput, session, style, value: valueString }) {
	const [open, setOpen] = (0, react.useState)(false);
	const [termChoices, setTermChoices] = (0, react.useState)();
	const [currentOntologyTermInvalid, setCurrentOntologyTermInvalid] = (0, react.useState)("");
	const [currentOntologyTerm, setCurrentOntologyTerm] = (0, react.useState)();
	const { ontologyManager } = session.apolloDataStore;
	const ontologyStore = ontologyManager.findOntology(ontologyName, ontologyVersion)?.dataStore;
	const needToLoadTermChoices = ontologyStore && open && !termChoices;
	const needToLoadCurrentTerm = ontologyStore && !currentOntologyTerm;
	const filterTerms = (0, react.useCallback)((term) => (includeDeprecated || !isDeprecated(term)) && (!filterTermsProp || filterTermsProp(term)), [filterTermsProp, includeDeprecated]);
	(0, react.useEffect)(() => {
		const controller = new AbortController();
		const { signal } = controller;
		if (needToLoadCurrentTerm) getCurrentTerm(ontologyStore, valueString, filterTerms, signal).then((term) => {
			setCurrentOntologyTermInvalid("");
			if (!signal.aborted) setCurrentOntologyTerm(term);
		}, (error) => {
			if (!signal.aborted && !(0, _jbrowse_core_util_aborting.isAbortException)(error)) setCurrentOntologyTermInvalid(String(error));
		});
		return () => {
			controller.abort(new DOMException("Cancel getting current term from ontology store", "AbortError"));
		};
	}, [
		session,
		valueString,
		filterTerms,
		ontologyStore,
		needToLoadCurrentTerm
	]);
	(0, react.useEffect)(() => {
		const controller = new AbortController();
		const { signal } = controller;
		if (needToLoadTermChoices) getValidTerms(ontologyStore, fetchValidTerms, filterTerms, signal).then((soTerms) => {
			if (soTerms && !signal.aborted) setTermChoices(soTerms);
		}, (error) => {
			if (!signal.aborted && !(0, _jbrowse_core_util_aborting.isAbortException)(error)) session.notify(error instanceof Error ? error.message : String(error), "error");
		});
		return () => {
			controller.abort(new DOMException("Canceling getting valid terms from ontology store", "AbortError"));
		};
	}, [
		needToLoadTermChoices,
		filterTerms,
		ontologyStore,
		session,
		fetchValidTerms
	]);
	const handleChange = (event, newValue) => {
		if (!newValue) return;
		if (typeof newValue === "string") {
			setCurrentOntologyTerm(void 0);
			onChange(valueString, newValue);
		} else if (newValue.lbl !== valueString) {
			setCurrentOntologyTermInvalid("");
			setCurrentOntologyTerm(newValue);
			onChange(valueString, newValue.lbl);
		}
	};
	const extraTextFieldParams = {};
	if (currentOntologyTermInvalid) {
		extraTextFieldParams.error = true;
		extraTextFieldParams.helperText = currentOntologyTermInvalid;
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Autocomplete, {
		style,
		autoComplete: true,
		filterSelectedOptions: true,
		disableClearable: true,
		selectOnFocus: true,
		clearOnBlur: true,
		handleHomeEndKeys: true,
		freeSolo: true,
		value: valueString,
		options: termChoices ?? [],
		onOpen: () => {
			setOpen(true);
		},
		onClose: () => {
			setOpen(false);
		},
		loading: needToLoadTermChoices,
		renderInput: renderInput ?? ((params) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
			...params,
			...extraTextFieldParams
		})),
		getOptionLabel: (option) => {
			if (typeof option === "string") return option;
			return option.lbl ?? "";
		},
		isOptionEqualToValue: (option, val) => option.lbl === val.lbl,
		onChange: handleChange
	});
}
async function getCurrentTerm(ontologyStore, currentTermLabel, filterTerms, _signal) {
	if (!currentTermLabel) return;
	const term = (await ontologyStore.getTermsWithLabelOrSynonym(currentTermLabel, { includeSubclasses: false })).find((term) => (filterTerms ?? (() => true))(term));
	if (!term) throw new Error(`not a valid ${ontologyStore.ontologyName} term`);
	return term;
}
async function getValidTerms(ontologyStore, fetchValidTerms, filterTerms, signal) {
	let result;
	if (fetchValidTerms) {
		const customTermList = await fetchValidTerms(ontologyStore, signal);
		if (customTermList) result = customTermList;
	}
	result ??= await ontologyStore.getAllTerms();
	return filterTerms ? result.filter((element) => filterTerms(element)) : result;
}
//#endregion
//#region src/components/AddChildFeature.tsx
function AddChildFeature({ changeManager, handleClose, session, sourceAssemblyId, sourceFeature }) {
	const [end, setEnd] = (0, react.useState)(String(sourceFeature.max));
	const [start, setStart] = (0, react.useState)(String(sourceFeature.min + 1));
	const [type, setType] = (0, react.useState)("");
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const [typeWarningText, setTypeWarningText] = (0, react.useState)("");
	async function fetchValidTerms(parentFeature, ontologyStore, _signal) {
		const terms = await fetchValidDescendantTerms(parentFeature, ontologyStore, _signal);
		if (!terms) {
			setTypeWarningText(`Type "${parentFeature?.type}" does not have any children in the ontology`);
			return;
		}
		return terms;
	}
	function onSubmit(event) {
		event.preventDefault();
		setErrorMessage("");
		const _id = new bson_objectid.default().toHexString();
		const addedFeature = {
			_id,
			refSeq: sourceFeature.refSeq,
			min: Number(start) - 1,
			max: Number(end),
			type
		};
		if (sourceFeature.strand) addedFeature.strand = sourceFeature.strand;
		const change = new _apollo_annotation_shared.AddFeatureChange({
			changedIds: [sourceFeature._id],
			typeName: "AddFeatureChange",
			assembly: sourceAssemblyId,
			addedFeature,
			parentFeatureId: sourceFeature._id
		});
		changeManager.submit(change).then(() => {
			session.apolloSetSelectedFeature(_id);
		});
		handleClose();
		event.preventDefault();
	}
	function handleChangeType(newType) {
		setErrorMessage("");
		setType(newType);
	}
	const error = Number(end) <= Number(start);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Add new child feature",
		handleClose,
		maxWidth: false,
		"data-testid": "add-feature-dialog",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			onSubmit,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, {
				style: {
					display: "flex",
					flexDirection: "column"
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
						margin: "dense",
						id: "start",
						label: "Start",
						type: "number",
						fullWidth: true,
						variant: "outlined",
						value: start,
						onChange: (e) => {
							setStart(e.target.value);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
						margin: "dense",
						id: "end",
						label: "End",
						type: "number",
						fullWidth: true,
						variant: "outlined",
						value: end,
						onChange: (e) => {
							setEnd(e.target.value);
						},
						error,
						helperText: error ? "\"End\" must be greater than \"Start\"" : null
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(OntologyTermAutocomplete, {
						session,
						ontologyName: "Sequence Ontology",
						style: { width: 170 },
						value: type,
						filterTerms: isOntologyClass,
						fetchValidTerms: fetchValidTerms.bind(null, sourceFeature),
						renderInput: (params) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
							...params,
							label: "Type",
							variant: "outlined",
							fullWidth: true,
							error: Boolean(typeWarningText),
							helperText: typeWarningText
						}),
						onChange: (oldValue, newValue) => {
							if (newValue) handleChangeType(newValue);
						}
					})
				]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "contained",
				type: "submit",
				disabled: error || !(start && end && type),
				children: "Submit"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "submit",
				onClick: handleClose,
				children: "Cancel"
			})] })]
		}), errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
			color: "error",
			children: errorMessage
		}) }) : null]
	});
}
//#endregion
//#region src/components/ColorFeature.tsx
const PRESET_COLORS = [
	"#cc79a7",
	"#d65e00",
	"#e69f00",
	"#f0e442",
	"#56b3e9",
	"#0072b2",
	"#009e73"
];
function ColorFeature({ changeManager, handleClose, sourceAssemblyId, sourceFeature }) {
	const existingColor = sourceFeature.attributes.get("apollo_color")?.[0];
	const [color, setColor] = (0, react.useState)(existingColor ?? PRESET_COLORS[0]);
	async function onSubmit(event) {
		event.preventDefault();
		if (sourceFeature.attributes.get("apollo_color")?.[0] === color) {
			handleClose();
			return;
		}
		const oldAttributes = (0, _jbrowse_mobx_state_tree.getSnapshot)(sourceFeature.attributes);
		const change = new _apollo_annotation_shared.FeatureAttributeChange({
			changedIds: [sourceFeature._id],
			typeName: "FeatureAttributeChange",
			assembly: sourceAssemblyId,
			featureId: sourceFeature._id,
			oldAttributes,
			newAttributes: {
				...oldAttributes,
				apollo_color: [color]
			}
		});
		await changeManager.submit(change);
		handleClose();
	}
	async function onRemove() {
		const oldAttributes = (0, _jbrowse_mobx_state_tree.getSnapshot)(sourceFeature.attributes);
		const { apollo_color: _removed, ...newAttributes } = oldAttributes;
		const change = new _apollo_annotation_shared.FeatureAttributeChange({
			changedIds: [sourceFeature._id],
			typeName: "FeatureAttributeChange",
			assembly: sourceAssemblyId,
			featureId: sourceFeature._id,
			oldAttributes,
			newAttributes
		});
		await changeManager.submit(change);
		handleClose();
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Dialog$1, {
		open: true,
		title: "Color feature",
		handleClose,
		maxWidth: false,
		"data-testid": "color-feature",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			onSubmit: (event) => {
				onSubmit(event);
			},
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, {
				style: {
					display: "flex",
					flexDirection: "column"
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Choose a color for this feature." }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							display: "flex",
							gap: 8,
							marginTop: 8
						},
						children: PRESET_COLORS.map((preset) => {
							const selected = color.toLowerCase() === preset;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": preset,
								"aria-pressed": selected,
								onClick: () => {
									setColor(preset);
								},
								style: {
									width: 32,
									height: 32,
									padding: 0,
									borderRadius: 4,
									border: "1px solid rgba(0, 0, 0, 0.3)",
									outline: selected ? "2px solid currentColor" : "none",
									outlineOffset: 2,
									backgroundColor: preset,
									cursor: "pointer"
								}
							}, preset);
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 8,
							marginTop: 16
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
							htmlFor: "color-feature-custom",
							children: "Custom:"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							id: "color-feature-custom",
							type: "color",
							value: color,
							onChange: (event) => {
								setColor(event.target.value);
							}
						})]
					})
				]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
					variant: "contained",
					type: "submit",
					children: "Submit"
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
					variant: "outlined",
					color: "error",
					type: "button",
					disabled: existingColor === void 0,
					onClick: () => {
						onRemove();
					},
					children: "Remove color"
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
					variant: "outlined",
					type: "button",
					onClick: handleClose,
					children: "Cancel"
				})
			] })]
		})
	});
}
//#endregion
//#region src/components/CopyFeature.tsx
/**
* Recursively assign new IDs to a feature
* @param feature - Parent feature
* @param featureIds -
*/
function generateNewIds(feature, featureIds) {
	const newId = new bson_objectid.default().toHexString();
	featureIds.push(newId);
	const children = {};
	if (feature.children) for (const child of Object.values(feature.children)) {
		const newChild = generateNewIds(child, featureIds);
		children[newChild._id] = newChild;
	}
	const referenceSeq = typeof feature.refSeq === "string" ? feature.refSeq : feature.refSeq.toHexString();
	return {
		...feature,
		refSeq: referenceSeq,
		children: feature.children && children,
		_id: newId
	};
}
function CopyFeature({ changeManager, handleClose, session, sourceAssemblyId, sourceFeature }) {
	const { assemblyManager } = session;
	const assemblies = assemblyManager.assemblyList;
	const [selectedAssemblyId, setSelectedAssemblyId] = (0, react.useState)(assemblies.find((a) => a.name !== sourceAssemblyId)?.name);
	const [refNames, setRefNames] = (0, react.useState)([]);
	const [selectedRefSeqId, setSelectedRefSeqId] = (0, react.useState)("");
	const [start, setStart] = (0, react.useState)(sourceFeature.min);
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	function handleChangeAssembly(e) {
		setSelectedAssemblyId(e.target.value);
	}
	(0, react.useEffect)(() => {
		async function getRefNames() {
			setSelectedRefSeqId("");
			if (!selectedAssemblyId) {
				setErrorMessage("No assemblies to copy to");
				return;
			}
			const assembly = await assemblyManager.waitForAssembly(selectedAssemblyId);
			if (!assembly) return;
			const { refNameAliases } = assembly;
			if (!refNameAliases) return;
			const newRefNames = [...Object.entries(refNameAliases)].filter(([id, refName]) => id !== refName).map(([id, refName]) => ({
				_id: id,
				name: refName
			}));
			setRefNames(newRefNames);
			setSelectedRefSeqId(newRefNames[0]?._id || "");
		}
		getRefNames().catch((error) => {
			setErrorMessage(String(error));
		});
	}, [selectedAssemblyId, assemblyManager]);
	function handleChangeRefSeq(e) {
		const refSeq = e.target.value;
		setSelectedRefSeqId(refSeq);
	}
	async function onSubmit(event) {
		if (!selectedAssemblyId) return;
		event.preventDefault();
		setErrorMessage("");
		const featureLength = sourceFeature.length;
		const assembly = await assemblyManager.waitForAssembly(selectedAssemblyId);
		if (!assembly) {
			setErrorMessage(`Assembly not found: ${selectedAssemblyId}.`);
			return;
		}
		const canonicalRefName = assembly.getCanonicalRefName(selectedRefSeqId);
		const region = assembly.regions?.find((r) => r.refName === canonicalRefName);
		if (!region) {
			setErrorMessage(`RefSeq not found: ${selectedRefSeqId}.`);
			return;
		}
		const newEnd = start + featureLength;
		if (newEnd > region.end) {
			setErrorMessage(`Feature would extend beyond the bounds of the selected reference sequence. (Feature would end at ${newEnd}, but reference sequence ends at ${region.end})`);
			return;
		}
		if (start < region.start) {
			setErrorMessage(`Reference sequence starts at ${region.start}, feature cannot start before that.`);
			return;
		}
		const featureIds = [];
		const newFeatureLine = generateNewIds((0, _jbrowse_mobx_state_tree.getSnapshot)(sourceFeature), featureIds);
		const attributeMap = { ...newFeatureLine.attributes };
		if ("Parent" in attributeMap) delete attributeMap.Parent;
		newFeatureLine.refSeq = selectedRefSeqId;
		const locationMove = start - newFeatureLine.min;
		newFeatureLine.min = start;
		newFeatureLine.max = start + featureLength;
		const updatedChildren = updateRefSeqStartEnd(newFeatureLine, locationMove);
		const change = new _apollo_annotation_shared.AddFeatureChange({
			changedIds: [newFeatureLine._id],
			typeName: "AddFeatureChange",
			assembly: selectedAssemblyId,
			addedFeature: {
				_id: newFeatureLine._id,
				refSeq: newFeatureLine.refSeq,
				min: newFeatureLine.min,
				max: newFeatureLine.max,
				type: newFeatureLine.type,
				children: updatedChildren.children,
				attributes: attributeMap,
				strand: newFeatureLine.strand
			},
			copyFeature: true,
			allIds: featureIds
		});
		changeManager.submit(change).then(() => {
			session.apolloSetSelectedFeature(newFeatureLine._id);
		});
		handleClose();
		event.preventDefault();
	}
	/**
	* Recursively loop children and update refSeq, start, and end values
	* @param feature - parent feature
	* @param locationMove - how much location has been moved from original
	* @returns
	*/
	function updateRefSeqStartEnd(feature, locationMove) {
		const children = {};
		if (feature.children) for (const child of Object.values(feature.children)) {
			const newChild = updateRefSeqStartEnd(child, locationMove);
			newChild.refSeq = selectedRefSeqId;
			newChild.min = newChild.min + locationMove;
			newChild.max = newChild.max + locationMove;
			children[newChild._id] = newChild;
		}
		const refSeq = typeof feature.refSeq === "string" ? feature.refSeq : feature.refSeq.toHexString();
		const id = typeof feature._id === "string" ? feature._id : feature._id.toHexString();
		return {
			...feature,
			refSeq,
			children: feature.children && children,
			_id: id
		};
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Copy features and annotations",
		handleClose,
		maxWidth: false,
		"data-testid": "copy-feature",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			onSubmit,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, {
				style: {
					display: "flex",
					flexDirection: "column"
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Target assembly" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Select, {
						labelId: "label",
						value: selectedAssemblyId,
						onChange: handleChangeAssembly,
						children: assemblies.filter((option) => option.name !== sourceAssemblyId).map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, {
							value: option.name,
							children: (0, _jbrowse_core_configuration.readConfObject)(option, "displayName")
						}, option.name))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Target reference sequence" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Select, {
						labelId: "label",
						value: selectedRefSeqId,
						onChange: handleChangeRefSeq,
						children: refNames.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, {
							value: option._id,
							children: option.name
						}, option._id))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Start position in target reference sequence" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
						margin: "dense",
						type: "number",
						fullWidth: true,
						variant: "outlined",
						value: start,
						onChange: (e) => {
							setStart(Number(e.target.value));
						}
					})
				]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				disabled: !selectedAssemblyId || !selectedRefSeqId || !start,
				variant: "contained",
				type: "submit",
				children: "Submit"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "submit",
				onClick: handleClose,
				children: "Cancel"
			})] })]
		}), errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
			color: "error",
			children: errorMessage
		}) }) : null]
	});
}
//#endregion
//#region src/components/DeleteFeature.tsx
function lumpLocationChanges(changes, assembly) {
	if (changes.length === 0) return;
	const locationStartChange = new _apollo_annotation_shared.LocationStartChange({
		typeName: "LocationStartChange",
		changedIds: [],
		changes: [],
		assembly
	});
	const locationEndChange = new _apollo_annotation_shared.LocationEndChange({
		typeName: "LocationEndChange",
		changedIds: [],
		changes: [],
		assembly
	});
	for (const change of changes) {
		if (change.typeName === "LocationStartChange") {
			locationStartChange.changedIds.push(change.changedId);
			locationStartChange.changes.push({
				featureId: change.featureId,
				oldStart: change.oldLocation,
				newStart: change.newLocation
			});
		}
		if (change.typeName === "LocationEndChange") {
			locationEndChange.changedIds.push(change.changedId);
			locationEndChange.changes.push({
				featureId: change.featureId,
				oldEnd: change.oldLocation,
				newEnd: change.newLocation
			});
		}
	}
	if (locationStartChange.changedIds.length > 0 && locationEndChange.changedIds.length === 0) return locationStartChange;
	if (locationEndChange.changedIds.length > 0 && locationStartChange.changedIds.length === 0) return locationEndChange;
	throw new Error("Unexpected list of changes");
}
function DeleteFeature({ changeManager, handleClose, selectedFeature, session, setSelectedFeature, sourceAssemblyId, sourceFeature }) {
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const { ontologyManager } = session.apolloDataStore;
	const { featureTypeOntology } = ontologyManager;
	function trimCDS(sourceFeature) {
		if (!featureTypeOntology) return;
		if (!featureTypeOntology.isTypeOf(sourceFeature.type, "exon")) return;
		if (!sourceFeature.parent?.cdsLocations || sourceFeature.parent.cdsLocations.length === 0 || sourceFeature.parent.cdsLocations[0].length === 0) return;
		if (!sourceFeature.parent.children) throw new Error("Unable to find parent of CDS");
		if (sourceFeature.parent.cdsLocations.length != 1) throw new Error("Unable to handle a transcript with multiple CDSs");
		const cdsLocations = (sourceFeature.parent.cdsLocations.at(0) ?? []).sort(({ min: a }, { min: b }) => a - b);
		let cdsFeature;
		for (const child of sourceFeature.parent.children.values()) if (child.type === cdsLocations[0].type) {
			cdsFeature = child;
			break;
		}
		if (!cdsFeature) throw new Error("Unable to find CDS");
		const cdsStart = cdsLocations[0].min;
		const cdsEnd = cdsLocations[cdsLocations.length - 1].max;
		if (sourceFeature.min > cdsStart && sourceFeature.max < cdsEnd || sourceFeature.max < cdsStart || sourceFeature.min > cdsEnd) return;
		if (sourceFeature.min <= cdsStart && sourceFeature.max >= cdsEnd) return new _apollo_annotation_shared.DeleteFeatureChange({
			changedIds: [cdsFeature._id],
			typeName: "DeleteFeatureChange",
			assembly: sourceAssemblyId,
			changes: [{
				deletedFeature: (0, _jbrowse_mobx_state_tree.getSnapshot)(cdsFeature),
				parentFeatureId: cdsFeature.parent?._id
			}]
		});
		if (sourceFeature.min <= cdsStart && sourceFeature.max > cdsStart) {
			let newCdsStart;
			for (const cdsLocation of cdsLocations) if (cdsLocation.min > sourceFeature.max) {
				newCdsStart = cdsLocation.min;
				break;
			}
			if (!newCdsStart) throw new Error("Error setting new CDS start");
			return {
				typeName: "LocationStartChange",
				changedId: cdsFeature._id,
				featureId: cdsFeature._id,
				oldLocation: cdsFeature.min,
				newLocation: newCdsStart
			};
		}
		if (sourceFeature.min < cdsEnd && sourceFeature.max >= cdsEnd) {
			let newCdsEnd;
			for (const cdsLocation of cdsLocations.reverse()) if (cdsLocation.max < sourceFeature.min) {
				newCdsEnd = cdsLocation.max;
				break;
			}
			if (!newCdsEnd) throw new Error("Error setting new CDS end");
			return {
				typeName: "LocationEndChange",
				changedId: cdsFeature._id,
				featureId: cdsFeature._id,
				oldLocation: cdsFeature.max,
				newLocation: newCdsEnd
			};
		}
		throw new Error("Unexpected relationship between exon and CDS");
	}
	function trimParent(featureToDelete) {
		if (!featureToDelete.parent?.children || featureToDelete.parent.children.size === 1) return;
		const childrenByStart = [];
		for (const x of featureToDelete.parent.children.values()) if (!featureTypeOntology?.isTypeOf(x.type, "CDS")) childrenByStart.push(x);
		childrenByStart.sort((a, b) => a.min - b.min);
		const childrenByEnd = [];
		for (const x of featureToDelete.parent.children.values()) if (!featureTypeOntology?.isTypeOf(x.type, "CDS")) childrenByEnd.push(x);
		childrenByEnd.sort((a, b) => b.max - a.max);
		if (featureToDelete.min === childrenByStart[0].min) {
			let newParentFeatureStart;
			for (const child of childrenByStart) if (child._id !== featureToDelete._id && child.min >= featureToDelete.min) {
				newParentFeatureStart = child.min;
				break;
			}
			if (newParentFeatureStart && newParentFeatureStart != featureToDelete.parent.min) return {
				typeName: "LocationStartChange",
				changedId: featureToDelete.parent._id,
				featureId: featureToDelete.parent._id,
				oldLocation: featureToDelete.parent.min,
				newLocation: newParentFeatureStart
			};
		}
		if (featureToDelete.max === childrenByEnd[0].max) {
			let newParentFeatureEnd;
			for (const child of childrenByEnd) if (child._id != featureToDelete._id && child.max <= featureToDelete.max) {
				newParentFeatureEnd = child.max;
				break;
			}
			if (newParentFeatureEnd && newParentFeatureEnd != featureToDelete.parent.max) return {
				typeName: "LocationEndChange",
				changedId: featureToDelete.parent._id,
				featureId: featureToDelete.parent._id,
				oldLocation: featureToDelete.parent.max,
				newLocation: newParentFeatureEnd
			};
		}
	}
	async function onSubmit(event) {
		event.preventDefault();
		setErrorMessage("");
		if (selectedFeature?._id === sourceFeature._id) setSelectedFeature();
		if (featureTypeOntology) await Promise.all([
			"transcript",
			"pseudogenic_transcript",
			"exon",
			"CDS"
		].map((type) => featureTypeOntology.loadEquivalentTypes(type)));
		const locationChanges = [];
		const deleteChanges = new _apollo_annotation_shared.DeleteFeatureChange({
			changedIds: [sourceFeature._id],
			typeName: "DeleteFeatureChange",
			assembly: sourceAssemblyId,
			changes: [{
				deletedFeature: (0, _jbrowse_mobx_state_tree.getSnapshot)(sourceFeature),
				parentFeatureId: sourceFeature.parent?._id
			}]
		});
		if (featureTypeOntology && (featureTypeOntology.isTypeOf(sourceFeature.type, "transcript") || featureTypeOntology.isTypeOf(sourceFeature.type, "pseudogenic_transcript"))) {
			const geneChange = trimParent(sourceFeature);
			if (geneChange) locationChanges.push(geneChange);
		}
		if (featureTypeOntology?.isTypeOf(sourceFeature.type, "exon")) {
			const cdsChange = trimCDS(sourceFeature);
			if (cdsChange) {
				if (cdsChange.typeName === "DeleteFeatureChange") {
					deleteChanges.changedIds.push(...cdsChange.changedIds);
					deleteChanges.changes.push(...cdsChange.changes);
				} else locationChanges.push(cdsChange);
			}
			const txChange = trimParent(sourceFeature);
			if (txChange) {
				locationChanges.push(txChange);
				const gene = sourceFeature.parent?.parent;
				if (gene?.children) {
					if (txChange.typeName === "LocationStartChange") {
						let newGeneStart = txChange.newLocation;
						for (const [, tx] of gene.children) if (tx._id != txChange.featureId && tx.min < newGeneStart) newGeneStart = tx.min;
						if (newGeneStart != gene.min) locationChanges.push({
							typeName: txChange.typeName,
							changedId: gene._id,
							featureId: gene._id,
							oldLocation: gene.min,
							newLocation: newGeneStart
						});
					} else {
						let newGeneEnd = txChange.newLocation;
						for (const [, tx] of gene.children) if (tx._id != txChange.featureId && tx.max > newGeneEnd) newGeneEnd = tx.max;
						if (newGeneEnd != gene.max) locationChanges.push({
							typeName: txChange.typeName,
							changedId: gene._id,
							featureId: gene._id,
							oldLocation: gene.max,
							newLocation: newGeneEnd
						});
					}
				}
			}
		}
		const lumpedLocChanges = lumpLocationChanges(locationChanges, sourceAssemblyId);
		await changeManager.submit(deleteChanges);
		if (lumpedLocChanges) await changeManager.submit(lumpedLocChanges);
		handleClose();
		event.preventDefault();
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Delete feature",
		handleClose,
		maxWidth: false,
		"data-testid": "delete-feature",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			onSubmit: (event) => {
				onSubmit(event);
			},
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, {
				style: {
					display: "flex",
					flexDirection: "column"
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Are you sure you want to delete the selected feature?" })
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "contained",
				type: "submit",
				children: "Yes"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "submit",
				onClick: handleClose,
				children: "Cancel"
			})] })]
		}), errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
			color: "error",
			children: errorMessage
		}) }) : null]
	});
}
//#endregion
//#region src/util/glyphUtils.ts
function selectFeatureAndOpenWidget(stateModel, feature) {
	if (stateModel.apolloDragging) return;
	stateModel.setSelectedFeature(feature);
	const { session } = stateModel;
	const { apolloDataStore } = session;
	const { featureTypeOntology } = apolloDataStore.ontologyManager;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	let containsCDSOrExon = false;
	for (const [, child] of feature.children ?? []) if (featureTypeOntology.isTypeOf(child.type, "CDS") || featureTypeOntology.isTypeOf(child.type, "exon")) {
		containsCDSOrExon = true;
		break;
	}
	if ((featureTypeOntology.isTypeOf(feature.type, "transcript") || featureTypeOntology.isTypeOf(feature.type, "pseudogenic_transcript")) && containsCDSOrExon) stateModel.showFeatureDetailsWidget(feature, ["ApolloTranscriptDetails", "apolloTranscriptDetails"]);
	else stateModel.showFeatureDetailsWidget(feature);
}
function isGeneFeature(feature, session) {
	const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	return featureTypeOntology.isTypeOf(feature.type, "gene") || featureTypeOntology.isTypeOf(feature.type, "pseudogene");
}
function isTranscriptFeature(feature, session) {
	const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	return featureTypeOntology.isTypeOf(feature.type, "transcript") || featureTypeOntology.isTypeOf(feature.type, "pseudogenic_transcript");
}
function isExonFeature(feature, session) {
	const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	return featureTypeOntology.isTypeOf(feature.type, "exon");
}
function isCDSFeature(feature, session) {
	const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	return featureTypeOntology.isTypeOf(feature.type, "CDS");
}
function looksLikeGene(feature, session) {
	const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	const children = feature.children;
	if (!children?.size) return false;
	if (!isGeneFeature(feature, session)) return false;
	for (const [, child] of children) if (isTranscriptFeature(child, session)) {
		const { children: grandChildren } = child;
		if (!grandChildren?.size) return false;
		return [...grandChildren.values()].some((grandchild) => isExonFeature(grandchild, session));
	}
	return false;
}
function getAdjacentExons(currentExon, display) {
	if (!currentExon.parent) return {
		upstream: void 0,
		downstream: void 0
	};
	const transcript = currentExon.parent;
	if (!transcript.children) throw new Error(`Error getting children of ${transcript._id}`);
	const { featureTypeOntology } = display.session.apolloDataStore.ontologyManager;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	let exons = [];
	for (const [, child] of transcript.children) if (featureTypeOntology.isTypeOf(child.type, "exon")) exons.push(child);
	const adjacentExons = {
		upstream: void 0,
		downstream: void 0
	};
	exons = exons.sort((a, b) => a.min < b.min ? -1 : 1);
	for (const exon of exons) if (exon.min > currentExon.max) {
		adjacentExons.downstream = exon;
		break;
	}
	exons = exons.sort((a, b) => a.min > b.min ? -1 : 1);
	for (const exon of exons) if (exon.max < currentExon.min) {
		adjacentExons.upstream = exon;
		break;
	}
	if (transcript.strand === -1) {
		const newUpstream = adjacentExons.downstream;
		adjacentExons.downstream = adjacentExons.upstream;
		adjacentExons.upstream = newUpstream;
	}
	return adjacentExons;
}
function getStreamIcon(strand, isUpstream, isFlipped) {
	let icon = _mui_icons_material_SkipNextRounded.default;
	if (strand === -1) icon = _mui_icons_material_SkipPreviousRounded.default;
	if (isUpstream) icon = icon === _mui_icons_material_SkipPreviousRounded.default ? _mui_icons_material_SkipNextRounded.default : _mui_icons_material_SkipPreviousRounded.default;
	if (isFlipped) icon = icon === _mui_icons_material_SkipPreviousRounded.default ? _mui_icons_material_SkipNextRounded.default : _mui_icons_material_SkipPreviousRounded.default;
	return icon;
}
function getMinAndMaxPx(feature, refName, regionNumber, lgv) {
	const minPxInfo = lgv.bpToPx({
		refName,
		coord: feature.min,
		regionNumber
	});
	const maxPxInfo = lgv.bpToPx({
		refName,
		coord: feature.max,
		regionNumber
	});
	if (minPxInfo === void 0 || maxPxInfo === void 0) return;
	const { offsetPx } = lgv;
	return [minPxInfo.offsetPx - offsetPx, maxPxInfo.offsetPx - offsetPx];
}
function getOverlappingEdge(feature, x, minMax) {
	const [minPx, maxPx] = minMax;
	if (Math.abs(maxPx - minPx) < 8) return;
	if (Math.abs(minPx - x) < 4) return {
		feature,
		edge: "min"
	};
	if (Math.abs(maxPx - x) < 4) return {
		feature,
		edge: "max"
	};
}
function isSelectedFeature(feature, selectedFeature) {
	return feature._id === selectedFeature?._id;
}
function makeFeatureLabel(feature) {
	let name;
	if (feature.attributes.get("gff_name")) name = feature.attributes.get("gff_name")?.join(",");
	else if (feature.attributes.get("gff_id")) name = feature.attributes.get("gff_id")?.join(",");
	else name = feature._id;
	const coords = `(${(feature.min + 1).toLocaleString("en")}..${feature.max.toLocaleString("en")})`;
	const maxLen = 60;
	if (name && name.length + coords.length > 65) {
		const trim = maxLen - coords.length;
		name = trim > 0 ? name.slice(0, trim) : "";
		name = `${name}[...]`;
	}
	return `${name} ${coords}`;
}
function getContextMenuItemsForFeature(display, sourceFeature) {
	const { apolloInternetAccount: internetAccount, changeManager, regions, selectedFeature, session } = display;
	const menuItems = [];
	const role = internetAccount ? internetAccount.role : "admin";
	const readOnly = !(role && ["admin", "user"].includes(role));
	const [region] = regions;
	const sourceAssemblyId = display.getAssemblyId(region.assemblyName);
	const currentAssemblyId = display.getAssemblyId(region.assemblyName);
	menuItems.push({
		label: makeFeatureLabel(sourceFeature),
		type: "subHeader"
	}, {
		label: "Add child feature",
		disabled: readOnly,
		onClick: () => {
			session.queueDialog((doneCallback) => [AddChildFeature, {
				session,
				handleClose: () => {
					doneCallback();
				},
				changeManager,
				sourceFeature,
				sourceAssemblyId,
				internetAccount
			}]);
		}
	}, {
		label: "Copy features and annotations",
		disabled: readOnly,
		onClick: () => {
			session.queueDialog((doneCallback) => [CopyFeature, {
				session,
				handleClose: () => {
					doneCallback();
				},
				changeManager,
				sourceFeature,
				sourceAssemblyId: currentAssemblyId
			}]);
		}
	}, {
		label: "Delete feature",
		disabled: readOnly,
		onClick: () => {
			session.queueDialog((doneCallback) => [DeleteFeature, {
				session,
				handleClose: () => {
					doneCallback();
				},
				changeManager,
				sourceFeature,
				sourceAssemblyId: currentAssemblyId,
				selectedFeature,
				setSelectedFeature: (feature) => {
					display.setSelectedFeature(feature);
				}
			}]);
		}
	}, {
		label: "Color feature",
		disabled: readOnly,
		onClick: () => {
			session.queueDialog((doneCallback) => [ColorFeature, {
				session,
				handleClose: () => {
					doneCallback();
				},
				changeManager,
				sourceFeature,
				sourceAssemblyId: currentAssemblyId
			}]);
		}
	});
	if ((0, _jbrowse_core_util.isSessionModelWithWidgets)(session)) menuItems.push({
		label: "Open feature details",
		onClick: () => {
			const apolloGeneWidget = session.addWidget("ApolloFeatureDetailsWidget", "apolloFeatureDetailsWidget", {
				feature: sourceFeature,
				assembly: currentAssemblyId,
				refName: region.refName
			});
			session.showWidget(apolloGeneWidget);
		}
	});
	return menuItems;
}
function navToFeatureCenter(feature, paddingPct, refSeqLength) {
	const paddingBp = (feature.max - feature.min) * paddingPct;
	const start = Math.max(feature.min - paddingBp, 1);
	const end = Math.min(feature.max + paddingBp, refSeqLength);
	return {
		refName: feature.refSeq,
		start,
		end
	};
}
//#endregion
//#region src/util/mouseEventsUtils.ts
function expandFeatures(feature, newLocation, edge) {
	const changes = [{
		featureId: feature._id,
		oldLocation: feature[edge],
		newLocation
	}];
	const { parent } = feature;
	if (parent && (edge === "min" && parent[edge] > newLocation || edge === "max" && parent[edge] < newLocation)) changes.push(...expandFeatures(parent, newLocation, edge));
	return changes;
}
function shrinkFeatures(feature, newLocation, edge, shrinkParent, childIdToSkip) {
	const featureId = feature._id;
	const changes = [{
		featureId,
		oldLocation: feature[edge],
		newLocation
	}];
	const { parent, children } = feature;
	if (children) for (const [, child] of children) {
		if (child._id === childIdToSkip) continue;
		if (edge === "min" && child[edge] < newLocation || edge === "max" && child[edge] > newLocation) changes.push(...shrinkFeatures(child, newLocation, edge, shrinkParent));
	}
	if (parent && shrinkParent) {
		const siblings = [];
		if (parent.children) for (const [, c] of parent.children) {
			if (c._id === featureId) continue;
			siblings.push(c);
		}
		if (siblings.length === 0) changes.push(...shrinkFeatures(parent, newLocation, edge, shrinkParent, featureId));
		else {
			const oldLocation = parent[edge];
			const boundedLocation = Math[edge](...siblings.map((s) => s[edge]), newLocation);
			if (boundedLocation !== oldLocation) changes.push(...shrinkFeatures(parent, boundedLocation, edge, shrinkParent, featureId));
		}
	}
	return changes;
}
function getPropagatedLocationChanges(feature, newLocation, edge, shrinkParent = false) {
	const oldLocation = feature[edge];
	if (newLocation === oldLocation) throw new Error(`New and existing locations are the same: "${newLocation}"`);
	if (edge === "min") {
		if (newLocation > oldLocation) return shrinkFeatures(feature, newLocation, edge, shrinkParent);
		return expandFeatures(feature, newLocation, edge);
	}
	if (newLocation < oldLocation) return shrinkFeatures(feature, newLocation, edge, shrinkParent);
	return expandFeatures(feature, newLocation, edge);
}
function isMousePositionWithFeature(mousePosition) {
	return "feature" in mousePosition;
}
function getMousePosition$1(event, lgv) {
	const canvas = event.currentTarget;
	const { clientX, clientY } = event;
	const { left, top } = canvas.getBoundingClientRect();
	const x = clientX - left;
	const y = clientY - top;
	const { coord: bp, index: regionNumber, refName } = lgv.pxToBp(x);
	return {
		x,
		y,
		refName,
		bp,
		regionNumber
	};
}
//#endregion
//#region src/util/index.ts
async function createFetchErrorMessage(response, additionalText) {
	let errorMessage;
	try {
		errorMessage = await response.text();
	} catch {
		errorMessage = "";
	}
	const responseMessage = `${response.status} ${response.statusText}${errorMessage ? ` (${errorMessage})` : ""}`;
	return `${additionalText ? `${additionalText} — ` : ""}${responseMessage}`;
}
/** given a session, get our ApolloInternetAccount */
function getApolloInternetAccount(session) {
	const { internetAccounts } = (0, _jbrowse_mobx_state_tree.getParent)(session);
	return internetAccounts.find((ia) => ia.type === "ApolloInternetAccount");
}
//#endregion
//#region src/components/AddAssembly.tsx
const useStyles$14 = (0, tss_react_mui.makeStyles)()((theme) => ({
	accordion: {
		border: `1px solid ${theme.palette.divider}`,
		"&:not(:last-child)": { borderBottom: 0 }
	},
	accordionSummary: { flexDirection: "row-reverse" },
	accordionDetails: {
		padding: theme.spacing(2),
		borderTop: "1px solid rgba(0, 0, 0, .125)"
	},
	radioIcon: { color: theme.palette.tertiary.contrastText },
	dialog: {
		minWidth: 550,
		maxWidth: 800
	}
}));
function checkSumbission(validAsm, sequenceIsEditable, fileType, fastaFile, fastaIndexFile, fastaGziIndexFile, validFastaUrl, validFastaIndexUrl, validFastaGziIndexUrl) {
	if (!validAsm) return false;
	if (sequenceIsEditable && fastaFile) return true;
	if (fileType === "text/x-gff3" && fastaFile) return true;
	if (fastaFile && fastaIndexFile && fastaGziIndexFile) return true;
	if (validFastaUrl && validFastaIndexUrl && validFastaGziIndexUrl) return true;
	return false;
}
function AddAssembly({ changeManager, handleClose, session }) {
	const { classes } = useStyles$14();
	const { internetAccounts } = (0, _jbrowse_mobx_state_tree.getRoot)(session);
	const { notify } = session;
	const apolloInternetAccounts = internetAccounts.filter((ia) => ia.type === "ApolloInternetAccount");
	if (apolloInternetAccounts.length === 0) throw new Error("No Apollo internet account found");
	const [assemblyName, setAssemblyName] = (0, react.useState)("");
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const [validAsm, setValidAsm] = (0, react.useState)(false);
	const [fileType, setFileType] = (0, react.useState)("application/x-bgzip-fasta");
	const [importFeatures, setImportFeatures] = (0, react.useState)(true);
	const [sequenceIsEditable, setSequenceIsEditable] = (0, react.useState)(false);
	const [submitted, setSubmitted] = (0, react.useState)(false);
	const [strict, setStrict] = (0, react.useState)(true);
	const [fastaFile, setFastaFile] = (0, react.useState)(null);
	const [fastaIndexFile, setFastaIndexFile] = (0, react.useState)(null);
	const [fastaGziIndexFile, setFastaGziIndexFile] = (0, react.useState)(null);
	const [fastaUrl, setFastaUrl] = (0, react.useState)("");
	const [fastaIndexUrl, setFastaIndexUrl] = (0, react.useState)("");
	const [fastaGziIndexUrl, setFastaGziIndexUrl] = (0, react.useState)("");
	const [loading, setLoading] = (0, react.useState)(false);
	const [fastaGzipChecked, setFastaGzipChecked] = (0, react.useState)(false);
	const [gff3GzipChecked, setGff3GzipChecked] = (0, react.useState)(false);
	function checkAssemblyName(assembly) {
		const { assemblies } = session;
		if (assemblies.find((asm) => (0, _jbrowse_core_configuration.readConfObject)(asm, "displayName") === assembly)) {
			setValidAsm(false);
			setErrorMessage(`Assembly ${assembly} already exists.`);
		} else {
			setValidAsm(true);
			setErrorMessage("");
		}
	}
	async function uploadFile(file, fileType) {
		const { jobsManager } = session;
		const controller = new AbortController();
		const [{ baseURL, getFetcher }] = apolloInternetAccounts;
		const url = new URL("files", baseURL);
		url.searchParams.set("type", fileType);
		const uri = url.href;
		const formData = new FormData();
		let filename = file.name;
		const isGzip = fileType === "application/x-bgzip-fasta" || fileType === "text/x-fasta" && (!sequenceIsEditable || fastaGzipChecked) || fileType === "text/x-gff3" && gff3GzipChecked;
		if (isGzip && !file.name.toLocaleLowerCase().endsWith(".gz")) filename = `${filename}.gz`;
		else if (!isGzip && file.name.toLocaleLowerCase().endsWith(".gz")) filename = `${filename}.txt`;
		formData.append("file", file, filename);
		formData.append("type", fileType);
		const apolloFetchFile = getFetcher({
			locationType: "UriLocation",
			uri
		});
		const job = {
			name: `UploadAssemblyFile for ${assemblyName}`,
			statusMessage: "Pre-validating",
			progressPct: 0,
			cancelCallback: () => {
				controller.abort(new DOMException(`Canceling adding of assembly "${assemblyName}"`, "AbortError"));
				jobsManager.abortJob(job.name);
			}
		};
		jobsManager.runJob(job);
		jobsManager.update(job.name, `Uploading ${file.name}, this may take awhile`);
		const { signal } = controller;
		const response = await apolloFetchFile(uri, {
			method: "POST",
			body: formData,
			signal
		});
		if (!response.ok) {
			const newErrorMessage = await createFetchErrorMessage(response, "Error when inserting new assembly (while uploading file)");
			jobsManager.abortJob(job.name, newErrorMessage);
			setErrorMessage(newErrorMessage);
			return "";
		}
		const fileId = (await response.json())._id;
		jobsManager.done(job);
		return fileId;
	}
	async function onSubmit(event) {
		event.preventDefault();
		setErrorMessage("");
		setSubmitted(true);
		setLoading(true);
		notify(`Assembly "${assemblyName}" is being added`, "info");
		handleClose();
		event.preventDefault();
		let change;
		if (fileType === "text/x-external") change = new _apollo_annotation_shared.AddAssemblyFromExternalChange({
			typeName: "AddAssemblyFromExternalChange",
			assembly: new bson_objectid.default().toHexString(),
			assemblyName,
			externalLocation: {
				fa: fastaUrl,
				fai: fastaIndexUrl,
				gzi: fastaGziIndexUrl
			}
		});
		else {
			if (!fastaFile) throw new Error("Missing fasta file");
			if (fileType === "text/x-gff3" && importFeatures) {
				const faId = await uploadFile(fastaFile, "text/x-gff3");
				change = new _apollo_annotation_shared.AddAssemblyAndFeaturesFromFileChange({
					typeName: "AddAssemblyAndFeaturesFromFileChange",
					assembly: new bson_objectid.default().toHexString(),
					assemblyName,
					fileIds: { fa: faId },
					parseOptions: { strict }
				});
			} else if (fileType === "text/x-gff3") {
				const faId = await uploadFile(fastaFile, "text/x-gff3");
				change = new _apollo_annotation_shared.AddAssemblyFromFileChange({
					typeName: "AddAssemblyFromFileChange",
					assembly: new bson_objectid.default().toHexString(),
					assemblyName,
					fileIds: { fa: faId }
				});
			} else if (sequenceIsEditable) {
				const faId = await uploadFile(fastaFile, "text/x-fasta");
				change = new _apollo_annotation_shared.AddAssemblyFromFileChange({
					typeName: "AddAssemblyFromFileChange",
					assembly: new bson_objectid.default().toHexString(),
					assemblyName,
					fileIds: { fa: faId }
				});
			} else {
				if (!fastaIndexFile || !fastaGziIndexFile) throw new Error("Missing fasta index files");
				const faId = await uploadFile(fastaFile, "application/x-bgzip-fasta");
				const faiId = await uploadFile(fastaIndexFile, "text/x-fai");
				const gziId = await uploadFile(fastaGziIndexFile, "application/x-gzi");
				change = new _apollo_annotation_shared.AddAssemblyFromFileChange({
					typeName: "AddAssemblyFromFileChange",
					assembly: new bson_objectid.default().toHexString(),
					assemblyName,
					fileIds: {
						fa: faId,
						fai: faiId,
						gzi: gziId
					}
				});
			}
		}
		const [{ internetAccountId }] = apolloInternetAccounts;
		await changeManager.submit(change, {
			internetAccountId,
			updateJobsManager: true
		});
		setSubmitted(false);
		setLoading(false);
	}
	let validFastaUrl = false;
	try {
		const url = new URL(fastaUrl);
		if (url.protocol === "http:" || url.protocol === "https:") validFastaUrl = true;
	} catch {}
	let validFastaIndexUrl = false;
	try {
		const url = new URL(fastaIndexUrl);
		if (url.protocol === "http:" || url.protocol === "https:") validFastaIndexUrl = true;
	} catch {}
	let validFastaGziIndexUrl = false;
	try {
		const url = new URL(fastaGziIndexUrl);
		if (url.protocol === "http:" || url.protocol === "https:") validFastaGziIndexUrl = true;
	} catch {}
	const [expanded, setExpanded] = react.default.useState("panelFastaInput");
	const handleAccordionChange = (panel) => (event, newExpanded) => {
		if (newExpanded) setExpanded(panel);
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		handleClose,
		"data-testid": "add-assembly-dialog",
		title: "Add new assembly",
		maxWidth: false,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			onSubmit,
			"data-testid": "submit-form",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, {
				className: classes.dialog,
				children: [
					loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.LinearProgress, {}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
						margin: "dense",
						id: "name",
						label: "Assembly name",
						type: "TextField",
						fullWidth: true,
						variant: "outlined",
						onChange: (e) => {
							setSubmitted(false);
							setAssemblyName(e.target.value);
							checkAssemblyName(e.target.value);
						},
						disabled: submitted && !errorMessage
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Accordion, {
						disableGutters: true,
						elevation: 0,
						square: true,
						className: classes.accordion,
						expanded: expanded === "panelFastaInput",
						onChange: handleAccordionChange("panelFastaInput"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.AccordionSummary, {
							className: classes.accordionSummary,
							expandIcon: expanded === "panelFastaInput" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_RadioButtonChecked.default, {
								className: classes.radioIcon,
								sx: {
									fontSize: "1.2rem",
									ml: 5
								}
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_RadioButtonUnchecked.default, {
								className: classes.radioIcon,
								sx: {
									fontSize: "1.2rem",
									mr: 5
								}
							}),
							"aria-controls": "panelFastaInputd-content",
							id: "panelFastaInputd-header",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
								component: "span",
								children: "FASTA input"
							})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.AccordionDetails, {
							className: classes.accordionDetails,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.FormGroup, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
									"data-testid": "files-on-url-checkbox",
									control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Checkbox, {
										onChange: () => {
											setFileType(fileType === "text/x-external" ? "application/x-bgzip-fasta" : "text/x-external");
											if (fileType === "text/x-external") setSequenceIsEditable(false);
										},
										checked: fileType === "text/x-external",
										disabled: sequenceIsEditable && fileType !== "text/x-gff3"
									}),
									label: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Box, {
										display: "flex",
										alignItems: "center",
										children: ["Use external URLs", /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Tooltip, {
											title: "Use external URLs to provide FASTA and index files. Does not copy the files to the Apollo collaboration server, so ensure the URLs are stable.",
											placement: "top-start",
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.IconButton, {
												size: "small",
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Info.default, { sx: { fontSize: 18 } })
											})
										})]
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
									"data-testid": "sequence-is-editable-checkbox",
									control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Checkbox, { onChange: () => {
										setSequenceIsEditable(!sequenceIsEditable);
									} }),
									checked: sequenceIsEditable,
									disabled: fileType === "text/x-external",
									label: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Box, {
										display: "flex",
										alignItems: "center",
										children: ["Store sequence in database", /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Tooltip, {
											title: "Enables users to edit the genomic sequence, but comes with performance impacts. Use with care.",
											placement: "top-start",
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.IconButton, {
												size: "small",
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Info.default, { sx: { fontSize: 18 } })
											})
										})]
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
									"data-testid": "fasta-is-gzip-checkbox",
									control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Checkbox, {
										checked: !sequenceIsEditable || fastaGzipChecked,
										onChange: () => {
											if (sequenceIsEditable) setFastaGzipChecked(!fastaGzipChecked);
											else setFastaGzipChecked(true);
										},
										disabled: !sequenceIsEditable
									}),
									label: "FASTA is gzip compressed"
								}),
								fileType === "application/x-bgzip-fasta" || fileType === "text/x-gff3" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Table, {
									size: "small",
									sx: { mt: 2 },
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableBody, { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableRow, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, {
											style: { borderBottomWidth: 0 },
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Box, {
												display: "flex",
												alignItems: "center",
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "FASTA" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Tooltip, {
													title: "Unless \"Store sequence in database\" enabled, FASTA input must be compressed with bgzip and indexed with samtools faidx (or equivalent). Compression is optional for sequences stored in the database.",
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.IconButton, {
														size: "small",
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Info.default, { sx: { fontSize: 18 } })
													})
												})]
											})
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, {
											style: { borderBottomWidth: 0 },
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												"data-testid": "fasta-input-file",
												type: "file",
												onChange: (e) => {
													const file = e.target.files?.item(0);
													if (file) {
														setFastaFile(file);
														if (file.name.endsWith(".gz")) setFastaGzipChecked(true);
													}
												},
												disabled: submitted && !errorMessage
											})
										})] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableRow, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, {
											style: { borderBottomWidth: 0 },
											children: "FASTA index (.fai)"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, {
											style: { borderBottomWidth: 0 },
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												"data-testid": "fai-input-file",
												type: "file",
												onChange: (e) => {
													setFastaIndexFile(e.target.files?.item(0) ?? null);
												},
												disabled: submitted && !errorMessage || sequenceIsEditable
											})
										})] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableRow, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, {
											style: { borderBottomWidth: 0 },
											children: "FASTA binary index (.gzi)"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, {
											style: { borderBottomWidth: 0 },
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												"data-testid": "gzi-input-file",
												type: "file",
												onChange: (e) => {
													setFastaGziIndexFile(e.target.files?.item(0) ?? null);
												},
												disabled: submitted && !errorMessage || sequenceIsEditable
											})
										})] })
									] })
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Table, {
									size: "small",
									sx: { mt: 2 },
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableBody, { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableRow, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, {
											style: { borderBottomWidth: 0 },
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Box, {
												display: "flex",
												alignItems: "center",
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "FASTA" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Tooltip, {
													title: "Remote FASTA input must be compressed with bgzip and indexed with samtools faidx (or equivalent)",
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.IconButton, {
														size: "small",
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Info.default, { sx: { fontSize: 18 } })
													})
												})]
											})
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, {
											style: { borderBottomWidth: 0 },
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
												"data-testid": "fasta-input-url",
												variant: "outlined",
												value: fastaUrl,
												error: !validFastaUrl,
												onChange: (e) => {
													const { value } = e.target;
													setFastaUrl(value);
													setFastaIndexUrl(value ? `${value}.fai` : "");
													setFastaGziIndexUrl(value ? `${value}.gzi` : "");
												},
												disabled: submitted && !errorMessage,
												slotProps: { input: { startAdornment: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.InputAdornment, {
													position: "start",
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Link.default, {})
												}) } }
											})
										})] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableRow, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, {
											style: { borderBottomWidth: 0 },
											children: "FASTA index (.fai)"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, {
											style: { borderBottomWidth: 0 },
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
												"data-testid": "fai-input-url",
												variant: "outlined",
												value: fastaIndexUrl,
												error: !validFastaIndexUrl,
												onChange: (e) => {
													setFastaIndexUrl(e.target.value);
												},
												disabled: submitted && !errorMessage,
												slotProps: { input: { startAdornment: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.InputAdornment, {
													position: "start",
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Link.default, {})
												}) } }
											})
										})] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableRow, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, {
											style: { borderBottomWidth: 0 },
											children: "FASTA binary index (.gzi)"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, {
											style: { borderBottomWidth: 0 },
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
												"data-testid": "gzi-input-url",
												variant: "outlined",
												value: fastaGziIndexUrl,
												error: !validFastaGziIndexUrl,
												onChange: (e) => {
													setFastaGziIndexUrl(e.target.value);
												},
												disabled: submitted && !errorMessage,
												slotProps: { input: { startAdornment: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.InputAdornment, {
													position: "start",
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Link.default, {})
												}) } }
											})
										})] })
									] })
								})
							] })
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Accordion, {
						disableGutters: true,
						elevation: 0,
						square: true,
						className: classes.accordion,
						expanded: expanded === "panelGffInput",
						onChange: handleAccordionChange("panelGffInput"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.AccordionSummary, {
							className: classes.accordionSummary,
							expandIcon: expanded === "panelGffInput" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_RadioButtonChecked.default, {
								className: classes.radioIcon,
								sx: {
									fontSize: "1.2rem",
									ml: 5
								}
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_RadioButtonUnchecked.default, {
								className: classes.radioIcon,
								sx: {
									fontSize: "1.2rem",
									mr: 5
								}
							}),
							"aria-controls": "panelGffInputd-content",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Typography, {
								component: "span",
								children: ["GFF3 input", /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Tooltip, {
									title: "GFF3 must includes FASTA sequences. File can be gzip compressed.",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Info.default, {
										className: classes.radioIcon,
										sx: { fontSize: 18 }
									})
								})]
							})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.AccordionDetails, {
							className: classes.accordionDetails,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Box, {
								style: { marginTop: 20 },
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									"data-testid": "gff3-input-file",
									type: "file",
									disabled: submitted && !errorMessage,
									onChange: (e) => {
										const file = e.target.files?.item(0);
										if (file) {
											setFastaFile(file);
											setFileType("text/x-gff3");
											if (file.name.endsWith(".gz")) setGff3GzipChecked(true);
										}
									}
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.FormGroup, {
									style: { display: "grid" },
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
											control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Checkbox, {
												checked: importFeatures,
												onChange: () => {
													setImportFeatures(!importFeatures);
												},
												disabled: submitted && !errorMessage
											}),
											label: "Load features from GFF3 file"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
											label: "Strict parsing",
											disabled: !importFeatures || submitted && !errorMessage,
											control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Checkbox, {
												checked: strict,
												onChange: (e) => {
													setStrict(e.target.checked);
												}
											})
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormHelperText, { children: "Don't import any features if any lines in the GFF3 are unable to be processed" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
											"data-testid": "gff3-is-gzip-checkbox",
											control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Checkbox, {
												checked: gff3GzipChecked,
												onChange: () => {
													setGff3GzipChecked(!gff3GzipChecked);
												},
												disabled: submitted && !errorMessage
											}),
											label: "GFF3 is gzip compressed"
										})
									]
								})]
							})
						})]
					})
				]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				disabled: !checkSumbission(validAsm, sequenceIsEditable, fileType, fastaFile, fastaIndexFile, fastaGziIndexFile, validFastaUrl, validFastaIndexUrl, validFastaGziIndexUrl) || submitted,
				variant: "contained",
				type: "submit",
				"data-testid": "submit-button",
				children: submitted ? "Submitting..." : "Submit"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "submit",
				onClick: handleClose,
				children: "Cancel"
			})] })]
		}), errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
			color: "error",
			children: errorMessage
		}) }) : null]
	});
}
//#endregion
//#region src/components/AddAssemblyAliases.tsx
const columns$1 = [{
	field: "name",
	headerName: "Assembly Name",
	width: 150,
	editable: false
}, {
	field: "aliases",
	headerName: "Aliases",
	width: 300,
	editable: true
}];
function AddAssemblyAliases({ changeManager, handleClose, session }) {
	const { apolloDataStore } = session;
	const { collaborationServerDriver } = apolloDataStore;
	const rows = collaborationServerDriver.getAssemblies().map((assembly) => {
		return {
			id: assembly.name,
			name: assembly.displayName,
			aliases: assembly.aliases.join(", ")
		};
	});
	const [errorMessage, setErrorMessage] = react.default.useState("");
	const processRowUpdate = (newRow, _oldRow) => {
		const change = new _apollo_annotation_shared.AddAssemblyAliasesChange({
			typeName: "AddAssemblyAliasesChange",
			assembly: newRow.id,
			aliases: newRow.aliases.split(",")
		});
		changeManager.submit(change).catch(() => {
			setErrorMessage("Error submitting change");
		});
		handleClose();
		return newRow;
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Add assembly aliases",
		handleClose,
		maxWidth: "sm",
		"data-testid": "add-assembly-alias",
		fullWidth: true,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, {
			style: {
				display: "flex",
				flexDirection: "column"
			},
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Box, {
				sx: {
					height: 400,
					width: "100%"
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_x_data_grid.DataGrid, {
					rows,
					columns: columns$1,
					initialState: { pagination: { paginationModel: { pageSize: 5 } } },
					pageSizeOptions: [5],
					processRowUpdate,
					disableRowSelectionOnClick: true
				})
			})
		}), errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
			color: "error",
			children: errorMessage
		}) }) : null]
	});
}
//#endregion
//#region src/util/sequenceUtils.ts
const START_CODON = "ATG";
const STOP_CODONS = /* @__PURE__ */ new Set([
	"TAA",
	"TAG",
	"TGA"
]);
function findLongestOrf(sequence) {
	const starts = [
		null,
		null,
		null
	];
	let longest;
	for (let start = 0; start < sequence.length - 2; start++) {
		const codon = sequence.slice(start, start + 3).toUpperCase();
		const frame = start % 3;
		if (codon === START_CODON && starts[frame] === null) starts[frame] = start;
		else if (STOP_CODONS.has(codon)) {
			const inFrameStart = starts[frame];
			if (inFrameStart === null) continue;
			const length = start - inFrameStart;
			if (!longest || longest[1] - longest[0] < length) longest = [inFrameStart, start];
			starts[frame] = null;
		}
	}
	return longest;
}
//#endregion
//#region src/components/AddCodingSequence.tsx
function stitchedToGenomicBound(pos, exons, strand) {
	let cum = 0;
	for (const exon of exons) {
		const len = exon.max - exon.min;
		if (pos <= cum + len) {
			const off = pos - cum;
			return strand === 1 ? exon.min + off : exon.max - off;
		}
		cum += len;
	}
	const last = exons.at(-1);
	if (!last) throw new Error("No exons found");
	return strand === 1 ? last.max : last.min;
}
function AddCodingSequence({ changeManager, handleClose, refName, session, sourceAssemblyId, sourceFeature }) {
	const [method, setMethod] = (0, react.useState)("longest-orf");
	const [minInput, setMinInput] = (0, react.useState)("");
	const [maxInput, setMaxInput] = (0, react.useState)("");
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	async function onSubmit(event) {
		event.preventDefault();
		setErrorMessage("");
		let cdsMin;
		let cdsMax;
		try {
			if (method === "longest-orf") {
				const exonParts = sourceFeature.transcriptExonParts.filter((p) => p.type === "exon");
				if (exonParts.length === 0) {
					setErrorMessage("No exons found in this transcript");
					return;
				}
				const backendDriver = session.apolloDataStore.getBackendDriver(sourceAssemblyId);
				if (!backendDriver) {
					setErrorMessage("No backend driver found for this assembly");
					return;
				}
				let stitchedSequence = "";
				for (const exon of exonParts) {
					const { seq } = await backendDriver.getSequence({
						assemblyName: sourceAssemblyId,
						refName,
						start: exon.min,
						end: exon.max
					});
					stitchedSequence += sourceFeature.strand === -1 ? (0, _jbrowse_core_util.revcom)(seq) : seq;
				}
				const orf = findLongestOrf(stitchedSequence);
				if (!orf) {
					session.notify("No open reading frame found in this transcript", "error");
					handleClose();
					return;
				}
				if ((sourceFeature.strand ?? 1) === 1) {
					cdsMin = stitchedToGenomicBound(orf[0], exonParts, 1);
					cdsMax = stitchedToGenomicBound(orf[1] + 3, exonParts, 1);
				} else {
					cdsMax = stitchedToGenomicBound(orf[0], exonParts, -1);
					cdsMin = stitchedToGenomicBound(orf[1] + 3, exonParts, -1);
				}
			} else {
				cdsMin = Number(minInput) - 1;
				cdsMax = Number(maxInput);
			}
			const _id = new bson_objectid.default().toHexString();
			const addedFeature = {
				_id,
				refSeq: sourceFeature.refSeq,
				min: cdsMin,
				max: cdsMax,
				type: "CDS"
			};
			if (sourceFeature.strand) addedFeature.strand = sourceFeature.strand;
			const change = new _apollo_annotation_shared.AddFeatureChange({
				changedIds: [sourceFeature._id],
				typeName: "AddFeatureChange",
				assembly: sourceAssemblyId,
				addedFeature,
				parentFeatureId: sourceFeature._id
			});
			await changeManager.submit(change);
			session.apolloSetSelectedFeature(_id);
			handleClose();
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
		}
	}
	const manualError = method === "manual" && Boolean(minInput) && Boolean(maxInput) && Number(maxInput) <= Number(minInput);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Add coding sequence",
		handleClose,
		maxWidth: false,
		"data-testid": "add-coding-sequence",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			onSubmit: (event) => {
				onSubmit(event);
			},
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, {
				style: {
					display: "flex",
					flexDirection: "column"
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControl, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.RadioGroup, {
					value: method,
					onChange: (e) => {
						setMethod(e.target.value);
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
						value: "longest-orf",
						control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Radio, {}),
						label: "Calculate longest open reading frame"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
						value: "manual",
						control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Radio, {}),
						label: "Manual"
					})]
				}) }), method === "manual" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
					margin: "dense",
					id: "cds-min",
					label: "Min",
					type: "number",
					fullWidth: true,
					variant: "outlined",
					value: minInput,
					onChange: (e) => {
						setMinInput(e.target.value);
					}
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
					margin: "dense",
					id: "cds-max",
					label: "Max",
					type: "number",
					fullWidth: true,
					variant: "outlined",
					value: maxInput,
					onChange: (e) => {
						setMaxInput(e.target.value);
					},
					error: manualError,
					helperText: manualError ? "\"Max\" must be greater than \"Min\"" : null
				})] }) : null]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "contained",
				type: "submit",
				disabled: method === "manual" ? !(minInput && maxInput) || manualError : false,
				children: "Submit"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "button",
				onClick: handleClose,
				children: "Cancel"
			})] })]
		}), errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
			color: "error",
			children: errorMessage
		}) }) : null]
	});
}
//#endregion
//#region src/BackendDrivers/BackendDriver.ts
var BackendDriver = class {
	clientStore;
	constructor(clientStore) {
		this.clientStore = clientStore;
	}
};
//#endregion
//#region src/BackendDrivers/LocalDriver/db.ts
async function openDb(assemblyName, refNames) {
	const dbName = `Apollo-${assemblyName}`;
	return (0, idb_with_async_ittr.openDB)(dbName, 1, { upgrade(db) {
		const changesStoreName = "changes";
		if (!db.objectStoreNames.contains(changesStoreName)) db.createObjectStore(changesStoreName, { autoIncrement: true });
		for (const refName of refNames) {
			const storeName = `features-${refName}`;
			if (!db.objectStoreNames.contains(storeName)) {
				const store = db.createObjectStore(storeName);
				store.createIndex("min", "min", { unique: false });
				store.createIndex("max", "max", { unique: false });
			}
			const checkStoreName = `checkresults-${refName}`;
			if (!db.objectStoreNames.contains(checkStoreName)) {
				const store = db.createObjectStore(checkStoreName, { keyPath: "_id" });
				store.createIndex("min", "start", { unique: false });
				store.createIndex("max", "end", { unique: false });
				store.createIndex("featureId", "featureId", { unique: false });
			}
		}
	} });
}
//#endregion
//#region src/BackendDrivers/LocalDriver/LocalDriver.ts
var LocalDriver = class extends BackendDriver {
	async getFeatures(region) {
		const { assemblyName, end, refName, start } = region;
		const db = await openDb(assemblyName, (await this.getRegions(assemblyName)).map((r) => r.refName));
		const featureStoreName = `features-${refName}`;
		const checkStoreName = `checkresults-${refName}`;
		const features = [];
		const checkResults = [];
		const tx = db.transaction([featureStoreName, checkStoreName]);
		for await (const cursor of tx.objectStore(featureStoreName).index("min").iterate(IDBKeyRange.upperBound(end, true))) if (cursor.value.max > start) features.push(cursor.value);
		for await (const cursor of tx.objectStore(checkStoreName).index("min").iterate(IDBKeyRange.upperBound(end, true))) if (cursor.value.end > start) checkResults.push(cursor.value);
		return [features, checkResults];
	}
	async getSequence(region) {
		const { assemblyManager } = (0, _jbrowse_core_util.getSession)(this.clientStore);
		const assembly = await assemblyManager.waitForAssembly(region.assemblyName);
		if (!assembly) throw new Error(`Assembly not found: "${region.assemblyName}"`);
		const { configuration } = assembly;
		const { adapter: adapterConf } = configuration.sequence;
		const { pluginManager } = (0, _jbrowse_core_util.getEnv)(this.clientStore);
		const type = pluginManager.getAdapterType(adapterConf.type);
		if (!type) throw new Error(`No adapter found for "${adapterConf.type}"`);
		const seq = await new (await (type.getAdapterClass()))(adapterConf, void 0, pluginManager).getSequence({
			...region,
			refName: assembly.getSeqAdapterRefName(region.refName)
		});
		if (!seq) throw new Error(`Sequence not found: ${JSON.stringify(region)}`);
		return {
			seq,
			refSeq: region.refName
		};
	}
	async getRegions(assemblyName) {
		const { assemblyManager } = (0, _jbrowse_core_util.getSession)(this.clientStore);
		const assembly = await assemblyManager.waitForAssembly(assemblyName);
		if (!assembly) throw new Error(`Assembly not found: "${assemblyName}"`);
		const { regions } = assembly;
		if (!regions) throw new Error(`Assembly not found: "${assemblyName}"`);
		return regions;
	}
	getAssemblies(internetAccountConfigId) {
		return [];
	}
	async getRefNameAliases(assemblyName) {
		const { assemblyManager } = (0, _jbrowse_core_util.getSession)(this.clientStore);
		const assembly = await assemblyManager.waitForAssembly(assemblyName);
		if (!assembly) throw new Error(`Assembly not found: "${assemblyName}"`);
		const { configuration } = assembly;
		const { refNameAliases } = configuration;
		if (!refNameAliases) return [];
		const { pluginManager } = (0, _jbrowse_core_util.getEnv)(this.clientStore);
		const type = pluginManager.getAdapterType(refNameAliases.adapter.type);
		if (!type) throw new Error(`No adapter found for "${refNameAliases.adapter.type}"`);
		return new (await (type.getAdapterClass()))(refNameAliases.adapter, void 0, pluginManager).getRefNameAliases({});
	}
	async submitChange(change, opts) {
		if (!(0, _apollo_annotation_common.isFeatureChange)(change)) return new _apollo_annotation_shared.ValidationResultSet();
		const { assembly, changedIds } = change;
		const refNames = (await this.getRegions(assembly)).map((r) => r.refName);
		const db = await openDb(assembly, refNames);
		const topLevelFeatures = /* @__PURE__ */ new Set();
		const deletedFeatureIds = [];
		const neededRefNames = /* @__PURE__ */ new Set();
		if ((0, _apollo_annotation_shared.isDeleteFeatureChange)(change)) for (const c of change.changes) if (c.parentFeatureId) {
			const feature = this.clientStore.getFeature(c.parentFeatureId);
			if (feature) {
				topLevelFeatures.add(feature.topLevelFeature);
				neededRefNames.add(feature.topLevelFeature.refSeq);
			}
		} else {
			const { refSeq, _id } = c.deletedFeature;
			deletedFeatureIds.push({
				refSeq,
				featureId: _id
			});
			neededRefNames.add(refSeq);
		}
		else for (const changedId of changedIds) {
			const feature = this.clientStore.getFeature(changedId);
			if (feature) {
				topLevelFeatures.add(feature.topLevelFeature);
				neededRefNames.add(feature.refSeq);
			}
		}
		const storeNames = [...neededRefNames].flatMap((r) => [`features-${r}`, `checkresults-${r}`]);
		storeNames.push("changes");
		const tx = db.transaction(storeNames, "readwrite");
		for (const { refSeq, featureId } of deletedFeatureIds) tx.objectStore(`features-${refSeq}`).delete(featureId);
		for (const feature of topLevelFeatures) {
			const snapshot = (0, _jbrowse_mobx_state_tree.getSnapshot)(feature);
			tx.objectStore(`features-${feature.refSeq}`).put(snapshot, feature._id);
		}
		for (const { featureId, refSeq } of deletedFeatureIds) {
			const checkStore = tx.objectStore(`checkresults-${refSeq}`);
			for await (const cursor of checkStore.index("featureId").iterate(featureId)) {
				this.clientStore.deleteCheckResult(cursor.value._id);
				cursor.delete();
			}
		}
		for (const feature of topLevelFeatures) {
			const checkStore = tx.objectStore(`checkresults-${feature.refSeq}`);
			for await (const cursor of checkStore.index("featureId").iterate(feature._id)) {
				this.clientStore.deleteCheckResult(cursor.value._id);
				cursor.delete();
			}
		}
		tx.objectStore("changes").put({
			...change.toJSON(),
			createdAt: /* @__PURE__ */ new Date()
		});
		await tx.done;
		if (topLevelFeatures.size > 0) {
			const checks = [..._apollo_annotation_common.checkRegistry.getChecks().values()];
			const allResults = [];
			for (const feature of topLevelFeatures) {
				const snapshot = (0, _jbrowse_mobx_state_tree.getSnapshot)(feature);
				const getSequence = async (start, end) => {
					return (await this.getSequence({
						assemblyName: assembly,
						refName: feature.refSeq,
						start,
						end
					})).seq;
				};
				for (const check of checks) {
					const results = await check.checkFeature(snapshot, getSequence);
					for (const result of results) allResults.push({
						refSeq: feature.refSeq,
						result,
						topLevelFeatureId: feature._id
					});
				}
			}
			if (allResults.length > 0) {
				const checkStoreNames = refNames.map((r) => `checkresults-${r}`);
				const checkTx = db.transaction(checkStoreNames, "readwrite");
				for (const { refSeq, result, topLevelFeatureId } of allResults) checkTx.objectStore(`checkresults-${refSeq}`).put({
					...result,
					featureId: topLevelFeatureId
				});
				await checkTx.done;
				for (const { result } of allResults) this.clientStore.addCheckResult(result);
			}
		}
		return new _apollo_annotation_shared.ValidationResultSet();
	}
	async searchFeatures(term, assemblies) {
		return [];
	}
	async getCheckResults(assemblyName) {
		const refNames = (await this.getRegions(assemblyName)).map((r) => r.refName);
		const db = await openDb(assemblyName, refNames);
		const checkResults = [];
		const storeNames = refNames.map((r) => `checkresults-${r}`);
		const tx = db.transaction(storeNames);
		for (const storeName of storeNames) for await (const cursor of tx.objectStore(storeName).iterate()) checkResults.push(cursor.value);
		return checkResults;
	}
	async getChanges(assemblyName, opts = {}) {
		const db = await openDb(assemblyName, (await this.getRegions(assemblyName)).map((r) => r.refName));
		let changes = [];
		for await (const cursor of db.transaction("changes").store.iterate()) changes.push({
			sequence: cursor.key,
			...cursor.value
		});
		const { filters } = opts;
		if (filters?.user) {
			const re = new RegExp(filters.user, "i");
			changes = changes.filter((c) => c.user !== void 0 && re.test(c.user));
		}
		if (filters?.typeName) changes = changes.filter((c) => c.typeName === filters.typeName);
		if (filters?.startTime) {
			const start = new Date(filters.startTime).getTime();
			changes = changes.filter((c) => new Date(c.createdAt).getTime() >= start);
		}
		if (filters?.endTime) {
			const end = new Date(filters.endTime).getTime();
			changes = changes.filter((c) => new Date(c.createdAt).getTime() <= end);
		}
		const totalCount = changes.length;
		const sortField = opts.sortField ?? "sequence";
		const direction = (opts.sortOrder ?? "desc") === "asc" ? 1 : -1;
		changes.sort((a, b) => {
			const aVal = a[sortField];
			const bVal = b[sortField];
			if (aVal === bVal) return 0;
			if (aVal === void 0) return 1;
			if (bVal === void 0) return -1;
			return aVal < bVal ? -direction : direction;
		});
		if (opts.page !== void 0 && opts.pageSize !== void 0) {
			const start = opts.page * opts.pageSize;
			changes = changes.slice(start, start + opts.pageSize);
		}
		return {
			changes,
			totalCount
		};
	}
};
//#endregion
//#region src/session/changeHandlers.ts
function isLocalChange(changeName) {
	return changeName in changeHandlers;
}
const changeHandlers = {
	async AddFeatureChange(dataStore, change) {
		const { assembly, changes } = change;
		for (const c of changes) {
			const { addedFeature, parentFeatureId } = c;
			if (parentFeatureId) {
				let parentFeature = dataStore.getFeature(parentFeatureId);
				if (!parentFeature) {
					await dataStore.loadFeatures([{
						assemblyName: assembly,
						refName: addedFeature.refSeq,
						start: addedFeature.min,
						end: addedFeature.max
					}]);
					parentFeature = dataStore.getFeature(parentFeatureId);
					if (!parentFeature) throw new Error(`Could not find parent feature "${parentFeatureId}"`);
				}
				if (!parentFeature.attributes.get("_id")) parentFeature.setAttribute("_id", [parentFeature._id]);
				parentFeature.addChild(addedFeature);
			} else dataStore.addFeature(assembly, addedFeature);
		}
	},
	async DeleteFeatureChange(dataStore, change) {
		for (const c of change.changes) {
			const { deletedFeature, parentFeatureId } = c;
			if (parentFeatureId) {
				const parentFeature = dataStore.getFeature(parentFeatureId);
				if (!parentFeature) throw new Error(`Could not find parent feature "${parentFeatureId}"`);
				parentFeature.deleteChild(deletedFeature._id);
			} else if (dataStore.getFeature(deletedFeature._id)) dataStore.deleteFeature(deletedFeature._id);
		}
	},
	async FeatureAttributeChange(dataStore, change) {
		for (const [idx, changedId] of change.changedIds.entries()) {
			const feature = dataStore.getFeature(changedId);
			if (!feature) throw new Error(`Could not find feature with identifier "${changedId}"`);
			feature.setAttributes(new Map(Object.entries(change.changes[idx].newAttributes)));
		}
	},
	async LocationEndChange(dataStore, change) {
		for (const c of change.changes) {
			const { featureId, newEnd } = c;
			const feature = dataStore.getFeature(featureId);
			if (!feature) throw new Error(`Could not find feature with identifier "${featureId}"`);
			feature.setMax(newEnd);
		}
	},
	async LocationStartChange(dataStore, change) {
		for (const c of change.changes) {
			const { featureId, newStart } = c;
			const feature = dataStore.getFeature(featureId);
			if (!feature) throw new Error(`Could not find feature with identifier "${featureId}"`);
			feature.setMin(newStart);
		}
	},
	async MergeExonsChange(dataStore, change) {
		for (const c of change.changes) {
			const { firstExon, secondExon } = c;
			const mergedExon = dataStore.getFeature(firstExon._id);
			if (!mergedExon) throw new Error(`Could not find feature with identifier "${firstExon._id}"`);
			mergedExon.setMin(Math.min(firstExon.min, secondExon.min));
			mergedExon.setMax(Math.max(firstExon.max, secondExon.max));
			const mrg = mergedExon.attributes.get("merged_with")?.slice() ?? [];
			const mergedWith = (0, _apollo_annotation_shared.stringifyAttributes)((0, _apollo_annotation_shared.attributesToRecords)(secondExon.attributes));
			if (!mrg.includes(mergedWith)) mrg.push(mergedWith);
			mergedExon.setAttribute("merged_with", mrg);
			mergedExon.parent?.deleteChild(secondExon._id);
		}
	},
	async SplitExonChange(dataStore, change) {
		for (const [idx] of change.changedIds.entries()) {
			const { exonToBeSplit, parentFeatureId, upstreamCut, downstreamCut, leftExonId, rightExonId } = change.changes[idx];
			if (!parentFeatureId) throw new Error("TODO: Split exon without parent");
			const [leftExon, rightExon] = change.makeSplitExons(exonToBeSplit, upstreamCut, downstreamCut, leftExonId, rightExonId);
			const parentFeature = dataStore.getFeature(parentFeatureId);
			if (!parentFeature) throw new Error(`Could not find parent feature "${parentFeatureId}"`);
			parentFeature.addChild(leftExon);
			parentFeature.addChild(rightExon);
			if (dataStore.getFeature(exonToBeSplit._id)) dataStore.deleteFeature(exonToBeSplit._id);
		}
	},
	async MergeTranscriptsChange(dataStore, change) {
		for (const [idx, changedId] of change.changedIds.entries()) {
			const { firstTranscript, secondTranscript } = change.changes[idx];
			const mergedTranscript = dataStore.getFeature(firstTranscript._id);
			if (!mergedTranscript) throw new Error(`Could not find feature with identifier "${changedId}"`);
			change.mergeTranscriptsOnClient(mergedTranscript, secondTranscript);
			mergedTranscript.parent?.deleteChild(secondTranscript._id);
		}
	},
	async UndoMergeExonsChange(dataStore, change) {
		for (const c of change.changes) {
			const { exonsToRestore, parentFeatureId } = c;
			if (!parentFeatureId) throw new Error("Parent ID is missing");
			const parentFeature = dataStore.getFeature(parentFeatureId);
			if (!parentFeature) throw new Error(`Could not find parent feature "${parentFeatureId}"`);
			if (!parentFeature.attributes.get("_id")) parentFeature.setAttribute("_id", [parentFeature._id]);
			for (const exon of exonsToRestore) parentFeature.addChild(exon);
		}
	},
	async UndoSplitExonChange(dataStore, change) {
		for (const c of change.changes) {
			const { exonToRestore, parentFeatureId, idsToDelete } = c;
			if (!parentFeatureId) throw new Error("Parent ID is missing");
			const parentFeature = dataStore.getFeature(parentFeatureId);
			if (!parentFeature) throw new Error(`Could not find parent feature "${parentFeatureId}"`);
			if (!parentFeature.attributes.get("_id")) parentFeature.setAttribute("_id", [parentFeature._id]);
			parentFeature.addChild(exonToRestore);
			idsToDelete.map((id) => {
				parentFeature.deleteChild(id);
			});
		}
	},
	async UndoMergeTranscriptsChange(dataStore, change) {
		for (const c of change.changes) {
			const { transcriptsToRestore, parentFeatureId } = c;
			if (!parentFeatureId) throw new Error("Parent ID is missing");
			const parentFeature = dataStore.getFeature(parentFeatureId);
			if (!parentFeature) throw new Error(`Could not find parent feature "${parentFeatureId}"`);
			if (!parentFeature.attributes.get("_id")) parentFeature.setAttribute("_id", [parentFeature._id]);
			for (const transcript of transcriptsToRestore) parentFeature.addChild(transcript);
		}
	},
	async StrandChange(dataStore, change) {
		for (const [idx, changedId] of change.changedIds.entries()) {
			const feature = dataStore.getFeature(changedId);
			if (!feature) throw new Error(`Could not find feature with identifier "${changedId}"`);
			feature.setStrand(change.changes[idx].newStrand);
		}
	},
	async TypeChange(dataStore, change) {
		for (const [idx, changedId] of change.changedIds.entries()) {
			const feature = dataStore.getFeature(changedId);
			if (!feature) throw new Error(`Could not find feature with identifier "${changedId}"`);
			feature.setType(change.changes[idx].newType);
		}
	}
};
//#endregion
//#region src/ChangeManager.ts
var ChangeManager = class {
	dataStore;
	constructor(dataStore) {
		this.dataStore = dataStore;
	}
	recentChanges = [];
	undoneChanges = [];
	async submit(change, opts = {}) {
		const { addToRecents = true, submitToBackend = true, updateJobsManager = false } = opts;
		const session = (0, _jbrowse_core_util.getSession)(this.dataStore);
		const controller = new AbortController();
		const { jobsManager, isLocked, changeInProgress, setChangeInProgress } = (0, _jbrowse_core_util.getSession)(this.dataStore);
		if (isLocked) {
			session.notify("Cannot submit changes in locked mode");
			setChangeInProgress(false);
			return;
		}
		if (changeInProgress) {
			session.notify("Could not submit change, there is another change still in progress");
			return;
		}
		setChangeInProgress(true);
		const job = {
			name: change.typeName,
			statusMessage: "Pre-validating",
			progressPct: 0,
			cancelCallback: () => {
				controller.abort(new DOMException(`Cancelling change "${change.typeName}"`, "AbortError"));
			}
		};
		if (updateJobsManager) jobsManager.runJob(job);
		const result = await _apollo_annotation_shared.validationRegistry.frontendPreValidate(change);
		if (!result.ok) {
			const msg = `Pre-validation failed: "${result.resultsMessages}"`;
			if (updateJobsManager) jobsManager.abortJob(job.name, msg);
			session.notify(msg, "error");
			setChangeInProgress(false);
			return;
		}
		const changeName = change.typeName;
		const handler = isLocalChange(changeName) ? changeHandlers[changeName] : void 0;
		if (handler) try {
			await handler(this.dataStore, change);
		} catch (error) {
			if (updateJobsManager) jobsManager.abortJob(job.name, String(error));
			console.error(error);
			session.notify(`Error encountered in client: ${String(error)}. Data may be out of sync, please refresh the page`, "error");
			setChangeInProgress(false);
			return;
		}
		if (!(await _apollo_annotation_shared.validationRegistry.frontendPostValidate(change)).ok) await this.undo(change);
		if (submitToBackend) {
			if (updateJobsManager) jobsManager.update(job.name, "Submitting to driver");
			const { collaborationServerDriver, getBackendDriver } = this.dataStore;
			const backendDriver = (0, _apollo_annotation_common.isAssemblySpecificChange)(change) ? getBackendDriver(change.assembly) ?? collaborationServerDriver : collaborationServerDriver;
			let backendResult;
			try {
				backendResult = await backendDriver.submitChange(change, opts);
			} catch (error) {
				if (updateJobsManager) jobsManager.abortJob(job.name, String(error));
				console.error(error);
				session.notify(String(error), "error");
				setChangeInProgress(false);
				await this.undo(change, false);
				return;
			}
			if (!backendResult.ok) {
				const msg = `Post-validation failed: "${result.resultsMessages}"`;
				if (updateJobsManager) jobsManager.abortJob(job.name, msg);
				session.notify(msg, "error");
				setChangeInProgress(false);
				await this.undo(change, false);
				return;
			}
			if (change.notification) session.notify(change.notification, "success");
			if (addToRecents) {
				this.recentChanges.push(change);
				this.undoneChanges = [];
			}
		}
		if (updateJobsManager) jobsManager.done(job);
		setChangeInProgress(false);
	}
	async undo(change, submitToBackend = true) {
		const inverseChange = change.getInverse();
		const opts = {
			submitToBackend,
			addToRecents: false
		};
		return this.submit(inverseChange, opts);
	}
	async redo(change, submitToBackend = true) {
		const opts = {
			submitToBackend,
			addToRecents: false
		};
		return this.submit(change, opts);
	}
	async undoLastChange() {
		const session = (0, _jbrowse_core_util.getSession)(this.dataStore);
		const lastChange = this.recentChanges.pop();
		if (!lastChange) {
			session.notify("No changes to undo!", "info");
			return;
		}
		this.undoneChanges.push(lastChange);
		return this.undo(lastChange);
	}
	async redoLastChange() {
		const session = (0, _jbrowse_core_util.getSession)(this.dataStore);
		const lastChange = this.undoneChanges.pop();
		if (!lastChange) {
			session.notify("No changes to redo!", "info");
			return;
		}
		this.recentChanges.push(lastChange);
		return this.redo(lastChange);
	}
};
//#endregion
//#region src/BackendDrivers/CollaborationServerDriver.ts
var CollaborationServerDriver = class extends BackendDriver {
	inFlight = /* @__PURE__ */ new Map();
	refSeqMaps = /* @__PURE__ */ new Map();
	async fetch(internetAccount, info, init) {
		return internetAccount.getFetcher({
			locationType: "UriLocation",
			uri: info.toString()
		})(info, init);
	}
	async searchFeatures(term, assemblies) {
		const internetAccount = this.clientStore.getInternetAccount(assemblies[0]);
		const { baseURL } = internetAccount;
		const url = new URL("features/searchFeatures", baseURL);
		url.search = new URLSearchParams({
			assemblies: assemblies.join(","),
			term
		}).toString();
		const uri = url.toString();
		const response = await this.fetch(internetAccount, uri);
		if (!response.ok) {
			const errorMessage = await createFetchErrorMessage(response, "searchFeatures failed");
			throw new Error(errorMessage);
		}
		return response.json();
	}
	/**
	* Call backend endpoint to get features by criteria
	* @param region -  Searchable region containing refSeq, start and end
	* @returns
	*/
	async getFeatures(region) {
		const { assemblyName, end, refName, start } = region;
		const { assemblyManager } = (0, _jbrowse_core_util.getSession)(this.clientStore);
		if (!assemblyManager.get(assemblyName)) throw new Error(`Could not find assembly with name "${assemblyName}"`);
		const refSeqEntry = (await this.getRefSeqMapping(assemblyName)).get(refName);
		if (!refSeqEntry) throw new Error(`Could not find refSeq "${refName}"`);
		const refSeq = refSeqEntry.id;
		const internetAccount = this.clientStore.getInternetAccount(assemblyName);
		const { baseURL } = internetAccount;
		const url = new URL("features/getFeatures", baseURL);
		url.search = new URLSearchParams({
			refSeq,
			start: String(start),
			end: String(end)
		}).toString();
		const uri = url.toString();
		const response = await this.fetch(internetAccount, uri);
		if (!response.ok) {
			const errorMessage = await createFetchErrorMessage(response, "getFeatures failed");
			throw new Error(errorMessage);
		}
		this.checkSocket(assemblyName, refName, internetAccount);
		return response.json();
	}
	/**
	* Checks if there is assembly-refSeq specific socket. If not, it opens one
	* @param assembly - assemblyId
	* @param refSeq - refSeqName
	* @param internetAccount - internet account
	*/
	checkSocket(assembly, refSeq, internetAccount) {
		const { socket } = internetAccount;
		const channel = `${assembly}-${refSeq}`;
		if (!socket.hasListeners(channel)) socket.on(channel, async (message) => {
			const token = internetAccount.retrieveToken();
			if (!token) return;
			const localSessionId = (0, _apollo_annotation_shared.makeUserSessionId)(token);
			const changeManager = new ChangeManager(this.clientStore);
			internetAccount.setLastChangeSequenceNumber(message.changeSequence);
			if (message.userSessionId === localSessionId) return;
			const change = _apollo_annotation_common.Change.fromJSON(message.changeInfo);
			if ((0, _apollo_annotation_common.isFeatureChange)(change) && this.haveDataForChange(change)) await changeManager.submit(change, { submitToBackend: false });
		});
	}
	haveDataForChange(change) {
		const { assembly, changedIds } = change;
		if (!this.clientStore.assemblies.get(assembly)) return false;
		for (const changedId of changedIds) if (this.clientStore.getFeature(changedId)) return true;
		return false;
	}
	/**
	* Call backend endpoint to get sequence by criteria
	* @param region -  Searchable region containing refSeq, start and end
	* @returns
	*/
	async getSequence(region) {
		const inFlightKey = `${region.refName}:${region.start}-${region.end}`;
		const inFlightPromise = this.inFlight.get(inFlightKey);
		const { assemblyName, end, refName, start } = region;
		const { assemblyManager } = (0, _jbrowse_core_util.getSession)(this.clientStore);
		if (!assemblyManager.get(assemblyName)) throw new Error(`Could not find assembly with name "${assemblyName}"`);
		const refSeqEntry = (await this.getRefSeqMapping(assemblyName)).get(refName);
		if (!refSeqEntry) throw new Error(`Could not find refSeq "${refName}"`);
		const refSeq = refSeqEntry.id;
		if (inFlightPromise) return {
			seq: await inFlightPromise,
			refSeq
		};
		const apolloAssembly = this.clientStore.assemblies.get(assemblyName) ?? this.clientStore.addAssembly(assemblyName);
		const apolloRefSeq = apolloAssembly.refSeqs.get(refSeq) ?? apolloAssembly.addRefSeq(refSeq, refName);
		const clientStoreSequence = apolloRefSeq.getSequence(start, end);
		if (clientStoreSequence.length === end - start) return {
			seq: clientStoreSequence,
			refSeq
		};
		const internetAccount = this.clientStore.getInternetAccount(assemblyName);
		const { baseURL } = internetAccount;
		const url = new URL("sequence", baseURL);
		url.search = new URLSearchParams({
			refSeq,
			start: String(start),
			end: String(end)
		}).toString();
		const uri = url.toString();
		const seqPromise = this.getSeqFromServer(internetAccount, uri, apolloRefSeq, start, end);
		this.inFlight.set(inFlightKey, seqPromise);
		const seq = await seqPromise;
		this.checkSocket(assemblyName, refName, internetAccount);
		this.inFlight.delete(inFlightKey);
		return {
			seq,
			refSeq
		};
	}
	async getSeqFromServer(internetAccount, uri, apolloRefSeq, start, stop) {
		const response = await this.fetch(internetAccount, uri);
		if (!response.ok) {
			let errorMessage;
			try {
				errorMessage = await response.text();
			} catch {
				errorMessage = "";
			}
			throw new Error(`getSequence failed: ${response.status} (${response.statusText})${errorMessage ? ` (${errorMessage})` : ""}`);
		}
		const seq = await response.text();
		apolloRefSeq.addSequence({
			sequence: seq,
			start,
			stop
		});
		return seq;
	}
	async getRefSeqMapping(assemblyName) {
		const cachedRefSeqMap = this.refSeqMaps.get(assemblyName);
		if (cachedRefSeqMap) return cachedRefSeqMap;
		const { assemblyManager } = (0, _jbrowse_core_util.getSession)(this.clientStore);
		if (!assemblyManager.get(assemblyName)) throw new Error(`Could not find assembly with name "${assemblyName}"`);
		const internetAccount = this.clientStore.getInternetAccount(assemblyName);
		const { baseURL } = internetAccount;
		const url = new URL("refSeqs", baseURL);
		url.search = new URLSearchParams({ assembly: assemblyName }).toString();
		const uri = url.toString();
		const response = await this.fetch(internetAccount, uri);
		if (!response.ok) {
			let errorMessage;
			try {
				errorMessage = await response.text();
			} catch {
				errorMessage = "";
			}
			throw new Error(`getRefNameAliases failed: ${response.status} (${response.statusText})${errorMessage ? ` (${errorMessage})` : ""}`);
		}
		const refSeqs = await response.json();
		const refSeqMap = new Map(refSeqs.map((refSeq) => [refSeq.name, {
			refName: refSeq.name,
			id: refSeq._id,
			aliases: refSeq.aliases
		}]));
		this.refSeqMaps.set(assemblyName, refSeqMap);
		return refSeqMap;
	}
	async getRefNameAliases(assemblyName) {
		return [...(await this.getRefSeqMapping(assemblyName)).values()].map((refSeq) => ({
			refName: refSeq.refName,
			aliases: [.../* @__PURE__ */ new Set([refSeq.id, ...refSeq.aliases])],
			uniqueId: `alias-${refSeq.id}`
		}));
	}
	async getRefSeqId(assemblyName, refName) {
		const refSeqMap = await this.getRefSeqMapping(assemblyName);
		if (!refSeqMap) return;
		return refSeqMap.get(refName)?.id;
	}
	async getRegions(assemblyName) {
		const { assemblyManager } = (0, _jbrowse_core_util.getSession)(this.clientStore);
		if (!assemblyManager.get(assemblyName)) throw new Error(`Could not find assembly with name "${assemblyName}"`);
		const internetAccount = this.clientStore.getInternetAccount(assemblyName);
		const { baseURL } = internetAccount;
		const url = new URL("refSeqs", baseURL);
		url.search = new URLSearchParams({ assembly: assemblyName }).toString();
		const uri = url.toString();
		const response = await this.fetch(internetAccount, uri);
		if (!response.ok) {
			let errorMessage;
			try {
				errorMessage = await response.text();
			} catch {
				errorMessage = "";
			}
			throw new Error(`getRegions failed: ${response.status} (${response.statusText})${errorMessage ? ` (${errorMessage})` : ""}`);
		}
		return (await response.json()).map((refSeq) => ({
			refName: refSeq.name,
			start: 0,
			end: refSeq.length
		}));
	}
	getAssemblies(internetAccountId) {
		const { assemblyManager } = (0, _jbrowse_core_util.getSession)(this.clientStore);
		return assemblyManager.assemblies.filter((assembly) => {
			const sequenceMetadata = (0, _jbrowse_core_configuration.getConf)(assembly, ["sequence", "metadata"]);
			if (sequenceMetadata && sequenceMetadata.apollo && sequenceMetadata.internetAccountConfigId) {
				if (internetAccountId) return sequenceMetadata.internetAccountConfigId === internetAccountId;
				return true;
			}
			return false;
		});
	}
	async getChanges(assemblyName, opts = {}) {
		const internetAccount = this.clientStore.getInternetAccount(assemblyName);
		const { baseURL } = internetAccount;
		const url = new URL("changes", baseURL);
		const params = { assembly: assemblyName };
		if (opts.page !== void 0) params.page = String(opts.page);
		if (opts.pageSize !== void 0) params.pageSize = String(opts.pageSize);
		if (opts.sortField) params.sortField = opts.sortField;
		if (opts.sortOrder) params.sortOrder = opts.sortOrder;
		if (opts.filters?.user) params.user = opts.filters.user;
		if (opts.filters?.typeName) params.typeName = opts.filters.typeName;
		if (opts.filters?.startTime) params.startTime = opts.filters.startTime;
		if (opts.filters?.endTime) params.endTime = opts.filters.endTime;
		url.search = new URLSearchParams(params).toString();
		const response = await this.fetch(internetAccount, url.toString());
		if (!response.ok) {
			const errorMessage = await createFetchErrorMessage(response, "getChanges failed");
			throw new Error(errorMessage);
		}
		return response.json();
	}
	async getCheckResults(assemblyName) {
		const internetAccount = this.clientStore.getInternetAccount(assemblyName);
		const { baseURL } = internetAccount;
		const url = new URL("checks", baseURL);
		url.search = new URLSearchParams({ assembly: assemblyName }).toString();
		const response = await this.fetch(internetAccount, url.toString());
		if (!response.ok) {
			const errorMessage = await createFetchErrorMessage(response, "getCheckResults failed");
			throw new Error(errorMessage);
		}
		return response.json();
	}
	async submitChange(change, opts = {}) {
		const { internetAccountId } = opts;
		const internetAccount = this.clientStore.getInternetAccount("assembly" in change ? change.assembly : void 0, internetAccountId);
		const { baseURL } = internetAccount;
		const url = new URL("changes", baseURL).href;
		const response = await this.fetch(internetAccount, url, {
			method: "POST",
			body: JSON.stringify(change.toJSON()),
			headers: { "Content-Type": "application/json" }
		});
		if (!response.ok) {
			const errorMessage = await createFetchErrorMessage(response, "submitChange failed");
			throw new Error(errorMessage);
		}
		const results = new _apollo_annotation_shared.ValidationResultSet();
		if (!response.ok) results.ok = false;
		return results;
	}
};
//#endregion
//#region src/components/AddFeature.tsx
var NewFeature = /* @__PURE__ */ function(NewFeature) {
	NewFeature["GENE_AND_SUBFEATURES"] = "GENE_AND_SUBFEATURES";
	NewFeature["TRANSCRIPT_AND_SUBFEATURES"] = "TRANSCRIPT_AND_SUBFEATURES";
	NewFeature["CUSTOM"] = "CUSTOM";
	return NewFeature;
}(NewFeature || {});
function makeCodingMrna(refSeqId, strand, min, max) {
	const cds = {
		_id: new bson_objectid.default().toHexString(),
		refSeq: refSeqId,
		type: "CDS",
		min,
		max,
		strand
	};
	const exon = {
		_id: new bson_objectid.default().toHexString(),
		refSeq: refSeqId,
		type: "exon",
		min,
		max,
		strand
	};
	const children = {};
	children[cds._id] = cds;
	children[exon._id] = exon;
	return {
		_id: new bson_objectid.default().toHexString(),
		refSeq: refSeqId,
		type: "mRNA",
		min,
		max,
		strand,
		children
	};
}
function AddFeature({ changeManager, handleClose, region, session }) {
	const [end, setEnd] = (0, react.useState)(String(region.end));
	const [start, setStart] = (0, react.useState)(String(region.start + 1));
	const [type, setType] = (0, react.useState)("GENE_AND_SUBFEATURES");
	const [customType, setCustomType] = (0, react.useState)("");
	const [strand, setStrand] = (0, react.useState)();
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	async function onSubmit(event) {
		event.preventDefault();
		setErrorMessage("");
		const backendDriver = session.apolloDataStore.getBackendDriver(region.assemblyName);
		if (!backendDriver) {
			setErrorMessage("No backend driver found");
			return;
		}
		let refSeqId = region.refName;
		if (backendDriver instanceof CollaborationServerDriver) {
			const backendRefSeqId = await backendDriver.getRefSeqId(region.assemblyName, region.refName);
			if (!backendRefSeqId) {
				setErrorMessage(`Could not find refSeq for "${region.refName}"`);
				return;
			}
			refSeqId = backendRefSeqId;
		}
		if (type === "GENE_AND_SUBFEATURES") {
			const mRNA = makeCodingMrna(refSeqId, strand, Number(start) - 1, Number(end));
			const children = {};
			children[mRNA._id] = mRNA;
			const id = new bson_objectid.default().toHexString();
			const change = new _apollo_annotation_shared.AddFeatureChange({
				changedIds: [id],
				typeName: "AddFeatureChange",
				assembly: region.assemblyName,
				addedFeature: {
					_id: id,
					refSeq: refSeqId,
					min: Number(start) - 1,
					max: Number(end),
					type: "gene",
					strand,
					children
				}
			});
			changeManager.submit(change).then(() => {
				session.apolloSetSelectedFeature(id);
			});
			handleClose();
			return;
		}
		if (type === "TRANSCRIPT_AND_SUBFEATURES") {
			const mRNA = makeCodingMrna(refSeqId, strand, Number(start) - 1, Number(end));
			const change = new _apollo_annotation_shared.AddFeatureChange({
				changedIds: [mRNA._id],
				typeName: "AddFeatureChange",
				assembly: region.assemblyName,
				addedFeature: mRNA
			});
			changeManager.submit(change).then(() => {
				session.apolloSetSelectedFeature(mRNA._id);
			});
			handleClose();
			return;
		}
		if (!customType) {
			setErrorMessage("No type selected");
			return;
		}
		const id = new bson_objectid.default().toHexString();
		const change = new _apollo_annotation_shared.AddFeatureChange({
			changedIds: [id],
			typeName: "AddFeatureChange",
			assembly: region.assemblyName,
			addedFeature: {
				_id: id,
				refSeq: refSeqId,
				min: Number(start) - 1,
				max: Number(end),
				type: customType,
				strand
			}
		});
		changeManager.submit(change).then(() => {
			session.apolloSetSelectedFeature(id);
		});
		handleClose();
	}
	function handleChangeStrand(e) {
		setErrorMessage("");
		switch (Number(e.target.value)) {
			case 1:
				setStrand(1);
				break;
			case -1:
				setStrand(-1);
				break;
			default: setStrand(void 0);
		}
	}
	const error = Number(end) <= Number(start);
	function handleChangeOntologyType(newType) {
		setErrorMessage("");
		setCustomType(newType);
	}
	const handleTypeChange = (e) => {
		setErrorMessage("");
		const { value } = e.target;
		if (Object.keys(NewFeature).includes(value)) setType(NewFeature[value]);
	};
	let submitDisabled = error || !(start && end && type);
	if (type === "CUSTOM" && !customType || !strand && type === "GENE_AND_SUBFEATURES" || !strand && type === "TRANSCRIPT_AND_SUBFEATURES") submitDisabled = true;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Add new feature",
		handleClose,
		maxWidth: false,
		"data-testid": "add-feature-dialog",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			onSubmit,
			"data-testid": "submit-form",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, {
				style: {
					display: "flex",
					flexDirection: "column"
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
						margin: "dense",
						id: "start",
						label: "Start",
						type: "number",
						fullWidth: true,
						variant: "outlined",
						value: Number(start),
						onChange: (e) => {
							setStart(e.target.value);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
						margin: "dense",
						id: "end",
						label: "End",
						type: "number",
						fullWidth: true,
						variant: "outlined",
						value: end,
						onChange: (e) => {
							setEnd(e.target.value);
						},
						error,
						helperText: error ? "\"End\" must be greater than \"Start\"" : null
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.FormControl, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.InputLabel, {
						id: "demo-simple-select-label",
						children: "Strand"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Select, {
						labelId: "demo-simple-select-label",
						id: "demo-simple-select",
						label: "Strand",
						value: strand?.toString(),
						onChange: handleChangeStrand,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, { value: void 0 }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, {
								value: 1,
								children: "+"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, {
								value: -1,
								children: "-"
							})
						]
					})] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControl, {
						style: { marginTop: 20 },
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.RadioGroup, {
							"aria-labelledby": "demo-radio-buttons-group-label",
							defaultValue: "GENE_AND_SUBFEATURES",
							name: "radio-buttons-group",
							value: type,
							onChange: handleTypeChange,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
									value: "GENE_AND_SUBFEATURES",
									control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Radio, {}),
									label: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Box, {
										display: "flex",
										alignItems: "center",
										children: ["Add gene and sub-features", /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Tooltip, {
											title: "This is a shortcut to create a gene with a single mRNA, exon, and CDS",
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.IconButton, {
												size: "small",
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Info.default, { sx: { fontSize: 18 } })
											})
										})]
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
									value: "TRANSCRIPT_AND_SUBFEATURES",
									control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Radio, {}),
									label: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Box, {
										display: "flex",
										alignItems: "center",
										children: ["Add transcript and sub-features", /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Tooltip, {
											title: "This is a shortcut to create a single mRNA with exon and CDS, but without a parent gene",
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.IconButton, {
												size: "small",
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Info.default, { sx: { fontSize: 18 } })
											})
										})]
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
									value: "CUSTOM",
									checked: type !== "GENE_AND_SUBFEATURES" && type !== "TRANSCRIPT_AND_SUBFEATURES",
									control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Radio, {}),
									label: "Add feature with a sequence ontology type"
								})
							]
						})
					}),
					type === "CUSTOM" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(OntologyTermAutocomplete, {
						session,
						ontologyName: "Sequence Ontology",
						style: { width: 170 },
						value: customType,
						filterTerms: isOntologyClass,
						renderInput: (params) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
							...params,
							label: "Type",
							variant: "outlined",
							fullWidth: true
						}),
						onChange: (_oldValue, newValue) => {
							if (newValue) handleChangeOntologyType(newValue);
						}
					}) : null
				]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "contained",
				type: "submit",
				disabled: submitDisabled,
				children: "Submit"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "submit",
				onClick: handleClose,
				children: "Cancel"
			})] })]
		}), errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
			color: "error",
			children: errorMessage
		}) }) : null]
	});
}
//#endregion
//#region src/components/DeleteAssembly.tsx
function DeleteAssembly({ changeManager, handleClose, session }) {
	const { internetAccounts } = (0, _jbrowse_mobx_state_tree.getRoot)(session);
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const [confirmDelete, setConfirmDelete] = (0, react.useState)(false);
	const [submitted, setSubmitted] = (0, react.useState)(false);
	const apolloInternetAccounts = internetAccounts.filter((ia) => ia.type === "ApolloInternetAccount");
	if (apolloInternetAccounts.length === 0) throw new Error("No Apollo internet account found");
	const [selectedInternetAccount, setSelectedInternetAccount] = (0, react.useState)(apolloInternetAccounts[0]);
	const { collaborationServerDriver } = session.apolloDataStore;
	const assemblies = collaborationServerDriver.getAssemblies();
	const [selectedAssembly, setSelectedAssembly] = (0, react.useState)(assemblies.at(0));
	function handleChangeInternetAccount(e) {
		setSubmitted(false);
		const newlySelectedInternetAccount = apolloInternetAccounts.find((ia) => ia.internetAccountId === e.target.value);
		if (!newlySelectedInternetAccount) throw new Error(`Could not find internetAccount with ID "${e.target.value}"`);
		setSelectedInternetAccount(newlySelectedInternetAccount);
	}
	function handleChangeAssembly(e) {
		const newAssembly = assemblies.find((asm) => asm.name === e.target.value);
		setSelectedAssembly(newAssembly);
	}
	async function onSubmit(event) {
		event.preventDefault();
		setSubmitted(true);
		setErrorMessage("");
		if (!selectedAssembly) {
			setErrorMessage("Must select assembly!");
			return;
		}
		const change = new _apollo_annotation_shared.DeleteAssemblyChange({
			typeName: "DeleteAssemblyChange",
			assembly: selectedAssembly.name
		});
		await changeManager.submit(change, { internetAccountId: selectedInternetAccount.internetAccountId });
		handleClose();
		event.preventDefault();
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Delete Assembly",
		handleClose,
		maxWidth: false,
		"data-testid": "delete-assembly",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			onSubmit,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, {
				style: {
					display: "flex",
					flexDirection: "column"
				},
				children: [
					apolloInternetAccounts.length > 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Select account" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Select, {
						value: selectedInternetAccount.internetAccountId,
						onChange: handleChangeInternetAccount,
						disabled: submitted && !errorMessage,
						children: internetAccounts.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, {
							value: option.internetAccountId,
							children: option.name
						}, option.id))
					})] }) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Select assembly" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Select, {
						labelId: "label",
						value: selectedAssembly?.name ?? "",
						onChange: handleChangeAssembly,
						disabled: assemblies.length === 0,
						children: assemblies.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, {
							value: option.name,
							children: option.displayName
						}, option.name))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
						style: { color: "red" },
						children: "NOTE: All assembly data will be deleted and this operation cannot be undone!"
					}) }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormGroup, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
						control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Checkbox, {
							checked: confirmDelete,
							onChange: () => {
								setConfirmDelete(!confirmDelete);
							}
						}),
						label: "I understand that all assembly data will be deleted"
					}) })
				]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				disabled: !selectedAssembly || !confirmDelete,
				variant: "contained",
				type: "submit",
				children: "Delete"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "submit",
				onClick: handleClose,
				children: "Cancel"
			})] })]
		}), errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
			color: "error",
			children: errorMessage
		}) }) : null]
	});
}
//#endregion
//#region src/components/DownloadGFF3.tsx
function Export(props) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.SvgIcon, {
		viewBox: "0 0 24 24",
		...props,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M23,12L19,8V11H10V13H19V16M1,18V6C1,4.89 1.9,4 3,4H15A2,2 0 0,1 17,6V9H15V6H3V18H15V15H17V18A2,2 0 0,1 15,20H3A2,2 0 0,1 1,18Z" })
	});
}
function DownloadGFF3({ handleClose, session, assembly: assemblyName }) {
	const [includeFASTA, setIncludeFASTA] = (0, react.useState)(false);
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const { getInternetAccount } = session.apolloDataStore;
	const { assemblyManager } = session;
	const assembly = assemblyManager.get(assemblyName);
	if (!assembly) {
		setErrorMessage(`Assembly "${assemblyName}" not found`);
		return;
	}
	const { internetAccountConfigId } = (0, _jbrowse_core_configuration.getConf)(assembly, ["sequence", "metadata"]);
	async function onSubmit(event) {
		event.preventDefault();
		setErrorMessage("");
		await (internetAccountConfigId ? exportFromCollaborationServer(internetAccountConfigId) : downloadAssemblyGFF3(assemblyName));
		handleClose();
	}
	async function exportFromCollaborationServer(internetAccountConfigId) {
		const internetAccount = getInternetAccount(assemblyName, internetAccountConfigId);
		const url = new URL("export/getID", internetAccount.baseURL);
		url.search = new URLSearchParams({ assembly: assemblyName }).toString();
		const uri = url.toString();
		const response = await internetAccount.getFetcher({
			locationType: "UriLocation",
			uri
		})(uri, { method: "GET" });
		if (!response.ok) {
			const newErrorMessage = await createFetchErrorMessage(response, "Error when exporting ID");
			setErrorMessage(newErrorMessage);
			return;
		}
		const { exportID } = await response.json();
		const exportURL = new URL("export", internetAccount.baseURL);
		exportURL.search = new URLSearchParams({
			exportID,
			includeFASTA: includeFASTA ? "true" : "false"
		}).toString();
		const exportUri = exportURL.toString();
		window.open(exportUri, "_blank");
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Export annotations",
		handleClose,
		maxWidth: false,
		"data-testid": "download-gff3",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			onSubmit,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, {
				style: {
					display: "flex",
					flexDirection: "column"
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContentText, { children: ["Exporting annotations for ", assemblyName] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormGroup, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
					"data-testid": "include-fasta-checkbox",
					control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Checkbox, {
						checked: includeFASTA,
						onChange: () => {
							setIncludeFASTA(!includeFASTA);
						},
						disabled: !internetAccountConfigId
					}),
					label: "Include fasta sequence in GFF output"
				}) })]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "contained",
				type: "submit",
				children: "Download"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "submit",
				onClick: handleClose,
				children: "Cancel"
			})] })]
		}), errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
			color: "error",
			children: errorMessage
		}) }) : null]
	});
}
function getAssemblyGFF3Stream(assemblyName) {
	return new ReadableStream({ async start(controller) {
		for await (const feature of getFeaturesForAssembly(assemblyName)) {
			const gff3Feature = (0, _apollo_annotation_shared.annotationFeatureToGFF3)(feature);
			controller.enqueue(gff3Feature);
		}
		controller.close();
	} }).pipeThrough(new TransformStream(new _gmod_gff.GFFFormattingTransformer()));
}
async function downloadAssemblyGFF3(assemblyName) {
	const stream = getAssemblyGFF3Stream(assemblyName);
	const fileName = `${assemblyName}.gff3`;
	try {
		const writable = await (await globalThis.showSaveFilePicker({ suggestedName: fileName })).createWritable();
		await stream.pipeTo(writable);
	} catch {
		const blob = await new Response(stream).blob();
		(0, file_saver.saveAs)(blob, fileName);
	}
}
async function* getFeaturesForAssembly(assemblyName) {
	const db = await openDb(assemblyName, []);
	for (const storeName of db.objectStoreNames) {
		const tx = db.transaction(storeName);
		for await (const cursor of tx.store.iterate()) yield cursor.value;
	}
	db.close();
}
//#endregion
//#region src/components/ImportAnnotations.tsx
function ImportAnnotations({ assemblyName, handleClose, session }) {
	const { changeManager } = session.apolloDataStore;
	const [file, setFile] = (0, react.useState)();
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const [loading, setLoading] = (0, react.useState)(false);
	function handleChangeFile(e) {
		if (e.target.files) setFile(e.target.files[0]);
	}
	async function onSubmit(event) {
		event.preventDefault();
		if (!file) return;
		setLoading(true);
		setErrorMessage("");
		try {
			const stream = file.stream().pipeThrough(new TransformStream(new _gmod_gff.GFFTransformer({ parseSequences: false })));
			for await (const value of stream) {
				const annotationFeature = (0, _apollo_annotation_shared.gff3ToAnnotationFeature)(value);
				const change = new _apollo_annotation_shared.AddFeatureChange({
					changedIds: [annotationFeature._id],
					typeName: "AddFeatureChange",
					assembly: assemblyName,
					addedFeature: annotationFeature
				});
				await changeManager.submit(change);
			}
			handleClose();
		} catch (error) {
			setErrorMessage(String(error));
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Import annotations",
		handleClose,
		children: [loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.LinearProgress, {}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			onSubmit,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Import annotations from a GFF3 file into the current Apollo track. Features are parsed and stored locally in the browser, so importing very large GFF3 files is not recommended." }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					type: "file",
					accept: ".gff,.gff3",
					onChange: handleChangeFile,
					disabled: loading
				}),
				errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
					color: "error",
					children: errorMessage
				}) : null
			] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "contained",
				type: "submit",
				disabled: !file || loading,
				children: "Import"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				onClick: handleClose,
				children: "Cancel"
			})] })]
		})]
	});
}
//#endregion
//#region src/components/ImportFeatures.tsx
function ImportFeatures({ changeManager, handleClose, session }) {
	const { apolloDataStore } = session;
	const [file, setFile] = (0, react.useState)();
	const [selectedAssembly, setSelectedAssembly] = (0, react.useState)();
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const [submitted, setSubmitted] = (0, react.useState)(false);
	const [featuresCount, setFeaturesCount] = (0, react.useState)();
	const [deleteFeatures, setDeleteFeatures] = (0, react.useState)(false);
	const [strict, setStrict] = (0, react.useState)(true);
	const [loading, setLoading] = (0, react.useState)(false);
	const { collaborationServerDriver, getInternetAccount } = apolloDataStore;
	const assemblies = collaborationServerDriver.getAssemblies();
	function handleChangeAssembly(e) {
		const newAssembly = assemblies.find((asm) => asm.name === e.target.value);
		setSelectedAssembly(newAssembly);
		setSubmitted(false);
	}
	function handleDeleteFeatures(e) {
		setDeleteFeatures(e.target.checked);
	}
	function handleSetStrict(e) {
		setStrict(e.target.checked);
	}
	(0, react.useEffect)(() => {
		if (!selectedAssembly) return;
		const updateFeaturesCount = async () => {
			const { internetAccountConfigId } = (0, _jbrowse_core_configuration.getConf)(selectedAssembly, ["sequence", "metadata"]);
			const apolloInternetAccount = getInternetAccount(selectedAssembly.name, internetAccountConfigId);
			if (!apolloInternetAccount) throw new Error("No Apollo internet account found");
			const { baseURL } = apolloInternetAccount;
			const uri = new URL("features/count", baseURL);
			uri.search = new URLSearchParams({ assemblyId: selectedAssembly.name }).toString();
			const fetch = apolloInternetAccount.getFetcher({
				locationType: "UriLocation",
				uri: uri.toString()
			});
			setLoading(true);
			const response = await fetch(uri.toString(), { method: "GET" });
			if (response.ok) {
				const countObj = await response.json();
				setFeaturesCount(countObj.count);
			} else throw new Error(await createFetchErrorMessage(response));
			setLoading(false);
		};
		updateFeaturesCount().catch((error) => {
			console.error(error);
			setErrorMessage(error.message ?? error);
		});
	}, [
		getInternetAccount,
		session,
		selectedAssembly
	]);
	function handleChangeFile(e) {
		setSubmitted(false);
		if (!e.target.files) return;
		setFile(e.target.files[0]);
	}
	async function onSubmit(event) {
		event.preventDefault();
		setErrorMessage("");
		setLoading(true);
		setSubmitted(true);
		let fileId = "";
		if (!file) {
			setErrorMessage("must select a file");
			return;
		}
		if (!selectedAssembly) {
			setErrorMessage("Must select assembly to download");
			return;
		}
		const { internetAccountConfigId } = (0, _jbrowse_core_configuration.getConf)(selectedAssembly, ["sequence", "metadata"]);
		const apolloInternetAccount = getInternetAccount(selectedAssembly.name, internetAccountConfigId);
		const { baseURL } = apolloInternetAccount;
		const url = new URL("files", baseURL);
		url.searchParams.set("type", "text/x-gff3");
		const uri = url.href;
		const formData = new FormData();
		formData.append("file", file);
		formData.append("fileName", file.name);
		formData.append("type", "text/x-gff3");
		const apolloFetchFile = apolloInternetAccount.getFetcher({
			locationType: "UriLocation",
			uri
		});
		handleClose();
		const { jobsManager } = session;
		const controller = new AbortController();
		const job = {
			name: `Importing features for ${selectedAssembly.displayName}`,
			statusMessage: "Uploading file, this may take awhile",
			progressPct: 0,
			cancelCallback: () => {
				controller.abort(new DOMException(`Canceling importing of features to ${selectedAssembly.displayName}`, "AbortError"));
				jobsManager.abortJob(job.name);
			}
		};
		jobsManager.runJob(job);
		if (apolloFetchFile) {
			const { signal } = controller;
			const response = await apolloFetchFile(uri, {
				method: "POST",
				body: formData,
				signal
			});
			if (!response.ok) {
				const newErrorMessage = await createFetchErrorMessage(response, "Error when inserting new features (while uploading file)");
				jobsManager.abortJob(job.name, newErrorMessage);
				setErrorMessage(newErrorMessage);
				return;
			}
			fileId = (await response.json())._id;
		}
		const change = new _apollo_annotation_shared.AddFeaturesFromFileChange({
			typeName: "AddFeaturesFromFileChange",
			assembly: selectedAssembly.name,
			fileId,
			parseOptions: { strict },
			deleteExistingFeatures: deleteFeatures
		});
		jobsManager.done(job);
		await changeManager.submit(change, { updateJobsManager: true });
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Import Features from GFF3 file",
		handleClose,
		maxWidth: false,
		"data-testid": "import-features-dialog",
		children: [
			loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.LinearProgress, {}) : null,
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
				onSubmit,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, {
					style: {
						display: "flex",
						flexDirection: "column"
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Select assembly" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Select, {
							labelId: "label",
							value: selectedAssembly?.name ?? "",
							onChange: handleChangeAssembly,
							disabled: submitted && !errorMessage,
							children: assemblies.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, {
								value: option.name,
								children: option.displayName ?? option.name
							}, option.name))
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Upload GFF3 to load features" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "file",
							onChange: handleChangeFile,
							disabled: submitted && !errorMessage
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
							label: "Strict parsing",
							disabled: submitted && !errorMessage,
							control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Checkbox, {
								checked: strict,
								onChange: handleSetStrict
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormHelperText, { children: "Don't import any features if any lines in the GFF3 are unable to be processed" }),
						featuresCount && featuresCount > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
							label: "Delete existing features",
							disabled: submitted && !errorMessage,
							control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Checkbox, {
								checked: deleteFeatures,
								onChange: handleDeleteFeatures,
								slotProps: { input: { "aria-label": "controlled" } },
								color: "warning"
							})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.FormHelperText, { children: [
							"This assembly has ",
							featuresCount,
							" features that will be deleted"
						] })] }) : null
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
					disabled: !(selectedAssembly && file && featuresCount !== void 0) || submitted,
					variant: "contained",
					type: "submit",
					children: submitted ? "Submitting..." : "Submit"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
					variant: "outlined",
					type: "submit",
					onClick: handleClose,
					children: "Close"
				})] })]
			}),
			errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
				color: "error",
				children: errorMessage
			}) }) : null
		]
	});
}
//#endregion
//#region src/components/LogOut.tsx
function LogOut({ handleClose, session }) {
	const { internetAccounts } = (0, _jbrowse_mobx_state_tree.getRoot)(session);
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const apolloInternetAccounts = internetAccounts.filter((ia) => ia.type === "ApolloInternetAccount");
	if (apolloInternetAccounts.length === 0) throw new Error("No Apollo internet account found");
	const [selectedInternetAccount, setSelectedInternetAccount] = (0, react.useState)(apolloInternetAccounts[0]);
	function handleChangeInternetAccount(e) {
		const newlySelectedInternetAccount = apolloInternetAccounts.find((ia) => ia.internetAccountId === e.target.value);
		if (!newlySelectedInternetAccount) throw new Error(`Could not find internetAccount with ID "${e.target.value}"`);
		setSelectedInternetAccount(newlySelectedInternetAccount);
	}
	function onSubmit(event) {
		event.preventDefault();
		setErrorMessage("");
		selectedInternetAccount.removeToken();
		globalThis.location.reload();
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Log out",
		handleClose,
		maxWidth: false,
		"data-testid": "log-out",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			onSubmit,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, {
				style: {
					display: "flex",
					flexDirection: "column"
				},
				children: [apolloInternetAccounts.length > 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Select account" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Select, {
					value: selectedInternetAccount.internetAccountId,
					onChange: handleChangeInternetAccount,
					children: internetAccounts.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, {
						value: option.internetAccountId,
						children: option.name
					}, option.id))
				})] }) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Are you sure you want to log out?" })]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				disabled: !selectedInternetAccount,
				variant: "contained",
				type: "submit",
				children: "Log Out"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "submit",
				onClick: handleClose,
				children: "Cancel"
			})] })]
		}), errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
			color: "error",
			children: errorMessage
		}) }) : null]
	});
}
//#endregion
//#region src/components/ManageChecks.tsx
function ManageChecks({ handleClose, session }) {
	const { internetAccounts } = (0, _jbrowse_mobx_state_tree.getRoot)(session);
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const [submitted, setSubmitted] = (0, react.useState)(false);
	const apolloInternetAccounts = internetAccounts.filter((ia) => ia.type === "ApolloInternetAccount");
	if (apolloInternetAccounts.length === 0) throw new Error("No Apollo internet account found");
	const [selectedInternetAccount, setSelectedInternetAccount] = (0, react.useState)(apolloInternetAccounts[0]);
	const [checks, setChecks] = (0, react.useState)([]);
	const [selectedChecks, setSelectedChecks] = (0, react.useState)([]);
	const { collaborationServerDriver } = session.apolloDataStore;
	const assemblies = collaborationServerDriver.getAssemblies();
	const [selectedAssembly, setSelectedAssembly] = (0, react.useState)(assemblies.at(0));
	(0, react.useEffect)(() => {
		async function getChecks() {
			const { baseURL, getFetcher } = selectedInternetAccount;
			const uri = new URL("checks/types", baseURL).href;
			const response = await getFetcher({
				locationType: "UriLocation",
				uri
			})(uri, { method: "GET" });
			if (!response.ok) {
				const newErrorMessage = await createFetchErrorMessage(response, "Error when retrieving checks from server");
				setErrorMessage(newErrorMessage);
				return;
			}
			const data = await response.json();
			setChecks(data);
		}
		getChecks().catch((error) => {
			setErrorMessage(String(error));
		});
	}, [selectedInternetAccount]);
	(0, react.useEffect)(() => {
		async function getChecks() {
			if (!selectedAssembly) return;
			const { baseURL, getFetcher } = selectedInternetAccount;
			const uri = new URL(`assemblies/${selectedAssembly.name}`, baseURL).href;
			const response = await getFetcher({
				locationType: "UriLocation",
				uri
			})(uri, { method: "GET" });
			if (!response.ok) {
				const newErrorMessage = await createFetchErrorMessage(response, "Error when retrieving assembly from server");
				setErrorMessage(newErrorMessage);
				return;
			}
			const assembly = await response.json();
			setSelectedChecks(assembly.checks);
		}
		getChecks().catch((error) => {
			setErrorMessage(String(error));
		});
	}, [selectedAssembly, selectedInternetAccount]);
	function handleChangeAssembly(e) {
		const newAssembly = assemblies.find((asm) => asm.name === e.target.value);
		setSelectedAssembly(newAssembly);
	}
	async function onSubmit(event) {
		event.preventDefault();
		if (!selectedAssembly) {
			setErrorMessage("Must select assembly!");
			return;
		}
		const { notify } = session;
		const { baseURL, getFetcher } = selectedInternetAccount;
		const uri = new URL("assemblies/checks", baseURL).href;
		const response = await getFetcher({
			locationType: "UriLocation",
			uri
		})(uri, {
			method: "POST",
			body: JSON.stringify({
				_id: selectedAssembly.name,
				checks: selectedChecks,
				name: ""
			}),
			headers: { "Content-Type": "application/json" }
		});
		if (response.ok) {
			notify("Assembly checks updated successfully", "success");
			handleClose();
		} else {
			const newErrorMessage = await createFetchErrorMessage(response, "Error when updating assembly checks");
			setErrorMessage(newErrorMessage);
		}
	}
	function handleCheckboxChange(e, checked) {
		const checks = [...selectedChecks];
		const _id = e.target.value;
		if (checked) {
			if (!checks.includes(_id)) {
				checks.push(_id);
				setSelectedChecks(checks);
			}
		} else {
			const index = checks.indexOf(_id, 0);
			if (index !== -1) checks.splice(index, 1);
			setSelectedChecks(checks);
		}
	}
	function handleChangeInternetAccount(e) {
		setSubmitted(false);
		const newlySelectedInternetAccount = apolloInternetAccounts.find((ia) => ia.internetAccountId === e.target.value);
		if (!newlySelectedInternetAccount) throw new Error(`Could not find internetAccount with ID "${e.target.value}"`);
		setSelectedInternetAccount(newlySelectedInternetAccount);
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Manage Checks",
		handleClose,
		"data-testid": "manage-checks",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			onSubmit,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, { children: [
				apolloInternetAccounts.length > 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Select account" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Select, {
					value: selectedInternetAccount.internetAccountId,
					onChange: handleChangeInternetAccount,
					disabled: submitted && !errorMessage,
					children: internetAccounts.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, {
						value: option.internetAccountId,
						children: option.name
					}, option.id))
				})] }) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Select assembly" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Select, {
					style: { width: 300 },
					labelId: "label",
					value: selectedAssembly?.name ?? "",
					onChange: handleChangeAssembly,
					disabled: assemblies.length === 0,
					children: assemblies.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, {
						value: option.name,
						children: option.displayName
					}, option.name))
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("br", {}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("br", {}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableContainer, {
					component: _mui_material.Paper,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Table, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableHead, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableRow, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, { children: "Check name" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, { children: "Use check" })] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableBody, { children: checks.map((check) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableRow, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, { children: check.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Checkbox, {
						value: check._id,
						checked: selectedChecks.includes(check._id),
						onChange: handleCheckboxChange
					}) })] }, check._id)) })] })
				})
			] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "contained",
				type: "submit",
				children: "Submit"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "submit",
				onClick: handleClose,
				children: "Cancel"
			})] })]
		}), errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
			color: "error",
			children: errorMessage
		}) }) : null]
	});
}
//#endregion
//#region src/types.ts
function isApolloInternetAccount(internetAccount) {
	return internetAccount.type === "ApolloInternetAccount";
}
//#endregion
//#region src/components/ManageUsers.tsx
const roleLabels = {
	readOnly: "Read-only",
	user: "User",
	admin: "Admin",
	none: "None"
};
const roles = Object.keys(roleLabels);
const specialUserDescriptions = {
	guest: {
		label: "Guest",
		description: "Used by anyone logged in as guest."
	},
	root: {
		label: "Root",
		description: "Used when logging in as the root user from the CLI. Always has the admin role."
	}
};
function toUserRow(user) {
	return {
		...user,
		role: isRole(user.role) ? user.role : "none"
	};
}
function isRole(value) {
	return typeof value === "string" && value in roleLabels;
}
/** Name to show for a user, using the email if they haven't logged in yet */
function getDisplayName(user) {
	return user.username ?? user.email;
}
async function apolloFetch(internetAccount, path, init) {
	const uri = new URL(path, internetAccount.baseURL).href;
	return internetAccount.getFetcher({
		locationType: "UriLocation",
		uri
	})(uri, {
		method: "GET",
		...init
	});
}
function ManageUsers({ changeManager, handleClose, session }) {
	const { internetAccounts } = (0, _jbrowse_mobx_state_tree.getRoot)(session);
	const { notify } = session;
	const apolloInternetAccounts = internetAccounts.filter((ia) => isApolloInternetAccount(ia)).filter((ia) => ia.role?.includes("admin"));
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const [loadErrorMessage, setLoadErrorMessage] = (0, react.useState)("");
	const [addUserErrorMessage, setAddUserErrorMessage] = (0, react.useState)("");
	const [selectedInternetAccountId, setSelectedInternetAccountId] = (0, react.useState)(apolloInternetAccounts.at(0)?.internetAccountId);
	const [users, setUsers] = (0, react.useState)([]);
	const [specialUsers, setSpecialUsers] = (0, react.useState)([]);
	const [rowCount, setRowCount] = (0, react.useState)(0);
	const [loading, setLoading] = (0, react.useState)(false);
	const [paginationModel, setPaginationModel] = (0, react.useState)({
		page: 0,
		pageSize: 25
	});
	const [sortModel, setSortModel] = (0, react.useState)([{
		field: "username",
		sort: "asc"
	}]);
	const [filterModel, setFilterModel] = (0, react.useState)({ items: [] });
	const [refreshCount, setRefreshCount] = (0, react.useState)(0);
	const [userToDelete, setUserToDelete] = (0, react.useState)();
	const [addUserOpen, setAddUserOpen] = (0, react.useState)(false);
	const [newUserEmail, setNewUserEmail] = (0, react.useState)("");
	const [newUserRole, setNewUserRole] = (0, react.useState)("user");
	const [addingUser, setAddingUser] = (0, react.useState)(false);
	const [pendingUserIds, setPendingUserIds] = (0, react.useState)([]);
	const selectedInternetAccount = apolloInternetAccounts.find((ia) => ia.internetAccountId === selectedInternetAccountId);
	(0, react.useEffect)(() => {
		if (!selectedInternetAccount) return;
		const controller = new AbortController();
		async function getUsers(internetAccount) {
			setLoading(true);
			const params = new URLSearchParams({
				page: String(paginationModel.page),
				pageSize: String(paginationModel.pageSize)
			});
			const sortEntry = sortModel.at(0);
			if (sortEntry?.sort) {
				params.set("sortField", sortEntry.field);
				params.set("sortOrder", sortEntry.sort);
			}
			const search = filterModel.quickFilterValues?.join(" ").trim();
			if (search) params.set("search", search);
			const roleFilter = filterModel.items.find((item) => item.field === "role");
			if (roleFilter) {
				const filterRoles = (Array.isArray(roleFilter.value) ? roleFilter.value : [roleFilter.value]).filter((value) => isRole(value));
				if (filterRoles.length > 0) {
					params.set("role", filterRoles.join(","));
					params.set("roleOperator", roleFilter.operator === "not" ? "notIn" : "in");
				}
			}
			const response = await apolloFetch(internetAccount, `users?${params.toString()}`, { signal: controller.signal });
			if (!response.ok) {
				setLoadErrorMessage(await createFetchErrorMessage(response, "Error when getting user data from db"));
				return;
			}
			const data = await response.json();
			if (controller.signal.aborted) return;
			setUsers(data.users.map((u) => toUserRow(u)));
			setSpecialUsers(data.specialUsers.map((u) => toUserRow(u)));
			setRowCount(data.totalCount);
			setLoadErrorMessage("");
			if (data.users.length === 0 && paginationModel.page > 0) setPaginationModel((model) => ({
				...model,
				page: Math.max(Math.ceil(data.totalCount / model.pageSize) - 1, 0)
			}));
		}
		getUsers(selectedInternetAccount).catch((error) => {
			if (!controller.signal.aborted) setLoadErrorMessage(String(error));
		}).finally(() => {
			if (!controller.signal.aborted) setLoading(false);
		});
		return () => {
			controller.abort();
		};
	}, [
		selectedInternetAccount,
		paginationModel,
		sortModel,
		filterModel,
		refreshCount
	]);
	if (!selectedInternetAccount) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Manage users",
		handleClose,
		"data-testid": "manage-users",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Alert, {
			severity: "error",
			children: "No Apollo account with the admin role was found"
		}) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogActions, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
			variant: "outlined",
			onClick: handleClose,
			children: "Close"
		}) })]
	});
	const internetAccount = selectedInternetAccount;
	/** Get a user from the server, or undefined if the user doesn't exist */
	async function fetchUser(userId) {
		const response = await apolloFetch(internetAccount, `users/${userId}`);
		if (!response.ok) throw new Error(await createFetchErrorMessage(response, "Error when getting user"));
		const text = await response.text();
		return text ? toUserRow(JSON.parse(text)) : void 0;
	}
	/**
	* Run a user change. `ChangeManager.submit` reports its own errors and
	* doesn't throw, so `checkSucceeded` asks the server whether it worked.
	*/
	async function runUserChange(user, change, checkSucceeded, successMessage) {
		setPendingUserIds((ids) => [...ids, user._id]);
		try {
			await changeManager.submit(change, {
				internetAccountId: internetAccount.internetAccountId,
				addToRecents: false
			});
			if (checkSucceeded(await fetchUser(user._id))) notify(successMessage, "success");
		} catch (error) {
			setErrorMessage(String(error));
		} finally {
			setPendingUserIds((ids) => ids.filter((id) => id !== user._id));
			setRefreshCount((count) => count + 1);
		}
	}
	async function changeRole(user, role) {
		if (role === user.role) return;
		await runUserChange(user, new _apollo_annotation_shared.UserChange({
			typeName: "UserChange",
			role,
			userId: user._id
		}), (updatedUser) => updatedUser?.role === role, `Changed role of "${getDisplayName(user)}" to ${roleLabels[role]}`);
	}
	async function deleteUser(user) {
		await runUserChange(user, new _apollo_annotation_shared.DeleteUserChange({
			typeName: "DeleteUserChange",
			userId: user._id
		}), (updatedUser) => !updatedUser, `Deleted user "${getDisplayName(user)}"`);
	}
	/** Get a user from the server by email, or undefined if not found */
	async function fetchUserByEmail(email) {
		const params = new URLSearchParams({
			page: "0",
			pageSize: "10",
			search: email
		});
		const response = await apolloFetch(internetAccount, `users?${params.toString()}`);
		if (!response.ok) throw new Error(await createFetchErrorMessage(response, "Error when getting user"));
		return (await response.json()).users.find((user) => user.email.toLowerCase() === email.toLowerCase());
	}
	async function addUser(email, role) {
		const change = new _apollo_annotation_shared.AddUserChange({
			typeName: "AddUserChange",
			email,
			role
		});
		setAddingUser(true);
		setAddUserErrorMessage("");
		try {
			if (await fetchUserByEmail(email)) {
				setAddUserErrorMessage(`A user with email "${email}" already exists`);
				return;
			}
			await changeManager.submit(change, {
				internetAccountId: internetAccount.internetAccountId,
				addToRecents: false
			});
			if (await fetchUserByEmail(email)) {
				notify(`Added "${email}" with role ${roleLabels[role]}`, "success");
				setAddUserOpen(false);
				setNewUserEmail("");
				setNewUserRole("user");
			}
		} catch (error) {
			setAddUserErrorMessage(String(error));
		} finally {
			setAddingUser(false);
			setRefreshCount((count) => count + 1);
		}
	}
	function isCurrentUser(user) {
		return user._id === internetAccount.getUserId();
	}
	function canEditRole(user) {
		return !isCurrentUser(user) && user.special !== "root" && !pendingUserIds.includes(user._id);
	}
	function canDelete(user) {
		return !isCurrentUser(user) && !user.special && !pendingUserIds.includes(user._id);
	}
	function renderRoleSelect(user) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Select, {
			size: "small",
			variant: "standard",
			disableUnderline: true,
			value: user.role,
			disabled: !canEditRole(user),
			onChange: (event) => {
				const { value } = event.target;
				if (isRole(value)) changeRole(user, value);
			},
			onKeyDown: (event) => {
				event.stopPropagation();
			},
			inputProps: { "aria-label": `Role for ${getDisplayName(user)}` },
			sx: {
				fontSize: "inherit",
				width: "100%"
			},
			children: roles.map((role) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, {
				value: role,
				children: roleLabels[role]
			}, role))
		});
	}
	function renderUsername(user) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Box, {
			sx: {
				display: "flex",
				alignItems: "center",
				gap: 1
			},
			children: [user.username ?? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Chip, {
				label: "Pending first login",
				size: "small",
				variant: "outlined"
			}), isCurrentUser(user) ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Chip, {
				label: "You",
				size: "small",
				color: "primary",
				variant: "outlined"
			}) : null]
		});
	}
	const gridColumns = [
		{
			field: "username",
			headerName: "User",
			flex: 1,
			minWidth: 140,
			filterable: false,
			renderCell: ({ row }) => renderUsername(row)
		},
		{
			field: "email",
			headerName: "Email",
			flex: 1.5,
			minWidth: 180,
			filterable: false
		},
		{
			field: "role",
			headerName: "Role",
			width: 150,
			type: "singleSelect",
			valueOptions: roles.map((role) => ({
				value: role,
				label: roleLabels[role]
			})),
			renderCell: ({ row }) => renderRoleSelect(row)
		},
		{
			field: "createdAt",
			headerName: "Created",
			width: 180,
			type: "dateTime",
			filterable: false,
			valueGetter: (value) => value ? new Date(value) : void 0
		},
		{
			field: "actions",
			type: "actions",
			getActions: ({ row }) => [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_x_data_grid.GridActionsCellItem, {
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Delete.default, {}),
				onClick: () => {
					setUserToDelete(row);
				},
				disabled: !canDelete(row),
				label: "Delete"
			}, `delete-${row._id}`)]
		}
	];
	function handleChangeInternetAccount(e) {
		setUsers([]);
		setSpecialUsers([]);
		setRowCount(0);
		setErrorMessage("");
		setLoadErrorMessage("");
		setPaginationModel((model) => ({
			...model,
			page: 0
		}));
		setSelectedInternetAccountId(e.target.value);
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		fullScreen: true,
		title: "Manage users",
		handleClose,
		"data-testid": "manage-users",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, {
				sx: {
					display: "flex",
					flexDirection: "column",
					gap: 2,
					pt: 2
				},
				children: [
					errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Alert, {
						severity: "error",
						onClose: () => {
							setErrorMessage("");
						},
						children: errorMessage
					}) : null,
					loadErrorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Alert, {
						severity: "error",
						children: loadErrorMessage
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Box, {
						sx: {
							display: "flex",
							gap: 2,
							alignItems: "center"
						},
						children: [apolloInternetAccounts.length > 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.FormControl, {
							size: "small",
							sx: { minWidth: 240 },
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.InputLabel, {
								id: "manage-users-account-label",
								children: "Account"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Select, {
								labelId: "manage-users-account-label",
								label: "Account",
								value: internetAccount.internetAccountId,
								onChange: handleChangeInternetAccount,
								children: apolloInternetAccounts.map((ia) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, {
									value: ia.internetAccountId,
									children: ia.name
								}, ia.internetAccountId))
							})]
						}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
							variant: "contained",
							startIcon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_PersonAdd.default, {}),
							onClick: () => {
								setAddUserErrorMessage("");
								setAddUserOpen(true);
							},
							children: "Add user"
						})]
					}),
					specialUsers.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Box, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
						variant: "h6",
						gutterBottom: true,
						children: "System accounts"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableContainer, {
						sx: {
							border: 1,
							borderColor: "divider",
							borderRadius: 1
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Table, {
							size: "small",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableHead, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableRow, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, { children: "Account" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, { children: "Description" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, {
									sx: { width: 150 },
									children: "Role"
								})
							] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableBody, { children: specialUsers.map((user) => {
								if (!user.special) return null;
								const { description, label } = specialUserDescriptions[user.special];
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableRow, { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Chip, {
										label,
										size: "small"
									}) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, { children: description }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, { children: renderRoleSelect(user) })
								] }, user._id);
							}) })]
						})
					})] }) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Box, {
						sx: {
							flex: 1,
							minHeight: 300
						},
						children: [specialUsers.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
							variant: "h6",
							gutterBottom: true,
							children: "Users"
						}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_x_data_grid.DataGrid, {
							pagination: true,
							paginationMode: "server",
							sortingMode: "server",
							filterMode: "server",
							rowCount,
							paginationModel,
							onPaginationModelChange: setPaginationModel,
							sortModel,
							onSortModelChange: setSortModel,
							filterModel,
							onFilterModelChange: (model) => {
								setFilterModel(model);
								setPaginationModel((m) => ({
									...m,
									page: 0
								}));
							},
							pageSizeOptions: [
								10,
								25,
								50,
								100
							],
							loading,
							rows: users,
							columns: gridColumns,
							getRowId: (row) => row._id,
							showToolbar: true,
							disableRowSelectionOnClick: true
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogActions, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				onClick: handleClose,
				children: "Close"
			}) }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Dialog, {
				open: Boolean(userToDelete),
				onClose: () => {
					setUserToDelete(void 0);
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogTitle, { children: "Delete user?" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContentText, { children: [
						"Delete user",
						" ",
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: userToDelete ? getDisplayName(userToDelete) : "" }),
						" ",
						"(",
						userToDelete?.email,
						")? This cannot be undone. Depending on the server's settings, they may be able to log in again and be re-created with the default role."
					] }) }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
						onClick: () => {
							setUserToDelete(void 0);
						},
						children: "Cancel"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
						color: "error",
						variant: "contained",
						onClick: () => {
							if (userToDelete) deleteUser(userToDelete);
							setUserToDelete(void 0);
						},
						children: "Delete"
					})] })
				]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Dialog, {
				open: addUserOpen,
				onClose: () => {
					setAddUserOpen(false);
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
					onSubmit: (event) => {
						event.preventDefault();
						addUser(newUserEmail.trim(), newUserRole);
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogTitle, { children: "Add user" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, {
							sx: {
								display: "flex",
								flexDirection: "column",
								gap: 2
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Add a user by email who has not yet logged in." }),
								addUserErrorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Alert, {
									severity: "error",
									children: addUserErrorMessage
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
									required: true,
									type: "email",
									label: "Email",
									value: newUserEmail,
									onChange: (event) => {
										setNewUserEmail(event.target.value);
									},
									variant: "outlined"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.FormControl, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.InputLabel, {
									id: "add-user-role-label",
									children: "Role"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Select, {
									labelId: "add-user-role-label",
									label: "Role",
									value: newUserRole,
									onChange: (event) => {
										const { value } = event.target;
										if (isRole(value)) setNewUserRole(value);
									},
									children: roles.map((role) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, {
										value: role,
										children: roleLabels[role]
									}, role))
								})] })
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
							onClick: () => {
								setAddUserOpen(false);
							},
							children: "Cancel"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
							type: "submit",
							variant: "contained",
							disabled: addingUser || !newUserEmail.trim(),
							children: "Add"
						})] })
					]
				})
			})
		]
	});
}
//#endregion
//#region src/components/MergeExons.tsx
function getNeighboringExons(referenceExon) {
	const neighboringExons = {};
	const tx = referenceExon.parent;
	if (!tx) throw new Error("Unable to find parent of reference exon");
	let exons = [];
	if (tx.children) {
		for (const [, feature] of tx.children) if (feature.type === "exon") exons.push(feature);
	}
	exons = exons.sort((a, b) => {
		if (a.min === b.min) return a.max - b.max;
		return a.min - b.min;
	});
	if (tx.strand && tx.strand === -1) exons = exons.reverse();
	let i = 0;
	for (const x of exons) {
		if (x._id === referenceExon._id) {
			if (exons.length > i + 1) neighboringExons.three_prime = exons[i + 1];
			if (i > 0) neighboringExons.five_prime = exons[i - 1];
			break;
		}
		i++;
	}
	return neighboringExons;
}
function makeRadioButtonName$1(key, neighboringExons) {
	const neighboringExon = neighboringExons[key];
	let name;
	if (key === "three_prime") name = `3'end (coords: ${neighboringExon.min + 1}-${neighboringExon.max})`;
	else if (key === "five_prime") name = `5'end (coords: ${neighboringExon.min + 1}-${neighboringExon.max})`;
	else throw new Error(`Unexpected direction: "${key}"`);
	return name;
}
function MergeExons({ changeManager, handleClose, selectedFeature, setSelectedFeature, sourceAssemblyId, sourceFeature }) {
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const [selectedExon, setSelectedExon] = (0, react.useState)();
	function onSubmit(event) {
		event.preventDefault();
		setErrorMessage("");
		const { parent } = sourceFeature;
		if (!(selectedExon && parent)) return;
		if (selectedFeature?._id === sourceFeature._id) setSelectedFeature();
		const change = new _apollo_annotation_shared.MergeExonsChange({
			changedIds: [sourceFeature._id],
			typeName: "MergeExonsChange",
			assembly: sourceAssemblyId,
			firstExon: (0, _jbrowse_mobx_state_tree.getSnapshot)(sourceFeature),
			secondExon: (0, _jbrowse_mobx_state_tree.getSnapshot)(selectedExon),
			parentFeatureId: parent._id
		});
		changeManager.submit(change);
		handleClose();
		event.preventDefault();
	}
	const handleTypeChange = (e) => {
		setErrorMessage("");
		const { value } = e.target;
		setSelectedExon(neighboringExons[value]);
	};
	const neighboringExons = getNeighboringExons(sourceFeature);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Merge exons",
		handleClose,
		maxWidth: false,
		"data-testid": "merge-exons",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			onSubmit,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, {
				style: {
					display: "flex",
					flexDirection: "column"
				},
				children: [Object.keys(neighboringExons).length === 0 ? "There are no neighbouring exons to merge with" : "Merge with exon on:", /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControl, {
					style: { marginTop: 5 },
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.RadioGroup, {
						"aria-labelledby": "demo-radio-buttons-group-label",
						name: "radio-buttons-group",
						value: selectedExon,
						onChange: handleTypeChange,
						children: Object.keys(neighboringExons).map((key) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
							value: key,
							control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Radio, {}),
							label: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Box, {
								display: "flex",
								alignItems: "center",
								children: makeRadioButtonName$1(key, neighboringExons)
							})
						}, key))
					})
				})]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "contained",
				type: "submit",
				disabled: Object.keys(neighboringExons).length === 0 || selectedExon === void 0,
				children: "Submit"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "submit",
				onClick: handleClose,
				children: "Cancel"
			})] })]
		}), errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
			color: "error",
			children: errorMessage
		}) }) : null]
	});
}
//#endregion
//#region src/components/MergeTranscripts.tsx
function getTranscripts(referenceTranscript, session) {
	const gene = referenceTranscript.parent;
	if (!gene) throw new Error("Unable to find parent of reference transcript");
	const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	const transcripts = {};
	if (gene.children) {
		for (const [, feature] of gene.children) if (featureTypeOntology.isTypeOf(feature.type, "transcript") && feature._id !== referenceTranscript._id) transcripts[feature._id] = feature;
	}
	return transcripts;
}
function makeRadioButtonName(transcript) {
	let id;
	if (transcript.attributes.get("gff_name")) id = transcript.attributes.get("gff_name")?.join(",");
	else if (transcript.attributes.get("gff_id")) id = transcript.attributes.get("gff_id")?.join(",");
	else id = transcript._id;
	return `${id} [${transcript.min + 1}-${transcript.max}]`;
}
const MergeTranscripts = (0, mobx_react.observer)(function MergeTranscripts({ changeManager, handleClose, selectedFeature, session, setSelectedFeature, sourceAssemblyId, sourceFeature }) {
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
	const transcriptTypesLoaded = featureTypeOntology?.equivalentTypes.has("transcript") ?? false;
	(0, react.useEffect)(() => {
		featureTypeOntology?.loadEquivalentTypes("transcript");
	}, [featureTypeOntology]);
	const transcripts = transcriptTypesLoaded ? getTranscripts(sourceFeature, session) : {};
	const [chosenTranscriptId, setChosenTranscriptId] = (0, react.useState)();
	const selectedTranscriptId = chosenTranscriptId ?? Object.keys(transcripts).at(0);
	let message = "Loading transcripts…";
	if (transcriptTypesLoaded) message = Object.keys(transcripts).length === 0 ? "There are no transcripts to merge with" : "Merge with transcript:";
	function onSubmit(event) {
		event.preventDefault();
		setErrorMessage("");
		if (!selectedTranscriptId) return;
		const selectedTranscript = transcripts[selectedTranscriptId];
		if (selectedFeature?._id === sourceFeature._id) setSelectedFeature();
		if (!sourceFeature.parent) throw new Error("Cannot find parent");
		const change = new _apollo_annotation_shared.MergeTranscriptsChange({
			changedIds: [sourceFeature._id],
			typeName: "MergeTranscriptsChange",
			assembly: sourceAssemblyId,
			firstTranscript: (0, _jbrowse_mobx_state_tree.getSnapshot)(sourceFeature),
			secondTranscript: (0, _jbrowse_mobx_state_tree.getSnapshot)(selectedTranscript),
			parentFeatureId: sourceFeature.parent._id
		});
		changeManager.submit(change);
		handleClose();
	}
	const handleTypeChange = (e) => {
		setErrorMessage("");
		const { value } = e.target;
		setChosenTranscriptId(value);
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Merge transcripts",
		handleClose,
		maxWidth: false,
		"data-testid": "merge-transcripts",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			onSubmit,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, {
				style: {
					display: "flex",
					flexDirection: "column"
				},
				children: [message, /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControl, {
					style: { marginTop: 5 },
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.RadioGroup, {
						"aria-labelledby": "demo-radio-buttons-group-label",
						name: "radio-buttons-group",
						value: selectedTranscriptId,
						onChange: handleTypeChange,
						children: Object.keys(transcripts).map((key) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
							value: key,
							control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Radio, {}),
							label: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Box, {
								display: "flex",
								alignItems: "center",
								children: makeRadioButtonName(transcripts[key])
							})
						}, key))
					})
				})]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "contained",
				type: "submit",
				disabled: Object.keys(transcripts).length === 0 || selectedTranscriptId === void 0,
				children: "Submit"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "submit",
				onClick: handleClose,
				children: "Cancel"
			})] })]
		}), errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
			color: "error",
			children: errorMessage
		}) }) : null]
	});
});
//#endregion
//#region src/components/ViewChangeLog.tsx
const useStyles$13 = (0, tss_react_mui.makeStyles)()((theme) => ({ changeTextarea: {
	fontFamily: "monospace",
	width: 600,
	resize: "none",
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: theme.shape.borderRadius
} }));
function buildFiltersFromModel(filterModel) {
	const filters = {};
	for (const item of filterModel.items) {
		if (item.value === void 0 || item.value === "" || item.value === null) continue;
		switch (item.field) {
			case "user":
				filters.user = String(item.value);
				break;
			case "typeName":
				filters.typeName = String(item.value);
				break;
			case "createdAt": {
				const date = new Date(item.value).toISOString();
				if (item.operator === "after" || item.operator === "onOrAfter") filters.startTime = date;
				else if (item.operator === "before" || item.operator === "onOrBefore") filters.endTime = date;
				break;
			}
		}
	}
	return filters;
}
function ViewChangeLog({ handleClose, session, assembly: assemblyId }) {
	const { classes } = useStyles$13();
	const [errorMessage, setErrorMessage] = (0, react.useState)();
	const [displayGridData, setDisplayGridData] = (0, react.useState)([]);
	const [rowCount, setRowCount] = (0, react.useState)(0);
	const [loading, setLoading] = (0, react.useState)(false);
	const [paginationModel, setPaginationModel] = (0, react.useState)({
		page: 0,
		pageSize: 15
	});
	const [sortModel, setSortModel] = (0, react.useState)([{
		field: "sequence",
		sort: "desc"
	}]);
	const [filterModel, setFilterModel] = (0, react.useState)({ items: [] });
	const { apolloDataStore } = session;
	const { assemblyManager } = session;
	const assemblyName = assemblyManager.get(assemblyId)?.displayName ?? assemblyId;
	const gridColumns = [
		{ field: "sequence" },
		{
			field: "typeName",
			headerName: "Change type",
			width: 200,
			type: "singleSelect",
			valueOptions: [..._apollo_annotation_common.changeRegistry.changes.keys()]
		},
		{
			field: "changeData",
			headerName: "Change JSON",
			width: 600,
			sortable: false,
			filterable: false,
			renderCell: ({ value }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
				className: classes.changeTextarea,
				value: JSON.stringify(value),
				readOnly: true
			})
		},
		{
			field: "user",
			headerName: "User",
			width: 140
		},
		{
			field: "createdAt",
			headerName: "Time",
			width: 160,
			type: "dateTime",
			valueGetter: (value) => value && new Date(value)
		}
	];
	(0, react.useEffect)(() => {
		async function getGridData() {
			const backendDriver = apolloDataStore.getBackendDriver(assemblyId);
			if (!backendDriver) {
				setErrorMessage(`No driver found for assembly "${assemblyId}"`);
				return;
			}
			setLoading(true);
			const [sortEntry] = sortModel;
			const sortField = sortEntry?.field;
			const sortOrderValue = sortEntry?.sort;
			const { changes, totalCount } = await backendDriver.getChanges(assemblyId, {
				page: paginationModel.page,
				pageSize: paginationModel.pageSize,
				sortField,
				sortOrder: sortOrderValue === "asc" || sortOrderValue === "desc" ? sortOrderValue : void 0,
				filters: buildFiltersFromModel(filterModel)
			});
			const gridData = changes.map((change) => {
				const { sequence, typeName, changes: nestedChanges, user, createdAt, ...rest } = change;
				return {
					sequence,
					typeName,
					changeData: nestedChanges ?? {
						typeName,
						...rest
					},
					user,
					createdAt
				};
			});
			setDisplayGridData(gridData);
			setRowCount(totalCount);
		}
		getGridData().catch((error) => {
			setErrorMessage(String(error));
		}).finally(() => {
			setLoading(false);
		});
	}, [
		apolloDataStore,
		assemblyId,
		paginationModel,
		sortModel,
		filterModel
	]);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		fullScreen: true,
		title: "View change log",
		handleClose,
		"data-testid": "view-changelog",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContentText, { children: ["Changes for ", assemblyName] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_x_data_grid.DataGrid, {
				pagination: true,
				paginationMode: "server",
				sortingMode: "server",
				filterMode: "server",
				rowCount,
				paginationModel,
				onPaginationModelChange: setPaginationModel,
				sortModel,
				onSortModelChange: setSortModel,
				filterModel,
				onFilterModelChange: setFilterModel,
				loading,
				rows: displayGridData,
				columns: gridColumns,
				getRowId: (row) => row.sequence,
				showToolbar: true,
				pageSizeOptions: [
					5,
					15,
					25,
					50,
					100
				],
				initialState: { columns: { columnVisibilityModel: { sequence: false } } }
			})] }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogActions, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "submit",
				onClick: handleClose,
				children: "Close"
			}) }),
			errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
				color: "error",
				children: errorMessage
			}) }) : null
		]
	});
}
//#endregion
//#region src/components/AddRefSeqAliases.tsx
const columns = [{
	field: "refName",
	headerName: "Ref Name"
}, {
	field: "aliases",
	headerName: "Aliases",
	editable: true,
	flex: 1
}];
const isGeneratedObjectId = (key) => {
	return /^[\da-f]{24}$/i.test(key);
};
const AddRefSeqAliases = (0, mobx_react.observer)(function AddRefSeqAliases({ changeManager, handleClose, session }) {
	const fileRef = (0, react.useRef)(null);
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const [enableSubmit, setEnableSubmit] = (0, react.useState)(false);
	const [selectedAssembly, setSelectedAssembly] = (0, react.useState)();
	const [selectedRows, setSelectedRows] = (0, react.useState)([]);
	const [refNameAliasMap, setRefNameAliasMap] = (0, react.useState)(() => /* @__PURE__ */ new Map());
	const { apolloDataStore } = session;
	const { collaborationServerDriver } = apolloDataStore;
	const assemblies = collaborationServerDriver.getAssemblies();
	(0, react.useEffect)(() => {
		if (assemblies.length > 0) {
			setSelectedAssembly(assemblies[0]);
			collaborationServerDriver.getRefNameAliases(assemblies[0].name).then((refNameAliases) => {
				initializeRefNameAliasMap(refNameAliases);
			}).catch(() => {
				setRefNameAliasMap(/* @__PURE__ */ new Map());
				setErrorMessage("Error fetching refName aliases for assembly");
			});
		}
	}, []);
	const initializeRefNameAliasMap = (refNameAliasesList) => {
		const initialMap = /* @__PURE__ */ new Map();
		for (const refNameAliases of refNameAliasesList) {
			const key = refNameAliases.refName;
			if (isGeneratedObjectId(key)) continue;
			initialMap.set(key, refNameAliases.aliases);
		}
		setRefNameAliasMap(initialMap);
	};
	const handleChangeAssembly = (e) => {
		const newAssembly = assemblies.find((asm) => asm.name === e.target.value);
		setSelectedAssembly(newAssembly);
		if (!newAssembly?.name) return;
		collaborationServerDriver.getRefNameAliases(newAssembly.name).then((refNameAliases) => {
			initializeRefNameAliasMap(refNameAliases);
			setErrorMessage("");
		}).catch(() => {
			setRefNameAliasMap(/* @__PURE__ */ new Map());
			setErrorMessage("Error fetching refName aliases for assembly");
		});
		setEnableSubmit(false);
		if (fileRef.current) fileRef.current.value = "";
	};
	const handleChangeFile = async (e) => {
		if (!e.target.files) return;
		const lines = (await e.target.files[0].text()).split("\n");
		const newMap = new Map(refNameAliasMap);
		setErrorMessage("");
		for (const line of lines) {
			const aliases = line.split("	");
			for (const alias of aliases) if (newMap.has(alias)) newMap.set(alias, [...newMap.get(alias) ?? [], ...aliases]);
		}
		setRefNameAliasMap(newMap);
	};
	const handleChangeFileHandler = (e) => {
		handleChangeFile(e).catch(() => {
			setErrorMessage("Error reading file");
		});
	};
	const rowSelectionChange = (gridRowSelectionModel) => {
		const { ids } = gridRowSelectionModel;
		if (ids.size > 0) {
			setEnableSubmit(true);
			const selectedRows = [...ids.values()].flatMap((id) => getTableRows().filter((row) => String(row.id) === String(id)));
			setSelectedRows(selectedRows);
		} else {
			setEnableSubmit(false);
			setSelectedRows([]);
		}
	};
	const getTableRows = () => {
		return [...refNameAliasMap].map((ele, i) => ({
			id: i,
			refName: ele[0],
			aliases: ele[1].filter((alias) => alias !== ele[0]).join(", ")
		}));
	};
	const processRowUpdate = (newRow, _oldRow) => {
		const newMap = new Map(refNameAliasMap);
		newMap.set(newRow.refName, newRow.aliases.split(","));
		setRefNameAliasMap(newMap);
		return newRow;
	};
	const handleSubmit = () => {
		const refSeqAliases = [];
		for (const row of selectedRows) {
			const { refName } = row;
			const aliases = row.aliases.split(",").map((alias) => alias.trim()).filter((alias) => alias.length > 0);
			refSeqAliases.push({
				refName,
				aliases
			});
		}
		setErrorMessage("");
		if (!selectedAssembly) {
			setErrorMessage("No assembly selected");
			return;
		}
		const change = new _apollo_annotation_shared.AddRefSeqAliasesChange({
			typeName: "AddRefSeqAliasesChange",
			assembly: selectedAssembly.name,
			refSeqAliases
		});
		changeManager.submit(change).catch(() => {
			setErrorMessage("Error submitting change");
		});
		handleClose();
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Add reference sequence aliases",
		handleClose,
		maxWidth: "sm",
		"data-testid": "add-refseq-alias",
		fullWidth: true,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, {
				style: {
					display: "flex",
					flexDirection: "column"
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Grid, {
					container: true,
					spacing: 2,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.FormControl, {
						disabled: enableSubmit && !errorMessage,
						fullWidth: true,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.InputLabel, {
							id: "demo-simple-select-label",
							children: "Assembly"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Select, {
							labelId: "demo-simple-select-label",
							id: "demo-simple-select",
							label: "Assembly",
							value: selectedAssembly?.name ?? "",
							onChange: handleChangeAssembly,
							style: { minWidth: 150 },
							children: assemblies.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, {
								value: option.name,
								children: option.displayName
							}, option.name))
						})]
					}) }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Grid, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.InputLabel, { children: "Load RefName alias" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "file",
						onChange: handleChangeFileHandler,
						ref: fileRef,
						disabled: enableSubmit && !errorMessage || !selectedAssembly
					})] })]
				}), selectedAssembly && refNameAliasMap.size > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						height: 200,
						width: "100%",
						marginTop: 20
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.InputLabel, { children: "Refname aliases found for selected assembly." }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_x_data_grid.DataGrid, {
						rows: getTableRows(),
						columns,
						initialState: { pagination: { paginationModel: {
							page: 0,
							pageSize: 5
						} } },
						pageSizeOptions: [5, 10],
						onRowSelectionModelChange: rowSelectionChange,
						processRowUpdate,
						checkboxSelection: true,
						disableRowSelectionExcludeModel: true
					})]
				}) : null]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "contained",
				type: "submit",
				disabled: !enableSubmit,
				onClick: handleSubmit,
				children: "Submit"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "submit",
				onClick: handleClose,
				children: "Close"
			})] }),
			errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
				color: "error",
				children: errorMessage
			}) }) : null
		]
	});
});
//#endregion
//#region src/components/ViewCheckResults.tsx
function ViewCheckResults({ handleClose, session, assembly: assemblyName }) {
	const [errorMessage, setErrorMessage] = (0, react.useState)();
	const [displayGridData, setDisplayGridData] = (0, react.useState)([]);
	const { apolloDataStore } = session;
	const gridColumns = [
		{
			field: "_id",
			headerName: "id",
			width: 50
		},
		{
			field: "name",
			headerName: "Check name",
			width: 200
		},
		{
			field: "refSeq",
			headerName: "Reference sequence ID",
			width: 200
		},
		{
			field: "ids",
			headerName: "Feature IDs",
			width: 200
		},
		{
			field: "message",
			headerName: "Message",
			flex: 1
		}
	];
	(0, react.useEffect)(() => {
		async function getGridData() {
			const backendDriver = apolloDataStore.getBackendDriver(assemblyName);
			if (!backendDriver) {
				setErrorMessage(`No driver found for assembly "${assemblyName}"`);
				return;
			}
			const data = await backendDriver.getCheckResults(assemblyName);
			setDisplayGridData(data);
		}
		getGridData().catch((error) => {
			setErrorMessage(String(error));
		});
	}, [apolloDataStore, assemblyName]);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		fullScreen: true,
		title: "View check results",
		handleClose,
		"data-testid": "view-check-results",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContentText, { children: ["Check results for ", assemblyName] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_x_data_grid.DataGrid, {
				pagination: true,
				rows: displayGridData,
				columns: gridColumns,
				getRowId: (row) => row._id,
				showToolbar: true,
				initialState: {
					sorting: { sortModel: [{
						field: "name",
						sort: "asc"
					}] },
					columns: { columnVisibilityModel: { name: true } }
				}
			})] }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogActions, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "submit",
				onClick: handleClose,
				children: "Close"
			}) }),
			errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
				color: "error",
				children: errorMessage
			}) }) : null
		]
	});
}
//#endregion
//#region src/components/SplitExon.tsx
function exonIsSplittable(exonToBeSplit) {
	if (exonToBeSplit.max - exonToBeSplit.min < 2) return {
		isSplittable: false,
		comment: "This exon is too short to be split"
	};
	return {
		isSplittable: true,
		comment: ""
	};
}
function makeDialogText(splitExon) {
	const splittable = exonIsSplittable(splitExon);
	if (splittable.isSplittable) return "Are you sure you want to split the selected exon?";
	return splittable.comment;
}
function SplitExon({ changeManager, handleClose, selectedFeature, setSelectedFeature, sourceAssemblyId, sourceFeature }) {
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const exonToBeSplit = (0, _jbrowse_mobx_state_tree.getSnapshot)(sourceFeature);
	function onSubmit(event) {
		event.preventDefault();
		setErrorMessage("");
		if (selectedFeature?._id === sourceFeature._id) setSelectedFeature();
		const midpoint = exonToBeSplit.min + (exonToBeSplit.max - exonToBeSplit.min) / 2;
		const upstreamCut = Math.floor(midpoint);
		const downstreamCut = Math.ceil(midpoint);
		if (!sourceFeature.parent?._id) throw new Error("Splitting an exon without parent is not possible yet");
		const change = new _apollo_annotation_shared.SplitExonChange({
			changedIds: [sourceFeature._id],
			typeName: "SplitExonChange",
			assembly: sourceAssemblyId,
			exonToBeSplit,
			parentFeatureId: sourceFeature.parent._id,
			upstreamCut,
			downstreamCut,
			leftExonId: new bson_objectid.default().toHexString(),
			rightExonId: new bson_objectid.default().toHexString()
		});
		changeManager.submit(change);
		handleClose();
		event.preventDefault();
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Split exon",
		handleClose,
		maxWidth: false,
		"data-testid": "split-exon",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			onSubmit,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, {
				style: {
					display: "flex",
					flexDirection: "column"
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: makeDialogText(exonToBeSplit) })
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "contained",
				type: "submit",
				disabled: !exonIsSplittable(exonToBeSplit).isSplittable,
				children: "Yes"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "submit",
				onClick: handleClose,
				children: "Cancel"
			})] })]
		}), errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
			color: "error",
			children: errorMessage
		}) }) : null]
	});
}
//#endregion
//#region src/components/DuplicateTranscript.tsx
function DuplicateTranscript({ changeManager, handleClose, session, sourceAssemblyId, sourceFeature, setSelectedFeature }) {
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const { notify } = session;
	async function onSubmit(event) {
		event.preventDefault();
		setErrorMessage("");
		try {
			const parentGene = sourceFeature.parent;
			if (!parentGene) {
				setErrorMessage("No parent gene found for this transcript");
				return;
			}
			const transcriptSnapshot = (0, _jbrowse_mobx_state_tree.getSnapshot)(sourceFeature);
			const newTranscriptId = new bson_objectid.default().toHexString();
			const duplicateTranscript = {
				...transcriptSnapshot,
				_id: newTranscriptId
			};
			if (duplicateTranscript.children) {
				const newChildren = {};
				for (const [, child] of Object.entries(duplicateTranscript.children)) {
					const newChildId = new bson_objectid.default().toHexString();
					newChildren[newChildId] = {
						...child,
						_id: newChildId
					};
				}
				duplicateTranscript.children = newChildren;
			}
			const configuredSkippedAttributes = (0, _jbrowse_core_configuration.readConfObject)(session.getPluginConfiguration(), "skippedAttributesOnCopy");
			removeSkippedAttributes(duplicateTranscript, new Set(configuredSkippedAttributes ?? []));
			const change = new _apollo_annotation_shared.AddFeatureChange({
				parentFeatureId: parentGene._id,
				changedIds: [parentGene._id],
				typeName: "AddFeatureChange",
				assembly: sourceAssemblyId,
				addedFeature: duplicateTranscript
			});
			await changeManager.submit(change).then(() => {
				setSelectedFeature(void 0);
				session.apolloSetSelectedFeature(newTranscriptId);
				notify("Successfully duplicated transcript", "success");
			});
			handleClose();
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : "Failed to duplicate transcript");
		}
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Duplicate transcript",
		handleClose,
		maxWidth: false,
		"data-testid": "duplicate-transcript",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			onSubmit: (event) => {
				onSubmit(event);
			},
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, {
				style: {
					display: "flex",
					flexDirection: "column"
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Are you sure you want to create a duplicate of this transcript?" })
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "contained",
				type: "submit",
				children: "Yes"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "button",
				onClick: handleClose,
				children: "Cancel"
			})] })]
		}), errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
			color: "error",
			children: errorMessage
		}) }) : null]
	});
}
//#endregion
//#region src/menus/topLevelMenuAdmin.ts
function addTopLevelAdminMenus(rootModel) {
	rootModel.appendToMenu("Apollo", {
		label: "Admin",
		type: "subMenu",
		icon: _mui_icons_material_AdminPanelSettings.default,
		subMenu: [
			{
				label: "Add Assembly",
				icon: _mui_icons_material_Add.default,
				onClick: (session) => {
					session.queueDialog((doneCallback) => [AddAssembly, {
						session,
						handleClose: () => {
							doneCallback();
						},
						changeManager: session.apolloDataStore.changeManager
					}]);
				}
			},
			{
				label: "Delete Assembly",
				icon: _mui_icons_material_Delete.default,
				onClick: (session) => {
					session.queueDialog((doneCallback) => [DeleteAssembly, {
						session,
						handleClose: () => {
							doneCallback();
						},
						changeManager: session.apolloDataStore.changeManager
					}]);
				}
			},
			{
				label: "Import Features",
				icon: _mui_icons_material_Input.default,
				onClick: (session) => {
					session.queueDialog((doneCallback) => [ImportFeatures, {
						session,
						handleClose: () => {
							doneCallback();
						},
						changeManager: session.apolloDataStore.changeManager
					}]);
				}
			},
			{
				label: "Add reference sequence aliases",
				onClick: (session) => {
					session.queueDialog((doneCallback) => [AddRefSeqAliases, {
						session,
						handleClose: () => {
							doneCallback();
						},
						changeManager: session.apolloDataStore.changeManager
					}]);
				}
			},
			{
				label: "Add Assembly aliases",
				onClick: (session) => {
					session.queueDialog((doneCallback) => [AddAssemblyAliases, {
						session,
						handleClose: () => {
							doneCallback();
						},
						changeManager: session.apolloDataStore.changeManager
					}]);
				}
			},
			{
				label: "Manage Users",
				icon: _mui_icons_material_Person.default,
				onClick: (session) => {
					session.queueDialog((doneCallback) => [ManageUsers, {
						session,
						handleClose: () => {
							doneCallback();
						},
						changeManager: session.apolloDataStore.changeManager
					}]);
				}
			},
			{
				label: "Manage Checks",
				icon: _mui_icons_material_Rule.default,
				onClick: (session) => {
					session.queueDialog((doneCallback) => [ManageChecks, {
						session,
						handleClose: () => {
							doneCallback();
						}
					}]);
				}
			}
		]
	});
}
//#endregion
//#region src/ApolloInternetAccount/components/LoginIcons.tsx
function Google(props) {
	const { color } = props;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.SvgIcon, {
		viewBox: "0 0 18 18",
		style: {
			fontSize: 18,
			marginRight: 4
		},
		...props,
		children: color === "disabled" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9.001,10.71 l0,-3.348 l8.424,0 c0.126,0.567,0.225,1.098,0.225,1.845 c0,5.139,-3.447,8.793,-8.64,8.793 c-4.968,0,-9,-4.032,-9,-9 c0,-4.968,4.032,-9,9,-9 c2.43,0,4.464,0.891,6.021,2.349 l-2.556,2.484 c-0.648,-0.612,-1.782,-1.332,-3.465,-1.332 c-2.979,0,-5.409,2.475,-5.409,5.508 c0,3.033,2.43,5.508,5.409,5.508 c3.447,0,4.716,-2.385,4.95,-3.798 l-4.959,0 l0,-0.009 z" }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
				d: "M17.64,9.20454545 c0,-0.638,-0.057,-1.252,-0.164,-1.841 l-8.476,0 l0,3.481 l4.844,0 c-0.209,1.125,-0.843,2.079,-1.796,2.717 l0,2.258 l2.908,0 c1.702,-1.567,2.684,-3.874,2.684,-6.615 l0,0 z",
				fill: "#4285F4"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
				d: "M9,18 c2.43,0,4.467,-0.806,5.956,-2.18 l-2.908,-2.259 c-0.806,0.54,-1.837,0.859,-3.048,0.859 c-2.344,0,-4.328,-1.583,-5.036,-3.71 l-3.007,0 l0,2.332 c1.481,2.941,4.525,4.958,8.043,4.958 l0,0 z",
				fill: "#34A853"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
				d: "M3.96409091,10.71 c-0.18,-0.54,-0.282,-1.117,-0.282,-1.71 c0,-0.593,0.102,-1.17,0.282,-1.71 l0,-2.332 l-3.007,0 c-0.609,1.215,-0.957,2.59,-0.957,4.042 c0,1.452,0.348,2.827,0.957,4.042 l3.007,-2.332 l0,0 z",
				fill: "#FBBC05"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
				d: "M9,3.57954545 c1.321,0,2.508,0.454,3.44,1.346 l2.582,-2.581 c-1.559,-1.453,-3.596,-2.345,-6.022,-2.345 c-3.518,0,-6.562,2.017,-8.043,4.959 l3.007,2.331 c0.708,-2.127,2.692,-3.71,5.036,-3.71 l0,0 z",
				fill: "#EA4335"
			})
		] })
	});
}
function Microsoft(props) {
	const { color } = props;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.SvgIcon, {
		viewBox: "0 0 21 21",
		style: { fontSize: 21 },
		...props,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "1",
				y: "1",
				width: "9",
				height: "9",
				fill: color === "disabled" ? "#7B7B7B" : "#F25022"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "1",
				y: "11",
				width: "9",
				height: "9",
				fill: color === "disabled" ? "#7B7B7B" : "#00A4EF"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "11",
				y: "1",
				width: "9",
				height: "9",
				fill: color === "disabled" ? "#939393" : "#7FBA00"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "11",
				y: "11",
				width: "9",
				height: "9",
				fill: color === "disabled" ? "#B9B9B9" : "#FFB900"
			})
		]
	});
}
//#endregion
//#region src/ApolloInternetAccount/components/LoginButtons.tsx
const useStyles$12 = (0, tss_react_mui.makeStyles)()((theme) => ({ loginButton: {
	marginBottom: theme.spacing(1),
	width: "220px",
	height: "40px",
	fontSize: "16px",
	textTransform: "none",
	justifyContent: "left",
	padding: "3px 12px"
} }));
function GoogleButton(props) {
	const { classes } = useStyles$12();
	const { message } = props;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
		className: classes.loginButton,
		variant: "outlined",
		startIcon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Google, {}),
		...props,
		children: message
	});
}
function MicrosoftButton(props) {
	const { classes } = useStyles$12();
	const { message } = props;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
		className: classes.loginButton,
		variant: "outlined",
		startIcon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Microsoft, {}),
		...props,
		children: message
	});
}
function GuestButton(props) {
	const { classes } = useStyles$12();
	const { message } = props;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
		className: classes.loginButton,
		variant: "outlined",
		startIcon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_AccountCircle.default, { fontSize: "small" }),
		...props,
		children: message
	});
}
function GenericButton(props) {
	const { classes } = useStyles$12();
	const { message } = props;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
		className: classes.loginButton,
		variant: "outlined",
		startIcon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Business.default, { fontSize: "small" }),
		...props,
		children: message
	});
}
//#endregion
//#region src/ApolloInternetAccount/components/AuthTypeSelector.tsx
const useStyles$11 = (0, tss_react_mui.makeStyles)()((theme) => ({ divider: {
	marginTop: theme.spacing(4),
	marginBottom: theme.spacing(5)
} }));
const AuthTypeSelector = ({ baseURL, handleClose, name }) => {
	const { classes } = useStyles$11();
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const [loginTypes, setLoginTypes] = (0, react.useState)(null);
	(0, react.useEffect)(() => {
		const controller = new AbortController();
		const { signal } = controller;
		async function getAuthTypes() {
			const uri = new URL("auth/types", baseURL).href;
			const response = await fetch(uri, {
				method: "GET",
				signal
			});
			if (!response.ok) {
				const newErrorMessage = await createFetchErrorMessage(response, "Error when retrieving auth types from server");
				setErrorMessage(newErrorMessage);
				return;
			}
			const data = await response.json();
			setLoginTypes(data);
			if (data.length === 0) setErrorMessage("No login types configured");
		}
		getAuthTypes().catch((error) => {
			if (!(0, _jbrowse_core_util_aborting.isAbortException)(error)) setErrorMessage(String(error));
		});
		return () => {
			controller.abort(new DOMException("Error retrieving valid authentication types", "AbortError"));
		};
	}, [baseURL]);
	function handleClick(authType) {
		handleClose(authType);
	}
	if (loginTypes === null) return "Loading…";
	const firstLoginType = loginTypes.at(0);
	if (firstLoginType && loginTypes.length === 1 && !firstLoginType.needsPopup) handleClick(firstLoginType);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: `Log in to ${name}`,
		handleClose,
		maxWidth: false,
		"data-testid": "login-apollo",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, {
				style: {
					display: "flex",
					flexDirection: "column",
					paddingTop: 8
				},
				children: loginTypes.map((loginType) => {
					if (loginType.name === "google") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GoogleButton, {
						message: loginType.message,
						onClick: () => {
							handleClick(loginType);
						}
					}, loginType.name);
					if (loginType.name === "microsoft") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MicrosoftButton, {
						message: loginType.message,
						onClick: () => {
							handleClick(loginType);
						}
					}, loginType.name);
					if (loginType.name === "guest") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react.default.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Divider, { className: classes.divider }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GuestButton, {
						message: loginType.message,
						onClick: () => {
							handleClick(loginType);
						}
					})] }, loginType.name);
					return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GenericButton, {
						message: loginType.message,
						onClick: () => {
							handleClick(loginType);
						}
					}, loginType.name);
				})
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogActions, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "submit",
				onClick: () => {
					handleClose();
				},
				children: "Not now"
			}) }),
			errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
				color: "error",
				children: errorMessage
			}) }) : null
		]
	});
};
//#endregion
//#region src/ApolloInternetAccount/components/LoginInProgress.tsx
/** Shown while the user logs in through a separate login window */
function LoginInProgress({ handleCancel, handleShowWindow, name }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: `Log in to ${name}`,
		handleClose: handleCancel,
		maxWidth: "xs",
		"data-testid": "login-in-progress",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Continue in the login window to finish logging in. If you can't see it, it may be behind this browser window." }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.LinearProgress, { style: { marginTop: 16 } })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
			variant: "contained",
			onClick: handleShowWindow,
			children: "Show login window"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
			variant: "outlined",
			onClick: handleCancel,
			children: "Cancel"
		})] })]
	});
}
//#endregion
//#region src/ApolloInternetAccount/components/NoAccess.tsx
/** Shown when the user is logged in but an admin hasn't given them a role */
function NoAccess({ email, handleCheckAgain, handleClose, handleSwitchAccount, name, username }) {
	const [checking, setChecking] = (0, react.useState)(false);
	const [checkResult, setCheckResult] = (0, react.useState)("");
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	async function checkAgain() {
		setChecking(true);
		setCheckResult("");
		setErrorMessage("");
		try {
			if (!await handleCheckAgain()) setCheckResult(`Still no access as of ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}.`);
		} catch (error) {
			setErrorMessage(`Could not check access: ${error instanceof Error ? error.message : String(error)}`);
		} finally {
			setChecking(false);
		}
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: `No access to ${name} yet`,
		handleClose,
		maxWidth: "sm",
		"data-testid": "no-access",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, { children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContentText, { children: [
				"You're logged in as ",
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: username }),
				email && email !== username ? ` (${email})` : null,
				", but an administrator hasn't given this account access yet. Ask your administrator to give you access, then check again."
			] }),
			checkResult ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
				style: { marginTop: 16 },
				children: checkResult
			}) : null,
			errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
				color: "error",
				style: { marginTop: 16 },
				children: errorMessage
			}) : null
		] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "contained",
				disabled: checking,
				onClick: () => {
					checkAgain();
				},
				children: checking ? "Checking…" : "Check again"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				onClick: handleSwitchAccount,
				children: "Log in with a different account"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				onClick: handleClose,
				children: "Close"
			})
		] })]
	});
}
//#endregion
//#region src/ApolloInternetAccount/loginErrors.ts
/** Thrown when the user dismisses the login dialog without choosing a login */
var LoginCancelledError = class extends Error {
	constructor() {
		super("User chose not to log in");
		this.name = "LoginCancelledError";
	}
};
/** Thrown when the user tried to log in but it didn't work */
var LoginFailedError = class extends Error {
	constructor(cause) {
		super(cause instanceof Error ? cause.message : String(cause), { cause });
		this.name = "LoginFailedError";
	}
};
//#endregion
//#region src/ApolloInternetAccount/model.ts
const inWebWorker$1 = typeof sessionStorage === "undefined";
/**
* The server explains why it refused a login in the "message" of its JSON
* error body, so show that instead of the raw response
*/
async function getLoginErrorMessage(response) {
	try {
		const { message } = await response.clone().json();
		if (typeof message === "string") return message;
	} catch {}
	return createFetchErrorMessage(response, "Error when logging in");
}
const stateModelFactory$3 = (configSchema) => {
	return _jbrowse_core_pluggableElementTypes.InternetAccount.named("ApolloInternetAccount").props({
		type: _jbrowse_mobx_state_tree.types.literal("ApolloInternetAccount"),
		configuration: (0, _jbrowse_core_configuration.ConfigurationReference)(configSchema)
	}).views((self) => ({
		get baseURL() {
			return (0, _jbrowse_core_configuration.getConf)(self, "baseURL");
		},
		/**
		* Set when the user asks to log in with a different account, so the next
		* login asks the identity provider to let them choose one
		*/
		get selectAccountKey() {
			return `${self.internetAccountId}-selectAccount`;
		},
		getUserId() {
			const token = self.retrieveToken();
			if (!token) return;
			return (0, _apollo_annotation_shared.getDecodedToken)(token).id;
		}
	})).volatile(() => ({
		role: void 0,
		controller: new AbortController(),
		tokenPromise: void 0
	})).actions((self) => ({ setRole() {
		const token = self.retrieveToken();
		if (!token) {
			self.role = void 0;
			return;
		}
		const { role, exp } = (0, _apollo_annotation_shared.getDecodedToken)(token);
		if (exp < Date.now() / 1e3) {
			self.role = void 0;
			self.removeToken();
			return;
		}
		if (self.role !== role) self.role = role;
	} })).actions((self) => {
		const superGetFetcher = self.getFetcher;
		return { getFetcher(loc) {
			const fetcher = superGetFetcher(loc);
			return async (input, init) => {
				const response = await fetcher(input, init);
				if (response.status === 403) {
					self.removeToken();
					self.setRole();
					return fetcher(input, init);
				}
				return response;
			};
		} };
	}).actions((self) => ({ removeToken() {
		sessionStorage.removeItem(self.tokenKey);
		self.tokenPromise = void 0;
	} })).actions((self) => ({ async getToken(location) {
		if (self.tokenPromise) return self.tokenPromise;
		let token = location?.internetAccountPreAuthorization?.authInfo?.token;
		if (token) {
			self.tokenPromise = Promise.resolve(token);
			return self.tokenPromise;
		}
		if (inWebWorker$1) throw new Error("Did not get internet account pre-authorization info in worker");
		token = self.retrieveToken();
		if (token) {
			self.tokenPromise = Promise.resolve(token);
			return self.tokenPromise;
		}
		self.tokenPromise = new Promise((resolve, reject) => {
			self.getTokenFromUser((token) => {
				self.storeToken(token);
				resolve(token);
			}, (error) => {
				self.removeToken();
				reject(error instanceof LoginCancelledError ? error : new LoginFailedError(error));
			});
		});
		return self.tokenPromise;
	} })).actions((self) => {
		let listener;
		let popupClosedPoll;
		let closeProgressDialog;
		return {
			addMessageChannel(resolve, reject) {
				listener = (event) => {
					this.finishOAuthWindow(event, resolve, reject);
				};
				window.addEventListener("message", listener);
			},
			deleteMessageChannel() {
				window.removeEventListener("message", listener);
				clearInterval(popupClosedPoll);
				popupClosedPoll = void 0;
				closeProgressDialog?.();
				closeProgressDialog = void 0;
			},
			finishOAuthWindow(event, resolve, reject) {
				if (event.data.name !== `JBrowseAuthWindow-${self.internetAccountId}`) return;
				const fixedQueryString = event.data.redirectUri.replace("#", "?");
				const queryStringSearch = new URL(fixedQueryString).search;
				const urlParams = new URLSearchParams(queryStringSearch);
				const token = urlParams.get("access_token");
				const error = urlParams.get("error");
				this.deleteMessageChannel();
				if (error) {
					reject(new Error(error));
					return;
				}
				if (!token) {
					reject(/* @__PURE__ */ new Error("Error with token endpoint"));
					return;
				}
				self.storeToken(token);
				sessionStorage.removeItem(self.selectAccountKey);
				self.setRole();
				resolve(token);
			},
			/**
			* The login window can open behind the browser or get lost among other
			* windows, so show that a login is underway and let the user find or
			* abandon it
			*/
			showLoginProgress(popup, reject) {
				const { session } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
				session.queueDialog((doneCallback) => {
					closeProgressDialog = doneCallback;
					return [LoginInProgress, {
						name: self.name,
						handleShowWindow: () => {
							popup.focus();
						},
						handleCancel: () => {
							this.deleteMessageChannel();
							popup.close();
							reject(new LoginCancelledError());
						}
					}];
				});
			},
			/**
			* If the user closes the login window without logging in, nothing is
			* sent back, so treat it as them choosing not to log in
			*/
			watchForPopupClosed(popup, reject) {
				popupClosedPoll = setInterval(() => {
					if (!popup.closed) return;
					clearInterval(popupClosedPoll);
					const poll = popupClosedPoll;
					setTimeout(() => {
						if (popupClosedPoll === poll) {
							this.deleteMessageChannel();
							reject(new LoginCancelledError());
						}
					}, 1e3);
				}, 500);
			},
			async openAuthWindow(type, resolve, reject) {
				const redirectUri = _jbrowse_core_util.isElectron ? "http://localhost/auth" : globalThis.location.origin + globalThis.location.pathname;
				const url = new URL("auth/login", self.baseURL);
				const params = new URLSearchParams({
					type,
					redirect_uri: redirectUri
				});
				if (sessionStorage.getItem(self.selectAccountKey)) params.set("prompt", "select_account");
				url.search = params.toString();
				const eventName = `JBrowseAuthWindow-${self.internetAccountId}`;
				if (_jbrowse_core_util.isElectron) {
					const { ipcRenderer } = globalThis.require("electron");
					const redirectUriFromElectron = await ipcRenderer.invoke("openAuthWindow", {
						internetAccountId: self.internetAccountId,
						data: { redirect_uri: redirectUri },
						url: url.toString()
					});
					const eventFromDesktop = new MessageEvent("message", { data: {
						name: eventName,
						redirectUri: redirectUriFromElectron
					} });
					this.finishOAuthWindow(eventFromDesktop, resolve, reject);
				} else {
					this.addMessageChannel(resolve, reject);
					const popup = window.open(url, eventName, "width=500,height=600");
					if (!popup) {
						this.deleteMessageChannel();
						reject(/* @__PURE__ */ new Error("The login window was blocked. Allow pop-ups for this site and try again."));
						return;
					}
					this.showLoginProgress(popup, reject);
					this.watchForPopupClosed(popup, reject);
				}
			}
		};
	}).actions((self) => ({ async getTokenFromUser(resolve, reject) {
		try {
			const { baseURL } = self;
			const authType = await new Promise((resolve, reject) => {
				const { session } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
				const { baseURL, name } = self;
				session.queueDialog((doneCallback) => [AuthTypeSelector, {
					name,
					handleClose: (newAuthType) => {
						if (!newAuthType) reject(new LoginCancelledError());
						else if (newAuthType instanceof Error) reject(newAuthType);
						else resolve(newAuthType);
						doneCallback();
					},
					baseURL
				}]);
			});
			if (authType.needsPopup) {
				await self.openAuthWindow(authType.name, resolve, reject);
				return;
			}
			const url = new URL("auth/login", baseURL);
			url.search = new URLSearchParams({ type: authType.name }).toString();
			const uri = url.toString();
			const response = await fetch(uri, { signal: self.controller.signal });
			if (!response.ok) {
				reject(new Error(await getLoginErrorMessage(response)));
				return;
			}
			const { token } = await response.json();
			resolve(token);
		} catch (error) {
			reject(error instanceof Error ? error : new Error(String(error)));
		}
	} })).volatile(() => ({ loginMenuItemAdded: false })).actions((self) => ({ setLoginMenuItemAdded() {
		self.loginMenuItemAdded = true;
	} })).actions((self) => {
		/**
		* Reopen the login dialog. A successful login reloads the page so that
		* the session loads this server's assemblies and tracks.
		*/
		async function logIn() {
			try {
				await self.getToken();
			} catch (error) {
				if (error instanceof LoginCancelledError) return;
				offerLogin(error instanceof Error ? error : new LoginFailedError(error));
				return;
			}
			globalThis.location.reload();
		}
		/**
		* Called when the user didn't log in, either because they dismissed the
		* login dialog or because logging in failed. Tells them what they are
		* missing and gives them ways to log in later.
		*/
		function offerLogin(error) {
			const rootModel = (0, _jbrowse_mobx_state_tree.getRoot)(self);
			const { internetAccounts } = rootModel;
			const session = rootModel.session;
			const logInAction = {
				name: "Log in",
				onClick: () => {
					logIn();
				}
			};
			if (error === void 0) session.notify(`Not logged in to ${self.name}. Apollo features are unavailable until you log in.`, "warning", logInAction);
			else session.notifyError(`Could not log in to ${self.name}: ${error.message}`, error, void 0, logInAction);
			if (!self.loginMenuItemAdded && (0, _jbrowse_core_util.isAbstractMenuManager)(rootModel)) {
				const apolloAccountCount = internetAccounts.filter((ia) => ia.type === "ApolloInternetAccount").length;
				rootModel.appendToMenu("Apollo", {
					label: apolloAccountCount > 1 ? `Log in to ${self.name}` : "Log in",
					icon: _mui_icons_material_Login.default,
					onClick: () => {
						logIn();
					}
				});
				self.setLoginMenuItemAdded();
			}
		}
		return {
			logIn,
			offerLogin
		};
	}).actions((self) => ({
		/**
		* Ask the server for a token with the user's current role, and reload
		* with it if an admin has given them access
		* @returns whether the user has access now
		*/
		async checkAccess() {
			const token = self.retrieveToken();
			if (!token) throw new Error("Not logged in");
			const uri = new URL("auth/refresh", self.baseURL).href;
			const response = await fetch(uri, {
				method: "POST",
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!response.ok) throw new Error(await createFetchErrorMessage(response));
			const { token: newToken } = await response.json();
			const { role } = (0, _apollo_annotation_shared.getDecodedToken)(newToken);
			if (!role || role === "none") return false;
			self.storeToken(newToken);
			globalThis.location.reload();
			return true;
		},
		switchAccount() {
			self.removeToken();
			sessionStorage.setItem(self.selectAccountKey, "true");
			globalThis.location.reload();
		}
	})).actions((self) => ({ showNoAccess() {
		const token = self.retrieveToken();
		const { email = "", username = "" } = token ? (0, _apollo_annotation_shared.getDecodedToken)(token) : {};
		const { session } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
		session.queueDialog((doneCallback) => [NoAccess, {
			name: self.name,
			username,
			email,
			handleCheckAgain: self.checkAccess,
			handleSwitchAccount: () => {
				doneCallback();
				self.switchAccount();
			},
			handleClose: doneCallback
		}]);
	} })).volatile(() => ({ lastChangeSequenceNumber: void 0 })).actions((self) => ({ setLastChangeSequenceNumber(sequenceNumber) {
		self.lastChangeSequenceNumber = sequenceNumber;
	} })).actions((self) => ({
		updateLastChangeSequenceNumber: (0, _jbrowse_mobx_state_tree.flow)(function* updateLastChangeSequenceNumber() {
			const { baseURL } = self;
			const url = new URL("changes", baseURL);
			url.search = new URLSearchParams({ limit: "1" }).toString();
			const uri = url.toString();
			const apolloFetch = self.getFetcher({
				locationType: "UriLocation",
				uri
			});
			let response;
			try {
				response = yield apolloFetch(uri, {
					method: "GET",
					signal: self.controller.signal
				});
			} catch (error) {
				if (!self.controller.signal.aborted) console.error(error);
				return;
			}
			if (!response.ok) {
				const errorMessage = yield createFetchErrorMessage(response, "Error when fetching server LastChangeSequence");
				throw new Error(errorMessage);
			}
			const { changes } = yield response.json();
			self.setLastChangeSequenceNumber(changes.length > 0 ? changes[0].sequence : 0);
		}),
		getMissingChanges: (0, _jbrowse_mobx_state_tree.flow)(function* getMissingChanges() {
			const { session } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
			const { changeManager } = session.apolloDataStore;
			if (!self.lastChangeSequenceNumber) throw new Error("No LastChangeSequence stored in session. Please, refresh you browser to get last updates from server");
			const { baseURL, lastChangeSequenceNumber } = self;
			const url = new URL("changes", baseURL);
			url.search = new URLSearchParams({
				since: String(lastChangeSequenceNumber),
				sort: "1"
			}).toString();
			const uri = url.toString();
			const apolloFetch = self.getFetcher({
				locationType: "UriLocation",
				uri
			});
			let serializedChanges;
			try {
				const response = yield apolloFetch(uri, {
					method: "GET",
					signal: self.controller.signal
				});
				if (!response.ok) {
					console.error(`Error when fetching the last updates to recover socket connection — ${response.status}`);
					return;
				}
				({changes: serializedChanges} = yield response.json());
			} catch (error) {
				if (!self.controller.signal.aborted) console.error(error);
				return;
			}
			for (const serializedChange of serializedChanges) {
				const change = _apollo_annotation_common.Change.fromJSON(serializedChange);
				changeManager.submit(change, { submitToBackend: false });
			}
		})
	})).volatile((self) => {
		const { origin, pathname: path } = new URL("socket.io/", self.baseURL);
		return { socket: (0, socket_io_client.io)(origin, { path }) };
	}).actions((self) => ({ addSocketListeners() {
		const { session } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
		const { notify } = session;
		const token = self.retrieveToken();
		if (!token) throw new Error("No Token found");
		const user = (0, _apollo_annotation_shared.getDecodedToken)(token);
		const localSessionId = (0, _apollo_annotation_shared.makeUserSessionId)(user);
		const { socket } = self;
		const { addCheckResult, changeManager, deleteCheckResult } = session.apolloDataStore;
		socket.on("connect", () => {
			if (!self.lastChangeSequenceNumber) return;
			self.getMissingChanges();
		});
		socket.on("connect_error", (error) => {
			console.error(error);
			notify("Could not connect to the Apollo server.", "error");
		});
		socket.on("COMMON", (message) => {
			if ("checkResult" in message) {
				if (message.deleted) deleteCheckResult(message.checkResult._id);
				else addCheckResult(message.checkResult);
				return;
			}
			sessionStorage.setItem("LastChangeSequence", String(message.changeSequence));
			if (message.userSessionId === localSessionId) return;
			const change = _apollo_annotation_common.Change.fromJSON(message.changeInfo);
			changeManager.submit(change, { submitToBackend: false });
		});
		socket.on("USER_LOCATION", (message) => {
			const { channel, locations, userName, userSessionId } = message;
			if (channel === "USER_LOCATION" && userSessionId !== localSessionId) session.addOrUpdateCollaborator({
				name: userName,
				id: userSessionId,
				locations
			});
		});
		socket.on("REQUEST_INFORMATION", (message) => {
			const { channel, userSessionId } = message;
			if (channel === "REQUEST_INFORMATION" && userSessionId !== token) session.broadcastLocations();
		});
	} })).actions((self) => {
		async function postUserLocation(userLoc) {
			if (!(0, _jbrowse_mobx_state_tree.isAlive)(self) || self.role === "none") return;
			const { baseURL, controller } = self;
			const url = new URL("users/userLocation", baseURL).href;
			const userLocation = new URLSearchParams(JSON.stringify(userLoc));
			const apolloFetch = self.getFetcher({
				locationType: "UriLocation",
				uri: url
			});
			try {
				if (!(await apolloFetch(url, {
					method: "POST",
					body: userLocation,
					signal: controller.signal
				})).ok) throw new Error("ignore");
			} catch {
				console.error("Broadcasting user location failed");
			}
		}
		const debounceTimeout = 300;
		const debouncePostUserLocation = (fn) => {
			let timeoutId;
			return (userLocation) => {
				clearTimeout(timeoutId);
				timeoutId = setTimeout(() => {
					fn(userLocation);
				}, debounceTimeout);
			};
		};
		return { postUserLocation: debouncePostUserLocation(postUserLocation) };
	}).actions((self) => {
		function beforeUnloadListener() {
			self.postUserLocation([]);
		}
		function visibilityChangeListener() {
			if (document.visibilityState === "hidden") self.postUserLocation([]);
			if (document.visibilityState === "visible") {
				const { session } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
				session.broadcastLocations();
			}
		}
		return {
			/**
			* The half of startup that must happen exactly once. None of it is a
			* request, so nothing here is worth retrying — and all of it registers
			* something that has no idea it has been registered before. A menu
			* contribution is appended to a log the root model replays on every
			* open, and each socket handler is a fresh arrow function socket.io
			* cannot recognize as a repeat, so a second run means a second "Admin"
			* submenu and every COMMON message submitted to the change manager
			* twice. (The two addEventListener calls are the exception, and only by
			* luck: the handler references are stable, so the browser de-duplicates
			* them for us.)
			*
			* `addSocketListeners()` goes first because it is the only step that
			* can throw — 'No Token found', before it has registered anything — so
			* a failed run leaves nothing installed and the caller can simply try
			* again. That ordering is what lets `afterAttach` enforce "at most
			* once" without a flag.
			*/
			install(role) {
				if (role === "none") {
					self.showNoAccess();
					const rootModel = (0, _jbrowse_mobx_state_tree.getRoot)(self);
					if ((0, _jbrowse_core_util.isAbstractMenuManager)(rootModel)) rootModel.appendToMenu("Apollo", {
						label: "Check access",
						icon: _mui_icons_material_LockPerson.default,
						onClick: () => {
							self.showNoAccess();
						}
					});
					return;
				}
				self.addSocketListeners();
				const rootModel = (0, _jbrowse_mobx_state_tree.getRoot)(self);
				if (role === "admin" && (0, _jbrowse_core_util.isAbstractMenuManager)(rootModel)) addTopLevelAdminMenus(rootModel);
				window.addEventListener("beforeunload", beforeUnloadListener);
				document.addEventListener("visibilitychange", visibilityChangeListener);
			},
			/**
			* The other half: everything that talks to the server, and so is
			* expected to fail and be retried. It leaves nothing behind, so running
			* it again costs a request and nothing else.
			*/
			loadInitialState: (0, _jbrowse_mobx_state_tree.flow)(function* loadInitialState() {
				yield self.updateLastChangeSequenceNumber();
				const { baseURL } = self;
				const uri = new URL("users/locations", baseURL).href;
				yield self.getFetcher({
					locationType: "UriLocation",
					uri
				})(uri, {
					method: "GET",
					signal: self.controller.signal
				});
			}),
			/**
			* Warns the user if this plugin and the server it talks to are not the
			* same version, since mismatched changes or endpoints can corrupt data
			* or fail in confusing ways. Doesn't need a token, so it runs as soon as
			* there's a session to show the warning in.
			*/
			checkServerVersion: (0, _jbrowse_mobx_state_tree.flow)(function* checkServerVersion() {
				const uri = new URL("health/version", self.baseURL).href;
				let serverVersion;
				try {
					const response = yield fetch(uri, { signal: self.controller.signal });
					if (response.ok) ({version: serverVersion} = yield response.json());
					else if (response.status !== 404) {
						console.error(yield createFetchErrorMessage(response, "Error when checking Apollo server version"));
						return;
					}
				} catch (error) {
					if (!self.controller.signal.aborted) console.error(error);
					return;
				}
				if (serverVersion === version || !(0, _jbrowse_mobx_state_tree.isAlive)(self)) return;
				const { session } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
				session.notify(`The Apollo server at ${self.baseURL} is ${serverVersion ? `version ${serverVersion}` : "an older version"}, but this Apollo plugin is version ${version}. Apollo may not work correctly until they match. Ask your administrator to update ${serverVersion ? "one of them" : "the server"}.`, "error");
			}),
			removeBeforeUnloadListener() {
				window.removeEventListener("beforeunload", beforeUnloadListener);
			},
			removeVisibilityChangeListener() {
				document.removeEventListener("visibilitychange", visibilityChangeListener);
			}
		};
	}).actions((self) => ({
		afterAttach() {
			self.setRole();
			(0, mobx.autorun)((reaction) => {
				if (inWebWorker$1) return;
				const { session } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
				if (!session) return;
				reaction.dispose();
				self.checkServerVersion();
			}, { name: "ApolloInternetAccountVersionCheck" });
			(0, mobx.autorun)((reaction) => {
				if (inWebWorker$1) return;
				const { session } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
				if (!session || !self.role) return;
				try {
					self.install(self.role);
				} catch {
					return;
				}
				reaction.dispose();
			}, { name: "ApolloInternetAccountInstall" });
			(0, mobx.autorun)(async (reaction) => {
				if (inWebWorker$1) return;
				const { session } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
				if (!session || !self.role) return;
				if (self.role === "none") {
					reaction.dispose();
					return;
				}
				try {
					await self.loadInitialState();
					reaction.dispose();
				} catch {}
			}, { name: "ApolloInternetAccount" });
		},
		beforeDestroy() {
			self.removeBeforeUnloadListener();
			self.removeVisibilityChangeListener();
			self.controller.abort(new DOMException("Cleaning up Apollo connection", "AbortError"));
			self.socket.close();
		}
	}));
};
//#endregion
//#region src/ApolloRefNameAliasAdapter/ApolloRefNameAliasAdapter.ts
function isApolloRefNameAliasMessage(data) {
	return typeof data === "object" && data !== null && "apollo" in data && data.apollo === true && "refNameAliases" in data;
}
const isInWebWorker$1 = typeof sessionStorage === "undefined";
var RefNameAliasAdapter = class extends _jbrowse_core_data_adapters_BaseAdapter.BaseAdapter {
	refNameAliasesP;
	async getRefNameAliases() {
		if (this.refNameAliasesP) return this.refNameAliasesP;
		const assemblyId = (0, _jbrowse_core_configuration.readConfObject)(this.config, "assemblyId");
		if (!isInWebWorker$1) {
			const dataStore = (this.pluginManager?.rootModel?.session)?.apolloDataStore;
			if (!dataStore) throw new Error("No Apollo data store found");
			const backendDriver = dataStore.getBackendDriver(assemblyId);
			if (!backendDriver) throw new Error("No backend driver found");
			return await backendDriver.getRefNameAliases(assemblyId);
		}
		const refNameAliases = new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				reject(/* @__PURE__ */ new Error("timeout"));
			}, 2e4);
			const messageId = (0, nanoid.nanoid)();
			const messageListener = (event) => {
				const data = event.data;
				if (!isApolloRefNameAliasMessage(data)) return;
				if (data.messageId !== messageId) return;
				clearTimeout(timeoutId);
				removeEventListener("message", messageListener);
				resolve(data.refNameAliases);
			};
			addEventListener("message", messageListener);
			rpcServer.emit("apollo", {
				apollo: true,
				method: "getRefNameAliases",
				assembly: assemblyId,
				messageId
			});
		});
		this.refNameAliasesP = refNameAliases;
		return refNameAliases;
	}
	freeResources() {}
};
//#endregion
//#region src/ApolloRefNameAliasAdapter/configSchema.ts
var configSchema_default$2 = (0, _jbrowse_core_configuration.ConfigurationSchema)("ApolloRefNameAliasAdapter", { assemblyId: {
	type: "string",
	defaultValue: ""
} }, { explicitlyTyped: true });
//#endregion
//#region src/ApolloRefNameAliasAdapter/index.ts
function installApolloRefNameAliasAdapter(pluginManager) {
	pluginManager.addAdapterType(() => new _jbrowse_core_pluggableElementTypes_AdapterType.default({
		name: "ApolloRefNameAliasAdapter",
		configSchema: configSchema_default$2,
		adapterMetadata: {
			category: void 0,
			hiddenFromGUI: true,
			description: void 0
		},
		AdapterClass: RefNameAliasAdapter
	}));
}
//#endregion
//#region src/ApolloSequenceAdapter/ApolloSequenceAdapter.ts
function isApolloMessageData$1(data) {
	return typeof data === "object" && data !== null && "apollo" in data && data.apollo === true;
}
const isInWebWorker = typeof sessionStorage === "undefined";
var ApolloSequenceAdapter = class extends _jbrowse_core_data_adapters_BaseAdapter.BaseSequenceAdapter {
	regions;
	async getRefNames() {
		return (await this.getRegions()).map((regions) => regions.refName);
	}
	async getRegions() {
		if (this.regions) return this.regions;
		const assemblyId = (0, _jbrowse_core_configuration.readConfObject)(this.config, "assemblyId");
		if (!isInWebWorker) {
			const dataStore = (this.pluginManager?.rootModel?.session)?.apolloDataStore;
			if (!dataStore) throw new Error("No Apollo data store found");
			const backendDriver = dataStore.getBackendDriver(assemblyId);
			if (!backendDriver) throw new Error("No backend driver found");
			const regions = await backendDriver.getRegions(assemblyId);
			this.regions = regions;
			return regions;
		}
		const regions = await new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				reject("timeout");
			}, 2e4);
			const messageId = (0, nanoid.nanoid)();
			const messageListener = (event) => {
				const { data } = event;
				if (!isApolloMessageData$1(data)) return;
				if (data.messageId !== messageId) return;
				clearTimeout(timeoutId);
				removeEventListener("message", messageListener);
				resolve(data.regions);
			};
			addEventListener("message", messageListener);
			globalThis.rpcServer.emit("apollo", {
				apollo: true,
				method: "getRegions",
				assembly: assemblyId,
				messageId
			});
		});
		this.regions = regions;
		return regions;
	}
	/**
	* Fetch features for a certain region
	* @param param -
	* @returns Observable of Feature objects in the region
	*/
	getFeatures(region) {
		const { end, refName, start } = region;
		const assemblyId = (0, _jbrowse_core_configuration.readConfObject)(this.config, "assemblyId");
		const regionWithAssemblyName = {
			...region,
			assemblyName: assemblyId
		};
		return (0, _jbrowse_core_util_rxjs.ObservableCreate)(async (observer) => {
			if (!isInWebWorker) {
				const dataStore = (this.pluginManager?.rootModel?.session)?.apolloDataStore;
				if (!dataStore) {
					observer.error("No Apollo data store found");
					return;
				}
				const backendDriver = dataStore.getBackendDriver(assemblyId);
				if (!backendDriver) {
					observer.error("No backend driver found");
					return;
				}
				const region = (await backendDriver.getRegions(regionWithAssemblyName.assemblyName)).find((region) => region.refName === regionWithAssemblyName.refName);
				if (!region) {
					observer.error("Cannot get region");
					return;
				}
				if (regionWithAssemblyName.end > region.end) regionWithAssemblyName.end = region.end;
				const { seq } = await backendDriver.getSequence(regionWithAssemblyName);
				observer.next(new _jbrowse_core_util_simpleFeature.default({
					id: `${refName} ${start}-${end}`,
					data: {
						refName,
						start,
						end,
						seq
					}
				}));
				observer.complete();
				return;
			}
			const seq = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject("timeout");
				}, 2e4);
				const messageId = (0, nanoid.nanoid)();
				const messageListener = (event) => {
					const { data } = event;
					if (!isApolloMessageData$1(data)) return;
					if (data.messageId !== messageId) return;
					clearTimeout(timeoutId);
					removeEventListener("message", messageListener);
					resolve(data.sequence);
				};
				addEventListener("message", messageListener);
				globalThis.rpcServer.emit("apollo", {
					apollo: true,
					method: "getSequence",
					region: regionWithAssemblyName,
					messageId
				});
			});
			observer.next(new _jbrowse_core_util_simpleFeature.default({
				id: `${refName} ${start}-${end}`,
				data: {
					refName,
					start,
					end,
					seq
				}
			}));
			observer.complete();
		});
	}
	/**
	* called to provide a hint that data tied to a certain region
	* will not be needed for the foreseeable future and can be purged
	* from caches, etc
	*/
	freeResources() {}
};
//#endregion
//#region src/ApolloSequenceAdapter/configSchema.ts
var configSchema_default$1 = (0, _jbrowse_core_configuration.ConfigurationSchema)("ApolloSequenceAdapter", { assemblyId: {
	type: "string",
	defaultValue: ""
} }, { explicitlyTyped: true });
//#endregion
//#region src/ApolloSequenceAdapter/index.ts
function installApolloSequenceAdapter(pluginManager) {
	pluginManager.addAdapterType(() => new _jbrowse_core_pluggableElementTypes_AdapterType.default({
		name: "ApolloSequenceAdapter",
		configSchema: configSchema_default$1,
		adapterMetadata: {
			category: void 0,
			hiddenFromGUI: true,
			description: void 0
		},
		AdapterClass: ApolloSequenceAdapter
	}));
}
//#endregion
//#region src/ApolloTextSearchAdapter/ApolloTextSearchAdapter.ts
function getMatchedFeature(query, feature) {
	const { children, indexedIds, allIds, ...featureWithoutChildren } = feature;
	if (JSON.stringify(featureWithoutChildren).includes(query)) return feature;
	if (!children) return;
	for (const subFeature of Object.values(children)) {
		const matchedFeature = getMatchedFeature(query, subFeature);
		if (matchedFeature) return matchedFeature;
	}
}
var ApolloTextSearchAdapter = class extends _jbrowse_core_data_adapters_BaseAdapter.BaseAdapter {
	get baseURL() {
		return (0, _jbrowse_core_configuration.readConfObject)(this.config, "baseURL").uri;
	}
	get trackId() {
		return (0, _jbrowse_core_configuration.readConfObject)(this.config, "trackId");
	}
	get assemblyNames() {
		return (0, _jbrowse_core_configuration.readConfObject)(this.config, "assemblyNames");
	}
	mapBaseResult(features, assembly, query) {
		return features.map((feature) => {
			const matchedObject = getMatchedFeature(query, feature) ?? feature;
			const refName = assembly.getCanonicalRefName(feature.refSeq);
			return new _jbrowse_core_TextSearch_BaseResults.default({
				label: query,
				trackId: this.trackId,
				locString: `${refName}:${matchedObject.min + 1}..${matchedObject.max}`,
				matchedObject
			});
		});
	}
	async searchIndex(args) {
		const query = args.queryString;
		const results = [];
		const session = this.pluginManager?.rootModel?.session;
		if (!session) return results;
		const { apolloDataStore } = session;
		const { assemblyManager } = session;
		for (const assemblyName of this.assemblyNames) {
			const backendDriver = apolloDataStore.getBackendDriver(assemblyName);
			const assembly = assemblyManager.get(assemblyName);
			if (!(backendDriver && assembly)) continue;
			const features = await backendDriver.searchFeatures(args.queryString, [assemblyName]);
			results.push(...this.mapBaseResult(features, assembly, query));
		}
		return results;
	}
	freeResources() {}
};
//#endregion
//#region src/ApolloTextSearchAdapter/configSchema.ts
var configSchema_default = (0, _jbrowse_core_configuration.ConfigurationSchema)("ApolloTextSearchAdapter", {
	assemblyNames: {
		type: "stringArray",
		defaultValue: [],
		description: "List of assemblies covered by text search adapter"
	},
	trackId: {
		type: "string",
		defaultValue: ""
	},
	baseURL: {
		type: "fileLocation",
		defaultValue: {
			uri: "",
			locationType: "UriLocation"
		}
	}
}, {
	explicitlyTyped: true,
	explicitIdentifier: "textSearchAdapterId"
});
//#endregion
//#region src/ApolloTextSearchAdapter/index.ts
function installApolloTextSearchAdapter(pluginManager) {
	pluginManager.addTextSearchAdapterType(() => new _jbrowse_core_pluggableElementTypes.TextSearchAdapterType({
		name: "ApolloTextSearchAdapter",
		displayName: "Apollo text search adapter",
		configSchema: configSchema_default,
		AdapterClass: ApolloTextSearchAdapter,
		description: "Apollo Text Search adapter"
	}));
}
//#endregion
//#region src/FeatureDetailsWidget/AttributeKey.tsx
const useStyles$10 = (0, tss_react_mui.makeStyles)()((theme) => ({ attributeKey: {
	fontWeight: "bold",
	marginRight: theme.spacing(2)
} }));
function AttributeKey({ attributeKey: key }) {
	const { classes } = useStyles$10();
	const startsWithCapital = /^[A-Z]/.test(key);
	let displayKey = key;
	let titleText;
	if ((0, _apollo_annotation_shared.isGFFInternalAttribute)(key)) {
		displayKey = _apollo_annotation_shared.internalToGFF[key];
		titleText = `On GFF3 export, this will be assigned to the GFF3's reserved "${displayKey}" attribute`;
	} else if ((0, _apollo_annotation_shared.isGFFColumnInternal)(key)) {
		displayKey = _apollo_annotation_shared.gffInternalToColumn[key];
		titleText = `On GFF3 export, this will be placed in the GFF3's "${displayKey}" column`;
	} else if (startsWithCapital) titleText = "On GFF3 export, this attribute will be changed to start with a lower-case letter because attributes starting with an upper-case letter are reserved in GFF3";
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		style: { display: "flex" },
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
			className: classes.attributeKey,
			children: displayKey
		}), titleText ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Tooltip, {
			title: titleText,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Chip, {
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Info.default, {}),
				label: "GFF3",
				size: "small",
				variant: "outlined"
			})
		}) : null]
	});
}
//#endregion
//#region src/FeatureDetailsWidget/AttributeKeySelector.tsx
const customKeyName = "Custom";
const gffKeys = { [customKeyName]: "custom" };
for (const [value, key] of Object.entries(_apollo_annotation_shared.gffToInternal)) gffKeys[`GFF ${key}`] = value;
for (const [value, key] of Object.entries(_apollo_annotation_shared.gffColumnToInternal)) gffKeys[`GFF ${key}`] = value;
const AttributeKeySelector = (0, mobx_react.observer)(function AttributeKeySelector({ setKey, session }) {
	const { pluginManager } = (0, _jbrowse_core_util.getEnv)(session);
	const reservedKeys = pluginManager.evaluateExtensionPoint("Apollo-ReservedAttributeKeys", gffKeys);
	const firstKey = Object.keys(reservedKeys).at(0) ?? customKeyName;
	const [selectedKey, setSelectedKey] = (0, react.useState)(firstKey);
	const [customKey, setCustomKey] = (0, react.useState)();
	const isCustom = selectedKey === customKeyName;
	function handleSubmit(event) {
		event.preventDefault();
		if (isCustom) {
			setKey(customKey);
			return;
		}
		setKey(reservedKeys[selectedKey]);
	}
	function handleCancel() {
		setKey();
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				display: "flex",
				flexDirection: "column",
				margin: 8
			},
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.FormControl, {
				variant: "outlined",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.InputLabel, {
					id: "attribute-key-select-label",
					children: "Key"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Select, {
					labelId: "attribute-key-select-label",
					value: selectedKey,
					label: "Key",
					onChange: (event) => {
						setSelectedKey(event.target.value);
					},
					children: Object.keys(reservedKeys).map((val) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, {
						value: val,
						children: val
					}, val))
				})]
			}), isCustom ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
				label: "Attribute key",
				variant: "outlined",
				id: "attributeKey",
				onChange: (event) => {
					setCustomKey(event.target.value);
				}
			}) : null]
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
			color: "primary",
			variant: "contained",
			type: "submit",
			disabled: isCustom && !customKey,
			children: "Add"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
			variant: "outlined",
			onClick: handleCancel,
			children: "Cancel"
		})] })]
	});
});
//#endregion
//#region src/FeatureDetailsWidget/StringTextField.tsx
const StringTextField = (0, mobx_react.observer)(function StringTextField({ onChangeCommitted, value: initialValue, ...props }) {
	const [value, setValue] = (0, react.useState)(String(initialValue));
	const [blur, setBlur] = (0, react.useState)(false);
	const [inputNode, setInputNode] = (0, react.useState)(null);
	(0, react.useEffect)(() => {
		setValue(String(initialValue));
	}, [initialValue]);
	(0, react.useEffect)(() => {
		if (blur) {
			inputNode?.blur();
			setBlur(false);
		}
	}, [blur, inputNode]);
	function onChange(event) {
		setValue(event.target.value);
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
		...props,
		type: "text",
		onChange,
		value,
		onKeyDown: (event) => {
			if (event.key === "Enter") inputNode?.blur();
			else if (event.key === "Escape") {
				setValue(String(initialValue));
				setBlur(true);
			}
		},
		onBlur: () => {
			if (value !== String(initialValue)) onChangeCommitted(value);
		},
		inputRef: (node) => {
			setInputNode(node);
		}
	});
});
//#endregion
//#region src/FeatureDetailsWidget/DefaultAttributeEditor.tsx
const DefaultAttributeEditor = (0, mobx_react.observer)(function DefaultAttributeEditor({ attributeValues, setAttribute, isNew = false }) {
	const [newValues, setNewValues] = (0, react.useState)(attributeValues && attributeValues.length > 0 ? attributeValues : [""]);
	function updateValue(idx, newValue) {
		setNewValues((oldValues) => {
			const newValues = [...oldValues];
			newValues[idx] = newValue;
			return newValues;
		});
	}
	function deleteValue(idx) {
		setNewValues((oldValues) => {
			const newValues = [...oldValues];
			newValues.splice(idx, 1);
			return newValues;
		});
	}
	function addValue() {
		setNewValues((oldValues) => {
			const newValues = [...oldValues];
			newValues.push("");
			return newValues;
		});
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		newValues.map((value, idx) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: { display: "flex" },
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StringTextField, {
				value,
				onChangeCommitted: (editedValue) => {
					updateValue(idx, editedValue);
				},
				variant: "outlined",
				fullWidth: true
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.IconButton, {
				"aria-label": "delete",
				size: "medium",
				edge: "end",
				onClick: () => {
					deleteValue(idx);
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Delete.default, { fontSize: "inherit" })
			})]
		}, `${idx}-${value}`)),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.IconButton, {
			"aria-label": "add",
			size: "medium",
			color: "secondary",
			edge: "start",
			onClick: addValue,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_AddBox.default, { fontSize: "inherit" })
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
			color: "primary",
			variant: "contained",
			onClick: () => {
				setAttribute(newValues.filter(Boolean));
			},
			children: isNew ? "Add" : "Update"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
			variant: "outlined",
			type: "submit",
			onClick: () => {
				setAttribute();
			},
			children: "Cancel"
		})] })
	] });
});
//#endregion
//#region src/FeatureDetailsWidget/DefaultAttributeViewer.tsx
function DefaultAttributeViewer({ values }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: values?.map((value, idx) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
		variant: "body2",
		color: "textSecondary",
		children: value
	}, `${idx}.${value}`)) });
}
//#endregion
//#region src/FeatureDetailsWidget/Attributes.tsx
const useStyles$9 = (0, tss_react_mui.makeStyles)()((theme) => ({ list: {
	"li:nth-of-type(odd)": { backgroundColor: theme.palette.action.focus },
	"li:nth-of-type(even)": { backgroundColor: theme.palette.action.hover }
} }));
const Attributes = (0, mobx_react.observer)(function Attributes({ assembly, editable, feature, session }) {
	const { pluginManager } = (0, _jbrowse_core_util.getEnv)(session);
	const { classes } = useStyles$9();
	const [anchorEl, setAnchorEl] = (0, react.useState)(null);
	const [selectedKey, setSelectedKey] = (0, react.useState)(null);
	const [editingKey, setEditingKey] = (0, react.useState)(null);
	const [showAddNewForm, setShowAddNewForm] = (0, react.useState)(false);
	const [newKey, setNewKey] = (0, react.useState)();
	const open = Boolean(anchorEl);
	const { changeManager } = session.apolloDataStore;
	const { notify } = session;
	function handleListMenuClick(event, key) {
		setAnchorEl(event.currentTarget);
		setSelectedKey(key);
	}
	function handleClose() {
		setAnchorEl(null);
		setSelectedKey(null);
	}
	function handleDelete() {
		if (selectedKey) deleteFeatureAttribute(selectedKey);
		handleClose();
	}
	function handleEdit() {
		if (selectedKey) setEditingKey(selectedKey);
		handleClose();
	}
	const { _id, attributes } = feature;
	function deleteFeatureAttribute(key) {
		const attributesSerialized = (0, _jbrowse_mobx_state_tree.getSnapshot)(attributes);
		const { [key]: deletedAttribute, ...remainingAttributes } = attributesSerialized;
		const change = new _apollo_annotation_shared.FeatureAttributeChange({
			changedIds: [_id],
			typeName: "FeatureAttributeChange",
			assembly,
			featureId: _id,
			oldAttributes: attributesSerialized,
			newAttributes: remainingAttributes
		});
		changeManager.submit(change);
	}
	function modifyFeatureAttribute(key, attribute) {
		const serializedAttributes = { ...(0, _jbrowse_mobx_state_tree.getSnapshot)(attributes) };
		const oldAttributes = structuredClone(serializedAttributes);
		if (!(key in serializedAttributes)) {
			notify(`"${key}" not found in feature attributes`, "error");
			return;
		}
		if (serializedAttributes[key].toString() === attribute.toString()) return;
		serializedAttributes[key] = attribute;
		const change = new _apollo_annotation_shared.FeatureAttributeChange({
			changedIds: [feature._id],
			typeName: "FeatureAttributeChange",
			assembly,
			featureId: feature._id,
			oldAttributes,
			newAttributes: serializedAttributes
		});
		changeManager.submit(change);
	}
	function addFeatureAttribute(key, attribute) {
		const serializedAttributes = { ...(0, _jbrowse_mobx_state_tree.getSnapshot)(attributes) };
		const oldAttributes = structuredClone(serializedAttributes);
		if (key in serializedAttributes) {
			notify(`Feature already has attribute "${key}"`, "error");
			return;
		}
		serializedAttributes[key] = attribute;
		const change = new _apollo_annotation_shared.FeatureAttributeChange({
			changedIds: [feature._id],
			typeName: "FeatureAttributeChange",
			assembly,
			featureId: feature._id,
			oldAttributes,
			newAttributes: serializedAttributes
		});
		changeManager.submit(change);
	}
	const NewKeyAttributeEditor = pluginManager.evaluateExtensionPoint("Apollo-AttributeEditorComponent", DefaultAttributeEditor, { key: newKey });
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.List, {
			className: classes.list,
			children: [(0, mobx.entries)(attributes).map(([key, values]) => {
				const AttributeEditor = pluginManager.evaluateExtensionPoint("Apollo-AttributeEditorComponent", DefaultAttributeEditor, { key });
				const AttributeViewer = pluginManager.evaluateExtensionPoint("Apollo-AttributeViewerComponent", DefaultAttributeViewer, { key });
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.ListItem, {
					secondaryAction: editable && !editingKey ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.IconButton, {
						edge: "end",
						onClick: (event) => {
							handleListMenuClick(event, key);
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_MoreHoriz.default, {})
					}) : null,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.ListItemText, {
						disableTypography: true,
						primary: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AttributeKey, { attributeKey: key }),
						secondary: editingKey === key ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AttributeEditor, {
							session,
							attributeValues: values,
							setAttribute: (newValues) => {
								setEditingKey(null);
								if (newValues) modifyFeatureAttribute(key, newValues);
							}
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AttributeViewer, { values })
					})
				}, key);
			}), newKey ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.ListItem, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.ListItemText, {
				disableTypography: true,
				primary: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AttributeKey, { attributeKey: newKey }),
				secondary: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NewKeyAttributeEditor, {
					session,
					attributeValues: [],
					setAttribute: (newValues) => {
						if (newValues) addFeatureAttribute(newKey, newValues);
						setNewKey(void 0);
					},
					isNew: true
				})
			}) }) : null]
		}),
		editable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
			color: "primary",
			variant: "contained",
			disabled: showAddNewForm || Boolean(newKey),
			onClick: () => {
				setShowAddNewForm(true);
			},
			children: "Add new"
		}) : null,
		showAddNewForm ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Paper, {
			variant: "outlined",
			style: { marginTop: 8 },
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AttributeKeySelector, {
				session,
				setKey: (newKey) => {
					setNewKey(newKey);
					setShowAddNewForm(false);
				}
			})
		}) : null,
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Menu, {
			anchorEl,
			open,
			onClose: handleClose,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.MenuItem, {
				onClick: handleDelete,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.ListItemIcon, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Delete.default, { fontSize: "small" }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
					variant: "inherit",
					children: "Delete"
				})]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.MenuItem, {
				onClick: handleEdit,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.ListItemIcon, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Edit.default, { fontSize: "small" }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
					variant: "inherit",
					children: "Edit"
				})]
			})]
		})
	] });
});
//#endregion
//#region src/FeatureDetailsWidget/NumberTextField.tsx
const NumberTextField = (0, mobx_react.observer)(function NumberTextField({ onChangeCommitted, value: initialValue, ...props }) {
	const [value, setValue] = (0, react.useState)(String(initialValue));
	const [blur, setBlur] = (0, react.useState)(false);
	const [inputNode, setInputNode] = (0, react.useState)(null);
	(0, react.useEffect)(() => {
		setValue(String(initialValue));
	}, [initialValue]);
	(0, react.useEffect)(() => {
		if (blur) {
			inputNode?.blur();
			setBlur(false);
		}
	}, [blur, inputNode]);
	function onChange(event) {
		setValue(event.target.value);
	}
	const error = Number.isNaN(Number(value));
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
		...props,
		type: "text",
		onChange,
		value,
		onKeyDown: (event) => {
			if (event.key === "Enter") inputNode?.blur();
			else if (event.key === "Escape") {
				setValue(String(initialValue));
				setBlur(true);
			}
		},
		onBlur: () => {
			const valueAsNumber = Number(value);
			if (value !== String(initialValue)) {
				if (Number.isNaN(valueAsNumber)) setValue(String(initialValue));
				else if (!onChangeCommitted(valueAsNumber)) setValue(String(initialValue));
			}
		},
		inputRef: (node) => {
			setInputNode(node);
		},
		error,
		helperText: error ? "Not a valid number" : void 0
	});
});
//#endregion
//#region src/FeatureDetailsWidget/BasicInformation.tsx
const BasicInformation = (0, mobx_react.observer)(function BasicInformation({ assembly, feature, session }) {
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const [typeWarningText, setTypeWarningText] = (0, react.useState)("");
	const { _id, assemblyId, max, min, strand, type } = feature;
	const notifyError = (e) => {
		session.notify(e.message, "error");
	};
	const { changeManager } = session.apolloDataStore;
	function handleTypeChange(newType) {
		setErrorMessage("");
		const featureId = _id;
		const change = new _apollo_annotation_shared.TypeChange({
			typeName: "TypeChange",
			changedIds: [featureId],
			featureId,
			oldType: type,
			newType,
			assembly: assemblyId
		});
		return changeManager.submit(change);
	}
	function handleStrandChange(event) {
		const { value } = event.target;
		const newStrand = value ? Number(value) : void 0;
		const change = new _apollo_annotation_shared.StrandChange({
			typeName: "StrandChange",
			changedIds: [_id],
			featureId: _id,
			oldStrand: strand,
			newStrand,
			assembly
		});
		return changeManager.submit(change);
	}
	function handleStartChange(newStart) {
		newStart--;
		const change = new _apollo_annotation_shared.LocationStartChange({
			typeName: "LocationStartChange",
			changedIds: [_id],
			featureId: _id,
			oldStart: min,
			newStart,
			assembly
		});
		changeManager.submit(change);
		return true;
	}
	function handleEndChange(newEnd) {
		const change = new _apollo_annotation_shared.LocationEndChange({
			typeName: "LocationEndChange",
			changedIds: [_id],
			featureId: _id,
			oldEnd: max,
			newEnd,
			assembly
		});
		changeManager.submit(change);
		return true;
	}
	async function fetchValidTerms(parentFeature, ontologyStore, _signal) {
		const terms = await fetchValidDescendantTerms(parentFeature, ontologyStore, _signal);
		if (!terms) {
			setTypeWarningText(`Type "${parentFeature?.type}" does not have any children in the ontology`);
			return;
		}
		return terms;
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		"data-testid": "basic_information",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NumberTextField, {
				margin: "dense",
				id: "start",
				label: "Start",
				fullWidth: true,
				variant: "outlined",
				value: min + 1,
				onChangeCommitted: handleStartChange
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NumberTextField, {
				margin: "dense",
				id: "end",
				label: "End",
				fullWidth: true,
				variant: "outlined",
				value: max,
				onChangeCommitted: handleEndChange
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(OntologyTermAutocomplete, {
				session,
				ontologyName: "Sequence Ontology",
				value: type,
				filterTerms: isOntologyClass,
				fetchValidTerms: fetchValidTerms.bind(null, feature),
				renderInput: (params) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
					...params,
					label: "Type",
					variant: "outlined",
					fullWidth: true,
					error: Boolean(typeWarningText),
					helperText: typeWarningText
				}),
				onChange: (oldValue, newValue) => {
					if (newValue) handleTypeChange(newValue).catch(notifyError);
				}
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
				type: "radio",
				value: "1",
				checked: strand === 1,
				onChange: handleStrandChange
			}), "Positive Strand (+)"] }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
				type: "radio",
				value: "-1",
				checked: strand === -1,
				onChange: handleStrandChange
			}), "Negative Strand (-)"] }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
				type: "radio",
				value: "",
				checked: strand === void 0,
				onChange: handleStrandChange
			}), "No Strand Information"] }),
			errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
				color: "error",
				children: errorMessage
			}) : null
		]
	});
});
//#endregion
//#region src/FeatureDetailsWidget/FeatureDetailsNavigation.tsx
const FeatureDetailsNavigation = (0, mobx_react.observer)(function FeatureDetailsNavigation(props) {
	const { feature, model } = props;
	const { children, parent } = feature;
	const childFeatures = [];
	if (children) for (const [, child] of children) childFeatures.push(child);
	if (!(parent ?? childFeatures.length > 0)) return null;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		style: { marginTop: 10 },
		children: [parent && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
			variant: "h6",
			children: "Parent:"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Button, {
			variant: "contained",
			onClick: () => {
				model.setFeature(parent);
			},
			children: [
				parent.type,
				getFeatureNameOrId$1(parent),
				" (",
				parent.min,
				"..",
				parent.max,
				")"
			]
		})] }), childFeatures.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Typography, {
			variant: "h6",
			children: [childFeatures.length === 1 ? "Child" : "Children", ":"]
		}), childFeatures.map((child) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			style: { marginBottom: 5 },
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Button, {
				variant: "contained",
				onClick: () => {
					model.setFeature(child);
				},
				children: [
					child.type,
					getFeatureNameOrId$1(child),
					" (",
					child.min,
					"..",
					child.max,
					")"
				]
			})
		}, child._id))] })]
	});
});
//#endregion
//#region src/util/copyToClipboard.ts
async function copyToClipboard(element) {
	if (isSecureContext) {
		const textBlob = new Blob([element.outerText], { type: "text/plain" });
		const htmlBlob = new Blob([element.outerHTML], { type: "text/html" });
		const clipboardItem = new ClipboardItem({
			[textBlob.type]: textBlob,
			[htmlBlob.type]: htmlBlob
		});
		return navigator.clipboard.write([clipboardItem]);
	}
	const copyCallback = (event) => {
		event.clipboardData?.setData("text/plain", element.outerText);
		event.clipboardData?.setData("text/html", element.outerHTML);
		event.preventDefault();
	};
	document.addEventListener("copy", copyCallback);
	document.execCommand("copy");
	document.removeEventListener("copy", copyCallback);
}
//#endregion
//#region src/FeatureDetailsWidget/sequenceSegments.ts
function getSequenceLength(segments) {
	let length = 0;
	for (const segment of segments) length += segment.sequence.length;
	return length;
}
function getCdsSequenceAndLocs(feature, getSequence) {
	const { cdsLocations, strand } = feature;
	let wholeSequence = "";
	const [firstLocation] = cdsLocations;
	const locs = [];
	for (const loc of firstLocation) {
		let locSeq = getSequence(loc.min, loc.max);
		if (strand === -1) locSeq = (0, _jbrowse_core_util.revcom)(locSeq);
		wholeSequence += locSeq;
		locs.push({
			min: loc.min,
			max: loc.max
		});
	}
	return {
		wholeSequence,
		locs
	};
}
function getSequenceSegments(segmentType, feature, getSequence) {
	const segments = [];
	const { strand, transcriptParts } = feature;
	switch (segmentType) {
		case "genomic":
		case "cDNA": {
			const [firstLocation] = transcriptParts;
			for (const loc of firstLocation) {
				if (segmentType === "cDNA" && loc.type === "intron") continue;
				let sequence = getSequence(loc.min, loc.max);
				if (strand === -1) sequence = (0, _jbrowse_core_util.revcom)(sequence);
				const type = loc.type === "fivePrimeUTR" || loc.type === "threePrimeUTR" ? "UTR" : loc.type;
				const previousSegment = segments.at(-1);
				if (!previousSegment) {
					segments.push({
						type,
						sequence,
						locs: [{
							min: loc.min,
							max: loc.max
						}]
					});
					continue;
				}
				if (previousSegment.type === type) {
					previousSegment.sequence += sequence;
					previousSegment.locs.push({
						min: loc.min,
						max: loc.max
					});
				} else segments.push({
					type,
					sequence,
					locs: [{
						min: loc.min,
						max: loc.max
					}]
				});
			}
			return segments;
		}
		case "CDS": {
			const { locs, wholeSequence } = getCdsSequenceAndLocs(feature, getSequence);
			segments.push({
				type: "CDS",
				sequence: wholeSequence,
				locs
			});
			return segments;
		}
		case "protein": {
			const { locs, wholeSequence } = getCdsSequenceAndLocs(feature, getSequence);
			let protein = "";
			for (let i = 0; i < wholeSequence.length; i += 3) {
				const codonSeq = wholeSequence.slice(i, i + 3).toUpperCase();
				protein += _jbrowse_core_util.defaultCodonTable[codonSeq] || "&";
			}
			segments.push({
				type: "protein",
				sequence: protein,
				locs
			});
			return segments;
		}
	}
}
function getSegmentColor(type) {
	switch (type) {
		case "upOrDownstream": return "rgb(255,255,255)";
		case "exon":
		case "UTR": return "rgb(194,106,119)";
		case "CDS": return "rgb(93,168,153)";
		case "intron": return "rgb(187,187,187)";
		case "protein": return "rgb(148,203,236)";
		case "plain": return;
	}
}
function getLocationIntervals(seqSegments) {
	const locIntervals = [];
	const allLocs = seqSegments.flatMap((segment) => segment.locs);
	let [previous] = allLocs;
	for (let i = 1; i < allLocs.length; i++) if (previous.min === allLocs[i].max || previous.max === allLocs[i].min) previous = {
		min: Math.min(previous.min, allLocs[i].min),
		max: Math.max(previous.max, allLocs[i].max)
	};
	else {
		locIntervals.push(previous);
		previous = allLocs[i];
	}
	locIntervals.push(previous);
	return locIntervals;
}
//#endregion
//#region src/FeatureDetailsWidget/SequenceViewer.tsx
function wrapSequence(segments, sequenceWrapLength, getContrastText) {
	const seqElements = [];
	let processedChars = 0;
	for (const [index, segment] of segments.entries()) {
		const lastLineLength = processedChars % sequenceWrapLength;
		const segmentLineBreak = processedChars > 0 && lastLineLength === 0 ? "\n" : "";
		processedChars += segment.sequence.length;
		const firstLineContent = segment.sequence.slice(0, sequenceWrapLength - lastLineLength);
		const printLines = [segmentLineBreak + firstLineContent, ...(0, _apollo_annotation_shared.splitStringIntoChunks)(segment.sequence.slice(firstLineContent.length), sequenceWrapLength)];
		const color = getSegmentColor(segment.type);
		const style = { whiteSpace: "pre-line" };
		if (color) {
			style.background = color;
			style.color = getContrastText(color);
		}
		const span = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			style,
			children: printLines.join("\n")
		}, `${segment.type}-${index}`);
		seqElements.push(span);
	}
	return seqElements;
}
const SEQUENCE_WRAP_LENGTH = 60;
function SequenceViewer({ locationIntervals, refSeqName, sequenceSegments, strand }) {
	const theme = (0, _mui_material.useTheme)();
	const seqRef = (0, react.useRef)(null);
	function onCopyClick() {
		const seqDiv = seqRef.current;
		if (!seqDiv) return;
		copyToClipboard(seqDiv);
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
		variant: "contained",
		onClick: onCopyClick,
		style: { marginLeft: 10 },
		size: "medium",
		children: "Copy sequence"
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Paper, {
		style: {
			fontFamily: "monospace",
			padding: theme.spacing(),
			overflowX: "auto"
		},
		ref: seqRef,
		children: [
			">",
			refSeqName,
			":",
			locationIntervals.map((interval) => strand === 1 ? `${interval.min + 1}-${interval.max}` : `${interval.max}-${interval.min + 1}`).join(";"),
			"(strand=",
			strand === 1 ? "+" : "-",
			";length=",
			getSequenceLength(sequenceSegments),
			")",
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("br", {}),
			wrapSequence(sequenceSegments, SEQUENCE_WRAP_LENGTH, (color) => theme.palette.getContrastText(color))
		]
	})] });
}
//#endregion
//#region src/FeatureDetailsWidget/ApolloFeatureDetailsWidget.tsx
const useStyles$8 = (0, tss_react_mui.makeStyles)()((theme) => ({ root: { padding: theme.spacing(2) } }));
const ApolloFeatureDetailsWidget = (0, mobx_react.observer)(function ApolloFeatureDetailsWidget(props) {
	const { model } = props;
	const { assembly, feature, refName } = model;
	const session = (0, _jbrowse_core_util.getSession)(model);
	const currentAssembly = session.apolloDataStore.assemblies.get(assembly);
	const { classes } = useStyles$8();
	const [panelState, setPanelState] = (0, react.useState)(["attributes"]);
	(0, react.useEffect)(() => {
		setPanelState(["attributes"]);
	}, [feature]);
	if (!(feature && currentAssembly)) return null;
	const refSeq = currentAssembly.getByRefName(refName);
	if (!refSeq) return null;
	const { max, min } = feature;
	const sequence = refSeq.getSequence(min, max);
	if (!sequence) session.apolloDataStore.loadRefSeq([{
		assemblyName: assembly,
		refName,
		start: min,
		end: max
	}]);
	const sequenceSegments = sequence ? [{
		type: "plain",
		sequence,
		locs: [{
			min,
			max
		}]
	}] : [];
	const locationIntervals = getLocationIntervals(sequenceSegments);
	function handlePanelChange(expanded, panel) {
		if (expanded) setPanelState([...panelState, panel]);
		else setPanelState(panelState.filter((p) => p !== panel));
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: classes.root,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BasicInformation, {
				feature,
				session,
				assembly: currentAssembly._id
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Accordion, {
				style: { marginTop: 10 },
				expanded: panelState.includes("attributes"),
				onChange: (e, expanded) => {
					handlePanelChange(expanded, "attributes");
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.AccordionSummary, {
					expandIcon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_ExpandMore.default, { style: { color: "white" } }),
					"aria-controls": "panel1-content",
					id: "panel1-header",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
						component: "span",
						children: "Attributes"
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.AccordionDetails, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Attributes, {
					feature,
					session,
					assembly: currentAssembly._id,
					editable: true
				}) })]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Accordion, {
				style: { marginTop: 10 },
				expanded: panelState.includes("sequence"),
				onChange: (e, expanded) => {
					handlePanelChange(expanded, "sequence");
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.AccordionSummary, {
					expandIcon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_ExpandMore.default, { style: { color: "white" } }),
					"aria-controls": "panel2-content",
					id: "panel2-header",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
						component: "span",
						children: "Sequence"
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.AccordionDetails, { children: panelState.includes("sequence") && sequence && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SequenceViewer, {
					refSeqName: refName,
					strand: feature.strand === -1 ? -1 : 1,
					locationIntervals,
					sequenceSegments
				}) })]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Accordion, {
				style: { marginTop: 10 },
				expanded: panelState.includes("related_features"),
				onChange: (e, expanded) => {
					handlePanelChange(expanded, "related_features");
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.AccordionSummary, {
					expandIcon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_ExpandMore.default, { style: { color: "white" } }),
					"aria-controls": "panel3-content",
					id: "panel3-header",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
						component: "span",
						children: "Related features"
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.AccordionDetails, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FeatureDetailsNavigation, {
					model,
					feature
				}) })]
			})
		]
	});
});
//#endregion
//#region src/FeatureDetailsWidget/model.ts
const ApolloFeatureDetailsWidgetModel = _jbrowse_mobx_state_tree.types.model("ApolloFeatureDetailsWidget", {
	id: _jbrowse_core_util_types_mst.ElementId,
	type: _jbrowse_mobx_state_tree.types.literal("ApolloFeatureDetailsWidget"),
	feature: _jbrowse_mobx_state_tree.types.maybe(_jbrowse_mobx_state_tree.types.reference(_apollo_annotation_mst.AnnotationFeatureModel, { onInvalidated(ev) {
		ev.parent.setTryReload(ev.invalidId);
		ev.removeRef();
	} })),
	assembly: _jbrowse_mobx_state_tree.types.string,
	refName: _jbrowse_mobx_state_tree.types.string
}).volatile(() => ({ tryReload: void 0 })).actions((self) => ({
	setFeature(feature) {
		self.feature = feature;
	},
	setTryReload(featureId) {
		self.tryReload = featureId;
	}
})).actions((self) => ({ afterAttach() {
	(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)((reaction) => {
		if (!self.tryReload) return;
		const { apolloDataStore } = (0, _jbrowse_core_util.getSession)(self);
		if (!apolloDataStore) return;
		const feature = apolloDataStore.getFeature(self.tryReload);
		if (feature) {
			self.setFeature(feature);
			self.setTryReload();
			reaction.dispose();
		}
	}));
} }));
const ApolloTranscriptDetailsModel = _jbrowse_mobx_state_tree.types.model("ApolloTranscriptDetails", {
	id: _jbrowse_core_util_types_mst.ElementId,
	type: _jbrowse_mobx_state_tree.types.literal("ApolloTranscriptDetails"),
	feature: _jbrowse_mobx_state_tree.types.maybe(_jbrowse_mobx_state_tree.types.reference(_apollo_annotation_mst.AnnotationFeatureModel, { onInvalidated(ev) {
		ev.parent.setTryReload(ev.invalidId);
		ev.removeRef();
	} })),
	assembly: _jbrowse_mobx_state_tree.types.string,
	refName: _jbrowse_mobx_state_tree.types.string
}).volatile(() => ({ tryReload: void 0 })).actions((self) => ({
	setFeature(feature) {
		self.feature = feature;
	},
	setTryReload(featureId) {
		self.tryReload = featureId;
	}
})).actions((self) => ({ afterAttach() {
	(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)((reaction) => {
		if (!self.tryReload) return;
		const { apolloDataStore } = (0, _jbrowse_core_util.getSession)(self);
		if (!apolloDataStore) return;
		const feature = apolloDataStore.getFeature(self.tryReload);
		if (feature) {
			self.setFeature(feature);
			self.setTryReload();
			reaction.dispose();
		}
	}));
} }));
//#endregion
//#region src/FeatureDetailsWidget/SequenceOptionSelector.tsx
function SequenceOptionSelector({ onChange, options, value }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Select, {
		value,
		onChange: (e) => {
			onChange(e.target.value);
		},
		size: "small",
		"data-testid": "sequenceOptionSelector",
		children: options.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, {
			value: option,
			"data-testid": `sequenceOption-${option}`,
			children: option
		}, option))
	});
}
//#endregion
//#region src/FeatureDetailsWidget/TranscriptSequence.tsx
const defaultSelectedOption = "genomic";
const defaultSequenceOptions = ["genomic", "cDNA"];
const TranscriptSequence = (0, mobx_react.observer)(function TranscriptSequence({ assembly, feature, refName, session }) {
	const currentAssembly = session.apolloDataStore.assemblies.get(assembly);
	const refData = currentAssembly?.getByRefName(refName);
	const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
	const [selectedOption, setSelectedOption] = (0, react.useState)(defaultSelectedOption);
	const [firstCdsLocation] = feature.cdsLocations;
	const sequenceOptions = firstCdsLocation.length > 0 ? [
		...defaultSequenceOptions,
		"CDS",
		"protein"
	] : defaultSequenceOptions;
	const effectiveSelectedOption = sequenceOptions.includes(selectedOption) ? selectedOption : defaultSelectedOption;
	const sequenceSegments = (0, react.useMemo)(() => refData ? getSequenceSegments(effectiveSelectedOption, feature, (min, max) => refData.getSequence(min, max)) : [], [
		refData,
		feature,
		effectiveSelectedOption
	]);
	const locationIntervals = (0, react.useMemo)(() => getLocationIntervals(sequenceSegments), [sequenceSegments]);
	if (!(currentAssembly && refData)) return null;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	if (!featureTypeOntology.isTypeOf(feature.type, "transcript")) return null;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SequenceOptionSelector, {
		options: sequenceOptions,
		value: effectiveSelectedOption,
		onChange: setSelectedOption
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SequenceViewer, {
		refSeqName: refData.name,
		strand: feature.strand === -1 ? -1 : 1,
		locationIntervals,
		sequenceSegments
	})] });
});
//#endregion
//#region src/FeatureDetailsWidget/Translation.tsx
const SequenceContainer = (0, _mui_material_styles.styled)("div")({
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	textAlign: "left",
	width: "100%",
	overflowWrap: "break-word",
	wordWrap: "break-word",
	wordBreak: "break-all",
	"& span": { fontSize: 12 }
});
const StyledAccordionSummary$1 = (0, _mui_material_styles.styled)(_mui_material.AccordionSummary)(() => ({
	minHeight: 30,
	maxHeight: 30,
	"&.Mui-expanded": {
		minHeight: 30,
		maxHeight: 30
	}
}));
function Translation({ changeInProgress, cdsLocations, refData, strand, updateCDSLocation, cdsMin, cdsMax, feature, session }) {
	const seqRef = (0, react.useRef)(null);
	const { notify } = session;
	const cdsSequences = [];
	const [firstLocation] = cdsLocations;
	for (const loc of firstLocation) {
		const seq = refData.getSequence(loc.min, loc.max);
		cdsSequences.push(strand === -1 ? (0, _jbrowse_core_util.revcom)(seq) : seq);
	}
	const cdsSequence = cdsSequences.join("");
	const proteinSequence = [];
	for (let codonGenomicPos = 0; codonGenomicPos < cdsSequence.length; codonGenomicPos += 3) {
		const codonSeq = cdsSequence.slice(codonGenomicPos, codonGenomicPos + 3).toUpperCase();
		proteinSequence.push(_jbrowse_core_util.defaultCodonTable[codonSeq] || "&");
	}
	const onCopyClick = () => {
		const seqDiv = seqRef.current;
		if (!seqDiv) return;
		copyToClipboard(seqDiv);
	};
	const getCodonGenomicLocation = (codonGenomicPosition) => {
		const [firstLocation] = cdsLocations;
		let cdsLen = 0;
		const sortedCDSLocations = firstLocation.toSorted(({ min: a }, { min: b }) => a - b);
		if (strand === 1) for (const loc of sortedCDSLocations) {
			const locLength = loc.max - loc.min;
			if (cdsLen + locLength > codonGenomicPosition) return loc.min + (codonGenomicPosition - cdsLen);
			cdsLen += locLength;
		}
		else if (strand === -1) for (let i = sortedCDSLocations.length - 1; i >= 0; i--) {
			const loc = sortedCDSLocations[i];
			const locLength = loc.max - loc.min;
			if (cdsLen + locLength > codonGenomicPosition) return loc.max - (codonGenomicPosition - cdsLen);
			cdsLen += locLength;
		}
		if (strand === 1) return cdsMin;
		return cdsMax;
	};
	const trimTranslationSequence = () => {
		if (proteinSequence.at(0) === "M" && proteinSequence.at(-1) === "*" || proteinSequence.length === 0) return;
		const startCodonIndex = proteinSequence.indexOf("M");
		if (startCodonIndex === -1) {
			notify("Start codon not found", "error");
			return;
		}
		const stopCodonIndex = proteinSequence.indexOf("*", startCodonIndex);
		if (stopCodonIndex === -1) {
			notify("Stop codon not found", "error");
			return;
		}
		const startCodonPos = startCodonIndex * 3;
		const stopCodonPos = stopCodonIndex * 3;
		const startCodonGenomicLoc = getCodonGenomicLocation(startCodonPos);
		let stopCodonGenomicLoc = getCodonGenomicLocation(stopCodonPos);
		if (strand === 1) {
			if (startCodonGenomicLoc > stopCodonGenomicLoc) {
				notify("Start codon genomic location should be less than stop codon genomic location", "error");
				return;
			}
			let promise;
			stopCodonGenomicLoc += 3;
			if (startCodonGenomicLoc !== cdsMin) promise = new Promise((resolve) => {
				updateCDSLocation(cdsMin, startCodonGenomicLoc, feature, true, () => {
					resolve(true);
				});
			});
			if (stopCodonGenomicLoc !== cdsMax) {
				if (promise) promise.then(() => {
					updateCDSLocation(cdsMax, stopCodonGenomicLoc, feature, false);
				});
				else updateCDSLocation(cdsMax, stopCodonGenomicLoc, feature, false);
			}
		}
		if (strand === -1) {
			if (startCodonGenomicLoc < stopCodonGenomicLoc) {
				notify("Start codon genomic location should be less than stop codon genomic location", "error");
				return;
			}
			let promise;
			stopCodonGenomicLoc -= 3;
			if (startCodonGenomicLoc !== cdsMax) promise = new Promise((resolve) => {
				updateCDSLocation(cdsMax, startCodonGenomicLoc, feature, false, () => {
					resolve(true);
				});
			});
			if (stopCodonGenomicLoc !== cdsMin) {
				if (promise) promise.then(() => {
					updateCDSLocation(cdsMin, stopCodonGenomicLoc, feature, true);
				});
				else updateCDSLocation(cdsMin, stopCodonGenomicLoc, feature, true);
			}
		}
		notify("Translation sequence trimmed to start and stop codons", "success");
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Accordion, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StyledAccordionSummary$1, {
		expandIcon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_ExpandMore.default, { style: { color: "white" } }),
		"aria-controls": "panel1-content",
		id: "panel1-header",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
			component: "span",
			fontWeight: "bold",
			children: "Translation"
		})
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.AccordionDetails, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SequenceContainer, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
		component: "span",
		ref: seqRef,
		style: {
			maxHeight: 120,
			overflowY: "scroll"
		},
		children: proteinSequence.map((protein, idx) => {
			const codonGenomicPos = idx * 3;
			if (protein === "M") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
				component: "span",
				style: {
					backgroundColor: changeInProgress ? "lightgray" : "yellow",
					cursor: "pointer",
					border: "1px solid black"
				},
				onClick: () => {
					if (changeInProgress) return;
					const startCodonGenomicLocation = getCodonGenomicLocation(codonGenomicPos);
					if (startCodonGenomicLocation !== cdsMin && strand === 1) updateCDSLocation(cdsMin, startCodonGenomicLocation, feature, true);
					if (startCodonGenomicLocation !== cdsMax && strand === -1) updateCDSLocation(cdsMax, startCodonGenomicLocation, feature, false);
				},
				children: protein
			}, codonGenomicPos);
			if (protein === "*") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
				style: {
					backgroundColor: "red",
					color: "white"
				},
				component: "span",
				children: protein
			}, codonGenomicPos);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
				component: "span",
				children: protein
			}, codonGenomicPos);
		})
	}) }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		style: {
			marginTop: 10,
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			gap: 10
		},
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Tooltip, {
			title: "Copy",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				onClick: onCopyClick,
				style: {
					border: "none",
					background: "none",
					padding: 0
				},
				disabled: changeInProgress,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_ContentCopy.default, { style: { fontSize: 15 } })
			})
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Tooltip, {
			title: "Trim",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				onClick: trimTranslationSequence,
				style: {
					border: "none",
					background: "none",
					padding: 0
				},
				disabled: changeInProgress,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_ContentCut.default, { style: { fontSize: 15 } })
			})
		})]
	})] })] }) });
}
//#endregion
//#region src/FeatureDetailsWidget/TranscriptWidgetEditLocation.tsx
const StyledTextField = (0, _mui_material_styles.styled)(NumberTextField)(() => ({
	"&.MuiFormControl-root": {
		marginTop: 0,
		marginBottom: 0,
		width: "100%"
	},
	"& .MuiInputBase-input": {
		fontSize: 12,
		height: 20,
		padding: 1,
		paddingLeft: 10
	}
}));
const Strand = (props) => {
	const { strand } = props;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: strand === 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Add.default, {}) : strand === -1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Remove.default, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
		component: "span",
		children: "N/A"
	}) });
};
const minMaxExonTranscriptLocation = (transcript, featureTypeOntology) => {
	const { transcriptExonParts } = transcript;
	const exonParts = transcriptExonParts.filter((part) => featureTypeOntology.isTypeOf(part.type, "exon")).sort(({ min: a }, { min: b }) => a - b);
	return [exonParts[0]?.min, exonParts[exonParts.length - 1]?.max];
};
const TranscriptWidgetEditLocation = (0, mobx_react.observer)(function TranscriptWidgetEditLocation({ assembly, feature, refName, session }) {
	const { notify } = session;
	const refData = session.apolloDataStore.assemblies.get(assembly)?.getByRefName(refName);
	const { changeManager } = session.apolloDataStore;
	const { changeInProgress } = session;
	if (!refData) return null;
	const { apolloDataStore } = session;
	const { featureTypeOntology } = apolloDataStore.ontologyManager;
	if (!featureTypeOntology.isTypeOf(feature.type, "transcript") && !featureTypeOntology.isTypeOf(feature.type, "pseudogenic_transcript")) throw new Error("Feature is not a transcript or equivalent");
	const { cdsLocations, transcriptExonParts, strand } = feature;
	const [firstCDSLocation] = cdsLocations;
	const [exonMin, exonMax] = minMaxExonTranscriptLocation(feature, featureTypeOntology);
	let cdsMin = exonMin;
	let cdsMax = exonMax;
	const cdsPresent = firstCDSLocation.length > 0;
	if (cdsPresent) {
		const sortedCDSLocations = firstCDSLocation.toSorted(({ min: a }, { min: b }) => a - b);
		cdsMin = sortedCDSLocations[0].min;
		cdsMax = sortedCDSLocations[sortedCDSLocations.length - 1].max;
	}
	const updateCDSLocation = (oldLocation, newLocation, feature, isMin, onComplete) => {
		if (!feature.children) throw new Error("Transcript should have child features");
		if (oldLocation === newLocation) return true;
		const cdsFeature = getMatchingCDSFeature(feature, featureTypeOntology, oldLocation, isMin);
		if (!cdsFeature) {
			notify("No matching CDS feature found", "error");
			return false;
		}
		if (isMin && newLocation >= cdsFeature.max) {
			notify("Start location should be less than CDS end location", "error");
			return false;
		}
		if (!isMin && newLocation <= cdsFeature.min) {
			notify("End location should be greater than CDS start location", "error");
			return false;
		}
		if (!getOverlappingExonForCDS(feature, featureTypeOntology, newLocation, isMin)) {
			notify("There should be an overlapping exon for the new CDS location", "error");
			return false;
		}
		const change = isMin ? new _apollo_annotation_shared.LocationStartChange({
			typeName: "LocationStartChange",
			changedIds: [cdsFeature._id],
			featureId: cdsFeature._id,
			oldStart: cdsFeature.min,
			newStart: newLocation,
			assembly
		}) : new _apollo_annotation_shared.LocationEndChange({
			typeName: "LocationEndChange",
			changedIds: [cdsFeature._id],
			featureId: cdsFeature._id,
			oldEnd: cdsFeature.max,
			newEnd: newLocation,
			assembly
		});
		changeManager.submit(change).then(() => {
			if (onComplete) onComplete();
		}).catch(() => {
			notify("Error updating feature CDS position", "error");
		});
		return true;
	};
	function handleExonLocationChange(oldLocation, newLocation, feature, isMin) {
		if (!feature.children) throw new Error("Transcript should have child features");
		const { matchingExon, prevExon, nextExon } = getNeighboringExonParts(feature, featureTypeOntology, oldLocation, isMin);
		if (!matchingExon) {
			notify("No matching exon found", "error");
			return false;
		}
		if (isMin && newLocation >= matchingExon.max) {
			notify(`Start location should be less than end location`, "error");
			return false;
		}
		if (!isMin && newLocation <= matchingExon.min) {
			notify(`End location should be greater than start location`, "error");
			return false;
		}
		if (prevExon && prevExon.max + 2 > newLocation) {
			notify(`Error while changing start location`, "error");
			return false;
		}
		if (nextExon && nextExon.min - 2 < newLocation) {
			notify(`Error while changing end location`, "error");
			return false;
		}
		const exonFeature = getExonFeature(feature, matchingExon.min, matchingExon.max, featureTypeOntology);
		if (!exonFeature) {
			notify("No matching exon feature found", "error");
			return false;
		}
		const cdsFeature = getFirstCDSFeature(feature, featureTypeOntology);
		if (isMin && newLocation !== matchingExon.min) {
			const startChange = new _apollo_annotation_shared.LocationStartChange({
				typeName: "LocationStartChange",
				changedIds: [],
				changes: [],
				assembly
			});
			if (prevExon) appendStartLocationChange(exonFeature, startChange, newLocation);
			else {
				const transcriptStart = feature.min;
				const gene = feature.parent;
				if (newLocation < transcriptStart) {
					if (gene && newLocation < gene.min) appendStartLocationChange(gene, startChange, newLocation);
					appendStartLocationChange(feature, startChange, newLocation);
					appendStartLocationChange(exonFeature, startChange, newLocation);
				} else if (newLocation > transcriptStart) {
					appendStartLocationChange(exonFeature, startChange, newLocation);
					appendStartLocationChange(feature, startChange, newLocation);
					if (gene) {
						const [geneMinWithNewLoc] = geneMinMaxWithNewLocation(gene, feature, newLocation, featureTypeOntology, isMin);
						if (gene.min != geneMinWithNewLoc) appendStartLocationChange(gene, startChange, geneMinWithNewLoc);
					}
				}
			}
			if (cdsFeature && cdsFeature.min >= matchingExon.min && cdsFeature.min <= matchingExon.max && newLocation > cdsFeature.min) appendStartLocationChange(cdsFeature, startChange, newLocation);
			changeManager.submit(startChange).catch(() => {
				notify("Error updating feature exon start position", "error");
			});
		}
		if (!isMin && newLocation !== matchingExon.max) {
			const endChange = new _apollo_annotation_shared.LocationEndChange({
				typeName: "LocationEndChange",
				changedIds: [],
				changes: [],
				assembly
			});
			if (nextExon) appendEndLocationChange(exonFeature, endChange, newLocation);
			else {
				const transcriptEnd = feature.max;
				const gene = feature.parent;
				if (newLocation > transcriptEnd) {
					if (gene && newLocation > gene.max) appendEndLocationChange(gene, endChange, newLocation);
					appendEndLocationChange(feature, endChange, newLocation);
					appendEndLocationChange(exonFeature, endChange, newLocation);
				} else if (newLocation < transcriptEnd) {
					appendEndLocationChange(exonFeature, endChange, newLocation);
					appendEndLocationChange(feature, endChange, newLocation);
					if (gene) {
						const [, geneMaxWithNewLoc] = geneMinMaxWithNewLocation(gene, feature, newLocation, featureTypeOntology, isMin);
						if (gene.max != geneMaxWithNewLoc) appendEndLocationChange(gene, endChange, geneMaxWithNewLoc);
					}
				}
			}
			if (cdsFeature && cdsFeature.max >= matchingExon.min && cdsFeature.max <= matchingExon.max && newLocation < cdsFeature.max) appendEndLocationChange(cdsFeature, endChange, newLocation);
			changeManager.submit(endChange).catch(() => {
				notify("Error updating feature exon end position", "error");
			});
		}
		return true;
	}
	const appendEndLocationChange = (feature, change, newLocation) => {
		change.changedIds.push(feature._id);
		change.changes.push({
			featureId: feature._id,
			oldEnd: feature.max,
			newEnd: newLocation
		});
	};
	const appendStartLocationChange = (feature, change, newLocation) => {
		change.changedIds.push(feature._id);
		change.changes.push({
			featureId: feature._id,
			oldStart: feature.min,
			newStart: newLocation
		});
	};
	const getMatchingCDSFeature = (feature, featureTypeOntology, oldCDSLocation, isMin) => {
		let cdsFeature;
		for (const [, child] of feature.children ?? []) {
			if (!featureTypeOntology.isTypeOf(child.type, "CDS")) continue;
			if (isMin && oldCDSLocation === child.min) {
				cdsFeature = child;
				break;
			}
			if (!isMin && oldCDSLocation === child.max) {
				cdsFeature = child;
				break;
			}
		}
		return cdsFeature;
	};
	const getFirstCDSFeature = (feature, featureTypeOntology) => {
		let cdsFeature;
		for (const [, child] of feature.children ?? []) {
			if (!featureTypeOntology.isTypeOf(child.type, "CDS")) continue;
			cdsFeature = child;
			break;
		}
		return cdsFeature;
	};
	const getExonFeature = (feature, exonMin, exonMax, featureTypeOntology) => {
		let exonFeature;
		for (const [, child] of feature.children ?? []) {
			if (!featureTypeOntology.isTypeOf(child.type, "exon")) continue;
			if (exonMin === child.min && exonMax === child.max) {
				exonFeature = child;
				break;
			}
		}
		return exonFeature;
	};
	const geneMinMaxWithNewLocation = (gene, transcript, newLocation, featureTypeOntology, isMin) => {
		const mins = [];
		const maxs = [];
		for (const [, t] of gene.children?.entries() ?? []) {
			if (!featureTypeOntology.isTypeOf(t.type, "transcript")) continue;
			if (t._id === transcript._id) {
				if (isMin) {
					mins.push(newLocation);
					maxs.push(t.max);
				} else {
					maxs.push(newLocation);
					mins.push(t.min);
				}
			} else {
				mins.push(t.min);
				maxs.push(t.max);
			}
		}
		return [Math.min(...mins), Math.max(...maxs)];
	};
	const getOverlappingExonForCDS = (transcript, featureTypeOntology, oldCDSLocation, isMin) => {
		const { transcriptExonParts } = transcript;
		let overlappingExonPart;
		for (const [, exonPart] of transcriptExonParts.entries()) {
			if (!featureTypeOntology.isTypeOf(exonPart.type, "exon")) continue;
			if (!isMin && oldCDSLocation >= exonPart.min && oldCDSLocation <= exonPart.max) {
				overlappingExonPart = exonPart;
				break;
			}
			if (isMin && oldCDSLocation >= exonPart.min && oldCDSLocation <= exonPart.max) {
				overlappingExonPart = exonPart;
				break;
			}
		}
		return overlappingExonPart;
	};
	const getNeighboringExonParts = (transcript, featureTypeOntology, oldExonLoc, isMin) => {
		const { transcriptExonParts, strand } = transcript;
		let matchingExon, matchingExonIdx, prevExon, nextExon;
		for (const [i, exonPart] of transcriptExonParts.entries()) {
			if (!featureTypeOntology.isTypeOf(exonPart.type, "exon")) continue;
			if (isMin && exonPart.min === oldExonLoc) {
				matchingExon = exonPart;
				matchingExonIdx = i;
				break;
			}
			if (!isMin && exonPart.max === oldExonLoc) {
				matchingExon = exonPart;
				matchingExonIdx = i;
				break;
			}
		}
		if (matchingExon && matchingExonIdx !== void 0) {
			if (strand === 1 && matchingExonIdx > 0) for (let i = matchingExonIdx - 1; i >= 0; i--) {
				const prevLoc = transcriptExonParts[i];
				if (featureTypeOntology.isTypeOf(prevLoc.type, "exon")) {
					prevExon = prevLoc;
					break;
				}
			}
			if (strand === -1 && matchingExonIdx < transcriptExonParts.length - 1) for (let i = matchingExonIdx + 1; i < transcriptExonParts.length; i++) {
				const prevLoc = transcriptExonParts[i];
				if (featureTypeOntology.isTypeOf(prevLoc.type, "exon")) {
					prevExon = prevLoc;
					break;
				}
			}
			if (strand === 1 && matchingExonIdx < transcriptExonParts.length - 1) for (let i = matchingExonIdx + 1; i < transcriptExonParts.length; i++) {
				const nextLoc = transcriptExonParts[i];
				if (featureTypeOntology.isTypeOf(nextLoc.type, "exon")) {
					nextExon = nextLoc;
					break;
				}
			}
			if (strand === -1 && matchingExonIdx > 0) for (let i = matchingExonIdx - 1; i >= 0; i--) {
				const nextLoc = transcriptExonParts[i];
				if (featureTypeOntology.isTypeOf(nextLoc.type, "exon")) {
					nextExon = nextLoc;
					break;
				}
			}
		}
		return {
			matchingExon,
			prevExon,
			nextExon
		};
	};
	const getFivePrimeSpliceSite = (loc, prevLocIdx) => {
		let spliceSite = "";
		if (prevLocIdx > 0) {
			const prevLoc = transcriptExonParts[prevLocIdx - 1];
			if (strand === 1) {
				if (prevLoc.type === "intron") spliceSite = refData.getSequence(loc.min - 2, loc.min);
			} else if (prevLoc.type === "intron") spliceSite = (0, _jbrowse_core_util.revcom)(refData.getSequence(loc.max, loc.max + 2));
		}
		spliceSite = spliceSite.toUpperCase();
		return [{
			spliceSite,
			color: spliceSite === "AG" ? "green" : "red"
		}];
	};
	const getThreePrimeSpliceSite = (loc, nextLocIdx) => {
		let spliceSite = "";
		if (nextLocIdx < transcriptExonParts.length - 1) {
			const nextLoc = transcriptExonParts[nextLocIdx + 1];
			if (strand === 1) {
				if (nextLoc.type === "intron") spliceSite = refData.getSequence(loc.max, loc.max + 2);
			} else if (nextLoc.type === "intron") spliceSite = (0, _jbrowse_core_util.revcom)(refData.getSequence(loc.min - 2, loc.min));
		}
		spliceSite = spliceSite.toUpperCase();
		return [{
			spliceSite,
			color: spliceSite === "GT" ? "green" : "red"
		}];
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
		cdsPresent && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Grid, {
			container: true,
			justifyContent: "center",
			alignItems: "center",
			style: { textAlign: "center" },
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, { size: 1 }),
				strand === 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, {
					size: 4,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StyledTextField, {
						margin: "dense",
						variant: "outlined",
						value: cdsMin + 1,
						onChangeCommitted: (newLocation) => {
							return updateCDSLocation(cdsMin, newLocation - 1, feature, true);
						},
						style: {
							border: "1px solid black",
							borderRadius: 5
						},
						disabled: changeInProgress
					})
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, {
					size: 4,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StyledTextField, {
						margin: "dense",
						variant: "outlined",
						value: cdsMax,
						onChangeCommitted: (newLocation) => {
							return updateCDSLocation(cdsMax, newLocation, feature, false);
						},
						style: {
							border: "1px solid black",
							borderRadius: 5
						},
						disabled: changeInProgress
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, {
					size: 2,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
						component: "span",
						children: "CDS"
					})
				}),
				strand === 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, {
					size: 4,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StyledTextField, {
						margin: "dense",
						variant: "outlined",
						value: cdsMax,
						onChangeCommitted: (newLocation) => {
							return updateCDSLocation(cdsMax, newLocation, feature, false);
						},
						style: {
							border: "1px solid black",
							borderRadius: 5
						},
						disabled: changeInProgress
					})
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, {
					size: 4,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StyledTextField, {
						margin: "dense",
						variant: "outlined",
						value: cdsMin + 1,
						onChangeCommitted: (newLocation) => {
							return updateCDSLocation(cdsMin, newLocation - 1, feature, true);
						},
						style: {
							border: "1px solid black",
							borderRadius: 5
						},
						disabled: changeInProgress
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, { size: 1 })
			]
		}) }),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				marginTop: 5,
				marginBottom: 10
			},
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: { textAlign: "center" },
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, { children: "Exons" })
			}), transcriptExonParts.map((loc, index) => {
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: loc.type === "exon" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Grid, {
					container: true,
					justifyContent: "center",
					alignItems: "center",
					style: { textAlign: "center" },
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, {
							size: 1,
							children: index !== 0 && getFivePrimeSpliceSite(loc, index).map((site, idx) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
								component: "span",
								color: site.color,
								children: site.spliceSite
							}, idx))
						}),
						strand === 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, {
							size: 4,
							style: { padding: 0 },
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StyledTextField, {
								margin: "dense",
								variant: "outlined",
								value: loc.min + 1,
								onChangeCommitted: (newLocation) => {
									return handleExonLocationChange(loc.min, newLocation - 1, feature, true);
								},
								disabled: changeInProgress
							})
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, {
							size: 4,
							style: { padding: 0 },
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StyledTextField, {
								margin: "dense",
								variant: "outlined",
								value: loc.max,
								onChangeCommitted: (newLocation) => {
									return handleExonLocationChange(loc.max, newLocation, feature, false);
								},
								disabled: changeInProgress
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, {
							size: 2,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Strand, { strand: feature.strand })
						}),
						strand === 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, {
							size: 4,
							style: { padding: 0 },
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StyledTextField, {
								margin: "dense",
								variant: "outlined",
								value: loc.max,
								onChangeCommitted: (newLocation) => {
									return handleExonLocationChange(loc.max, newLocation, feature, false);
								},
								disabled: changeInProgress
							})
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, {
							size: 4,
							style: { padding: 0 },
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StyledTextField, {
								margin: "dense",
								variant: "outlined",
								value: loc.min + 1,
								onChangeCommitted: (newLocation) => {
									return handleExonLocationChange(loc.min, newLocation - 1, feature, true);
								},
								disabled: changeInProgress
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, {
							size: 1,
							children: index !== transcriptExonParts.length - 1 && getThreePrimeSpliceSite(loc, index).map((site, idx) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
								component: "span",
								color: site.color,
								children: site.spliceSite
							}, idx))
						})
					]
				}) }, index);
			})]
		}),
		cdsPresent && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Translation, {
			changeInProgress,
			cdsLocations,
			refData,
			strand,
			updateCDSLocation,
			cdsMin,
			cdsMax,
			feature,
			session
		})
	] });
});
//#endregion
//#region src/FeatureDetailsWidget/TranscriptWidgetSummary.tsx
const HeaderTableCell = (0, _mui_material_styles.styled)(_mui_material.TableCell)(() => ({ fontWeight: "bold" }));
const TranscriptWidgetSummary = (0, mobx_react.observer)(function TranscriptWidgetSummary(props) {
	const { feature } = props;
	const name = getFeatureName$1(feature);
	const id = getFeatureId$1(feature);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Table, {
		size: "small",
		sx: {
			fontSize: "0.75rem",
			"& .MuiTableCell-root": { padding: "4px" }
		},
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableBody, { children: [
			name !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableRow, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(HeaderTableCell, { children: "Name" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, { children: getFeatureName$1(feature) })] }),
			id !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableRow, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(HeaderTableCell, { children: "ID" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, { children: getFeatureId$1(feature) })] }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableRow, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(HeaderTableCell, { children: "Type" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, { children: feature.type })] }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableRow, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(HeaderTableCell, { children: "Location" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableCell, { children: [
				props.refName,
				":",
				feature.min,
				"..",
				feature.max
			] })] }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.TableRow, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(HeaderTableCell, { children: "Strand" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TableCell, { children: getStrand(feature.strand) })] })
		] })
	});
});
//#endregion
//#region src/FeatureDetailsWidget/ApolloTranscriptDetailsWidget.tsx
const useStyles$7 = (0, tss_react_mui.makeStyles)()((theme) => ({ root: { padding: theme.spacing(2) } }));
const StyledAccordionSummary = (0, _mui_material_styles.styled)(_mui_material.AccordionSummary)(() => ({
	minHeight: 30,
	maxHeight: 30,
	"&.Mui-expanded": {
		minHeight: 30,
		maxHeight: 30
	}
}));
function NoOpCustomComponent(_props) {
	return null;
}
const ApolloTranscriptDetailsWidget = (0, mobx_react.observer)(function ApolloTranscriptDetails(props) {
	const { classes } = useStyles$7();
	const DEFAULT_PANELS = ["summary", "location"];
	const [panelState, setPanelState] = (0, react.useState)(DEFAULT_PANELS);
	const { model } = props;
	const { assembly, feature, refName } = model;
	(0, react.useEffect)(() => {
		setPanelState(DEFAULT_PANELS);
	}, [feature]);
	const session = (0, _jbrowse_core_util.getSession)(model);
	const { pluginManager } = (0, _jbrowse_core_util.getEnv)(session);
	const apolloSession = (0, _jbrowse_core_util.getSession)(model);
	const currentAssembly = apolloSession.apolloDataStore.assemblies.get(assembly);
	const { internetAccounts } = (0, _jbrowse_mobx_state_tree.getRoot)(session);
	const apolloInternetAccount = internetAccounts.find((ia) => ia.type === "ApolloInternetAccount");
	const editable = ["admin", "user"].includes((apolloInternetAccount ? apolloInternetAccount.role : "admin") ?? "");
	if (!(feature && currentAssembly)) return null;
	const refSeq = currentAssembly.getByRefName(refName);
	if (!refSeq) return null;
	const { max, min } = feature;
	if (!refSeq.getSequence(min, max)) apolloSession.apolloDataStore.loadRefSeq([{
		assemblyName: assembly,
		refName,
		start: min,
		end: max
	}]);
	function handlePanelChange(expanded, panel) {
		if (expanded) setPanelState([...panelState, panel]);
		else setPanelState(panelState.filter((p) => p !== panel));
	}
	const CustomComponentInsideSummary = pluginManager.evaluateExtensionPoint("Apollo-TranscriptDetailsCustomComponent-InsideSummary", NoOpCustomComponent, {
		feature,
		session
	});
	const CustomComponentAfterSummary = pluginManager.evaluateExtensionPoint("Apollo-TranscriptDetailsCustomComponent-AfterSummary", NoOpCustomComponent, {
		feature,
		session
	});
	const CustomComponentInsideLocation = pluginManager.evaluateExtensionPoint("Apollo-TranscriptDetailsCustomComponent-InsideLocation", NoOpCustomComponent, {
		feature,
		session
	});
	const CustomComponentAfterLocation = pluginManager.evaluateExtensionPoint("Apollo-TranscriptDetailsCustomComponent-AfterLocation", NoOpCustomComponent, {
		feature,
		session
	});
	const CustomComponentInsideAttributes = pluginManager.evaluateExtensionPoint("Apollo-TranscriptDetailsCustomComponent-InsideAttributes", NoOpCustomComponent, {
		feature,
		session
	});
	const CustomComponentAfterAttributes = pluginManager.evaluateExtensionPoint("Apollo-TranscriptDetailsCustomComponent-AfterAttributes", NoOpCustomComponent, {
		feature,
		session
	});
	const CustomComponentInsideSequence = pluginManager.evaluateExtensionPoint("Apollo-TranscriptDetailsCustomComponent-InsideSequence", NoOpCustomComponent, {
		feature,
		session
	});
	const CustomComponentAfterSequence = pluginManager.evaluateExtensionPoint("Apollo-TranscriptDetailsCustomComponent-AfterSequence", NoOpCustomComponent, {
		feature,
		session
	});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: classes.root,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Accordion, {
				expanded: panelState.includes("summary"),
				onChange: (e, expanded) => {
					handlePanelChange(expanded, "summary");
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StyledAccordionSummary, {
					expandIcon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_ExpandMore.default, { style: { color: "white" } }),
					"aria-controls": "panel1-content",
					id: "panel1-header",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
						component: "span",
						fontWeight: "bold",
						children: "Summary"
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.AccordionDetails, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TranscriptWidgetSummary, {
					feature,
					refName
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CustomComponentInsideSummary, {
					session,
					feature
				})] })]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CustomComponentAfterSummary, {
				session,
				feature
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Accordion, {
				style: { marginTop: 5 },
				expanded: panelState.includes("location"),
				onChange: (e, expanded) => {
					handlePanelChange(expanded, "location");
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StyledAccordionSummary, {
					expandIcon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_ExpandMore.default, { style: { color: "white" } }),
					"aria-controls": "panel2-content",
					id: "panel2-header",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
						component: "span",
						fontWeight: "bold",
						children: "Location"
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.AccordionDetails, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TranscriptWidgetEditLocation, {
					feature,
					refName,
					session: apolloSession,
					assembly: currentAssembly._id || ""
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CustomComponentInsideLocation, {
					session,
					feature
				})] })]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CustomComponentAfterLocation, {
				session,
				feature
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Accordion, {
				style: { marginTop: 5 },
				expanded: panelState.includes("attrs"),
				onChange: (e, expanded) => {
					handlePanelChange(expanded, "attrs");
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StyledAccordionSummary, {
					expandIcon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_ExpandMore.default, { style: { color: "white" } }),
					"aria-controls": "panel3-content",
					id: "panel3-header",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center"
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Typography, {
							component: "span",
							fontWeight: "bold",
							children: ["Attributes", " "]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Tooltip, {
							title: "Separate multiple values for the attribute with commas",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Info.default, { style: {
								color: "white",
								fontSize: 15,
								marginLeft: 10
							} })
						})]
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.AccordionDetails, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Attributes, {
					feature,
					session: apolloSession,
					assembly: currentAssembly._id || "",
					editable
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CustomComponentInsideAttributes, {
					session,
					feature
				})] })]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CustomComponentAfterAttributes, {
				session,
				feature
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Accordion, {
				style: { marginTop: 5 },
				expanded: panelState.includes("sequence"),
				onChange: (e, expanded) => {
					handlePanelChange(expanded, "sequence");
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StyledAccordionSummary, {
					expandIcon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_ExpandMore.default, { style: { color: "white" } }),
					"aria-controls": "panel4-content",
					id: "panel4-header",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
						component: "span",
						fontWeight: "bold",
						children: "Sequence"
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.AccordionDetails, { children: [panelState.includes("sequence") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TranscriptSequence, {
					feature,
					session: apolloSession,
					assembly: currentAssembly._id || "",
					refName
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CustomComponentInsideSequence, {
					session,
					feature
				})] })]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CustomComponentAfterSequence, {
				feature,
				session
			})
		]
	});
});
//#endregion
//#region src/LinearApolloDisplay/configSchema.ts
const configSchema$2 = (0, _jbrowse_core_configuration.ConfigurationSchema)("LinearApolloDisplay", {}, {
	explicitIdentifier: "displayId",
	explicitlyTyped: true
});
//#endregion
//#region src/TabularEditor/HybridGrid/ChangeHandling.ts
function handleFeatureTypeChange(changeManager, feature, oldType, newType) {
	const featureId = feature._id;
	const change = new _apollo_annotation_shared.TypeChange({
		typeName: "TypeChange",
		changedIds: [featureId],
		featureId,
		oldType,
		newType,
		assembly: feature.assemblyId
	});
	return changeManager.submit(change);
}
function handleFeatureStartChange(changeManager, feature, oldStart, newStart) {
	const featureId = feature._id;
	const change = new _apollo_annotation_shared.LocationStartChange({
		typeName: "LocationStartChange",
		changedIds: [featureId],
		featureId,
		oldStart,
		newStart,
		assembly: feature.assemblyId
	});
	return changeManager.submit(change);
}
function handleFeatureEndChange(changeManager, feature, oldEnd, newEnd) {
	const featureId = feature._id;
	const change = new _apollo_annotation_shared.LocationEndChange({
		typeName: "LocationEndChange",
		changedIds: [featureId],
		featureId,
		oldEnd,
		newEnd,
		assembly: feature.assemblyId
	});
	return changeManager.submit(change);
}
//#endregion
//#region src/TabularEditor/HybridGrid/Highlight.tsx
const useStyles$6 = (0, tss_react_mui.makeStyles)()({ highlighted: { background: "orange" } });
const Highlight = ({ highlight, text }) => {
	const { classes } = useStyles$6();
	if (!highlight) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: text });
	const split = text.split(highlight);
	if (split.length === 1) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: text });
	const highlighted = [];
	for (let i = 0; i < split.length - 1; i++) highlighted.push(split[i], /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
		className: classes.highlighted,
		children: highlight
	}));
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [highlighted, split.at(-1)] });
};
//#endregion
//#region src/TabularEditor/HybridGrid/FeatureAttributes.tsx
const FeatureAttributes = (0, mobx_react.observer)(function FeatureAttributes({ feature, filterText }) {
	const attrString = [...feature.attributes.entries()].map(([key, value]) => {
		if (key.startsWith("gff_")) {
			const newKey = key.slice(4);
			return [newKey.charAt(0).toUpperCase() + newKey.slice(1), (0, _jbrowse_mobx_state_tree.getSnapshot)(value)];
		}
		if (key === "_id") return ["ID", (0, _jbrowse_mobx_state_tree.getSnapshot)(value)];
		return [key, (0, _jbrowse_mobx_state_tree.getSnapshot)(value)];
	}).filter(([key]) => key).map(([key, values]) => `${key}=${Array.isArray(values) ? values.join(", ") : values}`).join(", ");
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Highlight, {
		text: attrString,
		highlight: filterText
	});
});
//#endregion
//#region src/TabularEditor/HybridGrid/NumberCell.tsx
const useStyles$5 = (0, tss_react_mui.makeStyles)()((theme) => ({
	inputWrapper: { position: "relative" },
	hiddenWidthSpan: {
		padding: theme.spacing(.5),
		color: "transparent"
	},
	numberTextInput: {
		border: "none",
		background: "inherit",
		font: "inherit",
		position: "absolute",
		width: "100%",
		left: 0
	}
}));
const NumberCell = (0, mobx_react.observer)(function NumberCell({ initialValue, notifyError, onChangeCommitted }) {
	const [value, setValue] = (0, react.useState)(initialValue);
	const [blur, setBlur] = (0, react.useState)(false);
	const [inputNode, setInputNode] = (0, react.useState)(null);
	const { classes } = useStyles$5();
	(0, react.useEffect)(() => {
		if (initialValue !== value) setValue(initialValue);
	}, [initialValue]);
	(0, react.useEffect)(() => {
		if (blur) {
			inputNode?.blur();
			setBlur(false);
		}
	}, [blur, inputNode]);
	function onChange(event) {
		const newValue = Number(event.target.value);
		if (!Number.isNaN(newValue)) setValue(newValue);
	}
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
		className: classes.inputWrapper,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			className: classes.hiddenWidthSpan,
			"aria-hidden": true,
			children: value
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
			type: "text",
			value,
			className: classes.numberTextInput,
			onChange,
			onKeyDown: (event) => {
				if (event.key === "Enter") inputNode?.blur();
				else if (event.key === "Escape") {
					setValue(initialValue);
					setBlur(true);
				}
			},
			onBlur: () => {
				if (value !== initialValue) onChangeCommitted(value).catch(notifyError);
			},
			ref: (node) => {
				setInputNode(node);
			}
		})]
	});
});
//#endregion
//#region src/TabularEditor/HybridGrid/featureContextMenuItems.ts
function featureContextMenuItems(feature, region, getAssemblyId, selectedFeature, setSelectedFeature, session, changeManager, filteredTranscripts, updateFilteredTranscripts) {
	const internetAccount = getApolloInternetAccount(session);
	const role = internetAccount ? internetAccount.role : "admin";
	const readOnly = !(role && ["admin", "user"].includes(role));
	const menuItems = [];
	if (feature) {
		const featureID = feature.attributes.get("gff_id")?.toString();
		const sourceAssemblyId = getAssemblyId(region.assemblyName);
		const currentAssemblyId = getAssemblyId(region.assemblyName);
		menuItems.push({
			label: "Edit feature details",
			onClick: () => {
				const apolloFeatureWidget = session.addWidget("ApolloFeatureDetailsWidget", "apolloFeatureDetailsWidget", {
					feature,
					assembly: currentAssemblyId,
					refName: region.refName
				});
				session.showWidget(apolloFeatureWidget);
			}
		}, {
			label: "Add child feature",
			disabled: readOnly,
			onClick: () => {
				session.queueDialog((doneCallback) => [AddChildFeature, {
					session,
					handleClose: () => {
						doneCallback();
					},
					changeManager,
					sourceFeature: feature,
					sourceAssemblyId,
					internetAccount
				}]);
			}
		}, {
			label: "Copy features and annotations",
			disabled: readOnly,
			onClick: () => {
				session.queueDialog((doneCallback) => [CopyFeature, {
					session,
					handleClose: () => {
						doneCallback();
					},
					changeManager,
					sourceFeature: feature,
					sourceAssemblyId: currentAssemblyId
				}]);
			}
		}, {
			label: "Delete feature",
			disabled: readOnly,
			onClick: () => {
				session.queueDialog((doneCallback) => [DeleteFeature, {
					session,
					handleClose: () => {
						doneCallback();
					},
					changeManager,
					sourceFeature: feature,
					sourceAssemblyId: currentAssemblyId,
					selectedFeature,
					setSelectedFeature
				}]);
			}
		}, {
			label: "Merge transcripts",
			disabled: readOnly,
			onClick: () => {
				session.queueDialog((doneCallback) => [MergeTranscripts, {
					session,
					handleClose: () => {
						doneCallback();
					},
					changeManager,
					sourceFeature: feature,
					sourceAssemblyId: currentAssemblyId,
					selectedFeature,
					setSelectedFeature
				}]);
			}
		}, {
			label: "Merge exons",
			disabled: readOnly,
			onClick: () => {
				session.queueDialog((doneCallback) => [MergeExons, {
					session,
					handleClose: () => {
						doneCallback();
					},
					changeManager,
					sourceFeature: feature,
					sourceAssemblyId: currentAssemblyId,
					selectedFeature,
					setSelectedFeature
				}]);
			}
		}, {
			label: "Split exon",
			disabled: readOnly,
			onClick: () => {
				session.queueDialog((doneCallback) => [SplitExon, {
					session,
					handleClose: () => {
						doneCallback();
					},
					changeManager,
					sourceFeature: feature,
					sourceAssemblyId: currentAssemblyId,
					selectedFeature,
					setSelectedFeature
				}]);
			}
		});
		const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
		if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
		if ((featureTypeOntology.isTypeOf(feature.type, "transcript") || featureTypeOntology.isTypeOf(feature.type, "pseudogenic_transcript")) && (0, _jbrowse_core_util.isSessionModelWithWidgets)(session)) menuItems.push({
			label: "Edit transcript details",
			onClick: () => {
				const apolloTranscriptWidget = session.addWidget("ApolloTranscriptDetails", "apolloTranscriptDetails", {
					feature,
					assembly: currentAssemblyId,
					changeManager,
					refName: region.refName
				});
				session.showWidget(apolloTranscriptWidget);
			}
		}, {
			label: "Duplicate feature",
			onClick: () => {
				session.queueDialog((doneCallback) => [DuplicateTranscript, {
					session,
					handleClose: () => {
						doneCallback();
					},
					changeManager,
					sourceFeature: feature,
					sourceAssemblyId: currentAssemblyId,
					selectedFeature,
					setSelectedFeature
				}]);
			}
		}, {
			label: "Visible",
			type: "checkbox",
			checked: featureID && filteredTranscripts.includes(featureID) ? false : true,
			onClick: () => {
				if (featureID) updateFilteredTranscripts(filteredTranscripts.includes(featureID) ? filteredTranscripts.filter((form) => form !== featureID) : [...filteredTranscripts, featureID]);
			}
		});
	}
	return menuItems;
}
//#endregion
//#region src/TabularEditor/HybridGrid/Feature.tsx
const useStyles$4 = (0, tss_react_mui.makeStyles)()((theme) => ({
	typeContent: {
		display: "inline-block",
		width: "174px",
		height: "100%",
		cursor: "text"
	},
	feature: { td: {
		position: "relative",
		verticalAlign: "top",
		paddingLeft: "0.5em"
	} },
	arrow: {
		display: "inline-block",
		width: "1.6em",
		textAlign: "center",
		cursor: "pointer"
	},
	arrowExpanded: { transform: "rotate(90deg)" },
	hoveredFeature: { backgroundColor: theme.palette.action.hover },
	typeInputElement: {
		border: "none",
		background: "none"
	},
	typeErrorMessage: { color: "red" }
}));
function makeContextMenuItems(display, feature) {
	const { changeManager, getAssemblyId, regions, selectedFeature, session, setSelectedFeature, filteredTranscripts, updateFilteredTranscripts } = display;
	return featureContextMenuItems(feature, regions[0], getAssemblyId, selectedFeature, setSelectedFeature, session, changeManager, filteredTranscripts, updateFilteredTranscripts);
}
function navigateHere(displayState, feature) {
	displayState.lgv.navTo(navToFeatureCenter(feature, .1, displayState.lgv.totalBp));
}
const Feature = (0, mobx_react.observer)(function Feature({ depth, feature, isHovered, isSelected, model: displayState, selectedFeatureClass, setContextMenu }) {
	const { classes } = useStyles$4();
	const { changeManager, hoveredFeature, selectedFeature, session, tabularEditor: tabularEditorState } = displayState;
	const { featureCollapsed, filterText } = tabularEditorState;
	const { _id, children, max, min, strand, type } = feature;
	const expanded = !featureCollapsed.get(_id);
	const toggleExpanded = (e) => {
		e.stopPropagation();
		tabularEditorState.setFeatureCollapsed(_id, expanded);
	};
	const notifyError = (e) => {
		session.notify(e.message, "error");
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", {
		onMouseEnter: (_e) => {
			displayState.setHoveredFeature({
				feature,
				bp: min
			});
		},
		className: classes.feature + (isSelected ? ` ${selectedFeatureClass}` : isHovered ? ` ${classes.hoveredFeature}` : ""),
		onClick: (e) => {
			e.stopPropagation();
			displayState.setSelectedFeature(feature);
		},
		onDoubleClick: () => {
			displayState.setSelectedFeature(feature);
			navigateHere(displayState, feature);
		},
		onContextMenu: (e) => {
			e.preventDefault();
			setContextMenu({
				position: {
					left: e.clientX + 2,
					top: e.clientY - 6
				},
				items: makeContextMenuItems(displayState, feature)
			});
			return false;
		},
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", {
				style: {
					whiteSpace: "nowrap",
					borderLeft: `${depth * 2}em solid transparent`
				},
				children: [children?.size ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					onClick: toggleExpanded,
					className: classes.arrow + (expanded ? ` ${classes.arrowExpanded}` : ""),
					children: "❯"
				}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: classes.typeContent,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(OntologyTermAutocomplete, {
						session,
						ontologyName: "Sequence Ontology",
						style: { width: 170 },
						value: type,
						filterTerms: isOntologyClass,
						fetchValidTerms: fetchValidTypeTerms.bind(null, feature),
						renderInput: (params) => {
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								ref: params.InputProps.ref,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "text",
									...params.inputProps,
									className: classes.typeInputElement,
									style: { width: 170 }
								}), params.error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: classes.typeErrorMessage,
									children: params.errorMessage ?? "unknown error"
								}) : null]
							});
						},
						onChange: (oldValue, newValue) => {
							if (newValue) handleFeatureTypeChange(changeManager, feature, oldValue, newValue).catch(notifyError);
						}
					})
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NumberCell, {
				initialValue: min + 1,
				notifyError,
				onChangeCommitted: (newStart) => handleFeatureStartChange(changeManager, feature, min, newStart - 1)
			}) }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NumberCell, {
				initialValue: max,
				notifyError,
				onChangeCommitted: (newEnd) => handleFeatureEndChange(changeManager, feature, max, newEnd)
			}) }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: strand === 1 ? "+" : strand === -1 ? "-" : void 0 }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FeatureAttributes, {
				filterText,
				feature
			}) })
		]
	}), expanded && children ? [...children.entries()].filter((entry) => {
		if (!filterText) return true;
		const [, childFeature] = entry;
		return JSON.stringify(childFeature).includes(filterText);
	}).map(([featureId, childFeature]) => {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Feature, {
			isHovered: hoveredFeature?.feature._id === childFeature._id,
			isSelected: selectedFeature?._id === childFeature._id,
			selectedFeatureClass,
			depth: (depth || 0) + 1,
			feature: childFeature,
			model: displayState,
			setContextMenu
		}, featureId);
	}) : null] });
});
async function fetchValidTypeTerms(feature, ontologyStore, _signal) {
	const { parent: parentFeature } = feature;
	if (parentFeature) {
		const parentTypeClassTerms = (await ontologyStore.getTermsWithLabelOrSynonym(parentFeature.type, { includeSubclasses: false })).filter(isOntologyClass);
		if (parentTypeClassTerms.length > 0) return await ontologyStore.getClassesThat("part_of", parentTypeClassTerms);
	}
}
//#endregion
//#region src/TabularEditor/HybridGrid/HybridGrid.tsx
const useStyles$3 = (0, tss_react_mui.makeStyles)()((theme) => ({
	scrollableTable: {
		width: "100%",
		height: "100%",
		th: {
			position: "sticky",
			top: 0,
			zIndex: 2,
			textAlign: "left",
			background: theme.palette.background.paper,
			paddingTop: "3.2em"
		},
		td: { whiteSpace: "normal" }
	},
	selectedFeature: { backgroundColor: theme.palette.action.selected }
}));
const HybridGrid = (0, mobx_react.observer)(function HybridGrid({ model }) {
	const { hoveredFeature, seenFeatures, selectedFeature, tabularEditor } = model;
	const theme = (0, _mui_material.useTheme)();
	const { classes } = useStyles$3();
	const scrollContainerRef = (0, react.useRef)(null);
	const [contextMenu, setContextMenu] = (0, react.useState)(null);
	const { filterText } = tabularEditor;
	(0, react.useEffect)(() => {
		const scrollContainer = scrollContainerRef.current;
		if (scrollContainer && selectedFeature) {
			const selectedRow = scrollContainer.querySelector(`.${classes.selectedFeature}`);
			if (selectedRow) {
				const currScroll = scrollContainer.scrollTop;
				const newScrollTop = selectedRow.offsetTop - 25;
				if (!(newScrollTop > currScroll && newScrollTop < currScroll + scrollContainer.offsetHeight)) scrollContainer.scroll({
					top: newScrollTop - 40,
					behavior: "smooth"
				});
			}
		}
	}, [
		selectedFeature,
		seenFeatures,
		classes.selectedFeature
	]);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		ref: scrollContainerRef,
		style: {
			width: "100%",
			overflowY: "auto",
			height: "100%"
		},
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
			className: classes.scrollableTable,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "Type" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "Start" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "End" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "Strand" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "Attributes" })
			] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: [...seenFeatures.entries()].filter((entry) => {
				if (!filterText) return true;
				const [, feature] = entry;
				return JSON.stringify(feature).includes(filterText);
			}).sort((a, b) => {
				return a[1].min - b[1].min;
			}).map(([featureId, feature]) => {
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Feature, {
					isSelected: selectedFeature?._id === featureId,
					isHovered: hoveredFeature?.feature._id === featureId,
					selectedFeatureClass: classes.selectedFeature,
					feature,
					model,
					depth: 0,
					setContextMenu
				}, featureId);
			}) })]
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_jbrowse_core_ui.Menu, {
			open: Boolean(contextMenu),
			onMenuItemClick: (_, callback) => {
				callback();
				setContextMenu(null);
			},
			onClose: () => {
				setContextMenu(null);
			},
			slotProps: { transition: { onExit: () => {
				setContextMenu(null);
			} } },
			style: { zIndex: theme.zIndex.tooltip },
			menuItems: contextMenu?.items ?? [],
			anchorReference: "anchorPosition",
			anchorPosition: contextMenu?.position
		})]
	});
});
//#endregion
//#region src/TabularEditor/HybridGrid/ToolBar.tsx
const useStyles$2 = (0, tss_react_mui.makeStyles)()({
	toolbar: {
		width: "100%",
		display: "flex",
		paddingRight: "2em",
		flexDirection: "row",
		justifyContent: "space-between",
		position: "absolute",
		zIndex: 4
	},
	filterText: {}
});
const ToolBar = (0, mobx_react.observer)(function ToolBar({ model: displayState }) {
	const model = displayState.tabularEditor;
	const { classes } = useStyles$2();
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: classes.toolbar,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Tooltip, {
			title: "Collapse all",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.IconButton, {
				"aria-label": "collapse",
				sx: { marginTop: 0 },
				onClick: model.collapseAllFeatures,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_UnfoldLess.default, {})
			})
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
			className: classes.filterText,
			label: "Filter features",
			value: model.filterText,
			sx: { marginTop: 0 },
			variant: "outlined",
			onChange: (event) => {
				model.setFilterText(event.target.value);
			},
			slotProps: { input: { endAdornment: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.InputAdornment, {
				position: "end",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.IconButton, {
					onClick: () => {
						model.clearFilterText();
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Clear.default, {})
				})
			}) } }
		})]
	});
});
//#endregion
//#region src/TabularEditor/TabularEditorPane.tsx
function stopPropagation(e) {
	e.stopPropagation();
}
const TabularEditorPane = (0, mobx_react.observer)(function TabularEditorPane({ model: displayState }) {
	if (!displayState.tabularEditor.isShown) return null;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		onMouseDown: stopPropagation,
		onClick: stopPropagation,
		style: {
			width: "100%",
			height: "100%",
			position: "relative"
		},
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ToolBar, { model: displayState }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HybridGrid, { model: displayState })]
	});
});
//#endregion
//#region src/TabularEditor/model.ts
const TabularEditorStateModelType = _jbrowse_mobx_state_tree.types.model("TabularEditor", {
	isShown: true,
	featureCollapsed: _jbrowse_mobx_state_tree.types.map(_jbrowse_mobx_state_tree.types.boolean),
	filterText: ""
}).actions((self) => ({
	setFeatureCollapsed(id, state) {
		self.featureCollapsed.set(id, state);
	},
	setFilterText(text) {
		self.filterText = text;
	},
	clearFilterText() {
		self.filterText = "";
	},
	collapseAllFeatures() {
		const display = (0, _jbrowse_mobx_state_tree.getParent)(self);
		for (const [featureId] of display.seenFeatures.entries()) self.featureCollapsed.set(featureId, true);
	},
	togglePane() {
		self.isShown = !self.isShown;
	},
	hidePane() {
		self.isShown = false;
	},
	showPane() {
		self.isShown = true;
	}
}));
//#endregion
//#region src/LinearApolloDisplay/glyphs/util.ts
function getLeftPx$1(display, feature, block) {
	const { lgv } = display;
	const { bpPerPx, offsetPx } = lgv;
	return block.offsetPx - offsetPx + (block.reversed ? block.end - feature.max : feature.min - block.start) / bpPerPx;
}
function getFeatureBox(display, feature, row, block) {
	const { apolloRowHeight, lgv } = display;
	const { bpPerPx } = lgv;
	const left = Math.round(getLeftPx$1(display, feature, block));
	return [
		row * apolloRowHeight,
		left,
		Math.round((feature.max - feature.min) / bpPerPx),
		apolloRowHeight
	];
}
function getOverlayColor(display, feature, overlayType) {
	const { theme } = display;
	switch (overlayType) {
		case "select": return theme.palette.action.disabled;
		case "hover": return theme.palette.action.focus;
		case "highlight": {
			const { attributes } = feature;
			return attributes.get("apollo_color")?.[0];
		}
	}
}
function drawOverlayBox(display, ctx, left, top, width, height, feature, overlayType) {
	const color = getOverlayColor(display, feature, overlayType);
	if (!color) return;
	ctx.fillStyle = (0, _mui_material.alpha)(color, .3);
	ctx.fillRect(left, top, width, height);
}
/**
* Perform a canvas strokeRect, but have the stroke be contained within the
* given rect instead of centered on it.
*/
function strokeRectInner(ctx, left, top, width, height, color) {
	ctx.strokeStyle = color;
	ctx.lineWidth = 1;
	ctx.strokeRect(left + .5, top + .5, width - 1, height - 1);
}
/** @returns undefined if mouse not on the edge of this feature, otherwise 'start' or 'end' depending on which edge */
function isMouseOnFeatureEdge(mousePosition, feature, stateModel) {
	const { refName, regionNumber, x } = mousePosition;
	const { lgv } = stateModel;
	const { offsetPx } = lgv;
	const minPxInfo = lgv.bpToPx({
		refName,
		coord: feature.min,
		regionNumber
	});
	const maxPxInfo = lgv.bpToPx({
		refName,
		coord: feature.max,
		regionNumber
	});
	if (minPxInfo !== void 0 && maxPxInfo !== void 0) {
		const minPx = minPxInfo.offsetPx - offsetPx;
		const maxPx = maxPxInfo.offsetPx - offsetPx;
		if (Math.abs(maxPx - minPx) < 8) return;
		if (Math.abs(minPx - x) < 4) return "min";
		if (Math.abs(maxPx - x) < 4) return "max";
	}
}
//#endregion
//#region src/LinearApolloDisplay/glyphs/BoxGlyph.ts
function draw$6(display, ctx, feature, row, rowInFeature, block) {
	const { selectedFeature, theme } = display;
	const [top, left, width, height] = getFeatureBox(display, feature, row, block);
	if (width > 2) {
		ctx.fillStyle = theme.palette.background.default;
		ctx.fillRect(left, top, width, height);
	}
	strokeRectInner(ctx, left, top, width, height, theme.palette.text.primary);
	if (isSelectedFeature(feature, selectedFeature)) drawOverlay$6(display, ctx, feature, row, block, "select");
}
function drawOverlay$6(display, overlayCtx, feature, row, block, overlayType) {
	const [top, left, width, height] = getFeatureBox(display, feature, row, block);
	drawOverlayBox(display, overlayCtx, left, top, width, height, feature, overlayType);
}
function drawDragPreview$6(display, overlayCtx, feature, row, block) {
	const { apolloDragging, theme } = display;
	if (!apolloDragging) return;
	const { current, start } = apolloDragging;
	const [top, left, width, height] = getFeatureBox(display, {
		min: Math.min(current.bp, start.bp),
		max: Math.max(current.bp, start.bp)
	}, row, block);
	overlayCtx.fillStyle = (0, _mui_material.alpha)(theme.palette.info.main, .2);
	overlayCtx.fillRect(left, top, width, height);
	overlayCtx.setLineDash([6]);
	strokeRectInner(overlayCtx, left, top, width, height, theme.palette.info.main);
}
function getLayout$5(display, feature) {
	return {
		byFeature: /* @__PURE__ */ new Map([[feature._id, 0]]),
		byRow: [[{
			feature,
			rowInFeature: 0
		}]],
		min: feature.min,
		max: feature.max
	};
}
function getContextMenuItems$6(display) {
	const { hoveredFeature } = display;
	if (!hoveredFeature) return [];
	return getContextMenuItemsForFeature(display, hoveredFeature.feature);
}
const boxGlyph = {
	draw: draw$6,
	drawDragPreview: drawDragPreview$6,
	drawOverlay: drawOverlay$6,
	getContextMenuItems: getContextMenuItems$6,
	getLayout: getLayout$5,
	isDraggable: true
};
//#endregion
//#region src/LinearApolloDisplay/glyphs/CDSGlyph.ts
function drawCDSLocation(display, ctx, cdsLocation, strand, row, block) {
	const { apolloRowHeight, canvasPatterns, theme } = display;
	const [top, left, width] = getFeatureBox(display, cdsLocation, row, block);
	const halfHeight = Math.round(apolloRowHeight / 2);
	if (width > 2) {
		const frame = (0, _jbrowse_core_util.getFrame)(cdsLocation.min, cdsLocation.max, strand ?? 1, cdsLocation.phase);
		ctx.fillStyle = theme.palette.framesCDS.at(frame)?.main ?? "black";
		ctx.fillRect(left, top, width, apolloRowHeight);
		const forwardFill = canvasPatterns.forward;
		const backwardFill = canvasPatterns.backward;
		if (forwardFill && backwardFill && strand) {
			const { reversed } = block;
			const [topFill, bottomFill] = strand * (reversed ? -1 : 1) === 1 ? [forwardFill, backwardFill] : [backwardFill, forwardFill];
			ctx.fillStyle = topFill;
			ctx.fillRect(left, top, width, halfHeight);
			ctx.fillStyle = bottomFill;
			ctx.fillRect(left, top + halfHeight, width, halfHeight);
		}
	}
	strokeRectInner(ctx, left, top, width, apolloRowHeight, theme.palette.text.primary);
}
function draw$5(display, ctx, cds, row, rowInFeature, block) {
	const transcript = cds.parent;
	if (!transcript) {
		boxGlyph.draw(display, ctx, cds, row, 0, block);
		return;
	}
	const { cdsLocations } = transcript;
	const thisCDSLocations = cdsLocations.find((loc) => {
		const min = loc.at(cds.strand === 1 ? 0 : -1)?.min;
		const max = loc.at(cds.strand === 1 ? -1 : 0)?.max;
		return cds.min === min && cds.max === max;
	});
	if (!thisCDSLocations) return;
	for (const cdsLocation of thisCDSLocations) drawCDSLocation(display, ctx, cdsLocation, cds.strand, row, block);
	const { selectedFeature } = display;
	if (isSelectedFeature(cds, selectedFeature)) drawOverlay$5(display, ctx, cds, row, block, "select");
}
function drawOverlay$5(display, overlayCtx, cds, row, block, overlayType) {
	const { apolloRowHeight } = display;
	const [top, left, width] = getFeatureBox(display, cds, row, block);
	drawOverlayBox(display, overlayCtx, left, top, width, getRowCount$3() * apolloRowHeight, cds, overlayType);
}
function getLayout$4(display, feature) {
	return {
		byFeature: /* @__PURE__ */ new Map([[feature._id, 0]]),
		byRow: [[{
			feature,
			rowInFeature: 0
		}]],
		min: feature.min,
		max: feature.max
	};
}
function getRowCount$3() {
	return 1;
}
function getContextMenuItems$5() {
	return [];
}
const { drawDragPreview: drawDragPreview$5 } = boxGlyph;
const cdsGlyph = {
	draw: draw$5,
	drawDragPreview: drawDragPreview$5,
	drawOverlay: drawOverlay$5,
	getContextMenuItems: getContextMenuItems$5,
	getLayout: getLayout$4,
	isDraggable: true
};
//#endregion
//#region src/LinearApolloDisplay/glyphs/ExonGlyph.ts
function draw$4(display, ctx, exon, row, rowInFeature, block) {
	const { apolloRowHeight, canvasPatterns, selectedFeature, theme } = display;
	const [, left, width] = getFeatureBox(display, exon, row, block);
	const height = Math.round(.6 * apolloRowHeight);
	const halfHeight = Math.round(height / 2);
	const top = Math.round(halfHeight / 2) + row * apolloRowHeight;
	if (width > 2) {
		ctx.fillStyle = "rgb(211,211,211)";
		ctx.fillRect(left, top, width, height);
		const forwardFill = canvasPatterns.forward;
		const backwardFill = canvasPatterns.backward;
		const { strand } = exon;
		if (forwardFill && backwardFill && strand) {
			const { reversed } = block;
			const [topFill, bottomFill] = strand * (reversed ? -1 : 1) === 1 ? [forwardFill, backwardFill] : [backwardFill, forwardFill];
			ctx.fillStyle = topFill;
			ctx.fillRect(left, top, width, halfHeight);
			ctx.fillStyle = bottomFill;
			ctx.fillRect(left, top + halfHeight, width, halfHeight);
		}
	}
	strokeRectInner(ctx, left, top, width, height, theme.palette.text.primary);
	if (isSelectedFeature(exon, selectedFeature)) drawOverlay$4(display, ctx, exon, row, block, "select");
}
function drawOverlay$4(display, overlayCtx, exon, row, block, overlayType) {
	const { apolloRowHeight } = display;
	const [, left, width] = getFeatureBox(display, exon, row, block);
	const height = Math.round(.6 * apolloRowHeight);
	const halfHeight = Math.round(height / 2);
	drawOverlayBox(display, overlayCtx, left, Math.round(halfHeight / 2) + row * apolloRowHeight, width, height, exon, overlayType);
}
function getLayout$3(display, feature) {
	return {
		byFeature: /* @__PURE__ */ new Map([[feature._id, 0]]),
		byRow: [[{
			feature,
			rowInFeature: 0
		}]],
		min: feature.min,
		max: feature.max
	};
}
function getContextMenuItems$4(display, feature) {
	const { apolloInternetAccount: internetAccount, changeManager, regions, selectedFeature, session } = display;
	const [region] = regions;
	const currentAssemblyId = display.getAssemblyId(region.assemblyName);
	const admin = (internetAccount ? internetAccount.role : "admin") === "admin";
	const menuItems = [];
	const adjacentExons = getAdjacentExons(feature, display);
	const lgv = (0, _jbrowse_core_util.getContainingView)(display);
	if (adjacentExons.upstream) {
		const exon = adjacentExons.upstream;
		menuItems.push({
			label: "Go to upstream exon",
			icon: getStreamIcon(feature.strand, true, lgv.displayedRegions.at(0)?.reversed),
			onClick: () => {
				lgv.navTo(navToFeatureCenter(exon, .1, lgv.totalBp));
				selectFeatureAndOpenWidget(display, exon);
			}
		});
	}
	if (adjacentExons.downstream) {
		const exon = adjacentExons.downstream;
		menuItems.push({
			label: "Go to downstream exon",
			icon: getStreamIcon(feature.strand, false, lgv.displayedRegions.at(0)?.reversed),
			onClick: () => {
				lgv.navTo(navToFeatureCenter(exon, .1, lgv.totalBp));
				selectFeatureAndOpenWidget(display, exon);
			}
		});
	}
	menuItems.push({
		label: "Merge exons",
		disabled: !admin,
		onClick: () => {
			session.queueDialog((doneCallback) => [MergeExons, {
				session,
				handleClose: () => {
					doneCallback();
				},
				changeManager,
				sourceFeature: feature,
				sourceAssemblyId: currentAssemblyId,
				selectedFeature,
				setSelectedFeature: (feature) => {
					display.setSelectedFeature(feature);
				}
			}]);
		}
	}, {
		label: "Split exon",
		disabled: !admin,
		onClick: () => {
			session.queueDialog((doneCallback) => [SplitExon, {
				session,
				handleClose: () => {
					doneCallback();
				},
				changeManager,
				sourceFeature: feature,
				sourceAssemblyId: currentAssemblyId,
				selectedFeature,
				setSelectedFeature: (feature) => {
					display.setSelectedFeature(feature);
				}
			}]);
		}
	});
	return menuItems;
}
const { drawDragPreview: drawDragPreview$4 } = boxGlyph;
const exonGlyph = {
	draw: draw$4,
	drawDragPreview: drawDragPreview$4,
	drawOverlay: drawOverlay$4,
	getContextMenuItems: getContextMenuItems$4,
	getLayout: getLayout$3,
	isDraggable: true
};
//#endregion
//#region src/LinearApolloDisplay/glyphs/GeneGlyph.ts
function getRowCount$2(display, feature) {
	return getLayout$2(display, feature).byRow.length;
}
function draw$3(display, ctx, gene, row, rowInFeature, block) {
	if (rowInFeature > 0) return;
	const { apolloRowHeight, theme, selectedFeature, session } = display;
	const [top, left, width] = getFeatureBox(display, gene, row, block);
	const height = getRowCount$2(display, gene) * apolloRowHeight;
	if (width > 2) {
		ctx.fillStyle = (0, _jbrowse_core_configuration.readConfObject)(session.getPluginConfiguration(), "geneBackgroundColor", { featureType: gene.type }) ?? (0, _mui_material.alpha)(theme.palette.background.paper, .6);
		ctx.fillRect(left, top, width, height);
	}
	strokeRectInner(ctx, left, top, width, height, theme.palette.text.primary);
	if (isSelectedFeature(gene, selectedFeature)) drawOverlay$3(display, ctx, gene, row, block, "select", rowInFeature);
}
function drawOverlay$3(display, ctx, gene, row, block, overlayType, rowInFeature) {
	if (rowInFeature > 0) return;
	const { apolloRowHeight } = display;
	const [top, left, width] = getFeatureBox(display, gene, row, block);
	drawOverlayBox(display, ctx, left, top, width, getRowCount$2(display, gene) * apolloRowHeight, gene, overlayType);
}
function getLayout$2(display, feature) {
	const layout = {
		byFeature: /* @__PURE__ */ new Map([[feature._id, 0]]),
		byRow: [[{
			feature,
			rowInFeature: 0
		}]],
		min: feature.min,
		max: feature.max
	};
	const { children } = feature;
	if (!children) return layout;
	layout.byRow = [];
	const { getGlyph } = display;
	for (const [, child] of children) {
		const childLayout = getGlyph(child).getLayout(display, child);
		const startingRowIndex = layout.byRow.length;
		for (const [idx, row] of childLayout.byRow.entries()) layout.byRow.push([{
			feature,
			rowInFeature: startingRowIndex + idx
		}, ...row]);
		for (const entry of childLayout.byFeature.entries()) {
			const [featureId, rowNumber] = entry;
			layout.byFeature.set(featureId, rowNumber + startingRowIndex);
		}
	}
	return layout;
}
function getContextMenuItems$3() {
	return [];
}
const { drawDragPreview: drawDragPreview$3 } = boxGlyph;
const geneGlyph$1 = {
	draw: draw$3,
	drawDragPreview: drawDragPreview$3,
	drawOverlay: drawOverlay$3,
	getContextMenuItems: getContextMenuItems$3,
	getLayout: getLayout$2,
	isDraggable: false
};
//#endregion
//#region src/LinearApolloDisplay/glyphs/GenericChildGlyph.ts
function getRowCount$1(display, feature) {
	return getLayout$1(display, feature).byRow.length;
}
function draw$2(display, ctx, feature, row, rowInFeature, block) {
	if (rowInFeature > 0) return;
	const { apolloRowHeight, selectedFeature, theme } = display;
	const [top, left, width] = getFeatureBox(display, feature, row, block);
	const height = getRowCount$1(display, feature) * apolloRowHeight;
	if (width > 2) {
		ctx.fillStyle = (0, _mui_material.alpha)(theme.palette.background.paper, .6);
		ctx.fillRect(left, top, width, height);
	}
	strokeRectInner(ctx, left, top, width, height, theme.palette.text.primary);
	boxGlyph.draw(display, ctx, feature, row, 0, block);
	if (isSelectedFeature(feature, selectedFeature)) drawOverlay$2(display, ctx, feature, row, block, "select");
}
function drawOverlay$2(display, overlayCtx, feature, row, block, overlayType) {
	const { apolloRowHeight } = display;
	const [top, left, width] = getFeatureBox(display, feature, row, block);
	drawOverlayBox(display, overlayCtx, left, top, width, getRowCount$1(display, feature) * apolloRowHeight, feature, overlayType);
}
function getLayout$1(display, feature) {
	const layout = {
		byFeature: /* @__PURE__ */ new Map([[feature._id, 0]]),
		byRow: [[{
			feature,
			rowInFeature: 0
		}]],
		min: feature.min,
		max: feature.max
	};
	const { children } = feature;
	if (!children) return layout;
	const { getGlyph } = display;
	for (const [, child] of children) {
		const childLayout = getGlyph(child).getLayout(display, child);
		const startingRowIndex = layout.byRow.length;
		for (const [idx, row] of childLayout.byRow.entries()) layout.byRow.push([{
			feature,
			rowInFeature: startingRowIndex + idx
		}, ...row]);
		for (const entry of childLayout.byFeature.entries()) {
			const [featureId, rowNumber] = entry;
			layout.byFeature.set(featureId, rowNumber + startingRowIndex);
		}
	}
	return layout;
}
function getContextMenuItems$2() {
	return [];
}
const { drawDragPreview: drawDragPreview$2 } = boxGlyph;
const genericChildGlyph = {
	draw: draw$2,
	drawDragPreview: drawDragPreview$2,
	drawOverlay: drawOverlay$2,
	getContextMenuItems: getContextMenuItems$2,
	getLayout: getLayout$1,
	isDraggable: true
};
//#endregion
//#region src/LinearApolloDisplay/glyphs/TranscriptGlyph.ts
function* range(start, stop, step = 1) {
	if (start === stop) return;
	if (start < stop) {
		for (let i = start; i < stop; i += step) yield i;
		return;
	}
	for (let i = start; i > stop; i -= step) yield i;
}
function drawTranscriptLine(display, ctx, transcript, row, block) {
	const { apolloRowHeight, lgv, theme } = display;
	const { bpPerPx } = lgv;
	const { reversed } = block;
	const left = Math.round(getLeftPx$1(display, transcript, block));
	const width = Math.round(transcript.length / bpPerPx);
	const top = Math.round(apolloRowHeight / 2) + row * apolloRowHeight;
	ctx.strokeStyle = theme.palette.text.primary;
	const { strand = 1 } = transcript;
	ctx.beginPath();
	const effectiveStrand = strand * (reversed ? -1 : 1);
	let lineStart = left - (effectiveStrand === -1 ? 5 : 0);
	let lineEnd = left + width + (effectiveStrand === -1 ? 0 : 5);
	lineStart = Math.max(lineStart, 0);
	lineEnd = Math.min(lineEnd, globalThis.innerWidth);
	ctx.moveTo(lineStart, top);
	ctx.lineTo(lineEnd, top);
	const arrowsStart = lineStart + (effectiveStrand === -1 ? 0 : 3);
	const arrowsEnd = lineEnd - (effectiveStrand === -1 ? 3 : 0);
	const offset = effectiveStrand === -1 ? 3 : -3;
	const arrowRange = effectiveStrand === -1 ? range(arrowsStart, arrowsEnd, 20) : range(arrowsEnd, arrowsStart, 20);
	for (const arrowLocation of arrowRange) {
		ctx.moveTo(arrowLocation + offset, top + offset);
		ctx.lineTo(arrowLocation, top);
		ctx.lineTo(arrowLocation + offset, top - offset);
	}
	ctx.stroke();
}
function getExonChildren(display, transcript) {
	const { children } = transcript;
	if (!children) return [];
	const { session } = display;
	return [...children.values()].filter((child) => isExonFeature(child, session));
}
function getNonExonChildren(display, transcript) {
	const { children } = transcript;
	if (!children) return [];
	const { session } = display;
	return [...children.values()].filter((child) => !isExonFeature(child, session));
}
function getRowCount(display, feature) {
	return getLayout(display, feature).byRow.length;
}
function draw$1(display, ctx, transcript, row, rowInFeature, block) {
	drawTranscriptLine(display, ctx, transcript, row, block);
	const { selectedFeature } = display;
	if (isSelectedFeature(transcript, selectedFeature)) drawOverlay$1(display, ctx, transcript, row, block, "select");
}
function drawOverlay$1(display, overlayCtx, transcript, row, block, overlayType) {
	const { apolloRowHeight } = display;
	const [top, left, width] = getFeatureBox(display, transcript, row, block);
	drawOverlayBox(display, overlayCtx, left, top, width, apolloRowHeight * getRowCount(display, transcript), transcript, overlayType);
}
function getLayout(display, feature) {
	const layout = {
		byFeature: /* @__PURE__ */ new Map([[feature._id, 0]]),
		byRow: [[{
			feature,
			rowInFeature: 0
		}]],
		min: feature.min,
		max: feature.max
	};
	const { children } = feature;
	if (!children) return layout;
	layout.byRow = [];
	const exons = getExonChildren(display, feature);
	const nonExonChildren = getNonExonChildren(display, feature);
	layout.byFeature.set(feature._id, 0);
	if (nonExonChildren.length === 0) {
		const row = [];
		row.push({
			feature,
			rowInFeature: 0
		});
		for (const exon of exons) {
			row.push({
				feature: exon,
				rowInFeature: 0
			});
			layout.byFeature.set(exon._id, 0);
		}
		layout.byRow.push(row);
		return layout;
	}
	const { getGlyph, session } = display;
	let extraOffset = 0;
	for (const [idx, child] of nonExonChildren.entries()) {
		const row = [];
		row.push({
			feature,
			rowInFeature: idx + extraOffset
		});
		if (isCDSFeature(child, session)) {
			for (const exon of exons) {
				row.push({
					feature: exon,
					rowInFeature: extraOffset
				});
				layout.byFeature.set(exon._id, extraOffset);
			}
			row.push({
				feature: child,
				rowInFeature: extraOffset
			});
			layout.byFeature.set(child._id, extraOffset);
		} else {
			const rowCount = getGlyph(child).getLayout(display, child).byRow.length;
			for (let i = 0; i < rowCount; i++) {
				row.push({
					feature: child,
					rowInFeature: i
				});
				layout.byFeature.set(child._id, i);
			}
			extraOffset += rowCount - 1;
		}
		layout.byRow.push(row);
	}
	return layout;
}
function getContextMenuItems$1(display, transcript) {
	const { changeManager, regions, selectedFeature, session } = display;
	const [region] = regions;
	const currentAssemblyId = display.getAssemblyId(region.assemblyName);
	const menuItems = [];
	if ((0, _jbrowse_core_util.isSessionModelWithWidgets)(session)) menuItems.splice(1, 0, {
		label: "Open transcript editor",
		onClick: () => {
			const apolloTranscriptWidget = session.addWidget("ApolloTranscriptDetails", "apolloTranscriptDetails", {
				feature: transcript,
				assembly: currentAssemblyId,
				changeManager,
				refName: region.refName
			});
			session.showWidget(apolloTranscriptWidget);
		}
	});
	menuItems.push({
		label: "Merge transcript",
		onClick: () => {
			session.queueDialog((doneCallback) => [MergeTranscripts, {
				session,
				handleClose: () => {
					doneCallback();
				},
				changeManager,
				sourceFeature: transcript,
				sourceAssemblyId: currentAssemblyId,
				selectedFeature,
				setSelectedFeature: (feature) => {
					display.setSelectedFeature(feature);
				}
			}]);
		}
	}, {
		label: "Duplicate feature",
		onClick: () => {
			session.queueDialog((doneCallback) => [DuplicateTranscript, {
				session,
				handleClose: () => {
					doneCallback();
				},
				changeManager,
				sourceFeature: transcript,
				sourceAssemblyId: currentAssemblyId,
				selectedFeature,
				setSelectedFeature: (feature) => {
					display.setSelectedFeature(feature);
				}
			}]);
		}
	});
	const { children } = transcript;
	if (!children) return [];
	if ([...children.values()].filter((child) => isCDSFeature(child, session)).length === 0) menuItems.push({
		label: "Add coding sequence",
		onClick: () => {
			session.queueDialog((doneCallback) => [AddCodingSequence, {
				session,
				handleClose: () => {
					doneCallback();
				},
				changeManager,
				sourceFeature: transcript,
				sourceAssemblyId: currentAssemblyId,
				refName: region.refName
			}]);
		}
	});
	return menuItems;
}
const { drawDragPreview: drawDragPreview$1 } = boxGlyph;
const transcriptGlyph = {
	draw: draw$1,
	drawDragPreview: drawDragPreview$1,
	drawOverlay: drawOverlay$1,
	getContextMenuItems: getContextMenuItems$1,
	getLayout,
	isDraggable: false
};
//#endregion
//#region src/components/FilterFeatures.tsx
const FilterFeatures = (0, mobx_react.observer)(function FilterFeatures({ featureTypes, handleClose, onUpdate, session }) {
	const [type, setType] = (0, react.useState)("");
	const [selectedFeatureTypes, setSelectedFeatureTypes] = (0, react.useState)(featureTypes);
	const handleChange = (value) => {
		setType(value);
	};
	const handleAddFeatureType = () => {
		if (type) {
			if (selectedFeatureTypes.includes(type)) return;
			onUpdate([...selectedFeatureTypes, type]);
			setSelectedFeatureTypes([...selectedFeatureTypes, type]);
		}
	};
	const handleFeatureTypeDelete = (value) => {
		const newTypes = selectedFeatureTypes.filter((type) => type !== value);
		onUpdate(newTypes);
		setSelectedFeatureTypes(newTypes);
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Dialog$1, {
		open: true,
		maxWidth: false,
		"data-testid": "filter-features-dialog",
		title: "Filter features by type",
		handleClose,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, { children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Select the feature types you want to display in the apollo track" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Grid, {
				container: true,
				spacing: 2,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, {
					size: 8,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(OntologyTermAutocomplete, {
						session,
						ontologyName: "Sequence Ontology",
						style: { width: "100%" },
						value: type,
						filterTerms: isOntologyClass,
						renderInput: (params) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
							...params,
							label: "Feature type",
							variant: "outlined",
							fullWidth: true
						}),
						onChange: (oldValue, newValue) => {
							if (newValue) handleChange(newValue);
						}
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, {
					size: 4,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
						variant: "contained",
						onClick: handleAddFeatureType,
						disabled: !type,
						style: { marginTop: 9 },
						size: "medium",
						children: "Add"
					})
				})]
			}),
			selectedFeatureTypes.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("hr", {}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: { width: 300 },
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Selected feature types:" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Box, {
					sx: {
						display: "flex",
						flexWrap: "wrap",
						gap: .5
					},
					children: selectedFeatureTypes.map((value) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Chip, {
						label: value,
						onDelete: () => {
							handleFeatureTypeDelete(value);
						}
					}, value))
				})]
			})] })
		] })
	});
});
//#endregion
//#region src/components/EditZoomThresholdDialog.tsx
const EditZoomThresholdDialog = (0, mobx_react.observer)(function({ model, handleClose }) {
	const [zoomThreshold, setZoomThreshold] = (0, react.useState)(`${model.zoomThresholdSetting}`);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_jbrowse_core_ui.Dialog, {
		open: true,
		onClose: handleClose,
		title: "Edit zoom threshold setting",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, { children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, { children: "The zoom level in base pairs (bp) per pixel at which features are rendered in this Annotations track. Increasing the value will allow features to render when zooming out, but might impact performance." }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.TextField, {
				label: "Threshold value (bpPerPx)",
				value: zoomThreshold,
				onChange: (event) => {
					setZoomThreshold(event.target.value);
				}
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "contained",
				onClick: () => {
					model.setZoomThresholdSetting({ zoomThreshold: +zoomThreshold });
					handleClose();
				},
				children: "Submit"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "contained",
				color: "secondary",
				onClick: () => {
					handleClose();
				},
				children: "Cancel"
			})] })
		] })
	});
});
//#endregion
//#region src/util/displayUtils.ts
const useStyles$1 = (0, tss_react_mui.makeStyles)()((theme) => ({
	canvasContainer: {
		position: "relative",
		left: 0
	},
	canvas: {
		position: "absolute",
		left: 0
	},
	center: {
		display: "flex",
		justifyContent: "center"
	},
	ellipses: {
		textOverflow: "ellipsis",
		overflow: "hidden"
	},
	avatar: {
		position: "static",
		height: "100%",
		width: "100%",
		overflow: "visible",
		color: theme.palette.warning.light,
		backgroundColor: theme.palette.warning.contrastText
	},
	box: {
		position: "absolute",
		overflow: "visible"
	},
	badge: { display: "inline-block" },
	loading: {
		position: "absolute",
		right: theme.spacing(3),
		zIndex: 10,
		pointerEvents: "none",
		textAlign: "right"
	},
	locked: {
		position: "absolute",
		right: theme.spacing(3),
		top: theme.spacing(6),
		zIndex: 1,
		pointerEvents: "none",
		textAlign: "right"
	}
}));
function clusterResultByMessage(items, width, touchesAsOverlap) {
	const byMsg = /* @__PURE__ */ new Map();
	for (const it of items) (byMsg.get(it.message) ?? byMsg.set(it.message, []).get(it.message)).push(it);
	const clusters = [];
	const overlaps = (aEnd, bStart) => touchesAsOverlap ? bStart <= aEnd : bStart < aEnd;
	for (const [message, arr] of byMsg.entries()) {
		if (arr.length === 0) continue;
		arr.sort((a, b) => a.start - b.start);
		let group = [arr[0]];
		let curMin = arr[0].start;
		let curMax = arr[0].start + width;
		const pushResult = () => {
			const starts = group.map((d) => d.start).sort((a, b) => a - b);
			const mid = Math.floor(starts.length / 2);
			const median = starts.length % 2 ? starts[mid] : (starts[mid - 1] + starts[mid]) / 2;
			const clusterId = group[0]._id;
			const featureIds = group[0].ids;
			clusters.push({
				_id: clusterId,
				message,
				start: median,
				count: group.length,
				members: [...group],
				range: {
					min: curMin,
					max: curMax
				},
				featureIds
			});
		};
		for (let i = 1; i < arr.length; i++) {
			const it = arr[i];
			const itStart = it.start;
			const itEnd = itStart + width;
			if (overlaps(curMax, itStart)) {
				group.push(it);
				if (itStart < curMin) curMin = itStart;
				if (itEnd > curMax) curMax = itEnd;
			} else {
				pushResult();
				group = [it];
				curMin = itStart;
				curMax = itEnd;
			}
		}
		pushResult();
	}
	clusters.sort((a, b) => a.message.localeCompare(b.message) || a.start - b.start);
	return clusters;
}
function codonColorCode(letter, theme, highContrast) {
	if (letter === "M") return theme.palette.startCodon;
	if (letter === "*") return highContrast ? theme.palette.text.primary : theme.palette.stopCodon;
}
function colorCode(letter, theme) {
	const letterUpper = letter.toUpperCase();
	if (letterUpper === "A" || letterUpper === "C" || letterUpper === "G" || letterUpper === "T") return theme.palette.bases[letterUpper].main;
	return "lightgray";
}
//#endregion
//#region src/LinearApolloDisplay/stateModel/base.ts
const minDisplayHeight$2 = 20;
function baseModelFactory$2(_pluginManager, configSchema) {
	return _jbrowse_core_pluggableElementTypes.BaseDisplay.named("BaseLinearApolloDisplay").props({
		type: _jbrowse_mobx_state_tree.types.literal("LinearApolloDisplay"),
		configuration: (0, _jbrowse_core_configuration.ConfigurationReference)(configSchema),
		graphical: true,
		table: false,
		showCheckResults: true,
		zoomThreshold: 200,
		heightPreConfig: _jbrowse_mobx_state_tree.types.maybe(_jbrowse_mobx_state_tree.types.refinement("displayHeight", _jbrowse_mobx_state_tree.types.number, (n) => n >= minDisplayHeight$2)),
		filteredFeatureTypes: _jbrowse_mobx_state_tree.types.array(_jbrowse_mobx_state_tree.types.string),
		loadingState: false
	}).views((self) => {
		const { configuration, renderProps: superRenderProps } = self;
		return { renderProps() {
			return {
				...superRenderProps(),
				...(0, _jbrowse_core_util_tracks.getParentRenderProps)(self),
				config: configuration.renderer
			};
		} };
	}).volatile(() => ({ scrollTop: 0 })).views((self) => ({
		get lgv() {
			return (0, _jbrowse_core_util.getContainingView)(self);
		},
		get height() {
			if (self.heightPreConfig) return self.heightPreConfig;
			if (self.graphical && self.table) return 400;
			if (self.graphical) return 100;
			return 200;
		},
		get loading() {
			return self.loadingState;
		},
		get zoomThresholdSetting() {
			return self.zoomThreshold ?? (0, _jbrowse_core_configuration.getConf)(self, "zoomThreshold");
		}
	})).views((self) => ({
		get rendererTypeName() {
			return self.configuration.renderer.type;
		},
		get session() {
			return (0, _jbrowse_core_util.getSession)(self);
		},
		get regions() {
			return self.lgv.dynamicBlocks.contentBlocks.map(({ assemblyName, end, refName, start }) => ({
				assemblyName,
				refName,
				start: Math.round(start),
				end: Math.round(end)
			}));
		},
		regionCannotBeRendered() {
			if (self.lgv && self.lgv.bpPerPx >= self.zoomThreshold) return "Zoom in to see annotations";
		}
	})).views((self) => ({
		get apolloInternetAccount() {
			const [region] = self.regions;
			const { internetAccounts } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
			const { assemblyName } = region;
			const { assemblyManager } = self.session;
			const assembly = assemblyManager.get(assemblyName);
			if (!assembly) throw new Error(`No assembly found with name ${assemblyName}`);
			const { internetAccountConfigId } = (0, _jbrowse_core_configuration.getConf)(assembly, ["sequence", "metadata"]);
			return internetAccounts.find((ia) => (0, _jbrowse_core_configuration.getConf)(ia, "internetAccountId") === internetAccountConfigId);
		},
		get changeManager() {
			return self.session.apolloDataStore.changeManager;
		},
		getAssemblyId(assemblyName) {
			const { assemblyManager } = self.session;
			const assembly = assemblyManager.get(assemblyName);
			if (!assembly) throw new Error(`Could not find assembly named ${assemblyName}`);
			return assembly.name;
		},
		get selectedFeature() {
			return self.session.apolloSelectedFeature;
		},
		get hoveredFeature() {
			return self.session.apolloHoveredFeature;
		}
	})).actions((self) => ({
		setScrollTop(scrollTop) {
			self.scrollTop = scrollTop;
		},
		setHeight(displayHeight) {
			self.heightPreConfig = Math.max(displayHeight, minDisplayHeight$2);
			return self.height;
		},
		resizeHeight(distance) {
			const oldHeight = self.height;
			return this.setHeight(self.height + distance) - oldHeight;
		},
		showGraphicalOnly() {
			self.graphical = true;
			self.table = false;
		},
		showTableOnly() {
			self.graphical = false;
			self.table = true;
		},
		showGraphicalAndTable() {
			self.graphical = true;
			self.table = true;
		},
		toggleShowCheckResults() {
			self.showCheckResults = !self.showCheckResults;
		},
		updateFilteredFeatureTypes(types) {
			self.filteredFeatureTypes = (0, _jbrowse_mobx_state_tree.cast)(types);
		},
		setLoading(loading) {
			self.loadingState = loading;
		},
		setZoomThresholdSetting({ zoomThreshold }) {
			self.zoomThreshold = zoomThreshold;
		}
	})).views((self) => {
		const { filteredFeatureTypes, trackMenuItems: superTrackMenuItems } = self;
		return { trackMenuItems() {
			const { graphical, table, showCheckResults, session } = self;
			const [region] = self.regions;
			const { assemblyName } = region;
			const backendDriver = session.apolloDataStore.getBackendDriver(assemblyName);
			const items = [
				...superTrackMenuItems(),
				{
					type: "subMenu",
					label: "Appearance",
					subMenu: [
						{
							label: "Show graphical display",
							type: "radio",
							checked: graphical && !table,
							onClick: () => {
								self.showGraphicalOnly();
							}
						},
						{
							label: "Show table display",
							type: "radio",
							checked: table && !graphical,
							onClick: () => {
								self.showTableOnly();
							}
						},
						{
							label: "Show both graphical and table display",
							type: "radio",
							checked: table && graphical,
							onClick: () => {
								self.showGraphicalAndTable();
							}
						},
						{
							label: "Check Results",
							type: "checkbox",
							checked: showCheckResults,
							onClick: () => {
								self.toggleShowCheckResults();
							}
						},
						{
							label: "Change zoom threshold",
							onClick: () => {
								(0, _jbrowse_core_util.getSession)(self).queueDialog((handleClose) => [EditZoomThresholdDialog, {
									model: self,
									handleClose
								}]);
							}
						}
					]
				},
				{
					label: "Filter features by type",
					onClick: () => {
						const { session } = self;
						self.session.queueDialog((doneCallback) => [FilterFeatures, {
							session,
							handleClose: () => {
								doneCallback();
							},
							featureTypes: (0, _jbrowse_mobx_state_tree.getSnapshot)(filteredFeatureTypes),
							onUpdate: (types) => {
								self.updateFilteredFeatureTypes(types);
							}
						}]);
					}
				}
			];
			if (backendDriver instanceof LocalDriver) items.push({
				label: "Import annotations",
				icon: _mui_icons_material_Input.default,
				onClick: () => {
					session.queueDialog((doneCallback) => [ImportAnnotations, {
						session,
						assemblyName,
						handleClose: () => {
							doneCallback();
						}
					}]);
				}
			});
			items.push({
				label: "Export annotations",
				icon: Export,
				onClick: () => {
					const [region] = self.regions;
					const { assemblyName } = region;
					const assembly = self.getAssemblyId(assemblyName);
					if (!assembly) return;
					const { session } = self;
					session.queueDialog((doneCallback) => [DownloadGFF3, {
						session,
						handleClose: () => {
							doneCallback();
						},
						assembly
					}]);
				}
			}, {
				label: "View Change Log",
				icon: _mui_icons_material_TrackChanges.default,
				onClick: () => {
					const [region] = self.regions;
					const { assemblyName } = region;
					const assembly = self.getAssemblyId(assemblyName);
					if (!assembly) return;
					const { session } = self;
					session.queueDialog((doneCallback) => [ViewChangeLog, {
						session,
						handleClose: () => {
							doneCallback();
						},
						assembly
					}]);
				}
			}, {
				label: "View Check Results",
				icon: _mui_icons_material_FactCheck.default,
				onClick: () => {
					const [region] = self.regions;
					const { assemblyName } = region;
					const assembly = self.getAssemblyId(assemblyName);
					if (!assembly) return;
					const { session } = self;
					session.queueDialog((doneCallback) => [ViewCheckResults, {
						session,
						handleClose: () => {
							doneCallback();
						},
						assembly
					}]);
				}
			});
			return items;
		} };
	}).actions((self) => ({
		setSelectedFeature(feature) {
			self.session.apolloSetSelectedFeature(feature);
		},
		setHoveredFeature(hoveredFeature) {
			self.session.apolloSetHoveredFeature(hoveredFeature);
		},
		showFeatureDetailsWidget(feature, customWidgetNameAndId) {
			const [region] = self.regions;
			const { assemblyName, refName } = region;
			const assembly = self.getAssemblyId(assemblyName);
			if (!assembly) return;
			const { session } = self;
			const { changeManager } = session.apolloDataStore;
			const [widgetName, widgetId] = customWidgetNameAndId ?? ["ApolloFeatureDetailsWidget", "apolloFeatureDetailsWidget"];
			const apolloFeatureWidget = session.addWidget(widgetName, widgetId, {
				feature,
				assembly,
				refName,
				changeManager
			});
			session.showWidget(apolloFeatureWidget);
		},
		afterAttach() {
			(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)(() => {
				if (!self.lgv.initialized || self.regionCannotBeRendered()) return;
				self.setLoading(true);
				self.session.apolloDataStore.loadFeatures(self.regions).catch((error) => {
					console.error(error);
				}).then(() => {
					setTimeout(() => {
						self.setLoading(false);
					}, 1e3);
				});
			}, {
				name: "LinearApolloDisplayLoadFeatures",
				delay: 1e3
			}));
		}
	}));
}
//#endregion
//#region src/LinearApolloDisplay/stateModel/layouts.ts
function layoutsModelFactory$1(pluginManager, configSchema) {
	return baseModelFactory$2(pluginManager, configSchema).named("LinearApolloDisplayLayouts").props({ cleanupBoundary: 2e5 }).volatile(() => ({ seenFeatures: mobx.observable.map() })).views((self) => ({
		getAnnotationFeatureById(id) {
			return self.seenFeatures.get(id);
		},
		getGlyph(feature) {
			if (isGeneFeature(feature, self.session)) return geneGlyph$1;
			if (isTranscriptFeature(feature, self.session)) return transcriptGlyph;
			if (isExonFeature(feature, self.session)) return exonGlyph;
			if (isCDSFeature(feature, self.session)) return cdsGlyph;
			if (feature.children?.size) return genericChildGlyph;
			return boxGlyph;
		}
	})).actions((self) => ({
		addSeenFeature(feature) {
			self.seenFeatures.set(feature._id, feature);
		},
		deleteSeenFeature(featureId) {
			self.seenFeatures.delete(featureId);
		}
	})).views((self) => ({ getCanonicalRefName(assemblyName, refSeq) {
		const { assemblyManager } = self.session;
		const assembly = assemblyManager.get(assemblyName);
		if (!assembly) throw new Error("no assembly in layout");
		const canonicalRefName = assembly.getCanonicalRefName(refSeq);
		if (!canonicalRefName) throw new Error("no canonical refName in layout");
		return canonicalRefName;
	} })).views((self) => ({ 
	/**
	* Is a feature in one of the currently displayed regions and also is not
	* currently filtered out by the display.
	*/
isFeatureDisplayed(feature) {
		const canonicalRefName = self.getCanonicalRefName(feature.assemblyId, feature.refSeq);
		return self.lgv.displayedRegions.some((region) => {
			const { end, refName, start } = region;
			if ((!(self.filteredFeatureTypes.length > 0) || self.filteredFeatureTypes.includes(feature.type)) && canonicalRefName === refName && (0, _jbrowse_core_util.doesIntersect2)(start, end, feature.min, feature.max)) return true;
			return false;
		});
	} })).views((self) => ({
		get layouts() {
			const layoutByAssemblyAndRefName = /* @__PURE__ */ new Map();
			for (const [id, feature] of self.seenFeatures.entries()) {
				if (!(0, _jbrowse_mobx_state_tree.isAlive)(feature)) {
					self.deleteSeenFeature(id);
					continue;
				}
				if (!self.isFeatureDisplayed(feature)) continue;
				const featureLayout = self.getGlyph(feature).getLayout(self, feature);
				const canonicalRefName = self.getCanonicalRefName(feature.assemblyId, feature.refSeq);
				let layoutForAssembly = layoutByAssemblyAndRefName.get(feature.assemblyId);
				if (!layoutForAssembly) {
					layoutForAssembly = /* @__PURE__ */ new Map();
					layoutByAssemblyAndRefName.set(feature.assemblyId, layoutForAssembly);
				}
				const layout = layoutForAssembly.get(canonicalRefName);
				if (!layout) {
					layoutForAssembly.set(canonicalRefName, featureLayout);
					continue;
				}
				let startingRowIndex = 0;
				placeFeature: while (true) {
					let layoutRow = layout.byRow.at(startingRowIndex);
					if (!layoutRow) {
						layout.byRow.push(...featureLayout.byRow);
						for (const entry of featureLayout.byFeature.entries()) {
							const [featureId, rowNumber] = entry;
							layout.byFeature.set(featureId, rowNumber + startingRowIndex);
						}
						layout.min = Math.min(layout.min, featureLayout.min);
						layout.max = Math.max(layout.max, featureLayout.max);
						break placeFeature;
					}
					const highestRow = startingRowIndex + featureLayout.byRow.length - 1;
					let currentRow = startingRowIndex;
					while (layoutRow && startingRowIndex <= highestRow) {
						for (const layoutFeature of layoutRow.values()) if ((0, _jbrowse_core_util.doesIntersect2)(featureLayout.min, featureLayout.max, layoutFeature.feature.min, layoutFeature.feature.max)) {
							startingRowIndex += 1;
							continue placeFeature;
						}
						currentRow += 1;
						layoutRow = layout.byRow.at(currentRow);
					}
					for (let i = 0; i < featureLayout.byRow.length; i++) {
						const layoutRow = layout.byRow.at(startingRowIndex + i);
						if (layoutRow) layoutRow.push(...featureLayout.byRow[i]);
						else layout.byRow.push(featureLayout.byRow[i]);
					}
					for (const entry of featureLayout.byFeature.entries()) {
						const [featureId, rowNumber] = entry;
						layout.byFeature.set(featureId, rowNumber + startingRowIndex);
					}
					layout.min = Math.min(layout.min, featureLayout.min);
					layout.max = Math.max(layout.max, featureLayout.max);
					break placeFeature;
				}
			}
			return layoutByAssemblyAndRefName;
		},
		getRowForFeature(feature) {
			const canonicalRefName = self.getCanonicalRefName(feature.assemblyId, feature.refSeq);
			return this.layouts.get(feature.assemblyId)?.get(canonicalRefName)?.byFeature.get(feature._id);
		},
		getFeaturesAtPosition(assemblyName, refName, row, bp) {
			const assemblyLayouts = this.layouts.get(assemblyName);
			if (!assemblyLayouts) return [];
			const layout = assemblyLayouts.get(refName);
			if (!layout) return [];
			const layoutRow = layout.byRow.at(row);
			if (!layoutRow) return [];
			return layoutRow.filter(({ feature }) => {
				return bp >= feature.min && bp <= feature.max;
			}).map((row) => row.feature);
		}
	})).views((self) => ({ highestRow(assemblyName) {
		const assemblyLayouts = self.layouts.get(assemblyName);
		if (!assemblyLayouts) return 0;
		return Math.max(0, ...[...assemblyLayouts.values()].map((layout) => layout.byRow.length));
	} })).actions((self) => ({ afterAttach() {
		(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)(() => {
			if (!self.lgv.initialized || self.regionCannotBeRendered()) return;
			for (const [id, feature] of self.seenFeatures.entries()) {
				let shouldKeep = false;
				for (const region of self.regions) {
					const extendedStart = region.start - self.cleanupBoundary;
					const extendedEnd = region.end + self.cleanupBoundary;
					if ((0, _jbrowse_core_util.doesIntersect2)(extendedStart, extendedEnd, feature.min, feature.max)) {
						shouldKeep = true;
						break;
					}
				}
				if (!shouldKeep) self.deleteSeenFeature(id);
			}
			for (const region of self.regions) {
				const features = (self.session.apolloDataStore.assemblies.get(region.assemblyName)?.getByRefName(region.refName))?.features;
				if (!features) continue;
				for (const [, feature] of features) if ((0, _jbrowse_core_util.doesIntersect2)(region.start, region.end, feature.min, feature.max) && !self.seenFeatures.has(feature._id)) self.addSeenFeature(feature);
			}
		}, {
			name: "LinearApolloDisplaySetSeenFeatures",
			delay: 1e3
		}));
	} }));
}
//#endregion
//#region src/LinearApolloDisplay/stateModel/rendering.ts
function renderingModelFactory$2(pluginManager, configSchema) {
	return layoutsModelFactory$1(pluginManager, configSchema).named("LinearApolloDisplayRendering").props({
		apolloRowHeight: 20,
		detailsMinHeight: 200,
		detailsHeight: 200,
		isShown: true,
		filteredTranscripts: _jbrowse_mobx_state_tree.types.array(_jbrowse_mobx_state_tree.types.string)
	}).volatile(() => ({
		canvas: null,
		overlayCanvas: null,
		collaboratorCanvas: null,
		theme: (0, _mui_material.createTheme)()
	})).views((self) => ({
		featuresHeight(assemblyName) {
			return (self.highestRow(assemblyName) + 1) * self.apolloRowHeight;
		},
		get canvasPatterns() {
			const patterns = {
				forward: null,
				backward: null
			};
			const canvas = document.createElement("canvas");
			const ctx = canvas?.getContext("2d");
			if (!ctx) return patterns;
			const canvasSize = 10;
			canvas.width = canvas.height = canvasSize;
			const { theme } = self;
			const stripeColor1 = theme.palette.mode === "light" ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.75)";
			const stripeColor2 = theme.palette.mode === "light" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.50)";
			for (const direction of ["forward", "backward"]) {
				const gradient = direction === "forward" ? ctx.createLinearGradient(0, canvasSize, canvasSize, 0) : ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
				gradient.addColorStop(0, stripeColor1);
				gradient.addColorStop(.25, stripeColor1);
				gradient.addColorStop(.25, stripeColor2);
				gradient.addColorStop(.5, stripeColor2);
				gradient.addColorStop(.5, stripeColor1);
				gradient.addColorStop(.75, stripeColor1);
				gradient.addColorStop(.75, stripeColor2);
				gradient.addColorStop(1, stripeColor2);
				ctx.fillStyle = gradient;
				ctx.clearRect(0, 0, canvasSize, canvasSize);
				ctx.fillRect(0, 0, canvasSize, canvasSize);
				patterns[direction] = ctx.createPattern(canvas, "repeat");
			}
			return patterns;
		}
	})).actions((self) => ({
		toggleShown() {
			self.isShown = !self.isShown;
		},
		setDetailsHeight(newHeight) {
			self.detailsHeight = self.isShown ? Math.max(Math.min(newHeight, self.height - 100), Math.min(self.height, self.detailsMinHeight)) : newHeight;
		},
		setCanvas(canvas) {
			self.canvas = canvas;
		},
		setOverlayCanvas(canvas) {
			self.overlayCanvas = canvas;
		},
		setCollaboratorCanvas(canvas) {
			self.collaboratorCanvas = canvas;
		},
		setTheme(theme) {
			self.theme = theme;
		}
	})).actions((self) => ({ afterAttach() {
		(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)(() => {
			if (!self.lgv.initialized || self.regionCannotBeRendered()) return;
			const ctx = self.collaboratorCanvas?.getContext("2d");
			if (!ctx) return;
			ctx.clearRect(0, 0, self.lgv.dynamicBlocks.totalWidthPx, self.featuresHeight(self.lgv.assemblyNames[0]));
			for (const collaborator of self.session.collaborators) {
				const { locations } = collaborator;
				if (locations.length === 0) continue;
				let idx = 0;
				for (const displayedRegion of self.lgv.displayedRegions) {
					for (const location of locations) {
						if (location.refSeq !== displayedRegion.refName) continue;
						const { end, refSeq, start } = location;
						const locationStartPxInfo = self.lgv.bpToPx({
							refName: refSeq,
							coord: start,
							regionNumber: idx
						});
						if (!locationStartPxInfo) continue;
						const locationStartPx = locationStartPxInfo.offsetPx - self.lgv.offsetPx;
						const locationWidthPx = (end - start) / self.lgv.bpPerPx;
						ctx.fillStyle = "rgba(0,255,0,.2)";
						ctx.fillRect(locationStartPx, 1, locationWidthPx, 100);
						ctx.fillStyle = "black";
						ctx.fillText(collaborator.name, locationStartPx + 1, 11, locationWidthPx - 2);
					}
					idx++;
				}
			}
		}, { name: "LinearApolloDisplayRenderCollaborators" }));
		(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)(() => {
			const { canvas, layouts, lgv } = self;
			if (!lgv.initialized || self.regionCannotBeRendered() || !canvas) return;
			const { dynamicBlocks, offsetPx } = lgv;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			const featureLayouts = layouts.get(lgv.assemblyNames[0]);
			if (!featureLayouts) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			for (const block of dynamicBlocks.contentBlocks) {
				const blockLeftPx = block.offsetPx - offsetPx;
				ctx.save();
				ctx.beginPath();
				ctx.rect(blockLeftPx, 0, block.widthPx, canvas.height);
				ctx.clip();
				const layout = featureLayouts.get(block.refName);
				if (!layout) return;
				const { byRow } = layout;
				for (const [row, layoutRow] of byRow.entries()) for (const layoutFeature of layoutRow) {
					const { feature, rowInFeature } = layoutFeature;
					if (!(0, _jbrowse_core_util.doesIntersect2)(block.start, block.end, feature.min, feature.max)) continue;
					self.getGlyph(feature).draw(self, ctx, feature, row, rowInFeature, block);
				}
				for (const [row, layoutRow] of byRow.entries()) for (const layoutFeature of layoutRow) {
					const { feature, rowInFeature } = layoutFeature;
					if (!(0, _jbrowse_core_util.doesIntersect2)(block.start, block.end, feature.min, feature.max)) continue;
					self.getGlyph(feature).drawOverlay(self, ctx, feature, row, block, "highlight", rowInFeature);
				}
				ctx.restore();
			}
		}, { name: "LinearApolloDisplayRenderFeatures" }));
	} }));
}
//#endregion
//#region src/LinearApolloDisplay/stateModel/mouseEvents.ts
function getMousePosition(event, lgv) {
	const canvas = event.currentTarget;
	const { clientX, clientY } = event;
	const { left, top } = canvas.getBoundingClientRect();
	const x = clientX - left;
	const y = clientY - top;
	const { coord: bp, index: regionNumber, assemblyName, refName } = lgv.pxToBp(x);
	return {
		x,
		y,
		assemblyName,
		refName,
		bp,
		regionNumber
	};
}
function mouseEventsModelIntermediateFactory$1(pluginManager, configSchema) {
	return renderingModelFactory$2(pluginManager, configSchema).named("LinearApolloDisplayMouseEvents").volatile(() => ({
		apolloDragging: null,
		cursor: void 0
	})).views((self) => ({
		getMousePosition(event) {
			return getMousePosition(event, self.lgv);
		},
		getFeaturesAtMousePosition(mousePosition) {
			const { bp, assemblyName, refName, y } = mousePosition;
			const row = Math.floor(y / self.apolloRowHeight);
			if (!self.layouts.get(assemblyName)?.get(refName)) return [];
			return self.getFeaturesAtPosition(assemblyName, refName, row, bp);
		}
	})).actions((self) => ({
		continueDrag(mousePosition, event) {
			if (!self.apolloDragging) throw new Error("continueDrag() called with no current drag in progress");
			event.stopPropagation();
			self.apolloDragging = {
				...self.apolloDragging,
				current: mousePosition
			};
		},
		setDragging(dragInfo) {
			self.apolloDragging = dragInfo ?? null;
		}
	})).actions((self) => ({
		setCursor(cursor) {
			if (self.cursor !== cursor) self.cursor = cursor;
		},
		updateFilteredTranscripts(forms) {}
	})).actions(() => ({ onClick() {} }));
}
function mouseEventsModelFactory$1(pluginManager, configSchema) {
	return mouseEventsModelIntermediateFactory$1(pluginManager, configSchema).views((self) => ({ contextMenuItems(event) {
		const mousePosition = self.getMousePosition(event);
		const features = self.getFeaturesAtMousePosition(mousePosition);
		if (features.length === 1) return getContextMenuItemsForFeature(self, features[0]);
		const menuItems = [];
		for (const feature of features) {
			const glyph = self.getGlyph(feature);
			menuItems.push({
				label: feature.type,
				subMenu: [...getContextMenuItemsForFeature(self, feature), ...glyph.getContextMenuItems(self, feature)]
			});
		}
		return menuItems;
	} })).actions((self) => {
		function cancelDragListener(event) {
			if (event.key === "Escape") self.setDragging();
		}
		return {
			startDrag(mousePosition, feature, edge, shrinkParent = false) {
				globalThis.addEventListener("keydown", cancelDragListener, true);
				self.apolloDragging = {
					start: mousePosition,
					current: mousePosition,
					feature,
					edge,
					shrinkParent
				};
			},
			endDrag() {
				globalThis.removeEventListener("keydown", cancelDragListener, true);
				if (!self.apolloDragging) throw new Error("endDrag() called with no current drag in progress");
				const { current, edge, feature, start, shrinkParent } = self.apolloDragging;
				if (Math.abs(current.x - start.x) <= 4) {
					self.setDragging();
					self.setCursor();
					return;
				}
				const { displayedRegions } = self.lgv;
				const assembly = self.getAssemblyId(displayedRegions[start.regionNumber].assemblyName);
				const changes = getPropagatedLocationChanges(feature, current.bp, edge, shrinkParent);
				const change = edge === "max" ? new _apollo_annotation_shared.LocationEndChange({
					typeName: "LocationEndChange",
					changedIds: changes.map((c) => c.featureId),
					changes: changes.map((c) => ({
						featureId: c.featureId,
						oldEnd: c.oldLocation,
						newEnd: c.newLocation
					})),
					assembly
				}) : new _apollo_annotation_shared.LocationStartChange({
					typeName: "LocationStartChange",
					changedIds: changes.map((c) => c.featureId),
					changes: changes.map((c) => ({
						featureId: c.featureId,
						oldStart: c.oldLocation,
						newStart: c.newLocation
					})),
					assembly
				});
				self.changeManager.submit(change);
				self.setDragging();
				self.setCursor();
			}
		};
	}).actions((self) => ({
		onMouseDown(event) {
			const mousePosition = self.getMousePosition(event);
			const features = self.getFeaturesAtMousePosition(mousePosition);
			for (const feature of features.toReversed()) if (self.getGlyph(feature).isDraggable) {
				const edge = isMouseOnFeatureEdge(mousePosition, feature, self);
				if (edge) {
					event.stopPropagation();
					self.startDrag(mousePosition, feature, edge, true);
					return;
				}
			}
		},
		onMouseMove(event) {
			const mousePosition = self.getMousePosition(event);
			if (self.apolloDragging) {
				self.setCursor("col-resize");
				self.continueDrag(mousePosition, event);
				return;
			}
			const features = self.getFeaturesAtMousePosition(mousePosition);
			let topFeature = features.at(-1);
			if (topFeature && isCDSFeature(topFeature, self.session)) {
				const nextFeature = features.at(-2);
				if (nextFeature && !isExonFeature(nextFeature, self.session)) topFeature = nextFeature;
			}
			if (topFeature) self.setHoveredFeature({
				feature: topFeature,
				bp: mousePosition.bp
			});
			else self.setHoveredFeature();
			for (const feature of features.toReversed()) if (self.getGlyph(feature).isDraggable && isMouseOnFeatureEdge(mousePosition, feature, self)) {
				self.setCursor("col-resize");
				return;
			}
			self.setCursor();
		},
		onMouseLeave(_event) {
			self.setDragging();
			self.setHoveredFeature();
		},
		onMouseUp(event) {
			if (self.apolloDragging) {
				self.endDrag();
				return;
			}
			const mousePosition = self.getMousePosition(event);
			const features = self.getFeaturesAtMousePosition(mousePosition);
			let topFeature = features.at(-1);
			if (topFeature && isCDSFeature(topFeature, self.session)) {
				const nextFeature = features.at(-2);
				if (nextFeature && !isExonFeature(nextFeature, self.session)) topFeature = nextFeature;
			}
			if (topFeature) {
				selectFeatureAndOpenWidget(self, topFeature);
				self.setSelectedFeature(topFeature);
			} else self.setSelectedFeature();
		}
	})).actions((self) => ({ afterAttach() {
		(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)(() => {
			const { lgv, overlayCanvas } = self;
			if (!lgv.initialized || self.regionCannotBeRendered() || !overlayCanvas) return;
			const { dynamicBlocks, offsetPx } = lgv;
			const ctx = overlayCanvas.getContext("2d");
			if (!ctx) return;
			ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
			const { apolloDragging, hoveredFeature } = self;
			if (!hoveredFeature) return;
			const { feature } = hoveredFeature;
			const glyph = self.getGlyph(feature);
			const row = self.getRowForFeature(feature);
			if (row === void 0) return;
			for (const block of dynamicBlocks.contentBlocks) {
				const blockLeftPx = block.offsetPx - offsetPx;
				ctx.save();
				ctx.beginPath();
				ctx.rect(blockLeftPx, 0, block.widthPx, overlayCanvas.height);
				ctx.clip();
				if (block.assemblyName === feature.assemblyId && (0, _jbrowse_core_util.doesIntersect2)(block.start, block.end, feature.min, feature.max)) glyph.drawOverlay(self, ctx, feature, row, block, "hover");
				if (apolloDragging) {
					const { current, start, feature: dragFeature } = apolloDragging;
					if ((0, _jbrowse_core_util.doesIntersect2)(block.start, block.end, Math.min(current.bp, start.bp), Math.max(current.bp, start.bp))) {
						const dragGlyph = self.getGlyph(dragFeature);
						const row = self.getRowForFeature(dragFeature);
						if (row !== void 0) dragGlyph.drawDragPreview(self, ctx, dragFeature, row, block);
					}
				}
				ctx.restore();
			}
		}, { name: "LinearApolloDisplayRenderMouseoverAndDrag" }));
	} }));
}
//#endregion
//#region src/LinearApolloDisplay/stateModel/index.ts
function stateModelFactory$2(pluginManager, configSchema) {
	return mouseEventsModelFactory$1(pluginManager, configSchema).props({ tabularEditor: _jbrowse_mobx_state_tree.types.optional(TabularEditorStateModelType, {}) }).named("LinearApolloDisplay");
}
//#endregion
//#region src/LinearApolloReferenceSequenceDisplay/configSchema.ts
const configSchema$1 = (0, _jbrowse_core_configuration.ConfigurationSchema)("LinearApolloReferenceSequenceDisplay", {}, {
	explicitIdentifier: "displayId",
	explicitlyTyped: true
});
//#endregion
//#region src/LinearApolloReferenceSequenceDisplay/drawSequenceOverlay.ts
function getSeqRow(strand, bpPerPx, reversed) {
	if (bpPerPx > 1 || strand === void 0) return;
	if (reversed) return strand === 1 ? 4 : 3;
	return strand === 1 ? 3 : 4;
}
function getTranslationRow(frame, bpPerPx, reversed) {
	const frameRows = bpPerPx <= 1 ? [
		2,
		1,
		0,
		7,
		6,
		5
	] : [
		2,
		1,
		0,
		5,
		4,
		3
	];
	if (reversed) frameRows.reverse();
	frameRows.unshift(0);
	const row = frameRows.at(frame);
	if (row === void 0) throw new Error("could not find row");
	return row;
}
function getLeftPx(feature, bpPerPx, offsetPx, block) {
	return block.offsetPx - offsetPx + (block.reversed ? block.end - feature.max : feature.min - block.start) / bpPerPx;
}
function fillAndStrokeRect(ctx, left, top, width, height, theme, selected = false) {
	ctx.fillStyle = selected ? theme.palette.action.disabled : theme.palette.action.focus;
	ctx.fillRect(left, top, width, height);
	ctx.strokeStyle = selected ? theme.palette.text.secondary : theme.palette.text.primary;
	ctx.strokeStyle = theme.palette.text.primary;
	ctx.strokeRect(left, top, width, height);
}
function drawHover(ctx, feature, bpPerPx, offsetPx, rowHeight, block, theme, selected = false) {
	const row = getSeqRow(feature.strand, bpPerPx, block.reversed);
	if (row === void 0) return;
	const left = getLeftPx(feature, bpPerPx, offsetPx, block);
	const width = feature.length / bpPerPx;
	fillAndStrokeRect(ctx, left, row * rowHeight, width, rowHeight, theme, selected);
}
function drawCDSHighlight(ctx, feature, bpPerPx, offsetPx, rowHeight, block, theme, selected = false) {
	const parentFeature = feature.parent;
	if (!parentFeature) return;
	const cdsLocs = parentFeature.cdsLocations.find((loc) => {
		const min = loc.at(feature.strand === 1 ? 0 : -1)?.min;
		const max = loc.at(feature.strand === 1 ? -1 : 0)?.max;
		return feature.min === min && feature.max === max;
	});
	if (!cdsLocs) return;
	for (const loc of cdsLocs) {
		const row = getTranslationRow((0, _jbrowse_core_util.getFrame)(loc.min, loc.max, feature.strand ?? 1, loc.phase), bpPerPx, block.reversed);
		fillAndStrokeRect(ctx, getLeftPx(loc, bpPerPx, offsetPx, block), row * rowHeight, (loc.max - loc.min) / bpPerPx, rowHeight, theme, selected);
	}
}
function drawSequenceOverlay(canvas, ctx, hoveredFeature, selectedFeature, rowHeight, theme, session, bpPerPx, offsetPx, dynamicBlocks) {
	const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	for (const block of dynamicBlocks.contentBlocks) {
		ctx.save();
		ctx.beginPath();
		const blockLeftPx = block.offsetPx - offsetPx;
		ctx.rect(blockLeftPx, 0, block.widthPx, canvas.height);
		ctx.clip();
		for (const feature of [selectedFeature, hoveredFeature?.feature].filter((f) => f !== void 0)) if (featureTypeOntology.isTypeOf(feature.type, "CDS")) drawCDSHighlight(ctx, feature, bpPerPx, offsetPx, rowHeight, block, theme, feature._id === selectedFeature?._id);
		else drawHover(ctx, feature, bpPerPx, offsetPx, rowHeight, block, theme, feature._id === selectedFeature?._id);
		ctx.restore();
	}
}
//#endregion
//#region src/LinearApolloReferenceSequenceDisplay/drawSequenceTrack.ts
function drawLetter(seqTrackctx, left, top, width, letter) {
	const fontSize = Math.min(width, 10);
	seqTrackctx.fillStyle = "#000";
	seqTrackctx.font = `${fontSize}px`;
	const textWidth = seqTrackctx.measureText(letter).width;
	const textX = Math.round(left + (width - textWidth) / 2);
	seqTrackctx.fillText(letter, textX, top + 10);
}
function drawTranslationFrameBackgrounds(ctx, bpPerPx, theme, highContrast, left, width, sequenceRowHeight, reversed) {
	const frames = bpPerPx <= 1 ? [
		3,
		2,
		1,
		0,
		0,
		-1,
		-2,
		-3
	] : [
		3,
		2,
		1,
		-1,
		-2,
		-3
	];
	if (reversed) frames.reverse();
	for (const [idx, frame] of frames.entries()) {
		const frameColor = theme.palette.framesCDS.at(frame)?.main;
		if (!frameColor) continue;
		const top = idx * sequenceRowHeight;
		ctx.fillStyle = highContrast ? theme.palette.background.default : frameColor;
		ctx.fillRect(left, top, width, sequenceRowHeight);
		if (highContrast) {
			const strokeStyle = theme.palette.grey[200];
			strokeRectInner(ctx, left, top, width, sequenceRowHeight, strokeStyle);
		}
	}
}
function drawBase(ctx, base, index, leftPx, bpPerPx, rowHeight, theme) {
	if (1 / bpPerPx < 1) return;
	const left = Math.round(leftPx + index / bpPerPx);
	const width = Math.round(leftPx + (index + 1) / bpPerPx) - left;
	for (const strand of [-1, 1]) {
		const top = (strand === 1 ? 3 : 4) * rowHeight;
		const baseCode = strand === 1 ? base : (0, _jbrowse_core_util.revcom)(base);
		ctx.fillStyle = colorCode(baseCode, theme);
		ctx.fillRect(left, top, width, rowHeight);
		if (1 / bpPerPx >= 12) {
			const strokeStyle = theme.palette.text.disabled;
			strokeRectInner(ctx, left, top, width, rowHeight, strokeStyle);
			drawLetter(ctx, left, top, width, baseCode);
		}
	}
}
function drawCodon$1(ctx, codon, leftPx, index, theme, highContrast, bpPerPx, bp, rowHeight, showStartCodons, showStopCodons) {
	const frameOffsets = (bpPerPx <= 1 ? [
		0,
		2,
		1,
		0,
		7,
		6,
		5
	] : [
		0,
		2,
		1,
		0,
		5,
		4,
		3
	]).map((b) => b * rowHeight);
	for (const strand of [-1, 1]) {
		const frame = (0, _jbrowse_core_util.getFrame)(bp, bp + 3, strand, 0);
		const top = frameOffsets.at(frame);
		if (top === void 0) continue;
		const left = Math.round(leftPx + index / bpPerPx);
		const width = Math.round(leftPx + (index + 3) / bpPerPx) - left;
		const codonCode = strand === 1 ? codon : (0, _jbrowse_core_util.revcom)(codon);
		const aminoAcidCode = _jbrowse_core_util.defaultCodonTable[codonCode];
		const fillColor = codonColorCode(aminoAcidCode, theme, highContrast);
		if (fillColor && (showStopCodons && aminoAcidCode == "*" || showStartCodons && aminoAcidCode != "*")) {
			ctx.fillStyle = fillColor;
			ctx.fillRect(left, top, width, rowHeight);
		}
		if (1 / bpPerPx >= 4) {
			const strokeStyle = theme.palette.text.disabled;
			strokeRectInner(ctx, left, top, width, rowHeight, strokeStyle);
			drawLetter(ctx, left, top, width, aminoAcidCode);
		}
	}
}
function drawSequenceTrack(canvas, theme, bpPerPx, offsetPx, dynamicBlocks, highContrast, showStartCodons, showStopCodons, sequenceRowHeight, session) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	const { apolloDataStore } = session;
	for (const block of dynamicBlocks.contentBlocks) {
		const totalOffsetPx = block.offsetPx - offsetPx;
		drawTranslationFrameBackgrounds(ctx, bpPerPx, theme, highContrast, totalOffsetPx, block.widthPx, sequenceRowHeight, block.reversed);
		const ref = apolloDataStore.assemblies.get(block.assemblyName)?.getByRefName(block.refName);
		const roundedStart = Math.floor(block.start);
		const roundedEnd = Math.ceil(block.end);
		let seq = ref?.getSequence(roundedStart, roundedEnd);
		if (!seq) return;
		seq = seq.toUpperCase();
		if (block.reversed) seq = (0, _jbrowse_core_util.revcom)(seq);
		const seqLeftPx = totalOffsetPx - (block.reversed ? roundedEnd - block.end : block.start - roundedStart) / bpPerPx;
		for (let i = 0; i < seq.length; i++) {
			const bp = block.reversed ? roundedEnd - i : roundedStart + i;
			const codon = seq.slice(i, i + 3);
			drawBase(ctx, seq[i], i, seqLeftPx, bpPerPx, sequenceRowHeight, theme);
			if (codon.length !== 3) continue;
			drawCodon$1(ctx, codon, seqLeftPx, i, theme, highContrast, bpPerPx, bp, sequenceRowHeight, showStartCodons, showStopCodons);
		}
	}
}
//#endregion
//#region src/LinearApolloReferenceSequenceDisplay/stateModel/base.ts
const minDisplayHeight$1 = 20;
function baseModelFactory$1(_pluginManager, configSchema) {
	return _jbrowse_core_pluggableElementTypes.BaseDisplay.named("BaseLinearApolloReferenceSequenceDisplay").props({
		type: _jbrowse_mobx_state_tree.types.literal("LinearApolloReferenceSequenceDisplay"),
		configuration: (0, _jbrowse_core_configuration.ConfigurationReference)(configSchema),
		showStartCodons: false,
		showStopCodons: true,
		highContrast: false,
		heightPreConfig: _jbrowse_mobx_state_tree.types.maybe(_jbrowse_mobx_state_tree.types.refinement("displayHeight", _jbrowse_mobx_state_tree.types.number, (n) => n >= minDisplayHeight$1)),
		sequenceRowHeight: 15
	}).views((self) => {
		const { configuration, renderProps: superRenderProps } = self;
		return { renderProps() {
			return {
				...superRenderProps(),
				...(0, _jbrowse_core_util_tracks.getParentRenderProps)(self),
				config: configuration.renderer
			};
		} };
	}).views((self) => ({ get lgv() {
		return (0, _jbrowse_core_util.getContainingView)(self);
	} })).views((self) => ({
		get rendererTypeName() {
			return self.configuration.renderer.type;
		},
		get session() {
			return (0, _jbrowse_core_util.getSession)(self);
		},
		get regions() {
			return self.lgv.dynamicBlocks.contentBlocks.map(({ assemblyName, end, refName, start }) => ({
				assemblyName,
				refName,
				start: Math.round(start),
				end: Math.round(end)
			}));
		},
		regionCannotBeRendered() {
			if (self.lgv && self.lgv.bpPerPx > 3) return "Zoom in to see sequence";
		}
	})).views((self) => ({
		get expandedRegions() {
			return self.lgv.dynamicBlocks.contentBlocks.map((block) => {
				const { assemblyName, end, refName, start } = block;
				const { parentRegion } = block;
				return {
					assemblyName,
					refName,
					start: Math.round(Math.max(start - 5, parentRegion.start)),
					end: Math.round(Math.min(end + 5, parentRegion.end))
				};
			});
		},
		get apolloInternetAccount() {
			const [region] = self.regions;
			const { internetAccounts } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
			const { assemblyName } = region;
			const { assemblyManager } = self.session;
			const assembly = assemblyManager.get(assemblyName);
			if (!assembly) throw new Error(`No assembly found with name ${assemblyName}`);
			const { internetAccountConfigId } = (0, _jbrowse_core_configuration.getConf)(assembly, ["sequence", "metadata"]);
			return internetAccounts.find((ia) => (0, _jbrowse_core_configuration.getConf)(ia, "internetAccountId") === internetAccountConfigId);
		},
		get changeManager() {
			return self.session.apolloDataStore.changeManager;
		},
		getAssemblyId(assemblyName) {
			const { assemblyManager } = self.session;
			const assembly = assemblyManager.get(assemblyName);
			if (!assembly) throw new Error(`Could not find assembly named ${assemblyName}`);
			return assembly.name;
		},
		get selectedFeature() {
			return self.session.apolloSelectedFeature;
		},
		get hoveredFeature() {
			return self.session.apolloHoveredFeature;
		},
		get height() {
			const { sequenceRowHeight } = self;
			return self.lgv.bpPerPx <= 1 ? sequenceRowHeight * 8 : sequenceRowHeight * 6;
		}
	})).volatile(() => ({ scrollTop: 0 })).actions((self) => ({
		setScrollTop(scrollTop) {
			self.scrollTop = scrollTop;
		},
		setHeight(displayHeight) {
			self.heightPreConfig = Math.max(displayHeight, minDisplayHeight$1);
			return self.height;
		},
		resizeHeight(distance) {
			const oldHeight = self.height;
			return this.setHeight(self.height + distance) - oldHeight;
		},
		toggleShowStartCodons() {
			self.showStartCodons = !self.showStartCodons;
		},
		toggleShowStopCodons() {
			self.showStopCodons = !self.showStopCodons;
		},
		toggleHighContrast() {
			self.highContrast = !self.highContrast;
		}
	})).views((self) => {
		const { trackMenuItems: superTrackMenuItems } = self;
		return { trackMenuItems() {
			const { showStartCodons, showStopCodons, highContrast } = self;
			return [...superTrackMenuItems(), {
				type: "subMenu",
				label: "Appearance",
				subMenu: [
					{
						label: "Show start codons",
						type: "checkbox",
						checked: showStartCodons,
						onClick: () => {
							self.toggleShowStartCodons();
						}
					},
					{
						label: "Show stop codons",
						type: "checkbox",
						checked: showStopCodons,
						onClick: () => {
							self.toggleShowStopCodons();
						}
					},
					{
						label: "Use high contrast colors",
						type: "checkbox",
						checked: highContrast,
						onClick: () => {
							self.toggleHighContrast();
						}
					}
				]
			}];
		} };
	}).actions((self) => ({ afterAttach() {
		(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)(() => {
			if (!self.lgv.initialized || self.regionCannotBeRendered()) return;
			if (self.lgv.bpPerPx <= 3) self.session.apolloDataStore.loadRefSeq(self.expandedRegions);
		}, {
			name: "LinearApolloReferenceSequenceDisplayLoadFeatures",
			delay: 1e3
		}));
	} }));
}
//#endregion
//#region src/LinearApolloReferenceSequenceDisplay/stateModel/rendering.ts
function renderingModelFactory$1(pluginManager, configSchema) {
	return baseModelFactory$1(pluginManager, configSchema).named("LinearApolloReferenceSequenceDisplayRendering").volatile(() => ({
		seqTrackCanvas: null,
		seqTrackOverlayCanvas: null,
		theme: (0, _mui_material.createTheme)()
	})).actions((self) => ({
		setSeqTrackCanvas(canvas) {
			self.seqTrackCanvas = canvas;
		},
		setSeqTrackOverlayCanvas(canvas) {
			self.seqTrackOverlayCanvas = canvas;
		},
		setTheme(theme) {
			self.theme = theme;
		},
		afterAttach() {
			(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)(() => {
				const { lgv, seqTrackCanvas, theme, highContrast, showStartCodons, showStopCodons, sequenceRowHeight, session } = self;
				if (!lgv.initialized || self.regionCannotBeRendered() || !seqTrackCanvas) return;
				if (3 / lgv.bpPerPx < 1) return;
				const { bpPerPx, offsetPx, dynamicBlocks } = lgv;
				drawSequenceTrack(seqTrackCanvas, theme, bpPerPx, offsetPx, dynamicBlocks, highContrast, showStartCodons, showStopCodons, sequenceRowHeight, session);
			}, { name: "LinearApolloReferenceSequenceDisplayRenderSequence" }));
			(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)(() => {
				const { seqTrackOverlayCanvas } = self;
				if (!self.lgv.initialized || self.regionCannotBeRendered() || !seqTrackOverlayCanvas) return;
				const seqTrackOverlayctx = seqTrackOverlayCanvas.getContext("2d");
				if (!seqTrackOverlayctx) return;
				seqTrackOverlayctx.clearRect(0, 0, self.lgv.dynamicBlocks.totalWidthPx, self.height);
				const { hoveredFeature, selectedFeature, lgv, sequenceRowHeight, session, theme } = self;
				if (!(hoveredFeature || selectedFeature)) return;
				const { bpPerPx, dynamicBlocks, offsetPx } = lgv;
				drawSequenceOverlay(seqTrackOverlayCanvas, seqTrackOverlayctx, hoveredFeature, selectedFeature, sequenceRowHeight, theme, session, bpPerPx, offsetPx, dynamicBlocks);
			}, { name: "LinearApolloReferenceSequenceDisplayRenderSequenceHighlight" }));
		}
	}));
}
//#endregion
//#region src/LinearApolloReferenceSequenceDisplay/stateModel/index.ts
function stateModelFactory$1(pluginManager, configSchema) {
	return renderingModelFactory$1(pluginManager, configSchema).named("LinearApolloReferenceSequenceDisplay");
}
//#endregion
//#region src/LinearApolloReferenceSequenceDisplay/components/LinearApolloReferenceSequenceDisplay.tsx
const LinearApolloReferenceSequenceDisplay = (0, mobx_react.observer)(function LinearApolloReferenceSequenceDisplay(props) {
	const theme = (0, _mui_material.useTheme)();
	const { model } = props;
	const { height, regionCannotBeRendered, setSeqTrackCanvas, setSeqTrackOverlayCanvas, setTheme } = model;
	const { classes } = useStyles$1();
	(0, react.useEffect)(() => {
		setTheme(theme);
	}, [theme, setTheme]);
	const lgv = (0, _jbrowse_core_util.getContainingView)(model);
	const message = regionCannotBeRendered();
	if (message) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Alert, {
		severity: "warning",
		classes: { message: classes.ellipses },
		slotProps: { root: { className: classes.center } },
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Tooltip, {
			title: message,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: message })
		})
	});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: 3 / lgv.bpPerPx >= 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: classes.canvasContainer,
		style: {
			width: lgv.dynamicBlocks.totalWidthPx,
			height
		},
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("canvas", {
			ref: async (node) => {
				await Promise.resolve();
				setSeqTrackCanvas(node);
			},
			width: lgv.dynamicBlocks.totalWidthPx,
			height,
			className: classes.canvas,
			"data-testid": "seqTrackCanvas"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("canvas", {
			ref: async (node) => {
				await Promise.resolve();
				setSeqTrackOverlayCanvas(node);
			},
			width: lgv.dynamicBlocks.totalWidthPx,
			height,
			className: classes.canvas,
			"data-testid": "seqTrackOverlayCanvas"
		})]
	}) : null });
});
//#endregion
//#region src/LinearApolloSixFrameDisplay/configSchema.ts
const configSchema = (0, _jbrowse_core_configuration.ConfigurationSchema)("LinearApolloSixFrameDisplay", {}, {
	explicitIdentifier: "displayId",
	explicitlyTyped: true
});
//#endregion
//#region src/components/FilterTranscripts.tsx
const FilterTranscripts = (0, mobx_react.observer)(function FilterTranscripts({ sourceFeature, filteredTranscripts, handleClose, onUpdate }) {
	const allTranscripts = [];
	if (sourceFeature.children) for (const [, child] of sourceFeature.children) {
		const childID = child.attributes.get("gff_id")?.toString();
		if (childID) allTranscripts.push(childID);
	}
	const [excludedTranscripts, setExcludedTranscripts] = (0, react.useState)(filteredTranscripts);
	const handleChange = (value) => {
		const newForms = excludedTranscripts.includes(value) ? excludedTranscripts.filter((form) => form !== value) : [...excludedTranscripts, value];
		onUpdate(newForms);
		setExcludedTranscripts(newForms);
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Dialog$1, {
		open: true,
		maxWidth: false,
		"data-testid": "filter-transcripts-dialog",
		title: "Filter transcripts by ID",
		handleClose,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, { children: "Select the alternate transcripts you want to display in the apollo track" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, {
			container: true,
			spacing: 2,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Grid, {
				size: 8,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormGroup, { children: allTranscripts.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
					control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Checkbox, {
						checked: !excludedTranscripts.includes(item),
						onChange: () => {
							handleChange(item);
						},
						slotProps: { input: { "aria-label": "controlled" } }
					}),
					label: item
				}, item)) })
			})
		})] })
	});
});
//#endregion
//#region src/LinearApolloSixFrameDisplay/glyphs/GeneGlyph.ts
let forwardFillLight = null;
let backwardFillLight = null;
let forwardFillDark = null;
let backwardFillDark = null;
if (globalThis.document.createElement("canvas")?.getContext) for (const direction of ["forward", "backward"]) for (const themeMode of ["light", "dark"]) {
	const canvas = document.createElement("canvas");
	const canvasSize = 10;
	canvas.width = canvas.height = canvasSize;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		const stripeColor1 = themeMode === "light" ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.75)";
		const stripeColor2 = themeMode === "light" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.50)";
		const gradient = direction === "forward" ? ctx.createLinearGradient(0, canvasSize, canvasSize, 0) : ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
		gradient.addColorStop(0, stripeColor1);
		gradient.addColorStop(.25, stripeColor1);
		gradient.addColorStop(.25, stripeColor2);
		gradient.addColorStop(.5, stripeColor2);
		gradient.addColorStop(.5, stripeColor1);
		gradient.addColorStop(.75, stripeColor1);
		gradient.addColorStop(.75, stripeColor2);
		gradient.addColorStop(1, stripeColor2);
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, 10, 10);
		if (direction === "forward") {
			if (themeMode === "light") forwardFillLight = ctx.createPattern(canvas, "repeat");
			else forwardFillDark = ctx.createPattern(canvas, "repeat");
		} else if (themeMode === "light") backwardFillLight = ctx.createPattern(canvas, "repeat");
		else backwardFillDark = ctx.createPattern(canvas, "repeat");
	}
}
function deepSetHas(set, item) {
	for (const elem of set) if ((0, fast_deep_equal_es6.default)(elem, item)) return true;
	return false;
}
function drawTextLabels(ctx, labelArray, font = "10px sans-serif") {
	for (let i = labelArray.length - 1; i >= 0; --i) {
		const label = labelArray[i];
		ctx.fillStyle = label.color;
		const labelRowX = label.x + 1;
		const labelRowY = label.y + label.h;
		const textWidth = (0, _jbrowse_core_util.measureText)(label.text, 10);
		if (label.isSelected) ctx.font = "bold ".concat(font);
		if (label.text) {
			ctx.clearRect(labelRowX - 5, labelRowY, textWidth + 10, label.h);
			ctx.fillText(label.text, labelRowX, labelRowY + 11, textWidth);
			ctx.font = font;
		}
	}
}
function draw(ctx, topLevelFeature, _row, stateModel, displayedRegionIndex) {
	const { apolloRowHeight, lgv, session, theme, highestRow, filteredTranscripts, selectedFeature, showFeatureLabels } = stateModel;
	const { bpPerPx, displayedRegions, offsetPx } = lgv;
	const { refName, reversed } = displayedRegions[displayedRegionIndex];
	const rowHeight = apolloRowHeight;
	const exonHeight = rowHeight;
	const cdsHeight = rowHeight;
	const topLevelFeatureHeight = rowHeight;
	const featureLabelSpacer = showFeatureLabels ? 2 : 1;
	const textColor = theme.palette.text.primary;
	const { attributes, children, min, strand } = topLevelFeature;
	if (!children) return;
	const { apolloDataStore } = session;
	const { featureTypeOntology } = apolloDataStore.ontologyManager;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	const labelArray = [];
	const topLevelFeatureMinX = (lgv.bpToPx({
		refName,
		coord: min,
		regionNumber: displayedRegionIndex
	})?.offsetPx ?? 0) - offsetPx;
	const topLevelFeatureWidthPx = topLevelFeature.length / bpPerPx;
	const topLevelFeatureStartPx = reversed ? topLevelFeatureMinX - topLevelFeatureWidthPx : topLevelFeatureMinX;
	const topLevelFeatureTop = (strand == 1 ? 3 : 4) * featureLabelSpacer * rowHeight;
	ctx.fillStyle = theme.palette.text.primary;
	ctx.fillRect(topLevelFeatureStartPx, topLevelFeatureTop, topLevelFeatureWidthPx, topLevelFeatureHeight);
	ctx.fillStyle = isSelectedFeature(topLevelFeature, selectedFeature) ? (0, _mui_material.alpha)("rgb(0,0,0)", .7) : (0, _mui_material.alpha)(theme.palette.background.paper, .7);
	ctx.fillRect(topLevelFeatureStartPx + 1, topLevelFeatureTop + 1, topLevelFeatureWidthPx - 2, topLevelFeatureHeight - 2);
	const isSelected = isSelectedFeature(topLevelFeature, selectedFeature);
	const label = {
		x: topLevelFeatureStartPx,
		y: topLevelFeatureTop,
		h: topLevelFeatureHeight,
		text: attributes.get("gff_id")?.toString(),
		color: textColor,
		isSelected
	};
	if (isSelected) labelArray.unshift(label);
	else labelArray.push(label);
	const forwardFill = theme.palette.mode === "dark" ? forwardFillDark : forwardFillLight;
	const backwardFill = theme.palette.mode === "dark" ? backwardFillDark : backwardFillLight;
	const reversal = reversed ? -1 : 1;
	let topFill = null, bottomFill = null;
	if (strand) [topFill, bottomFill] = strand * reversal === 1 ? [forwardFill, backwardFill] : [backwardFill, forwardFill];
	if (topFill && bottomFill) {
		ctx.fillStyle = topFill;
		ctx.fillRect(topLevelFeatureStartPx + 1, topLevelFeatureTop + 1, topLevelFeatureWidthPx - 2, (topLevelFeatureHeight - 2) / 2);
		ctx.fillStyle = bottomFill;
		ctx.fillRect(topLevelFeatureStartPx + 1, topLevelFeatureTop + (topLevelFeatureHeight - 2) / 2, topLevelFeatureWidthPx - 2, (topLevelFeatureHeight - 2) / 2);
	}
	const renderedCDS = /* @__PURE__ */ new Set();
	for (const [, child] of children) {
		if (!(featureTypeOntology.isTypeOf(child.type, "transcript") || featureTypeOntology.isTypeOf(child.type, "pseudogenic_transcript"))) continue;
		const { children: childrenOfmRNA, cdsLocations } = child;
		if (!childrenOfmRNA) continue;
		const childID = child.attributes.get("gff_id")?.toString();
		if (childID && filteredTranscripts.includes(childID)) continue;
		for (const [, exon] of childrenOfmRNA) {
			if (!featureTypeOntology.isTypeOf(exon.type, "exon")) continue;
			const minX = (lgv.bpToPx({
				refName,
				coord: exon.min,
				regionNumber: displayedRegionIndex
			})?.offsetPx ?? 0) - offsetPx;
			const widthPx = exon.length / bpPerPx;
			const startPx = reversed ? minX - widthPx : minX;
			const exonTop = topLevelFeatureTop + (topLevelFeatureHeight - exonHeight) / 2;
			const isSelected = isSelectedFeature(exon, selectedFeature);
			ctx.fillStyle = theme.palette.text.primary;
			ctx.fillRect(startPx, exonTop, widthPx, exonHeight);
			if (widthPx > 2) {
				ctx.clearRect(startPx + 1, exonTop + 1, widthPx - 2, exonHeight - 2);
				ctx.fillStyle = isSelected ? "rgb(0,0,0)" : (0, _mui_material.alpha)("#f5f500", .6);
				ctx.fillRect(startPx + 1, exonTop + 1, widthPx - 2, exonHeight - 2);
				if (topFill && bottomFill) {
					ctx.fillStyle = topFill;
					ctx.fillRect(startPx + 1, exonTop + 1, widthPx - 2, (exonHeight - 2) / 2);
					ctx.fillStyle = bottomFill;
					ctx.fillRect(startPx + 1, exonTop + 1 + (exonHeight - 2) / 2, widthPx - 2, (exonHeight - 2) / 2);
				}
				const label = {
					x: startPx,
					y: exonTop,
					h: exonHeight,
					text: exon.attributes.get("gff_id")?.toString(),
					color: textColor,
					isSelected
				};
				if (isSelected) labelArray.unshift(label);
				else labelArray.push(label);
			}
		}
		const isSelected = isSelectedFeature(child, selectedFeature?.parent);
		let cdsStartPx = 0;
		let cdsTop = 0;
		for (const cdsRow of cdsLocations) {
			let prevCDSTop = 0;
			let prevCDSEndPx = 0;
			let counter = 1;
			for (const cds of cdsRow.toSorted((a, b) => a.max - b.max)) if (selectedFeature && isSelected && featureTypeOntology.isTypeOf(selectedFeature.type, "CDS") || !deepSetHas(renderedCDS, cds)) {
				const cdsWidthPx = (cds.max - cds.min) / bpPerPx;
				const minX = (lgv.bpToPx({
					refName,
					coord: cds.min,
					regionNumber: displayedRegionIndex
				})?.offsetPx ?? 0) - offsetPx;
				cdsStartPx = reversed ? minX - cdsWidthPx : minX;
				ctx.fillStyle = theme.palette.text.primary;
				const frame = (0, _jbrowse_core_util.getFrame)(cds.min, cds.max, child.strand ?? 1, cds.phase);
				const row = (showFeatureLabels ? [
					0,
					4,
					2,
					0,
					14,
					12,
					10
				] : [
					0,
					2,
					1,
					0,
					7,
					6,
					5
				]).at(frame);
				if (row === void 0) continue;
				cdsTop = row * rowHeight;
				ctx.fillRect(cdsStartPx, cdsTop, cdsWidthPx, cdsHeight);
				if (counter > 1) {
					const midPoint = [(cdsStartPx - prevCDSEndPx) / 2 + prevCDSEndPx, Math.max(frame < 0 ? rowHeight * featureLabelSpacer * highestRow + 1 : 1, Math.min(prevCDSTop, cdsTop) - rowHeight / 2)];
					ctx.strokeStyle = "rgb(0, 128, 128)";
					ctx.beginPath();
					ctx.moveTo(prevCDSEndPx, prevCDSTop);
					ctx.lineTo(...midPoint);
					ctx.stroke();
					ctx.moveTo(...midPoint);
					ctx.lineTo(cdsStartPx, cdsTop + rowHeight / 2);
					ctx.stroke();
				}
				prevCDSEndPx = cdsStartPx + cdsWidthPx;
				prevCDSTop = cdsTop + rowHeight / 2;
				counter += 1;
				if (cdsWidthPx > 2) {
					ctx.clearRect(cdsStartPx + 1, cdsTop + 1, cdsWidthPx - 2, cdsHeight - 2);
					const cdsColorCode = theme.palette.framesCDS.at(frame)?.main ?? "rgb(171,71,188)";
					ctx.fillStyle = cdsColorCode;
					ctx.fillStyle = selectedFeature && isSelected && featureTypeOntology.isTypeOf(selectedFeature.type, "CDS") ? "rgb(0,0,0)" : cdsColorCode;
					ctx.fillRect(cdsStartPx + 1, cdsTop + 1, cdsWidthPx - 2, cdsHeight - 2);
					if (topFill && bottomFill) {
						ctx.fillStyle = topFill;
						ctx.fillRect(cdsStartPx + 1, cdsTop + 1, cdsWidthPx - 2, (cdsHeight - 2) / 2);
						ctx.fillStyle = bottomFill;
						ctx.fillRect(cdsStartPx + 1, cdsTop + (cdsHeight - 2) / 2, cdsWidthPx - 2, (cdsHeight - 2) / 2);
					}
				}
				renderedCDS.add(cds);
			}
		}
		const label = {
			x: cdsStartPx,
			y: cdsTop,
			h: cdsHeight,
			text: child.attributes.get("gff_id")?.toString(),
			color: textColor,
			isSelected
		};
		if (isSelected) labelArray.unshift(label);
		else labelArray.push(label);
	}
	if (showFeatureLabels) drawTextLabels(ctx, labelArray);
}
function drawDragPreview(stateModel, overlayCtx) {
	const { apolloDragging, apolloRowHeight, lgv, theme } = stateModel;
	const { bpPerPx, displayedRegions, offsetPx } = lgv;
	if (!apolloDragging) return;
	const { current, edge, feature, start } = apolloDragging;
	const row = Math.floor(start.y / apolloRowHeight);
	const region = displayedRegions[start.regionNumber];
	const rowCount = 1;
	const featureEdgePx = (region.reversed ? region.end - feature[edge] : feature[edge] - region.start) / bpPerPx - offsetPx;
	const rectX = Math.min(current.x, featureEdgePx);
	const rectY = row * apolloRowHeight;
	const rectWidth = Math.abs(current.x - featureEdgePx);
	const rectHeight = apolloRowHeight * rowCount;
	overlayCtx.strokeStyle = theme.palette.info.main;
	overlayCtx.setLineDash([6]);
	overlayCtx.strokeRect(rectX, rectY, rectWidth, rectHeight);
	overlayCtx.fillStyle = (0, _mui_material.alpha)(theme.palette.info.main, .2);
	overlayCtx.fillRect(rectX, rectY, rectWidth, rectHeight);
}
function drawOverlay(stateModel, ctx) {
	const { hoveredFeature, apolloRowHeight, filteredTranscripts, lgv, highestRow, session, showFeatureLabels } = stateModel;
	if (!hoveredFeature) return;
	const { feature } = hoveredFeature;
	const { apolloDataStore } = session;
	const { featureTypeOntology } = apolloDataStore.ontologyManager;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	if (!featureTypeOntology.isTypeOf(feature.type, "transcript")) return;
	const featureID = feature.attributes.get("gff_id")?.toString();
	if (featureID && filteredTranscripts.includes(featureID)) return;
	const position = stateModel.getFeatureLayoutPosition(feature);
	if (!position) return;
	const { bpPerPx, displayedRegions, offsetPx } = lgv;
	const { layoutIndex } = position;
	const { refName, reversed } = displayedRegions[layoutIndex];
	const rowHeight = apolloRowHeight;
	const cdsHeight = rowHeight;
	const featureLabelSpacer = showFeatureLabels ? 2 : 1;
	const { cdsLocations, strand } = feature;
	for (const cdsRow of cdsLocations) {
		let prevCDSTop = 0;
		let prevCDSEndPx = 0;
		let counter = 1;
		for (const cds of cdsRow.toSorted((a, b) => a.max - b.max)) {
			const cdsWidthPx = (cds.max - cds.min) / bpPerPx;
			const minX = (lgv.bpToPx({
				refName,
				coord: cds.min,
				regionNumber: layoutIndex
			})?.offsetPx ?? 0) - offsetPx;
			const cdsStartPx = reversed ? minX - cdsWidthPx : minX;
			const frame = (0, _jbrowse_core_util.getFrame)(cds.min, cds.max, strand ?? 1, cds.phase);
			const row = (showFeatureLabels ? [
				0,
				4,
				2,
				0,
				14,
				12,
				10
			] : [
				0,
				2,
				1,
				0,
				7,
				6,
				5
			]).at(frame);
			if (row === void 0) continue;
			const cdsTop = row * rowHeight;
			if (counter > 1) {
				const midPoint = [(cdsStartPx - prevCDSEndPx) / 2 + prevCDSEndPx, Math.max(frame < 0 ? rowHeight * featureLabelSpacer * highestRow + 1 : 1, Math.min(prevCDSTop, cdsTop) - rowHeight / 2)];
				ctx.strokeStyle = "rgb(0, 0, 0)";
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(prevCDSEndPx, prevCDSTop);
				ctx.lineTo(...midPoint);
				ctx.stroke();
				ctx.moveTo(...midPoint);
				ctx.lineTo(cdsStartPx, cdsTop + rowHeight / 2);
				ctx.stroke();
			}
			prevCDSEndPx = cdsStartPx + cdsWidthPx;
			prevCDSTop = cdsTop + rowHeight / 2;
			counter += 1;
			if (cdsWidthPx > 2) {
				ctx.fillStyle = "rgba(255,0,0,0.6)";
				ctx.fillRect(cdsStartPx, cdsTop, cdsWidthPx, cdsHeight);
			}
		}
	}
}
function onMouseDown(stateModel, currentMousePosition, event) {
	const { feature } = currentMousePosition;
	const draggableFeature = getDraggableFeatureInfo(currentMousePosition, feature, stateModel);
	if (draggableFeature) {
		event.stopPropagation();
		stateModel.startDrag(currentMousePosition, draggableFeature.feature, draggableFeature.edge, true);
	}
}
function onMouseMove(stateModel, mousePosition) {
	if (isMousePositionWithFeature(mousePosition)) {
		const { feature, bp } = mousePosition;
		stateModel.setHoveredFeature({
			feature,
			bp
		});
		if (getDraggableFeatureInfo(mousePosition, feature, stateModel)) {
			stateModel.setCursor("col-resize");
			return;
		}
	}
	stateModel.setCursor();
}
function onMouseUp(stateModel, mousePosition) {
	if (stateModel.apolloDragging) return;
	if (isMousePositionWithFeature(mousePosition)) {
		const { feature } = mousePosition;
		const { session } = stateModel;
		const { apolloDataStore } = session;
		const { featureTypeOntology } = apolloDataStore.ontologyManager;
		stateModel.setSelectedFeature(feature);
		if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
		let containsCDSOrExon = false;
		for (const [, child] of feature.children ?? []) if (featureTypeOntology.isTypeOf(child.type, "CDS") || featureTypeOntology.isTypeOf(child.type, "exon")) {
			containsCDSOrExon = true;
			break;
		}
		if ((featureTypeOntology.isTypeOf(feature.type, "transcript") || featureTypeOntology.isTypeOf(feature.type, "pseudogenic_transcript")) && containsCDSOrExon) stateModel.showFeatureDetailsWidget(feature, ["ApolloTranscriptDetails", "apolloTranscriptDetails"]);
		else stateModel.showFeatureDetailsWidget(feature);
	}
}
function getDraggableFeatureInfo(mousePosition, feature, stateModel) {
	const { filteredTranscripts, session } = stateModel;
	const { apolloDataStore } = session;
	const { featureTypeOntology } = apolloDataStore.ontologyManager;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	const isTranscript = featureTypeOntology.isTypeOf(feature.type, "transcript");
	const featureID = feature.attributes.get("gff_id")?.toString();
	if (featureID && filteredTranscripts.includes(featureID)) return;
	const { bp, refName, regionNumber, x } = mousePosition;
	const { lgv } = stateModel;
	if (isTranscript) {
		const transcript = feature;
		if (!transcript.children) return;
		const exonChildren = [];
		const cdsChildren = [];
		for (const child of transcript.children.values()) {
			const childIsExon = featureTypeOntology.isTypeOf(child.type, "exon");
			const childIsCDS = featureTypeOntology.isTypeOf(child.type, "CDS");
			if (childIsExon) exonChildren.push(child);
			else if (childIsCDS) cdsChildren.push(child);
		}
		const overlappingExon = exonChildren.find((child) => {
			const [start, end] = (0, _jbrowse_core_util.intersection2)(bp, bp + 1, child.min, child.max);
			return start !== void 0 && end !== void 0;
		});
		if (overlappingExon) {
			const minMax = getMinAndMaxPx(overlappingExon, refName, regionNumber, lgv);
			if (minMax) {
				const overlappingEdge = getOverlappingEdge(overlappingExon, x, minMax);
				if (overlappingEdge) return overlappingEdge;
			}
		}
		for (const loc of transcript.cdsLocations) for (const cds of loc) {
			const minMax = getMinAndMaxPx(cds, refName, regionNumber, lgv);
			if (minMax) {
				const overlappingCDS = cdsChildren.find((child) => {
					const [start, end] = (0, _jbrowse_core_util.intersection2)(bp, bp + 1, child.min, child.max);
					return start !== void 0 && end !== void 0;
				});
				if (overlappingCDS) {
					const overlappingEdge = getOverlappingEdge(overlappingCDS, x, minMax);
					if (overlappingEdge) return overlappingEdge;
				}
			}
		}
	}
}
function drawTooltip(display, context) {
	const { hoveredFeature, apolloRowHeight, filteredTranscripts, lgv, session, showFeatureLabels, theme } = display;
	if (!hoveredFeature) return;
	const { feature, bp } = hoveredFeature;
	const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	if (!featureTypeOntology.isTypeOf(feature.type, "transcript")) return;
	const { attributes, strand, type } = feature;
	const position = display.getFeatureLayoutPosition(feature);
	if (!position) return;
	const featureID = attributes.get("gff_id")?.toString();
	if (featureID && filteredTranscripts.includes(featureID)) return;
	const { layoutIndex } = position;
	const { bpPerPx, displayedRegions, offsetPx } = lgv;
	const { refName, reversed } = displayedRegions[layoutIndex];
	const rowHeight = apolloRowHeight;
	let location = "Loc: ";
	let cds = void 0;
	for (const loc of feature.cdsLocations) for (const cdsLoc of loc) if (bp >= cdsLoc.min && bp <= cdsLoc.max) {
		cds = cdsLoc;
		break;
	}
	if (!cds) return;
	const { max, min, phase } = cds;
	location += `${min + 1}–${max}`;
	let startPx = (lgv.bpToPx({
		refName,
		coord: reversed ? max : min,
		regionNumber: layoutIndex
	})?.offsetPx ?? 0) - offsetPx;
	const frame = (0, _jbrowse_core_util.getFrame)(min, max, strand ?? 1, phase);
	const row = (showFeatureLabels ? [
		0,
		4,
		2,
		0,
		14,
		12,
		10
	] : [
		0,
		2,
		1,
		0,
		7,
		6,
		5
	]).at(frame);
	if (row === void 0) return;
	const cdsTop = row * rowHeight;
	const cdsWidthPx = (max - min) / bpPerPx;
	const featureType = `Type: ${cds.type}`;
	const featureName = attributes.get("gff_name")?.find((name) => name !== "");
	const textWidth = [context.measureText(featureType).width, context.measureText(location).width];
	if (featureName) textWidth.push(context.measureText(`Parent Type: ${type}`).width, context.measureText(`Parent Name: ${featureName}`).width);
	const maxWidth = Math.max(...textWidth);
	startPx = startPx + cdsWidthPx + 5;
	context.fillStyle = (0, _mui_material.alpha)(theme.palette.text.primary, .7);
	context.fillRect(startPx, cdsTop, maxWidth + 4, textWidth.length === 4 ? 55 : 35);
	context.beginPath();
	context.moveTo(startPx, cdsTop);
	context.lineTo(startPx - 5, cdsTop + 5);
	context.lineTo(startPx, cdsTop + 10);
	context.fill();
	context.fillStyle = theme.palette.background.default;
	let textTop = cdsTop + 12;
	context.fillText(featureType, startPx + 2, textTop);
	if (featureName) {
		textTop = textTop + 12;
		context.fillText(`Parent Type: ${type}`, startPx + 2, textTop);
		textTop = textTop + 12;
		context.fillText(`Parent Name: ${featureName}`, startPx + 2, textTop);
	}
	textTop = textTop + 12;
	context.fillText(location, startPx + 2, textTop);
}
function getContextMenuItems(display, mousePosition) {
	const { apolloInternetAccount: internetAccount, hoveredFeature, changeManager, filteredTranscripts, regions, selectedFeature, session } = display;
	const [region] = regions;
	const currentAssemblyId = display.getAssemblyId(region.assemblyName);
	const menuItems = [];
	const role = internetAccount ? internetAccount.role : "admin";
	const readOnly = !(role && ["admin", "user"].includes(role));
	if (!hoveredFeature) return menuItems;
	const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	if (isMousePositionWithFeature(mousePosition)) {
		const { bp, feature } = mousePosition;
		let featuresUnderClick = getRelatedFeatures(feature, bp);
		if (isCDSFeature(feature, session)) featuresUnderClick = getRelatedFeatures(feature, bp, true);
		for (const feature of featuresUnderClick) {
			const featureID = feature.attributes.get("gff_id")?.toString();
			if (featureID && filteredTranscripts.includes(featureID)) continue;
			const contextMenuItemsForFeature = getContextMenuItemsForFeature(display, feature);
			if (isExonFeature(feature, session)) {
				const adjacentExons = getAdjacentExons(feature, display);
				const lgv = (0, _jbrowse_core_util.getContainingView)(display);
				if (adjacentExons.upstream) {
					const exon = adjacentExons.upstream;
					contextMenuItemsForFeature.push({
						label: "Go to upstream exon",
						icon: getStreamIcon(feature.strand, true, lgv.displayedRegions.at(0)?.reversed),
						onClick: () => {
							lgv.navTo(navToFeatureCenter(exon, .1, lgv.totalBp));
							selectFeatureAndOpenWidget(display, exon);
						}
					});
				}
				if (adjacentExons.downstream) {
					const exon = adjacentExons.downstream;
					contextMenuItemsForFeature.push({
						label: "Go to downstream exon",
						icon: getStreamIcon(feature.strand, false, lgv.displayedRegions.at(0)?.reversed),
						onClick: () => {
							lgv.navTo(navToFeatureCenter(exon, .1, lgv.totalBp));
							selectFeatureAndOpenWidget(display, exon);
						}
					});
				}
				contextMenuItemsForFeature.push({
					label: "Merge exons",
					disabled: readOnly,
					onClick: () => {
						session.queueDialog((doneCallback) => [MergeExons, {
							session,
							handleClose: () => {
								doneCallback();
							},
							changeManager,
							sourceFeature: feature,
							sourceAssemblyId: currentAssemblyId,
							selectedFeature,
							setSelectedFeature: (feature) => {
								display.setSelectedFeature(feature);
							}
						}]);
					}
				}, {
					label: "Split exon",
					disabled: readOnly,
					onClick: () => {
						session.queueDialog((doneCallback) => [SplitExon, {
							session,
							handleClose: () => {
								doneCallback();
							},
							changeManager,
							sourceFeature: feature,
							sourceAssemblyId: currentAssemblyId,
							selectedFeature,
							setSelectedFeature: (feature) => {
								display.setSelectedFeature(feature);
							}
						}]);
					}
				});
			}
			if (featureTypeOntology.isTypeOf(feature.type, "gene")) contextMenuItemsForFeature.push({
				label: "Filter alternate transcripts",
				onClick: () => {
					session.queueDialog((doneCallback) => [FilterTranscripts, {
						handleClose: () => {
							doneCallback();
						},
						sourceFeature: feature,
						filteredTranscripts: (0, _jbrowse_mobx_state_tree.getSnapshot)(filteredTranscripts),
						onUpdate: (forms) => {
							display.updateFilteredTranscripts(forms);
						}
					}]);
				}
			});
			menuItems.push({
				label: feature.type,
				subMenu: contextMenuItemsForFeature
			});
		}
	}
	return menuItems;
}
function onMouseLeave() {}
const geneGlyph = {
	draw,
	drawDragPreview,
	drawOverlay,
	drawTooltip,
	getContextMenuItems,
	getContextMenuItemsForFeature,
	onMouseDown,
	onMouseLeave,
	onMouseMove,
	onMouseUp
};
//#endregion
//#region src/LinearApolloSixFrameDisplay/stateModel/base.ts
const minDisplayHeight = 20;
function baseModelFactory(_pluginManager, configSchema) {
	return _jbrowse_core_pluggableElementTypes.BaseDisplay.named("BaseLinearApolloSixFrameDisplay").props({
		type: _jbrowse_mobx_state_tree.types.literal("LinearApolloSixFrameDisplay"),
		configuration: (0, _jbrowse_core_configuration.ConfigurationReference)(configSchema),
		graphical: true,
		table: false,
		showFeatureLabels: true,
		showStartCodons: false,
		showStopCodons: true,
		showCheckResults: true,
		zoomThreshold: 200,
		heightPreConfig: _jbrowse_mobx_state_tree.types.maybe(_jbrowse_mobx_state_tree.types.refinement("displayHeight", _jbrowse_mobx_state_tree.types.number, (n) => n >= minDisplayHeight)),
		filteredFeatureTypes: _jbrowse_mobx_state_tree.types.array(_jbrowse_mobx_state_tree.types.string)
	}).views((self) => {
		const { configuration, renderProps: superRenderProps } = self;
		return { renderProps() {
			return {
				...superRenderProps(),
				...(0, _jbrowse_core_util_tracks.getParentRenderProps)(self),
				config: configuration.renderer
			};
		} };
	}).volatile(() => ({ scrollTop: 0 })).views((self) => ({
		get lgv() {
			return (0, _jbrowse_core_util.getContainingView)(self);
		},
		get height() {
			if (self.heightPreConfig) return self.heightPreConfig;
			if (self.graphical && self.table) return 500;
			if (self.graphical) return self.showFeatureLabels ? 400 : 200;
			return 300;
		},
		get zoomThresholdSetting() {
			return self.zoomThreshold ?? (0, _jbrowse_core_configuration.getConf)(self, "zoomThreshold");
		}
	})).views((self) => ({
		get rendererTypeName() {
			return self.configuration.renderer.type;
		},
		get session() {
			return (0, _jbrowse_core_util.getSession)(self);
		},
		get regions() {
			return self.lgv.dynamicBlocks.contentBlocks.map(({ assemblyName, end, refName, start }) => ({
				assemblyName,
				refName,
				start: Math.round(start),
				end: Math.round(end)
			}));
		},
		regionCannotBeRendered() {
			if (self.lgv && self.lgv.bpPerPx >= self.zoomThreshold) return "Zoom in to see annotations";
		}
	})).views((self) => ({
		get apolloInternetAccount() {
			const [region] = self.regions;
			const { internetAccounts } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
			const { assemblyName } = region;
			const { assemblyManager } = self.session;
			const assembly = assemblyManager.get(assemblyName);
			if (!assembly) throw new Error(`No assembly found with name ${assemblyName}`);
			const { internetAccountConfigId } = (0, _jbrowse_core_configuration.getConf)(assembly, ["sequence", "metadata"]);
			return internetAccounts.find((ia) => (0, _jbrowse_core_configuration.getConf)(ia, "internetAccountId") === internetAccountConfigId);
		},
		get changeManager() {
			return self.session.apolloDataStore.changeManager;
		},
		getAssemblyId(assemblyName) {
			const { assemblyManager } = self.session;
			const assembly = assemblyManager.get(assemblyName);
			if (!assembly) throw new Error(`Could not find assembly named ${assemblyName}`);
			return assembly.name;
		},
		get selectedFeature() {
			return self.session.apolloSelectedFeature;
		},
		get hoveredFeature() {
			return self.session.apolloHoveredFeature;
		}
	})).actions((self) => ({
		setScrollTop(scrollTop) {
			self.scrollTop = scrollTop;
		},
		setHeight(displayHeight) {
			self.heightPreConfig = Math.max(displayHeight, minDisplayHeight);
			return self.height;
		},
		resizeHeight(distance) {
			const oldHeight = self.height;
			return this.setHeight(self.height + distance) - oldHeight;
		},
		showGraphicalOnly() {
			self.graphical = true;
			self.table = false;
		},
		showTableOnly() {
			self.graphical = false;
			self.table = true;
		},
		showGraphicalAndTable() {
			self.graphical = true;
			self.table = true;
		},
		toggleShowFeatureLabels() {
			self.showFeatureLabels = !self.showFeatureLabels;
		},
		toggleShowStartCodons() {
			self.showStartCodons = !self.showStartCodons;
		},
		toggleShowStopCodons() {
			self.showStopCodons = !self.showStopCodons;
		},
		toggleShowCheckResults() {
			self.showCheckResults = !self.showCheckResults;
		},
		updateFilteredFeatureTypes(types) {
			self.filteredFeatureTypes = (0, _jbrowse_mobx_state_tree.cast)(types);
		},
		setZoomThresholdSetting({ zoomThreshold }) {
			self.zoomThreshold = zoomThreshold;
		}
	})).views((self) => {
		const { filteredFeatureTypes, trackMenuItems: superTrackMenuItems } = self;
		return { trackMenuItems() {
			const { graphical, table, showFeatureLabels, showStartCodons, showStopCodons, showCheckResults } = self;
			return [
				...superTrackMenuItems(),
				{
					type: "subMenu",
					label: "Appearance",
					subMenu: [
						{
							label: "Show graphical display",
							type: "radio",
							checked: graphical && !table,
							onClick: () => {
								self.showGraphicalOnly();
							}
						},
						{
							label: "Show table display",
							type: "radio",
							checked: table && !graphical,
							onClick: () => {
								self.showTableOnly();
							}
						},
						{
							label: "Show both graphical and table display",
							type: "radio",
							checked: table && graphical,
							onClick: () => {
								self.showGraphicalAndTable();
							}
						},
						{
							label: "Feature Labels",
							type: "checkbox",
							checked: showFeatureLabels,
							onClick: () => {
								self.toggleShowFeatureLabels();
							}
						},
						{
							label: "Show start codons",
							type: "checkbox",
							checked: showStartCodons,
							onClick: () => {
								self.toggleShowStartCodons();
							}
						},
						{
							label: "Show stop codons",
							type: "checkbox",
							checked: showStopCodons,
							onClick: () => {
								self.toggleShowStopCodons();
							}
						},
						{
							label: "Check Results",
							type: "checkbox",
							checked: showCheckResults,
							onClick: () => {
								self.toggleShowCheckResults();
							}
						},
						{
							label: "Change zoom threshold",
							onClick: () => {
								(0, _jbrowse_core_util.getSession)(self).queueDialog((handleClose) => [EditZoomThresholdDialog, {
									model: self,
									handleClose
								}]);
							}
						}
					]
				},
				{
					label: "Filter features by type",
					onClick: () => {
						const { session } = self;
						self.session.queueDialog((doneCallback) => [FilterFeatures, {
							session,
							handleClose: () => {
								doneCallback();
							},
							featureTypes: (0, _jbrowse_mobx_state_tree.getSnapshot)(filteredFeatureTypes),
							onUpdate: (types) => {
								self.updateFilteredFeatureTypes(types);
							}
						}]);
					}
				}
			];
		} };
	}).actions((self) => ({
		setSelectedFeature(feature) {
			self.session.apolloSetSelectedFeature(feature);
		},
		setHoveredFeature(hoveredFeature) {
			self.session.apolloSetHoveredFeature(hoveredFeature);
		},
		showFeatureDetailsWidget(feature, customWidgetNameAndId) {
			const [region] = self.regions;
			const { assemblyName, refName } = region;
			const assembly = self.getAssemblyId(assemblyName);
			if (!assembly) return;
			const { session } = self;
			const { changeManager } = session.apolloDataStore;
			const [widgetName, widgetId] = customWidgetNameAndId ?? ["ApolloFeatureDetailsWidget", "apolloFeatureDetailsWidget"];
			const apolloFeatureWidget = session.addWidget(widgetName, widgetId, {
				feature,
				assembly,
				refName,
				changeManager
			});
			session.showWidget(apolloFeatureWidget);
		},
		afterAttach() {
			(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)(() => {
				if (!self.lgv.initialized || self.regionCannotBeRendered()) return;
				self.session.apolloDataStore.loadFeatures(self.regions).catch((error) => {
					console.error(error);
				});
				if (self.lgv.bpPerPx <= self.zoomThreshold) self.session.apolloDataStore.loadRefSeq(self.regions).catch((error) => {
					console.error(error);
				});
			}, {
				name: "LinearApolloSixFrameDisplayLoadFeatures",
				delay: 1e3
			}));
		}
	}));
}
//#endregion
//#region src/LinearApolloSixFrameDisplay/stateModel/layouts.ts
function layoutsModelFactory(pluginManager, configSchema) {
	return baseModelFactory(pluginManager, configSchema).named("LinearApolloSixFrameDisplayLayouts").props({ featuresMinMaxLimit: 5e5 }).volatile(() => ({ seenFeatures: mobx.observable.map() })).views((self) => ({
		get featuresMinMax() {
			const { assemblyManager } = self.session;
			return self.lgv.displayedRegions.map((region) => {
				const assembly = assemblyManager.get(region.assemblyName);
				let min;
				let max;
				const { end, refName, start } = region;
				for (const [, feature] of self.seenFeatures) {
					if (refName !== assembly?.getCanonicalRefName(feature.refSeq) || !(0, _jbrowse_core_util.doesIntersect2)(start, end, feature.min, feature.max) || feature.length > self.featuresMinMaxLimit) continue;
					if (min === void 0) ({min} = feature);
					if (max === void 0) ({max} = feature);
					if (feature.minWithChildren < min) ({min} = feature);
					if (feature.maxWithChildren > max) ({max} = feature);
				}
				if (min !== void 0 && max !== void 0) return [min, max];
			});
		},
		getGlyph(_feature) {
			return geneGlyph;
		},
		featureLabelSpacer(elem) {
			return self.showFeatureLabels ? elem * 2 - 1 : elem;
		}
	})).actions((self) => ({
		addSeenFeature(feature) {
			self.seenFeatures.set(feature._id, feature);
		},
		deleteSeenFeature(featureId) {
			self.seenFeatures.delete(featureId);
		}
	})).views((self) => ({ get geneTrackRowNums() {
		return [4, 5].map((elem) => self.featureLabelSpacer(elem));
	} })).views((self) => ({
		get featureLayouts() {
			const { assemblyManager } = self.session;
			return self.lgv.displayedRegions.map((region, idx) => {
				const assembly = assemblyManager.get(region.assemblyName);
				const featureLayout = /* @__PURE__ */ new Map();
				if (!self.featuresMinMax[idx]) return featureLayout;
				const { end, refName, start } = region;
				for (const [id, feature] of self.seenFeatures.entries()) {
					if (!(0, _jbrowse_mobx_state_tree.isAlive)(feature)) {
						self.deleteSeenFeature(id);
						continue;
					}
					if (refName !== assembly?.getCanonicalRefName(feature.refSeq) || !(0, _jbrowse_core_util.doesIntersect2)(start, end, feature.min, feature.max)) continue;
					const { featureTypeOntology } = self.session.apolloDataStore.ontologyManager;
					if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
					if (looksLikeGene(feature, self.session)) {
						const rowNum = feature.strand == 1 ? self.geneTrackRowNums[0] : self.geneTrackRowNums[1];
						if (!featureLayout.get(rowNum)) featureLayout.set(rowNum, []);
						featureLayout.get(rowNum)?.push({
							rowNum,
							feature
						});
						const { children } = feature;
						if (!children) continue;
						for (const [, child] of children) if (featureTypeOntology.isTypeOf(child.type, "transcript")) {
							const { cdsLocations, strand, children: childrenOfmRNA } = child;
							if (childrenOfmRNA) for (const [, exon] of childrenOfmRNA) {
								if (!featureTypeOntology.isTypeOf(exon.type, "exon")) continue;
								const rowNum = exon.strand == 1 ? self.geneTrackRowNums[0] : self.geneTrackRowNums[1];
								featureLayout.get(rowNum)?.push({
									rowNum,
									feature: exon
								});
							}
							for (const cdsRow of cdsLocations) for (const cds of cdsRow) {
								const frame = (0, _jbrowse_core_util.getFrame)(cds.min, cds.max, strand ?? 1, cds.phase);
								const rowNum = (self.showFeatureLabels ? [
									0,
									5,
									3,
									1,
									15,
									13,
									11
								] : [
									0,
									2,
									1,
									0,
									8,
									7,
									6
								]).at(frame);
								if (rowNum === void 0) continue;
								if (!featureLayout.get(rowNum)) featureLayout.set(rowNum, []);
								featureLayout.get(rowNum)?.push({
									rowNum,
									feature: child
								});
							}
						}
					} else continue;
				}
				return featureLayout;
			});
		},
		getFeatureLayoutPosition(feature) {
			const { featureLayouts } = this;
			for (const [idx, layout] of featureLayouts.entries()) for (const [, layoutRow] of layout) for (const { feature: layoutFeature } of layoutRow) if (feature._id === layoutFeature._id) return {
				layoutIndex: idx,
				layoutRow: 0,
				featureRow: 0
			};
		}
	})).views((_self) => ({ get highestRow() {
		return 5;
	} })).actions((self) => ({ afterAttach() {
		(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)(() => {
			if (!self.lgv.initialized || self.regionCannotBeRendered()) return;
			for (const region of self.regions) {
				const features = (self.session.apolloDataStore.assemblies.get(region.assemblyName)?.getByRefName(region.refName))?.features;
				if (!features) continue;
				for (const [, feature] of features) if ((0, _jbrowse_core_util.doesIntersect2)(region.start, region.end, feature.min, feature.max) && !self.seenFeatures.has(feature._id)) self.addSeenFeature(feature);
			}
		}, {
			name: "LinearApolloSixFrameDisplaySetSeenFeatures",
			delay: 1e3
		}));
	} }));
}
//#endregion
//#region src/LinearApolloSixFrameDisplay/stateModel/rendering.ts
function drawCodon(ctx, codon, leftPx, index, theme, highContrast, bpPerPx, bp, rowHeight, showFeatureLabels, showStartCodons, showStopCodons) {
	const frameOffsets = (showFeatureLabels ? [
		0,
		4,
		2,
		0,
		14,
		12,
		10
	] : [
		0,
		2,
		1,
		0,
		7,
		6,
		5
	]).map((b) => b * rowHeight);
	for (const strand of [-1, 1]) {
		const frame = (0, _jbrowse_core_util.getFrame)(bp, bp + 3, strand, 0);
		const top = frameOffsets.at(frame);
		if (top === void 0) continue;
		const left = Math.round(leftPx + index / bpPerPx);
		const width = Math.round(3 / bpPerPx) === 0 ? 1 : Math.round(3 / bpPerPx);
		const codonCode = strand === 1 ? codon : (0, _jbrowse_core_util.revcom)(codon);
		const aminoAcidCode = _jbrowse_core_util.defaultCodonTable[codonCode];
		const fillColor = codonColorCode(aminoAcidCode, theme, highContrast);
		if (fillColor && (showStopCodons && aminoAcidCode == "*" || showStartCodons && aminoAcidCode != "*")) {
			ctx.fillStyle = fillColor;
			ctx.fillRect(left, top, width, rowHeight);
		}
	}
}
function renderingModelFactory(pluginManager, configSchema) {
	return layoutsModelFactory(pluginManager, configSchema).named("LinearApolloSixFrameDisplayRendering").props({
		apolloRowHeight: 20,
		detailsMinHeight: 200,
		detailsHeight: 200,
		lastRowTooltipBufferHeight: 120,
		isShown: true,
		filteredTranscripts: _jbrowse_mobx_state_tree.types.array(_jbrowse_mobx_state_tree.types.string)
	}).volatile(() => ({
		canvas: null,
		overlayCanvas: null,
		collaboratorCanvas: null,
		theme: (0, _mui_material.createTheme)()
	})).views((self) => ({ get featuresHeight() {
		return (self.showFeatureLabels ? 2 : 1) * ((self.highestRow + 1) * self.apolloRowHeight) + self.lastRowTooltipBufferHeight;
	} })).actions((self) => ({
		toggleShown() {
			self.isShown = !self.isShown;
		},
		setDetailsHeight(newHeight) {
			self.detailsHeight = self.isShown ? Math.max(Math.min(newHeight, self.height - 100), Math.min(self.height, self.detailsMinHeight)) : newHeight;
		},
		setCanvas(canvas) {
			self.canvas = canvas;
		},
		setOverlayCanvas(canvas) {
			self.overlayCanvas = canvas;
		},
		setCollaboratorCanvas(canvas) {
			self.collaboratorCanvas = canvas;
		},
		setTheme(theme) {
			self.theme = theme;
		}
	})).actions((self) => ({ afterAttach() {
		(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)(() => {
			if (!self.lgv.initialized || self.regionCannotBeRendered()) return;
			const ctx = self.collaboratorCanvas?.getContext("2d");
			if (!ctx) return;
			ctx.clearRect(0, 0, self.lgv.dynamicBlocks.totalWidthPx, self.featuresHeight);
			for (const collaborator of self.session.collaborators) {
				const { locations } = collaborator;
				if (locations.length === 0) continue;
				let idx = 0;
				for (const displayedRegion of self.lgv.displayedRegions) {
					for (const location of locations) {
						if (location.refSeq !== displayedRegion.refName) continue;
						const { end, refSeq, start } = location;
						const locationStartPxInfo = self.lgv.bpToPx({
							refName: refSeq,
							coord: start,
							regionNumber: idx
						});
						if (!locationStartPxInfo) continue;
						const locationStartPx = locationStartPxInfo.offsetPx - self.lgv.offsetPx;
						const locationWidthPx = (end - start) / self.lgv.bpPerPx;
						ctx.fillStyle = "rgba(0,255,0,.2)";
						ctx.fillRect(locationStartPx, 1, locationWidthPx, 100);
						ctx.fillStyle = "black";
						ctx.fillText(collaborator.name, locationStartPx + 1, 11, locationWidthPx - 2);
					}
					idx++;
				}
			}
		}, { name: "LinearApolloSixFrameDisplayRenderCollaborators" }));
		(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)(() => {
			const { apolloRowHeight, canvas, featureLayouts, featuresHeight, lgv, session, theme, showFeatureLabels, showStartCodons, showStopCodons } = self;
			if (!lgv.initialized || self.regionCannotBeRendered()) return;
			const { bpPerPx, offsetPx, displayedRegions, dynamicBlocks } = lgv;
			const ctx = canvas?.getContext("2d");
			if (!ctx) return;
			ctx.clearRect(0, 0, dynamicBlocks.totalWidthPx, featuresHeight);
			for (const [idx, featureLayout] of featureLayouts.entries()) {
				const displayedRegion = displayedRegions[idx];
				for (const [row, featureLayoutRow] of featureLayout.entries()) for (const { feature } of featureLayoutRow) {
					if (!looksLikeGene(feature, self.session)) continue;
					if (!(0, _jbrowse_core_util.doesIntersect2)(displayedRegion.start, displayedRegion.end, feature.min, feature.max)) continue;
					const { topLevelFeature } = feature;
					const glyph = self.getGlyph(topLevelFeature);
					if (glyph !== void 0) glyph.draw(ctx, topLevelFeature, row, self, idx);
				}
			}
			if (showStartCodons || showStopCodons) {
				const { apolloDataStore } = session;
				for (const block of dynamicBlocks.contentBlocks) {
					const ref = apolloDataStore.assemblies.get(block.assemblyName)?.getByRefName(block.refName);
					const roundedStart = Math.floor(block.start);
					let seq = ref?.getSequence(roundedStart, Math.ceil(block.end));
					if (!seq) break;
					seq = seq.toUpperCase();
					const baseOffsetPx = (block.start - roundedStart) / bpPerPx;
					const seqLeftPx = Math.round(block.offsetPx - offsetPx - baseOffsetPx);
					for (let i = 0; i < seq.length; i++) {
						const bp = roundedStart + i;
						drawCodon(ctx, seq.slice(i, i + 3), seqLeftPx, i, theme, true, bpPerPx, bp, apolloRowHeight, showFeatureLabels, showStartCodons, showStopCodons);
					}
				}
			}
		}, { name: "LinearApolloSixFrameDisplayRenderFeatures" }));
	} }));
}
//#endregion
//#region src/LinearApolloSixFrameDisplay/stateModel/mouseEvents.ts
function mouseEventsModelIntermediateFactory(pluginManager, configSchema) {
	return renderingModelFactory(pluginManager, configSchema).named("LinearApolloSixFrameDisplayMouseEvents").volatile(() => ({
		apolloDragging: null,
		cursor: void 0
	})).views((self) => ({ getMousePosition(event) {
		const mousePosition = getMousePosition$1(event, self.lgv);
		const { bp, regionNumber, y } = mousePosition;
		const row = Math.floor(y / self.apolloRowHeight) + 1;
		const layoutRow = self.featureLayouts[regionNumber].get(row);
		if (!layoutRow) return mousePosition;
		const { featureTypeOntology } = self.session.apolloDataStore.ontologyManager;
		if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
		const foundFeature = self.geneTrackRowNums.includes(row) ? layoutRow.find((f) => f.feature.type == "exon" && bp >= f.feature.min && bp <= f.feature.max) ?? layoutRow.find((f) => bp >= f.feature.min && bp <= f.feature.max) : layoutRow.find((f) => {
			const { feature } = f;
			const featureID = feature.attributes.get("gff_id")?.toString();
			if (!featureTypeOntology.isTypeOf(feature.type, "transcript")) return false;
			for (const loc of feature.cdsLocations) for (const cds of loc) {
				const frame = (0, _jbrowse_core_util.getFrame)(cds.min, cds.max, feature.strand ?? 1, cds.phase);
				const rowNum = (self.showFeatureLabels ? [
					0,
					5,
					3,
					1,
					15,
					13,
					11
				] : [
					0,
					2,
					1,
					0,
					8,
					7,
					6
				]).at(frame);
				if (row === rowNum && bp >= cds.min && bp <= cds.max) return featureID === void 0 || !self.filteredTranscripts.includes(featureID);
			}
			return false;
		});
		if (!foundFeature) return mousePosition;
		const { feature } = foundFeature;
		return {
			...mousePosition,
			feature
		};
	} })).actions((self) => ({
		continueDrag(mousePosition, event) {
			if (!self.apolloDragging) throw new Error("continueDrag() called with no current drag in progress");
			event.stopPropagation();
			self.apolloDragging = {
				...self.apolloDragging,
				current: mousePosition
			};
		},
		setDragging(dragInfo) {
			self.apolloDragging = dragInfo ?? null;
		}
	})).actions((self) => ({
		setCursor(cursor) {
			if (self.cursor !== cursor) self.cursor = cursor;
		},
		updateFilteredTranscripts(forms) {
			self.filteredTranscripts = (0, _jbrowse_mobx_state_tree.cast)(forms);
		}
	})).actions(() => ({ onClick() {} }));
}
function mouseEventsModelFactory(pluginManager, configSchema) {
	return mouseEventsModelIntermediateFactory(pluginManager, configSchema).views((self) => ({ contextMenuItems(event) {
		const { hoveredFeature } = self;
		if (!hoveredFeature) return [];
		const mousePosition = self.getMousePosition(event);
		const { topLevelFeature } = hoveredFeature.feature;
		const glyph = self.getGlyph(topLevelFeature);
		if (isMousePositionWithFeature(mousePosition)) return glyph.getContextMenuItems(self, mousePosition);
		return [];
	} })).actions((self) => ({
		startDrag(mousePosition, feature, edge, shrinkParent = false) {
			self.apolloDragging = {
				start: mousePosition,
				current: mousePosition,
				feature,
				edge,
				shrinkParent
			};
		},
		endDrag() {
			if (!self.apolloDragging) throw new Error("endDrag() called with no current drag in progress");
			const { current, edge, feature, start, shrinkParent } = self.apolloDragging;
			if (Math.abs(current.x - start.x) <= 4) {
				self.setDragging();
				self.setCursor();
				return;
			}
			const { displayedRegions } = self.lgv;
			const assembly = self.getAssemblyId(displayedRegions[start.regionNumber].assemblyName);
			const changes = getPropagatedLocationChanges(feature, current.bp, edge, shrinkParent);
			const change = edge === "max" ? new _apollo_annotation_shared.LocationEndChange({
				typeName: "LocationEndChange",
				changedIds: changes.map((c) => c.featureId),
				changes: changes.map((c) => ({
					featureId: c.featureId,
					oldEnd: c.oldLocation,
					newEnd: c.newLocation
				})),
				assembly
			}) : new _apollo_annotation_shared.LocationStartChange({
				typeName: "LocationStartChange",
				changedIds: changes.map((c) => c.featureId),
				changes: changes.map((c) => ({
					featureId: c.featureId,
					oldStart: c.oldLocation,
					newStart: c.newLocation
				})),
				assembly
			});
			self.changeManager.submit(change);
			self.setDragging();
			self.setCursor();
		}
	})).actions((self) => ({
		onMouseDown(event) {
			const mousePosition = self.getMousePosition(event);
			if (isMousePositionWithFeature(mousePosition)) self.getGlyph(mousePosition.feature).onMouseDown(self, mousePosition, event);
		},
		onMouseMove(event) {
			const mousePosition = self.getMousePosition(event);
			if (self.apolloDragging) {
				self.setCursor("col-resize");
				self.continueDrag(mousePosition, event);
				return;
			}
			if (isMousePositionWithFeature(mousePosition)) self.getGlyph(mousePosition.feature).onMouseMove(self, mousePosition, event);
			else {
				self.setHoveredFeature();
				self.setCursor();
			}
		},
		onMouseLeave(event) {
			self.setDragging();
			self.setHoveredFeature();
			const mousePosition = self.getMousePosition(event);
			if (isMousePositionWithFeature(mousePosition)) self.getGlyph(mousePosition.feature).onMouseLeave(self, mousePosition, event);
		},
		onMouseUp(event) {
			const mousePosition = self.getMousePosition(event);
			if (isMousePositionWithFeature(mousePosition)) self.getGlyph(mousePosition.feature).onMouseUp(self, mousePosition, event);
			else self.setSelectedFeature();
			if (self.apolloDragging) self.endDrag();
		}
	})).actions((self) => ({ afterAttach() {
		(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)(() => {
			if (!self.lgv.initialized || self.regionCannotBeRendered()) return;
			const ctx = self.overlayCanvas?.getContext("2d");
			if (!ctx) return;
			ctx.clearRect(0, 0, self.lgv.dynamicBlocks.totalWidthPx, self.featuresHeight);
			const { apolloDragging, hoveredFeature } = self;
			if (!hoveredFeature) return;
			const glyph = self.getGlyph(hoveredFeature.feature);
			glyph.drawOverlay(self, ctx);
			glyph.drawTooltip(self, ctx);
			if (apolloDragging) self.getGlyph(apolloDragging.feature.topLevelFeature).drawDragPreview(self, ctx);
		}, { name: "LinearApolloSixFrameDisplayRenderMouseoverAndDrag" }));
	} }));
}
//#endregion
//#region src/LinearApolloSixFrameDisplay/stateModel/index.ts
function stateModelFactory(pluginManager, configSchema) {
	return mouseEventsModelFactory(pluginManager, configSchema).props({ tabularEditor: _jbrowse_mobx_state_tree.types.optional(TabularEditorStateModelType, {}) }).named("LinearApolloSixFrameDisplay");
}
//#endregion
//#region src/config.ts
const ApolloPluginConfigurationSchema = (0, _jbrowse_core_configuration.ConfigurationSchema)("ApolloPlugin", {
	ontologies: _jbrowse_mobx_state_tree.types.array(OntologyRecordConfiguration),
	featureTypeOntologyName: {
		description: "Name of the feature type ontology",
		type: "string",
		defaultValue: "Sequence Ontology"
	},
	hasRole: {
		description: "Flag used internally by jbrowse-plugin-apollo",
		type: "boolean",
		defaultValue: false
	},
	skippedAttributesOnCopy: {
		description: "Feature attribute keys to skip when copying features",
		type: "stringArray",
		defaultValue: []
	},
	geneBackgroundColor: {
		description: "Color for feature background",
		type: "string",
		defaultValue: "jexl:geneBackgroundColor(featureType)",
		contextVariable: ["featureType"]
	}
}, { actions: (self) => ({ addOntology(ontologySnapshot) {
	self.ontologies.push(ontologySnapshot);
} }) });
//#endregion
//#region src/components/CreateApolloAnnotation.tsx
const isGeneOrTranscript = (annotationFeature, apolloSessionModel) => {
	const { featureTypeOntology } = apolloSessionModel.apolloDataStore.ontologyManager;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	return featureTypeOntology.isTypeOf(annotationFeature.type, "gene") || featureTypeOntology.isTypeOf(annotationFeature.type, "transcript") || featureTypeOntology.isTypeOf(annotationFeature.type, "pseudogene") || featureTypeOntology.isTypeOf(annotationFeature.type, "pseudogenic_transcript");
};
const isGene = (annotationFeature, apolloSessionModel) => {
	const { featureTypeOntology } = apolloSessionModel.apolloDataStore.ontologyManager;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	return featureTypeOntology.isTypeOf(annotationFeature.type, "gene") || featureTypeOntology.isTypeOf(annotationFeature.type, "pseudogene");
};
const isTranscript = (annotationFeature, apolloSessionModel) => {
	const { featureTypeOntology } = apolloSessionModel.apolloDataStore.ontologyManager;
	if (!featureTypeOntology) throw new Error("featureTypeOntology is undefined");
	return featureTypeOntology.isTypeOf(annotationFeature.type, "transcript") || featureTypeOntology.isTypeOf(annotationFeature.type, "pseudogenic_transcript");
};
function getFeatureName(feature) {
	const { attributes } = feature;
	for (const key of [
		"name",
		"gff_name",
		"transcript_name",
		"gene_name"
	]) {
		const value = attributes?.[key];
		if (value?.[0]) return value[0];
	}
	return "";
}
function getGeneNameOrId(feature) {
	const { attributes } = feature;
	for (const key of [
		"gene_name",
		"gene_id",
		"gene_stable_id"
	]) {
		const value = attributes?.[key];
		if (value?.[0]) return value[0];
	}
	return "";
}
function getFeatureId(feature) {
	const { attributes } = feature;
	for (const key of [
		"id",
		"gff_id",
		"transcript_id",
		"gene_id",
		"gene_stable_id",
		"stable_id"
	]) {
		const value = attributes?.[key];
		if (value?.[0]) return value[0];
	}
	return "";
}
const getFeatureNameOrId = (feature) => {
	const name = getFeatureName(feature);
	const id = getFeatureId(feature);
	if (name) return `${feature.type} - ${name}`;
	if (id) return `${feature.type} - ${id}`;
	return feature.type;
};
function CreateApolloAnnotation({ annotationFeature, assembly, handleClose, refSeqId, session, region }) {
	const apolloSessionModel = session;
	const configuredSkippedAttributes = (0, _jbrowse_core_configuration.readConfObject)(apolloSessionModel.getPluginConfiguration(), "skippedAttributesOnCopy");
	const skippedAttributesOnCopy = new Set(configuredSkippedAttributes ?? []);
	const { featureTypeOntology } = apolloSessionModel.apolloDataStore.ontologyManager;
	const childIds = (0, react.useMemo)(() => Object.keys(annotationFeature.children ?? {}), [annotationFeature]);
	const [parentFeatureChecked, setParentFeatureChecked] = (0, react.useState)(true);
	const [checkedChildrens, setCheckedChildrens] = (0, react.useState)(childIds);
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const [destinationFeatures, setDestinationFeatures] = (0, react.useState)([]);
	const [createNewGene, setCreateNewGene] = (0, react.useState)(false);
	const [selectedDestinationFeature, setSelectedDestinationFeature] = (0, react.useState)();
	const refSeq = apolloSessionModel.apolloDataStore.assemblies.get(assembly.name)?.refSeqs.get(refSeqId);
	const features = (0, react.useMemo)(() => refSeq?.getFeatures(region.start, region.end), [
		refSeq,
		region.start,
		region.end
	]);
	(0, react.useEffect)(() => {
		const getDestinationFeatures = () => {
			const filteredFeatures = [];
			for (const f of features ?? []) {
				if (f.min > region.end || f.max < region.start) continue;
				if (featureTypeOntology?.isTypeOf(f.type, "gene")) {
					const featureSnapshot = (0, _jbrowse_mobx_state_tree.getSnapshot)(f);
					filteredFeatures.push(featureSnapshot);
				}
			}
			return filteredFeatures;
		};
		setErrorMessage("");
		const destinationFeatures = getDestinationFeatures();
		setDestinationFeatures(destinationFeatures);
		setSelectedDestinationFeature(destinationFeatures[0]);
	}, [
		checkedChildrens,
		featureTypeOntology,
		features,
		parentFeatureChecked,
		region
	]);
	const handleParentFeatureCheck = (event) => {
		const isChecked = event.target.checked;
		setParentFeatureChecked(isChecked);
		setCheckedChildrens(isChecked ? childIds : []);
	};
	const handleChildFeatureCheck = (event, child) => {
		setCheckedChildrens((prevChecked) => event.target.checked ? [...prevChecked, child._id] : prevChecked.filter((childId) => childId !== child._id));
	};
	const handleDestinationFeatureChange = (e) => {
		const selectedFeature = destinationFeatures.find((f) => f._id === e.target.value);
		setSelectedDestinationFeature(selectedFeature);
	};
	const handleCreateApolloAnnotation = async () => {
		if (parentFeatureChecked) {
			if (isGene(annotationFeature, apolloSessionModel)) {
				await copyGeneFeature();
				session.notify("Successfully copied selected gene and transcript(s)", "success");
			}
			if (isTranscript(annotationFeature, apolloSessionModel)) {
				if (selectedDestinationFeature && !createNewGene) {
					const transcripts = {};
					transcripts[annotationFeature._id] = annotationFeature;
					if (selectedDestinationFeature.max < annotationFeature.max || selectedDestinationFeature.min > annotationFeature.min) {
						await extendSelectedDestinationFeatureLocation(Math.min(selectedDestinationFeature.min, annotationFeature.min), Math.max(selectedDestinationFeature.max, annotationFeature.max));
						await copyTranscriptsToDestinationGene(transcripts);
					} else await copyTranscriptsToDestinationGene(transcripts);
					session.notify("Successfully copied selected transcripts to destination gene", "success");
				} else {
					const childrens = {};
					childrens[annotationFeature._id] = annotationFeature;
					await createNewGeneFeatureWithTranscripts(childrens);
					session.notify("Successfully created a new gene with selected transcripts", "success");
				}
			}
		} else {
			if (!annotationFeature.children) return;
			if (selectedDestinationFeature && !createNewGene) {
				const childrens = {};
				for (const childId of checkedChildrens) childrens[childId] = annotationFeature.children[childId];
				const min = Math.min(...Object.values(childrens).map((child) => child.min));
				const max = Math.max(...Object.values(childrens).map((child) => child.max));
				if (selectedDestinationFeature.min > min || selectedDestinationFeature.max < max) {
					await extendSelectedDestinationFeatureLocation(Math.min(selectedDestinationFeature.min, min), Math.max(selectedDestinationFeature.max, max));
					await copyTranscriptsToDestinationGene(childrens);
				} else await copyTranscriptsToDestinationGene(childrens);
				session.notify("Successfully copied transcript to destination gene", "success");
			} else {
				const childrens = {};
				for (const childId of checkedChildrens) childrens[childId] = annotationFeature.children[childId];
				await createNewGeneFeatureWithTranscripts(childrens);
				session.notify("Successfully created a new gene with selected transcript", "success");
			}
		}
		handleClose();
	};
	const copyGeneFeature = async () => {
		const copiedAnnotationFeature = { ...annotationFeature };
		removeSkippedAttributes(copiedAnnotationFeature, skippedAttributesOnCopy);
		let change;
		if (copiedAnnotationFeature.children && checkedChildrens.length !== Object.values(copiedAnnotationFeature.children).length) {
			const childrens = {};
			for (const childId of checkedChildrens) childrens[childId] = copiedAnnotationFeature.children[childId];
			change = new _apollo_annotation_shared.AddFeatureChange({
				changedIds: [annotationFeature._id],
				typeName: "AddFeatureChange",
				assembly: assembly.name,
				addedFeature: {
					...copiedAnnotationFeature,
					children: childrens
				}
			});
		} else change = new _apollo_annotation_shared.AddFeatureChange({
			changedIds: [annotationFeature._id],
			typeName: "AddFeatureChange",
			assembly: assembly.name,
			addedFeature: copiedAnnotationFeature
		});
		await submitChange(change, annotationFeature._id);
	};
	const copyTranscriptsToDestinationGene = async (transcripts) => {
		if (!selectedDestinationFeature) return;
		for (const transcriptId of Object.keys(transcripts)) {
			const transcript = { ...transcripts[transcriptId] };
			removeSkippedAttributes(transcript, skippedAttributesOnCopy);
			transcript.strand = selectedDestinationFeature.strand;
			if (transcript.children) for (const childId of Object.keys(transcript.children)) transcript.children[childId].strand = selectedDestinationFeature.strand;
			const change = new _apollo_annotation_shared.AddFeatureChange({
				parentFeatureId: selectedDestinationFeature._id,
				changedIds: [selectedDestinationFeature._id],
				typeName: "AddFeatureChange",
				assembly: assembly.name,
				addedFeature: transcript
			});
			await submitChange(change, transcriptId);
		}
	};
	const createNewGeneFeatureWithTranscripts = async (childrens) => {
		const copiedChildrens = {};
		for (const [childId, child] of Object.entries(childrens)) {
			const copiedChild = { ...child };
			removeSkippedAttributes(copiedChild, skippedAttributesOnCopy);
			copiedChildrens[childId] = copiedChild;
		}
		const newGeneId = new bson_objectid.default().toHexString();
		const min = Math.min(...Object.values(copiedChildrens).map((child) => child.min));
		const max = Math.max(...Object.values(copiedChildrens).map((child) => child.max));
		const change = new _apollo_annotation_shared.AddFeatureChange({
			changedIds: [newGeneId],
			typeName: "AddFeatureChange",
			assembly: assembly.name,
			addedFeature: {
				_id: newGeneId,
				refSeq: refSeqId,
				min,
				max,
				strand: annotationFeature.strand,
				type: "gene",
				children: copiedChildrens,
				attributes: {
					name: [getGeneNameOrId(annotationFeature)],
					gene_name: [getGeneNameOrId(annotationFeature)]
				}
			}
		});
		await submitChange(change, newGeneId);
	};
	const extendSelectedDestinationFeatureLocation = async (newMin, newMax) => {
		if (!selectedDestinationFeature) return;
		const changes = [];
		if (newMin !== selectedDestinationFeature.min) changes.push(new _apollo_annotation_shared.LocationStartChange({
			typeName: "LocationStartChange",
			changedIds: [selectedDestinationFeature._id],
			featureId: selectedDestinationFeature._id,
			assembly: assembly.name,
			oldStart: selectedDestinationFeature.min,
			newStart: newMin
		}));
		if (newMax !== selectedDestinationFeature.max) changes.push(new _apollo_annotation_shared.LocationEndChange({
			typeName: "LocationEndChange",
			changedIds: [selectedDestinationFeature._id],
			featureId: selectedDestinationFeature._id,
			assembly: assembly.name,
			oldEnd: selectedDestinationFeature.max,
			newEnd: newMax
		}));
		for (const change of changes) await submitChange(change);
	};
	const submitChange = async (change, selectedFeatureId) => {
		await apolloSessionModel.apolloDataStore.changeManager.submit(change).then(() => {
			apolloSessionModel.apolloSetSelectedFeature(selectedFeatureId);
		});
	};
	const handleCreateNewGeneChange = (e) => {
		setCreateNewGene(e.target.checked);
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Create Apollo Annotation",
		handleClose,
		fullWidth: true,
		maxWidth: "sm",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogTitle, {
				fontSize: 15,
				children: "Select the feature to be copied to apollo track"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Box, {
				sx: { ml: 3 },
				children: [isGeneOrTranscript(annotationFeature, apolloSessionModel) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
					control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Checkbox, {
						size: "small",
						checked: parentFeatureChecked,
						onChange: handleParentFeatureCheck
					}),
					label: `${getFeatureNameOrId(annotationFeature)} (${annotationFeature.min + 1}..${annotationFeature.max})`
				}), annotationFeature.children && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Box, {
					sx: {
						display: "flex",
						flexDirection: "column",
						ml: 3
					},
					children: Object.values(annotationFeature.children).filter((child) => isTranscript(child, apolloSessionModel)).map((child) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
						control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Checkbox, {
							size: "small",
							checked: checkedChildrens.includes(child._id),
							onChange: (e) => {
								handleChildFeatureCheck(e, child);
							}
						}),
						label: `${getFeatureNameOrId(child)} (${child.min + 1}..${child.max})`
					}, child._id))
				})]
			}), destinationFeatures.length > 0 && (!parentFeatureChecked && checkedChildrens.length > 0 || parentFeatureChecked && isTranscript(annotationFeature, apolloSessionModel)) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					border: "1px solid #ccc",
					marginTop: 20,
					padding: 10,
					borderRadius: 5
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.Box, {
					sx: { ml: 3 },
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
						variant: "caption",
						fontSize: 12,
						children: "Select the destination feature to copy the selected features"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Box, {
						sx: { mt: 1 },
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Select, {
							labelId: "label",
							style: { width: "100%" },
							value: selectedDestinationFeature?._id ?? "",
							onChange: handleDestinationFeatureChange,
							disabled: createNewGene,
							children: destinationFeatures.map((f) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.MenuItem, {
								value: f._id,
								children: `${getFeatureNameOrId(f)} (${f.min + 1}..${f.max})`
							}, f._id))
						})
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Box, {
					sx: { ml: 3 },
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormGroup, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
						control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Checkbox, {
							checked: createNewGene,
							onChange: handleCreateNewGeneChange
						}),
						label: "Create new gene"
					}) })
				})]
			})] }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "contained",
				type: "submit",
				disabled: checkedChildrens.length === 0 || !parentFeatureChecked && checkedChildrens.length > 0 && !selectedDestinationFeature,
				onClick: handleCreateApolloAnnotation,
				children: "Create"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
				variant: "outlined",
				type: "submit",
				onClick: handleClose,
				children: "Cancel"
			})] }),
			errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContent, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
				color: "error",
				children: errorMessage
			}) }) : null
		]
	});
}
//#endregion
//#region src/menus/Icons.tsx
function Apollo(props) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.SvgIcon, {
		viewBox: "0 0 856 855",
		style: {
			fontSize: 18,
			marginRight: 4
		},
		...props,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", { children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
				style: {
					opacity: .68,
					fill: "#AEAEAE"
				},
				d: "M276.7,656.9l85-148h102.9c23.1,0,16.1-16,11.1-25l-134-238.5l85-148l185,315.6c0,0-15-26.3,0,0\n			c53,92.9-24,243.9-132,243.9c-6,0-4,0-6.4,0H276.7z"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("polygon", {
				style: {
					opacity: .85,
					fill: "#717171"
				},
				points: "49.7,756.9 219.1,756.9 513.7,246.9 425.7,99.9 		"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("polygon", {
				style: {
					opacity: .85,
					fill: "#717171"
				},
				points: "630,756.9 806.4,756.9 513.7,246.9 425.1,400.2 		"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("polygon", {
				style: { fill: "#C6C6C6" },
				points: "175.7,657.3 195.6,657.3 277.9,508.9 254.1,508.9 170.6,657.3 		"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("polygon", {
				style: { fill: "#C6C6C6" },
				points: "369.7,657.3 389.6,657.3 471.9,508.9 448.1,508.9 364.6,657.3 		"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("polygon", {
				style: { fill: "#C6C6C6" },
				points: "321.7,657.3 341.6,657.3 423.9,508.9 400.1,508.9 316.6,657.3 		"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("polygon", {
				style: { fill: "#C6C6C6" },
				points: "224.7,657.3 244.6,657.3 326.9,508.9 303.1,508.9 219.6,657.3 		"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("polygon", {
				style: { fill: "#C6C6C6" },
				points: "273.7,657.3 293.6,657.3 375.9,508.9 352.1,508.9 268.6,657.3 		"
			})
		] })
	});
}
//#endregion
//#region src/extensions/annotationFromPileup.ts
function parseCigar(cigar) {
	const regex = /(\d+)([MIDNSHPX=])/g;
	const result = [];
	let match;
	while ((match = regex.exec(cigar)) !== null) result.push([match[2], Number.parseInt(match[1], 10)]);
	return result;
}
function annotationFromPileup(pluggableElement) {
	if (pluggableElement.name !== "LinearPileupDisplay") return pluggableElement;
	const { stateModel } = pluggableElement;
	pluggableElement.stateModel = stateModel.views((self) => ({
		getFirstRegion() {
			return (0, _jbrowse_core_util.getContainingView)(self).dynamicBlocks.contentBlocks[0];
		},
		getAssembly() {
			const firstRegion = this.getFirstRegion();
			const { assemblyManager } = (0, _jbrowse_core_util.getSession)(self);
			const { assemblyName } = firstRegion;
			const assembly = assemblyManager.get(assemblyName);
			if (!assembly) throw new Error(`Could not find assembly named ${assemblyName}`);
			return assembly;
		},
		getAnnotationFeature(jbrowseFeature, refSeqId) {
			const start = jbrowseFeature.get("start");
			const end = jbrowseFeature.get("end");
			const name = jbrowseFeature.get("name");
			let strand;
			const { ts, TS, XS } = jbrowseFeature.get("tags");
			for (const tag of [
				ts,
				TS,
				XS
			]) if (!strand && tag) {
				if ([
					1,
					"1",
					"+"
				].includes(tag)) strand = 1;
				else if ([
					-1,
					"-1",
					"-"
				].includes(tag)) strand = -1;
			}
			strand ??= jbrowseFeature.get("strand");
			const ops = parseCigar(jbrowseFeature.get("CIGAR"));
			let position = start;
			let currentExonStart;
			const exons = [];
			for (const [op, len] of ops) switch (op) {
				case "M":
				case "=":
				case "X":
					currentExonStart ??= position;
					position += len;
					break;
				case "N":
					if (currentExonStart !== void 0) {
						exons.push({
							start: currentExonStart,
							end: position
						});
						currentExonStart = void 0;
					}
					position += len;
					break;
				case "D":
					position += len;
					break;
				case "I":
				case "S":
				case "H":
				case "P": break;
				default: throw new Error(`Unknown CIGAR operation: ${op}`);
			}
			if (currentExonStart !== void 0) exons.push({
				start: currentExonStart,
				end: position
			});
			const newFeature = {
				_id: (0, bson_objectid.default)().toHexString(),
				refSeq: refSeqId,
				min: start,
				max: end,
				type: "mRNA",
				strand
			};
			if (name) {
				newFeature.attributes = {};
				newFeature.attributes.gff_name = [name];
			}
			if (exons.length === 0) return newFeature;
			newFeature.children = {};
			for (const exon of exons) {
				const newExon = {
					_id: (0, bson_objectid.default)().toHexString(),
					refSeq: refSeqId,
					min: exon.start,
					max: exon.end,
					type: "exon",
					strand
				};
				newFeature.children[newExon._id] = newExon;
			}
			return newFeature;
		}
	})).views((self) => {
		const superContextMenuItems = self.contextMenuItems;
		return { contextMenuItems() {
			const session = (0, _jbrowse_core_util.getSession)(self);
			const assembly = self.getAssembly();
			const region = self.getFirstRegion();
			const jbrowseFeature = self.contextMenuFeature;
			if (!jbrowseFeature) return superContextMenuItems();
			return [...superContextMenuItems(), {
				label: "Create Apollo annotation",
				icon: Apollo,
				onClick: async () => {
					const backendDriver = session.apolloDataStore.getBackendDriver(region.assemblyName);
					let refSeqId = region.refName;
					if (backendDriver instanceof CollaborationServerDriver) {
						const backendRefSeqId = await backendDriver.getRefSeqId(region.assemblyName, region.refName);
						if (!backendRefSeqId) throw new Error(`Could not find refSeq for "${region.refName}"`);
						refSeqId = backendRefSeqId;
					}
					session.queueDialog((doneCallback) => [CreateApolloAnnotation, {
						session,
						handleClose: () => {
							doneCallback();
						},
						annotationFeature: self.getAnnotationFeature(jbrowseFeature, refSeqId),
						assembly,
						refSeqId,
						region
					}]);
				}
			}];
		} };
	});
	return pluggableElement;
}
//#endregion
//#region src/extensions/annotationFromJBrowseFeature.ts
function simpleFeatureToGFF3Feature(feature, refSeqId) {
	const children = feature.get("subfeatures");
	return [{
		start: feature.get("start") + 1,
		end: feature.get("end"),
		seq_id: refSeqId,
		source: feature.get("source") ?? null,
		type: feature.get("type") ?? null,
		score: feature.get("score") ?? null,
		strand: feature.get("strand") ? feature.get("strand") === 1 ? "+" : "-" : null,
		phase: feature.get("phase") !== null || feature.get("phase") !== void 0 ? feature.get("phase") : null,
		attributes: convertFeatureAttributes(feature),
		derived_features: [],
		child_features: children ? children.map((x) => simpleFeatureToGFF3Feature(x, refSeqId)) : []
	}];
}
function jbrowseFeatureToAnnotationFeature(feature, refSeqId) {
	return (0, _apollo_annotation_shared.gff3ToAnnotationFeature)(simpleFeatureToGFF3Feature(feature, refSeqId));
}
const fieldsToSkip = /* @__PURE__ */ new Set([
	"start",
	"end",
	"type",
	"strand",
	"refName",
	"subfeatures",
	"derived_features",
	"phase",
	"source",
	"score",
	"parent",
	"__jbrowsefmt",
	"length",
	"position",
	"uniqueId",
	"exonFrames",
	"parentId",
	"thickStart",
	"thickEnd",
	"_lineHash"
]);
const fieldsToRename = {
	id: "gff_id",
	name: "gff_name",
	alias: "gff_alias",
	target: "gff_target",
	gap: "gff_gap",
	derives_from: "gff_derives_from",
	note: "gff_note",
	dbxref: "gff_dbxref",
	ontology_term: "gff_ontology_term",
	is_circular: "gff_is_circular"
};
function convertFeatureAttributes(feature) {
	const attributes = {};
	for (const [originalKey, value] of Object.entries(feature.toJSON())) {
		if (fieldsToSkip.has(originalKey)) continue;
		const key = fieldsToRename[originalKey] ?? originalKey;
		attributes[key] = Array.isArray(value) ? value.map(String) : [String(value)];
	}
	return attributes;
}
function getTopLevelSimpleFeature(feature) {
	let topLevel = feature;
	let parent = feature.get("parent");
	while (parent) {
		topLevel = parent;
		parent = parent.get("parent");
	}
	return topLevel;
}
function annotationFromJBrowseFeature(pluggableElement) {
	if (pluggableElement.name !== "LinearBasicDisplay") return pluggableElement;
	const { stateModel } = pluggableElement;
	pluggableElement.stateModel = stateModel.views((self) => ({
		getFirstRegion() {
			return (0, _jbrowse_core_util.getContainingView)(self).dynamicBlocks.contentBlocks[0];
		},
		getAssembly() {
			const firstRegion = self.getFirstRegion();
			const { assemblyManager } = (0, _jbrowse_core_util.getSession)(self);
			const { assemblyName } = firstRegion;
			const assembly = assemblyManager.get(assemblyName);
			if (!assembly) throw new Error(`Could not find assembly named ${assemblyName}`);
			return assembly;
		}
	})).views((self) => {
		const superContextMenuItems = self.contextMenuItems;
		return { contextMenuItems() {
			const session = (0, _jbrowse_core_util.getSession)(self);
			const assembly = self.getAssembly();
			const region = self.getFirstRegion();
			const feature = self.contextMenuFeature;
			if (!feature) return superContextMenuItems();
			const topLevelFeature = getTopLevelSimpleFeature(feature);
			return [...superContextMenuItems(), {
				label: "Create Apollo annotation",
				icon: Apollo,
				onClick: async () => {
					const backendDriver = session.apolloDataStore.getBackendDriver(region.assemblyName);
					let refSeqId = region.refName;
					if (backendDriver instanceof CollaborationServerDriver) {
						const backendRefSeqId = await backendDriver.getRefSeqId(region.assemblyName, region.refName);
						if (!backendRefSeqId) throw new Error(`Could not find refSeq for "${region.refName}"`);
						refSeqId = backendRefSeqId;
					}
					const annotationFeature = jbrowseFeatureToAnnotationFeature(topLevelFeature, refSeqId);
					session.queueDialog((doneCallback) => [CreateApolloAnnotation, {
						session,
						handleClose: () => {
							doneCallback();
						},
						annotationFeature,
						assembly,
						refSeqId,
						region
					}]);
				}
			}];
		} };
	});
	return pluggableElement;
}
//#endregion
//#region src/LinearApolloDisplay/components/CheckResultWarnings.tsx
const CheckResultWarnings = (0, mobx_react.observer)(function CheckResultWarnings({ display }) {
	const { classes } = useStyles$1();
	const { apolloDragging, apolloRowHeight, lgv, session, showCheckResults } = display;
	const { assemblyManager } = session;
	if (!showCheckResults) return null;
	return lgv.dynamicBlocks.contentBlocks.map((block) => {
		const widthBp = lgv.bpPerPx * apolloRowHeight;
		const assembly = assemblyManager.get(block.assemblyName);
		if (!assembly) return null;
		return clusterResultByMessage([...session.apolloDataStore.checkResults.values()].filter((checkResult) => assembly.isValidRefName(checkResult.refSeq) && assembly.getCanonicalRefName(checkResult.refSeq) === block.refName && (0, _jbrowse_core_util.doesIntersect2)(block.start, block.end, checkResult.start, checkResult.end)), widthBp, true).map((checkResult) => {
			const left = Math.round(getLeftPx$1(display, checkResult.range, block));
			const [feature] = checkResult.featureIds;
			if (!feature) return null;
			const top = (display.getRowForFeature(feature) ?? 0) * apolloRowHeight;
			const height = apolloRowHeight;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Tooltip, {
				title: checkResult.message,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Box, {
					className: classes.box,
					style: {
						top,
						left,
						height,
						width: height,
						pointerEvents: apolloDragging ? "none" : "auto"
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Badge, {
						className: classes.badge,
						badgeContent: checkResult.count,
						color: "primary",
						overlap: "circular",
						anchorOrigin: {
							vertical: "bottom",
							horizontal: "right"
						},
						invisible: checkResult.count <= 1,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Avatar, {
							className: classes.avatar,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Error.default, { "data-testid": `ErrorIcon-${checkResult.start}` })
						})
					})
				})
			}, checkResult._id);
		});
	});
});
//#endregion
//#region src/LinearApolloDisplay/components/Tooltip.tsx
const Tooltip$2 = (0, mobx_react.observer)(function Tooltip(props) {
	const { mouseCooordinate, session, dragging } = props;
	const { apolloHoveredFeature } = session;
	if (!(mouseCooordinate && apolloHoveredFeature) || dragging) return;
	const [x, y] = mouseCooordinate;
	const { feature } = apolloHoveredFeature;
	const { attributes, min, max } = feature;
	const location = `Loc: ${min + 1}..${max}`;
	const featureType = `Type: ${feature.type}`;
	const featureName = attributes.get("gff_name")?.find((name) => name !== "");
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_jbrowse_core_ui.BaseTooltip, {
		clientPoint: {
			x,
			y
		},
		placement: "top-start",
		children: [
			featureType,
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("br", {}),
			featureName ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [featureName, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("br", {})] }) : null,
			location
		]
	});
});
//#endregion
//#region src/LinearApolloDisplay/components/OverlayCanvas.tsx
const OverlayCanvas = (0, mobx_react.observer)(function OverlayCanvas(props) {
	const { model } = props;
	const { apolloDragging, cursor, featuresHeight: getFeaturesHeight, isShown, onMouseDown, onMouseLeave, onMouseMove, onMouseUp, session, setOverlayCanvas } = model;
	const { classes } = useStyles$1();
	const lgv = (0, _jbrowse_core_util.getContainingView)(model);
	const [mouseCoord, setMouseCoord] = (0, react.useState)();
	if (!isShown) return null;
	const featuresHeight = getFeaturesHeight(lgv.assemblyNames[0]);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("canvas", {
		ref: async (node) => {
			await Promise.resolve();
			setOverlayCanvas(node);
		},
		width: lgv.dynamicBlocks.totalWidthPx,
		height: featuresHeight,
		onMouseMove: (...args) => {
			const [event] = args;
			setMouseCoord([event.clientX, event.clientY]);
			onMouseMove(...args);
		},
		onMouseLeave: (...args) => {
			setMouseCoord(void 0);
			onMouseLeave(...args);
		},
		onMouseDown,
		onMouseUp,
		className: classes.canvas,
		style: { cursor: cursor ?? "default" },
		"data-testid": "overlayCanvas"
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tooltip$2, {
		mouseCooordinate: mouseCoord,
		session,
		dragging: Boolean(apolloDragging)
	})] });
});
//#endregion
//#region src/LinearApolloDisplay/components/LinearApolloDisplay.tsx
const LinearApolloDisplay = (0, mobx_react.observer)(function LinearApolloDisplay(props) {
	const theme = (0, _mui_material.useTheme)();
	const { model } = props;
	const { loading, contextMenuItems: getContextMenuItems, featuresHeight: getFeaturesHeight, isShown, regionCannotBeRendered, session, setCanvas, setCollaboratorCanvas, setTheme } = model;
	const { classes } = useStyles$1();
	const lgv = (0, _jbrowse_core_util.getContainingView)(model);
	(0, react.useEffect)(() => {
		setTheme(theme);
	}, [theme, setTheme]);
	const [contextCoord, setContextCoord] = (0, react.useState)();
	const [contextMenuItems, setContextMenuItems] = (0, react.useState)([]);
	const message = regionCannotBeRendered();
	if (!isShown) return null;
	const featuresHeight = getFeaturesHeight(lgv.assemblyNames[0]);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: classes.canvasContainer,
		style: {
			width: lgv.dynamicBlocks.totalWidthPx,
			height: featuresHeight
		},
		onContextMenu: (event) => {
			event.preventDefault();
			if (contextMenuItems.length > 0) setContextMenuItems([]);
			else {
				setContextCoord([event.clientX, event.clientY]);
				setContextMenuItems(getContextMenuItems(event));
			}
		},
		children: [
			session.isLocked ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: classes.locked,
				"data-testid": "lock-icon",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Lock.default, {})
			}) : null,
			loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: classes.loading,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.CircularProgress, { size: "18px" })
			}) : null,
			message ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Alert, {
				severity: "warning",
				classes: { message: classes.ellipses },
				slotProps: { root: { className: classes.center } },
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Tooltip, {
					title: message,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: message })
				})
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("canvas", {
					ref: async (node) => {
						await Promise.resolve();
						setCollaboratorCanvas(node);
					},
					width: lgv.dynamicBlocks.totalWidthPx,
					height: featuresHeight,
					className: classes.canvas,
					"data-testid": "collaboratorCanvas"
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("canvas", {
					ref: async (node) => {
						await Promise.resolve();
						setCanvas(node);
					},
					width: lgv.dynamicBlocks.totalWidthPx,
					height: featuresHeight,
					className: classes.canvas,
					"data-testid": "canvas"
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(OverlayCanvas, { model }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckResultWarnings, { display: model }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_jbrowse_core_ui.Menu, {
					open: contextMenuItems.length > 0,
					onMenuItemClick: (_, callback) => {
						callback();
						setContextMenuItems([]);
					},
					onClose: () => {
						setContextMenuItems([]);
					},
					slotProps: { transition: { onExit: () => {
						setContextMenuItems([]);
					} } },
					anchorReference: "anchorPosition",
					anchorPosition: contextCoord ? {
						top: contextCoord[1],
						left: contextCoord[0]
					} : void 0,
					menuItems: contextMenuItems
				})
			] })
		]
	});
});
//#endregion
//#region src/LinearApolloSixFrameDisplay/components/TrackLines.tsx
const TrackLines = (0, mobx_react.observer)(function TrackLines({ model, hrStyle = {
	margin: 0,
	top: 0,
	color: "black"
}, idx }) {
	const { apolloRowHeight, highestRow, showFeatureLabels } = model;
	const featureLabelSpacer = showFeatureLabels ? 2 : 1;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		style: {
			position: "absolute",
			left: 0,
			top: apolloRowHeight * featureLabelSpacer * (highestRow + 1) / 2 + idx * featureLabelSpacer * apolloRowHeight,
			width: "100%"
		},
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("hr", { style: hrStyle })
	});
});
//#endregion
//#region src/LinearApolloSixFrameDisplay/components/LinearApolloSixFrameDisplay.tsx
const LinearApolloSixFrameDisplay = (0, mobx_react.observer)(function LinearApolloSixFrameDisplay(props, apolloDragging) {
	const theme = (0, _mui_material.useTheme)();
	const { model } = props;
	const { apolloRowHeight, contextMenuItems: getContextMenuItems, cursor, featuresHeight, geneTrackRowNums, isShown, onMouseDown, onMouseLeave, onMouseMove, onMouseUp, regionCannotBeRendered, session, setCanvas, setCollaboratorCanvas, setOverlayCanvas, setTheme, showCheckResults, showFeatureLabels } = model;
	const { classes } = useStyles$1();
	const lgv = (0, _jbrowse_core_util.getContainingView)(model);
	(0, react.useEffect)(() => {
		setTheme(theme);
	}, [theme, setTheme]);
	const [contextCoord, setContextCoord] = (0, react.useState)();
	const [contextMenuItems, setContextMenuItems] = (0, react.useState)([]);
	const message = regionCannotBeRendered();
	if (!isShown) return null;
	const { assemblyManager } = session;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: classes.canvasContainer,
		style: {
			width: lgv.dynamicBlocks.totalWidthPx,
			height: featuresHeight
		},
		onContextMenu: (event) => {
			event.preventDefault();
			if (contextMenuItems.length > 0) setContextMenuItems([]);
			else {
				setContextCoord([event.clientX, event.clientY]);
				setContextMenuItems(getContextMenuItems(event));
			}
		},
		children: [session.isLocked ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: classes.locked,
			"data-testid": "lock-icon",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Lock.default, {})
		}) : null, message ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Alert, {
			severity: "warning",
			classes: { message: classes.ellipses },
			slotProps: { root: { className: classes.center } },
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Tooltip, {
				title: message,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: message })
			})
		}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TrackLines, {
				model,
				idx: 0
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TrackLines, {
				model,
				hrStyle: {
					margin: 0,
					top: 0,
					color: "grey",
					opacity: .4
				},
				idx: 1
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TrackLines, {
				model,
				idx: 2
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("canvas", {
				ref: async (node) => {
					await Promise.resolve();
					setCollaboratorCanvas(node);
				},
				width: lgv.dynamicBlocks.totalWidthPx,
				height: featuresHeight,
				className: classes.canvas,
				"data-testid": "collaboratorCanvas"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("canvas", {
				ref: async (node) => {
					await Promise.resolve();
					setCanvas(node);
				},
				width: lgv.dynamicBlocks.totalWidthPx,
				height: featuresHeight,
				className: classes.canvas,
				"data-testid": "canvas"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("canvas", {
				ref: async (node) => {
					await Promise.resolve();
					setOverlayCanvas(node);
				},
				width: lgv.dynamicBlocks.totalWidthPx,
				height: featuresHeight,
				onMouseMove,
				onMouseLeave,
				onMouseDown,
				onMouseUp,
				className: classes.canvas,
				style: { cursor: cursor ?? "default" },
				"data-testid": "overlayCanvas"
			}),
			lgv.displayedRegions.flatMap((region, idx) => {
				const widthBp = lgv.bpPerPx * apolloRowHeight;
				const assembly = assemblyManager.get(region.assemblyName);
				if (showCheckResults) return clusterResultByMessage([...session.apolloDataStore.checkResults.values()].filter((checkResult) => assembly?.isValidRefName(checkResult.refSeq) && assembly.getCanonicalRefName(checkResult.refSeq) === region.refName && (0, _jbrowse_core_util.doesIntersect2)(region.start, region.end, checkResult.start, checkResult.end)), widthBp, true).map((checkResult) => {
					const left = (lgv.bpToPx({
						refName: region.refName,
						coord: checkResult.start,
						regionNumber: idx
					})?.offsetPx ?? 0) - lgv.offsetPx;
					const [feature] = checkResult.featureIds;
					if (!feature?.parent || !looksLikeGene(feature.parent, session)) return null;
					let row;
					for (const loc of feature.cdsLocations) for (const cds of loc) {
						const frame = (0, _jbrowse_core_util.getFrame)(cds.min, cds.max, feature.strand ?? 1, cds.phase);
						const rowNum = (showFeatureLabels ? [
							0,
							5,
							3,
							1,
							15,
							13,
							11
						] : [
							0,
							2,
							1,
							0,
							8,
							7,
							6
						]).at(frame);
						if (rowNum === void 0) continue;
						if (checkResult.start >= cds.min && checkResult.start <= cds.max) {
							row = rowNum - 1;
							break;
						}
					}
					if (row === void 0) row = (feature.strand == 1 ? geneTrackRowNums[0] : geneTrackRowNums[1]) - 1;
					const top = row * apolloRowHeight;
					const height = apolloRowHeight;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Tooltip, {
						title: checkResult.message,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Box, {
							className: classes.box,
							style: {
								top,
								left,
								height,
								width: height,
								pointerEvents: apolloDragging ? "none" : "auto"
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Badge, {
								className: classes.badge,
								badgeContent: checkResult.count,
								color: "primary",
								overlap: "circular",
								anchorOrigin: {
									vertical: "bottom",
									horizontal: "right"
								},
								invisible: checkResult.count <= 1,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Avatar, {
									className: classes.avatar,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_Error.default, { "data-testid": `ErrorIcon-${checkResult.start}` })
								})
							})
						})
					}, checkResult._id);
				});
				return null;
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_jbrowse_core_ui.Menu, {
				open: contextMenuItems.length > 0,
				onMenuItemClick: (_, callback) => {
					callback();
					setContextMenuItems([]);
				},
				onClose: () => {
					setContextMenuItems([]);
				},
				slotProps: { transition: { onExit: () => {
					setContextMenuItems([]);
				} } },
				anchorReference: "anchorPosition",
				anchorPosition: contextCoord ? {
					top: contextCoord[1],
					left: contextCoord[0]
				} : void 0,
				style: { zIndex: theme.zIndex.tooltip },
				menuItems: contextMenuItems
			})
		] })]
	}) });
});
//#endregion
//#region src/makeDisplayComponent.tsx
const accordionControlHeight = 12;
const useStyles = (0, tss_react_mui.makeStyles)()((theme) => ({
	shading: {
		background: (0, _mui_material.alpha)(theme.palette.primary.main, .2),
		overflowX: "hidden"
	},
	details: { background: theme.palette.background.paper },
	accordionControl: {
		height: accordionControlHeight,
		width: "100%",
		"&:hover": { background: theme.palette.action.hover },
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	},
	accordionRoot: { background: theme.palette.divider },
	resizeHandle: {
		width: "100%",
		height: 4,
		position: "absolute",
		cursor: "row-resize",
		zIndex: 100
	},
	expandIcon: {},
	title: { userSelect: "none" },
	alertContainer: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	}
}));
function scrollSelectedFeatureIntoView(model, scrollContainerRef) {
	const { apolloRowHeight, selectedFeature } = model;
	if (scrollContainerRef.current && selectedFeature) {
		let row;
		if ("getFeatureLayoutPosition" in model) {
			const position = model.getFeatureLayoutPosition(selectedFeature);
			if (position) row = position.layoutRow + position.featureRow;
		} else row = model.getRowForFeature(selectedFeature);
		if (row !== void 0) {
			const top = row * apolloRowHeight;
			scrollContainerRef.current.scroll({
				top,
				behavior: "smooth"
			});
		}
	}
}
const ResizeHandle = ({ onResize }) => {
	const { classes } = useStyles();
	const mouseMove = (0, react.useCallback)((event) => {
		event.stopPropagation();
		event.preventDefault();
		onResize(event.movementY);
	}, [onResize]);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		onMouseDown: (event) => {
			event.stopPropagation();
			const controller = new AbortController();
			const { signal } = controller;
			function abortDrag() {
				controller.abort(new DOMException("Canceling drag event listener", "AbortError"));
			}
			globalThis.addEventListener("mousemove", mouseMove, { signal });
			globalThis.addEventListener("mouseup", abortDrag, { signal });
			globalThis.addEventListener("mouseleave", abortDrag, { signal });
		},
		onClick: (e) => {
			e.stopPropagation();
			e.preventDefault();
		},
		className: classes.resizeHandle
	});
};
const AccordionControl = (0, mobx_react.observer)(function AccordionControl({ onClick, onResize, open, title }) {
	const { classes } = useStyles();
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: classes.accordionRoot,
		children: [open && onResize ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ResizeHandle, { onResize }) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: classes.accordionControl,
			onClick,
			children: [open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_ExpandLess.default, { className: classes.expandIcon }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_icons_material_ExpandMore.default, { className: classes.expandIcon }), title ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Typography, {
				className: classes.title,
				variant: "caption",
				component: "span",
				children: title
			}) : null]
		})]
	});
});
const LinearApolloDisplayComponent = (0, mobx_react.observer)(function DisplayComponent({ model, ...other }) {
	const { ontologyManager } = (0, _jbrowse_core_util.getSession)(model).apolloDataStore;
	const { featureTypeOntology } = ontologyManager;
	const ontologyStore = featureTypeOntology?.dataStore;
	const { classes } = useStyles();
	const { graphical, height: overallHeight, isShown, selectedFeature, table, tabularEditor, toggleShown } = model;
	const canvasScrollContainerRef = (0, react.useRef)(null);
	(0, react.useEffect)(() => {
		scrollSelectedFeatureIntoView(model, canvasScrollContainerRef);
	}, [model, selectedFeature]);
	const onDetailsResize = (delta) => {
		model.setDetailsHeight(model.detailsHeight - delta);
	};
	if (!ontologyStore) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: classes.alertContainer,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Alert, {
			severity: "error",
			children: "Could not load feature type ontology."
		})
	});
	if (graphical && table) {
		const tabularHeight = tabularEditor.isShown ? model.detailsHeight : 0;
		const featureAreaHeight = isShown ? overallHeight - model.detailsHeight - 24 : 0;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: { height: overallHeight },
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AccordionControl, {
					open: isShown,
					title: "Graphical",
					onClick: toggleShown
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: classes.shading,
					ref: canvasScrollContainerRef,
					style: { height: featureAreaHeight },
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LinearApolloDisplay, {
						model,
						...other
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AccordionControl, {
					title: "Table",
					open: tabularEditor.isShown,
					onClick: tabularEditor.togglePane,
					onResize: onDetailsResize
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: classes.details,
					style: { height: tabularHeight },
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TabularEditorPane, { model })
				})
			]
		});
	}
	if (graphical) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: classes.shading,
		ref: canvasScrollContainerRef,
		style: { height: overallHeight },
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LinearApolloDisplay, {
			model,
			...other
		})
	});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: classes.details,
		style: { height: overallHeight },
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TabularEditorPane, { model })
	});
});
const LinearApolloSixFrameDisplayComponent = (0, mobx_react.observer)(function DisplayComponent({ model, ...other }) {
	const { ontologyManager } = (0, _jbrowse_core_util.getSession)(model).apolloDataStore;
	const { featureTypeOntology } = ontologyManager;
	const ontologyStore = featureTypeOntology?.dataStore;
	const { classes } = useStyles();
	const { detailsHeight, graphical, height: overallHeight, isShown, selectedFeature, table, tabularEditor, toggleShown } = model;
	const canvasScrollContainerRef = (0, react.useRef)(null);
	(0, react.useEffect)(() => {
		scrollSelectedFeatureIntoView(model, canvasScrollContainerRef);
	}, [model, selectedFeature]);
	const onDetailsResize = (delta) => {
		model.setDetailsHeight(detailsHeight - delta);
	};
	if (!ontologyStore) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: classes.alertContainer,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Alert, {
			severity: "error",
			children: "Could not load feature type ontology."
		})
	});
	if (graphical && table) {
		const tabularHeight = tabularEditor.isShown ? detailsHeight : 0;
		const featureAreaHeight = isShown ? overallHeight - detailsHeight - 24 : 0;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: { height: overallHeight },
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AccordionControl, {
					open: isShown,
					title: "Graphical",
					onClick: toggleShown
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: classes.shading,
					ref: canvasScrollContainerRef,
					style: { height: featureAreaHeight },
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LinearApolloSixFrameDisplay, {
						model,
						...other
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AccordionControl, {
					title: "Table",
					open: tabularEditor.isShown,
					onClick: tabularEditor.togglePane,
					onResize: onDetailsResize
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: classes.details,
					style: { height: tabularHeight },
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TabularEditorPane, { model })
				})
			]
		});
	}
	if (graphical) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: classes.shading,
		ref: canvasScrollContainerRef,
		style: { height: overallHeight },
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LinearApolloSixFrameDisplay, {
			model,
			...other
		})
	});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: classes.details,
		style: { height: overallHeight },
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TabularEditorPane, { model })
	});
});
//#endregion
//#region src/menus/topLevelMenu.ts
function addTopLevelMenus(rootModel) {
	rootModel.insertInMenu("Apollo", {
		label: "Redo",
		icon: _mui_icons_material_Redo.default,
		onClick(session) {
			const { apolloDataStore } = session;
			apolloDataStore.changeManager.redoLastChange();
		}
	}, 0);
	rootModel.insertInMenu("Apollo", {
		label: "Undo",
		icon: _mui_icons_material_Undo.default,
		onClick(session) {
			const { apolloDataStore } = session;
			apolloDataStore.changeManager.undoLastChange();
		}
	}, 0);
	rootModel.appendToMenu("Apollo", {
		label: "Lock/Unlock session",
		onClick: (session) => {
			session.toggleLocked();
		}
	});
	const { internetAccounts } = rootModel;
	if (internetAccounts.some((ia) => isApolloInternetAccount(ia))) rootModel.appendToMenu("Apollo", {
		label: "Log out",
		icon: _mui_icons_material_Logout.default,
		onClick: (session) => {
			session.queueDialog((doneCallback) => [LogOut, {
				session,
				handleClose: () => {
					doneCallback();
				}
			}]);
		}
	});
}
//#endregion
//#region src/ApolloJobModel.ts
const ApolloJobModel = _jbrowse_mobx_state_tree.types.model("JobsManager", {}).views((self) => ({ get jobStatusWidget() {
	const { widgets } = (0, _jbrowse_core_util.getSession)(self);
	return widgets.get("JobsList") ?? (0, _jbrowse_core_util.getSession)(self).addWidget("JobsListWidget", "JobsList");
} })).actions((self) => ({
	/**
	* updates the status message and the progress percent of the provided job
	* @param jobName - the name of the job to be updated
	* @param statusMessage - the message to be communicated to the user
	* @param progressPct - the percent through the run the job is
	*/
	update(jobName, statusMessage, progressPct) {
		self.jobStatusWidget.updateJobStatusMessage(jobName, statusMessage);
		if (progressPct) self.jobStatusWidget.updateJobProgressPct(jobName, progressPct);
	},
	/**
	* aborts the provided job with a message to the user
	* @param jobName - the name of the job to be aborted
	* @param msg - a message to communicate to the user about the abort operation
	*/
	abortJob(jobName, msg) {
		const session = (0, _jbrowse_core_util.getSession)(self);
		if ((0, _jbrowse_core_util.isSessionModelWithWidgets)(session)) {
			session.showWidget(self.jobStatusWidget);
			self.jobStatusWidget.updateJobStatusMessage(jobName, msg ?? "Aborted unexpectedly");
			const indx = self.jobStatusWidget.jobs.findIndex((job) => job.name === jobName);
			self.jobStatusWidget.addAbortedJob({ ...self.jobStatusWidget.jobs[indx] });
			self.jobStatusWidget.removeJob(jobName);
			session.notify("Job aborted", "info");
		}
	},
	/**
	* opens the job status widget and adds the job to the running jobs
	* @param job - the job to be run within the JobsManager
	*/
	runJob(job) {
		const session = (0, _jbrowse_core_util.getSession)(self);
		if ((0, _jbrowse_core_util.isSessionModelWithWidgets)(session)) {
			session.showWidget(self.jobStatusWidget);
			self.jobStatusWidget.addJob(job);
		}
	},
	/**
	* sets the progress and status message of the provided job
	* adds the finished jobs to the list of finished jobs
	* clears the jobs manager of the now done job
	* begins to run the next job if one is queued
	* @param job - the job to be completed
	*/
	done(job) {
		const session = (0, _jbrowse_core_util.getSession)(self);
		if ((0, _jbrowse_core_util.isSessionModelWithWidgets)(session)) {
			session.showWidget(self.jobStatusWidget);
			self.jobStatusWidget.removeJob(job.name);
			self.jobStatusWidget.addFinishedJob({
				name: job.name,
				statusMessage: "All operations successful",
				progressPct: 100,
				cancelCallback: job.cancelCallback
			});
		}
	}
}));
//#endregion
//#region src/session/ClientDataStore.ts
function clientDataStoreFactory(AnnotationFeatureExtended) {
	return _jbrowse_mobx_state_tree.types.model("ClientDataStore", {
		typeName: _jbrowse_mobx_state_tree.types.optional(_jbrowse_mobx_state_tree.types.literal("Client"), "Client"),
		assemblies: _jbrowse_mobx_state_tree.types.map(_apollo_annotation_mst.ApolloAssembly),
		checkResults: _jbrowse_mobx_state_tree.types.map(_apollo_annotation_mst.CheckResult),
		ontologyManager: _jbrowse_mobx_state_tree.types.optional(OntologyManagerType, {})
	}).views((self) => ({
		get internetAccounts() {
			return (0, _jbrowse_mobx_state_tree.getRoot)(self).internetAccounts;
		},
		get pluginConfiguration() {
			return (0, _jbrowse_mobx_state_tree.getRoot)(self).jbrowse.configuration.ApolloPlugin;
		},
		getFeature(featureId) {
			return (0, _jbrowse_mobx_state_tree.resolveIdentifier)(AnnotationFeatureExtended, self.assemblies, featureId);
		}
	})).actions((self) => ({ addAssembly(assemblyId, backendDriverType) {
		const assemblySnapshot = {
			_id: assemblyId,
			refSeqs: {}
		};
		if (backendDriverType) assemblySnapshot.backendDriverType = backendDriverType;
		return self.assemblies.put(assemblySnapshot);
	} })).actions((self) => ({
		addFeature(assemblyId, feature) {
			const { assemblyManager } = (0, _jbrowse_core_util.getSession)(self);
			let apolloAssembly = self.assemblies.get(assemblyId);
			if (!apolloAssembly) {
				if (!assemblyManager.get(assemblyId)) throw new Error(`Could not find assembly "${assemblyId}" to add feature "${feature._id}"`);
				apolloAssembly = self.addAssembly(assemblyId);
			}
			let ref = apolloAssembly.refSeqs.get(feature.refSeq);
			if (!ref) {
				const assembly = assemblyManager.get(assemblyId);
				if (!assembly) throw new Error(`Could not find assembly "${assemblyId}" to add feature "${feature._id}"`);
				const canonicalRefName = assembly.getCanonicalRefName(feature.refSeq);
				if (!canonicalRefName) throw new Error(`Could not find refSeq "${feature.refSeq}" to add feature "${feature._id}"`);
				ref = apolloAssembly.addRefSeq(feature.refSeq, canonicalRefName);
			}
			if (!ref) throw new Error(`Could not find or create refSeq "${feature.refSeq}"`);
			ref.features.put(feature);
		},
		deleteFeature(featureId) {
			const feature = self.getFeature(featureId);
			if (!feature) throw new Error(`Could not find feature "${featureId}" to delete`);
			const { _id, parent } = feature;
			if (parent) parent.deleteChild(featureId);
			else (0, _jbrowse_mobx_state_tree.getParentOfType)(feature, _apollo_annotation_mst.ApolloRefSeq).deleteFeature(_id);
		},
		deleteAssembly(assemblyId) {
			self.assemblies.delete(assemblyId);
		},
		addCheckResult(checkResult) {
			self.checkResults.put(checkResult);
		},
		addCheckResults(checkResults) {
			for (const checkResult of checkResults) if (!self.checkResults.has(checkResult._id)) self.checkResults.put(checkResult);
		},
		deleteCheckResult(checkResultId) {
			self.checkResults.delete(checkResultId);
		},
		clearCheckResults() {
			self.checkResults.clear();
		}
	})).volatile((self) => ({
		changeManager: new ChangeManager(self),
		collaborationServerDriver: new CollaborationServerDriver(self),
		localDriver: new LocalDriver(self)
	})).actions((self) => ({ afterCreate() {
		(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)(() => {
			const { ontologyManager, pluginConfiguration } = self;
			const configuredOntologies = pluginConfiguration.ontologies;
			for (const ont of configuredOntologies || []) {
				const [name, version, source, indexFields] = [
					(0, _jbrowse_core_configuration.readConfObject)(ont, "name"),
					(0, _jbrowse_core_configuration.readConfObject)(ont, "version"),
					(0, _jbrowse_core_configuration.readConfObject)(ont, "source"),
					(0, _jbrowse_core_configuration.readConfObject)(ont, "textIndexFields")
				];
				if (!ontologyManager.findOntology(name)) {
					const { jobsManager } = (0, _jbrowse_core_util.getSession)(self);
					const controller = new AbortController();
					const jobName = `Loading ontology "${name}"`;
					const job = {
						name: jobName,
						statusMessage: `Loading ontology "${name}", version "${version}", this may take a while`,
						progressPct: 0,
						cancelCallback: () => {
							controller.abort(new DOMException(`Canceling loading of ontology "${name}"`, "AbortError"));
							jobsManager.abortJob(job.name);
						}
					};
					const update = (message, progress) => {
						if (progress === 0) {
							jobsManager.runJob(job);
							return;
						}
						if (progress === 100) {
							jobsManager.done(job);
							return;
						}
						jobsManager.update(jobName, message, progress);
					};
					ontologyManager.addOntology(name, version, source, {
						textIndexing: { indexFields },
						update
					});
				}
			}
		}));
	} })).views((self) => ({
		getBackendDriver(assemblyId) {
			const { assemblyManager } = (0, _jbrowse_core_util.getSession)(self);
			const assembly = assemblyManager.get(assemblyId);
			if (!assembly) return;
			const { internetAccountConfigId } = (0, _jbrowse_core_configuration.getConf)(assembly, ["sequence", "metadata"]);
			if (internetAccountConfigId) return self.collaborationServerDriver;
			return self.localDriver;
		},
		getInternetAccount(assemblyName, internetAccountId) {
			if (!(assemblyName ?? internetAccountId)) throw new Error("Must provide either assemblyName or internetAccountId");
			let configId = internetAccountId;
			if (assemblyName && !configId) {
				const { assemblyManager } = (0, _jbrowse_core_util.getSession)(self);
				const assembly = assemblyManager.get(assemblyName);
				if (!assembly) throw new Error(`No assembly found with name ${assemblyName}`);
				({internetAccountConfigId: configId} = (0, _jbrowse_core_configuration.getConf)(assembly, ["sequence", "metadata"]));
			}
			const { internetAccounts } = self;
			const internetAccount = internetAccounts.find((ia) => ia.internetAccountId === configId);
			if (!internetAccount) throw new Error(`No InternetAccount found with config id ${internetAccountId}`);
			return internetAccount;
		}
	})).actions((self) => ({
		loadFeatures: (0, _jbrowse_mobx_state_tree.flow)(function* loadFeatures(regions) {
			for (const region of regions) {
				const backendDriver = self.getBackendDriver(region.assemblyName);
				if (!backendDriver) return;
				const [features, checkResults] = yield backendDriver.getFeatures(region);
				if (features.length === 0) continue;
				const { assemblyName, refName } = region;
				const assembly = self.assemblies.get(assemblyName) ?? self.assemblies.put({
					_id: assemblyName,
					refSeqs: {}
				});
				const [firstFeature] = features;
				const ref = assembly.refSeqs.get(firstFeature.refSeq) ?? assembly.refSeqs.put({
					_id: firstFeature.refSeq,
					name: refName,
					features: {}
				});
				for (const feature of features) if (!ref.features.has(feature._id)) ref.features.put(feature);
				self.addCheckResults(checkResults);
			}
		}),
		loadRefSeq: (0, _jbrowse_mobx_state_tree.flow)(function* loadRefSeq(regions) {
			for (const region of regions) {
				const backendDriver = self.getBackendDriver(region.assemblyName);
				if (!backendDriver) return;
				const { refSeq, seq } = yield backendDriver.getSequence(region);
				const { assemblyName, end, refName, start } = region;
				const assembly = self.assemblies.get(assemblyName) ?? self.assemblies.put({
					_id: assemblyName,
					refSeqs: {}
				});
				(assembly.refSeqs.get(refSeq) ?? assembly.refSeqs.put({
					_id: refSeq,
					name: refName,
					sequence: []
				})).addSequence({
					start,
					stop: end,
					sequence: seq
				});
			}
		})
	}));
}
//#endregion
//#region src/components/DuplicateFeatureDialog.tsx
function reassignIds(feature) {
	const newChildren = {};
	if (feature.children) for (const child of Object.values(feature.children)) {
		const newChild = reassignIds(child);
		newChildren[newChild._id] = newChild;
	}
	return {
		...feature,
		_id: new bson_objectid.default().toHexString(),
		children: feature.children ? newChildren : void 0
	};
}
function DuplicateFeatureDialog({ assemblyName, changeManager, existingFeature, featureSnapshot, handleClose }) {
	const [choice, setChoice] = (0, react.useState)("keepExisting");
	const [errorMessage, setErrorMessage] = (0, react.useState)("");
	const [submitted, setSubmitted] = (0, react.useState)(false);
	const handleSubmit = async () => {
		setErrorMessage("");
		setSubmitted(true);
		try {
			if (choice === "useNew") {
				const deleteChange = new _apollo_annotation_shared.DeleteFeatureChange({
					typeName: "DeleteFeatureChange",
					assembly: assemblyName,
					changedIds: [existingFeature._id],
					deletedFeature: existingFeature
				});
				await changeManager.submit(deleteChange);
				const addChange = new _apollo_annotation_shared.AddFeatureChange({
					typeName: "AddFeatureChange",
					assembly: assemblyName,
					changedIds: [featureSnapshot._id],
					addedFeature: featureSnapshot
				});
				await changeManager.submit(addChange);
			} else if (choice === "keepBoth") {
				const newSnapshot = reassignIds(featureSnapshot);
				const addChange = new _apollo_annotation_shared.AddFeatureChange({
					typeName: "AddFeatureChange",
					assembly: assemblyName,
					changedIds: [newSnapshot._id],
					addedFeature: newSnapshot
				});
				await changeManager.submit(addChange);
			}
			handleClose();
		} catch (error) {
			setErrorMessage(String(error));
			setSubmitted(false);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog$1, {
		open: true,
		title: "Duplicate Feature Detected",
		handleClose,
		maxWidth: "sm",
		fullWidth: true,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContent, { children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogContentText, { children: [
				"A feature with ID “",
				featureSnapshot._id,
				"” already exists. How would you like to resolve this conflict?"
			] }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.FormControl, {
				component: "fieldset",
				sx: { mt: 2 },
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormLabel, {
					component: "legend",
					children: "Resolution"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.RadioGroup, {
					value: choice,
					onChange: (e) => {
						setChoice(e.target.value);
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
							value: "keepExisting",
							control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Radio, {}),
							label: "Keep the existing feature"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
							value: "useNew",
							control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Radio, {}),
							label: "Replace with the new feature"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.FormControlLabel, {
							value: "keepBoth",
							control: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Radio, {}),
							label: "Keep both (assign new IDs to the incoming feature)"
						})
					]
				})]
			}),
			errorMessage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.DialogContentText, {
				color: "error",
				sx: { mt: 1 },
				children: errorMessage
			}) : null
		] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_mui_material.DialogActions, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
			variant: "contained",
			onClick: handleSubmit,
			disabled: submitted,
			children: "Confirm"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_mui_material.Button, {
			onClick: handleClose,
			disabled: submitted,
			children: "Cancel"
		})] })]
	});
}
//#endregion
//#region src/session/handleApolloFeaturesUrlParam.ts
function fromUrlSafeBase64(urlSafeBase64) {
	let base64 = urlSafeBase64.replaceAll("-", "+").replaceAll("_", "/");
	const pad = base64.length % 4;
	if (pad) base64 += "=".repeat(4 - pad);
	return base64;
}
async function decompress(encoded) {
	const binaryString = atob(encoded);
	const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
	const stream = new Blob([bytes]).stream();
	const decompressionStream = new DecompressionStream("gzip");
	const decompressedStream = stream.pipeThrough(decompressionStream);
	const decompressed = await new Response(decompressedStream).arrayBuffer();
	return JSON.parse(new TextDecoder().decode(decompressed));
}
async function handleApolloFeaturesUrlParam(encodedFeatures, apolloDataStore, assemblyManager, session) {
	const featuresData = await decompress(fromUrlSafeBase64(encodedFeatures));
	for (const [assemblyName, featureSnapshots] of Object.entries(featuresData)) {
		if (!(apolloDataStore.getBackendDriver(assemblyName) instanceof LocalDriver)) continue;
		const assembly = await assemblyManager.waitForAssembly(assemblyName);
		if (!assembly) throw new Error(`Assembly not found: "${assemblyName}"`);
		const { regions } = assembly;
		if (!regions) throw new Error(`Assembly not found: "${assemblyName}"`);
		const db = await openDb(assemblyName, regions.map((r) => r.refName));
		for (const featureSnapshot of featureSnapshots) {
			const storeName = `features-${featureSnapshot.refSeq}`;
			const existing = await db.get(storeName, featureSnapshot._id);
			if (existing === void 0) {
				const change = new _apollo_annotation_shared.AddFeatureChange({
					typeName: "AddFeatureChange",
					assembly: assemblyName,
					changedIds: [featureSnapshot._id],
					addedFeature: featureSnapshot
				});
				await apolloDataStore.changeManager.submit(change);
			} else {
				const existingFeature = JSON.parse(JSON.stringify(existing));
				if (!(0, fast_deep_equal_es6.default)(featureSnapshot, existingFeature)) await new Promise((resolve) => {
					session.queueDialog((doneCallback) => [DuplicateFeatureDialog, {
						featureSnapshot,
						existingFeature,
						assemblyName,
						changeManager: apolloDataStore.changeManager,
						handleClose: () => {
							doneCallback();
							resolve();
						}
					}]);
				});
			}
		}
	}
}
//#endregion
//#region src/session/session.ts
function extendSession(pluginManager, sessionModel) {
	const AnnotationFeatureExtended = pluginManager.evaluateExtensionPoint("Apollo-extendAnnotationFeature", _apollo_annotation_mst.AnnotationFeatureModel);
	const ClientDataStore = clientDataStoreFactory(AnnotationFeatureExtended);
	const sm = sessionModel.props({
		apolloDataStore: _jbrowse_mobx_state_tree.types.optional(ClientDataStore, { typeName: "Client" }),
		apolloSelectedFeature: _jbrowse_mobx_state_tree.types.safeReference(AnnotationFeatureExtended),
		jobsManager: _jbrowse_mobx_state_tree.types.optional(ApolloJobModel, {}),
		isLocked: _jbrowse_mobx_state_tree.types.optional(_jbrowse_mobx_state_tree.types.boolean, false),
		changeInProgress: _jbrowse_mobx_state_tree.types.optional(_jbrowse_mobx_state_tree.types.boolean, false)
	}).volatile(() => ({
		apolloHoveredFeature: void 0,
		abortController: new AbortController()
	})).extend(() => {
		const collabs = mobx.observable.array([]);
		return {
			views: { get collaborators() {
				return collabs;
			} },
			actions: { addOrUpdateCollaborator(collaborator) {
				const existingCollaborator = collabs.find((obj) => obj.id === collaborator.id);
				if (existingCollaborator) existingCollaborator.locations = collaborator.locations;
				else collabs.push(collaborator);
			} }
		};
	}).actions((self) => ({
		apolloSetSelectedFeature(feature) {
			self.apolloSelectedFeature = feature;
		},
		apolloSetHoveredFeature(feature) {
			self.apolloHoveredFeature = feature;
		},
		addApolloLocalTrackConfig(assembly) {
			const trackId = `apollo_track_${assembly.name}`;
			if (!self.tracks.some((track) => track.trackId === trackId)) (0, _jbrowse_mobx_state_tree.getRoot)(self).jbrowse.addTrackConf({
				type: "ApolloTrack",
				trackId,
				name: `Annotations (${assembly.displayName})`,
				assemblyNames: [assembly.name],
				category: ["Apollo"]
			});
		},
		toggleLocked() {
			self.isLocked = !self.isLocked;
		},
		setChangeInProgress(changeInProgress) {
			self.changeInProgress = changeInProgress;
		},
		getPluginConfiguration() {
			const { jbrowse } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
			return jbrowse.configuration.ApolloPlugin;
		},
		broadcastLocations() {
			const { internetAccounts } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
			const locations = [];
			for (const view of self.views) {
				if (view.type !== "LinearGenomeView") return;
				const lgv = view;
				if (lgv.initialized) {
					const { dynamicBlocks } = lgv;
					for (const block of dynamicBlocks.contentBlocks) {
						const { assemblyName, end, refName, start } = block;
						if (self.apolloDataStore.assemblies.get(assemblyName)?.backendDriverType === "CollaborationServerDriver") locations.push({
							assemblyName,
							refName,
							start,
							end
						});
					}
				}
			}
			if (locations.length === 0) {
				for (const internetAccount of internetAccounts) if (isApolloInternetAccount(internetAccount)) internetAccount.postUserLocation([]);
				return;
			}
			const allLocations = [];
			for (const internetAccount of internetAccounts) if (isApolloInternetAccount(internetAccount)) {
				for (const location of locations) allLocations.push({
					assemblyId: location.assemblyName,
					refSeq: location.refName,
					start: location.start,
					end: location.end
				});
				internetAccount.postUserLocation(allLocations);
			}
		}
	})).actions((self) => ({ apolloSetEventualSelectedFeature: (0, mobx.flow)(function* apolloSetEventualSelectedFeature(featureId) {
		yield (0, mobx.when)(() => Boolean(self.apolloDataStore.getFeature(featureId)));
		self.apolloSetSelectedFeature(featureId);
	}) })).volatile((self) => ({ previousSnapshot: (0, _jbrowse_mobx_state_tree.getSnapshot)(self) })).actions((self) => ({
		afterCreate() {
			(0, _jbrowse_mobx_state_tree.applySnapshot)(self, {
				name: self.name,
				id: self.id
			});
			const { internetAccounts, jbrowse, reloadPluginManagerCallback } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
			(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)(() => {
				const locations = [];
				for (const view of self.views) {
					if (view.type !== "LinearGenomeView") return;
					const lgv = view;
					if (lgv.initialized) {
						const { dynamicBlocks } = lgv;
						for (const block of dynamicBlocks.contentBlocks) {
							const { assemblyName, end, refName, start } = block;
							if (self.apolloDataStore.assemblies.get(assemblyName)?.backendDriverType === "CollaborationServerDriver") locations.push({
								assemblyName,
								refName,
								start,
								end
							});
						}
					}
				}
				if (locations.length === 0) {
					for (const internetAccount of internetAccounts) if (isApolloInternetAccount(internetAccount)) internetAccount.postUserLocation([]);
					return;
				}
				const allLocations = [];
				for (const internetAccount of internetAccounts) if (isApolloInternetAccount(internetAccount)) {
					for (const location of locations) allLocations.push({
						assemblyId: location.assemblyName,
						refSeq: location.refName,
						start: location.start,
						end: location.end
					});
					internetAccount.postUserLocation(allLocations);
				}
			}, { name: "ApolloSessionBroadcastLocations" }));
			(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)(async (reaction) => {
				const pluginConfiguration = jbrowse.configuration.ApolloPlugin;
				const hasRole = (0, _jbrowse_core_configuration.readConfObject)(pluginConfiguration, "hasRole");
				const featureTypeOntologyName = (0, _jbrowse_core_configuration.readConfObject)(pluginConfiguration, "featureTypeOntologyName");
				const hasApolloInternetAccount = internetAccounts.some((ia) => isApolloInternetAccount(ia));
				const nonApolloAssemblies = self.assemblyManager.assemblies.filter((a) => !(0, _jbrowse_core_configuration.getConf)(a, ["sequence", "metadata"]).apollo);
				if (!hasApolloInternetAccount || hasRole) {
					const { assemblies } = self.assemblyManager;
					if (assemblies.length === 0) return;
					const { pluginConfiguration } = self.apolloDataStore;
					if (!pluginConfiguration.ontologies.find((ont) => (0, _jbrowse_core_configuration.readConfObject)(ont, "name") === featureTypeOntologyName)) pluginConfiguration.addOntology({
						name: "Sequence Ontology",
						version: "01c33c6d9b6c8dca12e7d3e37b49ee113093c2fa",
						source: {
							uri: "https://raw.githubusercontent.com/The-Sequence-Ontology/SO-Ontologies/01c33c6d9b6c8dca12e7d3e37b49ee113093c2fa/Ontology_Files/so.json",
							locationType: "UriLocation"
						}
					});
					for (const a of nonApolloAssemblies) self.addApolloLocalTrackConfig(a);
					(0, _jbrowse_mobx_state_tree.applySnapshot)(self, self.previousSnapshot);
					reaction.dispose();
					return;
				}
				const { signal } = self.abortController;
				for (const internetAccount of internetAccounts) {
					if (internetAccount.type !== "ApolloInternetAccount") continue;
					const { baseURL } = internetAccount;
					const uri = new URL("jbrowse/config.json", baseURL).href;
					const fetch = internetAccount.getFetcher({
						locationType: "UriLocation",
						uri
					});
					let response;
					try {
						response = await fetch(uri, { signal });
					} catch (error) {
						if (error instanceof LoginCancelledError) internetAccount.offerLogin();
						else if (error instanceof LoginFailedError) internetAccount.offerLogin(error);
						else if (!self.abortController.signal.aborted) console.error(error);
						continue;
					}
					if (!response.ok) {
						const errorMessage = await createFetchErrorMessage(response, "Failed to fetch assemblies");
						console.error(errorMessage);
						continue;
					}
					let jbrowseConfig;
					try {
						jbrowseConfig = await response.json();
					} catch (error) {
						console.error(error);
						continue;
					}
					if (!jbrowseConfig.configuration.ApolloPlugin.hasRole) continue;
					reloadPluginManagerCallback(jbrowseConfig, self.previousSnapshot);
					reaction.dispose();
				}
			}, { name: "ApolloSessionLoadConfig" }));
		},
		beforeDestroy() {
			self.abortController.abort(new DOMException("Clean up Apollo session", "AbortError"));
		}
	})).actions((self) => ({
		async afterCreate() {
			if (_jbrowse_core_util.isElectron) return;
			const apolloFeatures = new URL(globalThis.location.href).searchParams.get("apolloFeatures");
			if (!apolloFeatures) return;
			const { assemblyManager } = self;
			await handleApolloFeaturesUrlParam(apolloFeatures, self.apolloDataStore, assemblyManager, self);
			await new Promise((resolve) => setTimeout(resolve, 2e3));
			const updatedURL = new URL(globalThis.location.href);
			updatedURL.searchParams.delete("apolloFeatures");
			globalThis.history.replaceState(null, "", updatedURL.toString());
		},
		afterAttach() {
			(0, _jbrowse_mobx_state_tree.addDisposer)(self, (0, mobx.autorun)((reaction) => {
				const { focusedViewId, activeWidgets } = self;
				if (!(focusedViewId && activeWidgets)) return;
				activeWidgets.get("hierarchicalTrackSelector")?.setView(focusedViewId);
				reaction.dispose();
			}));
		}
	})).views((self) => {
		const superTrackActions = self.getTrackActions;
		return { getTrackActions(conf) {
			if (conf.type === "ApolloTrack" || conf.type === "ReferenceSequenceTrack") return superTrackActions?.(conf);
			const trackId = (0, _jbrowse_core_configuration.readConfObject)(conf, "trackId");
			return trackId.endsWith("-sessionTrack") ? [...superTrackActions?.(conf) ?? [], {
				label: "Save track to Apollo",
				onClick: async () => {
					const { internetAccounts, jbrowse } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
					const currentConfig = (0, _jbrowse_mobx_state_tree.getSnapshot)(jbrowse);
					let filteredConfig;
					filteredConfig = (0, _apollo_annotation_shared.filterJBrowseConfig)(currentConfig);
					if (Object.keys(filteredConfig).length === 0) filteredConfig = void 0;
					const trackConfigSnapshot = (0, _jbrowse_mobx_state_tree.getSnapshot)(conf);
					const newTrackId = trackId.slice(0, trackId.length - 13);
					const newTrackConfigSnapshot = {
						...trackConfigSnapshot,
						trackId: newTrackId
					};
					for (const internetAccount of internetAccounts) {
						if (internetAccount.type !== "ApolloInternetAccount") continue;
						const change = new _apollo_annotation_shared.ImportJBrowseConfigChange({
							typeName: "ImportJBrowseConfigChange",
							oldJBrowseConfig: filteredConfig,
							newJBrowseConfig: {
								...filteredConfig,
								tracks: filteredConfig?.tracks && [...filteredConfig.tracks, newTrackConfigSnapshot]
							}
						});
						const { internetAccountId } = internetAccount;
						await self.apolloDataStore.changeManager.submit(change, { internetAccountId });
						const { notify } = self;
						notify("Track added", "success");
					}
					self.deleteTrackConf(conf);
					jbrowse.addTrackConf(newTrackConfigSnapshot);
				},
				icon: _mui_icons_material_Save.default
			}] : [...superTrackActions?.(conf) ?? [], {
				label: "Remove track from Apollo",
				onClick: async () => {
					const { internetAccounts, jbrowse } = (0, _jbrowse_mobx_state_tree.getRoot)(self);
					const currentConfig = (0, _jbrowse_mobx_state_tree.getSnapshot)(jbrowse);
					let filteredConfig;
					filteredConfig = (0, _apollo_annotation_shared.filterJBrowseConfig)(currentConfig);
					if (Object.keys(filteredConfig).length === 0) filteredConfig = void 0;
					const filteredTracks = filteredConfig?.tracks?.filter((t) => t.trackId !== trackId);
					for (const internetAccount of internetAccounts) {
						if (internetAccount.type !== "ApolloInternetAccount") continue;
						const change = new _apollo_annotation_shared.ImportJBrowseConfigChange({
							typeName: "ImportJBrowseConfigChange",
							oldJBrowseConfig: filteredConfig,
							newJBrowseConfig: {
								...filteredConfig,
								tracks: filteredTracks
							}
						});
						const { internetAccountId } = internetAccount;
						await self.apolloDataStore.changeManager.submit(change, { internetAccountId });
						const { notify } = self;
						notify("Track removed", "success");
					}
					self.deleteTrackConf(conf);
					jbrowse.deleteTrackConf(conf);
				},
				icon: _mui_icons_material_Save.default
			}];
		} };
	});
	return _jbrowse_mobx_state_tree.types.snapshotProcessor(sm, { postProcessor(snap, node) {
		snap.apolloSelectedFeature = void 0;
		snap.changeInProgress = false;
		snap.apolloDataStore = {
			typeName: "Client",
			checkResults: {}
		};
		if (!node) return snap;
		const { apolloDataStore } = node;
		const { checkResults } = apolloDataStore;
		for (const [, cr] of checkResults) {
			const [feature] = cr.ids;
			if (!feature) continue;
		}
		return snap;
	} });
}
//#endregion
//#region src/index.ts
function isApolloMessageData(data) {
	return typeof data === "object" && data !== null && "apollo" in data && data.apollo === true;
}
const inWebWorker = "WorkerGlobalScope" in globalThis;
const supportedJBrowseMajorVersion = 4;
/**
* Throws if this plugin is loaded in a JBrowse it wasn't built for. The JBrowse
* products (web, desktop, React app, etc.) put their version on the root model.
* There's no root model in a worker, but if the version is wrong there it was
* already caught on the main thread.
*/
function checkJBrowseVersion(pluginManager) {
	const { rootModel } = pluginManager;
	if (!rootModel) return;
	const jbrowseVersion = rootModel.version;
	if (typeof jbrowseVersion !== "string") {
		console.warn(`Could not determine JBrowse version. The Apollo plugin requires JBrowse ${supportedJBrowseMajorVersion}.x.x.`);
		return;
	}
	if (Number.parseInt(jbrowseVersion.replace(/^v/, ""), 10) !== supportedJBrowseMajorVersion) throw new Error(`The Apollo plugin (version ${version}) requires JBrowse ${supportedJBrowseMajorVersion}.x.x, but is running in JBrowse ${jbrowseVersion}`);
}
for (const [changeName, change] of Object.entries(_apollo_annotation_shared.changes)) _apollo_annotation_common.changeRegistry.registerChange(changeName, change);
const cdsCheck = new _apollo_annotation_shared.CDSCheck();
_apollo_annotation_common.checkRegistry.registerCheck(cdsCheck.name, cdsCheck);
const transcriptCheck = new _apollo_annotation_shared.TranscriptCheck();
_apollo_annotation_common.checkRegistry.registerCheck(transcriptCheck.name, transcriptCheck);
_apollo_annotation_shared.validationRegistry.registerValidation(new _apollo_annotation_shared.CoreValidation());
_apollo_annotation_shared.validationRegistry.registerValidation(new _apollo_annotation_shared.ParentChildValidation());
var ApolloPlugin = class extends _jbrowse_core_Plugin.default {
	name = "ApolloPlugin";
	version = version;
	configurationSchema = ApolloPluginConfigurationSchema;
	install(pluginManager) {
		installApolloSequenceAdapter(pluginManager);
		installApolloRefNameAliasAdapter(pluginManager);
		installApolloTextSearchAdapter(pluginManager);
		pluginManager.addWidgetType(() => {
			const configSchema = (0, _jbrowse_core_configuration.ConfigurationSchema)("ApolloFeatureDetailsWidget", {});
			return new _jbrowse_core_pluggableElementTypes.WidgetType({
				name: "ApolloFeatureDetailsWidget",
				heading: "Apollo feature details",
				configSchema,
				stateModel: ApolloFeatureDetailsWidgetModel,
				ReactComponent: ApolloFeatureDetailsWidget
			});
		});
		pluginManager.addWidgetType(() => {
			const configSchema = (0, _jbrowse_core_configuration.ConfigurationSchema)("ApolloTranscriptDetails", {});
			return new _jbrowse_core_pluggableElementTypes.WidgetType({
				name: "ApolloTranscriptDetails",
				heading: "Apollo transcript details",
				configSchema,
				stateModel: ApolloTranscriptDetailsModel,
				ReactComponent: ApolloTranscriptDetailsWidget
			});
		});
		pluginManager.addTrackType(() => {
			const configSchema = (0, _jbrowse_core_configuration.ConfigurationSchema)("ApolloTrack", { adapter: "" }, {
				baseConfiguration: (0, _jbrowse_core_pluggableElementTypes.createBaseTrackConfig)(pluginManager),
				explicitIdentifier: "trackId"
			});
			return new _jbrowse_core_pluggableElementTypes.TrackType({
				name: "ApolloTrack",
				configSchema,
				stateModel: (0, _jbrowse_core_pluggableElementTypes.createBaseTrackModel)(pluginManager, "ApolloTrack", configSchema)
			});
		});
		pluginManager.addInternetAccountType(() => {
			return new _jbrowse_core_pluggableElementTypes.InternetAccountType({
				name: "ApolloInternetAccount",
				configSchema: ApolloConfigSchema,
				stateModel: stateModelFactory$3(ApolloConfigSchema)
			});
		});
		pluginManager.addDisplayType(() => {
			const configSchema = configSchema$2;
			return new _jbrowse_core_pluggableElementTypes.DisplayType({
				name: "LinearApolloDisplay",
				configSchema,
				stateModel: stateModelFactory$2(pluginManager, configSchema),
				trackType: "ApolloTrack",
				viewType: "LinearGenomeView",
				ReactComponent: LinearApolloDisplayComponent
			});
		});
		pluginManager.addDisplayType(() => {
			const configSchema$3 = configSchema;
			return new _jbrowse_core_pluggableElementTypes.DisplayType({
				name: "LinearApolloSixFrameDisplay",
				configSchema: configSchema$3,
				stateModel: stateModelFactory(pluginManager, configSchema$3),
				trackType: "ApolloTrack",
				viewType: "LinearGenomeView",
				ReactComponent: LinearApolloSixFrameDisplayComponent
			});
		});
		pluginManager.addDisplayType(() => {
			const configSchema = configSchema$1;
			return new _jbrowse_core_pluggableElementTypes.DisplayType({
				name: "LinearApolloReferenceSequenceDisplay",
				configSchema,
				stateModel: stateModelFactory$1(pluginManager, configSchema),
				displayName: "Apollo reference sequence display",
				trackType: "ReferenceSequenceTrack",
				viewType: "LinearGenomeView",
				ReactComponent: LinearApolloReferenceSequenceDisplay
			});
		});
		pluginManager.addToExtensionPoint("Core-extendSession", extendSession.bind(this, pluginManager));
		pluginManager.addToExtensionPoint("Core-extendPluggableElement", (pluggableElement) => {
			if (pluggableElement.name === "LinearGenomeView") {
				const { stateModel } = pluggableElement;
				pluggableElement.stateModel = stateModel.views((self) => {
					const superRubberBandMenuItems = self.rubberBandMenuItems;
					return { rubberBandMenuItems() {
						return [...superRubberBandMenuItems(), {
							label: "Add new feature",
							icon: _mui_icons_material_Add.default,
							onClick: () => {
								const session = (0, _jbrowse_core_util.getSession)(self);
								const { leftOffset, rightOffset } = self;
								const selectedRegions = self.getSelectedRegions(leftOffset, rightOffset);
								session.queueDialog((doneCallback) => [AddFeature, {
									session,
									handleClose: () => {
										doneCallback();
									},
									region: selectedRegions[0],
									changeManager: session.apolloDataStore.changeManager
								}]);
							}
						}];
					} };
				});
			}
			return pluggableElement;
		});
		pluginManager.addToExtensionPoint("Core-extendPluggableElement", annotationFromPileup);
		pluginManager.addToExtensionPoint("Core-extendPluggableElement", annotationFromJBrowseFeature);
		pluginManager.addToExtensionPoint("Core-preProcessTrackConfig", (snap) => {
			if (snap.type !== "ReferenceSequenceTrack") return snap;
			const displays = snap.displays ?? [];
			const apolloDisplayIdx = displays.findIndex((d) => d.type === "LinearApolloReferenceSequenceDisplay");
			if (apolloDisplayIdx === 0) return snap;
			if (apolloDisplayIdx === -1) return {
				...snap,
				displays: [{
					type: "LinearApolloReferenceSequenceDisplay",
					displayId: `${snap.trackId}-LinearApolloReferenceSequenceDisplay`
				}, ...displays]
			};
			const reorderedDisplays = displays.toSpliced(apolloDisplayIdx, 1);
			reorderedDisplays.unshift({
				type: "LinearApolloReferenceSequenceDisplay",
				displayId: `${snap.trackId}-LinearApolloReferenceSequenceDisplay`
			});
			return {
				...snap,
				displays: reorderedDisplays
			};
		});
		pluginManager.addToExtensionPoint("LinearGenomeView-searchResultSelected", (_, props) => {
			const { session, result } = props;
			const trackId = result.getTrackId();
			const matchedFeature = result.matchedObject;
			if (trackId?.startsWith("apollo_track_") && matchedFeature) session.apolloSetEventualSelectedFeature(matchedFeature._id);
			return _;
		});
		if (!inWebWorker) pluginManager.addToExtensionPoint("Core-extendWorker", (handle) => {
			if (!("on" in handle.client && handle.client.on)) return handle;
			handle.client.on("apollo", async (event) => {
				if (!isApolloMessageData(event)) return;
				const { apollo, messageId, method } = event;
				switch (method) {
					case "getSequence": {
						const { region } = event;
						const { assemblyName } = region;
						const dataStore = (pluginManager.rootModel?.session)?.apolloDataStore;
						if (!dataStore) break;
						const backendDriver = dataStore.getBackendDriver(assemblyName);
						if (!backendDriver) break;
						const { seq: sequence } = await backendDriver.getSequence(region);
						handle.worker.postMessage({
							apollo,
							messageId,
							sequence
						});
						break;
					}
					case "getRegions": {
						const { assembly } = event;
						const dataStore = (pluginManager.rootModel?.session)?.apolloDataStore;
						if (!dataStore) break;
						const backendDriver = dataStore.getBackendDriver(assembly);
						if (!backendDriver) break;
						const regions = await backendDriver.getRegions(assembly);
						handle.worker.postMessage({
							apollo,
							messageId,
							regions
						});
						break;
					}
					case "getRefNameAliases": {
						const { assembly } = event;
						const dataStore = (pluginManager.rootModel?.session)?.apolloDataStore;
						if (!dataStore) break;
						const backendDriver = dataStore.getBackendDriver(assembly);
						if (!backendDriver) break;
						const refNameAliases = await backendDriver.getRefNameAliases(assembly);
						handle.worker.postMessage({
							apollo,
							messageId,
							refNameAliases
						});
						break;
					}
				}
			});
			return handle;
		});
	}
	configure(pluginManager) {
		checkJBrowseVersion(pluginManager);
		if ((0, _jbrowse_core_util.isAbstractMenuManager)(pluginManager.rootModel)) {
			pluginManager.jexl.addFunction("geneBackgroundColor", (featureType) => {
				if (featureType === "pseudogene") return (0, _mui_material.alpha)("rgb(148, 203, 236)", .6);
				if (featureType === "ncRNA_gene") return (0, _mui_material.alpha)("rgb(194, 106, 119)", .6);
			});
			addTopLevelMenus(pluginManager.rootModel);
		}
	}
};
//#endregion
exports.default = ApolloPlugin;

//# sourceMappingURL=jbrowse-plugin-apollo.cjs.development.js.map
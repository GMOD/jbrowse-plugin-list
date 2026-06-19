(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@jbrowse/core/pluggableElementTypes/AdapterType'), require('@jbrowse/core/Plugin'), require('@jbrowse/core/configuration'), require('@jbrowse/core/data_adapters/BaseAdapter'), require('@jbrowse/core/util/rxjs'), require('mobx-state-tree')) :
    typeof define === 'function' && define.amd ? define(['exports', '@jbrowse/core/pluggableElementTypes/AdapterType', '@jbrowse/core/Plugin', '@jbrowse/core/configuration', '@jbrowse/core/data_adapters/BaseAdapter', '@jbrowse/core/util/rxjs', 'mobx-state-tree'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.JBrowsePluginRefGet = {}, global.JBrowseExports["@jbrowse/core/pluggableElementTypes/AdapterType"], global.JBrowseExports["@jbrowse/core/Plugin"], global.JBrowseExports["@jbrowse/core/configuration"], global.JBrowseExports["@jbrowse/core/data_adapters/BaseAdapter"], global.JBrowseExports["@jbrowse/core/util/rxjs"], global.JBrowseExports["mobx-state-tree"]));
})(this, (function (exports, AdapterType, Plugin, configuration, BaseAdapter, rxjs, mobxStateTree) { 'use strict';

    var simpleFeature = {};

    Object.defineProperty(simpleFeature, "__esModule", { value: true });
    simpleFeature.isFeature = isFeature;
    function isFeature(thing) {
        return (typeof thing === 'object' &&
            thing !== null &&
            typeof thing.get === 'function' &&
            typeof thing.id === 'function');
    }
    function isSimpleFeatureSerialized(args) {
        return 'uniqueId' in args && typeof args.data !== 'object';
    }
    class SimpleFeature {
        constructor(args) {
            var _a;
            if (isSimpleFeatureSerialized(args)) {
                this.data = args;
            }
            else {
                this.data = args.data;
                this.parentHandle = args.parent;
            }
            const id = isSimpleFeatureSerialized(args) ? args.uniqueId : args.id;
            if (id === undefined || id === null) {
                throw new Error('SimpleFeature requires a unique `id` or `data.uniqueId` attribute');
            }
            this.uniqueId = String(id);
            if (!(this.data.aliases || this.data.end - this.data.start >= 0)) {
                throw new Error(`invalid feature data, end less than start. end: ${this.data.end} start: ${this.data.start}`);
            }
            if (this.data.subfeatures) {
                this.subfeatures = (_a = this.data.subfeatures) === null || _a === void 0 ? void 0 : _a.map((f, i) => typeof f.get !== 'function'
                    ? new SimpleFeature({
                        id: f.uniqueId || `${id}-${i}`,
                        data: {
                            strand: this.data.strand,
                            ...f,
                        },
                        parent: this,
                    })
                    : f);
            }
        }
        get(name) {
            return name === 'subfeatures'
                ? this.subfeatures
                : name === 'parent'
                    ? this.parent()
                    : this.data[name];
        }
        set(name, val) {
            this.data[name] = val;
        }
        tags() {
            return Object.keys(this.data);
        }
        id() {
            return this.uniqueId;
        }
        parent() {
            return this.parentHandle;
        }
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

    const configSchema = configuration.ConfigurationSchema('RefGetAdapter', {
        /**
         * #slot
         */
        serverLocation: {
            type: 'fileLocation',
            description: 'URL of the GA4GH refget API instance',
            defaultValue: {
                uri: 'https://www.ebi.ac.uk/ena/cram/sequence',
                locationType: 'UriLocation'
            },
        },
        sequenceIdType: {
            type: 'string',
            defaultValue: '',
            model: mobxStateTree.types.enumeration('SequenceIdType', ['', 'insdc'])
        },
        /**
         * #slot
         */
        sequenceData: {
            type: 'frozen',
            defaultValue: {},
            description: 'List of sequence objects',
        }
    }, { explicitlyTyped: true });
    class AdapterClass extends BaseAdapter.BaseSequenceAdapter {
        // the sequenceSizesData can be used to speed up loading since TwoBit has to do
        // many range requests at startup to perform the getRegions request
        sequenceData;
        serverLocation;
        // check against default and empty in case someone makes the field blank in
        // config editor, may want better way to check "optional config slots" in
        // future
        // console.log(conf)
        // if (conf.uri !== '/path/to/default.chrom.sizes' && conf.uri !== '') {
        //   const file = openLocation(conf, this.pluginManager)
        //   const data = await file.readFile('utf8')
        //   return Object.fromEntries(
        //     data
        //       ?.split(/\n|\r\n|\r/)
        //       .filter(line => !!line.trim())
        //       .map(line => {
        //         const [name, length] = line.split('\t')
        //         return [name, +length]
        //       }),
        //   )
        // }
        // return undefined
        //   }
        constructor(config, getSubAdapter, pluginManager) {
            super(config, getSubAdapter, pluginManager);
            this.sequenceData = configuration.readConfObject(this.config, 'sequenceData');
            this.serverLocation = configuration.readConfObject(this.config, 'serverLocation');
        }
        async getRefNames() {
            return Object.values(this.sequenceData).map(({ name }) => name);
        }
        async getRegions() {
            const sequenceSizesData = this.sequenceData;
            return Object.keys(sequenceSizesData).map(k => ({
                refName: sequenceSizesData[k].name,
                start: 0,
                end: sequenceSizesData[k].size,
            }));
        }
        /**
         * Fetch features for a certain region
         * @param param -
         * @returns Observable of Feature objects in the region
         */
        getFeatures({ refName, start, end }) {
            return rxjs.ObservableCreate(async (observer) => {
                const { uri } = configuration.readConfObject(this.config, 'serverLocation');
                const id = Object.keys(this.sequenceData).find(seq => this.sequenceData[seq].name === refName);
                const idType = configuration.readConfObject(this.config, 'sequenceIdType');
                const query = idType ? `${idType}:${id}` : id;
                try {
                    const result = await fetch(`${uri}/${query}?start=${start}&end=${end}`);
                    if (!result.ok) {
                        throw new Error(`Failed to fetch ${result.status} ${result.statusText}`);
                    }
                    const seq = await result.text();
                    if (seq) {
                        observer.next(new _default({
                            id: `${refName} ${start}-${end}`,
                            data: { refName, start, end: end, seq },
                        }));
                    }
                    observer.complete();
                }
                catch (e) {
                    observer.error(e);
                }
            });
        }
        /**
         * called to provide a hint that data tied to a certain region
         * will not be needed for the foreseeable future and can be purged
         * from caches, etc
         */
        freeResources( /* { region } */) { }
    }

    var version = "1.1.0";

    class RefGetPlugin extends Plugin {
        name = "RefGetPlugin";
        version = version;
        install(pluginManager) {
            pluginManager.addAdapterType(() => new AdapterType({
                name: "RefGetAdapter",
                configSchema,
                AdapterClass,
            }));
        }
    }

    exports.default = RefGetPlugin;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=jbrowse-plugin-refget-api.umd.development.js.map

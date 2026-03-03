import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType';
import Plugin from '@jbrowse/core/Plugin';
import { ConfigurationSchema, readConfObject } from '@jbrowse/core/configuration';
import { BaseSequenceAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
import SimpleFeature from '@jbrowse/core/util/simpleFeature';
import { types } from 'mobx-state-tree';

const configSchema = ConfigurationSchema('RefGetAdapter', {
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
        model: types.enumeration('SequenceIdType', ['', 'insdc'])
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
class AdapterClass extends BaseSequenceAdapter {
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
        this.sequenceData = readConfObject(this.config, 'sequenceData');
        this.serverLocation = readConfObject(this.config, 'serverLocation');
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
        return ObservableCreate(async (observer) => {
            const { uri } = readConfObject(this.config, 'serverLocation');
            const id = Object.keys(this.sequenceData).find(seq => this.sequenceData[seq].name === refName);
            const idType = readConfObject(this.config, 'sequenceIdType');
            const query = idType ? `${idType}:${id}` : id;
            try {
                const result = await fetch(`${uri}/${query}?start=${start}&end=${end}`);
                if (!result.ok) {
                    throw new Error(`Failed to fetch ${result.status} ${result.statusText}`);
                }
                const seq = await result.text();
                if (seq) {
                    observer.next(new SimpleFeature({
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

export { RefGetPlugin as default };
//# sourceMappingURL=index.esm.js.map

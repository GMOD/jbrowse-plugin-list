import { BaseFeatureDataAdapter, } from '@jbrowse/core/data_adapters/BaseAdapter';
import { updateStatus } from '@jbrowse/core/util';
import { openLocation } from '@jbrowse/core/util/io';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
import { getSnapshot } from '@jbrowse/mobx-state-tree';
import MafFeature from '../MafFeature';
import parseNewick from '../parseNewick';
import { normalize } from '../util';
import { subscribeToObservable } from '../util/observableUtils';
import { parseAssemblyAndChr, selectReferenceSequenceString, } from '../util/parseAssemblyName';
export default class MafTabixAdapter extends BaseFeatureDataAdapter {
    setupP;
    async setupPre() {
        if (!this.getSubAdapter) {
            throw new Error('no getSubAdapter available');
        }
        return {
            adapter: (await this.getSubAdapter({
                ...getSnapshot(this.config),
                type: 'BedTabixAdapter',
            })).dataAdapter,
        };
    }
    async setupPre2() {
        if (!this.setupP) {
            this.setupP = this.setupPre().catch((e) => {
                this.setupP = undefined;
                throw e;
            });
        }
        return this.setupP;
    }
    async setup(opts) {
        const { statusCallback = () => { } } = opts || {};
        return updateStatus('Downloading index', statusCallback, () => this.setupPre2());
    }
    async getRefNames(opts) {
        const { adapter } = await this.setup(opts);
        return adapter.getRefNames();
    }
    async getHeader(opts) {
        const { adapter } = await this.setup(opts);
        return adapter.getHeader();
    }
    getFeatures(query, opts) {
        return ObservableCreate(async (observer) => {
            const { adapter } = await this.setup(opts);
            let firstAssemblyNameFound = '';
            const refAssemblyName = this.getConf('refAssemblyName');
            await subscribeToObservable(adapter.getFeatures(query, opts), feature => {
                const data = feature.get('field5').split(',');
                const alignments = {};
                for (let j = 0, l = data.length; j < l; j++) {
                    const elt = data[j];
                    const parts = elt.split(':');
                    const [assemblyAndChr, startStr, srcSizeStr, strandStr, unknownStr, seq,] = parts;
                    if (!assemblyAndChr || !seq) {
                        continue;
                    }
                    const { assemblyName, chr } = parseAssemblyAndChr(assemblyAndChr);
                    if (assemblyName) {
                        if (!firstAssemblyNameFound) {
                            firstAssemblyNameFound = assemblyName;
                        }
                        alignments[assemblyName] = {
                            chr,
                            start: +startStr,
                            srcSize: +srcSizeStr,
                            strand: strandStr === '-' ? -1 : 1,
                            unknown: +unknownStr,
                            seq,
                        };
                    }
                }
                observer.next(new MafFeature(feature.id(), feature.get('start'), feature.get('end'), feature.get('refName'), 0, // strand determined per-alignment
                alignments, selectReferenceSequenceString(alignments, refAssemblyName, query.assemblyName, firstAssemblyNameFound) ?? ''));
            });
            observer.complete();
        }, opts?.stopToken);
    }
    async getSamples(_query) {
        const nhLoc = this.getConf('nhLocation');
        const nh = nhLoc.uri === '/path/to/my.nh'
            ? undefined
            : await openLocation(nhLoc).readFile('utf8');
        // TODO: we may need to resolve the exact set of rows in the visible region
        // here
        return {
            samples: normalize(this.getConf('samples')),
            tree: nh ? parseNewick(nh) : undefined,
        };
    }
    freeResources() { }
}
//# sourceMappingURL=MafTabixAdapter.js.map
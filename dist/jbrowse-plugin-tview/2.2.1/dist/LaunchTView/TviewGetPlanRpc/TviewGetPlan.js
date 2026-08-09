import { getAdapter } from '@jbrowse/core/data_adapters/dataAdapterCache';
import { RpcMethodType } from '@jbrowse/core/pluggableElementTypes';
import { renameRegionsIfNeeded } from '@jbrowse/core/util';
import { buildSampleTree } from '../sampleTree';
import { planTviewMsa, renderTviewMsa } from '../tview';
function isFeatureSource(adapter) {
    return 'getFeatures' in adapter && typeof adapter.getFeatures === 'function';
}
/**
 * Drains an adapter's feature observable into an array.
 *
 * Hand-rolled rather than `firstValueFrom(...pipe(toArray()))` because rxjs is
 * not a dependency here and `@jbrowse/core/util/rxjs` publishes only
 * `ObservableCreate`. Subscribing directly needs neither.
 */
async function fetchAll(pluginManager, sessionId, adapterConfig, region) {
    const { dataAdapter } = await getAdapter(pluginManager, sessionId, adapterConfig);
    if (!isFeatureSource(dataAdapter)) {
        throw new Error(`${adapterConfig.type} has no getFeatures`);
    }
    return new Promise((resolve, reject) => {
        const ret = [];
        dataAdapter.getFeatures(region).subscribe({
            next: feature => ret.push(feature),
            error: reject,
            complete: () => {
                resolve(ret);
            },
        });
    });
}
/**
 * Builds the whole alignment in the worker and sends back the FASTA.
 *
 * The work this moves is not the fetch — `CoreGetFeatures` already ran in a
 * worker — but everything after it. Fetching from the client meant serializing
 * every read's sequence and CIGAR across the boundary and then running the
 * pairwise alignments and the string building on the main thread, where a
 * region carrying a kilobase-scale array froze the UI for as long as it took.
 * What comes back now is the alignment, which is smaller than the reads it was
 * built from and is the only thing the view has a use for.
 *
 * It is also what makes several files one call: their rows are squared up
 * against the same reference interval, so an array's copies are counted once,
 * over rows from all of them.
 */
export default class TviewGetPlan extends RpcMethodType {
    constructor() {
        super(...arguments);
        this.name = 'TviewGetPlan';
    }
    /**
     * Written against the 4.3.0 base class, which takes a bare
     * `Record<string, unknown>` and has no `renameRegions` helper — that is the
     * oldest host this bundle boots on, and the newer base class accepts the same
     * shape.
     */
    async serializeArguments(args, rpcDriverClassName) {
        const typed = args;
        const assemblyManager = this.pluginManager.rootModel?.session?.assemblyManager;
        if (!assemblyManager) {
            throw new Error('no assembly manager');
        }
        const refNameFor = async (adapterConfig) => {
            const { regions } = await renameRegionsIfNeeded(assemblyManager, {
                sessionId: typed.sessionId,
                adapterConfig,
                regions: [typed.region],
            });
            return regions[0].refName;
        };
        const sources = await Promise.all(typed.sources.map(async (source) => ({
            ...source,
            refName: await refNameFor(source.adapterConfig),
        })));
        const sequenceRefName = typed.sequenceAdapterConfig
            ? await refNameFor(typed.sequenceAdapterConfig)
            : undefined;
        return super.serializeArguments({ ...args, sources, sequenceRefName }, rpcDriverClassName);
    }
    async execute(args, rpcDriverClassName) {
        const { sessionId, sources, sequenceAdapterConfig, sequenceRefName, region, maxCells, } = await this.deserializeArguments(args, rpcDriverClassName);
        const perSource = await Promise.all(sources.map(source => fetchAll(this.pluginManager, sessionId, source.adapterConfig, {
            ...region,
            refName: source.refName ?? region.refName,
        })));
        const features = [];
        const sampleByIndex = [];
        for (const [i, feats] of perSource.entries()) {
            for (const feature of feats) {
                if (feature.get('seq')) {
                    features.push(feature);
                    sampleByIndex.push(sources[i].sample);
                }
            }
        }
        let sequence;
        if (sequenceAdapterConfig) {
            const seqFeats = await fetchAll(this.pluginManager, sessionId, sequenceAdapterConfig, { ...region, refName: sequenceRefName ?? region.refName });
            const seq = seqFeats[0]?.get('seq');
            const seqStart = seqFeats[0]?.get('start');
            // the adapter may answer with a wider block than it was asked for
            const sliced = seq !== undefined && seqStart !== undefined
                ? seq.slice(region.start - seqStart, region.end - seqStart)
                : undefined;
            // a short answer means the region runs off the end of the contig, and a
            // reference row that stops early would misplace every column after it
            sequence =
                sliced?.length === region.end - region.start ? sliced : undefined;
        }
        const plan = planTviewMsa({
            features,
            refName: region.refName,
            start: region.start,
            end: region.end,
            sequence,
            sampleOf: i => sampleByIndex[i],
        });
        const shared = {
            rowCount: plan.reads.length,
            columnCount: plan.layout.totalColumns,
            cellCount: plan.cellCount,
            insertionWidths: plan.insertionWidths,
            arraySpans: plan.arraySpans,
            region: plan.region,
            arrays: plan.arrays.map(a => ({
                start: a.start,
                end: a.end,
                period: a.period,
                unit: a.unit,
                width: a.width,
                copies: [...a.copiesByName.entries()],
                lengths: [...a.lengthByName.entries()],
            })),
            subjectIndex: plan.subject
                ? plan.arrays.indexOf(plan.subject)
                : undefined,
            referenceName: plan.referenceName,
            samples: plan.samples,
        };
        // the render is the expensive half and the only part bounded by rows x
        // columns, so the size check happens before it rather than after
        return plan.cellCount > maxCells
            ? { ...shared, msa: '', tooLarge: true }
            : {
                ...shared,
                msa: renderTviewMsa(plan),
                tree: buildSampleTree(plan.reads),
            };
    }
}
//# sourceMappingURL=TviewGetPlan.js.map
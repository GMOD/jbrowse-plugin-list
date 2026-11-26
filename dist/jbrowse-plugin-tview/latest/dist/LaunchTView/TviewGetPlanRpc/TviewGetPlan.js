import { isSequenceAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { getAdapter } from '@jbrowse/core/data_adapters/dataAdapterCache';
import { getFeatureAdapterOrThrow } from '@jbrowse/core/data_adapters/getFeatureAdapter';
import { RpcMethodType } from '@jbrowse/core/pluggableElementTypes';
import { assembleLocString } from '@jbrowse/core/util';
import { planModifications } from '../modifications';
import { planHighlights, planRowData, planTviewMsa, renderRows, toFasta, } from '../tview';
/**
 * Drains an adapter's feature observable into an array.
 *
 * Hand-rolled rather than `firstValueFrom(...pipe(toArray()))` because rxjs is
 * not a dependency here and `@jbrowse/core/util/rxjs` publishes only
 * `ObservableCreate`. Subscribing directly needs neither.
 */
async function fetchAll(args, region) {
    const dataAdapter = await getFeatureAdapterOrThrow(args);
    return new Promise((resolve, reject) => {
        const ret = [];
        dataAdapter.getFeatures(region, { signal: args.signal }).subscribe({
            next: feature => ret.push(feature),
            error: reject,
            complete: () => {
                resolve(ret);
            },
        });
    });
}
/**
 * The reference over exactly `region`, which becomes the alignment's first row
 * and is what makes an array an interval rather than an insertion. The region
 * arrives clamped to its contig, so a short answer means the sequence could not
 * be read, and a row that stops early would misplace every column after it.
 */
async function fetchReference(pluginManager, { sessionId, sequenceAdapter, sequenceRefName, region, signal, }) {
    const dataAdapter = sequenceAdapter
        ? (await getAdapter(pluginManager, sessionId, sequenceAdapter)).dataAdapter
        : undefined;
    const sequence = dataAdapter && isSequenceAdapter(dataAdapter)
        ? await dataAdapter.getSequence({ ...region, refName: sequenceRefName }, { signal })
        : undefined;
    const want = region.end - region.start;
    if (sequence?.length !== want) {
        const n = (x) => x.toLocaleString('en-US');
        throw new Error(`Could not read the reference sequence over ${assembleLocString(region)}: got ${n(sequence?.length ?? 0)}bp of ${n(want)}bp`);
    }
    return sequence;
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
    async serializeArguments(args) {
        const sources = await Promise.all(args.sources.map(async (source) => {
            const { regions } = await this.renameRegions({
                sessionId: args.sessionId,
                adapterConfig: source.adapterConfig,
                regions: [args.region],
            });
            return { ...source, refName: regions[0].refName };
        }));
        return super.serializeArguments({ ...args, sources });
    }
    async execute(args) {
        const { pluginManager } = this;
        const { sources, region, maxCells } = args;
        const [perSource, sequence] = await Promise.all([
            Promise.all(sources.map(source => fetchAll({ ...args, pluginManager, adapterConfig: source.adapterConfig }, { ...region, refName: source.refName ?? region.refName }))),
            fetchReference(pluginManager, args),
        ]);
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
        const plan = planTviewMsa({
            features,
            refName: region.refName,
            start: region.start,
            end: region.end,
            sequence,
            sampleOf: i => sampleByIndex[i],
        });
        const shared = {
            columnCount: plan.layout.totalColumns,
            cellCount: plan.cellCount,
            rowData: planRowData(plan),
            highlights: planHighlights(plan),
            region: plan.region,
            hasSubject: plan.subject !== undefined,
            hasClusters: plan.clusters.size > 0,
            samples: plan.samples,
        };
        // the render is the expensive half and the only part bounded by rows x
        // columns, so the size check happens before it rather than after
        const rows = plan.cellCount > maxCells ? undefined : renderRows(plan);
        const modifications = rows
            ? planModifications({ features, plan, rows })
            : undefined;
        return rows
            ? {
                ...shared,
                msa: toFasta(plan, rows),
                ...(modifications ? { modifications } : {}),
            }
            : { ...shared, msa: '', tooLarge: true };
    }
}
//# sourceMappingURL=TviewGetPlan.js.map
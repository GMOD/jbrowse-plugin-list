import { MAX_CELLS } from './limits';
/**
 * One RPC per launch, however many files it draws from. The session id is
 * shared across the sources so the worker keeps one adapter cache for the view
 * rather than one per file.
 */
export async function fetchTviewPlan({ session, sources, region, maxCells = MAX_CELLS, signal, }) {
    const rpcSessionId = `tview-${sources.map(s => s.trackId).join(',')}`;
    const assembly = session.assemblyManager.get(region.assemblyName);
    return session.rpcManager.call(rpcSessionId, 'TviewGetPlan', {
        sources: sources.map(s => ({
            adapterConfig: s.adapterConfig,
            sample: s.sample,
        })),
        assemblyName: region.assemblyName,
        sequenceRefName: assembly?.getSeqAdapterRefName(region.refName) ?? region.refName,
        region,
        maxCells,
        signal,
    });
}
//# sourceMappingURL=fetchTviewPlan.js.map
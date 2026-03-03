import { getSession } from '@jbrowse/core/util';
import useSWR from 'swr';
import { fetchSeq } from './fetchSeq';
async function featureSequenceFetcher({ feature, assemblyName, upDownBp, view, }) {
    const session = getSession(view);
    const { start, end, refName } = feature.toJSON();
    const b = start - upDownBp;
    const e = end + upDownBp;
    const [seq, upstream, downstream] = await Promise.all([
        fetchSeq({
            start,
            end,
            refName,
            assemblyName,
            session,
        }),
        fetchSeq({
            start: Math.max(0, b),
            end: start,
            refName,
            assemblyName,
            session,
        }),
        fetchSeq({
            start: end,
            end: e,
            refName,
            assemblyName,
            session,
        }),
    ]);
    return { seq, upstream, downstream };
}
export function useSWRFeatureSequence({ view, feature, upDownBp = 0, forceLoad = true, }) {
    const assemblyName = view?.assemblyNames?.[0];
    const { data, error } = useSWR(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    feature && assemblyName && view
        ? [feature.id(), assemblyName, upDownBp, forceLoad, 'feature-sequence']
        : null, () => featureSequenceFetcher({
        feature: feature,
        assemblyName: assemblyName,
        upDownBp,
        view: view,
    }), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
    });
    return {
        sequence: data,
        error,
    };
}
//# sourceMappingURL=useSWRFeatureSequence.js.map
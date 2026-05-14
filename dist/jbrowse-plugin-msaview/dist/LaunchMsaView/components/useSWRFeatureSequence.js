import { getSession } from '@jbrowse/core/util';
import useSWR from 'swr';
import { fetchSeq } from './fetchSeq';
async function featureSequenceFetcher({ feature, assemblyName, view, }) {
    const session = getSession(view);
    const { start, end, refName } = feature.toJSON();
    const seq = await fetchSeq({
        start,
        end,
        refName,
        assemblyName,
        session,
    });
    return { seq };
}
export function useSWRFeatureSequence({ view, feature, }) {
    const assemblyName = view?.assemblyNames?.[0];
    const { data, error } = useSWR(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    feature && assemblyName && view
        ? [feature.id(), assemblyName, 'feature-sequence']
        : null, () => featureSequenceFetcher({
        feature: feature,
        assemblyName: assemblyName,
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
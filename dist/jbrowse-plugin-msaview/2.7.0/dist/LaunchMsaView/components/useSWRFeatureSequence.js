import { getSession } from '@jbrowse/core/util';
import useSWR from 'swr';
import { fetchSeq } from './fetchSeq';
import { staticSwrConfig } from '../../utils/swrConfig';
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
    const args = feature && assemblyName ? { feature, assemblyName, view } : undefined;
    const { data, error } = useSWR(args ? [args.feature.id(), args.assemblyName, 'feature-sequence'] : null, () => featureSequenceFetcher(args), staticSwrConfig);
    return {
        sequence: data,
        error,
    };
}

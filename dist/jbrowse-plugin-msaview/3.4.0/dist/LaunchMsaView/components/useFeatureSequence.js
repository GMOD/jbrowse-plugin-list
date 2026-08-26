import { getSession } from '@jbrowse/core/util';
import { useFetch } from '../../utils/useFetch';
import { getProteinSequenceFromFeature } from './calculateProteinSequence';
import { fetchSeq } from './fetchSeq';
export function useFeatureSequence({ view, feature, }) {
    const assemblyName = view?.assemblyNames?.[0];
    const { data: sequence, error } = useFetch(feature && assemblyName
        ? [feature.id(), assemblyName, 'feature-sequence']
        : null, async () => {
        const { start, end, refName } = feature.toJSON();
        return {
            seq: await fetchSeq({
                start,
                end,
                refName,
                assemblyName: assemblyName,
                session: getSession(view),
            }),
        };
    });
    return {
        proteinSequence: sequence && feature
            ? getProteinSequenceFromFeature({ seq: sequence.seq, feature })
            : '',
        sequence,
        error,
    };
}

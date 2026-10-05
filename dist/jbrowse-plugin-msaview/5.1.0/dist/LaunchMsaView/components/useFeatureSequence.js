import { getSession } from '@jbrowse/core/util';
import { translateTranscript } from '@jbrowse/core/util/translateTranscript';
import { useFetch } from '../../utils/useFetch';
import { fetchSeq } from './fetchSeq';
export function useFeatureSequence({ view, feature, }) {
    const assemblyName = view?.assemblyNames?.[0];
    const { data: sequence, error, isLoading, } = useFetch(feature && assemblyName
        ? [feature.id(), assemblyName, 'feature-sequence']
        : null, async () => {
        const { start, end, refName } = feature.toJSON();
        return fetchSeq({
            start,
            end,
            refName,
            assemblyName: assemblyName,
            session: getSession(view),
        });
    });
    return {
        proteinSequence: sequence && feature
            ? (translateTranscript({ transcript: feature, ...sequence })?.protein ??
                '')
            : '',
        sequence,
        error,
        isLoading,
    };
}

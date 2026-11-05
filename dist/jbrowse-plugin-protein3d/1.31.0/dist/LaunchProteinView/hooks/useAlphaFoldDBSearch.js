import { useMemo } from 'react';
import { sameProtein } from 'p2s_mapper';
import { useAlphaFoldComplexModel } from './useAlphaFoldComplexes';
import useAlphaFoldData from './useAlphaFoldData';
import useTranscriptIsoformSelection from './useTranscriptIsoformSelection';
export default function useAlphaFoldDBSearch({ feature, view, lookup, preferredTranscriptId, complexEntity, }) {
    const { uniprotId, isLookupLoading } = lookup;
    const { isLoading: isAlphaFoldLoading, isValidating: isAlphaFoldValidating, modelsUnreachable, model, noModel, } = useAlphaFoldData({ uniprotId, feature, view, preferredTranscriptId });
    const complex = useAlphaFoldComplexModel(complexEntity);
    // the transcripts rank against the gene's own chain of a complex
    const entry = uniprotId?.replace(/-\d+$/, '');
    const complexSequence = complex.model?.chains.find(c => c.accession === entry)?.sequence;
    const url = complexEntity ? complex.model?.url : model?.url;
    // a stable array, or the isoform picker realigns on every render
    const modelSequence = complexEntity
        ? complex.model && (complexSequence ?? model?.sequence)
        : model?.sequence;
    const structureSequences = useMemo(() => (modelSequence ? [modelSequence] : undefined), [modelSequence]);
    const { transcripts: transcriptOptions, isoformSequences, structureSequence, ranking, isLoading: isIsoformLoading, isRanking, error: isoformError, partialFailure: isoformPartialFailure, selectedTranscriptId: userSelection, setSelectedTranscriptId: setUserSelection, selectedTranscript, selectedIsoform: userSelectedProteinSequence, } = useTranscriptIsoformSelection({
        feature,
        view,
        structureSequences,
        preferredTranscriptId,
        resetKey: url,
    });
    const loadingStatuses = [
        isLookupLoading && 'Looking up UniProt ID',
        isIsoformLoading && 'Loading protein sequences from transcript isoforms',
        isRanking && 'Aligning isoforms to the structure',
        isAlphaFoldLoading && 'Asking AlphaFold DB for models',
        complex.isLoading && 'Asking AlphaFold DB for the complex',
    ].filter(s => typeof s === 'string');
    const isLoading = loadingStatuses.length > 0;
    // errors wait for loading to finish, so a lookup in flight doesn't flash one
    const rawError = isoformError ?? lookup.lookupError ?? complex.error;
    const error = isLoading ? undefined : rawError;
    return {
        ...lookup,
        userSelection,
        setUserSelection,
        transcriptOptions,
        selectedTranscript,
        isoformSequences,
        ranking,
        isoformPartialFailure,
        userSelectedProteinSequence,
        url,
        meanPlddt: model?.meanPlddt,
        confidenceUrl: model?.confidenceUrl,
        modelAccession: model?.accession,
        structureSequence,
        noModel,
        modelsUnreachable: isLoading ? undefined : modelsUnreachable,
        error,
        loadingStatuses,
        // While the structure is refetched, structureSequence is still the previous
        // selection's (keepPreviousData), so a match is unknown until it settles.
        sequencesMatch: !isAlphaFoldValidating &&
            !complex.isLoading &&
            userSelectedProteinSequence?.seq &&
            structureSequence
            ? sameProtein(userSelectedProteinSequence.seq, structureSequence)
            : undefined,
        isLoading,
    };
}

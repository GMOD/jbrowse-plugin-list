import { useMemo } from 'react';
import { getPdbStructureUrl, sameProtein } from 'p2s_mapper';
import { useAlphaFoldComplexModel } from './useAlphaFoldComplexes';
import usePdbEntry from './usePdbEntry';
import useTranscriptIsoformSelection from './useTranscriptIsoformSelection';
export function structureSource(structure) {
    return structure.kind === 'alphafold'
        ? { url: structure.model.url }
        : structure.kind === 'pdb'
            ? { url: getPdbStructureUrl(structure.pdbId) }
            : { alphaFoldComplexId: structure.entity };
}
/**
 * The transcript a launch maps every structure through, ranked against the
 * first structure: the one the rest are superposed onto. A complex is ranked by
 * the gene's own chain, a PDB entry by whichever of its chains the transcript
 * fits best. The ranking follows the first structure as it changes, and a
 * transcript picked by hand lasts until it does.
 */
export default function useStructureLaunch({ structures, uniprotId, feature, view, preferredTranscriptId, }) {
    const pivot = structures[0];
    const pdb = usePdbEntry(pivot?.kind === 'pdb' ? pivot.pdbId : undefined);
    const complex = useAlphaFoldComplexModel(pivot?.kind === 'complex' ? pivot.entity : undefined);
    const entry = uniprotId?.replace(/-\d+$/, '');
    const complexChains = complex.model?.chains;
    const ownChain = complexChains?.find(c => c.accession === entry);
    const alphaFoldSequence = pivot?.kind === 'alphafold' ? pivot.model.sequence : undefined;
    const pdbSequences = pdb.entry?.proteinSequences;
    // a stable array, or the isoform picker realigns on every render
    const structureSequences = useMemo(() => pivot?.kind === 'alphafold'
        ? alphaFoldSequence
            ? [alphaFoldSequence]
            : undefined
        : pivot?.kind === 'pdb'
            ? pdbSequences
            : ownChain
                ? [ownChain.sequence]
                : complexChains?.map(c => c.sequence), [pivot?.kind, alphaFoldSequence, pdbSequences, ownChain, complexChains]);
    const selection = useTranscriptIsoformSelection({
        feature,
        view,
        structureSequences,
        preferredTranscriptId,
        resetKey: pivot?.key,
    });
    // Until the first structure's chains arrive the ranking has none and orders
    // the isoforms by length, so a launch that takes the ranked default waits.
    // The right-clicked isoform needs no ranking and launches at once. An entry
    // RCSB cannot describe stops holding the launch.
    const awaitsChains = selection.selectedTranscriptId !== preferredTranscriptId &&
        ((pdb.isValidating && !pdb.error) || complex.isLoading);
    const loadingStatuses = [
        selection.isLoading && 'Loading protein sequences from transcript isoforms',
        selection.isRanking && 'Aligning isoforms to the structure',
        awaitsChains &&
            (pivot?.kind === 'pdb'
                ? 'Reading the chains of the entry from RCSB'
                : 'Asking AlphaFold DB for the complex'),
    ].filter(s => typeof s === 'string');
    const isLoading = loadingStatuses.length > 0;
    const predicted = pivot?.kind === 'alphafold' || pivot?.kind === 'complex';
    const isoformSequence = selection.selectedIsoform?.seq;
    return {
        ...selection,
        loadingStatuses,
        isLoading,
        // errors wait for loading to finish, so a lookup in flight doesn't flash one
        error: isLoading ? undefined : (selection.error ?? complex.error),
        pdbEntryError: pdb.error,
        // only a prediction is meant to be the transcript's own protein; a crystal
        // is a construct, usually of one domain
        sequencesMatch: predicted &&
            !complex.isLoading &&
            isoformSequence &&
            selection.structureSequence
            ? sameProtein(isoformSequence, selection.structureSequence)
            : undefined,
    };
}

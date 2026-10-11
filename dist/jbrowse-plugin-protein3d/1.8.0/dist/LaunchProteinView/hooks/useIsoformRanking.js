import { getSession } from '@jbrowse/core/util';
import useSWR from 'swr';
import { STATIC_SWR_OPTIONS } from './swrOptions';
import { rankIsoforms } from '../../AlignTranscriptRpc';
import { alignOffThread } from '../../ProteinView/alignOffThread';
/**
 * The isoforms in the order the picker lists them, ranked in the RPC worker:
 * a long gene's isoforms against a long chain are seconds of DP, which on the
 * main thread froze the dialog while it opened. Undefined while that runs.
 * With no structure or no translation there is nothing to align, so the
 * ranking is immediate, and still names the chain.
 */
export default function useIsoformRanking({ view, isoforms, structureSequences, }) {
    const aligns = !!view && !!structureSequences?.length && isoforms.some(i => i.seq);
    const { data, error } = useSWR(aligns ? ['isoform-ranking', isoforms, structureSequences] : null, () => alignOffThread({
        rpcManager: getSession(view).rpcManager,
        name: 'ProteinRankIsoforms',
        args: { isoforms, structureSequences: structureSequences ?? [] },
        inPlace: () => rankIsoforms(isoforms, structureSequences),
    }), STATIC_SWR_OPTIONS);
    return aligns
        ? { ranking: data, error }
        : { ranking: rankIsoforms(isoforms, structureSequences) };
}

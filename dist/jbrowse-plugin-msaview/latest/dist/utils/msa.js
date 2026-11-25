import { alignInBrowser, parseFastaRecords } from './browserAlign';
import { runEbiJob } from './ebiJobDispatcher';
import { isAbortError } from './fetch';
const algorithms = {
    clustalo: {
        params: {},
        msaResult: 'aln-clustal_num',
        treeResult: 'phylotree',
    },
    muscle: {
        params: { format: 'clw', tree: 'tree1' },
        msaResult: 'fa',
        treeResult: 'phylotree',
    },
    kalign: {
        params: { stype: 'protein' },
        msaResult: 'fa',
        treeResult: 'phylotree',
    },
    mafft: {
        params: { stype: 'protein' },
        msaResult: 'fa',
        treeResult: 'phylotree',
    },
};
/**
 * Align a FASTA whose first record is the query. `browser` never leaves the
 * page and returns no tree, which the launch then builds itself (see
 * runLaunch); the EBI aligners return their guide tree alongside the rows.
 */
export async function launchMSA({ algorithm, sequence, onProgress, signal, }) {
    if (algorithm === 'browser') {
        const [query, ...targets] = parseFastaRecords(sequence);
        if (!query) {
            throw new Error('Nothing to align');
        }
        return {
            msa: await alignInBrowser({ query, targets, onProgress, signal }),
            tree: '',
        };
    }
    const config = algorithms[algorithm];
    const job = await runEbiJob({
        tool: algorithm,
        label: `${algorithm} MSA`,
        params: { ...config.params, sequence },
        onProgress,
        signal,
    });
    const [msa, tree] = await Promise.all([
        job.result(config.msaResult),
        job.result(config.treeResult, { retry: false }).catch((e) => {
            if (isAbortError(e)) {
                throw e;
            }
            console.warn('[msaview] EBI returned no tree, building one here:', e);
            return '';
        }),
    ]);
    return { msa, tree };
}

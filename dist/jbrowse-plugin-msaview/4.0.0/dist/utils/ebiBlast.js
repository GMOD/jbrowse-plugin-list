import { snapBlastHitCount } from '../LaunchMsaView/components/BlastQuery/consts';
import { strip } from '../LaunchMsaView/components/util';
import { runEbiJob } from './ebiJobDispatcher';
const TOOL = 'ncbiblast';
/**
 * Map EBI's hit shape onto the normalized one. Exported for testing against a
 * captured response — the field names are the whole risk here, and nothing else
 * in CI would notice if EBI renamed one.
 */
export function normalizeEbiBlastHits(result) {
    return (result.hits ?? []).map(hit => {
        const taxid = Number.parseInt(hit.hit_uni_ox ?? '', 10);
        return {
            description: [
                {
                    accession: hit.hit_acc ?? 'unknown',
                    id: hit.hit_id ?? hit.hit_acc ?? 'unknown',
                    sciname: hit.hit_uni_os ?? hit.hit_os ?? 'unknown',
                    taxid: Number.isNaN(taxid) ? undefined : taxid,
                    // hit_uni_de is the bare protein name; hit_desc repeats it with the
                    // OS=/OX=/GN= suffix that makeId already covers with real columns
                    title: hit.hit_uni_de ?? hit.hit_desc,
                },
            ],
            hsps: (hit.hit_hsps ?? []).flatMap(hsp => hsp.hsp_hseq ? [{ hseq: hsp.hsp_hseq }] : []),
        };
    });
}
/**
 * Human-facing link to a job, shown while it runs and on error — so it has to
 * be EBI's own results UI, not the REST result endpoint, which does not exist
 * yet at the moment the link is on screen.
 */
export function ebiBlastResultUrl(jobId) {
    return `https://www.ebi.ac.uk/jdispatcher/sss/${TOOL}/summary?jobId=${jobId}`;
}
export async function queryEbiBlast({ query, blastDatabase, maxHits, onProgress, onRid, signal, }) {
    const hitCount = maxHits ? String(snapBlastHitCount(maxHits)) : undefined;
    const job = await runEbiJob({
        tool: TOOL,
        label: 'BLAST',
        params: {
            program: 'blastp',
            stype: 'protein',
            database: blastDatabase,
            sequence: query,
            ...(hitCount ? { alignments: hitCount, scores: hitCount } : {}),
        },
        onProgress,
        onRid,
        signal,
    });
    const hits = normalizeEbiBlastHits(JSON.parse(await job.result('json')));
    if (hits.length === 0) {
        throw new Error('No hits found');
    }
    return { rid: job.jobId, hits };
}
/**
 * BLAST as a search backend. Its alignments are pairwise and one hit at a
 * time, so they are stripped back off and the hits go to an aligner as bare
 * sequences: no `queryRow`.
 */
export const searchEbiBlast = async ({ database, ...request }) => {
    const { hits, rid } = await queryEbiBlast({
        blastDatabase: database,
        ...request,
    });
    return {
        rid,
        hits: hits.map(hit => ({
            ...(hit.description[0] ?? {
                accession: 'unknown',
                id: 'unknown',
                sciname: 'unknown',
            }),
            sequence: strip(hit.hsps[0]?.hseq ?? ''),
        })),
    };
};

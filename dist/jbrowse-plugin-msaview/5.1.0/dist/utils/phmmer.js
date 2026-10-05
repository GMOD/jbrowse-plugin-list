import { StockholmMSA } from 'msa-parsers';
import { runEbiJob } from './ebiJobDispatcher';
const TOOL = 'hmmer3_phmmer';
/**
 * Human-facing link to a job, shown while it runs and on error.
 *
 * The category has to be sss: jdispatcher serves its shell with a 200 for any
 * category, so /pfa/ and /psa/ look fine to a fetch and render "Page Not Found"
 * in a browser.
 */
export function phmmerResultUrl(jobId) {
    return `https://www.ebi.ac.uk/jdispatcher/sss/${TOOL}/summary?jobId=${jobId}`;
}
/** EBI job ids are prefixed with the tool that made them */
export function isPhmmerJobId(jobId) {
    return jobId.startsWith(`${TOOL}-`);
}
/**
 * phmmer aligns every hit to a profile built from the query, one match state
 * per query residue, and marks those columns 'x' in #=GC RF. So the query's own
 * row is exactly recoverable: walk RF, consume a query residue at each match
 * column, gap everywhere else.
 *
 * This is the one piece of real logic here rather than a library call, and it
 * is checked hard: if the match columns do not account for the query exactly,
 * the columns and the query have drifted apart, and a query row that is off by
 * even one residue would silently mis-map every column to the genome. Throwing
 * is much better than drawing that.
 */
function buildQueryRow({ rf, query }) {
    let consumed = 0;
    const row = Array.from(rf, c => c === 'x' ? (query[consumed++] ?? '-') : '-').join('');
    if (consumed !== query.length) {
        throw new Error(`phmmer alignment has ${consumed} match columns for a query of ${query.length} residues, so the query row cannot be placed`);
    }
    return row;
}
/**
 * '[subseq from] Albumin OS=Homo sapiens OX=9606 GN=ALB PE=1 SV=2' is what a
 * UniProt target's #=GS DE looks like. The representative-proteome databases
 * (rp15..rp75) write the same facts as caret-pipe fields instead --
 * 'P53_HUMAN^|^DNHU53^|^Cellular tumor antigen p53^|^...^|^Homo sapiens^|^9606^|^Euk/mammal^|^40674'
 * -- so both grammars are read. Hits from the non-UniProt databases phmmer
 * also offers (PDB, AlphaFold, MEROPS...) carry neither, so every field here
 * is optional.
 */
function parseDescription(de) {
    const text = (de ?? '').replace('[subseq from] ', '');
    if (text.includes('^|^')) {
        const fields = text.split('^|^');
        const ox = fields[6];
        return {
            id: fields[0] || undefined,
            sciname: fields[5] || 'unknown',
            taxid: ox && /^\d+$/.test(ox) ? Number.parseInt(ox, 10) : undefined,
            title: fields[2] || undefined,
        };
    }
    const sciname = /OS=(.*?)\s+(?:OX|GN|PE|SV)=/.exec(text)?.[1];
    const ox = /OX=(\d+)/.exec(text)?.[1];
    return {
        id: undefined,
        sciname: sciname ?? 'unknown',
        taxid: ox ? Number.parseInt(ox, 10) : undefined,
        title: text.split(' OS=')[0] || undefined,
    };
}
/**
 * Target names look like 'sp|P02768|ALBU_HUMAN/1-609' for UniProt databases and
 * like anything at all for the others, so an unrecognized name becomes its own
 * accession rather than being dropped.
 */
function parseName(name) {
    const slash = name.lastIndexOf('/');
    const range = slash === -1 ? undefined : /^\d+-\d+$/.exec(name.slice(slash + 1))?.[0];
    const bare = range === undefined ? name : name.slice(0, slash);
    const parts = bare.split('|');
    return parts.length === 3
        ? { accession: parts[1], id: parts[2], range }
        : { accession: bare, id: bare, range };
}
/**
 * Exported for testing against a captured .sto — the annotation names (RF, the
 * DE line's OS=/OX=) are the whole risk in this mapping, and nothing else in CI
 * would notice if HMMER or EBI changed one.
 */
export function parsePhmmerAlignment({ stockholm, query, }) {
    const { gc, gs, seqdata, seqname } = new StockholmMSA(stockholm, 0).getMSA();
    const rf = gc.RF;
    if (!rf) {
        throw new Error('phmmer alignment has no #=GC RF line');
    }
    return {
        queryRow: buildQueryRow({ rf, query }),
        rows: seqname.map(name => {
            const { id, ...description } = parseDescription(gs.DE?.[name]?.[0]);
            const parsed = parseName(name);
            return {
                ...parsed,
                // the rp databases name a row by bare accession and put the mnemonic
                // id in the description instead
                id: parsed.id === parsed.accession && id ? id : parsed.id,
                ...description,
                // insert columns come back lowercase with '.' for gaps; the MSA renderer
                // looks colors up by the literal letter, so lowercase would draw
                // uncolored. The insert columns stay visible as gaps in the query row.
                aligned: (seqdata[name] ?? '').replaceAll('.', '-').toUpperCase(),
            };
        }),
    };
}
export async function queryPhmmer({ query, database, maxHits, onProgress, onRid, signal, }) {
    const job = await runEbiJob({
        tool: TOOL,
        label: 'phmmer',
        params: {
            database,
            sequence: query,
            // the alignment is the whole point of using phmmer here
            alignView: 'true',
            ...(maxHits ? { nhits: String(maxHits) } : {}),
        },
        onProgress,
        onRid,
        signal,
    });
    const alignment = parsePhmmerAlignment({
        stockholm: await job.result('sto'),
        query,
    });
    if (alignment.rows.length === 0) {
        throw new Error('No hits found');
    }
    return { rid: job.jobId, ...alignment };
}
/** phmmer's rows as search hits: the aligned row is the hit's sequence. */
export function toSearchHits(rows) {
    return rows.map(({ aligned, ...rest }) => ({ ...rest, sequence: aligned }));
}
/**
 * phmmer as a search backend. It aligns every hit to a profile of the query as
 * it searches, so the result carries `queryRow` and no aligner runs after it.
 */
export const searchEbiPhmmer = async ({ database, ...request }) => {
    const { rows, queryRow, rid } = await queryPhmmer({
        database: database,
        ...request,
    });
    return { rid, queryRow, hits: toSearchHits(rows) };
};

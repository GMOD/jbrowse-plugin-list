import { makeId } from '../LaunchMsaView/components/util';
/**
 * Turning search results into the rows the view is given, kept free of any
 * jbrowse or network import so the whole assembly can be run and checked
 * outside a browser — see test/phmmerLive.test.ts.
 */
export function buildRowMetadata(desc, taxonomyInfo) {
    const metadata = {};
    const taxInfo = desc.taxid ? taxonomyInfo.get(desc.taxid) : undefined;
    if (taxInfo?.sciname) {
        metadata['Scientific name'] = taxInfo.sciname;
    }
    if (taxInfo?.commonName) {
        metadata['Common name'] = taxInfo.commonName;
    }
    if (desc.accession) {
        metadata.Accession = desc.accession;
    }
    if (desc.id) {
        metadata.ID = desc.id;
    }
    if (desc.title) {
        metadata.Description = desc.title;
    }
    return metadata;
}
/**
 * One target can match the query in several places and phmmer emits a row per
 * matched envelope — four for lamprey albumin against human albumin, which has
 * three domains. Those rows share an accession and so would share a name, and
 * duplicate names silently collapse rows in both the MSA and the tree, so the
 * envelope disambiguates them.
 */
export function makeRowNames(rows, taxonomyInfo) {
    const baseNames = rows.map(row => makeId(row, taxonomyInfo));
    const counts = new Map();
    for (const name of baseNames) {
        counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    const used = new Set();
    return baseNames.map((base, i) => {
        let name = counts.get(base) > 1 ? `${base}_${rows[i].range ?? i + 1}` : base;
        while (used.has(name)) {
            name = `${name}_${i + 1}`;
        }
        used.add(name);
        return name;
    });
}
/**
 * The phmmer alignment as the view receives it: aligned FASTA whose first row
 * is the query, plus the per-row metadata keyed by the same names, which are
 * also what the tree's leaves are labelled with.
 */
export function buildPhmmerMsa({ rows, queryRow, taxonomyInfo, querySeqName = 'QUERY', }) {
    const treeMetadata = {};
    const rowNames = makeRowNames(rows, taxonomyInfo);
    const sequences = rows.map((row, i) => {
        const rowName = rowNames[i];
        treeMetadata[rowName] = buildRowMetadata(row, taxonomyInfo);
        return `>${rowName}\n${row.aligned}`;
    });
    return {
        msa: [`>${querySeqName}\n${queryRow}`, ...sequences].join('\n'),
        treeMetadata,
    };
}

import { pdbEntryPartners, rcsbEntryUrl } from 'p2s_mapper';
import { CRYSTALLIZATION_ADDITIVES } from '../../ProteinView/crystallizationAdditives';
/** Below this share of the protein a structure is a peptide or one small
 * domain, too short for TM-align to place beside the whole protein */
export const FRAGMENT_COVERAGE = 0.5;
const LIGAND_NAMES = {
    ADP: 'ADP',
    AMP: 'AMP',
    ANP: 'AMP-PNP',
    ATP: 'ATP',
    CA: 'Ca²⁺',
    CD: 'Cd²⁺',
    CO: 'Co²⁺',
    CU: 'Cu²⁺',
    FAD: 'FAD',
    FE: 'Fe³⁺',
    FE2: 'Fe²⁺',
    GCP: 'GppCp',
    GDP: 'GDP',
    GNP: 'GppNHp',
    GSP: 'GTPγS',
    GTP: 'GTP',
    HEM: 'heme',
    MG: 'Mg²⁺',
    MN: 'Mn²⁺',
    NAD: 'NAD⁺',
    NAP: 'NADP⁺',
    NDP: 'NADPH',
    NI: 'Ni²⁺',
    SAH: 'SAH',
    SAM: 'SAM',
    ZN: 'Zn²⁺',
};
// spelled this way in a title that is otherwise lower-cased
const ABBREVIATIONS = [
    'ATP',
    'ADP',
    'CoA',
    'DNA',
    'EM',
    'Fab',
    'GDP',
    'GTP',
    'HLA',
    'MHC',
    'mRNA',
    'NAD',
    'NADP',
    'NMR',
    'RNA',
    'scFv',
    'TCR',
    'tRNA',
];
/**
 * A title deposited in capitals, in sentence case. Any word holding a digit
 * (C118S, P53, HLA-A*11:01) keeps its capitals, as do the names in `keep` and
 * common abbreviations. A title in mixed case is the depositors' own spelling
 * and is left alone.
 */
export function sentenceCase(title, keep = []) {
    const spelled = new Map([...ABBREVIATIONS, ...keep].map(word => [word.toUpperCase(), word]));
    const cased = title.replace(/[A-Za-z0-9]+(?:[-*:'.][A-Za-z0-9]+)*/g, word => /\d/.test(word)
        ? word
        : word.replace(/[A-Za-z]+/g, part => spelled.get(part) ?? part.toLowerCase()));
    return title === title.toUpperCase()
        ? cased.charAt(0).toUpperCase() + cased.slice(1)
        : title;
}
/** What is bound, without what the crystal was grown in */
export function ligandTags(summary) {
    return summary.ligands
        .filter(l => !CRYSTALLIZATION_ADDITIVES.has(l.id))
        .map(l => ({ label: LIGAND_NAMES[l.id] ?? l.id, title: l.name }));
}
/** One tag per partner protein, then one per kind of nucleic acid */
export function partnerTags(summary, uniprotId) {
    const partners = pdbEntryPartners(summary, uniprotId);
    const proteins = partners.filter(p => p.type === 'Protein');
    const nucleic = partners.filter(p => p.type !== 'Protein');
    const tags = [
        ...proteins.map(p => ({
            label: p.description ?? p.entityId,
            title: p.uniprotIds.join(', ') || undefined,
        })),
        ...[...new Set(nucleic.map(p => p.type ?? 'Other'))].map(type => ({
            label: type,
            title: nucleic
                .filter(p => (p.type ?? 'Other') === type)
                .map(p => p.description ?? p.entityId)
                .join('\n'),
        })),
    ];
    return {
        tags: tags.filter((t, i) => tags.findIndex(u => u.label === t.label) === i),
        withProtein: proteins.length > 0,
    };
}
function pdbRow({ entry, summary, geneName, uniprotId, }) {
    const partners = summary ? partnerTags(summary, uniprotId) : undefined;
    const ligands = summary ? ligandTags(summary) : [];
    const id = entry.pdbId.toUpperCase();
    return {
        kind: 'pdb',
        key: `pdb:${entry.pdbId}`,
        entry,
        section: entry.coverage < FRAGMENT_COVERAGE
            ? 'fragment'
            : partners?.withProtein
                ? 'partner'
                : 'alone',
        predicted: false,
        label: id,
        href: rcsbEntryUrl(entry.pdbId),
        title: summary?.title
            ? sentenceCase(summary.title, [
                geneName,
                ...summary.ligands.map(l => l.id),
            ])
            : `PDB entry ${id}`,
        partners: partners?.tags ?? [],
        ligands,
        notes: [],
        start: entry.start,
        end: entry.end,
    };
}
export function alphaFoldEntryUrl(id) {
    return `https://alphafold.ebi.ac.uk/entry/${id}`;
}
function complexRow({ complex, geneName, uniprotId, uniprotLength, }) {
    const entry = uniprotId.replace(/-\d+$/, '');
    const partners = complex.homomer
        ? []
        : complex.members.filter(m => m.accession !== entry);
    return {
        kind: 'complex',
        key: `complex:${complex.entity}`,
        complex,
        section: 'partner',
        predicted: true,
        label: complex.entity,
        href: alphaFoldEntryUrl(complex.entity),
        title: complex.homomer
            ? (complex.name ?? `${geneName} ${complex.oligomericState ?? 'homomer'}`)
            : `${geneName} with ${partners
                .map(p => p.description ?? p.gene ?? p.accession)
                .join(', ')}`,
        partners: partners.map(p => ({
            label: p.gene ?? p.accession,
            title: [p.description, p.accession].filter(Boolean).join(', '),
        })),
        ligands: [],
        notes: [
            {
                label: `${complex.homomer ? 'homo' : 'hetero'}${complex.oligomericState ?? 'mer'}`,
            },
        ],
        start: 1,
        end: uniprotLength,
    };
}
function alphaFoldRow({ model, uniprotId, uniprotLength, }) {
    const isoform = model.accession !== uniprotId.replace(/-\d+$/, '');
    return {
        kind: 'alphafold',
        key: 'alphafold',
        model,
        section: 'alone',
        predicted: true,
        label: `AF-${model.accession}-F1`,
        href: alphaFoldEntryUrl(model.accession),
        title: isoform
            ? `AlphaFold model of isoform ${model.accession}`
            : 'AlphaFold model of the full-length protein',
        partners: [],
        ligands: [],
        notes: [],
        start: 1,
        end: Math.min(model.sequence?.length ?? uniprotLength, uniprotLength),
    };
}
/**
 * Every structure for a gene's protein in the order the dialog lists them:
 * the AlphaFold model, the PDB entries as RCSB ranks them, then the complexes
 * AlphaFold DB predicted. A section keeps that order, so the model leads the
 * protein on its own and experimental complexes lead the predicted ones.
 */
export function structureRows({ geneName, uniprotId, uniprotLength, alphaFold, entries = [], summaries, complexes = [], }) {
    return [
        ...(alphaFold
            ? [alphaFoldRow({ model: alphaFold, uniprotId, uniprotLength })]
            : []),
        ...entries.map(entry => pdbRow({
            entry,
            summary: summaries?.get(entry.pdbId),
            geneName,
            uniprotId,
        })),
        ...complexes.map(complex => complexRow({ complex, geneName, uniprotId, uniprotLength })),
    ];
}
export function matchesFilter(row, filter) {
    return filter === 'all' || (filter === 'predicted') === row.predicted;
}
/**
 * The checked rows after toggling one. A short fragment opens alone, since
 * TM-align has too little of it to place beside the whole protein: checking
 * one unchecks the rest, and checking any other row unchecks it.
 */
export function toggleStructure(checked, row, rows) {
    const fragments = new Set(rows.filter(r => r.section === 'fragment').map(r => r.key));
    return checked.includes(row.key)
        ? checked.filter(key => key !== row.key)
        : row.section === 'fragment'
            ? [row.key]
            : [...checked.filter(key => !fragments.has(key)), row.key];
}
export const SECTIONS = [
    'alone',
    'partner',
    'fragment',
];
/** The rows as the dialog lists them, section by section */
export function listOrder(rows) {
    return SECTIONS.flatMap(section => rows.filter(r => r.section === section));
}
/** The AlphaFold model when there is one, else the list's first structure */
export function defaultChecked(rows) {
    const first = rows.find(r => r.kind === 'alphafold') ?? listOrder(rows)[0];
    return first ? [first.key] : [];
}

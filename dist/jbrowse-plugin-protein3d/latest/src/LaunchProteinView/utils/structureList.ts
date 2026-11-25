import { pdbEntryPartners, rcsbEntryUrl } from 'p2s_mapper'

import { CRYSTALLIZATION_ADDITIVES } from '../../ProteinView/crystallizationAdditives'
import { getTranscriptDisplayName } from './util'

import type { LaunchAlphaFoldModel } from '../resolveGeneLaunch'
import type { DatasetMatch } from './structureDatasets'
import type {
  AlphaFoldComplex,
  ExperimentalStructure,
  PdbEntrySummary,
} from 'p2s_mapper'

/** What a structure shows of the gene's protein, or that the user added it */
export type StructureSection = 'added' | 'alone' | 'partner' | 'fragment'

export type StructureFilter = 'all' | 'experimental' | 'predicted'

export interface StructureTag {
  label: string
  title?: string
}

interface RowBase {
  key: string
  section: StructureSection
  predicted: boolean
  /** the id it is known by, linked to its page */
  label: string
  href: string
  title: string
  partners: StructureTag[]
  ligands: StructureTag[]
  /** anything else worth a tag, such as a complex's kind */
  notes: StructureTag[]
  /** 1-based inclusive UniProt residues it covers */
  start: number
  end: number
}

export type StructureRow =
  | (RowBase & { kind: 'alphafold'; model: LaunchAlphaFoldModel })
  | (RowBase & { kind: 'pdb'; entry: ExperimentalStructure })
  | (RowBase & { kind: 'complex'; complex: AlphaFoldComplex })
  | (RowBase & { kind: 'dataset'; match: DatasetMatch })
  | (Omit<RowBase, 'start' | 'end'> & { kind: 'added'; pdbId: string })

/** Below this share of the protein a structure is a peptide or one small
 * domain, too short for TM-align to place beside the whole protein */
const FRAGMENT_COVERAGE = 0.5

const LIGAND_NAMES: Record<string, string> = {
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
}

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
]

/**
 * A title deposited in capitals, in sentence case. Any word holding a digit
 * (C118S, P53, HLA-A*11:01) keeps its capitals, as do the names in `keep` and
 * common abbreviations. A title in mixed case is the depositors' own spelling
 * and is left alone.
 */
export function sentenceCase(title: string, keep: readonly string[] = []) {
  const spelled = new Map(
    [...ABBREVIATIONS, ...keep].map(word => [word.toUpperCase(), word]),
  )
  const cased = title.replace(/[A-Za-z0-9]+(?:[-*:'.][A-Za-z0-9]+)*/g, word =>
    /\d/.test(word)
      ? word
      : word.replace(
          /[A-Za-z]+/g,
          part => spelled.get(part) ?? part.toLowerCase(),
        ),
  )
  return title === title.toUpperCase()
    ? cased.charAt(0).toUpperCase() + cased.slice(1)
    : title
}

/** What is bound, without what the crystal was grown in */
export function ligandTags(summary: PdbEntrySummary): StructureTag[] {
  return summary.ligands
    .filter(l => !CRYSTALLIZATION_ADDITIVES.has(l.id))
    .map(l => ({ label: LIGAND_NAMES[l.id] ?? l.id, title: l.name }))
}

/** One tag per partner protein, then one per kind of nucleic acid */
export function partnerTags(summary: PdbEntrySummary, uniprotId: string) {
  const partners = pdbEntryPartners(summary, uniprotId)
  const proteins = partners.filter(p => p.type === 'Protein')
  const nucleic = partners.filter(p => p.type !== 'Protein')
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
  ]
  return {
    tags: tags.filter((t, i) => tags.findIndex(u => u.label === t.label) === i),
    withProtein: proteins.length > 0,
  }
}

function pdbTitle(
  pdbId: string,
  summary: PdbEntrySummary | undefined,
  geneName: string,
) {
  return summary?.title
    ? sentenceCase(summary.title, [geneName, ...summary.ligands.map(l => l.id)])
    : `PDB entry ${pdbId.toUpperCase()}`
}

function pdbRow({
  entry,
  summary,
  geneName,
  uniprotId,
}: {
  entry: ExperimentalStructure
  summary?: PdbEntrySummary
  geneName: string
  uniprotId: string
}): StructureRow {
  const partners = summary ? partnerTags(summary, uniprotId) : undefined
  const ligands = summary ? ligandTags(summary) : []
  return {
    kind: 'pdb',
    key: `pdb:${entry.pdbId}`,
    entry,
    section:
      entry.coverage < FRAGMENT_COVERAGE
        ? 'fragment'
        : partners?.withProtein
          ? 'partner'
          : 'alone',
    predicted: false,
    label: entry.pdbId.toUpperCase(),
    href: rcsbEntryUrl(entry.pdbId),
    title: pdbTitle(entry.pdbId, summary, geneName),
    partners: partners?.tags ?? [],
    ligands,
    notes: [],
    start: entry.start,
    end: entry.end,
  }
}

/**
 * An entry added by its PDB id, which RCSB may file under another protein: a
 * complex listed under its partner, an entry a paper names. With no accession
 * every polymer counts as a partner. What it covers is unknown until it loads.
 */
export function addedRow({
  pdbId,
  summary,
  geneName,
  uniprotId = '',
}: {
  pdbId: string
  summary?: PdbEntrySummary
  geneName: string
  uniprotId?: string
}): StructureRow {
  return {
    kind: 'added',
    key: `pdb:${pdbId}`,
    pdbId,
    section: 'added',
    predicted: false,
    label: pdbId.toUpperCase(),
    href: rcsbEntryUrl(pdbId),
    title: pdbTitle(pdbId, summary, geneName),
    partners: summary ? partnerTags(summary, uniprotId).tags : [],
    ligands: summary ? ligandTags(summary) : [],
    notes: [],
  }
}

export function alphaFoldEntryUrl(id: string) {
  return `https://alphafold.ebi.ac.uk/entry/${id}`
}

function complexRow({
  complex,
  geneName,
  uniprotId,
  uniprotLength,
}: {
  complex: AlphaFoldComplex
  geneName: string
  uniprotId: string
  uniprotLength: number
}): StructureRow {
  const entry = uniprotId.replace(/-\d+$/, '')
  const partners = complex.homomer
    ? []
    : complex.members.filter(m => m.accession !== entry)
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
  }
}

function alphaFoldRow({
  model,
  uniprotId,
  uniprotLength,
}: {
  model: LaunchAlphaFoldModel
  uniprotId: string
  uniprotLength: number
}): StructureRow {
  const isoform = model.accession !== uniprotId.replace(/-\d+$/, '')
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
  }
}

function fileName(url: string) {
  return decodeURIComponent(new URL(url).pathname.split('/').pop() ?? url)
}

/**
 * A structure a site's dataset lists for the gene, as one of the protein on
 * its own: what a site folds is the transcript's whole translation. Its
 * residues are not known until it loads, so it claims the whole protein.
 */
export function datasetRow({
  match,
  geneName,
  uniprotLength,
}: {
  match: DatasetMatch
  geneName: string
  uniprotLength: number
}): StructureRow {
  const { dataset, structure, transcript } = match
  return {
    kind: 'dataset',
    key: `dataset:${dataset.datasetId}:${structure.id}:${fileName(structure.url)}`,
    match,
    section: 'alone',
    predicted: true,
    label: structure.label ?? fileName(structure.url),
    href: structure.url,
    title: transcript
      ? `${dataset.name} model of transcript ${getTranscriptDisplayName(transcript) || structure.id}`
      : `${dataset.name} model of ${geneName}`,
    partners: [],
    ligands: [],
    notes: [],
    start: 1,
    end: uniprotLength,
  }
}

/**
 * Every structure for a gene's protein in the order the dialog lists them:
 * the AlphaFold model, the PDB entries as RCSB ranks them, then the complexes
 * AlphaFold DB predicted. A section keeps that order, so the model leads the
 * protein on its own and experimental complexes lead the predicted ones.
 */
export function structureRows({
  geneName,
  uniprotId,
  uniprotLength,
  alphaFold,
  entries = [],
  summaries,
  complexes = [],
}: {
  geneName: string
  uniprotId: string
  uniprotLength: number
  alphaFold?: LaunchAlphaFoldModel
  entries?: readonly ExperimentalStructure[]
  summaries?: ReadonlyMap<string, PdbEntrySummary>
  complexes?: readonly AlphaFoldComplex[]
}) {
  return [
    ...(alphaFold
      ? [alphaFoldRow({ model: alphaFold, uniprotId, uniprotLength })]
      : []),
    ...entries.map(entry =>
      pdbRow({
        entry,
        summary: summaries?.get(entry.pdbId),
        geneName,
        uniprotId,
      }),
    ),
    ...complexes.map(complex =>
      complexRow({ complex, geneName, uniprotId, uniprotLength }),
    ),
  ]
}

/**
 * The rows of the entries added by id that the listing does not already hold,
 * and the ids RCSB described no entry for. An entry RCSB has not described
 * yet, or could not, is listed under its id alone.
 */
export function addedRows({
  pdbIds,
  summaries,
  listed,
  geneName,
  uniprotId,
}: {
  pdbIds: readonly string[]
  summaries?: ReadonlyMap<string, PdbEntrySummary>
  listed: readonly StructureRow[]
  geneName: string
  uniprotId?: string
}) {
  const unknown = summaries ? pdbIds.filter(id => !summaries.has(id)) : []
  return {
    rows: pdbIds
      .filter(
        id => !unknown.includes(id) && !listed.some(r => r.key === `pdb:${id}`),
      )
      .map(pdbId =>
        addedRow({
          pdbId,
          summary: summaries?.get(pdbId),
          geneName,
          uniprotId,
        }),
      ),
    unknown,
  }
}

/** An entry added by its PDB id, and whether it is checked. It outlives the
 * accession, which the pick of listed rows belongs to. */
export interface AddedEntry {
  pdbId: string
  checked: boolean
}

function addedKey(pdbId: string) {
  return `pdb:${pdbId}`
}

/** The checked rows: the listed ones picked for the accession, and the
 * entries added by id, wherever they are now listed */
export function checkedKeys(
  listed: readonly string[],
  added: readonly AddedEntry[],
) {
  return [
    ...new Set([
      ...listed,
      ...added.filter(a => a.checked).map(a => addedKey(a.pdbId)),
    ]),
  ]
}

/** Checked keys split back into the pick of listed rows and the added
 * entries, so a change of accession resets the one and keeps the other */
export function splitChecked(
  keys: readonly string[],
  added: readonly AddedEntry[],
) {
  const addedKeys = new Set(added.map(a => addedKey(a.pdbId)))
  return {
    listed: keys.filter(key => !addedKeys.has(key)),
    added: added.map(a => ({
      ...a,
      checked: keys.includes(addedKey(a.pdbId)),
    })),
  }
}

/**
 * Adding an id, checked beside the checked rows: an id added before is checked
 * again, a new one goes last, and ids RCSB has no entry for are dropped. A
 * listed entry is checked in its own section, and kept as added so it stays
 * checked if the accession changes.
 */
export function addPdbId({
  pdbId,
  added,
  unknown,
  checked,
  rows,
}: {
  pdbId: string
  added: readonly AddedEntry[]
  unknown: readonly string[]
  checked: readonly string[]
  rows: readonly StructureRow[]
}) {
  const key = addedKey(pdbId)
  const kept = added.filter(a => !unknown.includes(a.pdbId))
  return splitChecked(
    checked.includes(key)
      ? checked
      : toggleStructure(
          checked,
          rows.find(r => r.key === key) ?? { key, section: 'added' },
          rows,
        ),
    kept.some(a => a.pdbId === pdbId)
      ? kept
      : [...kept, { pdbId, checked: true }],
  )
}

export function matchesFilter(row: StructureRow, filter: StructureFilter) {
  return filter === 'all' || (filter === 'predicted') === row.predicted
}

/**
 * The checked rows after toggling one. A short fragment opens alone, since
 * TM-align has too little of it to place beside the whole protein: checking
 * one unchecks the rest, and checking any other row unchecks it.
 */
export function toggleStructure(
  checked: readonly string[],
  row: Pick<StructureRow, 'key' | 'section'>,
  rows: readonly StructureRow[],
) {
  const fragments = new Set(
    rows.filter(r => r.section === 'fragment').map(r => r.key),
  )
  return checked.includes(row.key)
    ? checked.filter(key => key !== row.key)
    : row.section === 'fragment'
      ? [row.key]
      : [...checked.filter(key => !fragments.has(key)), row.key]
}

// the added entries last, as they come last in the launch, so the first
// checked row shown is the one the rest are superposed onto
export const SECTIONS: readonly StructureSection[] = [
  'alone',
  'partner',
  'fragment',
  'added',
]

/** The rows as the dialog lists them, section by section */
export function listOrder(rows: readonly StructureRow[]) {
  return SECTIONS.flatMap(section => rows.filter(r => r.section === section))
}

/** A folded section's first rows, and any checked row below them, in order */
export function firstRowsAndChecked(
  rows: readonly StructureRow[],
  checked: readonly string[],
  count: number,
) {
  return rows.filter((r, i) => i < count || checked.includes(r.key))
}

/**
 * A site's own structure when its datasets list one, else the AlphaFold model,
 * else the list's first structure. The site's leads because it was folded from
 * the transcript its mapping names, so the launch maps through that transcript
 * with no ranking, and because a site's genome often has no AlphaFold model.
 */
export function defaultChecked(rows: readonly StructureRow[]) {
  const first =
    rows.find(r => r.kind === 'dataset') ??
    rows.find(r => r.kind === 'alphafold') ??
    listOrder(rows)[0]
  return first ? [first.key] : []
}

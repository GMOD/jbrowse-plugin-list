import {
  isConfigurationModel,
  readConfObject,
} from '@jbrowse/core/configuration'
import { fetchAndMaybeUnzipText, isUriLocation } from '@jbrowse/core/util'
import { openLocation } from '@jbrowse/core/util/io'
import { getEnv, isStateTreeNode } from '@jbrowse/mobx-state-tree'

import { isRecord } from './isRecord'
import { codingTranscripts, flaggedTranscriptId } from '../codingFeature'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { Feature, FileLocation } from '@jbrowse/core/util'

/** A set of structures a site declares under `protein3d.datasets` */
export interface StructureDataset {
  datasetId: string
  name: string
  description: string
  mappingLocation: FileLocation
}

/** One row of a dataset's mapping file */
export interface MappedStructure {
  /** the id it is listed under, as the file spells it */
  id: string
  url: string
  uniprotId?: string
  label?: string
}

export interface StructureMapping {
  /** what a relative url is read against: the mapping file's own */
  baseUrl: string
  /** each row's line, by its id without a version */
  lines: ReadonlyMap<string, string[]>
}

export interface DatasetMatch {
  dataset: StructureDataset
  structure: MappedStructure
  /** the coding transcript the id named, or none when it named the gene */
  transcript?: Feature
}

function text(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function readDataset(value: unknown): StructureDataset[] {
  const location = isRecord(value) ? value.mappingLocation : undefined
  return isRecord(value) &&
    isUriLocation(location) &&
    text(value.datasetId) !== ''
    ? [
        {
          datasetId: text(value.datasetId),
          name: text(value.name) || text(value.datasetId),
          description: text(value.description),
          mappingLocation: location,
        },
      ]
    : []
}

/**
 * The datasets the config declares, each with an id and a mapping file. The
 * slot is the plugin's root configuration schema, which the host mounts on its
 * config model beside the members the core type names.
 */
export function readStructureDatasets(jbrowse: object): StructureDataset[] {
  const conf = 'protein3d' in jbrowse ? jbrowse.protein3d : undefined
  const datasets: unknown = isConfigurationModel(conf)
    ? readConfObject(conf, 'datasets')
    : undefined
  return Array.isArray(datasets) ? datasets.flatMap(readDataset) : []
}

const ID_PREFIX = /^(?:transcript:|gene:|rna-|gene-|cds-)/
const VERSION = /\.\d+$/

function bareId(id: string) {
  return id.trim().replace(ID_PREFIX, '')
}

function append(map: Map<string, string[]>, key: string, value: string) {
  const list = map.get(key)
  if (list) {
    list.push(value)
  } else {
    map.set(key, [value])
  }
}

/**
 * A mapping file's rows by id: tab-separated id, structure url, and optionally
 * a UniProt accession and a label. A line starting with `#` is a comment. Only
 * the id is read here; a row's other fields wait until a gene asks for it, which
 * keeps a 60,000-row file to one pass of `indexOf`.
 */
export function parseStructureMapping(
  content: string,
  baseUrl: string,
): StructureMapping {
  const lines = new Map<string, string[]>()
  for (const line of content.split('\n')) {
    const tab = line.indexOf('\t')
    const id =
      tab > 0 && !line.startsWith('#') ? bareId(line.slice(0, tab)) : ''
    if (id !== '') {
      append(lines, id.replace(VERSION, ''), line)
    }
  }
  return { baseUrl, lines }
}

function readRow(line: string, baseUrl: string): MappedStructure[] {
  const [id = '', url = '', uniprotId = '', label = ''] = line
    .replace(/\r$/, '')
    .split('\t')
    .map(field => field.trim())
  return url === '' || !URL.canParse(url, baseUrl)
    ? []
    : [
        {
          id,
          url: new URL(url, baseUrl).href,
          uniprotId: uniprotId || undefined,
          label: label || undefined,
        },
      ]
}

/**
 * The structures listed under an id, with urls read against the mapping file.
 * A version written on only one side is ignored, so `ENST00000369535` finds
 * `ENST00000369535.5` and the other way round, but two different versions are
 * two different transcripts: TAIR's `AT1G01010.2` is not `AT1G01010.1`.
 */
export function structuresFor(mapping: StructureMapping, rawId: string) {
  const id = bareId(rawId)
  const base = id.replace(VERSION, '')
  const listed = (mapping.lines.get(base) ?? []).flatMap(line =>
    readRow(line, mapping.baseUrl),
  )
  const exact = listed.filter(s => bareId(s.id) === id)
  return exact.length > 0
    ? exact
    : base === id
      ? listed
      : listed.filter(s => bareId(s.id) === base)
}

function idsOf(feature: Feature, attributes: readonly string[]) {
  return [
    ...new Set(
      attributes.map(a => feature.get(a)).filter(v => typeof v === 'string'),
    ),
  ]
}

const TRANSCRIPT_IDS = ['name', 'Name', 'id', 'ID', 'transcript_id']
const PROTEIN_IDS = ['protein_id']
const GENE_IDS = ['gene_name', 'gene', 'name', 'Name', 'gene_id', 'id', 'ID']

function transcriptIds(transcript: Feature) {
  const cds = transcript
    .get('subfeatures')
    ?.find(sub => sub.get('type')?.toLowerCase() === 'cds')
  return [
    ...idsOf(transcript, [...TRANSCRIPT_IDS, ...PROTEIN_IDS]),
    ...(cds ? idsOf(cds, PROTEIN_IDS) : []),
  ]
}

function lookUp(mapping: StructureMapping, ids: readonly string[]) {
  return ids.flatMap(id => structuresFor(mapping, id))
}

/** The right-clicked isoform first, then the one flagged representative */
function transcriptOrder(feature: Feature, preferredTranscriptId?: string) {
  const transcripts = codingTranscripts(feature)
  const flagged = flaggedTranscriptId(transcripts)
  const rank = (t: Feature) =>
    t.id() === preferredTranscriptId ? 0 : t.id() === flagged ? 1 : 2
  return transcripts
    .map((t, i) => ({ t, i }))
    .sort((a, b) => rank(a.t) - rank(b.t) || a.i - b.i)
    .map(({ t }) => t)
}

/**
 * What a dataset holds for a gene: a structure listed under one of its coding
 * transcripts, by any of the transcript's ids or its protein's, else under the
 * gene itself. Each structure appears once, under the first id that names it.
 */
export function datasetMatches({
  dataset,
  mapping,
  feature,
  preferredTranscriptId,
}: {
  dataset: StructureDataset
  mapping: StructureMapping
  feature: Feature
  preferredTranscriptId?: string
}): DatasetMatch[] {
  const byTranscript = transcriptOrder(feature, preferredTranscriptId).flatMap(
    transcript =>
      lookUp(mapping, transcriptIds(transcript)).map(structure => ({
        dataset,
        structure,
        transcript,
      })),
  )
  const byGene = lookUp(mapping, idsOf(feature, GENE_IDS)).map(structure => ({
    dataset,
    structure,
  }))
  const seen = new Set<string>()
  return [...byTranscript, ...byGene].filter(match => {
    const fresh = !seen.has(match.structure.url)
    seen.add(match.structure.url)
    return fresh
  })
}

/** Where the mapping file is, which its relative urls are read against */
export function mappingUrl(location: FileLocation) {
  return isUriLocation(location)
    ? new URL(location.uri, location.baseUri ?? window.location.href).href
    : window.location.href
}

/** The host's, for a mapping file behind one of its internet accounts */
export function hostPluginManager(jbrowse: object) {
  return isStateTreeNode(jbrowse)
    ? getEnv<{ pluginManager?: PluginManager }>(jbrowse).pluginManager
    : undefined
}

const loaded = new Map<string, Promise<StructureMapping>>()

/**
 * A dataset's mapping, fetched once a page however many dialogs and launches
 * read it. A failed fetch is forgotten, so the next dialog asks again.
 */
export function loadStructureMapping(
  dataset: StructureDataset,
  pluginManager?: PluginManager,
) {
  const url = mappingUrl(dataset.mappingLocation)
  const pending =
    loaded.get(url) ??
    fetchAndMaybeUnzipText(
      openLocation(dataset.mappingLocation, pluginManager),
    ).then(content => parseStructureMapping(content, url))
  loaded.set(url, pending)
  pending.catch(() => {
    loaded.delete(url)
  })
  return pending
}

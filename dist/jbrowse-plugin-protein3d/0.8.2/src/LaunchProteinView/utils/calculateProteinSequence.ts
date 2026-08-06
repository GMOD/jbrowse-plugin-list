import { getConf } from '@jbrowse/core/configuration'
import { revcom } from '@jbrowse/core/util'
import { convertCodingSequenceToPeptides } from '@jbrowse/core/util/convertCodingSequenceToPeptides'

import { getGeneticCode, parseTranslTable } from './geneticCodes'

import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'

// `@jbrowse/core/util/convertCodingSequenceToPeptides` is a deep path, so unlike
// the `@jbrowse/core/util` barrel it is absent from ReExports and gets bundled
// rather than resolved out of the host's JBrowseExports. That is what makes
// reusing core's translation safe across every host a config names. This module
// used to read `defaultCodonTable` off the barrel, and a core build that dropped
// that export turned it into `Object.keys(undefined)` inside the published
// bundle, surfacing as "Could not launch protein view: TypeError".

export interface Feat {
  start: number
  end: number
  type: string
  // GFF phase of the first coding base; convertCodingSequenceToPeptides reads it
  // off cds[0] to start translation in the right frame
  phase?: number
}

export function calculateProteinSequence({
  cds,
  sequence,
  geneticCodeId,
}: {
  cds: Feat[]
  sequence: string
  geneticCodeId?: number
}) {
  // `starts` is deliberately not passed: @jbrowse/core 4.3.0's signature has no
  // such parameter, so alternative initiators (GTG under table 11, ATA under
  // table 2) render as their internal residue rather than M. Core main added it;
  // pass it here when the @jbrowse/core floor reaches that release.
  const { codonTable } = getGeneticCode(geneticCodeId)
  return convertCodingSequenceToPeptides({
    cds,
    sequence,
    codonTable,
  })
}

function revlist(list: Feat[], seqlen: number) {
  return list
    .map(sub => ({
      ...sub,
      start: seqlen - sub.end,
      end: seqlen - sub.start,
    }))
    .toSorted((a, b) => a.start - b.start)
}

function getItemId(feat: Feat) {
  return `${feat.start}-${feat.end}`
}

function dedupe(list: Feat[]) {
  return list.filter(
    (item, pos, ary) => !pos || getItemId(item) !== getItemId(ary[pos - 1]!),
  )
}

function getProteinSequence({
  feature,
  seq,
}: {
  seq: string
  feature: Feature
}) {
  const featureStart = feature.get('start')
  const strand = feature.get('strand')
  const subfeatures = feature.get('subfeatures') ?? []
  const cds = dedupe(
    subfeatures
      .toSorted((a, b) => a.get('start') - b.get('start'))
      .map(sub => ({
        start: sub.get('start') - featureStart,
        end: sub.get('end') - featureStart,
        type: sub.get('type'),
        phase: sub.get('phase'),
      }))
      .filter(f => f.type === 'CDS'),
  )

  // a mitochondrial gene declares e.g. transl_table=2, so it translates with
  // NCBI table 2 rather than the standard code. GFF3 usually carries the
  // attribute on the CDS rather than the transcript, so check both.
  const cdsSubfeature = subfeatures.find(
    (f: Feature) => f.get('type')?.toLowerCase() === 'cds',
  )
  const geneticCodeId =
    parseTranslTable(feature.get('transl_table')) ??
    parseTranslTable(cdsSubfeature?.get('transl_table'))

  return calculateProteinSequence({
    cds: strand === -1 ? revlist(cds, seq.length) : cds,
    sequence: strand === -1 ? revcom(seq) : seq,
    geneticCodeId,
  })
}

export async function fetchProteinSeq({
  feature,
  session,
  assemblyName,
}: {
  feature: Feature
  session: AbstractSessionModel
  assemblyName: string | undefined
}) {
  const start = feature.get('start')
  const end = feature.get('end')
  const refName = feature.get('refName')
  const { assemblyManager, rpcManager } = session
  const assembly = assemblyName
    ? await assemblyManager.waitForAssembly(assemblyName)
    : undefined
  if (!assembly) {
    throw new Error('assembly not found')
  }
  const sessionId = 'getSequence'
  const feats = await rpcManager.call(sessionId, 'CoreGetFeatures', {
    adapterConfig: getConf(assembly, ['sequence', 'adapter']),
    sessionId,
    regions: [
      {
        start,
        end,
        refName: assembly.getCanonicalRefName(refName),
        assemblyName,
      },
    ],
  })

  const [feat] = feats as Feature[]
  const seq = feat?.get('seq') as string | undefined
  return seq ? getProteinSequence({ seq, feature }) : undefined
}

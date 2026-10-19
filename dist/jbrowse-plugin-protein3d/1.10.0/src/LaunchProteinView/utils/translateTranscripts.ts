import { getConf } from '@jbrowse/core/configuration'
import { translateTranscript } from '@jbrowse/core/util/translateTranscript'

import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'

function translate(
  transcript: Feature,
  seq: string,
  assemblyGeneticCodeId?: number,
) {
  return translateTranscript({ transcript, seq, assemblyGeneticCodeId })
    ?.protein
}

/** The genome under one span, with the assembly's code for that contig. */
export async function fetchRegionSequence({
  session,
  assemblyName,
  refName,
  start,
  end,
}: {
  session: AbstractSessionModel
  assemblyName: string | undefined
  refName: string
  start: number
  end: number
}) {
  const { assemblyManager, rpcManager } = session
  const assembly = assemblyName
    ? await assemblyManager.waitForAssembly(assemblyName)
    : undefined
  if (!assembly) {
    throw new Error('assembly not found')
  }
  const [feat] = await rpcManager.call('getSequence', 'CoreGetFeatures', {
    adapterConfig: getConf(assembly, ['sequence', 'adapter']),
    regions: [
      {
        start,
        end,
        refName: assembly.getCanonicalRefName(refName) ?? refName,
        assemblyName: assembly.name,
      },
    ],
  })
  const seq: unknown = feat?.get('seq')
  return {
    seq: typeof seq === 'string' ? seq : undefined,
    assemblyGeneticCodeId: assembly.getGeneticCodeId(refName),
  }
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
  const { seq, assemblyGeneticCodeId } = await fetchRegionSequence({
    session,
    assemblyName,
    refName: feature.get('refName'),
    start: feature.get('start'),
    end: feature.get('end'),
  })
  return seq ? translate(feature, seq, assemblyGeneticCodeId) : undefined
}

export interface TranscriptTranslation {
  feature: Feature
  /** absent for a transcript with no CDS to translate, or one that threw */
  seq?: string
  error?: unknown
}

interface SpanSequence {
  seq?: string
  assemblyGeneticCodeId?: number
}

/**
 * Translate several transcripts of one gene off a single sequence fetch. The
 * transcripts overlap, so one request for the span covering them all costs a
 * 20-isoform gene one round trip instead of twenty. `fetchSpan` is a parameter
 * so the slicing can be tested without a session.
 */
export async function translateTranscripts({
  transcripts,
  fetchSpan,
}: {
  transcripts: Feature[]
  fetchSpan: (span: {
    refName: string
    start: number
    end: number
  }) => Promise<SpanSequence>
}): Promise<TranscriptTranslation[]> {
  const first = transcripts[0]
  if (!first) {
    return []
  }
  const spanStart = Math.min(...transcripts.map(f => f.get('start')))
  const spanEnd = Math.max(...transcripts.map(f => f.get('end')))
  const { seq, assemblyGeneticCodeId } = await fetchSpan({
    refName: first.get('refName'),
    start: spanStart,
    end: spanEnd,
  })
  if (!seq) {
    return transcripts.map(feature => ({ feature }))
  }
  return transcripts.map(feature => {
    try {
      // A transcript with no CDS — a retained_intron or an lncRNA — has no
      // protein rather than a zero-length one. Reported as untranslated, it
      // stays a disabled "(no data)" row instead of a selectable "(0aa)"
      // isoform the ranking could pick.
      const protein = translate(
        feature,
        seq.slice(
          feature.get('start') - spanStart,
          feature.get('end') - spanStart,
        ),
        assemblyGeneticCodeId,
      )
      return protein ? { feature, seq: protein } : { feature }
    } catch (e) {
      return { feature, error: e }
    }
  })
}

export async function fetchTranscriptProteinSeqs({
  transcripts,
  session,
  assemblyName,
}: {
  transcripts: Feature[]
  session: AbstractSessionModel
  assemblyName: string | undefined
}) {
  return translateTranscripts({
    transcripts,
    fetchSpan: span => fetchRegionSequence({ session, assemblyName, ...span }),
  })
}

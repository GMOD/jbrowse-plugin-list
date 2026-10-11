import { TabixIndexedFile } from '@gmod/tabix'
import { getGeneticCode } from '@jbrowse/core/util/geneticCodes'
import { transcriptGeneticCodeId } from '@jbrowse/core/util/translateTranscript'

import {
  clinVarRefName,
  clinVarVcfUrl,
  isWrongBuild,
  parseClinVarSnv,
  pathogenicCountByTranscriptPosition,
} from './clinVar'
import { VariantEffectRefusal } from './variantEffects'
import { fetchRegionSequence } from '../LaunchProteinView/utils/translateTranscripts'
import { genomeToTranscriptSeqMapping } from '../mappings'

import type { ClinVarBuild, ClinVarSnv } from './clinVar'
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'

const files = new Map<ClinVarBuild, TabixIndexedFile>()

function clinVarVcf(build: ClinVarBuild) {
  let file = files.get(build)
  if (!file) {
    const url = clinVarVcfUrl(build)
    file = new TabixIndexedFile({ url, tbiUrl: `${url}.tbi` })
    files.set(build, file)
  }
  return file
}

async function readPathogenicSnvs(
  build: ClinVarBuild,
  refNames: readonly string[],
  start: number,
  end: number,
  signal: AbortSignal,
) {
  const file = clinVarVcf(build)
  const names = await file.getReferenceSequenceNames({ signal })
  const refName = refNames
    .map(n => clinVarRefName(n, build))
    .find(n => n !== undefined && names.includes(n))
  if (!refName) {
    throw new Error(`ClinVar's ${build} VCF has no sequence ${refNames[0]}`)
  }
  const variants: ClinVarSnv[] = []
  await file.getLines(refName, start, end, {
    signal,
    lineCallback: line => {
      const snv = parseClinVarSnv(line)
      if (snv) {
        variants.push(snv)
      }
    },
  })
  return variants
}

/**
 * The pathogenic missense count at each residue of a transcript, read from
 * NCBI's ClinVar VCF by range over the transcript's coding span and translated
 * on the genome under it
 */
export async function fetchClinVarCounts({
  build,
  feature,
  assemblyName,
  session,
  signal,
}: {
  build: ClinVarBuild
  feature: Feature
  assemblyName: string
  session: AbstractSessionModel
  signal: AbortSignal
}) {
  const { p2gCodon, strand, refName } = genomeToTranscriptSeqMapping(feature)
  const positions = Object.values(p2gCodon).flat()
  if (positions.length === 0) {
    throw new Error('the transcript has no coding sequence')
  }
  const start = Math.min(...positions)
  const end = Math.max(...positions) + 1
  const assembly = await session.assemblyManager.waitForAssembly(assemblyName)
  const [variants, genome] = await Promise.all([
    readPathogenicSnvs(
      build,
      [refName, ...(assembly?.getAliasesForRefName(refName) ?? [])],
      start,
      end,
      signal,
    ),
    fetchRegionSequence({ session, assemblyName, refName, start, end }),
  ])
  const { seq, assemblyGeneticCodeId } = genome
  if (!seq) {
    throw new Error('no genome sequence under the transcript')
  }
  const counts = pathogenicCountByTranscriptPosition({
    variants,
    p2gCodon,
    strand,
    genomeBase: position => seq[position - start],
    codonTable: getGeneticCode(
      transcriptGeneticCodeId(feature, assemblyGeneticCodeId),
    ).codonTable,
  })
  if (isWrongBuild(counts)) {
    throw new VariantEffectRefusal(
      `ClinVar's REF disagrees with this assembly's sequence at ${counts.disagreeing} of ${counts.checked} variants; is the assembly ${build}?`,
    )
  }
  return counts.byPosition
}

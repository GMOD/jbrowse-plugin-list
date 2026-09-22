import { getSession } from '@jbrowse/core/util'

import { codingSpans } from '../mappings'

import type { Region } from '@jbrowse/core/util/types'
import type { IAnyStateTreeNode } from '@jbrowse/mobx-state-tree'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'
import type { PairwiseAlignment } from 'p2s_mapper'

interface GenomeToTranscriptSeqMapping {
  p2gCodon: Record<number, number[]>
  strand: number
  refName: string
}

/**
 * Minimal model shape needed to map structure positions to genome coords.
 */
interface ProteinGenomeMappingModel {
  genomeToTranscriptSeqMapping: GenomeToTranscriptSeqMapping | undefined
  pairwiseAlignment: PairwiseAlignment | undefined
  structureSeqToTranscriptSeqPosition: Record<number, number> | undefined
}

type NavigateToProteinPositionModel = IAnyStateTreeNode &
  ProteinGenomeMappingModel & {
    connectedView: LinearGenomeViewModel | undefined
  }

export type ClickProteinToGenomeModel = NavigateToProteinPositionModel & {
  zoomToBaseLevel: boolean
  setClickedStructureRange: (range?: { start: number; end: number }) => void
}

// The coding spans under a structure-residue range, through the residues the
// alignment pairs with the transcript
function structureRangeSpans(
  model: ProteinGenomeMappingModel,
  range: { start: number; end: number },
) {
  const mapping = model.genomeToTranscriptSeqMapping
  if (!mapping || !model.pairwiseAlignment) {
    return []
  }
  const transcriptPositions: number[] = []
  for (let pos = range.start; pos < range.end; pos++) {
    const transcriptPos = model.structureSeqToTranscriptSeqPosition?.[pos]
    if (transcriptPos !== undefined) {
      transcriptPositions.push(transcriptPos)
    }
  }
  return codingSpans(mapping.p2gCodon, transcriptPositions)
}

/**
 * The genome a structure-residue range covers, one region per stretch of
 * contiguous coding bases, as a JBrowse highlight takes them. Pure: the caller
 * supplies the assembly and the mapping, so the same conversion serves the
 * hover band, the click band and a test with neither a session nor a connected
 * view.
 */
export function structureRangeToGenomeRegions({
  range,
  assemblyName,
  model,
}: {
  range: { start: number; end: number } | undefined
  assemblyName: string | undefined
  model: ProteinGenomeMappingModel
}): Region[] {
  const refName = model.genomeToTranscriptSeqMapping?.refName
  return range && assemblyName && refName
    ? structureRangeSpans(model, range).map(([start, end]) => ({
        assemblyName,
        refName,
        start,
        end,
      }))
    : []
}

export async function navigateToProteinPosition({
  model,
  structureSeqPos,
  structureSeqEndPos,
  zoomToBaseLevel,
}: {
  structureSeqPos: number
  structureSeqEndPos?: number
  model: NavigateToProteinPositionModel
  zoomToBaseLevel: boolean
}) {
  const session = getSession(model)
  const { connectedView, genomeToTranscriptSeqMapping } = model
  if (!genomeToTranscriptSeqMapping || !connectedView) {
    return
  }
  const { strand, refName } = genomeToTranscriptSeqMapping
  const assemblyName = connectedView.assemblyNames[0]
  if (!assemblyName) {
    return
  }

  const spans = structureRangeSpans(model, {
    start: structureSeqPos,
    end: structureSeqEndPos ?? structureSeqPos + 1,
  })
  const start = spans[0]?.[0]
  const end = spans.at(-1)?.[1]
  if (start === undefined || end === undefined) {
    return
  }

  if (zoomToBaseLevel) {
    // start/end are 0-based half-open (from getCodonRanges). navToLocString
    // parses a 1-based locString (parseLocString does start -= 1), so the start
    // must be shifted to 1-based; the half-open end already equals the 1-based
    // inclusive end. Passing the raw 0-based start landed the view 1bp 5'.
    await connectedView.navToLocString(
      `${refName}:${start + 1}-${end}${strand === -1 ? '[rev]' : ''}`,
      undefined,
      0.2,
    )
  } else {
    const { assemblyManager } = session
    const assembly = assemblyManager.get(assemblyName)
    const canonicalRefName = assembly?.getCanonicalRefName(refName) ?? refName
    connectedView.centerAt(start, canonicalRefName)
  }
}

export async function clickProteinToGenome({
  model,
  structureSeqPos,
  structureSeqEndPos,
}: {
  structureSeqPos: number
  structureSeqEndPos?: number
  model: ClickProteinToGenomeModel
}) {
  model.setClickedStructureRange({
    start: structureSeqPos,
    end: structureSeqEndPos ?? structureSeqPos + 1,
  })
  await navigateToProteinPosition({
    model,
    structureSeqPos,
    structureSeqEndPos,
    zoomToBaseLevel: model.zoomToBaseLevel,
  })
}

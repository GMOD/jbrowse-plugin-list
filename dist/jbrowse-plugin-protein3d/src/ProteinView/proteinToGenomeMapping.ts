import { getSession } from '@jbrowse/core/util'
import { getCodonRange } from 'g2p_mapper'

import type { JBrowsePluginProteinStructureModel } from './model'

/**
 * Maps a protein structure position to genome coordinates
 * @returns [start, end] tuple of genome coordinates, or undefined if mapping fails
 */
export function proteinToGenomeMapping({
  model,
  structureSeqPos,
}: {
  structureSeqPos: number
  model: JBrowsePluginProteinStructureModel
}) {
  const {
    genomeToTranscriptSeqMapping,
    pairwiseAlignment,
    structureSeqToTranscriptSeqPosition,
  } = model

  if (!genomeToTranscriptSeqMapping || !pairwiseAlignment) {
    return undefined
  }

  const { p2g, strand } = genomeToTranscriptSeqMapping
  const transcriptPos = structureSeqToTranscriptSeqPosition?.[structureSeqPos]

  if (transcriptPos === undefined) {
    return undefined
  }

  return getCodonRange(p2g, transcriptPos, strand)
}

/**
 * Maps a protein structure range to genome coordinates
 * @returns [start, end] tuple of genome coordinates spanning the full range, or undefined if mapping fails
 */
export function proteinRangeToGenomeMapping({
  model,
  structureSeqPos,
  structureSeqEndPos,
}: {
  structureSeqPos: number
  structureSeqEndPos: number
  model: JBrowsePluginProteinStructureModel
}) {
  let minStart: number | undefined
  let maxEnd: number | undefined
  for (let pos = structureSeqPos; pos < structureSeqEndPos; pos++) {
    const result = proteinToGenomeMapping({ structureSeqPos: pos, model })
    if (result) {
      const [s, e] = result
      if (minStart === undefined || s < minStart) {
        minStart = s
      }
      if (maxEnd === undefined || e > maxEnd) {
        maxEnd = e
      }
    }
  }
  if (minStart !== undefined && maxEnd !== undefined) {
    return [minStart, maxEnd] as const
  }
  return undefined
}

export async function clickProteinToGenome({
  model,
  structureSeqPos,
  structureSeqEndPos,
}: {
  structureSeqPos: number
  structureSeqEndPos?: number
  model: JBrowsePluginProteinStructureModel
}) {
  const session = getSession(model)
  const { connectedView, genomeToTranscriptSeqMapping, zoomToBaseLevel } = model
  const { assemblyManager } = session
  if (!genomeToTranscriptSeqMapping) {
    return undefined
  }
  const { strand, refName } = genomeToTranscriptSeqMapping
  const assemblyName = connectedView?.assemblyNames[0]
  if (!assemblyName) {
    return undefined
  }

  const result =
    structureSeqEndPos !== undefined
      ? proteinRangeToGenomeMapping({
          structureSeqPos,
          structureSeqEndPos,
          model,
        })
      : proteinToGenomeMapping({ structureSeqPos, model })

  if (!result) {
    return undefined
  }
  const [start, end] = result

  model.setClickGenomeHighlights([
    {
      assemblyName,
      refName,
      start,
      end,
    },
  ])
  if (zoomToBaseLevel) {
    await connectedView.navToLocString(
      `${refName}:${start}-${end}${strand === -1 ? '[rev]' : ''}`,
      undefined,
      0.2,
    )
  } else {
    const assembly = assemblyManager.get(connectedView.assemblyNames[0]!)
    connectedView.centerAt(
      start,
      assembly?.getCanonicalRefName(refName) ?? refName,
    )
  }
}

export function hoverProteinToGenome({
  model,
  structureSeqPos,
}: {
  structureSeqPos?: number
  model: JBrowsePluginProteinStructureModel
}) {
  if (structureSeqPos === undefined) {
    model.setHoverGenomeHighlights([])
    return
  }

  const mappedCoords = proteinToGenomeMapping({
    structureSeqPos,
    model,
  })
  const { genomeToTranscriptSeqMapping, connectedView } = model
  const assemblyName = connectedView?.assemblyNames[0]

  if (genomeToTranscriptSeqMapping && mappedCoords && assemblyName) {
    const [start, end] = mappedCoords
    model.setHoverGenomeHighlights([
      {
        assemblyName,
        refName: genomeToTranscriptSeqMapping.refName,
        start,
        end,
      },
    ])
  }
}

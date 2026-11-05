import { useMemo } from 'react'

import { useAlphaFoldComplexes } from './useAlphaFoldComplexes'
import useAlphaFoldData from './useAlphaFoldData'
import useExperimentalStructures from './useExperimentalStructures'
import usePdbEntrySummaries from './usePdbEntrySummaries'
import { errorMessage } from '../../ProteinView/util'
import { listOrder, structureRows } from '../utils/structureList'

import type { StructureSection } from '../utils/structureList'
import type { Feature } from '@jbrowse/core/util'

export interface SectionStatus {
  loading: string[]
  notices: string[]
}

interface StatusLine {
  sections: readonly StructureSection[]
  loading?: string | false
  notice?: string | false
}

function isText(value: string | false | undefined) {
  return typeof value === 'string'
}

function sectionStatus(
  lines: StatusLine[],
): Record<StructureSection, SectionStatus> {
  const of = (section: StructureSection) => {
    const mine = lines.filter(l => l.sections.includes(section))
    return {
      loading: mine.map(l => l.loading).filter(isText),
      notices: mine.map(l => l.notice).filter(isText),
    }
  }
  return {
    alone: of('alone'),
    partner: of('partner'),
    fragment: of('fragment'),
  }
}

/**
 * Every structure of the gene's protein, from AlphaFold DB's models and
 * complexes and RCSB's entries, each source loading and failing on its own:
 * what one source has found is listed while another is still asking, and a
 * source that fails leaves a line in the sections it would have filled.
 */
export default function useGeneStructures({
  uniprotId,
  geneName,
  feature,
  view,
  preferredTranscriptId,
}: {
  uniprotId?: string
  geneName: string
  feature: Feature
  view?: { assemblyNames?: string[] }
  preferredTranscriptId?: string
}) {
  const alphaFold = useAlphaFoldData({
    uniprotId,
    feature,
    view,
    preferredTranscriptId,
  })
  const complexes = useAlphaFoldComplexes(uniprotId)
  const experimental = useExperimentalStructures(uniprotId)
  const summaries = usePdbEntrySummaries(experimental.entries)

  const entries = experimental.entries
  // A row's section waits on its partners, so entries are listed once RCSB has
  // described them, or failed to, rather than jumping between sections
  const entriesReady =
    !!entries && (entries.length === 0 || !summaries.isLoading)
  const uniprotLength =
    alphaFold.entryLength ??
    alphaFold.model?.sequence?.length ??
    Math.max(1, ...(entries ?? []).map(e => e.end))

  const rows = useMemo(
    () =>
      uniprotId
        ? listOrder(
            structureRows({
              geneName,
              uniprotId,
              uniprotLength,
              alphaFold: alphaFold.isLoading ? undefined : alphaFold.model,
              entries: entriesReady ? entries : undefined,
              summaries: summaries.summaries,
              complexes: complexes.complexes,
            }),
          )
        : [],
    [
      uniprotId,
      geneName,
      uniprotLength,
      alphaFold.isLoading,
      alphaFold.model,
      entriesReady,
      entries,
      summaries.summaries,
      complexes.complexes,
    ],
  )

  const pdb = ['alone', 'partner', 'fragment'] as const
  const sections = uniprotId
    ? sectionStatus([
        {
          sections: ['alone'],
          loading: alphaFold.isLoading && 'Asking AlphaFold DB for models',
          notice: alphaFold.noModel
            ? `AlphaFold DB has no model for ${uniprotId}`
            : alphaFold.modelsUnreachable !== undefined &&
              `AlphaFold DB's model list did not answer, so its row opens the canonical model file for ${uniprotId}, without comparing its sequence to the isoforms`,
        },
        {
          sections: pdb,
          loading:
            (experimental.isLoading || summaries.isLoading) &&
            'Listing PDB entries from RCSB',
          notice:
            experimental.error !== undefined &&
            `RCSB did not list the PDB entries: ${errorMessage(experimental.error)}`,
        },
        {
          sections: ['alone', 'partner'],
          notice:
            summaries.error !== undefined &&
            `RCSB did not describe the PDB entries, so they are placed by coverage alone: ${errorMessage(summaries.error)}`,
        },
        {
          sections: ['alone'],
          notice:
            entries?.length === 0 &&
            `RCSB lists no experimental structure for ${uniprotId}`,
        },
        {
          sections: ['partner'],
          loading:
            complexes.isLoading &&
            'Asking AlphaFold DB for predicted complexes',
          notice:
            complexes.error !== undefined &&
            `AlphaFold DB's complex list did not answer: ${errorMessage(complexes.error)}`,
        },
      ])
    : undefined

  return {
    rows,
    uniprotLength,
    sections,
    alphaFold,
    // the default pick is the AlphaFold model, else the first row listed, so
    // it is known once AlphaFold DB has answered, or everything has
    defaultSettled:
      !alphaFold.isLoading &&
      (!!alphaFold.model ||
        !(
          experimental.isLoading ||
          summaries.isLoading ||
          complexes.isLoading
        )),
  }
}

import { useMemo } from 'react'

import useSWR from 'swr'

import { STATIC_SWR_OPTIONS } from './swrOptions'
import { errorMessage } from '../../ProteinView/util'
import {
  datasetMatches,
  hostPluginManager,
  loadStructureMapping,
  readStructureDatasets,
} from '../utils/structureDatasets'

import type { Feature } from '@jbrowse/core/util'

/**
 * The structures the config's datasets list for a gene. Every mapping file is
 * read once a page; one that fails leaves a line naming it, and the rest are
 * offered as usual.
 */
export default function useDatasetStructures({
  jbrowse,
  feature,
  preferredTranscriptId,
}: {
  /** the session's config, `session.jbrowse` */
  jbrowse: object
  feature: Feature
  preferredTranscriptId?: string
}) {
  const datasets = useMemo(() => readStructureDatasets(jbrowse), [jbrowse])
  const pluginManager = hostPluginManager(jbrowse)
  const { data, isLoading } = useSWR(
    datasets.length > 0
      ? [
          'structure-datasets',
          ...datasets.map(
            d => `${d.datasetId} ${JSON.stringify(d.mappingLocation)}`,
          ),
        ]
      : null,
    () =>
      Promise.allSettled(
        datasets.map(d => loadStructureMapping(d, pluginManager)),
      ),
    STATIC_SWR_OPTIONS,
  )
  const matches = useMemo(
    () =>
      datasets.flatMap((dataset, i) => {
        const result = data?.[i]
        return result?.status === 'fulfilled'
          ? datasetMatches({
              dataset,
              mapping: result.value,
              feature,
              preferredTranscriptId,
            })
          : []
      }),
    [datasets, data, feature, preferredTranscriptId],
  )
  const notices = datasets.flatMap((dataset, i) => {
    const result = data?.[i]
    return result?.status === 'rejected'
      ? [
          `${dataset.name}'s structure list did not load: ${errorMessage(result.reason)}`,
        ]
      : []
  })
  return {
    matches,
    notices,
    isLoading,
    loadingMessage: `Reading ${datasets.map(d => d.name).join(', ')}`,
  }
}

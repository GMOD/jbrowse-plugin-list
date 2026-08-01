import { assembleLocString, getSession } from '@jbrowse/core/util'
import useSWR from 'swr'

import { fetchTviewPlan, sourceFromTrack } from './fetchTviewPlan'

import type { FetchRegion } from './fetchTviewPlan'
import type { AbstractTrackModel } from '@jbrowse/core/util'

const staticSwrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  shouldRetryOnError: false,
}

export function useTviewMsa({
  model,
  region,
}: {
  model: AbstractTrackModel
  region?: FetchRegion
}) {
  // the key carries the region so the fetcher receives it already narrowed
  return useSWR(
    region
      ? { tag: 'tview', loc: assembleLocString(region), id: model.id, region }
      : null,
    ({ region }) =>
      fetchTviewPlan({
        session: getSession(model),
        source: sourceFromTrack(model),
        region,
      }),
    staticSwrConfig,
  )
}

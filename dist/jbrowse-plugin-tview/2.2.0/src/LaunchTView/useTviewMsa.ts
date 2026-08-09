import useSWR from 'swr'

import { fetchTviewPlan } from './fetchTviewPlan'
import { initRegion, initSources } from '../TViewPanel/init'

import type { TviewInit } from '../TViewPanel/init'
import type { AbstractSessionModel } from '@jbrowse/core/util'

const staticSwrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  shouldRetryOnError: false,
}

/**
 * A preview of what a `TviewInit` resolves to, for the dialog to report before
 * the view is opened.
 *
 * Resolved through the same two functions the view itself uses, so what the
 * dialog states and what the view then builds cannot disagree.
 */
export function useTviewMsa({
  session,
  init,
}: {
  session: AbstractSessionModel
  init?: TviewInit
}) {
  const region = init ? initRegion(session, init) : undefined
  const sources = init ? initSources(session, init) : undefined
  return useSWR(
    region && sources
      ? { tag: 'tview', loc: init!.loc, tracks: init!.tracks, region, sources }
      : null,
    ({ region, sources }) => fetchTviewPlan({ session, sources, region }),
    staticSwrConfig,
  )
}

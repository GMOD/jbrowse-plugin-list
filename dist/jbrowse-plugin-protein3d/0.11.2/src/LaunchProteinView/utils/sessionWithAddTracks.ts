import { isSessionModel } from '@jbrowse/core/util'

import type { AbstractSessionModel } from '@jbrowse/core/util'

export interface SessionWithAddTracks extends AbstractSessionModel {
  addTrackConf(conf: Record<string, unknown>): void
}

export function isSessionWithAddTracks(t: unknown): t is SessionWithAddTracks {
  return (
    isSessionModel(t) &&
    'addTrackConf' in t &&
    !('disableAddTracks' in t && t.disableAddTracks)
  )
}

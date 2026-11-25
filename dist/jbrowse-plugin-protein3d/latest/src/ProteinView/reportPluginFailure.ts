import { isAlive } from '@jbrowse/mobx-state-tree'

import type { IAnyStateTreeNode } from '@jbrowse/mobx-state-tree'

export type FailureHost = IAnyStateTreeNode & {
  readonly molstarPluginContext: unknown
  addNotice: (notice: unknown) => void
}

/**
 * Logs a failure, and shows it on `host` only while `plugin` is still the one
 * `host` draws with: a disposed plugin's failure is not the reader's error.
 */
export function reportPluginFailure(host: FailureHost, plugin: unknown) {
  return (error: unknown) => {
    console.error(error)
    if (isAlive(host) && host.molstarPluginContext === plugin) {
      host.addNotice(error)
    }
  }
}

export type FigureNoticeKind = 'marks' | 'distances'

export function noFigureNotices(): Record<FigureNoticeKind, readonly string[]> {
  return { marks: [], distances: [] }
}

export type FigureNoticeHost = IAnyStateTreeNode & {
  readonly molstarPluginContext: unknown
  setFigureNotices: (kind: FigureNoticeKind, notices: readonly string[]) => void
}

/**
 * Replaces `host`'s notices of `kind` with a sync's, on the same terms as
 * {@link reportPluginFailure}: a fixed mark's line goes with the next sync.
 */
export function reportFigureNotices(
  host: FigureNoticeHost,
  plugin: unknown,
  kind: FigureNoticeKind,
) {
  return (notices: readonly string[]) => {
    if (isAlive(host) && host.molstarPluginContext === plugin) {
      host.setFigureNotices(kind, notices)
    }
  }
}

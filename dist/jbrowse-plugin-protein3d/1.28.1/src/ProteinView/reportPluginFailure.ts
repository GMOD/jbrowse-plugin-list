import { isAlive } from '@jbrowse/mobx-state-tree'

import type { IAnyStateTreeNode } from '@jbrowse/mobx-state-tree'

export type FailureHost = IAnyStateTreeNode & {
  readonly molstarPluginContext: unknown
  setError: (error: unknown) => void
}

/**
 * Logs a failure, and shows it on `host` only while `plugin` is still the one
 * `host` draws with: a disposed plugin's failure is not the reader's error.
 */
export function reportPluginFailure(host: FailureHost, plugin: unknown) {
  return (error: unknown) => {
    console.error(error)
    if (isAlive(host) && host.molstarPluginContext === plugin) {
      host.setError(error)
    }
  }
}

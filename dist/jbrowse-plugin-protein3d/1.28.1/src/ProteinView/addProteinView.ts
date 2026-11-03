import { getEnv } from '@jbrowse/core/util'

import type { AbstractSessionModel } from '@jbrowse/core/util'

/**
 * Add a ProteinView, loading its state model first: the model is a lazy
 * loader, so it stays out of the plugin's boot, and a host refuses `addView`
 * for a type whose model has not loaded.
 */
export async function addProteinView(
  session: AbstractSessionModel,
  snapshot: Parameters<AbstractSessionModel['addView']>[1],
) {
  await getEnv(session)
    .pluginManager.getViewType('ProteinView')
    .loadStateModel()
  return session.addView('ProteinView', snapshot)
}

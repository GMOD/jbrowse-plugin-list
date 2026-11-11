import { FETCH_TIMEOUT_MS } from './graphManifest'
import { openWalkFile } from '../panSNTabix'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { FileLocation } from '@jbrowse/core/util'

// The reference sample a walk file's header names, which its file name only
// suggests. Undefined for a header that is missing or unreadable, so the form
// falls back to the file name.
export async function readWalkReference(
  loc: FileLocation,
  indexLoc: FileLocation | undefined,
  pluginManager?: PluginManager,
) {
  try {
    const { references } = await openWalkFile(
      loc,
      indexLoc,
      pluginManager,
    ).header({ signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    return references[0]
  } catch {
    return undefined
  }
}

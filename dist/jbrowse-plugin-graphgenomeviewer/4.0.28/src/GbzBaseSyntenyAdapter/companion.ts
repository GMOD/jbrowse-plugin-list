import { haplotypeIndexBeside } from '@jbrowse/bandage-core/gbzCut'
import { openLocation } from '@jbrowse/core/util/io'

import {
  locationName,
  readsSiblings,
  renamed,
} from '../GraphAddTrackWorkflow/buildTrackConfig.ts'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { FileLocation } from '@jbrowse/core/util/types'

export function siblingCompanion(gbzDb: FileLocation) {
  return readsSiblings(gbzDb) && haplotypeIndexBeside(locationName(gbzDb))
    ? renamed(gbzDb, name => haplotypeIndexBeside(name)!)
    : undefined
}

export async function findCompanion(
  gbzDb: FileLocation,
  pluginManager?: PluginManager,
) {
  const candidate = siblingCompanion(gbzDb)
  if (!candidate) {
    return undefined
  }
  try {
    await openLocation(candidate, pluginManager).stat()
    return candidate
  } catch {
    return undefined
  }
}

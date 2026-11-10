import { haplotypeIndexBeside } from '@jbrowse/bandage-core/gbzCut'
import { openLocation } from '@jbrowse/core/util/io'

import { locationName, readsSiblings, renamed } from '../locationName'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { FileLocation } from '@jbrowse/core/util/types'

export function siblingCompanion(gbzDb: FileLocation) {
  return readsSiblings(gbzDb) && haplotypeIndexBeside(locationName(gbzDb))
    ? renamed(gbzDb, name => haplotypeIndexBeside(name)!)
    : undefined
}

// 404 is a missing file, and so is 403 from a bucket that does not let a
// reader list it; anything else leaves the file's presence unknown
function isMissing(error: unknown) {
  return (
    error instanceof Error &&
    (/\bHTTP 40[34]\b/.test(error.message) ||
      (error as { code?: unknown }).code === 'ENOENT')
  )
}

// `unreadable` is why a companion that may be there could not be checked, such
// as a network error, or a server that answers a missing file without CORS
export async function findCompanion(
  gbzDb: FileLocation,
  pluginManager?: PluginManager,
): Promise<{ location?: FileLocation; unreadable?: string }> {
  const candidate = siblingCompanion(gbzDb)
  if (!candidate) {
    return {}
  }
  try {
    await openLocation(candidate, pluginManager).stat()
    return { location: candidate }
  } catch (error) {
    return isMissing(error) ? {} : { unreadable: String(error) }
  }
}

import { caOnlyMmcif } from './molstarStructure'
import { loadStructure } from '../ProteinView/structurePipeline'

import type { TestChain } from './molstarStructure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

/** Load a CA-only mmCIF into a headless plugin the way the view loads one.
 * Needs the jsdom environment: Mol*'s layout listens on `document`. */
export async function loadCaOnly(
  plugin: PluginContext,
  chains: TestChain[],
  options?: { models?: number },
) {
  return loadStructure({ plugin, data: caOnlyMmcif(chains, options) })
}

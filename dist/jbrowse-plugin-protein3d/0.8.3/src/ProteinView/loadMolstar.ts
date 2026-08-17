import type * as MolstarExports from './molstarExports'

let cached: Promise<typeof MolstarExports> | undefined

export default function loadMolstar() {
  cached ??= import('./molstarExports')
  return cached
}

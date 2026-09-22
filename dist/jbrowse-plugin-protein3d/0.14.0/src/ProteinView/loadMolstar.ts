import type * as MolstarExports from './molstarExports'

let cached: Promise<typeof MolstarExports> | undefined

// A failed chunk load is forgotten so the next caller retries it, as the UMD
// build's replacement for this file (see esbuild.mjs) already does
export default function loadMolstar() {
  cached ??= import('./molstarExports').catch((e: unknown) => {
    cached = undefined
    throw e
  })
  return cached
}

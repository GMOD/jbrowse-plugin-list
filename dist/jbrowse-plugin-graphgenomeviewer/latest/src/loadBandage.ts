export type { BandageModule } from './bandage/bandage-layout'

import type { BandageModule } from './bandage/bandage-layout'

// The Bandage engine is a ~425kb self-contained ES module (Emscripten
// -sSINGLE_FILE=1, wasm inlined as base64). A plain dynamic import lets the
// bundler emit it as a sibling chunk that the browser resolves relative to this
// module's own url via import.meta.url — so it downloads only when a
// force-directed layout is requested, and works identically on the main thread
// and in the RPC worker with no url plumbing.
let cached: Promise<BandageModule> | undefined

export default function loadBandage() {
  cached ??= import('./bandage/bandage-layout')
    .then(mod => mod.default())
    .catch((e: unknown) => {
      // let a later attempt retry rather than caching the failure forever
      cached = undefined
      throw e
    })
  return cached
}

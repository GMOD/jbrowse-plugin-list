import type { LayoutNode } from '../GraphGenomeView/layout/referenceSeeds'
import type { Graph, LayoutResult } from '../GraphGenomeView/types'

export interface BandageModule {
  computeLayout(
    graph: { nodes: LayoutNode[]; edges: Graph['edges'] },
    options: Record<string, unknown>,
  ): LayoutResult
}

// The vendored Emscripten bundle's default export is a factory that
// instantiates the wasm module (layout inlined, -sSINGLE_FILE=1).
declare const createBandageLayoutModule: () => Promise<BandageModule>
export default createBandageLayoutModule

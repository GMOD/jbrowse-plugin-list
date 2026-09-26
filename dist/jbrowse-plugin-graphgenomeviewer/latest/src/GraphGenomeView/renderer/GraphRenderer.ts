import { Canvas2DRenderer } from './Canvas2DRenderer'

// Canvas2D only, and deliberately not through render-core's GPU ladder. The
// batch is strokes and arrowheads in layout units, and stroking them batched by
// colour is inside a frame budget at the node counts this view caps itself at
// (agent-docs/GRAPH_SCALE_AND_LOD.md), so a GPU backend would buy a few
// milliseconds for ~30 KB of bundled HAL and a shader toolchain. If one is ever
// wanted, it should take the same `Renderer` interface and draw the batch as
// instances — a capsule per node segment, a bezier ribbon per edge stroke —
// rather than reviving a triangle mesh; agent-docs/IDEAS.md scopes it.
export function createGraphRenderer(canvas: HTMLCanvasElement) {
  return Promise.resolve(new Canvas2DRenderer(canvas))
}

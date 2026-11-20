import { Canvas2DRenderer } from '@jbrowse/bandage-core/renderer/Canvas2DRenderer'

// Canvas2D until bandage-core's WebGL2Renderer lands (ADR-047,
// agent-docs/todo/webgl2-backend.md), which this then returns where WebGL2 is
// available
export function createGraphRenderer(canvas: HTMLCanvasElement) {
  return Promise.resolve(new Canvas2DRenderer(canvas))
}

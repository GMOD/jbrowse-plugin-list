// Test support: a 2D context that records what it was asked to draw. jsdom
// implements no canvas backend, so there is no real context to render into and no
// pixels to read back; counting draw calls is what is available here, and it is
// enough for the two things worth asserting about this renderer.
//
// Draw-call counts are also the only *deterministic* performance signal available
// in a unit test -- wall-clock is machine- and load-dependent, so a timing bound
// loose enough not to flake is too loose to catch a 3x regression. See
// agent-docs/GRAPH_SCALE_AND_LOD.md.
//
// Not bundled: nothing under src/index.ts imports this, so it never ships. Same
// arrangement as launchSubgraph/testEnv.ts.

// `points` is every coordinate the renderer asked for, in BACKING-STORE pixels
// — the far end of the whole pipeline. Counting draw calls says the renderer ran;
// this says where it put things, which is the only way to check a transform
// without a canvas backend to read pixels back from. `fillRect` is excluded: it
// is the background clear, and its corners are the pane, not the drawing.
export function recordingCanvas() {
  const strokes: string[] = []
  const fills: string[] = []
  const lineWidths: number[] = []
  const points: { x: number; y: number }[] = []
  const at = (x: number, y: number) => {
    points.push({ x, y })
  }
  const ctx = {
    canvas: { width: 800, height: 600, style: {} },
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    lineCap: '',
    lineJoin: '',
    beginPath: () => {},
    moveTo: at,
    lineTo: at,
    closePath: () => {},
    bezierCurveTo: (
      cx0: number,
      cy0: number,
      cx1: number,
      cy1: number,
      x: number,
      y: number,
    ) => {
      at(cx0, cy0)
      at(cx1, cy1)
      at(x, y)
    },
    fillRect: () => {},
    stroke: () => {
      strokes.push(ctx.strokeStyle)
      lineWidths.push(ctx.lineWidth)
    },
    fill: () => {
      fills.push(ctx.fillStyle)
    },
  }
  // The element is real (jsdom gives a genuine HTMLCanvasElement); only the
  // context is a stand-in, which is the one cast this needs.
  const canvas = document.createElement('canvas')
  canvas.getContext = () => ctx as unknown as CanvasRenderingContext2D
  return { canvas, strokes, fills, lineWidths, points }
}

import {
  computeEdgeCurves,
  curveMidpoint,
  curvePointAt,
  dashCurves,
  projectLine,
  translateCurves,
} from './geometry'

import type { BezierCurve } from './geometry'

// isotropic: one scale for both axes, which is every layout but the row ones
const iso = (scale = 1) => ({ scaleX: scale, scaleY: scale })

// A quarter-circle-ish arc, enough to tell "on the curve" from "near the chord".
const ARC: BezierCurve = {
  x0: 0,
  y0: 0,
  cx0: 0,
  cy0: 60,
  cx1: 100,
  cy1: 60,
  x1: 100,
  y1: 0,
}

describe('dashCurves', () => {
  test('dashes start and end on the curve, and lie on it', () => {
    const dashes = dashCurves([ARC], 12)
    expect(dashes.length).toBeGreaterThan(1)
    // A dash sits at each end, so the arc reads as attached to both nodes
    expect(dashes[0]![0]!.x0).toBeCloseTo(ARC.x0)
    expect(dashes[0]![0]!.y0).toBeCloseTo(ARC.y0)
    const last = dashes[dashes.length - 1]![0]!
    expect(last.x1).toBeCloseTo(ARC.x1)
    expect(last.y1).toBeCloseTo(ARC.y1)
  })

  test('a dash is the sub-curve of the original, not a chord across it', () => {
    // Two dashes over the same span must trace the same points as the whole
    // curve does there: this is what keeps the dashed arc on the solid one's
    // path rather than cutting corners off it.
    const [first] = dashCurves([ARC], 1e9 / 3) // forced to the 3-span minimum
    const t = 1 / 3
    for (const s of [0, 0.5, 1]) {
      const onDash = curvePointAt(first![0]!, s)
      const onArc = curvePointAt(ARC, s * t)
      expect(onDash.x).toBeCloseTo(onArc.x)
      expect(onDash.y).toBeCloseTo(onArc.y)
    }
  })

  test('a shorter period gives more dashes', () => {
    expect(dashCurves([ARC], 6).length).toBeGreaterThan(
      dashCurves([ARC], 30).length,
    )
  })
})

describe('curveMidpoint', () => {
  test('is on the curve, off its chord', () => {
    const mid = curveMidpoint([ARC])!
    expect(mid.x).toBeCloseTo(50)
    // the chord runs along y=0; the curve reaches 3/4 of its control offset
    expect(mid.y).toBeCloseTo(45)
  })

  test('agrees with the drawn bow of a deletion arc', () => {
    // What the label placement depends on: the point it puts the words at has to
    // be a point of the curve the renderer strokes, whatever the layout did with
    // the endpoints.
    const from = [
      { x: -80, y: 0 },
      { x: 0, y: 0 },
    ]
    const to = [
      { x: 200, y: 0 },
      { x: 280, y: 0 },
    ]
    // the bypassed backbone, lying on the chord as an anchored layout draws it:
    // 200 units of run at the 0.35 along-fraction is 70 of bow
    const bypassed = [
      { x: 0, y: 0 },
      { x: 200, y: 0 },
    ]
    const curves = computeEdgeCurves(from, to, false, 0, 0, iso(), bypassed)
    const mid = curveMidpoint(curves)!
    expect(curves).toHaveLength(1)
    const onCurve = curvePointAt(curves[0]!, 0.5)
    expect(mid.x).toBeCloseTo(onCurve.x)
    expect(mid.y).toBeCloseTo(onCurve.y)
    expect(Math.abs(mid.y)).toBeGreaterThan(10)
  })
})

describe('projectLine', () => {
  test('projects along positive x direction', () => {
    const [x, y] = projectLine(0, 0, 10, 0, 5)
    expect(x).toBeCloseTo(15)
    expect(y).toBeCloseTo(0)
  })

  test('projects along positive y direction', () => {
    const [x, y] = projectLine(0, 0, 0, 10, 5)
    expect(x).toBeCloseTo(0)
    expect(y).toBeCloseTo(15)
  })

  test('projects along diagonal', () => {
    const [x, y] = projectLine(0, 0, 3, 4, 5)
    expect(x).toBeCloseTo(6)
    expect(y).toBeCloseTo(8)
  })

  test('handles zero-length segment', () => {
    const [x, y] = projectLine(5, 5, 5, 5, 10)
    expect(x).toBe(5)
    expect(y).toBe(5)
  })
})

describe('computeEdgeCurves', () => {
  test('returns single curve for normal edge', () => {
    const from = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]
    const to = [
      { x: 20, y: 0 },
      { x: 30, y: 0 },
    ]
    const curves = computeEdgeCurves(from, to, false, 0, 0, iso())

    expect(curves).toHaveLength(1)
    expect(curves[0]!.x0).toBeCloseTo(10)
    expect(curves[0]!.y0).toBeCloseTo(0)
    expect(curves[0]!.x1).toBeCloseTo(20)
    expect(curves[0]!.y1).toBeCloseTo(0)
  })

  test('returns two curves for self-loop', () => {
    const segments = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]
    const curves = computeEdgeCurves(segments, segments, true, 0, 0, iso())

    expect(curves).toHaveLength(2)
    expect(curves[0]!.x1).toBeCloseTo(curves[1]!.x0)
    expect(curves[0]!.y1).toBeCloseTo(curves[1]!.y0)
  })

  test('applies offset to curve endpoints', () => {
    const from = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]
    const to = [
      { x: 20, y: 0 },
      { x: 30, y: 0 },
    ]
    const curves = computeEdgeCurves(from, to, false, 0, 5, iso())

    expect(curves[0]!.y0).toBeCloseTo(5)
    expect(curves[0]!.y1).toBeCloseTo(5)
  })
})

describe('translateCurves matches computeEdgeCurves offset', () => {
  // Hit detection caches base curves (offset 0) and applies path offsets via
  // translateCurves; this must stay numerically equivalent to calling
  // computeEdgeCurves with offsets directly.
  const cases: [
    string,
    { x: number; y: number }[],
    { x: number; y: number }[],
    boolean,
  ][] = [
    [
      'straight edge',
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      [
        { x: 20, y: 0 },
        { x: 30, y: 0 },
      ],
      false,
    ],
    [
      'diagonal edge',
      [
        { x: 0, y: 0 },
        { x: 10, y: 5 },
      ],
      [
        { x: 25, y: 18 },
        { x: 40, y: 30 },
      ],
      false,
    ],
    [
      'self-loop',
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      true,
    ],
  ]

  const offsets = [
    [3, 0],
    [0, -7],
    [2.5, 2.5],
  ]

  test.each(cases)(
    '%s: translation equals offset compute',
    (_name, from, to, selfLoop) => {
      const base = computeEdgeCurves(from, to, selfLoop, 0, 0, iso())
      for (const [dx, dy] of offsets) {
        const translated = translateCurves(base, dx!, dy!)
        const direct = computeEdgeCurves(from, to, selfLoop, dx!, dy!, iso())
        expect(translated).toHaveLength(direct.length)
        for (let i = 0; i < direct.length; i++) {
          const t = translated[i]!
          const d = direct[i]!
          expect(t.x0).toBeCloseTo(d.x0)
          expect(t.y0).toBeCloseTo(d.y0)
          expect(t.cx0).toBeCloseTo(d.cx0)
          expect(t.cy0).toBeCloseTo(d.cy0)
          expect(t.cx1).toBeCloseTo(d.cx1)
          expect(t.cy1).toBeCloseTo(d.cy1)
          expect(t.x1).toBeCloseTo(d.x1)
          expect(t.y1).toBeCloseTo(d.y1)
        }
      }
    },
  )
})

// A row layout hands this function two axes in different units — x in reference
// bp, y in screen px — so `yToX` (scaleY / scaleX) is what makes a chord length,
// a tangent projection and a bow mean anything. The property that says it is
// right is that the curve comes out the same ON SCREEN either way: laying the
// same drawing out in one unit and scaling it, or laying it out in two and
// converting, has to reach the same pixels.
describe('anisotropic axes', () => {
  const yToX = 200

  // the same bubble twice: once with y already in x units, once with y in the
  // units a row layout states it in (yToX times smaller)
  const inXUnits = {
    from: [
      { x: 0, y: 0 },
      { x: 1000, y: 0 },
    ],
    to: [
      { x: 1400, y: 400 },
      { x: 2000, y: 400 },
    ],
  }
  const asRows = {
    from: inXUnits.from.map(p => ({ x: p.x, y: p.y / yToX })),
    to: inXUnits.to.map(p => ({ x: p.x, y: p.y / yToX })),
  }

  test('a curve is the same drawing whichever unit y arrived in', () => {
    const flat = computeEdgeCurves(
      inXUnits.from,
      inXUnits.to,
      false,
      0,
      0,
      iso(),
    )
    const rows = computeEdgeCurves(
      asRows.from,
      asRows.to,
      false,
      0,
      0,
      { scaleX: 1, scaleY: yToX },
      [],
    )
    expect(rows).toHaveLength(flat.length)
    for (let i = 0; i < flat.length; i++) {
      const f = flat[i]!
      const r = rows[i]!
      expect(r.x0).toBeCloseTo(f.x0)
      expect(r.cx0).toBeCloseTo(f.cx0)
      expect(r.cx1).toBeCloseTo(f.cx1)
      expect(r.x1).toBeCloseTo(f.x1)
      // y comes back in the layout's own unit, which is the drawn one over yToX
      expect(r.y0 * yToX).toBeCloseTo(f.y0)
      expect(r.cy0 * yToX).toBeCloseTo(f.cy0)
      expect(r.cy1 * yToX).toBeCloseTo(f.cy1)
      expect(r.y1 * yToX).toBeCloseTo(f.y1)
    }
  })

  // The failure this catches is silent and large. A deletion's bow is sized off
  // the run it passes around, in x units; applied to a y axis 200x finer without
  // the conversion it is a 200x balloon, off the pane and taking the label with
  // it. Both arcs here bow the same distance on screen.
  test('a deletion arc bows the same distance on screen', () => {
    const backbone = (y: number) => ({
      from: [
        { x: 0, y },
        { x: 1000, y },
      ],
      to: [
        { x: 9000, y },
        { x: 10000, y },
      ],
      bypassed: [
        { x: 1000, y },
        { x: 9000, y },
      ],
    })
    const flat = backbone(0)
    const apexOf = (curves: ReturnType<typeof computeEdgeCurves>, k: number) =>
      Math.abs(curvePointAt(curves[0]!, 0.5).y * k)

    const bowFlat = apexOf(
      computeEdgeCurves(flat.from, flat.to, false, 0, 0, iso(), flat.bypassed),
      1,
    )
    const bowRows = apexOf(
      computeEdgeCurves(
        flat.from,
        flat.to,
        false,
        0,
        0,
        { scaleX: 1, scaleY: yToX },
        flat.bypassed,
      ),
      yToX,
    )
    expect(bowFlat).toBeGreaterThan(0)
    expect(bowRows).toBeCloseTo(bowFlat)
  })

  // THE ROW-LAYOUT BOW IS CAPPED, and the numbers here are the shape of the
  // failure it fixes rather than round ones: 84,683 bp is the CFHR3/CFHR1
  // deletion and 0.5% is the zoom `pangenome/hprc_cfhr_deletion` draws at, so
  // this is that figure's own arc. Uncapped it bows 148 px and its apex lands
  // 111 px — 5.5 rows — into the rank rows below the backbone, which is the loop
  // enclosing a dozen unrelated nodes that review called weird.
  //
  // `pixelRows` is what turns the cap on, and the pair of assertions is the
  // point: the same geometry uncapped is more than twice as deep, so a flag that
  // stopped arriving would be a visible regression rather than a rounding one.
  test('a row layout caps a deletion bow that a simulation would not', () => {
    const DELETED_BP = 84683
    const ZOOM = 0.005
    const backbone = {
      from: [
        { x: 0, y: 0 },
        { x: 1000, y: 0 },
      ],
      to: [
        { x: DELETED_BP, y: 0 },
        { x: DELETED_BP + 1000, y: 0 },
      ],
      bypassed: [
        { x: 1000, y: 0 },
        { x: DELETED_BP, y: 0 },
      ],
    }
    const apexOf = (axis: {
      scaleX: number
      scaleY: number
      pixelRows?: boolean
    }) =>
      Math.abs(
        curvePointAt(
          computeEdgeCurves(
            backbone.from,
            backbone.to,
            false,
            0,
            0,
            axis,
            backbone.bypassed,
          )[0]!,
          0.5,
        ).y,
      )

    // MAX_ROW_BOW_PX is 3 rows of 20 px, and a cubic whose controls sit `b` off
    // the chord reaches 3b/4 at its midpoint (APEX_FRACTION).
    const capped = apexOf({ scaleX: ZOOM, scaleY: 1, pixelRows: true })
    expect(capped).toBeCloseTo(0.75 * 3 * 20)

    const uncapped = apexOf({ scaleX: ZOOM, scaleY: 1 })
    expect(uncapped).toBeGreaterThan(2 * capped)
  })

  // The cap is a ceiling and not a size: a deletion small enough to bow less
  // than it draws identically either way, which is what keeps the short arcs in
  // the same figure where they already read correctly.
  test('a bow under the cap is untouched by the flag', () => {
    // the run spans 150, so the along-chord term is 52.5 — under the 60 px cap,
    // which is the case this is about
    const short = {
      from: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
      ],
      to: [
        { x: 200, y: 0 },
        { x: 250, y: 0 },
      ],
      bypassed: [
        { x: 50, y: 0 },
        { x: 200, y: 0 },
      ],
    }
    const curvesOf = (pixelRows?: boolean) =>
      computeEdgeCurves(
        short.from,
        short.to,
        false,
        0,
        0,
        { scaleX: 1, scaleY: 1, pixelRows },
        short.bypassed,
      )
    expect(curvesOf(true)).toEqual(curvesOf())
  })

  // yToX === 1 is the isotropic layout, and it has to be the identity rather
  // than merely close: every committed force-directed figure is that path.
  test('yToX of 1 is byte-identical to no conversion at all', () => {
    expect(
      computeEdgeCurves(inXUnits.from, inXUnits.to, false, 3, 7, iso(), []),
    ).toEqual(computeEdgeCurves(inXUnits.from, inXUnits.to, false, 3, 7, iso()))
  })
})

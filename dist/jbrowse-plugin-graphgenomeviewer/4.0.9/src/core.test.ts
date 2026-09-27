// @vitest-environment node
import { build } from 'esbuild'

// BandageJS bundles src/core.ts on its own, so a host, a state tree or a UI
// framework reached from here would land in a page that has none of them.
// These are the leaf utilities it may take from outside src/ instead.
const ALLOWED = [
  /^@jbrowse\/core\/esm\/util\/(colorBits|cssColorParse)\.js$/,
  /^@jbrowse\/core\/esm\/util\/color-bits\//,
  /^@jbrowse\/core\/esm\/util\/color\/cssColorsLevel4\.js$/,
  /^@jbrowse\/render-core\/esm\/(canvas2dUtils|canvasContext|renderingBackendBase)\.js$/,
  /^@jbrowse\/render-core\/esm\/marks\/colorFill\.js$/,
  /^@gmod\/tubemap-core\/dist\//,
]

// What BandageJS imports. Dropping one breaks that page at its next submodule
// bump, which nothing else in this repo would notice: no plugin code imports
// core.ts.
const PUBLISHED = [
  'BUBBLE_KIND_COLORS',
  'BUBBLE_KIND_NAMES',
  'BUBBLE_SPREADS',
  'COLOR_SCHEMES',
  'Canvas2DRenderer',
  'FIT_PADDING',
  'HALO_FACTOR',
  'LABEL_CHAR_PX',
  'LABEL_PAD',
  'LABEL_PX',
  'LAYOUT_MODES',
  'NODE_WIDTHS',
  'REFERENCE_RAMP_MAX_HUE',
  'ROW_HEIGHT_PX',
  'axisScaleOf',
  'bubbleHalos',
  'bubbleSegmentIds',
  'bubbleSubgraph',
  'bubblesFromGraph',
  'buildGeometry',
  'clampZoom',
  'classifyBubble',
  'computeReferenceRamp',
  'contains',
  'cutWindowGFA',
  'deletionEdges',
  'drawingBounds',
  'engineKey',
  'findHoveredEdge',
  'findHoveredNode',
  'fitTransform',
  'forceLayout',
  'formatBp',
  'getDpr',
  'haplotypeWanted',
  'layoutLabels',
  'layoutModeByValue',
  'loadBandage',
  'loadGraph',
  'modeUsesLayoutEngine',
  'nodeInk',
  'padded',
  'panSNContig',
  'panSNHaplotype',
  'pathColorsLegible',
  'pathLegend',
  'referencePathQuery',
  'referenceSamplesOf',
  'resolveColorScheme',
  'resolveReferenceSample',
  'screenToLayout',
  'tubeMapPicture',
  'viewportOf',
  'walkHighlight',
  'walkRows',
  'walkRowsExtent',
  'wheelZoomFactor',
  'zoomAbout',
]

function bundleCore() {
  return build({
    entryPoints: ['src/core.ts'],
    bundle: true,
    write: false,
    outdir: 'out',
    format: 'esm',
    platform: 'browser',
    metafile: true,
    logLevel: 'silent',
  })
}

test('the core entry reaches no host, state tree or UI framework', async () => {
  const { metafile } = await bundleCore()
  const outside = Object.keys(metafile.inputs)
    .filter(path => !path.startsWith('src/'))
    .map(path => path.replace(/.*node_modules\//, ''))
  expect(outside.filter(p => !ALLOWED.some(re => re.test(p)))).toEqual([])
})

test('the core entry still exports what BandageJS imports', async () => {
  const { metafile } = await bundleCore()
  const exported = new Set(
    Object.entries(metafile.outputs).find(([path]) =>
      path.endsWith('core.js'),
    )?.[1].exports,
  )
  expect(PUBLISHED.filter(name => !exported.has(name))).toEqual([])
})

// The graph viewer without JBrowse: GFA in, layouts, geometry, a Canvas2D
// renderer, hit testing and label placement out. Nothing reachable from here
// may import a host, a state tree or a UI framework (core.test.ts), so a page
// of its own (github.com/cmdcolin/BandageJS) can draw exactly what the plugin
// draws.

export {
  FIT_PADDING,
  clampZoom,
  drawingBounds,
  engineRequest,
  fitTransform,
  forceLayout,
  layoutExtent,
  loadGraph,
} from './GraphGenomeView/pipeline'
export type {
  Bounds,
  EngineRequest,
  EngineSettings,
  LayoutEngine,
} from './GraphGenomeView/pipeline'

export {
  FORCE_LAYOUT_LABEL,
  LAYOUT_MODES,
  layoutModeByValue,
  modeUsesLayoutEngine,
} from './GraphGenomeView/layoutModes'
export type { LayoutModeValue } from './GraphGenomeView/layoutModes'
export {
  COLOR_SCHEMES,
  resolveColorScheme,
} from './GraphGenomeView/colorSchemes'
export type {
  ColorScheme,
  ResolvedColorScheme,
} from './GraphGenomeView/colorSchemes'
export {
  NODE_WIDTHS,
  maxNodeWidthPx,
  meanDepth,
  nodeInk,
  nodeWidthPx,
} from './GraphGenomeView/nodeWidths'
export type { NodeWidth } from './GraphGenomeView/nodeWidths'
export { BUBBLE_SPREADS } from './GraphGenomeView/bubbleSpreads'
export type { BubbleSpread } from './GraphGenomeView/bubbleSpreads'

export {
  REFERENCE_RAMP_MAX_HUE,
  buildGeometry,
  computeReferenceRamp,
} from './GraphGenomeView/renderer/GeometryBuilder'
export { Canvas2DRenderer } from './GraphGenomeView/renderer/Canvas2DRenderer'
// the ratio the renderer sizes its backing store with, which the transform
// handed to it has to be multiplied by
export { getDpr } from '@jbrowse/render-core/canvas2dUtils'
export type { Renderer } from './GraphGenomeView/renderer/types'
export {
  findHoveredEdge,
  findHoveredNode,
} from './GraphGenomeView/util/hitDetection'
export type { NodeInk } from './GraphGenomeView/util/hitDetection'
export type { AxisScale } from './GraphGenomeView/util/geometry'
export { wheelZoomFactor } from './GraphGenomeView/util/wheelZoom'
// the tube map layouts draw their own shapes rather than the batch above
export { drawTubeMap, tubeMapPicture } from './GraphGenomeView/tubeMap/draw'
export type {
  TubeMapFrame,
  TubeMapPicture,
} from './GraphGenomeView/tubeMap/draw'
export { referenceKnots, warpX } from './GraphGenomeView/tubeMap/warp'
export { tubeMapFrame, tubeMapNodeAt } from './GraphGenomeView/tubeMap/frame'
export type {
  TubeMapTransform,
  TubeMapView,
} from './GraphGenomeView/tubeMap/frame'
export type {
  TubeMapColumn,
  TubeMapDrawing,
} from './GraphGenomeView/layout/tubeMapLayout'

export { deletionEdges } from './GraphGenomeView/deletionEdges'
export type { DeletionEdge } from './GraphGenomeView/deletionEdges'
export { walkHighlight } from './GraphGenomeView/walkHighlight'
export { pathColorsLegible, pathLegend } from './GraphGenomeView/pathColors'
export { bubblesFromGraph } from './GraphGenomeView/bubbles/bubblesFromGraph'
export { bubbleHalos } from './GraphGenomeView/bubbles/bubbleHalos'
export type { BubbleHalo } from './GraphGenomeView/bubbles/bubbleHalos'
export {
  BUBBLE_KIND_COLORS,
  BUBBLE_KIND_NAMES,
  bubbleSegmentIds,
  classifyBubble,
} from './GraphGenomeView/bubbles/classifyBubble'
export { bubbleSubgraph } from './GraphGenomeView/bubbles/popBubble'
export type { MinigraphBubble } from './MinigraphBubbleAdapter/bubbleLine'
export { walkRows } from './GraphGenomeView/layout/walkRows'
export type { WalkRows } from './GraphGenomeView/layout/walkRows'
export { walkRowsExtent } from './GraphGenomeView/layout/walkRowLayout'
export { ROW_HEIGHT_PX } from './GraphGenomeView/layout/rowSpacing'

export {
  HALO_FACTOR,
  LEGEND_INSET_PX,
  layoutLabels,
} from './GraphGenomeView/labelLayout'
export type {
  BubbleGlyph,
  LabelLayout,
  LabelLayoutSource,
} from './GraphGenomeView/labelLayout'
export { formatBp } from './GraphGenomeView/graphLabels'
export {
  LABEL_CHAR_PX,
  LABEL_PAD,
  LABEL_PX,
} from './GraphGenomeView/overlayLabels'

export type {
  Graph,
  GraphEdge,
  GraphNode,
  LayoutResult,
  NodeSegment,
} from './GraphGenomeView/types'

export {
  cutWindowGFA,
  haplotypeWanted,
  referencePathQuery,
  referenceSamplesOf,
  resolveReferenceSample,
} from './GbzBaseSyntenyAdapter/gbzWindow'
export type { GbzWindowOptions } from './GbzBaseSyntenyAdapter/gbzWindow'

export { engineKey } from './GraphGenomeView/pipeline'
export {
  axisScaleOf,
  contains,
  padded,
  screenToLayout,
  viewportOf,
  zoomAbout,
} from './GraphGenomeView/viewport'
export type { PaneTransform } from './GraphGenomeView/viewport'
export { default as loadBandage } from './loadBandage'
export { panSNContig, panSNHaplotype, panSNSample } from './pansn'

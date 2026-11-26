import { layoutModeByValue } from '@jbrowse/bandage-core/layoutModes'
import {
  REFERENCE_STRIP_ZONE_PX,
  referenceStripBlocks,
  stripBlockAt,
  stripFadedShown,
  stripOverhang,
} from '@jbrowse/bandage-core/referenceStrip'
import { LIFT_BACKDROP_CSS } from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { referenceBoxes } from '@jbrowse/bandage-core/tubeMap/axis'
import { deviationMarks } from '@jbrowse/bandage-core/tubeMap/deviations'
import { tubeMapPicture } from '@jbrowse/bandage-core/tubeMap/draw'
import { tubeMapGenes } from '@jbrowse/bandage-core/tubeMap/genes'

import { hostBlocks, hostFrame } from '../host'
import { withWalkRowViews } from './walkRowViews'

export const withHostViews = withWalkRowViews
  .views(self => ({
    // Whether the drawing's x is reference bp a host can place. Walk rows
    // put the backbone at its bp too, but their bars are lengths, so the
    // mode's `cutMargins` is what says the drawing is a picture.
    get xIsReferenceBp() {
      return (
        self.layoutResult?.referenceAxis === true &&
        layoutModeByValue(self.drawnLayoutMode ?? self.chosenLayoutMode)
          .cutMargins
      )
    },
  }))
  .views(self => ({
    // Whether the host places x. Only a layout whose x is reference bp can
    // take the window's transform; force, ordered and walk rows draw in
    // their own coordinates inside the track.
    get hostPlacesX() {
      const { host, graphRegion: region } = self
      return (
        host !== undefined &&
        host.initialized &&
        region !== undefined &&
        self.xIsReferenceBp &&
        !hostBlocks(host).some(b => b.refName === region.refName && b.reversed)
      )
    },
  }))
  .views(self => ({
    // The linear view's bp to screen x over the cut, read off its live
    // blocks so it follows every frame of a pan
    get hostBpFrame() {
      const { host, graphRegion } = self
      return host?.initialized && graphRegion
        ? hostFrame(host, graphRegion)
        : undefined
    },
  }))
  .views(self => ({
    get hostFrame() {
      return self.hostPlacesX ? self.hostBpFrame : undefined
    },
    get tubeMapPicture() {
      const drawing = self.layoutResult?.tubeMap
      return drawing ? tubeMapPicture(drawing) : undefined
    },
    get tubeMapReference() {
      const drawing = self.layoutResult?.tubeMap
      return drawing ? referenceBoxes(drawing) : undefined
    },
    // the folded variants, as ticks on the tubes of the walks carrying them
    get tubeMapDeviations() {
      const drawing = self.layoutResult?.tubeMap
      return drawing?.coarse
        ? deviationMarks(drawing, drawing.coarse.deviations)
        : []
    },
    // the reference boxes a linear view's connectors tie to its bp, which
    // the reference axis already puts under that bp
    get tubeMapConnectedBoxes() {
      const reference = this.tubeMapReference
      const { layoutResult } = self
      return reference &&
        !layoutResult?.referenceAxis &&
        !layoutResult?.tubeMapPanels
        ? [...reference.values()].flat()
        : undefined
    },
  }))
  .views(self => ({
    // A linear view has the genes in a track of their own, at their bp
    get tubeMapGenes() {
      const reference = self.tubeMapReference
      return self.showGenes &&
        !self.host &&
        reference &&
        self.backboneGenes &&
        !self.layoutResult?.tubeMapPanels
        ? tubeMapGenes(reference, self.backboneGenes)
        : []
    },
    // A drawing of nodes in its own coordinates inside a linear view, whose
    // reference segments the strip can put back at their bp
    get referenceStripApplies() {
      return (
        !!self.host?.initialized &&
        !!self.layoutResult &&
        self.drawsNodes &&
        !self.hostPlacesX &&
        !self.facetPanels
      )
    },
  }))
  .views(self => ({
    // greyed outside an open bubble, as the drawing is
    get referenceStripBlocks() {
      const { graph } = self
      if (!self.showReferenceStrip || !self.referenceStripApplies || !graph) {
        return []
      }
      const blocks = referenceStripBlocks(graph, {
        colorScheme: self.effectiveColorScheme,
        referenceRamp: self.referenceRamp,
        walks: self.walkLift?.walks,
      })
      const focus = self.walkLift ? undefined : self.openBubbleFocus
      return focus
        ? blocks.map(({ pieces, ...b }) =>
            focus.nodeIds.has(b.node)
              ? { ...b, ...(pieces ? { pieces } : {}) }
              : { ...b, colors: [LIFT_BACKDROP_CSS], faded: true },
          )
        : blocks
    },
  }))
  .views(self => ({
    get referenceStripShown() {
      return (
        self.referenceStripBlocks.length > 0 && self.hostBpFrame !== undefined
      )
    },
    // Whether the graph draws reference past the window's edges. A boolean
    // rather than the bp, which moves on every frame of a pan and would
    // resize the legend with it.
    get referenceStripOverhangs() {
      const frame = self.hostBpFrame
      if (!frame || self.referenceStripBlocks.length === 0) {
        return false
      }
      const { left, right } = stripOverhang(
        self.referenceStripBlocks,
        frame,
        self.paneWidth,
      )
      return left > 0 || right > 0
    },
    // Whether grey shows in the window, so the key names it only then
    get referenceStripFaded() {
      const frame = self.hostBpFrame
      return (
        frame !== undefined &&
        stripFadedShown(self.referenceStripBlocks, frame, self.paneWidth)
      )
    },
  }))
  .views(self => ({
    // The lit span on the strip: the hovered node's while hover lights
    // nodes, the hovered bubble's, or the selected node's
    get referenceStripLit() {
      const bubble = self.hoveredNode === null ? self.hoveredBubble : null
      const nodeId = self.litNode ?? self.selectedNode
      const span =
        bubble && !bubble.offReference
          ? { start: bubble.start, end: bubble.end }
          : nodeId === null
            ? undefined
            : self.nodeSpan(nodeId)
      return self.referenceStripShown ? span : undefined
    },
    // The node whose span the strip outlines, which the graph outlines in the
    // same ink, unless the drawing folded it
    get referenceStripNode() {
      const bubble = self.hoveredNode === null ? self.hoveredBubble : null
      const nodeId = self.litNode ?? self.selectedNode
      return this.referenceStripLit &&
        !(bubble && !bubble.offReference) &&
        nodeId !== null &&
        !self.folded.has(nodeId)
        ? nodeId
        : null
    },
    referenceStripNodeAt(sx: number, sy: number) {
      const frame = self.hostBpFrame
      return self.referenceStripShown && frame
        ? stripBlockAt(self.referenceStripBlocks, frame, sx, sy)
        : undefined
    },
    // the strip, and the gap the fit leaves under it
    get referenceStripZonePx() {
      return self.referenceStripShown ? REFERENCE_STRIP_ZONE_PX : 0
    },
  }))

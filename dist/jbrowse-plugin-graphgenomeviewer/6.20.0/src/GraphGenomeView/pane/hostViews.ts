import { sameBubble } from '@jbrowse/bandage-core/bubbles/bubbleLine'
import { layoutModeByValue } from '@jbrowse/bandage-core/layoutModes'
import {
  REFERENCE_STRIP_ZONE_PX,
  nodeAnchor,
  referenceStripBlocks,
  stripBlockAt,
  stripOverhang,
} from '@jbrowse/bandage-core/referenceStrip'
import { referenceBoxes } from '@jbrowse/bandage-core/tubeMap/axis'
import { deviationMarks } from '@jbrowse/bandage-core/tubeMap/deviations'
import { tubeMapPicture } from '@jbrowse/bandage-core/tubeMap/draw'
import { tubeMapGenes } from '@jbrowse/bandage-core/tubeMap/genes'

import { hostFrame } from '../host'
import { PAPER_DARK, PAPER_LIGHT, paperCss } from './paneBase'
import { withWalkRowViews } from './walkRowViews'

export const withHostViews = withWalkRowViews
  .views(self => ({
    // Whether the drawing's x is reference bp a host can place. Walk rows
    // put the backbone at its bp too, but their bars are lengths, so the
    // mode's `cutMargins` is what says the drawing is a picture.
    get xIsReferenceBp() {
      return (
        self.layoutResult?.referenceAxis === true &&
        layoutModeByValue(self.chosenLayoutMode).cutMargins
      )
    },
  }))
  .views(self => ({
    // Whether the host places x. Only a layout whose x is reference bp can
    // take the window's transform; force, ordered and walk rows draw in
    // their own coordinates inside the track, and a popped bubble is a
    // picture of its own.
    get hostPlacesX() {
      const { host, graphRegion: region } = self
      return (
        host !== undefined &&
        host.initialized &&
        region !== undefined &&
        self.xIsReferenceBp &&
        self.popStack.length === 0 &&
        !host.dynamicBlocks.contentBlocks.some(
          b => b.refName === region.refName && b.reversed,
        )
      )
    },
  }))
  .views(self => ({
    get hostFrame() {
      const { host, graphRegion } = self
      return self.hostPlacesX && host && graphRegion
        ? hostFrame(host, graphRegion)
        : undefined
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
    get referenceStripBlocks() {
      const { graph } = self
      return self.showReferenceStrip && self.referenceStripApplies && graph
        ? referenceStripBlocks(graph, {
            colorScheme: self.effectiveColorScheme,
            referenceRamp: self.referenceRamp,
            walks: self.walkLift?.walks,
          })
        : []
    },
    // Read off the live blocks, so the strip follows every frame of a pan
    // in the linear view
    get referenceStripFrame() {
      const { host, graphRegion } = self
      return host?.initialized && graphRegion
        ? hostFrame(host, graphRegion)
        : undefined
    },
  }))
  .views(self => ({
    get referenceStripShown() {
      return (
        self.referenceStripBlocks.length > 0 &&
        self.referenceStripFrame !== undefined
      )
    },
    // Whether the graph draws reference past the window's edges. A boolean
    // rather than the bp, which moves on every frame of a pan and would
    // resize the legend with it.
    get referenceStripOverhangs() {
      const frame = self.referenceStripFrame
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
    get referenceStripFaded() {
      return self.referenceStripBlocks.some(b => b.faded)
    },
  }))
  .views(self => ({
    // The lit span on the strip, and where the graph drew what it is of:
    // the hovered node, the hovered bubble's name, or the selected node
    get referenceStripLit() {
      if (!self.referenceStripShown) {
        return undefined
      }
      const toScreen = (p: { x: number; y: number }) => ({
        x: p.x * self.scaleX + self.translateX,
        y: p.y * self.scaleY + self.translateY,
      })
      const bubble = self.hoveredNode === null ? self.hoveredBubble : null
      if (bubble && !bubble.offReference) {
        const halo = self.bubbleHalos.find(h => sameBubble(h.bubble, bubble))
        return {
          start: bubble.start,
          end: bubble.end,
          anchor: halo ? toScreen(halo.labelAt) : undefined,
        }
      }
      const nodeId = self.hoveredNode ?? self.selectedNode
      const span = nodeId === null ? undefined : self.nodeSpan(nodeId)
      return span && nodeId !== null
        ? {
            ...span,
            anchor: nodeAnchor(self.nodePositions?.[nodeId], toScreen),
          }
        : undefined
    },
    referenceStripNodeAt(sx: number, sy: number) {
      const frame = self.referenceStripFrame
      return self.referenceStripShown && frame
        ? stripBlockAt(self.referenceStripBlocks, frame, sx, sy)
        : undefined
    },
    get paperCss() {
      return paperCss(self.darkMode ? PAPER_DARK : PAPER_LIGHT)
    },
    // the strip, and the gap the fit leaves under it
    get referenceStripZonePx() {
      return self.referenceStripShown ? REFERENCE_STRIP_ZONE_PX : 0
    },
  }))

import {
  placeRowGenes,
  rowSpan,
} from '@jbrowse/bandage-core/layout/walkRowDraw'
import { filterSamples } from '@jbrowse/bandage-core/layout/walkRows'
import {
  cutsWholeWalks as wholeWalksRule,
  stripMarks,
  walkStripApplies,
  walkStripFrame,
} from '@jbrowse/bandage-core/layout/walkStrip'
import { layoutModeByValue } from '@jbrowse/bandage-core/layoutModes'
import { nodeAnchor } from '@jbrowse/bandage-core/referenceStrip'

import { withLaunchViews } from './launchViews'
import { WALK_GENE_ROWS } from './paneBase'
import { resolveLocationAssembly } from '../../launchFromGraph/contributors'

import type { SubgraphRegion } from '../../GetSubgraph'

export const withWalkRowViews = withLaunchViews
  .views(self => ({
    // Whether the strip of walk rows sits under the drawing: asked for, on a
    // standalone view whose layout draws nodes, for a graph with walks
    get walkStripShown() {
      return walkStripApplies({
        walkStrip: self.walkStrip,
        mode: { drawsNodes: self.modeDrawsNodes },
        drawsPicture: !!self.layoutResult?.tubeMap || !!self.walkRowBars,
        walks: self.graph?.paths?.length ?? 0,
        host: !!self.host,
      })
    },
    // The strip's rows: the cut's, with the sample filter and no repeat
    // pick, which the Repeat menu only offers in walk rows
    get walkStripRows() {
      const bars = this.walkStripShown ? self.cutWalkRows : undefined
      return bars
        ? { ...bars, rows: filterSamples(bars.rows, self.walkRowSamples) }
        : undefined
    },
    get walkStripFrame() {
      const bars = this.walkStripRows
      if (!bars) {
        return undefined
      }
      return walkStripFrame(bars, { width: self.paneWidth })
    },
    // Whether a cut must follow every snarl a walk leaves the window by, so
    // walks come back whole: walk rows measure them, and so does the strip
    get cutsWholeWalks() {
      return wholeWalksRule(layoutModeByValue(self.chosenLayoutMode), {
        walkStrip: self.walkStrip,
        host: !!self.host,
      })
    },
    // Where each walk passes the hovered node, or the selected one
    get walkStripMarks() {
      const bars = this.walkStripRows
      const id = self.hoveredNode ?? self.selectedNode
      const node = id === null ? undefined : self.nodeById?.get(id)
      return bars && node && self.graph
        ? stripMarks(self.graph, [bars.reference, ...bars.rows], node)
        : []
    },
    // Where the drawing has the node a strip point lights, for the ring
    // that finds it in a hairball
    get walkStripLocator() {
      const id = self.stripHover ? self.hoveredNode : null
      return id === null
        ? undefined
        : nodeAnchor(self.nodePositions?.[id], p => ({
            x: p.x * self.scaleX + self.translateX,
            y: p.y * self.scaleY + self.translateY,
          }))
    },
  }))
  .views(self => ({
    // The gene reads walk rows need, as the layout or the strip: for each row whose haplotype
    // (`HG00097#1`) names an assembly with a gene track, that track over the
    // span of its own contig the row's bar covers. The first WALK_GENE_ROWS
    // such rows are read, and the rest counted for the key.
    get walkGeneReads() {
      const bars = self.walkRowBars ?? self.walkStripRows
      if (!bars || !self.showGenes) {
        return undefined
      }
      const reads: {
        row: string
        trackId: string
        region: SubgraphRegion
      }[] = []
      let untrackedRows = 0
      let unplaced = 0
      for (const row of bars.rows) {
        if (!row.axis) {
          unplaced++
          continue
        }
        const assemblyName = resolveLocationAssembly(self.assemblyResolver, {
          sample: row.sample,
          haplotype:
            row.haplotype === undefined
              ? undefined
              : `${row.sample}#${row.haplotype}`,
        })
        const track = assemblyName
          ? self.geneTracksByAssembly.get(assemblyName)
          : undefined
        if (!assemblyName || !track) {
          untrackedRows++
          continue
        }
        reads.push({
          row: row.name,
          trackId: track.trackId,
          region: {
            assemblyName,
            refName: row.axis.contig,
            ...rowSpan(row.axis, row.bp),
          },
        })
      }
      return {
        reads: reads.slice(0, WALK_GENE_ROWS),
        gaps: {
          untracked: untrackedRows,
          unplaced,
          unread: Math.max(0, reads.length - WALK_GENE_ROWS),
        },
      }
    },
    get walkRowGeneGaps() {
      return this.walkGeneReads?.gaps
    },
    // Where a walk row's bar lies in its own assembly, for a linear view to
    // open: the span of its contig the bar covers, on the session assembly
    // its haplotype names (the cut's own assembly for the reference row).
    // The label names the haplotype when no assembly is loaded for it.
    walkRowLaunchTarget(index: number, bars = self.walkRowBars) {
      const row = bars ? [bars.reference, ...bars.rows][index] : undefined
      if (!row?.axis) {
        return undefined
      }
      const haplotype =
        row.haplotype === undefined
          ? undefined
          : `${row.sample}#${row.haplotype}`
      const assembly =
        index === 0
          ? self.graphRegion?.assemblyName
          : resolveLocationAssembly(self.assemblyResolver, {
              sample: row.sample,
              haplotype,
            })
      return {
        label: row.label,
        assembly,
        location: {
          sample: row.sample,
          haplotype,
          refName: row.axis.contig,
          ...rowSpan(row.axis, row.bp),
        },
      }
    },
    // Each row's genes as offsets along its bar: the reference row's from
    // the backbone's gene track, every other row's from its own assembly
    get walkRowGenes() {
      const bars = self.walkRowBars ?? self.walkStripRows
      if (!bars || !self.showGenes) {
        return undefined
      }
      const byRow = new Map(self.walkGeneFeatures ?? [])
      if (self.geneFeatures) {
        byRow.set(bars.reference.name, self.geneFeatures)
      }
      return byRow.size
        ? placeRowGenes([bars.reference, ...bars.rows], byRow)
        : undefined
    },
  }))

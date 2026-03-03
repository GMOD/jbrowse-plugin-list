import { Feature } from '@jbrowse/core/util'

function* getPositions(f: Feature, strand: number) {
  const start = f.get('start')
  const end = f.get('end')
  if (strand !== -1) {
    for (let pos = start; pos < end; pos++) {
      yield pos
    }
  } else {
    // For reverse strand, iterate from end-1 down to start (inclusive)
    // to properly handle 0-based half-open intervals [start, end)
    for (let pos = end - 1; pos >= start; pos--) {
      yield pos
    }
  }
}

// see similar function in msaview plugin and g2p_mapper
export function genomeToTranscriptMapping(feature: Feature) {
  const strand = feature.get('strand') as number
  const refName = feature.get('refName')
  const subs = feature.children?.() ?? []
  const cds = subs
    .filter(f => f.get('type') === 'CDS')
    .toSorted((a, b) => strand * (a.get('start') - b.get('start')))

  const g2p: Record<number, number> = {}
  const p2g: Record<number, number> = {}

  if (cds.length === 0) {
    return { g2p, p2g, refName, strand }
  }

  // Account for CDS phase: phase indicates how many bases to skip
  // to reach the next complete codon (0, 1, or 2)
  const firstPhase = (cds[0]?.get('phase') as number | undefined) ?? 0
  let proteinCounter = (3 - firstPhase) % 3
  let lastProteinPos = -1

  for (const f of cds) {
    for (const genomePos of getPositions(f, strand)) {
      const proteinPos = Math.floor(proteinCounter++ / 3)
      g2p[genomePos] = proteinPos
      if (proteinPos !== lastProteinPos) {
        p2g[proteinPos] = genomePos
        lastProteinPos = proteinPos
      }
    }
  }

  return {
    g2p,
    p2g,
    refName,
    strand,
  }
}

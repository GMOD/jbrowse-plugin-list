/**
 * A Newick tree whose only job is to group rows.
 *
 * With one file the rows are a pileup and their order is the whole structure.
 * With several, the rows of two samples interleave into a list nothing separates
 * — and react-msaview already draws a tree, collapses its clades and can show
 * one branch alone, all of it keyed off a Newick string it is currently never
 * given. Handing it one grouped by sample turns those controls on for free: a
 * clade per sample, collapsible, and the allele ladder inside each.
 *
 * The tree is a grouping, not a phylogeny. Branch lengths are all 1 and say
 * nothing; the topology is the sample the row came from, and the leaf order
 * inside a clade is the copy-number order the rows were already in.
 */

/**
 * Newick reserves these, and a name is not quoted when it goes in.
 *
 * **Applied where the row name is built, not here.** react-msaview joins a tree
 * leaf to an alignment row by name, so sanitizing on the way into the Newick
 * and leaving the FASTA defline alone matches nothing: every row whose name
 * needed fixing renders blank, with its label still in the tree, which looks
 * like a rendering bug rather than a naming one. A track named `HG004 (mother)`
 * is enough to trigger it.
 */
export function newickSafe(name: string) {
  return name.replaceAll(/[(),:;[\]'\s]+/g, '_').replace(/_+$/, '')
}

export interface TreeRow {
  name: string
  /** what the defline says, when that is not just the name */
  label?: string
  sample?: string
}

/**
 * Groups rows by sample, keeping the order they arrive in both for the clades
 * and inside them. Returns undefined when there is nothing to group — one
 * sample, or none — since a tree of one clade is a line drawn beside a list.
 */
export function buildSampleTree(rows: TreeRow[]) {
  const bySample = new Map<string, string[]>()
  const ungrouped: string[] = []
  for (const row of rows) {
    // the leaf is the row's *defline*, already Newick-safe from getReadNames.
    // The tree must not rewrite it, and must not use the identity where the
    // defline carries a label — react-msaview joins the two by string, and a
    // leaf naming no row leaves that row blank with its label still drawn
    const leaf = row.label ?? row.name
    if (row.sample === undefined) {
      ungrouped.push(leaf)
    } else {
      const group = bySample.get(row.sample)
      if (group) {
        group.push(leaf)
      } else {
        bySample.set(row.sample, [leaf])
      }
    }
  }
  if (bySample.size < 2) {
    return undefined
  }
  const clades = [
    // the reference has no sample and belongs above all of them
    ...ungrouped.map(name => `${name}:1`),
    ...[...bySample].map(
      ([sample, names]) => `(${names.map(n => `${n}:1`).join(',')})${sample}:1`,
    ),
  ]
  return `(${clades.join(',')});`
}

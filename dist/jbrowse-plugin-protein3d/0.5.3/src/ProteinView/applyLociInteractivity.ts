import loadMolstar from './loadMolstar'

import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { MolScriptBuilder } from 'molstar/lib/mol-script/language/builder'
import type { Expression } from 'molstar/lib/mol-script/language/expression'

type ResidueTest = (Q: typeof MolScriptBuilder) => Expression

/**
 * Which residues a highlight/selection should cover, in the plugin's native
 * 0-based structure-sequence coordinates (see coordinates.ts). `range` is the
 * half-open span [start, end); `list` is an explicit set of positions. The one
 * conversion to molstar's 1-based inclusive label_seq_id happens in specToTest
 * below — the single boundary where structure positions cross into molstar.
 */
export type ResidueSpec =
  | { kind: 'range'; start: number; end: number }
  | { kind: 'list'; residues: number[] }

const seqId = (Q: typeof MolScriptBuilder) =>
  Q.struct.atomProperty.macromolecular.label_seq_id()

const specToTest = (spec: ResidueSpec): ResidueTest =>
  spec.kind === 'range'
    ? Q =>
        Q.core.logic.and([
          Q.core.rel.gre([seqId(Q), spec.start + 1]),
          Q.core.rel.lte([seqId(Q), spec.end]),
        ])
    : Q =>
        Q.core.logic.or(
          spec.residues.map(pos => Q.core.rel.eq([seqId(Q), pos + 1])),
        )

const isActive = (spec: ResidueSpec | undefined): spec is ResidueSpec =>
  spec !== undefined &&
  (spec.kind === 'range' ? spec.end > spec.start : spec.residues.length > 0)

/**
 * Reconcile one interactivity channel (hover-`highlight` or click-`select`) to
 * the desired residue spec. Passing `undefined` (or an empty `list`) clears the
 * channel, so callers describe the target state declaratively rather than
 * juggling clear/apply calls.
 */
export async function setMolstarLoci({
  structure,
  plugin,
  channel,
  spec,
  entityId,
}: {
  structure: Structure
  plugin: PluginContext
  channel: 'highlight' | 'select'
  spec: ResidueSpec | undefined
  /** Confine the loci to this mmCIF entity so a residue number doesn't light up
   * on unrelated chains (binding partners, the other half of a homodimer). */
  entityId?: string
}) {
  const { lociHighlights, lociSelects } = plugin.managers.interactivity
  if (channel === 'highlight') {
    lociHighlights.clearHighlights()
  } else {
    lociSelects.deselectAll()
  }

  if (isActive(spec)) {
    const { StructureSelection, Script } = await loadMolstar()
    const sel = Script.getStructureSelection(
      Q =>
        Q.struct.generator.atomGroups({
          ...(entityId
            ? {
                'chain-test': Q.core.rel.eq([
                  Q.struct.atomProperty.macromolecular.label_entity_id(),
                  entityId,
                ]),
              }
            : {}),
          'residue-test': specToTest(spec)(Q),
          'group-by': Q.struct.atomProperty.macromolecular.residueKey(),
        }),
      structure,
    )
    const loci = StructureSelection.toLociWithSourceUnits(sel)
    if (channel === 'highlight') {
      lociHighlights.highlight({ loci })
    } else {
      lociSelects.select({ loci })
    }
  }
}

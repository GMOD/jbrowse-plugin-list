import loadMolstar from './loadMolstar'
import { encodedColor } from './markEncoding'
import { parseSite, siteExpression } from './residueSpec'
import { serialPerPlugin } from './serialPerPlugin'
import {
  RESIDUE_MARKS_TAG,
  drawnUnder,
  structureRootCell,
} from './structureCells'

import type { ConstantEncoding } from './markEncoding'
import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export { RESIDUE_MARKS_TAG } from './structureCells'

/**
 * A site of a structure drawn on its own, whichever chain holds it: a
 * partner peptide's phenylalanine, a ligand, a pocket residue, a partner
 * protein. `site` is a residue (`B:11`), an atom of one (`A:248@NH2`), a
 * component id (`MOV`) or a whole chain (`G:*`); `structure` indexes the
 * view's structures, the first by default. `mark` is the geometry and
 * `encoding.color.value` its color, as in a mark display's `marks`. A
 * `cartoon` mark of a chain left out of the structure's `chains` draws that
 * chain's polymer, a partner protein say, in its own color; as spheres or
 * sticks a chain site takes every residue of the chain, its glycans and
 * waters included. `label` writes its text beside the site, a gene's name on
 * its chain say; `mark: 'none'` draws the label alone. markProblems checks a
 * snapshot's marks.
 */
export interface ResidueMark {
  site: string
  structure?: number
  mark?: 'spheres' | 'sticks' | 'cartoon' | 'none'
  label?: string
  encoding?: ConstantEncoding
}

function markRepresentation(mark: Exclude<ResidueMark['mark'], 'none'>) {
  return mark === 'sticks'
    ? {
        type: 'ball-and-stick' as const,
        typeParams: { sizeFactor: 0.35, sizeAspectRatio: 0.7 },
      }
    : // as thick as the cartoon drawOnlyChains gives the chains beside it
      mark === 'cartoon'
      ? { type: 'cartoon' as const, typeParams: { sizeFactor: 0.45 } }
      : { type: 'spacefill' as const, typeParams: { sizeFactor: 1 } }
}
export const DEFAULT_MARK_COLOR = '#f28e2b'

export function syncResidueMarks({
  plugin,
  structures,
  marks,
  labels = true,
}: {
  plugin: PluginContext
  structures: readonly (Structure | undefined)[]
  marks: readonly ResidueMark[]
  /** the text beside each labelled site; Node has no canvas to draw it in tests */
  labels?: boolean
}) {
  return serialPerPlugin(plugin, async () => {
    const molstar = await loadMolstar()
    const {
      Color,
      MolScriptBuilder: MS,
      Script,
      StateSelection,
      StructureSelection,
      StateTransforms,
      createStructureRepresentationParams,
    } = molstar
    const update = plugin.state.data.build()
    for (const cell of plugin.state.data.select(
      StateSelection.Generators.root.subtree().withTag(RESIDUE_MARKS_TAG),
    )) {
      update.delete(cell.transform.ref)
    }
    for (const mark of marks) {
      const structure = structures[mark.structure ?? 0]
      const site = parseSite(mark.site)
      const root = structure
        ? structureRootCell(plugin, molstar, structure)
        : undefined
      if (!structure || !site || !root) {
        continue
      }
      if (mark.mark !== 'none') {
        const color = encodedColor(mark.encoding, DEFAULT_MARK_COLOR)
        update
          .to(root)
          .apply(
            StateTransforms.Model.StructureComponent,
            {
              type: { name: 'expression', params: siteExpression(MS, site) },
              nullIfEmpty: true,
              label: mark.site,
            },
            drawnUnder(root, RESIDUE_MARKS_TAG),
          )
          .apply(
            StateTransforms.Representation.StructureRepresentation3D,
            createStructureRepresentationParams(plugin, structure, {
              ...markRepresentation(mark.mark),
              color: 'uniform',
              colorParams: { value: Color.fromHexStyle(color) },
            }),
            drawnUnder(root, RESIDUE_MARKS_TAG),
          )
      }
    }
    await update.commit()
    if (labels) {
      for (const mark of marks) {
        const structure = structures[mark.structure ?? 0]
        const site = parseSite(mark.site)
        if (mark.label && structure && site) {
          const loci = StructureSelection.toLociWithSourceUnits(
            Script.getStructureSelection(siteExpression(MS, site), structure),
          )
          await plugin.managers.structure.measurement.addLabel(loci, {
            selectionTags: [RESIDUE_MARKS_TAG],
            reprTags: [RESIDUE_MARKS_TAG],
            labelParams: {
              customText: mark.label,
              textColor: Color.fromHexStyle(
                encodedColor(mark.encoding, DEFAULT_MARK_COLOR),
              ),
              textSize: 0.14,
              borderWidth: 0,
              offsetZ: 4,
              background: true,
              backgroundColor: Color.fromHexStyle('#ffffff'),
              backgroundOpacity: 0.85,
              backgroundMargin: 0.2,
            },
          })
        }
      }
    }
  })
}

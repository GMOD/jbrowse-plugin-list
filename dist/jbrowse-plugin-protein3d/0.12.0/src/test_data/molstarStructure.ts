import { CIF } from 'molstar/lib/mol-io/reader/cif'
import { Structure } from 'molstar/lib/mol-model/structure'
import { trajectoryFromMmCIF } from 'molstar/lib/mol-model-formats/structure/mmcif'
import { Task } from 'molstar/lib/mol-task'

export interface TestChain {
  asym: string
  entity: string
  residues: string[]
}

/**
 * A Mol* Structure parsed from a CA-only mmCIF, one atom per residue numbered
 * from label_seq_id 1. Every call parses anew, so two calls give two models
 * with different ids, as two loads into one view do.
 */
export async function parseStructure(chains: TestChain[]) {
  const atoms = chains.flatMap(({ asym, entity, residues }) =>
    residues.map((comp, i) => ({ asym, entity, comp, seq: i + 1 })),
  )
  const mmcif = `data_TEST
loop_
_atom_site.group_PDB
_atom_site.id
_atom_site.type_symbol
_atom_site.label_atom_id
_atom_site.label_comp_id
_atom_site.label_asym_id
_atom_site.label_entity_id
_atom_site.label_seq_id
_atom_site.Cartn_x
_atom_site.Cartn_y
_atom_site.Cartn_z
_atom_site.auth_seq_id
_atom_site.auth_asym_id
${atoms
  .map(
    ({ asym, entity, comp, seq }, i) =>
      `ATOM ${i + 1} C CA ${comp} ${asym} ${entity} ${seq} ${i + 1}.0 0.0 0.0 ${seq} ${asym}`,
  )
  .join('\n')}
`
  const parsed = await CIF.parseText(mmcif).run()
  if (parsed.isError) {
    throw new Error(parsed.message)
  }
  const trajectory = await trajectoryFromMmCIF(parsed.result.blocks[0]!).run()
  return Structure.ofModel(
    await Task.resolveInContext(trajectory.getFrameAtIndex(0)),
  )
}

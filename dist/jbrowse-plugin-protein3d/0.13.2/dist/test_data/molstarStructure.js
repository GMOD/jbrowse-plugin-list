import { CIF } from 'molstar/lib/mol-io/reader/cif';
import { Structure } from 'molstar/lib/mol-model/structure';
import { trajectoryFromMmCIF } from 'molstar/lib/mol-model-formats/structure/mmcif';
import { Task } from 'molstar/lib/mol-task';
/**
 * A CA-only mmCIF, one atom per residue numbered from label_seq_id 1. Each
 * chain is an α-helix of its own, so a superposition has real geometry to fit,
 * and every model after the first is nudged, as an NMR ensemble's are.
 */
export function caOnlyMmcif(chains, { models = 1 } = {}) {
    const rows = [];
    for (let model = 1; model <= models; model++) {
        chains.forEach(({ asym, entity, residues }, chainIndex) => {
            residues.forEach((comp, i) => {
                const turn = (i * 100 * Math.PI) / 180;
                const x = 2.3 * Math.cos(turn) + 20 * chainIndex + 0.2 * (model - 1);
                const y = 2.3 * Math.sin(turn);
                const z = 1.5 * i;
                rows.push(`ATOM ${rows.length + 1} C CA ${comp} ${asym} ${entity} ${i + 1} ${x.toFixed(3)} ${y.toFixed(3)} ${z.toFixed(3)} ${i + 1} ${asym} ${model}`);
            });
        });
    }
    return `data_TEST
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
_atom_site.pdbx_PDB_model_num
${rows.join('\n')}
`;
}
/**
 * A Mol* Structure parsed from `caOnlyMmcif`, without a plugin. Every call
 * parses anew, so two calls give two models with different ids, as two loads
 * into one view do.
 */
export async function parseStructure(chains) {
    const parsed = await CIF.parseText(caOnlyMmcif(chains)).run();
    if (parsed.isError) {
        throw new Error(parsed.message);
    }
    const trajectory = await trajectoryFromMmCIF(parsed.result.blocks[0]).run();
    return Structure.ofModel(await Task.resolveInContext(trajectory.getFrameAtIndex(0)));
}

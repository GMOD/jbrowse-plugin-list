const RESIDUE = /^([^:@\s]+):(-?\d+)([A-Za-z]?)(?:@([A-Za-z0-9'"*]+))?$/;
const COMPONENT = /^[A-Za-z0-9]{1,5}$/;
const CHAIN = /^([^:@\s]+):\*$/;
/**
 * `<auth_asym_id>:<auth_seq_id>`, an insertion code after the number
 * (`A:52B`) and an atom after `@` (`A:248@NH2`): the numbering a paper cites.
 */
export function parseResidue(text) {
    const match = RESIDUE.exec(text.trim());
    return match
        ? {
            kind: 'residue',
            chain: match[1],
            seq: Number(match[2]),
            insertion: match[3],
            atom: match[4],
        }
        : undefined;
}
/**
 * A residue as above, a bare component id (`MOV`, `HEM`) naming every residue
 * of that component, or a whole chain (`G:*`).
 */
export function parseSite(text) {
    const residue = parseResidue(text);
    const trimmed = text.trim();
    const chain = CHAIN.exec(trimmed);
    return (residue ??
        (chain
            ? { kind: 'chain', chain: chain[1] }
            : COMPONENT.test(trimmed)
                ? { kind: 'component', compId: trimmed.toUpperCase() }
                : undefined));
}
export function formatSite(site) {
    return site.kind === 'component'
        ? site.compId
        : site.kind === 'chain'
            ? `${site.chain}:*`
            : `${site.chain}:${site.seq}${site.insertion}${site.atom ? `@${site.atom}` : ''}`;
}
/** The atoms `site` names, whole residues unless the site names an atom. */
export function siteExpression(MS, site) {
    if (site.kind === 'component') {
        return MS.struct.generator.atomGroups({
            'residue-test': MS.core.rel.eq([MS.ammp('auth_comp_id'), site.compId]),
            'group-by': MS.struct.atomProperty.macromolecular.residueKey(),
        });
    }
    if (site.kind === 'chain') {
        return MS.struct.generator.atomGroups({
            'chain-test': MS.core.rel.eq([MS.ammp('auth_asym_id'), site.chain]),
        });
    }
    return MS.struct.generator.atomGroups({
        'chain-test': MS.core.rel.eq([MS.ammp('auth_asym_id'), site.chain]),
        'residue-test': MS.core.logic.and([
            MS.core.rel.eq([MS.ammp('auth_seq_id'), site.seq]),
            MS.core.rel.eq([MS.ammp('pdbx_PDB_ins_code'), site.insertion]),
        ]),
        ...(site.atom
            ? {
                'atom-test': MS.core.rel.eq([MS.ammp('label_atom_id'), site.atom]),
            }
            : {}),
        'group-by': MS.struct.atomProperty.macromolecular.residueKey(),
    });
}

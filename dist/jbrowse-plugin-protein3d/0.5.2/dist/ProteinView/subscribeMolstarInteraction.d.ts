import type { PluginContext } from 'molstar/lib/mol-plugin/context';
export interface MolstarLocationInfo {
    /**
     * 0-based label position (label_seq_id - 1). This is the plugin's canonical
     * structure coordinate: structureSequences, the coordinate maps, and the
     * outbound highlight in setMolstarLoci are all label-based, so the inbound
     * read must be too. For AlphaFold structures label_seq_id == auth_seq_id, but
     * for PDB structures whose author numbering is offset or gapped they diverge,
     * and reading auth_seq_id here would mis-map every hover/click.
     */
    structureSeqPos: number;
    code: string;
    chain: string;
}
/**
 * Subscribe to molstar's click/hover behavior with the location-extraction
 * boilerplate factored out. The handler receives extracted location info when
 * the cursor is over a structure element, or `undefined` otherwise (so e.g.
 * hover handlers can clear state when the cursor leaves).
 *
 * Returns a cleanup function suitable for use with mobx's addDisposer.
 */
export default function subscribeMolstarInteraction({ plugin, kind, onUpdate, }: {
    plugin: PluginContext;
    kind: 'click' | 'hover';
    onUpdate: (info: MolstarLocationInfo | undefined) => void;
}): Promise<() => void>;

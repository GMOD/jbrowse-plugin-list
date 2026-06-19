import type { PluginContext } from 'molstar/lib/mol-plugin/context';
export interface MolstarLocationInfo {
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

import type { Structure } from 'molstar/lib/mol-model/structure';
import type { PluginContext } from 'molstar/lib/mol-plugin/context';
/**
 * Which residues a highlight/selection should cover, in the plugin's native
 * 0-based structure-sequence coordinates (see coordinates.ts). `range` is the
 * half-open span [start, end); `list` is an explicit set of positions. The one
 * conversion to molstar's 1-based inclusive label_seq_id happens in specToTest
 * below — the single boundary where structure positions cross into molstar.
 */
export type ResidueSpec = {
    kind: 'range';
    start: number;
    end: number;
} | {
    kind: 'list';
    residues: number[];
};
/**
 * Reconcile one interactivity channel (hover-`highlight` or click-`select`) to
 * the desired residue spec. Passing `undefined` (or an empty `list`) clears the
 * channel, so callers describe the target state declaratively rather than
 * juggling clear/apply calls.
 */
export declare function setMolstarLoci({ structure, plugin, channel, spec, }: {
    structure: Structure;
    plugin: PluginContext;
    channel: 'highlight' | 'select';
    spec: ResidueSpec | undefined;
}): Promise<void>;

import type { Structure } from 'molstar/lib/mol-model/structure';
import type { PluginContext } from 'molstar/lib/mol-plugin/context';
/**
 * Reconcile one interactivity channel (hover-`highlight` or click-`select`) to
 * a set of residues, addressed by molstar's own `label_seq_id`.
 *
 * Taking ids rather than the plugin's 0-based structure positions keeps the
 * conversion in one place (see Entity.seqIds) instead of assuming `pos + 1`,
 * which silently mis-paints PDB files whose residues don't start at 1. Passing
 * an empty/undefined list clears the channel, so callers describe the target
 * state declaratively rather than juggling clear/apply calls.
 */
export declare function setMolstarLoci({ structure, plugin, channel, labelSeqIds, entityId, }: {
    structure: Structure;
    plugin: PluginContext;
    channel: 'highlight' | 'select';
    labelSeqIds: number[] | undefined;
    /** Confine the loci to this mmCIF entity so a residue number doesn't light up
     * on unrelated chains (binding partners, the other half of a homodimer). */
    entityId?: string;
}): Promise<void>;

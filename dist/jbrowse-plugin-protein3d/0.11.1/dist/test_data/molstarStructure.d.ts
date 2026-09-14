import { Structure } from 'molstar/lib/mol-model/structure';
export interface TestChain {
    asym: string;
    entity: string;
    residues: string[];
}
/**
 * A Mol* Structure parsed from a CA-only mmCIF, one atom per residue numbered
 * from label_seq_id 1. Every call parses anew, so two calls give two models
 * with different ids, as two loads into one view do.
 */
export declare function parseStructure(chains: TestChain[]): Promise<Structure>;

import { BaseAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { ProteinEntry } from './parseResults';
/**
 * Reads the `Results_*` folder of an OrthoFinder run as a dataset: each protein
 * id it saw names its orthogroup's alignment and gene tree.
 */
export default class OrthoFinderMsaAdapter extends BaseAdapter {
    orthogroupsP: Promise<Map<string, Map<string, ProteinEntry>>> | undefined;
    resolvedTreesP: Promise<Map<string, string> | 'per-orthogroup'> | undefined;
    readResultsFile(path: string): Promise<string>;
    getOrthogroups(): Promise<Map<string, Map<string, ProteinEntry>>>;
    getResolvedTrees(): Promise<Map<string, string> | "per-orthogroup">;
    readAlignment(orthogroup: string): Promise<string>;
    readTree(orthogroup: string): Promise<string | undefined>;
    speciesFor(assemblyName?: string): Promise<string[]>;
    getMSAList(assemblyName?: string): Promise<string[]>;
    getMSA(proteinId: string, assemblyName?: string): Promise<{
        msa: string;
        tree: string | undefined;
        queryRowName: string;
    }>;
}

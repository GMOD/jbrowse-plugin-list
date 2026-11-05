import { BaseAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
/**
 * Reads the `Results_*` folder of an OrthoFinder run as a dataset: each protein
 * id it saw names its orthogroup's alignment and gene tree.
 */
export default class OrthoFinderMsaAdapter extends BaseAdapter {
    orthogroupsP: Promise<Map<string, string>> | undefined;
    resolvedTreesP: Promise<Map<string, string> | undefined> | undefined;
    readResultsFile(path: string): Promise<string>;
    getOrthogroups(): Promise<Map<string, string>>;
    getResolvedTrees(): Promise<Map<string, string> | undefined>;
    readAlignment(orthogroup: string): Promise<string>;
    readTree(orthogroup: string): Promise<string | undefined>;
    getMSAList(): Promise<string[]>;
    getMSA(proteinId: string): Promise<{
        msa: string;
        tree: string | undefined;
    }>;
}

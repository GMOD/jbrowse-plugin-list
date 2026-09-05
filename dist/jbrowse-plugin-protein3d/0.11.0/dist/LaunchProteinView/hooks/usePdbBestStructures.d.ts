import { type PdbStructureEntry } from '../services/pdbeBestStructures';
export default function usePdbBestStructures(uniprotId: string | undefined): {
    entries: PdbStructureEntry[] | undefined;
    error: any;
    isLoading: boolean;
};

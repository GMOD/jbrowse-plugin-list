import type { InterProScanResults } from 'react-msaview';
interface DomainModel {
    data: {
        treeMetadata?: string;
    };
    setProgress: (arg: string) => void;
    setDomains: (data: Record<string, InterProScanResults>) => void;
}
/**
 * Overlay protein domains on the alignment using NCBI's pre-computed CDD
 * annotations. The BLAST workflow stores each hit's accession in treeMetadata,
 * so we look those up via efetch and key the results by MSA row name (which is
 * what react-msaview matches domains against).
 */
export declare function loadProteinDomains(self: DomainModel): Promise<void>;
export {};

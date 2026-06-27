import type { InterProScanResults } from 'react-msaview';
export type DomainMatch = InterProScanResults['matches'][number];
/**
 * Parse a GenPept (efetch db=protein&rettype=gp&retmode=xml) document into CDD
 * domain and site annotations, keyed by both the versioned and primary
 * accession so callers can look up by whichever NCBI returned.
 */
export declare function parseCddDomains(xml: string): Map<string, {
    signature: {
        entry?: {
            name: string;
            description: string;
            accession: string;
        };
    };
    locations: {
        start: number;
        end: number;
    }[];
}[]>;
/**
 * Fetch pre-computed CDD domain and site annotations for NCBI protein
 * accessions. These come baked into the GenPept records, so a single batched
 * efetch returns them with no job submission or polling. Results are cached in
 * IndexedDB so reopening a view doesn't refetch.
 */
export declare function fetchProteinDomains(accessions: string[]): Promise<Map<string, {
    signature: {
        entry?: {
            name: string;
            description: string;
            accession: string;
        };
    };
    locations: {
        start: number;
        end: number;
    }[];
}[]>>;

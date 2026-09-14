export interface NcbiGeneticCode {
    id: number;
    name: string;
    ncbieaa: string;
    sncbieaa: string;
}
export interface GeneticCode {
    id: number;
    name: string;
    codonTable: Record<string, string>;
    starts: string[];
}
export declare function getGeneticCode(id?: number): GeneticCode;
export declare function parseTranslTable(value: unknown): number | undefined;

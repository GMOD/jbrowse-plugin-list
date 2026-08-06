import type { TaxonomyInfo } from '../../utils/taxonomyNames';
export declare function makeId(h: {
    accession: string;
    sciname: string;
    taxid?: number;
}, taxonomyInfo?: Map<number, TaxonomyInfo>): string;
export declare function strip(s: string): string;

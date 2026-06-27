import type { DomainMatch } from './ncbiDomains';
interface CachedDomain {
    accession: string;
    matches: DomainMatch[];
}
export declare function getCachedDomains(accessions: string[]): Promise<(CachedDomain | undefined)[]>;
export declare function saveDomains(entries: CachedDomain[]): Promise<void>;
export {};

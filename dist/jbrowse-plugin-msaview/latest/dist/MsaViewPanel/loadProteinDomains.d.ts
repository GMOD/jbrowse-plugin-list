import type { Annotation } from 'react-msaview';
interface DomainModel {
    rowData: Record<string, Record<string, string> | undefined>;
    setAnnotations: (annotations: Annotation[]) => void;
}
/**
 * Overlay protein domains on the alignment using NCBI's pre-computed CDD
 * annotations. Each launch stores a row's accession in its row data, so those
 * are looked up via efetch and keyed by MSA row name, which is what
 * react-msaview matches annotations against.
 *
 * Throws when NCBI answered for none of the rows. When it answered for some,
 * their domains are drawn and the returned notice names what is missing. A
 * set of proteins with no CDD annotation leaves the overlay as it was.
 */
export declare function loadProteinDomains(self: DomainModel, signal?: AbortSignal): Promise<string | undefined>;
export {};

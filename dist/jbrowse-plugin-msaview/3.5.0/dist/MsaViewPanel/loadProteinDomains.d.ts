import type { Annotation } from 'react-msaview';
interface DomainModel {
    data: {
        treeMetadata?: string;
    };
    setProgress: (arg: string) => void;
    setAnnotations: (annotations: Annotation[]) => void;
}
/**
 * Overlay protein domains on the alignment using NCBI's pre-computed CDD
 * annotations. The BLAST workflow stores each hit's accession in treeMetadata,
 * so we look those up via efetch and key the results by MSA row name (which is
 * what react-msaview matches domains against).
 *
 * The overlay is handed over as `Annotation[]`, the shape every source flattens
 * to. It used to be dressed up as an InterProScan response — an `xref` invented
 * to carry the row name — so that `setDomains` could unwrap it again; that entry
 * point exists for plugins holding the actual EBI wire format, which this is
 * not.
 */
export declare function loadProteinDomains(self: DomainModel): Promise<void>;
export {};

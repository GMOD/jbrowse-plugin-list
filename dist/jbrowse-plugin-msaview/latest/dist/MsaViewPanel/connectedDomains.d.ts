import type { GenomeRegion, SeqPosModel } from './msaCoordToGenomeCoord';
import type { Annotation } from 'react-msaview';
/**
 * One accession the alignment draws on the query row, on the genome. A
 * cross-plugin contract: jbrowse-plugin-protein3d reads it off the view.
 */
export interface ConnectedDomain {
    /** the label the alignment's legend shows for the domain's accession */
    name: string;
    accession: string;
    /** the fill the alignment draws the domain in */
    color: string;
    /**
     * 0-based half-open, ascending, contiguous bases merged: one region per exon
     * piece of a domain, or per run of a site's scattered residues, in the
     * transcript's refName spelling
     */
    regions: GenomeRegion[];
}
export interface DomainSource extends SeqPosModel {
    showDomains: boolean;
    querySeqName: string;
    annotationsByRow: Record<string, Annotation[]>;
    annotationTypes: Map<string, Annotation>;
    featureColors: Map<Annotation, {
        fill: string;
    }>;
}
/**
 * The genome regions under the query row's residues `positions`, 0-based
 * ungapped.
 */
export declare function residuesToGenomeRegions(model: SeqPosModel, positions: Iterable<number>): GenomeRegion[];
/**
 * The query row's domains as the alignment shows them, one per accession, so
 * a CDD site's scattered residues are one entry. Largest first by residues
 * covered, so a site painted later lands on the domain it sits in. Empty
 * while the domain overlay is off.
 */
export declare function connectedDomains(model: DomainSource): ConnectedDomain[];

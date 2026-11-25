import type { GenomeRegion, SeqPosModel } from './msaCoordToGenomeCoord';
import type { Annotation } from 'react-msaview';
export type DomainKind = 'domain' | 'site';
/** One accession the alignment draws on the query row. */
export interface ConnectedDomain {
    /** the label the alignment's legend shows for the accession */
    name: string;
    accession: string;
    /**
     * `site` for a set of functional residues (a CDD Site, a GFF `*_site`),
     * `domain` for anything else
     */
    kind: DomainKind;
    /**
     * 0-based half-open, ascending, contiguous bases merged: one region per exon
     * piece of a domain, or per run of a site's scattered residues, in the
     * transcript's refName spelling
     */
    regions: GenomeRegion[];
}
/** A categorical color channel, spelt as a JBrowse display's `encoding.color`. */
export interface DomainColor {
    field: 'accession';
    scale: {
        domain: string[];
        range: string[];
        names: string[];
    };
}
export interface ConnectedDomains {
    /** largest first by residues covered */
    features: ConnectedDomain[];
    color: DomainColor;
}
export declare function annotationKind(featureType: string | undefined): DomainKind;
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
 * a CDD site's scattered residues are one feature. Empty while the domain
 * overlay is off.
 */
export declare function connectedDomains(model: DomainSource): ConnectedDomains;

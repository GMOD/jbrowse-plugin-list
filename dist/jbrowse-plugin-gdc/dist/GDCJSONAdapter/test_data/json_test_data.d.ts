export const mutationsJSON: {
    consequence: ({
        transcript: {
            annotation: {
                polyphen_impact: string;
                sift_impact: string;
                vep_impact: string;
            };
            consequence_type: string;
            gene: {
                symbol: string;
                gene_id: string;
            };
            is_canonical: boolean;
            aa_change: string;
        };
    } | {
        transcript: {
            annotation: {
                polyphen_impact: string;
                sift_impact: string;
                vep_impact: string;
            };
            consequence_type: string;
            gene: {
                symbol: string;
                gene_id: string;
            };
            is_canonical: boolean;
            aa_change?: undefined;
        };
    })[];
    mutation_subtype: string;
    ssm_id: string;
    genomic_dna_change: string;
}[];
export const genesJSON: {
    biotype: string;
    symbol: string;
    cytoband: string[];
    is_cancer_gene_census: boolean;
    name: string;
    gene_id: string;
}[];
export namespace gdcResponse {
    namespace data {
        namespace viewer {
            namespace explore {
                namespace features {
                    namespace hits {
                        let edges: {
                            node: {
                                biotype: string;
                                canonicalTranscriptId: string;
                                description: string;
                                externalDbIds: {
                                    entrezGene: never[];
                                    hgnc: never[];
                                    omimGene: never[];
                                    uniprotkbSwissprot: never[];
                                };
                                geneChromosome: string;
                                geneEnd: number;
                                geneId: string;
                                geneStart: number;
                                geneStrand: number;
                                id: string;
                                isCancerGeneCensus: boolean;
                                name: string;
                                note: string;
                                strand: number;
                                symbol: string;
                                synonyms: string[];
                            };
                        }[];
                    }
                    let total: number;
                }
            }
        }
    }
}

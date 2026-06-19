export namespace gdcFilters {
    let op: string;
    let content: {
        op: string;
        content: {
            field: string;
            value: string[];
        };
    }[];
}
export namespace gdcResponse {
    namespace data {
        namespace viewer {
            namespace explore {
                namespace features {
                    namespace hits {
                        let edges: {
                            node: {
                                chromosome: string;
                                consequence: {};
                                cosmicId: null;
                                endPosition: number;
                                genomicDnaChange: string;
                                mutationSubtype: string;
                                mutationType: string;
                                ncbiBuild: string;
                                numOfCasesInCohort: number;
                                occurrenceInCohort: string;
                                percentage: number;
                                referenceAllele: string;
                                score: number;
                                ssmId: string;
                                startPosition: number;
                            };
                        }[];
                        let total: number;
                    }
                }
                namespace filteredCases {
                    export namespace hits_1 {
                        let total_1: number;
                        export { total_1 as total };
                    }
                    export { hits_1 as hits };
                }
            }
        }
    }
}

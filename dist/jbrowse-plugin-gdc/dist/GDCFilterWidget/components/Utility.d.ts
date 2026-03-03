export declare const ssmFacets: {
    name: string;
    prettyName: string;
    values: string[];
}[];
export declare const geneFacets: {
    name: string;
    prettyName: string;
    values: string[];
}[];
export declare const caseFacets: {
    name: string;
    prettyName: string;
    values: string[];
}[];
export declare const mutationHighlightFeatures: ({
    name: string;
    attributeName: string;
    type: string;
    description: string;
    values: {
        name: string;
        colour: string;
    }[];
} | {
    name: string;
    type: string;
    description: string;
    attributeName: string;
    values: {
        name: string;
        colour1: string;
        colour2: string;
        threshold: number;
    }[];
} | {
    name: string;
    type: string;
    description: string;
    attributeName: string;
    values: {
        name: string;
        colour1: string;
        colour2: string;
    }[];
})[];
export declare const geneHighlightFeatures: {
    name: string;
    attributeName: string;
    type: string;
    description: string;
    values: {
        name: string;
        colour1: string;
        colour2: string;
    }[];
}[];

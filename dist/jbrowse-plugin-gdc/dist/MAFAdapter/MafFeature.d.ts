import { Feature } from '@jbrowse/core/util/simpleFeature';
interface FeatureData {
    [key: string]: unknown;
    refName: string;
    start: number;
    end: number;
    name: string;
    note: string;
    score?: number;
    ncbi_build?: string;
    strand?: string;
    variant_classification?: string;
    variant_type?: string;
    reference_allele?: string;
    tumor_seq_allele1?: string;
    tumor_seq_allele2?: string;
}
export default class MafFeature implements Feature {
    private mutation;
    private data;
    private _id;
    constructor(args: {
        mutation: any;
        id: string;
    });
    get(field: string): any;
    set(): void;
    parent(): undefined;
    children(): undefined;
    tags(): string[];
    id(): string;
    dataFromMutation(mutation: any): FeatureData;
    toJSON(): any;
}
export {};

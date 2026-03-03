import { Feature } from '@jbrowse/core/util/simpleFeature';
interface FeatureData {
    [key: string]: unknown;
    refName: string;
    start: number;
    end: number;
    name?: string;
}
/**
 * Isoform Expression Quantification Adapter
 */
export default class IeqFeature implements Feature {
    private iso;
    private data;
    private _id;
    constructor(args: {
        iso: any;
        id: string;
    });
    get(field: string): any;
    set(): void;
    parent(): undefined;
    children(): undefined;
    tags(): string[];
    id(): string;
    dataFromIso(iso: any): FeatureData;
    toJSON(): any;
}
export {};

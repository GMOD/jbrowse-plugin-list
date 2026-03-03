import { Feature } from '@jbrowse/core/util/simpleFeature';
interface FeatureData {
    [key: string]: unknown;
    refName: string;
    start: number;
    end: number;
    name?: string;
}
/**
 * Splice Junction Quantification Adapter
 */
export default class SjqFeature implements Feature {
    private sjq;
    private data;
    private _id;
    constructor(args: {
        sjq: any;
        id: string;
    });
    get(field: string): any;
    set(): void;
    parent(): undefined;
    children(): undefined;
    tags(): string[];
    id(): string;
    dataFromSjq(sjq: any): FeatureData;
    toJSON(): any;
}
export {};

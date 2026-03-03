import { Feature } from '@jbrowse/core/util/simpleFeature';
interface FeatureData {
    [key: string]: unknown;
    refName: string;
    start: number;
    end: number;
    name: string;
    note: string;
}
export default class MbvFeature implements Feature {
    private value;
    private data;
    private _id;
    constructor(args: {
        value: any;
        id: string;
    });
    get(field: string): any;
    set(): void;
    parent(): undefined;
    children(): undefined;
    tags(): string[];
    id(): string;
    dataFromValue(value: any): FeatureData;
    toJSON(): any;
}
export {};

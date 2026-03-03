import { SimpleFeatureSerialized, Feature } from '@jbrowse/core/util/simpleFeature';
interface FeatureData {
    [key: string]: unknown;
    refName: string;
    start: number;
    end: number;
    type: string;
}
export default class ICGCFeature implements Feature {
    private icgcObject;
    private data;
    private uniqueId;
    private featureType;
    constructor(args: {
        icgcObject: any;
        id: string;
        featureType: string;
    });
    get(field: string): any;
    set(): void;
    parent(): undefined;
    children(): undefined;
    tags(): string[];
    id(): string;
    dataFromICGCObject(icgcObject: any, featureType: string): FeatureData;
    toJSON(): SimpleFeatureSerialized;
}
export {};

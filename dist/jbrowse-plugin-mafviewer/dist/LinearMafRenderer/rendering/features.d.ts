import { Feature } from '@jbrowse/core/util';
import type { GenomicRegion, RenderingContext } from './types';
export declare function processFeatureAlignment(feature: Feature, region: GenomicRegion, bpPerPx: number, sampleToRowMap: Map<string, number>, renderingContext: RenderingContext): void;

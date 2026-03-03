import { BaseFeatureDataAdapter, BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import { Feature, Region } from '@jbrowse/core/util';
import type { RowInstruction } from './rowInstructions';
import type { AlignmentRecord, IndexData } from './types';
interface RowState {
    sequenceName: string;
    start: number;
    strand: number;
    sequenceLength: number;
    bases: string;
    length: number;
}
interface AlignmentBlock {
    rows: RowState[];
    columnNumber: number;
}
interface SetupData {
    index: IndexData;
    runLengthEncodeBases: boolean;
}
interface TafFeature {
    uniqueId: string;
    start: number;
    end: number;
    strand: number;
    alignments: Record<string, AlignmentRecord>;
    seq: string;
}
export default class BgzipTaffyAdapter extends BaseFeatureDataAdapter {
    setupP?: Promise<SetupData>;
    getRefNames(): Promise<string[]>;
    parseCoordinatesAndEstablishBlock(pBlock: AlignmentBlock | undefined, instructions: RowInstruction[]): AlignmentBlock;
    parseBases(basesStr: string, runLengthEncodeBases: boolean): string;
    parseTafBlocksStreaming(buffer: Uint8Array, runLengthEncodeBases: boolean): Generator<TafFeature>;
    parseTafBlocks(buffer: Uint8Array, runLengthEncodeBases: boolean, _opts?: BaseOptions): TafFeature[];
    private decoder;
    finalizeBlock(block: AlignmentBlock, columns: string[]): void;
    blockToFeature(block: AlignmentBlock): TafFeature | undefined;
    setupPre(): Promise<SetupData>;
    setup(opts?: BaseOptions): Promise<SetupData>;
    doSetup(): Promise<SetupData>;
    readHeader(): Promise<boolean>;
    readTaiFile(): Promise<IndexData>;
    getFeatures(query: Region, opts?: BaseOptions): import("rxjs").Observable<Feature>;
    getSamples(_query: Region): Promise<{
        samples: {
            id: string;
            label?: string;
            color?: string;
        }[];
        tree: Record<string, any> | undefined;
    }>;
    freeResources(): void;
}
export {};

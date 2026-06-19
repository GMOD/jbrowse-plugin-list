import VirtualOffset from './virtualOffset';
export type { AlignmentRecord } from '../types';
export interface ByteRange {
    chrStart: number;
    virtualOffset: VirtualOffset;
}
export type IndexData = Record<string, ByteRange[]>;

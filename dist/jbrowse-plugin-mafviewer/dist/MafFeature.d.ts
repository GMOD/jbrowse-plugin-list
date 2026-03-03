import type { AlignmentRecord } from './types';
import type { Feature } from '@jbrowse/core/util';
/**
 * Lightweight Feature implementation for MAF alignments.
 * Avoids SimpleFeature overhead (validation, data Record, spreads).
 */
export default class MafFeature implements Feature {
    private _id;
    private _start;
    private _end;
    private _refName;
    private _strand;
    private _alignments;
    private _seq;
    constructor(id: string, start: number, end: number, refName: string, strand: number, alignments: Record<string, AlignmentRecord>, seq: string);
    get(name: string): any;
    id(): string;
    toJSON(): {
        uniqueId: string;
        start: number;
        end: number;
        refName: string;
        strand: number;
        alignments: Record<string, AlignmentRecord>;
        seq: string;
    };
}

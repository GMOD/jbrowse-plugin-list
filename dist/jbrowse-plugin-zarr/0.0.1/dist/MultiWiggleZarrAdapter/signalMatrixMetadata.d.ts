export interface SignalMatrixSample {
    name: string;
    group?: string;
    color?: string;
}
export interface SignalMatrixRefSpan {
    start: number;
    binOffset: number;
    numBins: number;
}
export interface SignalMatrixLevel {
    path: string;
    binSize: number;
    refs: Record<string, SignalMatrixRefSpan>;
    minPath?: string;
    maxPath?: string;
}
export interface SignalMatrixMetadata {
    version: number;
    samples: SignalMatrixSample[];
    levels: SignalMatrixLevel[];
}
export declare const SIGNAL_MATRIX_ATTRIBUTE = "jbrowse_signal_matrix";
export declare function parseSignalMatrixMetadata(attributes: unknown): SignalMatrixMetadata;
export declare function pickLevel(levels: SignalMatrixLevel[], bpPerPx: number): SignalMatrixLevel;

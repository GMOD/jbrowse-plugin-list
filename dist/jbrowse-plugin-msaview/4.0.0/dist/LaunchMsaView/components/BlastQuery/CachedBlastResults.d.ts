import React from 'react';
import type { CachedBlastResult } from '../../../utils/blastCache';
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util';
/**
 * How the row was produced: `uniprotkb_swissprot / blastp / clustalo`, or
 * `swissprot / phmmer` for a row phmmer aligned as it searched and that
 * therefore ran no aligner. Each part is dropped when absent rather than
 * printed empty — `msaAlgorithm` became optional when phmmer arrived, and a
 * phmmer row read `(undefined)` until this stopped assuming one.
 *
 * `blastProgram` is the older field, written only while the plugin still
 * queried NCBI directly and blastp/quick-blastp was a real choice.
 */
export declare function describeSearch(result: CachedBlastResult): string;
declare const CachedBlastResults: ({ model, handleClose, feature, }: {
    model: AbstractTrackModel;
    handleClose: () => void;
    feature: Feature;
}) => React.JSX.Element;
export default CachedBlastResults;

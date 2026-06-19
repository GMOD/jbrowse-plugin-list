import { featureSpanPx } from '@jbrowse/core/util';
import { renderGaps } from './gaps';
import { renderInsertions } from './insertions';
import { renderMatches } from './matches';
import { renderMismatches } from './mismatches';
import { renderText } from './text';
export function processFeatureAlignment(feature, region, bpPerPx, sampleToRowMap, renderingContext) {
    const [leftPx] = featureSpanPx(feature, region, bpPerPx);
    const alignments = feature.get('alignments');
    const referenceSeq = feature.get('seq');
    for (const [sampleId, alignmentData] of Object.entries(alignments)) {
        const row = sampleToRowMap.get(sampleId);
        if (row === undefined) {
            continue;
        }
        const alignment = alignmentData.seq;
        const rowTop = renderingContext.offset + renderingContext.rowHeight * row;
        renderGaps(renderingContext, alignment, referenceSeq, leftPx, rowTop);
        renderMatches(renderingContext, alignment, referenceSeq, leftPx, rowTop);
        renderMismatches(renderingContext, alignment, referenceSeq, leftPx, rowTop, row, alignmentData.start, alignmentData.chr);
        renderText(renderingContext, alignment, referenceSeq, leftPx, rowTop);
        renderInsertions(renderingContext, alignment, referenceSeq, leftPx, rowTop, bpPerPx, row, alignmentData.start, alignmentData.chr);
    }
}
//# sourceMappingURL=features.js.map
/**
 * What a built alignment says about the arrays in it, as numbers rather than as
 * a picture.
 *
 * Everything a report or a README claims about a locus is derived here, from
 * the same plan the view renders, so a number in prose is a number something
 * computed. Nothing in this file fetches or prints — it takes a plan and gives
 * back counts, which is what makes it testable without the network.
 */
import { alleleModes, tally } from './alleleModes';
import { ABSENT, SPANNED_GAP } from './readLayout';
import { renderRow } from './tview';
export { alleleModes, tally } from './alleleModes';
function rowsOfSample(array, plan, sample) {
    return plan.reads
        .filter(read => read.sample === sample)
        .map(read => array.copiesByName.get(read.name))
        .filter(copies => copies !== undefined);
}
function arrayStats(array, plan, samples) {
    return {
        start: array.start,
        end: array.end,
        period: array.period,
        unit: array.unit,
        span: array.end - array.start,
        width: array.width,
        referenceCopies: plan.referenceName
            ? array.copiesByName.get(plan.referenceName)
            : undefined,
        subject: array === plan.subject,
        samples: samples.map(sample => {
            const copies = rowsOfSample(array, plan, sample);
            const modes = alleleModes(copies);
            return {
                sample,
                spanning: copies.length,
                modes,
                copies: tally(copies),
                // an allele carries the reads in its skirt as well as those exactly on
                // it, so what is left over is counted off the alleles rather than off
                // the distinct values they were called at
                offMode: copies.length - modes.reduce((a, m) => a + m.reads, 0),
            };
        }),
    };
}
/** Rows, columns, and every array, from a plan the view could equally render. */
export function summarizePlan(plan, samples) {
    const rows = plan.reads.map(read => renderRow(read, plan.layout));
    const perColumn = new Int32Array(plan.layout.totalColumns);
    for (const row of rows) {
        for (let col = 0; col < row.length; col++) {
            const char = row[col];
            if (char !== ABSENT && char !== SPANNED_GAP) {
                perColumn[col] = perColumn[col] + 1;
            }
        }
    }
    let singleRowColumns = 0;
    let emptyColumns = 0;
    for (const count of perColumn) {
        if (count === 0) {
            emptyColumns++;
        }
        else if (count === 1) {
            singleRowColumns++;
        }
    }
    return {
        rows: plan.reads.length,
        columns: plan.layout.totalColumns,
        singleRowColumns,
        emptyColumns,
        arrays: plan.arrays.map(array => arrayStats(array, plan, samples ?? plan.samples)),
    };
}
//# sourceMappingURL=repeatStats.js.map
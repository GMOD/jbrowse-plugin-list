/**
 * What a built alignment says about the arrays in it, as numbers rather than as
 * a picture.
 *
 * Everything a report or a README claims about a locus is derived here, from
 * the same plan the view renders, so a number in prose is a number something
 * computed. Nothing in this file fetches or prints — it takes a plan and gives
 * back counts, which is what makes it testable without the network.
 */
import { ABSENT, SPANNED_GAP } from './readLayout';
import { renderRow } from './tview';
/**
 * Least support an allele needs before it is reported as one of a sample's,
 * as a fraction of that sample's spanning reads.
 *
 * Reads scatter around an allele — slippage in the read, slippage in the
 * aligner — so the counts either side of a real allele are populated too, and
 * a rule that took the top two would report the shoulder of one allele as the
 * other. A fraction of coverage rather than a distance in copies is what lets
 * two alleles a single copy apart both be reported, which at FMR1 is the
 * mother's genotype and at ATXN3 the father's.
 */
const MIN_ALLELE_FRACTION = 0.15;
/** ...and never on one read, at any coverage. */
const MIN_ALLELE_READS = 2;
/** Each distinct value with how many rows carried it, smallest value first. */
export function tally(values) {
    const counts = new Map();
    for (const v of values) {
        counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return [...counts]
        .map(([value, reads]) => ({ value, reads }))
        .sort((a, b) => a.value - b.value);
}
/**
 * The copy counts a sample carries, as the counts enough of its reads agree on.
 *
 * This is a report of what the reads say, not a genotype call: it does not know
 * a ploidy, so a homozygote and a haploid locus both come back as one number,
 * and a sample whose reads scatter can come back with none.
 */
export function alleleModes(copies) {
    const floor = Math.max(MIN_ALLELE_READS, MIN_ALLELE_FRACTION * copies.length);
    return tally(copies).filter(t => t.reads >= floor);
}
function sampleOfRow(name) {
    const i = name.indexOf('|');
    return i < 0 ? undefined : name.slice(0, i);
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
            const copies = [...array.copiesByName]
                .filter(([name]) => sampleOfRow(name) === sample)
                .map(([, n]) => n);
            const modes = alleleModes(copies);
            const called = new Set(modes.map(m => m.value));
            return {
                sample,
                spanning: copies.length,
                modes,
                copies: tally(copies),
                offMode: copies.filter(c => !called.has(c)).length,
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
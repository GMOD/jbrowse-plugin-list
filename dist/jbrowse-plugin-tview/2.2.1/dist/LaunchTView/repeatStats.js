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
 */
const MIN_ALLELE_FRACTION = 0.15;
/** ...and never on one read, at any coverage. */
const MIN_ALLELE_READS = 2;
/**
 * How far from an allele a read's copy count may fall and still be counted as
 * that allele's, as a fraction of the allele's own size.
 *
 * Proportional rather than fixed because slippage scales with the array: the
 * reads either side of an 89-copy allele scatter further than those either side
 * of an 8-copy one. cuteSV refines a cluster of structural-variant signatures
 * the same way, by a bandwidth taken as a fraction of the cluster's own mean
 * length (Jiang et al., Genome Biol 21, 2020, doi:10.1186/s13059-020-02107-y);
 * its constants are fractions of a length in bases and do not carry over to a
 * count of copies, so this one is measured here instead. At 0.1 no call in the
 * trio moves, merges or is lost, and the reads left out of one drop by three
 * quarters.
 */
const SHOULDER_SPREAD = 0.1;
/**
 * ...and how much support such a read may carry, relative to the allele it
 * would join, before it is an allele of its own instead.
 *
 * This is the load-bearing half, and distance alone cannot replace it. At FMR1
 * the mother carries two alleles one copy apart and at HTT a single allele has
 * a shoulder one copy either side, so no bandwidth tells those two apart.
 * Relative support does: a slippage shoulder in the trio runs at a fraction of
 * its allele, and the mother's second allele runs at 87% of her first. The
 * measured shelf is wide — 0.2 leaves reads uncounted, 0.4 starts merging the
 * mother's two alleles into one.
 *
 * That shelf is 21 sample-locus calls in one trio, which is a shelf and not a
 * proof: a locus carrying three real alleles within a copy of each other would
 * defeat the rule, and this trio has none.
 */
const SHOULDER_SUPPORT = 0.3;
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
 * The copy counts a sample carries, each with the reads that fell on it or in
 * its skirt.
 *
 * Reads scatter around an allele — slippage in the molecule, slippage in the
 * aligner — so a rule that reported only exact agreement credited an allele
 * with a fraction of the reads that actually support it, and left the rest
 * looking like disagreement. Counts are gathered strongest first, so an allele
 * is established before anything can be read as its shoulder, and a value joins
 * one only if it is both near it and much weaker than it.
 *
 * This is a report of what the reads say, not a genotype call: it does not know
 * a ploidy, so a homozygote and a haploid locus both come back as one number,
 * and a sample whose reads scatter can come back with none.
 */
export function alleleModes(copies) {
    const floor = Math.max(MIN_ALLELE_READS, MIN_ALLELE_FRACTION * copies.length);
    const peaks = [];
    for (const t of tally(copies).sort((a, b) => b.reads - a.reads || a.value - b.value)) {
        const distance = (peak) => Math.abs(t.value - peak.value);
        const host = peaks
            .filter(peak => distance(peak) <= Math.max(1, SHOULDER_SPREAD * peak.value) &&
            t.reads <= SHOULDER_SUPPORT * peak.reads)
            .sort((a, b) => distance(a) - distance(b))[0];
        if (host) {
            host.reads += t.reads;
        }
        else {
            peaks.push({ ...t });
        }
    }
    return peaks.filter(p => p.reads >= floor).sort((a, b) => a.value - b.value);
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
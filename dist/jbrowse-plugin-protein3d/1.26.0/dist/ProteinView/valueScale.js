const TRIM = 0.02;
function rounded(value) {
    return Math.round(value * 100) / 100;
}
/**
 * The span a ramp over `values` covers: the 2nd to 98th percentile, so one
 * outlier (a phyloP of -20 beside a protein of 0 to 8) does not flatten the
 * rest. Undefined for no values.
 */
export function valueDomain(values) {
    const sorted = [...values].filter(Number.isFinite).toSorted((a, b) => a - b);
    if (sorted.length === 0) {
        return undefined;
    }
    const last = sorted.length - 1;
    const min = rounded(sorted[Math.floor(TRIM * last)]);
    const max = rounded(sorted[Math.ceil((1 - TRIM) * last)]);
    return { min, max: max > min ? max : min + 1 };
}
export function isValueField(color) {
    return color.field === 'track' || color.field === 'values';
}
/**
 * The color object a theme paints with: for a field scaled by its data, any
 * end of the domain the session leaves out comes from `domain`, and the title
 * falls back to `label`.
 */
export function paintedColor(color, { domain, label }) {
    if (!isValueField(color)) {
        return color;
    }
    const fromData = color.scale !== 'threshold';
    const min = color.domainMin ?? (fromData ? domain?.min : undefined);
    const max = color.domainMax ?? (fromData ? domain?.max : undefined);
    const title = color.title ?? label;
    return {
        ...color,
        ...(min === undefined ? {} : { domainMin: min }),
        ...(max === undefined ? {} : { domainMax: max }),
        ...(title === undefined ? {} : { title }),
    };
}

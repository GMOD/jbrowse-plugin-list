import { colord } from '@jbrowse/core/util/colord';
/** A CSS color as RGB. */
export function rgbOf(css) {
    const { r, g, b } = colord(css).toRgb();
    return [r, g, b];
}
function cssOf([r, g, b]) {
    return `rgb(${r}, ${g}, ${b})`;
}
function numberOf(value) {
    return typeof value === 'number' && !Number.isNaN(value) ? value : undefined;
}
/** How many of the ascending cuts `value` is at or past. */
export function thresholdIndex(domain, value) {
    let i = 0;
    while (i < domain.length && value >= domain[i]) {
        i++;
    }
    return i;
}
function rampPosition(color, value) {
    const { domainMin, domainMax, domainMid } = color;
    const p = domainMid === undefined
        ? (value - domainMin) / (domainMax - domainMin)
        : 0.5 +
            (value - domainMid) /
                (2 * Math.max(domainMid - domainMin, domainMax - domainMid));
    // a zero-width domain gives NaN, which would index no stop
    return Number.isNaN(p) ? 0 : Math.max(0, Math.min(1, p));
}
function rampRgb(color) {
    const stops = color.range.map(rgbOf);
    const segments = stops.length - 1;
    return (value) => {
        const p = rampPosition(color, value) * segments;
        const i = Math.min(Math.floor(p), Math.max(segments - 1, 0));
        const from = stops[i];
        const to = stops[i + 1] ?? from;
        const f = p - i;
        const mix = (c) => Math.round(from[c] + (to[c] - from[c]) * f);
        return [mix(0), mix(1), mix(2)];
    };
}
/**
 * The CSS color `color` paints a value, undefined for a value it has none
 * for: a number missing under a threshold or linear scale, or a categorical
 * value `domain` leaves out where `unknown` is unset.
 */
export function cssScaleOf(color) {
    if (color.scale === 'categorical') {
        const { domain, range, unknown } = color;
        return value => {
            const i = domain.indexOf(String(value));
            return (i === -1 ? undefined : range[i]) ?? unknown;
        };
    }
    if (color.scale === 'threshold') {
        const { domain, range } = color;
        return value => {
            const v = numberOf(value);
            return v === undefined ? undefined : range[thresholdIndex(domain, v)];
        };
    }
    const ramp = rampRgb(color);
    return value => {
        const v = numberOf(value);
        return v === undefined ? undefined : cssOf(ramp(v));
    };
}
/** {@link cssScaleOf} as RGB, for a painter that takes numbers. */
export function rgbScaleOf(color) {
    if (color.scale === 'linear') {
        const ramp = rampRgb(color);
        return value => {
            const v = numberOf(value);
            return v === undefined ? undefined : ramp(v);
        };
    }
    const css = cssScaleOf(color);
    const parsed = new Map();
    return value => {
        const c = css(value);
        if (c === undefined) {
            return undefined;
        }
        let rgb = parsed.get(c);
        if (!rgb) {
            rgb = rgbOf(c);
            parsed.set(c, rgb);
        }
        return rgb;
    };
}
function thresholdLabel(domain, i) {
    return i === 0
        ? `< ${domain[0]}`
        : i === domain.length
            ? `≥ ${domain[i - 1]}`
            : `${domain[i - 1]}–${domain[i]}`;
}
/** A categorical or threshold key: one entry per `domain` value or interval. */
export function keyEntriesOf(color) {
    const { labels = [], range } = color;
    return color.scale === 'categorical'
        ? color.domain.map((value, i) => ({
            label: labels[i] ?? value,
            color: range[i] ?? color.unknown ?? '',
        }))
        : range.map((c, i) => ({
            label: labels[i] ?? thresholdLabel(color.domain, i),
            color: c,
        }));
}
/** A ramp's key: its two ends named, and one color per `range` stop across the domain. */
export function rampKeyOf(color) {
    const { domainMin, domainMax, range } = color;
    const [minLabel = `${domainMin}`, maxLabel = `${domainMax}`] = color.labels ?? [];
    const css = cssScaleOf(color);
    const n = Math.max(range.length - 1, 1);
    return {
        minLabel,
        maxLabel,
        colors: range.map((_, i) => css(domainMin + ((domainMax - domainMin) * i) / n) ?? ''),
    };
}

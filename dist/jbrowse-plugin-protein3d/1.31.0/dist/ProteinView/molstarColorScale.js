import { Color } from 'molstar/lib/mol-util/color';
import { ScaleLegend, TableLegend } from 'molstar/lib/mol-util/legend';
import { keyEntriesOf, rampKeyOf, rgbOf, rgbScaleOf } from './colorScale';
function molstarColor([r, g, b]) {
    return Color.fromRgb(r, g, b);
}
/** A color object as a Mol* theme paints it: `noValue` where it has no color. */
export function molstarScaleOf(color, noValue) {
    const rgb = rgbScaleOf(color);
    return (value) => {
        const c = rgb(value);
        return c ? molstarColor(c) : noValue;
    };
}
/**
 * A color object's key as a Mol* legend: a ramp's ends, or one row per value
 * or interval and then `noValue`, where the theme paints one.
 */
export function molstarLegendOf(color, noValue) {
    if (color.scale === 'linear') {
        const { minLabel, maxLabel, colors } = rampKeyOf(color);
        return ScaleLegend(minLabel, maxLabel, colors.map(c => molstarColor(rgbOf(c))));
    }
    return TableLegend([
        ...keyEntriesOf(color).map(({ label, color: c }) => [
            label,
            molstarColor(rgbOf(c)),
        ]),
        ...(noValue ? [noValue] : []),
    ]);
}

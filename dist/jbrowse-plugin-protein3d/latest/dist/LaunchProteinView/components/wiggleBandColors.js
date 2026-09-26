/**
 * A v4 wiggle renderer's `color` callback painting `field` by band. v4 hosts
 * read colour only from the renderer, and only a callback can place a cut
 * anywhere but 0 on v4.3.0, which drops a configured pivot on its way to the
 * worker. v4 also evaluates it once with no feature, and a throw there leaves
 * the track an error message, hence the guard.
 */
export function jexlBandColor(field, bands) {
    const value = `get(feature,'${field}')`;
    const body = bands.reduceRight((rest, band) => band.upTo === Infinity
        ? `'${band.color}'`
        : `(${value}<=${band.upTo}?'${band.color}':${rest})`, "'#cccccc'");
    return `jexl:feature?${body}:'#cccccc'`;
}
/**
 * The same bands as the display-level threshold scale v5 hosts read. That
 * scale puts a value equal to a cut in the upper band, so each cut moves just
 * past its bound to keep the bound in its own band, as `bandColor` does.
 */
export function thresholdBandColor(field, bands) {
    return {
        field,
        scale: 'threshold',
        domain: bands
            .filter(band => band.upTo !== Infinity)
            .map(band => band.upTo + 1e-6),
        range: bands.map(band => band.color),
    };
}

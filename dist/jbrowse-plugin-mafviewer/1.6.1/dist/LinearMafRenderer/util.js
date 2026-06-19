import { measureText } from '@jbrowse/core/util';
export function getContrastBaseMap(theme) {
    return Object.fromEntries(Object.entries(getColorBaseMap(theme)).map(([key, value]) => [
        key,
        theme.palette.getContrastText(value),
    ]));
}
export function getColorBaseMap(theme) {
    const { bases } = theme.palette;
    return {
        a: bases.A.main,
        c: bases.C.main,
        g: bases.G.main,
        t: bases.T.main,
    };
}
export function fillRect(ctx, l, t, w, h, cw, color) {
    if (l + w < 0 || l > cw) {
        return;
    }
    if (color) {
        ctx.fillStyle = color;
    }
    ctx.fillRect(l, t, w, h);
}
// get width and height of chars the height is an approximation: width letter M
// is approximately the height
export function getCharWidthHeight() {
    const charWidth = measureText('A');
    const charHeight = measureText('M') - 2;
    return { charWidth, charHeight };
}
//# sourceMappingURL=util.js.map
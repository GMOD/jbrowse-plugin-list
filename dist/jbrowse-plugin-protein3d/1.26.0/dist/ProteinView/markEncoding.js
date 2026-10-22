const HEX_COLOR = /^#[0-9a-f]{6}$/i;
export function encodedColor(encoding, fallback) {
    const value = encoding?.color?.value;
    return value && HEX_COLOR.test(value) ? value : fallback;
}

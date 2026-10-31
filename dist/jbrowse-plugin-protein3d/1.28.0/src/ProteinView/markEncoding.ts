/**
 * The encoding of a layer drawn in one color: a mark or a distance line. The
 * shape is the mark display's (`encoding: { color: { value: '#2e9e6b' } }`),
 * so a constant reads the same here as on a genome track.
 */
export interface ConstantEncoding {
  color?: { value: string }
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i

export function encodedColor(
  encoding: ConstantEncoding | undefined,
  fallback: string,
) {
  const value = encoding?.color?.value
  return value && HEX_COLOR.test(value) ? value : fallback
}

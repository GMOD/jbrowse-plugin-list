import { unzip } from '@jbrowse/core/util/unzip'

// A GFA's text, from its bytes as read, gzipped (by its magic bytes) or not
export async function gfaText(bytes: Uint8Array) {
  const gzipped = bytes[0] === 0x1f && bytes[1] === 0x8b
  return new TextDecoder().decode(gzipped ? await unzip(bytes) : bytes)
}

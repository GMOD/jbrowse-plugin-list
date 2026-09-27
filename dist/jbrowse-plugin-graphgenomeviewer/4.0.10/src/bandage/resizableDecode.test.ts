import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { expect, it } from 'vitest'

// emscripten's UTF8ArrayToString / UTF16ToString decode a view over HEAPU8 /
// HEAPU16 — i.e. over WebAssembly.Memory, whose buffer is a RESIZABLE
// ArrayBuffer. Browsers reject TextDecoder.decode on such a view:
//
//   TypeError: Failed to execute 'decode' on 'TextDecoder':
//   The provided ArrayBuffer value must not be resizable
//
// Both take that path only for strings longer than 16 units; shorter ones fall
// through to a manual char loop. That threshold is what made this look like a
// data bug rather than a code bug — a graph whose node ids are `s10274` never
// trips it, and one whose ids are `bb_GRCh38#0#chr1_0` always does, so the
// bubble-tier index failed 100% of the time while the fine index never did.
//
// scripts/build-wasm.sh patches both call sites to copy first. This asserts the
// generated file kept the patch, because the file is overwritten wholesale by
// that script and a silent revert would only show up as a broken graph in a
// browser.
// jsdom sets import.meta.url to an http:// url, so resolve off __dirname-style
// path rather than passing a URL to readFileSync.
const glue = readFileSync(
  join(
    dirname(fileURLToPath(new URL('file://' + __filename))),
    'bandage-layout.js',
  ),
  'utf8',
)

it('UTF8ArrayToString copies out of the wasm heap before decoding', () => {
  expect(glue).toContain('heapOrArray.subarray(idx,endPtr).slice()')
  expect(glue).not.toContain(
    'UTF8Decoder.decode(heapOrArray.subarray(idx,endPtr))',
  )
})

it('UTF16ToString copies out of the wasm heap before decoding', () => {
  expect(glue).toContain('HEAPU16.subarray(idx,endIdx).slice()')
  expect(glue).not.toContain(
    'UTF16Decoder.decode(HEAPU16.subarray(idx,endIdx))',
  )
})

// The reason no other test in this repo can catch a regression here: vitest runs
// under jsdom, whose TextDecoder is node's, and node accepts what browsers
// reject. Stated outright so a green suite is not mistaken for coverage.
it('node TextDecoder is lenient where browsers are not', () => {
  const resizable = new ArrayBuffer(8, { maxByteLength: 64 })
  expect(resizable.resizable).toBe(true)
  const view = new Uint8Array(resizable)
  view.set([104, 101, 108, 108, 111])
  expect(new TextDecoder().decode(view.subarray(0, 5))).toBe('hello')
  expect(view.subarray(0, 5).slice().buffer.resizable).toBeFalsy()
})

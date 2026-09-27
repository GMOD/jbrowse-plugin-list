// @vitest-environment node
import { build } from 'esbuild'

// BandageJS bundles src/core.ts on its own, so a host, a state tree or a UI
// framework reached from here would land in a page that has none of them.
// These are the leaf utilities it may take from the packages instead.
const ALLOWED = [
  /^@jbrowse\/core\/esm\/util\/(colorBits|cssColorParse)\.js$/,
  /^@jbrowse\/core\/esm\/util\/color-bits\//,
  /^@jbrowse\/core\/esm\/util\/color\/cssColorsLevel4\.js$/,
  /^@jbrowse\/render-core\/esm\/(canvas2dUtils|canvasContext|renderingBackendBase)\.js$/,
  /^@jbrowse\/render-core\/esm\/marks\/colorFill\.js$/,
]

test('the core entry reaches no host, state tree or UI framework', async () => {
  const { metafile } = await build({
    entryPoints: ['src/core.ts'],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    metafile: true,
    logLevel: 'silent',
  })
  const packages = Object.keys(metafile.inputs)
    .filter(path => path.includes('node_modules/'))
    .map(path => path.replace(/.*node_modules\//, ''))
  expect(packages.filter(p => !ALLOWED.some(re => re.test(p)))).toEqual([])
})

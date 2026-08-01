#!/usr/bin/env node
//
// check-plugins.ts
//
// Boots every plugin bundle this repo publishes on a matrix of released JBrowse
// hosts and asserts each one still loads.
//
// Why this lives here and not in the plugin repos: `pnpm upload` republishes
// every plugin's `latest/` at once, no-cache, and the jb2hubs configs
// (jbrowse.org/ucsc/*, jbrowse.org/hubs/genark/*) name those urls from permanent
// locations that published links and old desktop installs keep loading. So the
// moment of risk is *this repo promoting an npm version*, not a push to a plugin
// repo — and nothing runs between npm publish and global rollout. Of the plugins
// in plugins.json only msaview and protein3d test against any JBrowse version at
// all, and both test [v3.7.0, nightly]: the two ends, while every failure so far
// landed in the middle (v4.0.0..latest). `nightly` is also the same unreleased
// core a plugin author develops against, which is precisely how msaview 2.7.0
// passed its own matrix while error-paging every released host.
//
// The failure this catches is total, not partial: PluginLoader runs Promise.all
// over the plugin list, so one bundle that throws while loading turns the whole
// session into an error page.
//
// SCOPE, because it is easy to over-trust: this proves a bundle loads, defines
// its global, and survives configure() on a real host. It does NOT prove a track
// renders — that belongs in the plugin repo, which has the test data. What it
// covers is the class of break that only appears against a host the plugin
// author never built against.
//
// Usage:
//   node check-plugins.ts                     # working tree dist/, all plugins
//   node check-plugins.ts --changed           # only plugins whose latest/ moved
//   node check-plugins.ts --only jbrowse-plugin-msaview
//   node check-plugins.ts --published         # what S3 serves right now (canary)
//   node check-plugins.ts --versions v4.0.0,latest --json report.json
//   node check-plugins.ts --bundle jbrowse-plugin-msaview=../jbrowse-plugin-msaview/dist
//
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { parseArgs } from 'node:util'

import { satisfies } from 'compare-versions'
import { launch, type Browser } from 'puppeteer-core'

import { REHOST_BASE, type SourceManifest } from './manifest-types.ts'

// puppeteer-core, not puppeteer: this repo's other scripts are plain fetch+tar
// and shouldn't grow a ~150MB Chromium download in every install. Point
// CHROME_PATH at a browser, or let it find a system Chrome or a puppeteer cache
// one.
function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ...fs
      .globSync(
        path.join(os.homedir(), '.cache/puppeteer/chrome/*/chrome-*/chrome'),
      )
      .sort()
      .reverse(),
  ].filter(c => c !== undefined)
  const found = candidates.find(c => fs.existsSync(c))
  if (!found) {
    throw new Error(
      `no browser found; set CHROME_PATH. Looked in: ${candidates.join(', ')}`,
    )
  }
  return found
}

// Every release is hosted at jbrowse.org/code/jb2/<version>/, so the matrix
// needs no local install per version. These are the hosts a `latest/` bundle
// actually reaches: v4.0.0 is the floor jb2hubs settled on (v2/v3 cannot load
// these bundles at all), `latest` is what most links resolve to. `main` is
// available but deliberately not a default — a break there is unreleased-core
// news, not a shipped-config regression, and the plugin repos' `nightly` job
// already watches it.
//
// `semver` is what a plugin's jbrowseRange is tested against. The moving tags
// get a sentinel above every real release, which is the honest reading: a plugin
// declaring `<2.0.0` must not be treated as covering whatever `latest` is today.
const HOST_VERSIONS = [
  { label: 'v4.0.0', semver: '4.0.0' },
  { label: 'v4.2.0', semver: '4.2.0' },
  { label: 'v4.3.0', semver: '4.3.0' },
  { label: 'latest', semver: '999.999.999' },
  { label: 'main', semver: '999.999.999' },
]

// Plugins core now bundles. jbrowse-web drops a config entry naming one of
// these before loading it (PluginLoader's `vendoredPluginNames`), so the url is
// never fetched and the UMD global is legitimately absent. Reporting those as a
// failed load would be wrong — but so would reporting them as a pass, since the
// bundle was never exercised. Keep in step with
// jbrowse-components/packages/core/src/PluginLoader.ts.
const VENDORED_BY_HOST = new Set(['MafViewer', 'GWAS'])

const { values } = parseArgs({
  options: {
    versions: { type: 'string' },
    only: { type: 'string', multiple: true, default: [] },
    changed: { type: 'boolean', default: false },
    published: { type: 'boolean', default: false },
    bundle: { type: 'string', multiple: true, default: [] },
    json: { type: 'string' },
    timeout: { type: 'string', default: '60000' },
  },
})

const dir = import.meta.dirname
const distDir = path.join(dir, 'dist')
const timeout = Number(values.timeout)
const hosts =
  values.versions === undefined
    ? HOST_VERSIONS.filter(h => h.label !== 'main')
    : values.versions.split(',').map(label => {
        const known = HOST_VERSIONS.find(h => h.label === label)
        return known ?? { label, semver: label.replace(/^v/, '') }
      })

const { plugins } = JSON.parse(
  fs.readFileSync(path.join(dir, 'plugins.json'), 'utf8'),
) as SourceManifest

// `--bundle <packageName>=<dir>` serves a candidate build in place of the one
// this repo would publish — a plugin repo's own dist/, or an older version dir
// to reproduce a past break. The directory stands in for the whole `latest/`
// prefix, so sidecar chunks come from the same build.
const bundleOverrides = new Map(
  values.bundle.map(spec => {
    const eq = spec.indexOf('=')
    if (eq < 0) {
      throw new Error(`--bundle wants packageName=dir, got "${spec}"`)
    }
    return [spec.slice(0, eq), path.resolve(spec.slice(eq + 1))]
  }),
)

// The bundles worth checking are the ones this run would publish. `latest/` is
// rebuilt from scratch every download, so git sees a real content change only
// when the promoted version actually moved.
function changedPackages() {
  const status = execFileSync('git', ['status', '--porcelain', '--', 'dist'], {
    cwd: dir,
    encoding: 'utf8',
  })
  const names = new Set<string>()
  for (const line of status.split('\n')) {
    const match = /dist\/(.+?)\/latest\//.exec(line)
    if (match) {
      names.add(match[1])
    }
  }
  return names
}

// An explicit filter that selects nothing means "nothing to check" — notably
// `--changed` on a run that promoted no new version. Falling back to "all" there
// would turn the pre-upload gate into a 68-boot matrix on every no-op run.
const selected = values.changed
  ? changedPackages()
  : values.only.length > 0
    ? new Set(values.only)
    : undefined
const targets =
  selected === undefined
    ? plugins
    : plugins.filter(p => selected.has(p.packageName))

// A synthetic config naming exactly one plugin, so a failure names its cause
// with no ambiguity. It has no assemblies on purpose: plugin load and
// configure() both run before any assembly is touched, and inventing test data
// here would only add a second thing that can break.
function configFor(name: string, url: string) {
  return JSON.stringify({
    assemblies: [],
    tracks: [],
    plugins: [{ name, url }],
  })
}

interface Probe {
  packageName: string
  hostVersion: string
  vendored?: boolean
  outOfRange?: boolean
  settled?: boolean
  fatal?: string
  globalDefined?: boolean
  threw?: string
  pageErrors: string[]
}

async function probe(
  browser: Browser,
  hostVersion: string,
  plugin: { name: string; packageName: string; umdPath: string },
): Promise<Probe> {
  const { name, packageName, umdPath } = plugin
  const bundleUrl = `${REHOST_BASE}${packageName}/latest/${umdPath}`
  // Same origin as the app, so the config fetch is not a CORS case. Nothing is
  // ever published here — the request is answered from memory below.
  const configUrl = `https://jbrowse.org/plugin-smoke/${encodeURIComponent(packageName)}.json`
  const localLatest =
    bundleOverrides.get(packageName) ??
    path.join(distDir, packageName, 'latest')
  const bundlePrefix = `${REHOST_BASE}${packageName}/latest/`

  const page = await browser.newPage()
  const errors: string[] = []
  page.on('pageerror', e => {
    errors.push(String(e).slice(0, 200))
  })

  await page.setRequestInterception(true)
  page.on('request', request => {
    const url = request.url()
    if (url === configUrl) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: configFor(name, bundleUrl),
      })
      // The whole `latest/` prefix, not just the umd entry point: a code-split
      // plugin (protein3d lazy-loads a molstar chunk) fetches siblings at load
      // time, and serving a working-tree bundle beside production's chunks
      // would test a combination that never ships.
    } else if (
      (!values.published || bundleOverrides.has(packageName)) &&
      url.startsWith(bundlePrefix)
    ) {
      const local = path.join(localLatest, url.slice(bundlePrefix.length))
      if (fs.existsSync(local)) {
        request.respond({
          status: 200,
          contentType: 'text/javascript',
          headers: { 'access-control-allow-origin': '*' },
          body: fs.readFileSync(local),
        })
      } else {
        request.respond({ status: 404, body: 'not in working tree' })
      }
    } else {
      request.continue()
    }
  })

  const app = `https://jbrowse.org/code/jb2/${hostVersion}/`
  const result: Probe = { packageName, hostVersion, pageErrors: [] }
  try {
    await page.goto(`${app}?config=${encodeURIComponent(configUrl)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    })
    // Readiness is the session global or the error page — NOT the presence of
    // any element: the loading spinner is an svg, so waiting on markup returns
    // before plugins have loaded and reads every host as broken.
    result.settled = await page
      .waitForFunction(
        () =>
          !!(window.JBrowseSession ?? window.__jbrowse_session) ||
          /JBrowse Error|Fatal error|Failed to load/.test(
            document.body.innerText,
          ),
        { timeout },
      )
      .then(() => true)
      .catch(() => false)

    result.fatal = await page.evaluate(() => {
      const text = document.body.innerText
      return /JBrowse Error|Fatal error|Failed to load/.test(text)
        ? text.replace(/\s+/g, ' ').slice(0, 240)
        : undefined
    })

    result.globalDefined = await page.evaluate(
      g => g in window,
      `JBrowsePlugin${name}`,
    )
  } catch (e) {
    result.threw = String(e).slice(0, 200)
  }
  result.pageErrors = [...new Set(errors)].slice(0, 4)
  await page.close()
  return result
}

const browser = await launch({
  headless: true,
  executablePath: findChrome(),
  args: ['--no-sandbox', '--use-gl=swiftshader'],
  defaultViewport: { width: 1400, height: 900 },
})

console.log(
  `Checking ${targets.length} plugin${targets.length === 1 ? '' : 's'} ` +
    `on ${hosts.map(h => h.label).join(', ')} ` +
    `(${values.published ? 'as published' : 'working tree dist/'})`,
)
if (targets.length === 0) {
  console.log('Nothing to check.')
}

const results: Probe[] = []
let failed = false
for (const plugin of targets) {
  // The range the manifest publishes for the version that would be promoted.
  // Absent `versions` means the download step tracks npm latest at `*`.
  const declaredRange = plugin.versions?.at(-1)?.jbrowseRange ?? '*'
  console.log(
    `\n${plugin.packageName} (${plugin.name})` +
      (declaredRange === '*' ? '' : ` jbrowseRange ${declaredRange}`),
  )
  for (const host of hosts) {
    const vendored =
      VENDORED_BY_HOST.has(plugin.name) && host.label !== 'v4.0.0'
    // A host the plugin never claimed to support is not a failure — it is the
    // manifest working. Probing it anyway would make the canary permanently red
    // for a plugin the store already refuses to offer, and a canary you have
    // learned to ignore is worse than none.
    const outOfRange =
      declaredRange !== '*' && !satisfies(host.semver, declaredRange)
    const r =
      vendored || outOfRange
        ? {
            packageName: plugin.packageName,
            hostVersion: host.label,
            vendored,
            outOfRange,
            pageErrors: [],
          }
        : await probe(browser, host.label, plugin)
    results.push(r)
    const problems = [
      r.fatal && `FATAL ${r.fatal}`,
      r.threw && `threw ${r.threw}`,
      !r.vendored &&
        !r.outOfRange &&
        !r.settled &&
        !r.fatal &&
        'never settled (no session, no error page)',
      r.settled && !r.globalDefined && `JBrowsePlugin${plugin.name} undefined`,
    ].filter(p => typeof p === 'string')
    const note = r.vendored
      ? 'skipped, vendored into this host'
      : r.outOfRange
        ? 'skipped, outside declared jbrowseRange'
        : 'ok'
    console.log(
      `  ${host.label.padEnd(9)} ${problems.length > 0 ? problems.join(' | ') : note}`,
    )
    if (problems.length > 0) {
      failed = true
    }
  }
}
await browser.close()

if (values.json) {
  fs.writeFileSync(values.json, JSON.stringify(results, null, 2))
}

if (failed) {
  console.error(
    '\nA bundle broke on a released host. Do not upload: `latest/` is no-cache ' +
      'and reaches every already-published config immediately.',
  )
  process.exit(1)
}
console.log('\nAll checked bundles loaded on every host.')

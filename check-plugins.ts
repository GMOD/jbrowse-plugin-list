#!/usr/bin/env node
//
// check-plugins.ts
//
// Boots every plugin bundle this repo publishes on a matrix of released JBrowse
// hosts, plus unreleased `main`, and asserts each one still loads.
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
// How badly a failure degrades depends on the loader (CLAUDE.md invariant 1):
// jbrowse-web opens the session without the plugin, the RPC worker and the
// embedded products go down whole, and a throw from configure() takes down all
// of them.
//
// A plugin that pins several `versions` gets each of them booted, on the hosts
// that version's `jbrowseRange` names, from its own version dir. `latest/` is a
// byte copy of the newest pinned version, so it is covered by that version's
// row — but note what the range does NOT govern: `latest/` is served to every
// host that names it, whatever range the newest version declares, because a
// jb2hubs config on a host without ref support loads the url and never reads
// the manifest (ADR 0008).
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

import {
  rehostedPrefix,
  type SourceManifest,
  type SourcePlugin,
} from './manifest-types.ts'

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
// actually reaches: v4.0.0 is the floor jb2hubs settled on, `latest` is what
// most links resolve to.
//
// `main` is unreleased core, and it runs on every default run for the warning it
// gives: a break there is the next release's break, visible weeks before any
// config reaches it. What it must not do is gate. Freezing this repo's
// publishing on someone else's in-progress branch would block the plugin fix a
// real regression needs, so an `advisory` host reports and never touches the
// exit code — invariant 1 is a claim about released hosts.
//
// The real bundle floor sits just under the declared one and is measured, not
// assumed: msaview, protein3d and hubs all load on v3.7.0; v3.0.0 is the
// highest host where they do not (agent-docs/2026-08-26-store-plugin-refs-older-clients.md).
//
// `semver` is what a plugin's jbrowseRange is tested against. The moving tags
// get a sentinel above every real release, which is the honest reading: a plugin
// declaring `<2.0.0` must not be treated as covering whatever `latest` is today.
interface Host {
  label: string
  semver: string
  advisory?: boolean
}

const HOST_VERSIONS: Host[] = [
  { label: 'v4.0.0', semver: '4.0.0' },
  { label: 'v4.2.0', semver: '4.2.0' },
  { label: 'v4.3.0', semver: '4.3.0' },
  { label: 'latest', semver: '999.999.999' },
  { label: 'main', semver: '999.999.999', advisory: true },
]

// Plugins core now bundles, and the range of hosts that bundle them. jbrowse-web
// drops a config entry naming one of these before loading it (core's
// `vendoredPluginNames`), so the url is never fetched and the UMD global is
// legitimately absent. Reporting those as a failed load would be wrong — but so
// would reporting them as a pass, since the bundle was never exercised. Keep in
// step with jbrowse-components/packages/core/src/pluginDefinitions.ts.
//
// Matched on `semver`, not on the host label: a label-equality test ('v4.0.0')
// silently reads `--versions 4.0.0` as a vendoring host and skips the check.
const VENDORED_BY_HOST = new Map([
  ['MafViewer', '>4.0.0'],
  ['GWAS', '>4.0.0'],
])

const { values } = parseArgs({
  options: {
    versions: { type: 'string' },
    hybrid: { type: 'boolean', default: false },
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
// An explicit `--versions` still gets a named host's `advisory` flag, so
// `--versions main` reports rather than gates, the same as it does by default.
const hosts: Host[] =
  values.versions === undefined
    ? HOST_VERSIONS
    : values.versions.split(',').map(label => {
        const known = HOST_VERSIONS.find(h => h.label === label)
        return known ?? { label, semver: label.replace(/^v/, '') }
      })

const { plugins } = JSON.parse(
  fs.readFileSync(path.join(dir, 'plugins.json'), 'utf8'),
) as SourceManifest

// `--bundle <packageName>=<dir>` serves a candidate build in place of the one
// this repo would publish — a plugin repo's own dist/, or an older version dir
// to reproduce a past break. The directory stands in for the whole prefix of
// every build the package publishes, so sidecar chunks come from the same
// build.
//
// `dist/` only keeps the currently-published versions, so to point at an older
// one first run `node fetch-version.ts <packageName> <version>`, which refetches
// it and verifies it byte-for-byte against what S3 serves.
const bundleOverrides = new Map(
  values.bundle.map(spec => {
    const eq = spec.indexOf('=')
    if (eq < 0) {
      throw new Error(`--bundle wants packageName=dir, got "${spec}"`)
    }
    return [spec.slice(0, eq), path.resolve(spec.slice(eq + 1))]
  }),
)

// The bundles worth checking are the ones this run would publish: a package
// whose `latest/` or any version dir moved. `latest/` is rebuilt from scratch
// every download, so git sees a real content change only when the promoted
// version actually moved; a version dir appears when a pin is added, which can
// happen without `latest/` moving at all.
//
// `-uall` matters: without it git collapses an untracked directory to its top
// level, so a plugin added to plugins.json for the first time reports as
// `?? dist/jbrowse-plugin-tview/` — no build segment, no regex match, and the
// pre-upload gate skips the one bundle with no prior evidence at all. With
// `-uall` each file is listed, so the new plugin's files match like any other
// change.
function changedPackages() {
  const status = execFileSync(
    'git',
    ['status', '--porcelain', '-uall', '--', 'dist'],
    { cwd: dir, encoding: 'utf8' },
  )
  const names = new Set<string>()
  for (const line of status.split('\n')) {
    // Paths containing spaces or non-ASCII come back quoted ("dist/a b/..."),
    // which the regex tolerates: it anchors on `dist/` and the build segment,
    // both inside the quotes. Lazy on the package so a scoped one
    // (`@cmdcolin/jbrowse-plugin-hubs`) keeps its slash.
    const match = /dist\/(.+?)\/(?:latest|\d+\.\d+\.\d+[^/]*)\//.exec(line)
    if (match) {
      names.add(match[1])
    }
  }
  return names
}

// An explicit filter that selects nothing means "nothing to check" — notably
// `--changed` on a run that promoted no new version. Falling back to "all" there
// would turn the pre-upload gate into a 70-boot matrix on every no-op run.
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
//
// `--hybrid` adds the `storePlugin` key jb2hubs emits alongside the url
// (ADR 0008) — the store's `name`, which is why it reads as a duplicate of
// `name` here and why that duplication expires with the url. The claim it tests is that an older host ignores the key and
// loads the url as it always did — which rests on the config model holding
// `plugins` as `types.frozen`, so nothing validates the shape. That is true as
// far back as the field goes, but it is a claim about someone else's released
// code, and this repo's whole position is that a claim is not a measurement
// (ADR 0003).
//
// Read it as a DIFF against the same run without the flag, never as a pass/fail
// on its own. Below v3.7.0 these bundles already fail for reasons that have
// nothing to do with the key — v2 cannot run a bundle built against modern
// ReExports at all — so `--hybrid` exits 1 on an old host either way, and the
// only question the run answers is whether the two columns differ:
//
//   node check-plugins.ts --published --versions <hosts> --json control.json
//   node check-plugins.ts --published --hybrid --versions <hosts> --json hybrid.json
//   # compare, ignoring nothing: any row that differs is the finding
//
// A row that differs means the extra key is NOT inert on that host, and jb2hubs
// must not emit it until the affected hosts are out of the wild.
function configFor(name: string, url: string) {
  return JSON.stringify({
    assemblies: [],
    tracks: [],
    plugins: [values.hybrid ? { name, url, storePlugin: name } : { name, url }],
  })
}

// One build of a plugin: a pinned version dir, or `latest/` when the entry
// declares no `versions` and the download step tracks npm latest at `*`.
interface Build {
  pluginVersion: string
  jbrowseRange: string
}

function buildsOf(plugin: SourcePlugin): Build[] {
  return plugin.versions && plugin.versions.length > 0
    ? plugin.versions
    : [{ pluginVersion: 'latest', jbrowseRange: '*' }]
}

interface Probe {
  packageName: string
  pluginVersion: string
  hostVersion: string
  advisory?: boolean
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
  plugin: SourcePlugin,
  build: Build,
): Promise<Probe> {
  const { name, packageName, umdPath } = plugin
  const { pluginVersion } = build
  const bundlePrefix = rehostedPrefix(packageName, pluginVersion)
  const bundleUrl = `${bundlePrefix}${umdPath}`
  // Same origin as the app, so the config fetch is not a CORS case. Nothing is
  // ever published here — the request is answered from memory below.
  const configUrl = `https://jbrowse.org/plugin-smoke/${encodeURIComponent(packageName)}.json`
  const localBuild =
    bundleOverrides.get(packageName) ??
    path.join(distDir, packageName, pluginVersion)

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
      // The whole build prefix, not just the umd entry point: a code-split
      // plugin (protein3d lazy-loads a molstar chunk) fetches siblings at load
      // time, and serving a working-tree bundle beside production's chunks
      // would test a combination that never ships.
    } else if (
      (!values.published || bundleOverrides.has(packageName)) &&
      url.startsWith(bundlePrefix)
    ) {
      const local = path.join(localBuild, url.slice(bundlePrefix.length))
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
  const result: Probe = {
    packageName,
    pluginVersion,
    hostVersion,
    pageErrors: [],
  }
  try {
    await page.goto(`${app}?config=${encodeURIComponent(configUrl)}`, {
      waitUntil: 'domcontentloaded',
      timeout,
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
const advisory: Probe[] = []
let failed = false
for (const plugin of targets) {
  for (const build of buildsOf(plugin)) {
    const { pluginVersion, jbrowseRange } = build
    console.log(
      `\n${plugin.packageName} (${plugin.name}) ${pluginVersion}` +
        (jbrowseRange === '*' ? '' : ` jbrowseRange ${jbrowseRange}`),
    )
    for (const host of hosts) {
      const vendoredRange = VENDORED_BY_HOST.get(plugin.name)
      const vendored =
        vendoredRange !== undefined && satisfies(host.semver, vendoredRange)
      // A host this build never claimed to support is not a failure — it is
      // the manifest working. Probing it anyway would make the canary
      // permanently red for a build the store already refuses to offer there,
      // and a canary you have learned to ignore is worse than none.
      const outOfRange =
        jbrowseRange !== '*' && !satisfies(host.semver, jbrowseRange)
      const r: Probe =
        vendored || outOfRange
          ? {
              packageName: plugin.packageName,
              pluginVersion,
              hostVersion: host.label,
              vendored,
              outOfRange,
              pageErrors: [],
            }
          : await probe(browser, host.label, plugin, build)
      if (host.advisory) {
        r.advisory = true
      }
      results.push(r)
      const problems = [
        r.fatal && `FATAL ${r.fatal}`,
        r.threw && `threw ${r.threw}`,
        !r.vendored &&
          !r.outOfRange &&
          !r.settled &&
          !r.fatal &&
          'never settled (no session, no error page)',
        r.settled &&
          !r.globalDefined &&
          `JBrowsePlugin${plugin.name} undefined`,
      ].filter(p => typeof p === 'string')
      const note = r.vendored
        ? 'skipped, vendored into this host'
        : r.outOfRange
          ? 'skipped, outside declared jbrowseRange'
          : 'ok'
      const line =
        problems.length > 0
          ? `${r.advisory ? 'ADVISORY ' : ''}${problems.join(' | ')}`
          : note
      console.log(`  ${host.label.padEnd(9)} ${line}`)
      if (problems.length > 0) {
        if (r.advisory) {
          advisory.push(r)
        } else {
          failed = true
        }
      }
    }
  }
}
await browser.close()

if (values.json) {
  fs.writeFileSync(values.json, JSON.stringify(results, null, 2))
}

if (advisory.length > 0) {
  const hostList = [...new Set(advisory.map(r => r.hostVersion))].join(', ')
  const bundles = [
    ...new Set(advisory.map(r => `${r.packageName}@${r.pluginVersion}`)),
  ].join(', ')
  console.warn(
    `\nBroke on the advisory host${hostList.includes(',') ? 's' : ''} ` +
      `${hostList}: ${bundles}. Unreleased core, so it does not block this ` +
      'upload — but it is what the next release breaks. Raise it with the ' +
      'plugin or with jbrowse-components now, while there is still a release ' +
      'between here and a broken config.',
  )
}

if (failed) {
  console.error(
    '\nA bundle broke on a released host. Do not upload: `latest/` is no-cache ' +
      'and reaches every already-published config immediately.',
  )
  process.exit(1)
}
console.log(
  advisory.length > 0
    ? '\nNo released host broke; the advisory failures above still stand.'
    : '\nAll checked bundles loaded on every host.',
)

# ADR 0003 — Boot every promoted bundle on real hosts; treat `jbrowseRange` as a claim, not a check

- **Status:** Accepted
- **Date:** 2026-08-06
- **Affected:** `check-plugins.ts`, `.github/workflows/plugin-canary.yml`, the
  `verify`/`verify-all`/`canary` scripts, `plugins.json` `jbrowseRange`

## Context

A plugin declares which JBrowse versions it supports via `jbrowseRange`, and the
consumer resolves it at install time. That is a compatibility _statement_ made
by the plugin author. The question is whether it is worth trusting.

The msaview 2.7.0 break answers it. Two causes, both from a plugin built against
an unreleased MUI-v9 `@jbrowse/core`:

- `@mui/material/SvgIcon` was externalized, but its exported **shape** differs
  by MUI major. Released hosts expose it as the SvgIcon component; MUI 9 also
  hangs `createSvgIcon` off it, which `@mui/icons-material` v9 calls. A
  key-presence check sees nothing wrong — the key is there on every host.
- `types.stripDefault` exists only in the mobx-state-tree shipping with
  unreleased core.

Neither is expressible as a version range, and neither would be caught by
checking that a symbol exists. **Shape, not presence, is what varies.** The
plugin's own CI passed, because it tested `[v3.7.0, nightly]` — the two ends —
while the failure lived in the middle, v4.0.0 through latest.

## Decision

**Boot each promoted bundle on a matrix of released hosts and assert it loads.
The declared range only decides which hosts to skip.**

`check-plugins.ts` serves a synthetic config naming exactly one plugin to
`jbrowse.org/code/jb2/<version>/`, then asserts: no error page, the UMD global
is defined, and `configure()` survived. One plugin per config, so a failure
names one bundle with no ambiguity. No assemblies — plugin load and
`configure()` both run before any assembly is touched, and inventing test data
would add a second thing that can break.

### Why it lives here rather than in the plugin repos

The moment of risk is _this repo promoting an npm version_, not a push to a
plugin repo, and nothing runs between npm publish and global rollout. Of the 17
plugins listed, only msaview and protein3d test against any JBrowse version at
all. A push-triggered job in a plugin repo structurally cannot see this.

### What the range is still for

Skipping. A host outside a plugin's declared range is reported as skipped rather
than failed — otherwise a plugin the store already refuses to offer keeps the
canary permanently red, and a canary you have learned to ignore is worse than
none.

That is its whole remaining job. As of 2026-08-06 no entry in `plugins.json`
declares `versions`, so every range is `*` and nothing is ever skipped for range
reasons. Its only user was ICGC, now removed. Keep it for retiring a plugin (ADR
0002), but do not mistake it for what keeps the store working.

### Scope, because this is easy to over-trust

This proves a bundle **loads**. It does not prove a track **renders** — that
needs test data and belongs in the plugin's own repo. Of the 17 plugins here,
only msaview and protein3d have any e2e tests at all.

## Consequences

- Verification needs a browser, so `puppeteer-core` is a dev dependency. Chosen
  over `puppeteer` so the other scripts — plain fetch + tar — do not drag a
  ~150MB Chromium into every install; point `CHROME_PATH` at a system browser.
- `--bundle <pkg>=<dir>` lets a candidate build be checked before it is
  published to npm at all, and reproduces past breaks against an older version
  dir (fetch it first, see ADR 0005).
- Vendored plugins (`MafViewer`, `GWAS`) are skipped on hosts that bundle them,
  matched on semver rather than host label — a label-equality test silently read
  `--versions 4.0.0` as a vendoring host and skipped the check.
- The gate only knows about hosts, not about data or config content. For a break
  that needs real config content, jb2hubs' `checkConfigCompat.mjs` boots the
  actual shipped configs.

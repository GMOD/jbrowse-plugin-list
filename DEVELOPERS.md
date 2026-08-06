## Development guide

This repo uploads plugin code to our jbrowse.org s3 bucket

We used to use unpkg.org as a CDN but it was a bit unrelaible at times

A GitHub Action (`.github/workflows/deploy.yml`) runs nightly at midnight (and
on manual dispatch). It **only regenerates and opens a PR — it does not deploy
to S3.** It runs `pnpm update-plugins` (see Pipeline below); when a plugin has a
new published version, it commits the new versioned artifacts (and the deletion
of the ones they supersede) plus regenerated manifests, and opens an "Update
plugins" PR for review. When nothing changed it opens nothing.

**Deploying is a separate manual step**, run after the PR is merged. This is
deliberate: published artifacts are immutable and are never deleted, so a human
reviews the diff before anything is added.

`dist/` is the staging area for that upload, not an archive of everything ever
published — it holds each plugin's `latest/` plus the versions the build
manifest names, and `pnpm download` deletes superseded version dirs itself
(`--no-prune` opts out). S3 keeps every older version forever (`pnpm upload` is
`rclone copy`, which never deletes), so pruning git unpublishes nothing. To get
an old version back locally:

```bash
node fetch-version.ts jbrowse-plugin-msaview 2.7.0
```

It refetches from npm and then verifies the result byte-for-byte against what S3
is actually serving, which is what makes it a safe substitute for the git copy.
See the `dist/` note in [CLAUDE.md](CLAUDE.md) for why `copy` must never become
`sync`.

```bash
pnpm verify      # boot every newly promoted bundle on released JBrowse hosts
pnpm upload      # copy dist/ artifacts (immutable) + the v2 manifest to S3
pnpm invalidate  # CloudFront invalidation for /plugin-store/v2/*
```

`upload` uploads artifacts before the manifest, so v2 never points at a 404. The
old v1 `plugin-store/plugins.json` is no longer generated or updated by this
repo (its previously-published objects stay frozen on S3 for any legacy client).

## Pipeline

`pnpm update-plugins` runs two steps:

- **download** (`download-plugins-npm-api.ts`) reads `plugins.json`, downloads
  the relevant NPM tarballs into version-pinned dirs
  `dist/<packageName>/<version>/` (an existing version dir is never
  re-downloaded or overwritten), verifies each declared `umdPath` exists,
  computes its sha384
  [subresource integrity](https://developer.mozilla.org/docs/Web/Security/Subresource_Integrity)
  hash, and writes the intermediate `build-manifest.json`.
- **generate** (`generate-plugins.ts`) reads `plugins.json` +
  `build-manifest.json`, validates each `jbrowseRange`, and writes
  `v2_plugins.json` → `plugin-store/v2/plugins.json` — the **v2** manifest with
  `packageName`, per-version `jbrowseRange`/`url`/`integrity` pointing at
  immutable, version-pinned artifacts, so version-aware clients can resolve the
  right build for their JBrowse version.

Both steps refuse to publish a store listing with a plugin silently missing,
because `v2_plugins.json` _is_ the store: an entry that vanishes because npm
returned a 404 for thirty seconds unpublishes that plugin for everyone, and
`pnpm verify --changed` cannot catch it (a plugin that failed to download has no
`dist/` change, so it is not in the changed set).

- Anything a run does not rebuild — a plugin that failed, or one a filtered run
  never selected — **keeps its previous `build-manifest.json` entry**. Its
  bundle is still on S3 and still works, so the store keeps offering the last
  good version.
- `download` keeps going through every plugin so one run reports all the
  breakage, then grades the outcome by what publishing would actually lose. A
  failure that fell back to a previous entry is reported and **exits 0**, so one
  flaky npm response does not hold back the other sixteen plugins' updates (this
  is what keeps `deploy.yml`'s nightly PR opening). A failure with nothing to
  fall back on — typically a brand-new plugin — exits non-zero.
- `generate` throws if any `plugins.json` entry has no `build-manifest.json`
  entry — which also catches running it against a stale manifest, or without
  `download` having run at all.

Use `--allow-failures` (download) / `--allow-missing` (generate) only to retire
a package that is gone from npm for good; the real fix there is editing
`plugins.json`.

`PLUGIN_DIST_DIR`, `PLUGIN_BUILD_MANIFEST`, and `PLUGIN_V2_OUT` redirect the
three outputs, so the whole pipeline can be exercised without touching the
committed artifacts.

## Verification

`check-plugins.ts` boots each rehosted bundle on a matrix of hosted JBrowse
releases (`jbrowse.org/code/jb2/<version>/`) and asserts it loads: no error
page, UMD global defined, `configure()` survived. It serves each plugin a
synthetic config naming only that plugin, so a failure names one bundle with no
ambiguity, and intercepts the whole `latest/` prefix so code-split plugins get
their sidecar chunks from the same build.

```bash
pnpm verify       # only the bundles this run promoted (the pre-upload gate)
pnpm verify-all   # every plugin
pnpm canary       # every plugin, as S3 is serving it right now
```

Why it lives here rather than in the plugin repos: `pnpm upload` republishes
every plugin's `latest/` at once, no-cache, and the jb2hubs configs name those
urls from permanent locations. The moment of risk is _this repo promoting an npm
version_, and nothing else runs between npm publish and global rollout. Only two
of the plugins listed here test against any JBrowse version at all, both against
`[v3.7.0, nightly]` — the two ends, while the breaks land in the middle.

Two workflows use it: `deploy.yml` runs `pnpm verify` before opening the nightly
PR (recording the verdict in the PR body rather than blocking it, so one broken
plugin doesn't hold back the rest), and `plugin-canary.yml` runs `pnpm canary`
every 6h against production, opening a rolling issue.

Hosts outside a plugin's declared `jbrowseRange` are skipped rather than failed
— see the ICGC note in `CLAUDE.md` for why that matters.

**Scope**: this proves a bundle loads. It does not prove a track renders; that
needs test data and belongs in the plugin's own repo.

## Background

Why the pipeline is shaped this way — the SRI constraint that forces pinning,
the two url shapes and their rollback levers, why bundles are booted rather than
trusted, and why `dist/` is pruned — is recorded in
[agent-docs/architectural-decision-records/](agent-docs/architectural-decision-records/).

## Why version-pinned + immutable

Artifacts live at `<packageName>/<version>/...` and are uploaded with a long
`immutable` cache lifetime; they are written once and never overwritten. Only
the small manifest files are mutable (`no-cache`). This means a URL handed to a
client never changes its bytes underneath them — fixing the previous scheme
where re-syncing `latest` silently overwrote the bundle at a stable URL.

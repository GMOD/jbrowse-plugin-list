## Development guide

This repo uploads plugin code to our jbrowse.org s3 bucket

We used to use unpkg.org as a CDN but it was a bit unrelaible at times

A GitHub Action (`.github/workflows/deploy.yml`) runs nightly at midnight (and
on manual dispatch). It **only regenerates and opens a PR — it does not deploy
to S3.** It runs `pnpm update-plugins` (see Pipeline below); when a plugin has a
new published version, it commits the new versioned artifacts + regenerated
manifests and opens an "Update plugins" PR for review. When nothing changed it
opens nothing.

**Deploying is a separate manual step**, run after the PR is merged. This is
deliberate: the artifacts are immutable and append-only, so a human reviews the
diff before anything is published.

```bash
pnpm upload      # sync dist/ artifacts (immutable) + the v2 manifest to S3
pnpm invalidate  # CloudFront invalidation for /plugin-store/v2/*
```

`upload` uploads artifacts before the manifest, so v2 never points at a 404. The
old v1 `plugin-store/plugins.json` is no longer generated or updated by this repo
(its previously-published objects stay frozen on S3 for any legacy client).

## Pipeline

`pnpm update-plugins` runs two steps:

- **download** (`download-plugins-npm-api.ts`) reads `plugins.json`, downloads
  the relevant NPM tarballs into version-pinned dirs
  `dist/<packageName>/<version>/` (append-only — existing versions are never
  re-downloaded or overwritten), verifies each declared `umdPath`/`esmPath`
  exists, computes a sha384
  [subresource integrity](https://developer.mozilla.org/docs/Web/Security/Subresource_Integrity)
  hash for a UMD bundle (ESM entries get an `esmUrl` and no hash — dynamic
  import can't enforce SRI), and writes the intermediate `build-manifest.json`.
- **generate** (`generate-plugins.ts`) reads `plugins.json` +
  `build-manifest.json`, validates each `jbrowseRange`, and writes
  `v2_plugins.json` → `plugin-store/v2/plugins.json` — the **v2** manifest with
  `packageName`, per-version `jbrowseRange`/`url`/`integrity` pointing at
  immutable, version-pinned artifacts, so version-aware clients can resolve the
  right build for their JBrowse version.

## Why version-pinned + immutable

Artifacts live at `<packageName>/<version>/...` and are uploaded with a long
`immutable` cache lifetime; they are written once and never overwritten. Only
the small manifest files are mutable (`no-cache`). This means a URL handed to a
client never changes its bytes underneath them — fixing the previous scheme
where re-syncing `latest` silently overwrote the bundle at a stable URL.

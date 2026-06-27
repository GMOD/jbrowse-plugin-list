# Handoff: versioned plugin store (v2) with immutable, range-aware plugins.json

Status as of this session. Two repos touched:

- **Producer** — `~/src/jb2plugins/jbrowse-plugin-list` (this repo)
- **Consumer** — `~/src/jbrowse-components`

Nothing has been deployed. No production `aws s3` writes were made (only a
read-only `sts get-caller-identity` and a `--dryrun`). Working trees are
uncommitted in both repos.

## The design (agreed with maintainer)

- **Artifacts**: rehosted to S3 at **version-pinned, append-only** paths
  `plugins/<packageName>/<version>/<umdPath>`, served `immutable`. Written once,
  never overwritten/deleted → a URL's bytes never change under a saved session.
- **Two manifests, one source**: hand-edit `plugins.json`; the generator emits
  - **v1** `plugin-store/plugins.json` — legacy flat shape (existing clients).
    **Left untouched**: `url` keeps the existing unversioned path and the v2
    rollout does not re-upload it (maintainer decision 2026-06-18; supersedes
    the earlier "repoint v1 to pinned" plan). v1 byte-immutability is therefore
    _not_ attempted; that's a v2-only property.
  - **v2** `plugin-store/v2/plugins.json` — adds `packageName`, per-version
    `jbrowseRange`/`url`/`integrity`, top-level `url`/`integrity` fallback.
- **Consumer** resolves the newest plugin version whose `jbrowseRange` covers
  the running JBrowse version; incompatible → install disabled with reason.
- **It is a curated walled garden** — that's accepted. Custom-URL plugins still
  work.
- **Phase 1 (done): URL-pinned + SRI.** **Phase 2 (NOT done):
  identity-in-config** (store `{packageName, version, integrity}` instead of a
  url, resolve at load) — see below.
- Decision on the "URL copies in configs" concern: deferred to phase 2; phase 1
  already fixes byte-immutability via pinned URLs + SRI.

## Producer repo — DONE & verified

Files changed (all formatted/prettier-clean):

- `manifest-types.ts` (new) — shared schema + `rehostedUrl()` +
  `subresourceIntegrity()` (sha384 SRI).
- `plugins.json` — migrated: each entry now has explicit **`umdPath`** (path to
  UMD bundle inside the published package) instead of an unpkg `url`. URLs are
  constructed, never parsed. Optional
  `versions: [{pluginVersion, jbrowseRange}]` (listed oldest→newest) supported;
  absent = track npm latest with range `*`.
- `download-plugins-npm-api.ts` — fetches each needed version's npm tarball into
  `dist/<packageName>/<version>/` (append-only, skip-if-present), **verifies
  `umdPath` exists in the tarball** (fails loudly), computes sha384, writes
  intermediate `build-manifest.json`. Env overrides for testing:
  `PLUGIN_DIST_DIR`, `PLUGIN_BUILD_MANIFEST`; optional CLI args filter to
  specific package names.
- `generate-plugins.ts` — from `plugins.json` + `build-manifest.json` emits
  `new_plugins.json` (v1) and `v2_plugins.json` (v2).
- `package.json` — `upload` split: artifacts `immutable`, manifests `no-cache`,
  **v2 → `plugin-store/v2/plugins.json`**; `dep` adds `v2_plugins.json` to the
  commit; `invalidate` narrowed to `/plugin-store/*` (pinned artifacts never
  need invalidation).
- `.gitignore` — ignores `build-manifest.json`.
- `README.md` / `DEVELOPERS.md` — documented `umdPath`, `versions`, pipeline,
  immutability.

Verified: full real download of all 18 plugins into a scratch dir works; SRI
matches `openssl dgst -sha384`; append-only skip works; `generate` emits 18
well-formed v1 + v2 entries; `tsc --strict` clean. The irregular `civic` bundle
name and scoped packages are handled via explicit `umdPath`.

Note: `new_plugins.json` / `v2_plugins.json` currently in the working tree were
generated from a **scratch** `build-manifest.json`; they reference pinned URLs
(`.../2.5.0/...`). The committed `dist/` is still the OLD unversioned layout. A
real `pnpm update-plugins` regenerates both consistently and populates the
versioned `dist/`.

## Consumer repo (`~/src/jbrowse-components`) — DONE & verified

Files changed:

- `packages/core/package.json` — added dep **`compare-versions@^6.1.1`** (micro,
  zero-dep, self-typed, assumes x.y.z). Chosen over `semver` to avoid
  `@types/semver` and bulk. `compare-versions.satisfies` handles `>=`, `^`, `~`,
  `x`-ranges, AND compound `>=2.0.0 <3.0.0`; only `*` throws → special-cased as
  "any".
- `packages/core/src/util/types/index.ts` — `JBrowsePlugin` gains
  `packageName?`, `integrity?`, `versions?: JBrowsePluginVersion[]`.
- `packages/core/src/util/pluginStore.ts` (new) —
  `resolvePlugin(plugin, jbrowseVersion)` →
  `{compatible, pluginVersion?, supportedRanges, definition}`. Re-exported from
  `util/index.ts`.
- `packages/core/src/util/pluginStore.test.ts` (new) — 5 tests.
- `packages/core/src/PluginLoader.ts` — `integrity?` added to UMD definitions;
  `loadUMDPlugin` sets `script.integrity` + `crossOrigin` and skips the
  cache-buster when integrity present.
- `plugins/data-management/.../util.ts` — `useFetchPlugins` now fetches **v2**
  URL.
- `plugins/data-management/.../PluginCard.tsx` — resolves version for
  `getSession(model).version`, shows `(vX)`, disables + annotates when
  incompatible, installs the **resolved definition** (`{name,url,integrity}`)
  not the raw store entry; installed-check uses `pluginUrl`.
- `products/jbrowse-web/src/checkPlugins.ts` — fetches v2; matches a config
  plugin's url against the **expanded** url set (top-level + every
  `versions[].url`).
- Tests updated: `checkPlugins.test.ts` (store now `JBrowsePlugin[]` via a
  `store()` helper; dropped the two Loc-_store_ cases that v2 can't represent;
  added versioned-entry cases); `PluginStoreWidget.test.tsx` (install now
  persists the resolved `{name,url}` def).

Verified: `pnpm typecheck` clean except ONE pre-existing unrelated error
(`products/jbrowse-react-linear-genome-view/examples-site/.../WithWebWorker.tsx`
`?worker` import). `pnpm eslint --fix` clean. Tests: pluginStore 5/5,
PluginStoreWidget 4/4, checkPlugins 20/20.

`compare-versions` is linked into `packages/core/node_modules`; `pnpm-lock.yaml`
updated.

## TO DEPLOY v2 (when ready) — NOT done

Two options:

**A. Standard pipeline (recommended, also commits dist):**

```
cd ~/src/jb2plugins/jbrowse-plugin-list
pnpm update-plugins   # download → versioned dist + build-manifest; generate → v1 + v2
pnpm upload           # sync dist (immutable) + cp v2 plugins.json  (v1 NOT uploaded)
pnpm invalidate       # /plugin-store/v2/* only
```

`upload` is now additive: it syncs the versioned `dist/` and writes only
`plugin-store/v2/plugins.json`. Live v1 `plugins.json` is left as-is and the
generator emits v1 at the existing unversioned URLs, so there is no
current-client behavior change.

**B. Minimal additive v2-only (leaves v1 untouched):** a complete versioned
`dist` already exists in this session's scratchpad and matches the current
`v2_plugins.json`. Dry-run confirmed additive (no deletes). When ready:

```
aws s3 sync <scratch>/dist s3://jbrowse.org/plugins/ --cache-control 'public, max-age=31536000, immutable'
aws s3 cp v2_plugins.json s3://jbrowse.org/plugin-store/v2/plugins.json --cache-control 'no-cache, must-revalidate'
AWS_PAGER="" aws cloudfront create-invalidation --distribution-id E13LGELJOT4GQO --paths '/plugin-store/v2/*'
```

The scratchpad dist is ephemeral to this session — prefer regenerating via
`pnpm update-plugins` if the scratch dir is gone. (CloudFront distribution id
`E13LGELJOT4GQO` is from `package.json`.)

Always upload **artifacts before the manifest** so v2 never points at 404s (both
scripts do this).

## Open items / phase 2

- **Identity-in-config (the big one)**: persist
  `{packageName, version, integrity}` in session/config and resolve url at load
  via the index, so configs hold identity+fingerprint not a location → enables
  host-moves + revocation, keeps byte-tamper-evidence even vs a compromised
  index. Touches `PluginLoader` (resolution step + index access), config schema,
  and a migration for existing url-based configs. Not started.
- **SRI enforcement needs S3 CORS**: pinned artifacts must be served with
  permissive CORS for the browser to enforce `<script integrity crossorigin>`.
  Configure the bucket/CloudFront before relying on SRI rejection. Until then
  `integrity` is published but only soft-verified.
- **dist cleanup**: after the first versioned deploy, the OLD unversioned
  `dist/<pkg>/dist/...` local dirs can be removed in a commit (their S3 objects
  stay frozen, serving old saved configs).
- **Producer-side range validation**: when authors add explicit `versions[]`,
  validate `jbrowseRange` at generate time (could add `compare-versions` to the
  producer) so malformed ranges fail loudly rather than silently mismatch at
  runtime.
- **"update available" UX**: PluginCard currently detects installed-by-url;
  could add an explicit "newer compatible version available" affordance (the
  agreed alternative to silent updates).

## Stray files (not mine, left alone)

`~/src/jbrowse-components`: `agent-docs/TODO.md` (modified), `smoke-tmp.mjs`,
`products/jbrowse-react-{app,circular-genome-view}/examples-site/` (untracked) —
pre-existing.

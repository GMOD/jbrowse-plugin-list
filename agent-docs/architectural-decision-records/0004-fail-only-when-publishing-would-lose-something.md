# ADR 0004 — Grade a failed run by what publishing would lose, not by whether anything failed

- **Status:** Accepted
- **Date:** 2026-08-06
- **Affected:** `download-plugins-npm-api.ts`, `generate-plugins.ts`,
  `.github/workflows/deploy.yml`

## Context

`v2_plugins.json` is not a report about the store — it **is** the store listing.
A plugin absent from it is a plugin nobody can install.

The original pipeline tolerated per-plugin failure: `download` caught each
error, logged `✗ Failed`, and exited 0; `generate` warned and skipped the entry.
The intent was reasonable — one bad plugin should not take down the other
sixteen. The effect was not. A single npm 404 lasting thirty seconds would:

1. leave that plugin with no `build-manifest.json` entry,
2. drop it from `v2_plugins.json`,
3. pass `pnpm verify --changed` — a plugin that failed to download has no
   `dist/` change, so it is not in the changed set and is never examined,
4. and be committed, pushed, and uploaded by `pnpm dep`.

The plugin would be silently unpublished from the store, by a transient network
error, with every gate reporting success.

The obvious fix — exit non-zero on any failure — is also wrong. `deploy.yml`
runs `pnpm update-plugins` as a plain step, so that would abort the nightly
before `verify` and open no PR at all, contradicting that job's explicit design
("one plugin publishing a broken version must not hold back the other sixteen").

## Decision

**Carry forward what was not rebuilt, then grade the exit code by what the
manifest would actually lose.**

### Carry forward

Anything a run did not rebuild keeps its previous `build-manifest.json` entry.
This covers two cases:

- a plugin that failed to download keeps its last good version — its bundle is
  still on S3 and still works, so the store loses nothing;
- a filtered run (`node download-plugins-npm-api.ts <pkg>`) no longer replaces
  the manifest with a single entry and drops the other sixteen, which it
  previously did.

### Grade

- Failure **with** a fallback entry → report it, **exit 0**. The store still
  offers the plugin at its previous version. The nightly PR still opens.
- Failure **with no** fallback — typically a brand-new plugin whose first
  download failed → **exit non-zero**. There is nothing to publish and nothing
  downstream can catch it.
- `--allow-failures` overrides, for retiring a package gone from npm for good.

`generate` independently refuses a manifest missing any `plugins.json` entry, so
running it alone or against a stale `build-manifest.json` cannot quietly shrink
the store either. `--allow-missing` is its escape hatch.

### A second gap in the same gate

`--changed` reads `git status --porcelain` for which `latest/` dirs moved. Git
collapses untracked directories, so a plugin added to `plugins.json` for the
first time appears as `?? dist/jbrowse-plugin-tview/` — no `/latest/` segment,
no match — and the pre-upload gate skipped precisely the bundle with no prior
evidence. Fixed with `-uall`, which lists each file:

```
?? dist/brand-new-plugin/            → skipped   (before)
?? dist/brand-new-plugin/latest/b.js → checked   (after)
```

## Consequences

- A permanently-dead package silently stays at its last good version instead of
  failing loudly. Accepted: the failure is still reported on every run, and the
  correct fix is editing `plugins.json`, not letting the pipeline break.
- `deploy.yml` keeps opening its nightly PR through transient npm trouble.
- Pruning (ADR 0005) is skipped when a run exits non-zero, so a bad run leaves
  the tree as-is for diagnosis.
- The three outputs are redirectable — `PLUGIN_DIST_DIR`,
  `PLUGIN_BUILD_MANIFEST`, `PLUGIN_V2_OUT` — so all of these paths can be
  exercised without touching committed artifacts. Every branch above was tested
  that way.

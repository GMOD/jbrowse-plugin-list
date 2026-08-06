# ADR 0007 — Retire a broken plugin by removing its entry, not by narrowing its range

- **Status:** Accepted
- **Date:** 2026-08-06
- **Affected:** `plugins.json`, `generate-plugins.ts` (`assertValidRange`),
  `check-plugins.ts` (`outOfRange`), and in jbrowse-components
  `packages/core/src/util/pluginStore.ts` (`rangeMatches`, `supportedRanges`)

## Context

`jbrowse-plugin-icgc` 1.0.2 (Oct 2022, `@jbrowse/core: ^1.5.0`) externalizes
`@material-ui/core` — MUI **v4**, which no host since JBrowse 2 has provided. It
error-paged on v4.0.0 through latest for years. npm `latest` is still 1.0.2, so
no fix was ever coming.

The apparent tool for this is `jbrowseRange`. ICGC was first pinned to
`jbrowseRange: "<2.0.0"` (`a04fcb6`), which is the honest statement of what it
supports and stops range-aware clients offering it. That seemed sufficient.

It was not, and the reason generalizes.

## Decision

**A plugin that can no longer work on any supported host is removed from
`plugins.json`. Narrowing its range is not enough.**

ICGC was removed outright in `c5ec0d5`.

### Why the range alone does not retire anything

A range only binds clients that read it. The published entry also carries a
top-level `url`/`integrity` pair, and `resolvePlugin` falls back to it when no
version matched:

```ts
// packages/core/src/util/pluginStore.ts
const source = best ?? plugin
```

So a client that ignores `versions[]`, or any path that lands on the fallback,
is handed the broken bundle regardless of what the range says. Narrowing the
range hides the plugin from the careful clients and leaves it armed for everyone
else — the worst of both, because the store now looks like it has handled the
problem.

Removing the entry is what actually stops it being offered.

### What removal does not do

The artifacts stay on S3 (`rclone copy` never deletes, ADR 0005), so any config
or install that already names a pinned ICGC url keeps working exactly as before
— which for ICGC means keeps failing exactly as before. Removal changes the
store listing, nothing else. There is no mechanism here to reach a config that
already exists; that is the whole premise of ADR 0002.

### What `versions`/`jbrowseRange` is still for

As of 2026-08-06 **no entry in `plugins.json` declares `versions` at all**, so
every one of the 17 gets a single auto-generated version at `jbrowseRange: "*"`.
The range apparatus — `assertValidRange` here, `rangeMatches` /
`supportedRanges` / `compatible` in core, the `outOfRange` skip in
`check-plugins.ts` — has zero live users.

Keep it anyway, for two jobs it is genuinely the right tool for:

- **Pinning around a bad release.** This is the store-side rollback lever, and
  the one that was not pulled during the msaview incident (ADR 0002).
- **Skipping hosts a plugin never claimed.** Without it, a plugin the store
  already refuses to offer keeps the canary permanently red (ADR 0003).

But do not mistake it for what keeps the store working. A range is a promise the
author wrote down; booting the bundle is a fact.

## Consequences

- The store shrinks silently when a plugin is retired. There is no tombstone and
  no "this plugin was removed" affordance for a user who had it installed.
  Accepted — the installed copy keeps working from its pinned url, and the store
  simply stops offering a new install.
- `dist/jbrowse-plugin-icgc/` and its `latest/` remain in the tree and keep
  being uploaded. `pruneUnpublished` deliberately leaves packages absent from
  the manifest alone, since nothing in the pipeline knows their retention rule
  (ADR 0005).
- Deciding to retire is a judgement call requiring evidence a bundle cannot work
  on any supported host. `pnpm verify-all` produces exactly that evidence.

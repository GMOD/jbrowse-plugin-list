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

## Amendment 2026-09-02 — the levers invert for configs that carry a ref

Everything above was written when nothing resolved the manifest at load time.
ADR 0008 changed that, and for the population it created the two levers swap
strength. Measured against `resolveStoreRefs` in jbrowse-components
`packages/core/src/util/pluginStore.ts`, on `main` at `5374f27884`:

| what the store does       | a config with `{ storePlugin, url }` on a host that resolves refs                                                           | a store install / a host that does not resolve refs          |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| removes the entry         | "no answer" — **falls back to the url**, `latest/`, with a console warning. For a retired plugin that is the broken bundle. | store stops offering it; the url population is unchanged     |
| narrows the range past it | "not for this JBrowse" — **fails with a message** naming the supported ranges; the url is deliberately not loaded           | card reads "Not compatible"; the url population is unchanged |

So for refs, the narrowed range is the lever that actually stops the bundle
being loaded, and removal is the one that leaves it armed. That is the opposite
of the conclusion above, which stays true for every install and every config
that names a url on a host without ref support.

Two facts bound what a range can do at all, and neither is in the code here:

- **Only JBrowse 5 reads the v2 manifest.** `v4.3.0` and every earlier host
  fetch the frozen v1 `plugin-store/plugins.json` (its store widget at
  `plugins/data-management/src/PluginStoreWidget/components/util.ts` in that
  tag). A range binds no v4 host, which is why `fe8e252` retired three
  v5-incompatible plugins by removal rather than by a `<5.0.0` pin.
- **`latest/` ignores ranges.** The download step mirrors the newest pinned
  version into `latest/` whatever its range declares, and a jb2hubs config on a
  host without ref support loads `latest/` and never reads the manifest. Pin
  2.6.8 for `<5` and 3.0.0 for `>=5`, and every v4 host loading such a config
  still gets 3.0.0.

Also a trap in the matching itself, raised with jbrowse-components on
2026-09-02: the running version is `packageJSON.version`, which on the live
`main` host and in every 5.0.0 pre-release is `5.0.0-beta.N`, and
compare-versions reads `5.0.0-beta.1` as satisfying `<5.0.0` and not `>=5.0.0`.
A range written to keep a plugin off v5 would have served it to every beta host.
The policy asked of jbrowse-components is that a prerelease host is its release
for compatibility purposes, so ranges here are written against release versions
and never need a `-0` suffix. Until that ships, a bare-major upper bound is
unsafe on beta hosts.

### What this changes about the decision

Nothing for the v4 population; removal is still the only thing that reaches it.
For the ref population the honest tool is the range, and a first-class "retired"
marker the v5 resolver could read — one that fails a ref with an explanation
instead of falling back — would be the right shape for a plugin that should be
off everywhere. That is a schema change in both repos and is not made here.
Until it is, retiring a plugin that jb2hubs refs means doing both: narrow the
range so v5 hosts refuse it, and accept that removal alone would hand those same
hosts the `latest/` fallback.

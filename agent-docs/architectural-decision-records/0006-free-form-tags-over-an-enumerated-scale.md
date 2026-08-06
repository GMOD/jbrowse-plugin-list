# ADR 0006 — Classify plugins with free-form tags, not an enumerated scale

- **Status:** Accepted
- **Date:** 2026-08-06
- **Affected:** `plugins.json`, `manifest-types.ts`, `generate-plugins.ts`,
  `README.md`, and in jbrowse-components
  `packages/core/src/util/types/index.ts`,
  `packages/core/src/ui/PluginStoreCard.tsx`,
  `plugins/data-management/src/PluginStoreWidget/`

## Context

Store entries carried `plug_n_play`, a numeric field taking 0, 1, or 2. It was
introduced in `0a59935` (2025-11-03) and:

- was documented nowhere in either repo, so its meaning had to be
  reverse-engineered from the sixteen values that used it;
- was read by nothing — no consumer, no type definition, no UI;
- had already drifted. `UCSC: 0` and `GDC: 0` are zero-config public APIs
  sitting beside `CIVIC: 2` and `Reactome: 2`, which are also zero-config public
  APIs. `protein3d: 0` was backfilled hastily in `6e9b85c`.

The reconstructed scale — 2 works immediately, 1 works on data you supply, 0
needs configuration or a server — fits every entry, but a field whose meaning
requires a legend that does not exist is one contributors will fill in wrong.
`jbrowse-plugin-tview` simply omitted it.

Adding a store filter meant giving it a real consumer, which was the last cheap
moment to change its shape.

## Decision

**Replace `plug_n_play: number` with `tags: string[]`, free-form.**

The numeric scale migrated 1:1 — `2` → `plug-and-play`, `1` →
`bring-your-own-data`, `0` → `needs-setup` — joined by topic tags read off each
entry's own description (`alignment`, `cancer`, `remote-api`, `structure`, …).
`plug_n_play` is gone entirely; nothing read it, so no compatibility shim was
warranted.

### Why not a string enum

An enum was the obvious fix for the legend problem, and it solves that much. But
it still freezes one axis into the schema in three places — this repo's types,
the published manifest, and the consumer's `JBrowsePlugin`. Adding a second
dimension later (a data type, a domain, a maturity level) would mean a
coordinated change across all three.

Tags keep the vocabulary as **data**. A new axis is an edit to one JSON file.

### The consumer must not enumerate them

`JBrowsePlugin.tags` is typed `string[]`, deliberately not a union. The store
widget builds its filter list from whatever tags the fetched manifest actually
contains, so `jbrowse-plugin-list` can introduce a tag without a jbrowse-
components release to teach it. Selected tags **AND** together, so combining a
setup tag with a topic tag narrows rather than widens.

## Consequences

- Nothing enforces spelling. Two spellings of one idea would silently become two
  filter chips. Mitigated by listing the vocabulary in `README.md` and asking
  contributors to reuse it; not by validation, which would recreate the closed
  set this decision rejects.
- The setup tag is a convention, not a requirement. An entry with no setup tag
  simply does not appear under that filter.
- `v2_plugins.json` changed shape at the same publish that carried tags to
  production. Verified live afterwards: 17 entries, 17 with `tags`, 0 with
  `plug_n_play`.
- A tag stays offered while selected even when it matches nothing, so the last
  chip cannot vanish out from under the click that would clear it.

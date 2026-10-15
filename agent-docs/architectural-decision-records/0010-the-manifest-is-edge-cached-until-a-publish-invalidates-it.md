# ADR 0010 — The manifest is edge-cached until a publish invalidates it

- **Status:** Accepted
- **Date:** 2026-10-14
- **Affected:** the `upload` and `dep` scripts

## Context

A jbrowse-web config that names a plugin by its store `name` (every jb2hubs hub)
fetches `plugin-store/v2/plugins.json` before it can load any plugin, so the
manifest sits on the page's first-paint path. It was uploaded
`no-cache, must-revalidate`, and CloudFront honoured that: every request was a
`RefreshHit`, a conditional request back to S3, with 115-170 ms to first byte
against ~100 ms for an edge `Hit` (measured from a laptop with a 20 ms ping to
the edge, 2026-10-14). On the hg38 hub that round trip is one of four serial
steps between the config and the first plugin chunk.

## Decision

**`plugins.json` is uploaded
`public, max-age=0, must-revalidate, s-maxage=86400`.** Browsers still
revalidate on every load, so a returning visitor sees a new manifest as soon as
the edge does. The edge answers from its own copy for up to a day, and
`pnpm invalidate` replaces that copy on every publish. `pnpm dep` now runs
`invalidate` after `upload`, so the normal path cannot forget it.

`latest/` keeps `no-cache`. Configs name it directly from permanent urls, and a
rollback through it (ADR 0002) has to reach the edge without an invalidation
being the only lever.

## Consequences

- A hand-run `upload` without `invalidate` now leaves the store showing the
  previous manifest for up to a day, where it used to cost only a round trip.
  CLAUDE.md's runbook says so.
- A rollback by `versions` pin (ADR 0002's store lever) needs the invalidation
  too, which the runbook already required.

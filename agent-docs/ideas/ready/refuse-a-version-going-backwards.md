---
name: refuse-a-version-going-backwards
description:
  Make generate-plugins.ts refuse to write a v2_plugins.json entry older than
  the published one, since a stale build-manifest.json downgrades a plugin with
  every gate passing.
---

# Refuse a version going backwards

`generate-plugins.ts` refuses a manifest that drops an entry (ADR 0004), but
nothing compares a version it is about to write against the published one. Run
against a `build-manifest.json` that predates a promotion, it rewrites
`v2_plugins.json` backwards: on 2026-08-26 it downgraded MsaView from the
published 3.4.0 to 3.3.0, url and integrity included, with every gate passing. A
fresh worktree copies `build-manifest.json` from the primary (it is gitignored),
which is how a stale copy arrives.

The check: for each entry, compare the newest of its `versions` with the
committed `v2_plugins.json` and fail on a lower one, with an escape hatch for a
deliberate rollback.

# ADR 0009 — A plugin that goes ESM-only leaves its last UMD build frozen under `latest/`

- **Status:** Accepted
- **Date:** 2026-10-01
- **Affected:** `plugins.json` (Protein3d, MsaView), the `upload` script, and in
  jb2hubs `hubtools/src/enhanceConfig.ts` and `scripts/checkPluginUrls.mjs`

## Context

Protein3d 0.16.0 and MsaView 4.0.0 stopped building UMD. Each ships one ES
module entry plus code-split chunks, for JBrowse `>=5.0.0`, because splitting
needs ESM: MsaView's boot cost fell from 666,181 bytes to about 11 KB, and
Protein3d's from 292,849 to about 148 KB. A 4.x host cannot run those builds.

Three populations load these plugins, and each finds its build differently:

| Who                                      | Reads                                      | Gets                    |
| ---------------------------------------- | ------------------------------------------ | ----------------------- |
| 4.x host installing from the store       | the frozen v1 manifest                     | its old flat-path UMD   |
| 5.x host, store install or `storePlugin` | `v2/plugins.json`                          | the current ESM release |
| 4.x host opening a jb2hubs config        | the config's `url`, ignoring `storePlugin` | `latest/dist/…umd…`     |

Only the last row depended on anything this repo publishes after the switch.

## Decision

**A plugin that goes ESM-only stops publishing UMD, and 4.x hosts keep its last
UMD build, frozen.** Nothing republishes it and nothing needs to.

The store entry gets `esmPath` and `jbrowseRange: ">=5.0.0"`. jb2hubs pins each
config's fallback `url` to the last UMD build's version directory
(`0.15.3/dist/…`, `3.10.0/dist/…`; jb2hubs `77f5829148d`, `5c70d269c79`), so a
regenerated config names a path no publish can touch.

### Why `latest/` keeps serving the old UMD

`latest/` is a directory, and `upload` is `rclone copy`: it adds and replaces
files and never deletes one (invariant 3, ADR 0005). An ESM release carries no
file named `jbrowse-plugin-<name>.umd.production.min.js`, so no upload ever
replaces it. Measured after uploading 0.16.0 and 4.0.0 on 2026-10-01: both
`latest/` UMD urls answer 200 at 292,849 and 666,181 bytes, the sizes of the
pinned `0.15.3/` and `3.10.0/` builds. Protein3d's UMD lazy-loads a hash-named
`molstar-chunk-*.js` from the same directory, and that file stays beside it for
the same reason.

Locally, `copyToLatest` deletes `dist/<pkg>/latest/` before copying, so git
records the UMD as deleted from `dist/`. That is the staging area, not S3.

## Consequences

- **The deployed hub configs depend on invariant 3 until they are regenerated.**
  They name `latest/…umd…`, and turning `copy` into `sync`, or clearing
  `latest/` by hand, would break every one on a 4.x host. Regenerated configs
  name the version directory and stop depending on it.
- **No fix reaches a 4.x host.** Its build is the last UMD, for good.
- **Nothing here boots the frozen UMD again.** `check-plugins.ts` skips the 4.x
  hosts for an entry whose range excludes them. jb2hubs' `config-canary.yml`,
  which boots production configs on 4.0.0 through `main` every 6 hours, is the
  only check that still loads it.
- **The next plugin to go ESM-only takes the same three steps:** `esmPath` plus
  `jbrowseRange: ">=5.0.0"` here; the jb2hubs fallback url pinned to its last
  UMD version directory; and `latest/` left alone.

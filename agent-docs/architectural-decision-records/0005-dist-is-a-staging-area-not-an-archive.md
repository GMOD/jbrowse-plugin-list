# ADR 0005 — `dist/` stages the next upload; S3 is the archive

- **Status:** Accepted
- **Date:** 2026-08-06
- **Affected:** `download-plugins-npm-api.ts` (`pruneUnpublished`),
  `fetch-version.ts`, `npm-fetch.ts`, the `upload` script, `dist/`

## Context

Because every publish writes a new immutable path (ADR 0001), `dist/`
accumulated every version ever published. By 2026-08-06 it was 493M across 47
version dirs — 321M of which was superseded versions, with protein3d alone at
~23M per release and 10 releases retained.

The instinct is that this is the archive and deleting from it loses history. It
is not, for one reason that had to be verified rather than assumed: **the upload
is `rclone copy`, never `sync`.** Copy adds and skips; it does not delete. So
what `dist/` contains only decides what gets _added_ to S3.

The evidence that git makes a poor archive is already in the tree: the legacy v1
flat layout sat in `dist/<pkg>/dist/` looking maintained while nothing
regenerated it, and it served ~50k configs a two-month-old bundle. Git kept it
_visible_ without keeping it _correct_.

## Decision

**`dist/` keeps only what an upload needs: each plugin's `latest/`, plus every
version the build manifest names. `pnpm download` maintains this itself.**

### Verified before deleting, not after

All 47 version dirs were listed against S3 with `rclone lsf -R` and compared
file by file: **9,856 local files, 0 missing from S3.** Only then were the 30
superseded dirs removed (493M → 246M). The 17 versions the manifest publishes,
and all 19 `latest/` dirs, were kept.

### Self-sustaining, or it is not true

A one-time prune would have been false again after one nightly: the next
promotion adds a version dir and leaves its predecessor. `pruneUnpublished` runs
after each successful download and drops version dirs the manifest no longer
names. It deliberately never touches:

- directories that do not match a version pattern — the legacy v1 flat tree,
  `src/`, `package.json`, `README.md`;
- packages absent from the manifest (icgc, mafviewer), whose artifacts are still
  served but which nothing here knows the retention rule for.

`--no-prune` opts out, e.g. while an old version is fetched for debugging.

### Getting a version back is stronger than the git copy was

`fetch-version.ts` refetches from npm — the same source the original upload came
from — and then compares the result byte-for-byte against what S3 is serving.
Verified on msaview 2.7.0, the version that broke production, immediately after
deleting it: identical to both the git copy and the live bytes.

That is a better guarantee than git provided. Git could only tell you what was
committed; this tells you what users load. npm is the only source that can
enumerate a package's files (S3 serves them but cannot be listed over plain
https), so an unpublished version has to be pulled back by hand — the script
prints the immutable url to curl.

## Consequences

- **`copy` must never become `sync`.** With a pruned `dist/`, a sync would
  delete every superseded version from S3 and break every install and config
  that pinned one — which is most of them, since the store hands out
  version-pinned urls. This is the single most dangerous edit available in this
  repo. Two docs recommending `aws s3 sync` were corrected when this landed.
- Pruning the working tree does not shrink git history (117M compressed). It
  stops the growth; it does not unwind it. No history rewrite was attempted, and
  none should be on a repo several agents share.
- A nightly PR now contains deletions alongside additions. That is the diff
  behaving correctly, not a mistake.
- `check-plugins.ts --bundle dist/<pkg>/<old-version>` needs a
  `node fetch-version.ts <pkg> <version>` first.

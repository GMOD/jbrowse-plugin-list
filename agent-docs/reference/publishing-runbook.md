# Publishing runbook

The rules these steps serve are in the root [CLAUDE.md](../../CLAUDE.md); the
pipeline itself is described in [DEVELOPERS.md](../../DEVELOPERS.md).

## Before uploading

```
pnpm verify       # boots every bundle this run promoted, on v4.0.0..latest
pnpm verify-all   # every plugin, not just the changed ones
pnpm canary       # every plugin, as S3 is serving it right now
```

`pnpm dep` runs `verify` between `update-plugins` and `upload`. Run it by hand
when uploading any other way.

The matrix boots `main` alongside the released hosts, and a break there is
**advisory**: the row is prefixed `ADVISORY`, repeated in a warning, and the run
still exits 0, so a regression on unreleased core never blocks the plugin fix
that answers it. Read an advisory row as the next release's break and raise it
with the plugin or with jbrowse-components. `--versions main` carries the same
flag, so a hand-run against `main` alone exits 0 whatever it finds.

The gate proves a bundle **loads**. It does not prove a track **renders**; that
needs test data and belongs in the plugin's own repo.

An entry that pins several `versions` gets each one booted from its own version
dir, on the hosts that version's `jbrowseRange` names; hosts outside the range
are reported as skipped. `--changed` selects a package when any of its version
dirs moved, not only `latest/`.

`--hybrid` adds the `storePlugin` key a jb2hubs config carries beside its url
([ADR 0008](../architectural-decision-records/0008-configs-name-a-package-installs-name-a-version.md)),
to check the key is inert on hosts nobody can upgrade. Read it as a diff against
the same run without the flag, since old hosts fail either way. Run it when a
host joins `HOST_VERSIONS` in `check-plugins.ts` or jb2hubs names a new entry;
the last measurement is
[2026-08-26-store-plugin-refs-older-clients.md](2026-08-26-store-plugin-refs-older-clients.md).

## After uploading: invalidate, then wait

`upload` writes `latest/` with `no-cache`, which CloudFront still holds and
revalidates, and `plugins.json` with `s-maxage=86400`, which the edge serves
without asking S3 until the next invalidation
([ADR 0010](../architectural-decision-records/0010-the-manifest-is-edge-cached-until-a-publish-invalidates-it.md)).
`pnpm dep` invalidates only when the run committed changes; after an upload that
failed on a rerun with nothing to commit, run `pnpm invalidate` by hand.

While an invalidation is in flight the edge can answer with a partially updated
object, which a browser reports as `Unexpected token ')'` plus
`<PluginGlobal> is undefined`, the same as a bundle throwing while it evaluates.
Wait for `Completed`:

```
aws cloudfront get-invalidation --distribution-id E13LGELJOT4GQO --id <id>
```

then fetch the bundle once by hand and check that its `etag` matches the md5 of
what came back.

## A failed `verify`

`download` copies the newly promoted version into `dist/<pkg>/latest/` before
`verify` runs, so a failure stops the upload but leaves the copy. An existing
version dir is reused rather than re-downloaded, so `pnpm download` copies the
same bad build into `latest/` again. Revert explicitly:

```
git checkout -- dist/<pkg>/latest        # back to the last good promoted build
rm -rf dist/<pkg>/<bad-version>          # only if you want the download retried
```

Then pin `versions` in `plugins.json` to the last good release, or wait for the
plugin's fix release.

## Rolling a plugin back

```json
"versions": [{ "pluginVersion": "2.6.8", "jbrowseRange": "*" }]
```

then `pnpm update-plugins && pnpm verify && pnpm upload && pnpm invalidate`.
That is the store-side lever; `dist/<pkg>/latest/` is the other one, for configs
that name a url. A config that names a plugin by its store `name` moves on the
`versions` pin alone
([ADR 0002](../architectural-decision-records/0002-two-url-shapes-two-rollback-levers.md),
[ADR 0008](../architectural-decision-records/0008-configs-name-a-package-installs-name-a-version.md),
[post-mortem](2026-07-29-msaview-2.7.0-postmortem.md)).

## Keeping a plugin off a range of hosts

For a plugin that should keep tracking npm latest, set an entry-level
`jbrowseRange` (GraphGenomeView: `">=5.0.0"`) rather than pinning `versions`. A
pin freezes the store at the version written into it; `pnpm dep` moves an
entry-level range to each new release with no edit here. Pin `versions` only to
roll back or to serve several versions.

On a host a range excludes, the store card reads "Not compatible" and a config
ref fails with a message naming the supported ranges, without falling back to
the ref's url. A range cannot:

- Bind a host below 5.0.0. Those read the frozen v1 manifest; removal is the
  only lever that reaches them.
- Stop a removed entry's ref from loading its `latest/` fallback. For refs,
  removal is the weaker lever and the range the stronger one, so retiring a
  plugin jb2hubs refs means doing both
  ([ADR 0007](../architectural-decision-records/0007-retire-a-plugin-by-removal-not-by-range.md)
  and its amendment).
- Govern `latest/`. It is the newest pinned version whatever its range says, and
  every url-naming config on a host without ref support loads it.

Write ranges against release versions (`<5.0.0`, `>=5.0.0`); a `5.0.0-beta.N`
host matches them as `5.0.0`.

## Reproducing a past break

```
node fetch-version.ts <packageName> <version>
node check-plugins.ts --only <packageName> \
  --bundle <packageName>=dist/<packageName>/<version> \
  --versions v4.0.0,v4.3.0,latest
```

`fetch-version.ts` is needed first because `dist/` keeps only current versions;
it refetches from npm and verifies the result byte-for-byte against what S3
serves. `--bundle` also accepts a plugin repo's own `dist/`, so a candidate
build can be checked before it is published to npm.

## Facts that shape a change

- `latest/` on S3 is append-only whatever `copyToLatest` does locally, since the
  upload never deletes: a file that leaves a release stays served under
  `latest/`. Protein3d's stale `molstar-chunk-*.js` there are load-bearing by
  accident, for a browser that loaded the entry just before an upload (ADR 0002,
  ADR 0009).
- Downloads from npm are serial on purpose, to avoid hammering the registry.

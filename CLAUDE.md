# jbrowse-plugin-list

Plugin metadata and S3 rehosting for the JBrowse 2 plugin store.

This file is the invariants and the runbook. **Why** any of it is true — with
the measurements behind it — is in
[agent-docs/architectural-decision-records/](agent-docs/architectural-decision-records/).
Don't restate an ADR here; link it.

## Invariants

Breaking any of these is a production incident, not a code-review comment.

1. **`pnpm upload` is live, for everyone, with no staging step.** `latest/` is
   uploaded `no-cache` and named directly by jb2hubs configs sitting at
   permanent urls that published links and old desktop installs keep loading.
   **Verify before uploading, not after.**

   How badly a bad bundle degrades depends on where it is loaded, and the
   blanket "one bad plugin error-pages the session" this used to say stopped
   being true: jbrowse-web loads through `PluginLoader.loadSettled` and opens
   the session without the plugin, with a notification. Three cases still take
   the whole thing down — the RPC worker and every embedded product, which use
   the all-or-nothing `load`, and a bundle that loads and then throws from
   `configure()`, which no loader can catch. Verified in jbrowse-components on
   2026-08-26: `products/jbrowse-web/src/sessionLoaderHelpers.ts`,
   `packages/product-core/src/rpcWorker.ts`,
   `packages/product-core/src/loadPlugins.ts`.
   ([ADR 0002](agent-docs/architectural-decision-records/0002-two-url-shapes-two-rollback-levers.md))

2. **The published `url` must stay version-pinned.** It carries an `integrity`
   hash the browser enforces, so pointing it at `latest/` would invalidate every
   install's hash on the next publish. `url` and every `versions[].url` name a
   version, never `latest/`.

   The one field that does name `latest/` is `latestUrl`, which exists for
   config generators and carries no `integrity` by construction. Nothing
   installs from it. If you find yourself adding a hash to it, the field is
   wrong, not the invariant.
   ([ADR 0001](agent-docs/architectural-decision-records/0001-version-pinned-immutable-artifacts.md),
   [ADR 0008](agent-docs/architectural-decision-records/0008-configs-name-a-package-installs-name-a-version.md))

3. **The upload is `rclone copy`. Never change it to `sync`.** `dist/` holds
   only the current versions; S3 holds every version ever published, and those
   older objects are what installed plugins and saved configs point at. A sync
   would delete them. This is the most dangerous single edit available in this
   repo.
   ([ADR 0005](agent-docs/architectural-decision-records/0005-dist-is-a-staging-area-not-an-archive.md))

4. **A rollback needs both levers.** Rolling back `dist/<pkg>/latest/` fixes
   jb2hubs configs; pinning `versions` in `plugins.json` fixes store installs.
   Pull both, or say explicitly which population you are leaving broken. Only
   one was pulled on 2026-07-29 and the store served the broken bundle for the
   whole window. A config that names a plugin by package rather than by url
   moves on the `versions` pin alone, so this collapses to one lever for exactly
   the configs that have migrated — and for no others.
   ([ADR 0002](agent-docs/architectural-decision-records/0002-two-url-shapes-two-rollback-levers.md),
   [ADR 0008](agent-docs/architectural-decision-records/0008-configs-name-a-package-installs-name-a-version.md),
   [post-mortem](agent-docs/2026-07-29-msaview-2.7.0-postmortem.md))

5. **A store listing must never shrink by accident.** `v2_plugins.json` _is_ the
   store; an entry that vanishes is a plugin nobody can install. The pipeline
   carries forward what it could not rebuild and refuses to publish a manifest
   missing an entry.
   ([ADR 0004](agent-docs/architectural-decision-records/0004-fail-only-when-publishing-would-lose-something.md))

Also: downloads from npm are deliberately serial, to avoid hammering the
registry.

## Runbook

### Before uploading

```
pnpm verify       # boots every bundle this run promoted, on v4.0.0..latest
pnpm verify-all   # every plugin, not just the changed ones
pnpm canary       # every plugin, as S3 is serving it right now
```

`pnpm dep` runs `verify` between `update-plugins` and `upload`, so the normal
path is gated. Run it by hand when uploading any other way.

The gate proves a bundle **loads**. It does not prove a track **renders** — that
needs test data and belongs in the plugin's own repo, and of the 14 plugins here
only msaview and protein3d have any e2e tests at all.

`--hybrid` adds the `storePlugin` key a jb2hubs config carries alongside its url
([ADR 0008](agent-docs/architectural-decision-records/0008-configs-name-a-package-installs-name-a-version.md)),
to check the key is inert on hosts nobody can upgrade. Read it as a diff against
the same run without the flag, never on its own — old hosts fail either way. Run
it when a host joins `HOST_VERSIONS` or jb2hubs names a new entry; last measured
2026-08-26 in
[the older-client measurement](agent-docs/2026-08-26-store-plugin-refs-older-clients.md).

### After uploading, invalidate and then wait

`upload` writes `latest/` and `plugins.json` with `no-cache`, but CloudFront is
still holding the previous objects, so `pnpm invalidate` is part of publishing
rather than an optional extra.

**Nothing should load a page against the store while an invalidation is in
flight.** The edge can answer with a partially updated object, and a browser
reports that as `Unexpected token ')'` plus `<PluginGlobal> is undefined`, which
is exactly what a bundle throwing while it evaluates looks like (invariant 1).
So the first thing to do with that failure is not to believe it. Wait for
`Completed`:

```
aws cloudfront get-invalidation --distribution-id E13LGELJOT4GQO --id <id>
```

then fetch the bundle once by hand and check that its `etag` matches the md5 of
what came back. The second run loads fine.

### A failed `verify` leaves the bad bundle in the working tree

`download` copies the newly promoted version into `dist/<pkg>/latest/` _before_
`verify` runs, so a failure stops the upload but does not undo the copy.
Re-running `pnpm download` will not fix it either: an existing version dir is
reused rather than re-downloaded, so `buildVersion` skips it and copies the same
bad build into `latest/` again. Revert explicitly:

```
git checkout -- dist/<pkg>/latest        # back to the last good promoted build
rm -rf dist/<pkg>/<bad-version>          # only if you want the download retried
```

Then pin `versions` in `plugins.json` to the last good release, or wait for the
plugin's fix release.

### Rolling a plugin back

```json
"versions": [{ "pluginVersion": "2.6.8", "jbrowseRange": "*" }]
```

then `pnpm update-plugins && pnpm verify && pnpm upload`. That is the store-side
lever; see invariant 4 for the other one.

### Reproducing a past break

```
node fetch-version.ts <packageName> <version>
node check-plugins.ts --only <packageName> \
  --bundle <packageName>=dist/<packageName>/<version> \
  --versions v4.0.0,v4.3.0,latest
```

`fetch-version.ts` is needed first because `dist/` keeps only current versions.
`--bundle` also accepts a plugin repo's own `dist/`, so a candidate build can be
checked before it is published to npm at all.

### Getting an old version back

```
node fetch-version.ts jbrowse-plugin-msaview 2.7.0
```

Refetches from npm and verifies the result byte-for-byte against what S3 serves.

## Current state worth knowing

Point-in-time, checked 2026-08-26 — re-check rather than trust:

- **`plugins.json` lists 14 plugins**, not the 17 several ADRs measured on
  2026-08-06. Those numbers are dated records and are left as written; anything
  here that reads as current says 14.
- **No entry in `plugins.json` declares `versions`**, so all 14 get a single
  auto-generated version at `jbrowseRange: "*"` and the range apparatus has no
  live users _here_. A config naming a plugin by package is what gives it some
  ([ADR 0008](agent-docs/architectural-decision-records/0008-configs-name-a-package-installs-name-a-version.md)),
  and it remains the right tool for rollback and retirement
  ([ADR 0007](agent-docs/architectural-decision-records/0007-retire-a-plugin-by-removal-not-by-range.md)).
- **genark is no longer on the v1 flat path — this is fixed.** Twenty deployed
  `hubs/genark/GC[AF]/...` configs sampled at random name `latest/` for all four
  plugins, as UCSC already did, and every one of the 52,086 in the jb2hubs
  working tree agrees. Read the _deployed_ `config.json` to check this, never
  the jb2hubs working tree alone — those files lag deployment and gave the wrong
  answer once already.
  ([ADR 0002](agent-docs/architectural-decision-records/0002-two-url-shapes-two-rollback-levers.md))
- **`latest/` on S3 is append-only, whatever `copyToLatest` does locally.** The
  upload is `rclone copy` (invariant 3), so a file that leaves a release stays
  served under `latest/` forever.
  `s3:jbrowse.org/plugins/jbrowse-plugin-protein3d/latest/dist/` holds four
  `molstar-chunk-*.js` and their maps. Benign, and load-bearing by accident: a
  browser that loaded the umd entry just before an upload lazy-loads its sidecar
  after it, and the stale chunk is what answers. Also ~50MB of orphans in one
  prefix, most of it `.js.map`.

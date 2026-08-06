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
   permanent urls that published links and old desktop installs keep loading. A
   bundle that throws while loading doesn't degrade — `PluginLoader` runs
   `Promise.all`, so the whole session becomes an error page. **Verify before
   uploading, not after.**
   ([ADR 0002](agent-docs/architectural-decision-records/0002-two-url-shapes-two-rollback-levers.md))

2. **The published `url` must stay version-pinned.** It carries an `integrity`
   hash the browser enforces, so pointing it at `latest/` would invalidate every
   install's hash on the next publish. `latest/` must never appear in
   `v2_plugins.json`.
   ([ADR 0001](agent-docs/architectural-decision-records/0001-version-pinned-immutable-artifacts.md))

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
   whole window.
   ([ADR 0002](agent-docs/architectural-decision-records/0002-two-url-shapes-two-rollback-levers.md),
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
needs test data and belongs in the plugin's own repo, and of the 17 plugins here
only msaview and protein3d have any e2e tests at all.

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

Point-in-time, checked 2026-08-06 — re-check rather than trust:

- **No entry in `plugins.json` declares `versions`**, so all 17 get a single
  auto-generated version at `jbrowseRange: "*"` and the range apparatus has zero
  live users. It is still the right tool for rollback and retirement
  ([ADR 0007](agent-docs/architectural-decision-records/0007-retire-a-plugin-by-removal-not-by-range.md)).
- **genark configs still name the superseded v1 flat path**; UCSC has moved to
  `latest/`. jb2hubs' generator already emits `latest/`, so regenerating genark
  is the whole remaining fix — no code change anywhere. All four frozen flat
  bundles still booted on v4.0.0..latest when last measured, so this is latent,
  not live. Read the _deployed_ `config.json` to check this, never the jb2hubs
  working tree — those files lag deployment and gave the wrong answer once
  already.
  ([ADR 0002](agent-docs/architectural-decision-records/0002-two-url-shapes-two-rollback-levers.md))

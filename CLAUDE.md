# jbrowse-plugin-list

Plugin metadata and S3 rehosting for the JBrowse 2 plugin store.

## Notes

- Downloads from NPM are intentionally serial to avoid hammering registry
  servers

## `dist/` is a staging area, not the archive

S3 is the system of record. Every version this repo has ever published is still
there, immutably, and **`pnpm upload` is `rclone copy`, which never deletes** —
so what `dist/` contains only decides what gets _added_.

`dist/` therefore keeps just what an upload needs:

- each plugin's `latest/`, and
- every version the build manifest names — normally one per plugin, or all of
  them for a plugin pinning explicit `versions`.

**`pnpm download` maintains this itself**, deleting each superseded version dir
once the new one is in place, so the rule stays true instead of decaying after
one nightly. It never touches the legacy v1 flat tree or a package that is no
longer in `plugins.json` (icgc, mafviewer), since nothing in the pipeline knows
what those should keep. `--no-prune` opts out, e.g. while you have an old
version fetched for debugging.

The initial prune was 2026-08-06: 493M → 246M, 30 dirs, after confirming all
9,856 files were already on S3. Those versions are still published and still
installable; git simply stopped keeping a second copy of immutable public
artifacts. Get one back with `node fetch-version.ts <packageName> <version>`,
which refetches from npm and then checks the result byte-for-byte against what
S3 is serving — a stronger guarantee than the git copy gave, since it verifies
what users actually load rather than what someone committed.

**The landmine:** this is only safe because the upload is `copy`. If anyone ever
changes it to `rclone sync`, the next upload would delete every pruned version
from S3 and break every install and config that pinned one — which is most of
them, since the store hands out version-pinned urls. Do not change that verb.

## `pnpm upload` is a live change to configs already in the wild

`latest/` is uploaded `Cache-Control: no-cache`, and the jb2hubs configs
(`jbrowse.org/ucsc/*`, `jbrowse.org/hubs/genark/*`) name those `latest/` urls.
Those configs sit at permanent urls that published links and old desktop
installs keep loading. So `pnpm upload` republishes **every** plugin's `latest/`
at once and takes effect immediately, for everyone, with no staging step.

A plugin whose bundle throws while loading doesn't degrade — `PluginLoader` runs
`Promise.all`, so the whole session becomes an error page.

### genark configs still name the v1 flat path; UCSC has moved to `latest/`

Checked against **deployed** configs on 2026-08-06 (not the working tree — the
local `ucsc2jbrowse/configs*` files lag deployment and reading them gives the
wrong answer):

| surface                         | names                          | regenerated |
| ------------------------------- | ------------------------------ | ----------- |
| `jbrowse.org/ucsc/hg38`, `hg19` | `/plugins/<pkg>/latest/dist/…` | 2026-08-05  |
| `jbrowse.org/hubs/genark/**`    | `/plugins/<pkg>/dist/…` (v1)   | 2026-07-22  |

jb2hubs' `hubtools/src/enhanceConfig.ts` already names `latest/` for all four
plugins and says so in a comment — "Never name the bare path here." So the
generator is correct and the intent is settled; genark is simply stale output
that predates the fix. **Regenerating genark is the whole remaining fix — no
code change is needed anywhere.**

The v1 flat layout is no longer written by this repo's build either
(`dist/<pkg>/dist/` is a leftover extraction that nothing regenerates), but
`rclone copy` never deletes, so S3 keeps serving it. It is how protein3d served
0.4.1 against a published 0.8.0, and jb2hubs' `checkPluginUrls.mjs` flags it
(`isLegacy`).

Two consequences worth holding onto:

- **`pnpm verify` does not cover the flat path.** `check-plugins.ts` boots
  `latest/` only. Those bundles are frozen, so an upload cannot regress them —
  but it also cannot fix them, and nothing here watches them. As of 2026-08-06
  all four still boot on v4.0.0..latest; the risk is a future JBrowse release,
  not a present failure.
- **Retiring the flat layout is a jb2hubs change, not one here.** Deleting
  `dist/<pkg>/dist/` locally would not unpublish anything.

**Verify before uploading**, not after:

```
pnpm verify   # boots every bundle this run promoted, on v4.0.0..latest
```

`pnpm dep` already runs this between `update-plugins` and `upload`, so the
normal path is gated. Run it by hand when uploading any other way.
`pnpm verify-all` checks every plugin, not just the changed ones; `pnpm canary`
checks what S3 is serving right now.

The gate only knows about hosts, not about data. A plugin whose _track_ renders
wrong still needs its own repo's e2e tests — of the 17 plugins here, only
msaview and protein3d have any.

### A failed `verify` leaves the bad bundle in the working tree

`download` copies the newly promoted version into `dist/<pkg>/latest/` _before_
`verify` runs, so a failure stops the upload but does not undo the copy.
Re-running `pnpm download` will not fix it either: an existing version dir is
reused rather than re-downloaded, so `buildVersion` sees `dist/<pkg>/<version>/`
already there, skips the download, and copies the same bad build into `latest/`
again. Revert explicitly:

```
git checkout -- dist/<pkg>/latest        # back to the last good promoted build
rm -rf dist/<pkg>/<bad-version>          # only if you want the download retried
```

Then pin `versions` in plugins.json to the last good release, or wait for the
plugin's fix release.

### What broke on 2026-07-29, and what to check instead of pinning

msaview 2.7.0 error-paged every `jbrowse.org/ucsc` launch on v4.0.0 through
latest, and promoting it here is what shipped that. `latest/` was pinned back to
2.6.8 for a few hours; 2.7.1 fixes it and no pin remains.

Two causes, both from a plugin built against an unreleased MUI-v9
`@jbrowse/core`:

- `@mui/material/SvgIcon` was externalized, but its exported **shape** differs
  by MUI major. Released hosts expose it as the SvgIcon component (`$$typeof`,
  `render`, `displayName`); MUI 9 also hangs `createSvgIcon` off it, which
  `@mui/icons-material` v9 calls. So a key-presence check sees nothing wrong --
  the key is there on every host. Fixed by bundling that module in the plugin.
- `types.stripDefault` exists only in the mobx-state-tree that ships with
  unreleased core. react-msaview 5.6.3 degrades to `types.optional` where
  absent.

The lesson is not "pin things." It is that **shape, not presence, is what
varies**, so the only reliable check boots the bundle on a real host. That is
what `check-plugins.ts` does, and it reproduces this exact break:

```
node fetch-version.ts jbrowse-plugin-msaview 2.7.0
node check-plugins.ts --only jbrowse-plugin-msaview \
  --bundle jbrowse-plugin-msaview=dist/jbrowse-plugin-msaview/2.7.0 \
  --versions v4.0.0,v4.3.0,latest
# v4.0.0  FATAL ... JBrowsePluginMsaView is undefined
```

`--bundle` also points at a plugin repo's own `dist/`, so a candidate build can
be checked before it is published to npm at all.

For a break that only shows up with real config content (an unknown track type,
a plugin's menu contribution), jb2hubs' `checkConfigCompat.mjs` boots the actual
shipped configs and takes the same `--plugin Name=path` override. This repo's
checker deliberately uses an empty config so a failure names one bundle.

### ICGC was dropped, and `jbrowseRange` now has no live user

`jbrowse-plugin-icgc` 1.0.2 (Oct 2022, `@jbrowse/core: ^1.5.0`) externalizes
`@material-ui/core` — MUI **v4**, which no host since JBrowse 2 has provided. It
error-paged on v4.0.0 through latest for years, and npm `latest` is still 1.0.2,
so no fix was coming.

It was first pinned to `jbrowseRange: "<2.0.0"` so range-aware clients would
stop offering it, then removed from `plugins.json` outright in c5ec0d5 — because
the range only helps clients that read it, and the manifest's top-level `url`
fallback still pointed at the broken bundle for everyone else. `dist/` still
holds the artifacts (`rclone copy` never deletes, so S3 serves them either way);
only the store listing changed.

The consequence worth knowing: **as of 2026-08-06 no entry in `plugins.json`
declares `versions` at all**, so every one of the 17 gets a single
auto-generated version at `jbrowseRange: "*"`. The whole range apparatus —
`assertValidRange` here, `rangeMatches`/`supportedRanges`/`compatible` in core,
the `outOfRange` skip in `check-plugins.ts` — currently has zero live users.
Keep it, since it is the honest way to retire a plugin, but do not mistake it
for the thing that keeps the store working. What actually catches breakage is
booting the bundle (`pnpm verify`): a range is a promise the author wrote down,
the checker is a fact.

What `versions` _does_ still earn its keep for is version-pinned install urls —
`installedVersionFromUrl` in core recovers the installed version from the
`/<packageName>/<version>/` path segment, which is what powers the "update
available" affordance. That, and SRI: the published `url` must be immutable or
its `integrity` hash goes stale on the next publish and every install fails.

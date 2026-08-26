# Is `storePlugin` inert on hosts nobody can upgrade? (2026-08-26)

[ADR 0008](architectural-decision-records/0008-configs-name-a-package-installs-name-a-version.md)
lets a jb2hubs config emit `{ name, url, storePlugin }` — the ref for a JBrowse
that resolves it, the `latest/` url for one that does not. The whole migration
rests on the second half: an old host must ignore the key it does not know and
load the url exactly as it does today.

That is a claim about someone else's released code, running in browsers this
repo will never touch again, against ~52k configs at permanent urls. So it is
measured, and `check-plugins.ts --hybrid` is the standing gate.

## What was measured

**Boot matrix, paired.** Three plugins (`msaview`, `protein3d`,
`@cmdcolin/jbrowse-plugin-hubs` — the three jb2hubs names a package for) against
seven hosts (`v2.1.0`, `v3.0.0`, `v3.7.0`, `v4.0.0`, `v4.2.0`, `v4.3.0`,
`latest`), bundles as S3 serves them, run twice:

```
node check-plugins.ts --published --versions v2.1.0,v3.0.0,v3.7.0,v4.0.0,v4.2.0,v4.3.0,latest --json control.json
node check-plugins.ts --published --hybrid --versions ... --json hybrid.json
```

All 21 rows identical — settled, UMD global defined, fatal text, page errors.
Not "both passed": the two old hosts fail in both runs, and they fail the same
way, character for character.

**Cross-origin trust gate, paired.** The same config served from another origin,
which is the one path on a released host that inspects a plugin _definition_
rather than dispatching on its url, on six hosts `v3.0.0..latest`. Identical in
every case: warning dialog below v4.0.0, clean load from v4.0.0 up (below).

## Why it holds, in the released source

Reading, to say _why_ the measurement came out that way — the measurement is
what settles it.

- **Nothing validates the shape.** The config model holds
  `plugins: types.array(types.frozen<PluginDefinition>())` unchanged from
  `v2.0.0` through `v4.3.0` and `main`. `frozen`'s type argument is compile-time
  only; no runtime subtype is passed, so an extra key is carried through as-is.
- **The loader dispatches on key presence, first match wins.** `loadPlugin`
  tests `cjsUrl`, then `esmUrl`/`esmLoc`, then `url`/`umdUrl`/`umdLoc`, and the
  same four branches are there in `v2.0.0` and in `v4.3.0`. While `url` is
  present the definition is a UMD one, and the `Could not determine plugin type`
  throw is unreachable.
- **Every trust gate compares urls, never definitions.** `v2.x`/`v3.x` require
  an exact url match against the v1 store manifest; `v4.0.0`+ checks
  `TRUSTED_PLUGIN_URL_PREFIXES` (`https://jbrowse.org/plugins/`) first and only
  then the manifest. No version compares structurally or counts keys.
- **`addRelativeUris` only touches keys named `uri`.** `storePlugin` is a plain
  string, so the rewrite walks past it.

## The floor is set by the bundles, not by the config shape

`storePlugin` cannot lower a floor that already sits above it:

| host      | msaview                          | protein3d     | hubs          |
| --------- | -------------------------------- | ------------- | ------------- |
| `v2.1.0`  | error page                       | error page    | never settles |
| `v3.0.0`  | `JBrowsePluginMsaView` undefined | never settles | never settles |
| `v3.7.0`+ | loads                            | loads         | loads         |

A modern bundle built against modern ReExports cannot run on v2 core at all —
`(0, tl.jsx) is not a function`, from a real deployed config, not the harness's
synthetic one. Adding a key to a config that already error-pages changes
nothing.

This corrects `check-plugins.ts`'s own note that "v2/v3 cannot load these
bundles at all": `v3.7.0` loads all three cleanly. `v3.0.0` is the highest host
that does not.

## Side finding, pre-existing and unchanged

A jb2hubs config loaded **cross-origin** — a self-hosted or embedded JBrowse
pointed at `jbrowse.org/ucsc/hg38/config.json` — is triaged with "this link
contains a cross origin config that has the following unknown plugins" on every
host below `v4.0.0`. Those versions demand an exact url match against
`plugin-store/plugins.json`, which lists version-pinned urls, and jb2hubs names
`latest/`. `v4.0.0` added the `https://jbrowse.org/plugins/` trusted prefix,
which is what makes it load.

Nothing here caused that and nothing here changes it — both columns of the
paired run hit it identically. It is worth knowing because it is the only place
in released code where a plugin definition is examined rather than dispatched
on, and because same-origin (`jbrowse.org/code/jb2/*` reading a `jbrowse.org`
config, which is how these are actually opened) never reaches it.

## The other half: replacing the whole entry

`enhanceConfig`'s upsert now assigns the whole entry rather than `existing.url`,
which is what lets a re-run add `storePlugin` to a config it wrote earlier. It
also drops anything else an existing entry carried, so: every plugin entry in
every config jb2hubs holds on disk is exactly `{ name, url }` — 208,344 entries
across 52,086 genark `config.json`, 956 across 239 `ucsc2jbrowse/configs`. There
is nothing to drop.

## Re-run this when

- a host is added to `HOST_VERSIONS`
- jb2hubs names a package it did not name before
- anything changes about which key a config carries alongside the url

A row that differs between the two runs means the key is not inert on that host,
and jb2hubs must not emit it until that host is out of the wild.

# Handoff — configs naming plugins by package (2026-08-26)

Design and reasoning:
[ADR 0008](architectural-decision-records/0008-configs-name-a-package-installs-name-a-version.md).
This file is only what is done, what is not, and where the work sits.

## Where the branches are

Neither has landed. Both are worktrees on a `store-refs` branch.

| repo                  | worktree                       | commit                                                        |
| --------------------- | ------------------------------ | ------------------------------------------------------------- |
| `jbrowse-plugin-list` | `.claude/worktrees/store-refs` | `21524b0` manifest `latestUrl` + ADR 0008 + three corrections |
| `jbrowse-components`  | `.claude/worktrees/store-refs` | `7fafe18de4` the resolver and its four seams                  |
| `jb2hubs`             | —                              | **not started**                                               |

## Done — jbrowse-components (`7fafe18de4`)

`{ storePlugin: 'jbrowse-plugin-msaview' }` in a config's `plugins[]` resolves
against the published manifest at load time into the version-pinned,
integrity-carrying definition for the running JBrowse.

- `pluginDefinitions.ts` — `StorePluginDefinition`, `isStorePluginDefinition`,
  `storePluginPackage`; `samePlugin` matches on the package first (the only
  identity key that survives resolution); `pluginDescriptionString` names an
  unresolved ref by package.
- `util/pluginStore.ts` — `resolveStoreRefs` (pure) and `resolveStorePluginRefs`
  (fetches, and only when a ref is present).
- `checkPlugins.ts` — a bare ref is trusted by construction; a ref carrying a
  fallback url is judged on that url, so the gate never vets one thing and runs
  another.
- Four seams call resolution immediately before `dropVendoredPlugins`:
  jbrowse-web `sessionLoaderHelpers.ts`, desktop `pluginManagers.tsx`,
  `product-core/loadPlugins.ts` (the three embedded products, each passing its
  own `version`). Web and desktop report an unresolvable ref alongside load
  failures; the embedded path throws, matching its all-or-nothing `load`.

`pnpm typecheck` clean; 45 core + 8 product-core + 22 suites of existing plugin
tests pass.

**The pre-commit hook is red, and it was red before this branch** — it says so
itself: stale generated artifacts since `47993f0c1a`, four commits back. Run
`pnpm autogen` on main, not here.

## Done — jbrowse-plugin-list (`21524b0`)

`latestUrl` per manifest entry, plus ADR 0008 and three corrections to docs that
had gone wrong (invariant 1's error-page claim, genark's v1 path, ADR 0002's
stale-siblings claim). Details in the commit message.

`build-manifest.json` is gitignored, so a fresh worktree needs it copied from
the primary checkout before `node generate-plugins.ts` will run.

## Done — jb2hubs (`ae571200689`)

`hubtools/src/enhanceConfig.ts` emits `storePlugin` alongside the existing
`latest/` url for the three plugins the store lists (`msaview`, `protein3d`,
`@cmdcolin/jbrowse-plugin-hubs`). MafViewer names no package — core vendors it,
so it was removed from `plugins.json` and a ref to it cannot resolve; BLAT is
deliberately not in the store either.

Three follow-on fixes that the ref field exposed:

- the upsert assigned `existing.url` and nothing else, so an already-enhanced
  config — which is most of the tree, since `enhanceConfigs.sh` re-runs over its
  own output — would never have gained `storePlugin` no matter how often it ran.
  It now assigns the whole entry.
- `mergePlugins` picked "canonical" by a boolean `/latest/dist/` test, which a
  ref and a bare `latest/` entry both pass, so whichever was seen first kept the
  slot. Ranked now: ref > `latest/` > frozen.
- `scripts/checkPluginUrls.mjs` asserts every ref is in the published manifest,
  that the store's UMD name agrees with the config's, and that the fallback url
  equals the store's `latestUrl`. Each failure demotes a ref to its fallback
  with nothing else noticing.

### Measured, rather than argued

The migration shape only works if an old host ignores the key and loads the url.
That is now measured — paired boot matrix over `v2.1.0..latest`, plus the
cross-origin trust gate, all rows identical with and without the key — in
[the older-client measurement](2026-08-26-store-plugin-refs-older-clients.md).
`check-plugins.ts --hybrid` is the gate that keeps it measured. The same doc
records that the floor these configs already sit on is `v3.7.0`, set by the
bundles rather than by the config shape, and that every plugin entry jb2hubs
holds on disk is exactly `{ name, url }` — so replacing the whole entry drops
nothing.

**The ref check is inert until two things happen**: no config on disk names a
package yet (it takes a regeneration), and the deployed manifest has no
`latestUrl` yet (it takes an upload from jbrowse-plugin-list). The url half of
the check is guarded on `entry.latestUrl`, so it skips rather than false-fails
in the meantime.

`tsc --noEmit` is clean apart from four pre-existing `website/` errors that need
`astro sync`; `oxlint` clean; 16 enhanceConfig + 7 mergeAll tests pass.

## Order of operations, when landing

1. **jbrowse-plugin-list** — upload, so the manifest carries `latestUrl`.
2. **jbrowse-components** — release, so hosts resolve refs. Until this ships,
   every config that names one loads from the fallback url, exactly as today.
3. **jb2hubs** — regenerate, so configs carry the refs.

Any order actually works, which is the point of the fallback: a ref no host
understands and a manifest field nothing reads are both inert. But nothing is
gained until all three have happened.

## Watch for

- **Ordering is load-bearing.** `dropVendoredPlugins` matches on the UMD name a
  ref does not carry until the manifest supplies it, so resolution must run
  first. Pinned by tests in `pluginDefinitions.test.ts` and
  `product-core/loadPlugins.test.ts`; don't move a seam without them.
- **Resolve once.** The worker gets `pluginManager.runtimePluginDefinitions`,
  which are post-resolution, so main thread and worker cannot land on different
  builds of one plugin. Resolving a second time anywhere would reintroduce that.
- **A ref only names a store plugin.** Retiring a plugin (ADR 0007) now also
  breaks any config that refs it; the fallback url is what keeps such a config
  working, which is an argument for keeping the fallback around longer than it
  looks like it is needed.

## Not attempted, and worth doing

Deriving `jbrowseRange` from the boot matrix rather than from a declaration.
`check-plugins.ts` already boots every promoted bundle across `v4.0.0..latest`,
which is a measured compatibility set, and it currently throws that measurement
away and exits 1 on any host failure — so a plugin that legitimately drops
v4.0.0 support jams the whole pipeline until someone hand-writes a narrowed pin.
Refs are what would make a measured range do something: an old host and a new
one loading the same genark config could be served different builds.

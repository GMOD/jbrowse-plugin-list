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

## Not done — jb2hubs

This is the whole point of the change and none of it is written.

1. `hubtools/src/enhanceConfig.ts` — add `storePlugin` to the three entries the
   store actually lists: `jbrowse-plugin-msaview`, `jbrowse-plugin-protein3d`,
   `@cmdcolin/jbrowse-plugin-hubs`. **Keep the `url` alongside it**: that is the
   migration shape, and it is what every already-released host loads from. It is
   safe to emit today — `plugins` is `types.array(types.frozen())`, so an
   unknown key passes validation on every released JBrowse.
2. **MafViewer stays url-only.** It is not in `plugins.json` — core vendors it
   now — so a ref to it cannot resolve. Same for BLAT, which is deliberately not
   in the store.
3. The upsert loop in `enhanceConfig` writes `existing.url = plugin.url` and
   nothing else, so a re-run over an already-enhanced config would never add
   `storePlugin`. Assign the whole entry.
4. `scripts/checkPluginUrls.mjs` — assert every `storePlugin` a config names is
   in `plugin-store/v2/plugins.json`, and every fallback url equals that entry's
   `latestUrl`. That replaces the `isLegacy`/`isOffStore` regexes with set
   membership against what the store actually publishes.

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

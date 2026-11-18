---
name: publish-each-versions-registry-reads
description:
  Write the `JBrowseExports` keys each published bundle reads into its
  `versions[]` entry, beside `integrity`, so jbrowse-web loads only those
  modules from the store's word instead of scanning the bundle's text.
---

# Publish each version's registry reads

jbrowse-components ADR-274 has jbrowse-web publish only the `JBrowseExports`
keys a plugin's bundle reads. The host learns them by fetching the UMD
bundle's text and scanning it for literal reads
(`packages/core/src/ReExports/reExportKeysRead.ts`), falling back to the whole
registry when it cannot tell. On the volvox demo that took the page from 1087
to 753 KB gzipped.

The scan is the weak half:

- It infers from minified bytes a list the plugin's build tool knew exactly.
- It needs a CORS fetch of the bundle before it runs, plus a `crossOrigin`
  script to make the second request a cache hit on hosts that send
  `Vary: Origin`. That fetch is also the round trip a plugin reading many keys
  pays at high latency (about 90 ms at 150 ms per response, for TView).
- ESM bundles get the whole registry, because their chunks can read keys
  later. That covers MsaView, Protein3d and GraphGenomeView.

This repo already holds every published bundle's bytes in `dist/`, and it
already computes a per-version fact from them: `integrity`, in
`download-plugins-npm-api.ts`.

## The change

- **Compute `reads` beside `integrity`.** Take the bundle plus every file in
  its package's `dist/`, so an ESM entry's chunks count. Collect the literal
  `JBrowseExports` keys with the same rule as `reExportKeysRead`. A bundle
  that reads the registry any other way (a computed key, an alias,
  `jbrequire`) gets no `reads` field, meaning "load everything".
- **Carry it through** `build-manifest.json` and `generate-plugins.ts` into
  each `versions[]` entry of `v2_plugins.json`, and into the top-level
  `url` fallback's fields.
- **Gate it in `pnpm verify`:** fail if a bundle's computed `reads` names a
  key the current host's `ReExports/list` does not serve.

## The host side, in jbrowse-components

- `resolveStorePluginRefs` (`packages/core/src/util/pluginStore.ts`) copies
  `reads` onto the definition it resolves, as it copies `integrity`. The
  plugin store's install also writes it into the definition it saves.
- `PluginLoader.loadSettled` uses a definition's `reads` when every definition
  has one, which skips the text fetch. It scans as now otherwise, for a raw
  URL in a config, and falls back to the whole registry as now.
- With `reads` in hand before the bundle is fetched, `index.html`'s early
  script can preload the read keys' chunks, provided a key-to-chunk map is
  published. That would remove the high-latency cost entirely.

## Things to check first

- **A bundle loading a second script at runtime.** If it reads keys the first
  file never mentions, both the scan and this field miss them. Grep `dist/` for
  `importScripts`, `document.createElement('script')` and dynamic `import(`
  of non-chunk URLs.
- **Older hosts.** `reads` is an extra field on `versions[]`, so it is safe for
  older hosts only if the v5 manifest reader ignores unknown fields. Confirm
  that before the first upload, since `v2_plugins.json` reaches every v5 host
  (ADR 0007).

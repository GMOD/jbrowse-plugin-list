# ADR 0002 — `latest/` serves configs, pinned urls serve installs, and a rollback needs both

- **Status:** Accepted
- **Date:** 2026-08-06
- **Affected:** `download-plugins-npm-api.ts` (`copyToLatest`), the `upload`
  script's two-pass header split, `plugins.json` `versions`, and every jb2hubs
  config naming a `plugins[].url`

## Context

Two populations load these bundles, and they need opposite things.

**Installs from the plugin store** need a url whose bytes never change — a saved
session must keep working, and the `integrity` hash must stay valid (ADR 0001).

**Configs we do not control** need the opposite. `jbrowse.org/ucsc/hg38` and the
~50k genark configs sit at permanent urls that published links and old desktop
installs keep loading. They carry no integrity hash, and there is no way to
revisit them when a plugin releases. If they named a pinned version they would
be frozen at whatever was current the day they were generated — which is exactly
what went wrong before: they served protein3d 0.4.1 against a published 0.8.0.

## Decision

**Publish both shapes and give them different cache semantics.**

| path                              | mutability                | cache-control                 | named by           |
| --------------------------------- | ------------------------- | ----------------------------- | ------------------ |
| `/plugins/<pkg>/<version>/dist/…` | written once, never again | `max-age=31536000, immutable` | the store manifest |
| `/plugins/<pkg>/latest/dist/…`    | rewritten every promotion | `no-cache, must-revalidate`   | jb2hubs configs    |

`copyToLatest` rebuilds `latest/` from scratch each run rather than copying over
it, so a release with fewer files cannot leave stale siblings behind. The whole
prefix moves together, which is what lets a code-split plugin (protein3d
lazy-loads a molstar chunk) keep its bundle and sidecars a matched set.

### The consequence that is easy to miss

Because `latest/` is `no-cache` and named from permanent config urls,
**`pnpm upload` is a live change with no staging step**. It republishes every
plugin's `latest/` at once, and it reaches every already-published config
immediately. That is why the pre-upload boot gate exists (ADR 0004) and why it
runs _before_ the upload rather than after.

### A rollback needs both levers, and in the one real incident only one was pulled

On 2026-07-29 msaview 2.7.0 error-paged every `jbrowse.org/ucsc` launch on
v4.0.0 through latest. The fix, `ebc8eb7`, changed 12 files — all of them under
`dist/jbrowse-plugin-msaview/latest/` — rolling `latest/` back to 2.6.8. It
touched neither `plugins.json` nor the manifest.

That fixed the configs. It did **not** fix the store:

| lever                                   | population covered     | pulled on 2026-07-29 |
| --------------------------------------- | ---------------------- | -------------------- |
| roll back `dist/<pkg>/latest/`          | jb2hubs configs (~50k) | yes                  |
| pin `versions` in `plugins.json`, regen | plugin-store installs  | **no**               |

Checked directly: at `ebc8eb7` the published manifest still offered msaview
**2.7.0**, and only at `f29ec33` did it move to 2.7.1. So for the whole window,
anyone clicking _Install_ in the plugin store received the bundle that
error-pages.

**Both levers are required for a full rollback.** The `versions` pin in
`plugins.json` is the store-side one:

```json
"versions": [{ "pluginVersion": "2.6.8", "jbrowseRange": "*" }]
```

then `pnpm update-plugins && pnpm verify && pnpm upload`.

This is also the answer to whether `versions` is worth maintaining. Its only
other use ever was ICGC (added in `a04fcb6`, removed with the plugin in
`c5ec0d5`, about five days), which makes it look dead — but it is not unused
because it is useless. It is unused because in the one emergency where it was
the right tool, nobody reached for it.

## Consequences

- The store and the configs can disagree about which version is current, and
  during an incident they will unless both levers are pulled.
- `latest/` cannot carry an integrity hash, so config-named bundles are not
  SRI-verified. Accepted: the alternative is freezing them.
- The v1 flat layout `/plugins/<pkg>/dist/…` is a third, superseded shape that
  nothing regenerates but S3 still serves — `dist/<pkg>/dist/` here is a
  leftover extraction. jb2hubs' `scripts/checkPluginUrls.mjs` flags any config
  naming it (`isLegacy`), and `hubtools/src/enhanceConfig.ts` already emits
  `latest/` for all four plugins with the reason in a comment: _"Never name the
  bare path here."_ As of 2026-08-06 UCSC has moved off it and genark has not,
  so regenerating genark is the whole remaining fix. Measured the same day: all
  four frozen flat bundles still boot on v4.0.0..latest, so this is a latent
  risk rather than a live failure.
- Do not read the jb2hubs working tree to answer "which shape do configs name?"
  — those files lag deployment and gave the wrong answer once already. Fetch the
  deployed `config.json`.

# ADR 0001 — Publish version-pinned immutable urls, never `latest/`, in the store manifest

- **Status:** Accepted
- **Date:** 2026-08-06
- **Affected:** `manifest-types.ts`, `download-plugins-npm-api.ts`,
  `generate-plugins.ts`, `v2_plugins.json`, and in jbrowse-components
  `packages/core/src/PluginLoader.ts`, `packages/core/src/util/pluginStore.ts`

## Context

`plugins.json` (the hand-edited source) names no version at all: with no
`versions` array on an entry, the download step tracks npm's `dist-tags.latest`.
`v2_plugins.json` (the published store manifest) names a concrete one:

```
https://jbrowse.org/plugins/jbrowse-plugin-msaview/2.7.4/dist/…umd…js
```

That asymmetry looks like an inconsistency worth removing — if the source tracks
"latest", why doesn't the output just say `latest/`? A `latest/` path exists and
is served (ADR 0002), so the substitution is mechanically possible.

It is not possible, for a reason that has nothing to do with taste.

## Decision

**The published `url` is always version-pinned and immutable. `latest/` must
never appear in `v2_plugins.json`.**

### Subresource integrity forces it

Every manifest entry carries an `integrity` hash computed from the exact bytes
at that url. The consumer enforces it — this is not decorative:

```ts
// packages/core/src/PluginLoader.ts
if (integrity) {
  script.integrity = integrity
  script.crossOrigin = 'anonymous' // required for the browser to enforce SRI
}
```

and the same file skips its cache-buster when a hash is present, because an
integrity-bearing url is assumed immutable:

```ts
def.integrity ? parsedUrl.href : addCacheBuster(parsedUrl.href)
```

So pointing `url` at `latest/` would leave the hash describing the _previous_
build the moment any plugin publishes. The browser would then refuse the script
— and since `PluginLoader` runs `Promise.all` over the plugin list, one refusal
turns the whole session into an error page. Every install of that plugin,
everywhere, would break on the next publish. The only alternative would be
dropping `integrity`, which trades a verified supply chain for cosmetic
consistency.

### Two things ride along, and are worth keeping deliberately

- **An install never changes underneath a saved session.** This is the property
  the pre-v2 scheme lacked, when re-syncing `latest` silently overwrote the
  bundle at a stable url.
- **"Update available" is possible at all.** `installedVersionFromUrl` recovers
  what a user installed by reading the path segment after the package name —
  authoritative, unlike a plugin's self-declared version. `getPluginUpdate` then
  compares it against `versions[]` from the manifest. Neither works without a
  version in the url.

### `versions[]` in the published manifest stays, even at length 1

As of 2026-08-06 every one of the 17 entries has exactly one version at
`jbrowseRange: "*"`, which makes `versions[]` look like pure duplication of the
top-level `url`/`integrity`. It is not: `resolvePlugin` sources `pluginVersion`
only from `versions[]`, and `getPluginUpdate` returns `undefined` without it.
Removing the array would silently retire the update-available affordance.

## Consequences

- The manifest is roughly twice the size it needs to be today, since
  `versions[0]` repeats the top-level fields. Accepted: the top-level pair is
  the fallback for a client that no version range matched, and the duplication
  is bounded and cheap.
- Every publish adds a new immutable path rather than replacing one, so S3 grows
  monotonically. That is what makes ADR 0003 safe.
- A plugin that publishes a broken version is served that broken version by the
  store until the manifest is changed — pinning does not protect installers by
  itself. See ADR 0002 for the two levers and which population each covers.

# ADR 0008 — A config names a store package; an install names a version

- **Status:** Accepted
- **Date:** 2026-08-26
- **Affected:** `manifest-types.ts` (`latestUrl`), `generate-plugins.ts`, and in
  jbrowse-components `packages/core/src/pluginDefinitions.ts`,
  `packages/core/src/util/pluginStore.ts`, `packages/core/src/checkPlugins.ts`,
  plus the four seams that build a `PluginLoader`

## Context

The published manifest is a resolver. It answers
`(storeName, jbrowseVersion) → (pinned url, integrity)`, and `resolvePlugin` in
jbrowse-components is that answer being computed.

Only one of the two populations can ask it a question.

**The plugin store** resolves at install time, gets a version-pinned url and an
integrity hash, and pins them (ADR 0001).

**A config** cannot. A config expresses a url, and a url is an _answer_ — one
computed on the day the config was generated. For a config at a permanent url
that nobody will revisit, the only answer that keeps working is `latest/` (ADR
0002), and `latest/` is a resolver that ignores both of its inputs: it cannot
carry an integrity hash, and it serves the same bytes to a `code/jb2/v4.0.0`
host and a `main` host.

So `latest/` in jb2hubs was never a wart in jb2hubs. It was the only thing a
config could say.

## Decision

**A config may name the query instead of the answer**, and the resolver runs at
load time:

```json
{ "plugins": [{ "storePlugin": "MsaView" }] }
```

`MsaView` is the store's `name` for the entry, not the npm package — see below.
`resolveStorePluginRefs` turns that into the concrete definition this JBrowse
should load, before the trust gate, `dropVendoredPlugins`, `PluginLoader` or the
RPC worker sees anything. Everything downstream keeps operating on ordinary
url-bearing definitions.

**Installs are unchanged and stay pinned.** A ref is late-bound on purpose,
which is exactly wrong for an install — a saved session must not change
underneath its user, and the integrity hash must stay valid. The split is the
point: _a config names a package, an install names a version._

### The key is the store's `name`, not the npm package

Three identities float around here — the npm package
(`@cmdcolin/jbrowse-plugin-hubs`), the store's `name`, which is also the UMD
global (`Hubs`), and the runtime Plugin class (`HubsPlugin`).

The package is the one that is globally unique and namespaced, and it is the
wrong choice. For a config nobody can revisit, the property that matters is not
uniqueness but **stability**: npm and the plugin's author own the package name,
and a scope move or an org transfer renames it out from under every config that
said it. That is the same failure as naming a url — an identifier owned by
someone else, captured on the day the config was generated — one level up. The
store owns its `name`, so it can point one at a different package and no config
notices.

Uniqueness is not given up in the trade. `name` is what `loadUMDPlugin` looks up
as `globalThis['JBrowsePlugin' + name]`, and there is one slot per name, so two
store entries sharing one could never both load in a session regardless.
`generate-plugins.ts` now refuses to publish a manifest with a collision;
nothing enforced that while `name` was only a label.

**The cost, stated:** `name` is promoted from a label the store transcribes to a
public identifier it guarantees. It can never be reused or repointed, and a
plugin that renames its UMD global stops being that plugin's private business —
it breaks every config that named it, and needs the handling a retirement gets
(ADR 0007). That constraint reaches outside this repo, into every plugin repo
whose build defines the global. Nothing enforces it there; this is the only
place it is written down.

An install still keys on `packageName`, which is right for the same reason a
config does not: an install has already committed to a version, and
`installedVersionFromUrl` reads the package out of a pinned url.

### A ref may carry a fallback url, and when it is honoured matters

Old hosts do not resolve refs. `{ name, url, storePlugin }` is loadable anyway —
the ref for a host that reads it, the `latest/` url for one that does not — and
that is the migration shape, which is why refs can be emitted before the release
that understands them ships.

That rests on the extra key being inert on hosts nobody can upgrade, so it is
measured rather than argued:
[the older-client measurement](../2026-08-26-store-plugin-refs-older-clients.md).
`check-plugins.ts --hybrid` is the standing gate.

The fallback fires when the store gives **no answer** (unreachable, or the
package is not listed). It does **not** fire when the store answers _"no build
for this JBrowse"_. That second case is ADR 0007's hole: a range that excludes
the running host is the store saying the bundle does not work here, and loading
the url anyway would hide the plugin from clients that read ranges while leaving
it armed for everyone else.

### `latestUrl` is published so nothing composes that path again

The manifest now carries the `latest/` path per entry, for config generators and
never for installs. It is the one mutable url in the manifest and it carries no
`integrity` by construction, which is what keeps invariant 2 true. jb2hubs
composing this path by hand is how its configs came to name the superseded v1
flat layout and serve protein3d 0.4.1 against a published 0.8.0.

## Consequences

- **A rollback collapses to one lever, once the hosts in the wild resolve
  refs.** Invariant 4 exists only because configs name a different url shape
  than the store. Pin `versions` in `plugins.json`, regenerate, upload — and
  both populations move. That is precisely the step missed on 2026-07-29.
- **`jbrowseRange` gets its first live users.** It has had none (ADR 0007), and
  a config resolved per host is what gives it some: an old host and a new one
  loading the same genark config can be served different builds. Today they get
  identical bytes, which is the shape of both the msaview and hubs breaks.
- **Config-named bundles can be integrity-checked.** The hash and the bytes come
  from the same manifest read in the same page load, so they cannot skew. This
  was the accepted cost in ADR 0002 and it stops being one.
- **A code-split plugin resolves to an immutable prefix.** protein3d's umd and
  its content-hashed `molstar-chunk-*.js` are a matched set by construction,
  rather than by the accident that `rclone copy` never deletes the old chunks
  from `latest/` (see ADR 0002's corrected note).
- **The store manifest is on the boot path for configs that opted in.** It is on
  the same CloudFront distribution as the bundles, so the failure is correlated
  rather than new, and resolution fetches nothing when no definition is a ref.
  Still: a config with refs now has one more thing that must answer.
- **A store `name` becomes an API.** It was a label; it is now the thing ~52k
  permanent configs resolve against. Renaming or repointing one is a breaking
  change to that population. `generate-plugins.ts` gates the half it can see —
  two entries claiming one name — and the rest is discipline: the string
  originates in a plugin repo's own build, which has no idea it is now load
  bearing.
- **A ref can only name a plugin the store lists.** BLAT is deliberately not
  listed, and MafViewer/GWAS were removed when core vendored them. Those stay
  plain urls. Retiring a plugin (ADR 0007) now also breaks any config that refs
  it, which is a stronger consequence than removal used to have — the fallback
  url is what keeps such a config working.

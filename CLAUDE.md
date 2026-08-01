# jbrowse-plugin-list

Plugin metadata and S3 rehosting for the JBrowse 2 plugin store.

## Notes

- Downloads from NPM are intentionally serial to avoid hammering registry
  servers

## `pnpm upload` is a live change to configs already in the wild

`latest/` is uploaded `Cache-Control: no-cache`, and the jb2hubs configs
(`jbrowse.org/ucsc/*`, `jbrowse.org/hubs/genark/*`) name those `latest/` urls.
Those configs sit at permanent urls that published links and old desktop
installs keep loading. So `pnpm upload` republishes **every** plugin's `latest/`
at once and takes effect immediately, for everyone, with no staging step.

A plugin whose bundle throws while loading doesn't degrade — `PluginLoader` runs
`Promise.all`, so the whole session becomes an error page.

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

### ICGC is deliberately out of range

`jbrowse-plugin-icgc` 1.0.2 (Oct 2022, `@jbrowse/core: ^1.5.0`) externalizes
`@material-ui/core` — MUI **v4**, which no host since JBrowse 2 has provided. It
error-pages on v4.0.0 through latest, and has for years. npm `latest` is still
1.0.2, so no fix is coming.

Its `plugins.json` entry pins `jbrowseRange: "<2.0.0"`, which is the honest
statement and stops range-aware clients offering it. The checker skips hosts
outside a declared range, so this does not keep the canary permanently red — a
canary you have learned to ignore is worse than none. Note the manifest's
top-level `url` fallback still points at the broken bundle for clients that
don't read ranges; removing the entry entirely is the only fix for those.

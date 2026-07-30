# jbrowse-plugin-list

Plugin metadata and S3 rehosting for the JBrowse 2 plugin store.

## Notes

- Downloads from NPM are intentionally serial to avoid hammering registry
  servers

## `pnpm upload` is a live change to configs already in the wild

`latest/` is uploaded `Cache-Control: no-cache`, and the jb2hubs configs
(`jbrowse.org/ucsc/*`, `jbrowse.org/hubs/genark/*`) name those `latest/` urls.
Those configs sit at permanent urls that published links and old desktop installs
keep loading. So `pnpm upload` republishes **every** plugin's `latest/` at once
and takes effect immediately, for everyone, with no staging step.

A plugin whose bundle throws while loading doesn't degrade — `PluginLoader` runs
`Promise.all`, so the whole session becomes an error page.

**Verify before uploading**, not after:

```
cd ~/src/jb2hubs
node scripts/checkConfigCompat.mjs --configs hg38,genark \
  --versions v4.0.0,v4.3.0,latest \
  --plugin MsaView=~/src/jbrowse-plugin-list/dist/jbrowse-plugin-msaview/latest/dist/jbrowse-plugin-msaview.umd.production.min.js
```

### What broke on 2026-07-29, and what to check instead of pinning

msaview 2.7.0 error-paged every `jbrowse.org/ucsc` launch on v4.0.0 through
latest, and promoting it here is what shipped that. `latest/` was pinned back to
2.6.8 for a few hours; 2.7.1 fixes it and no pin remains.

Two causes, both from a plugin built against an unreleased MUI-v9 `@jbrowse/core`:

- `@mui/material/SvgIcon` was externalized, but its exported **shape** differs by
  MUI major. Released hosts expose it as the SvgIcon component (`$$typeof`,
  `render`, `displayName`); MUI 9 also hangs `createSvgIcon` off it, which
  `@mui/icons-material` v9 calls. So a key-presence check sees nothing wrong -- the
  key is there on every host. Fixed by bundling that module in the plugin.
- `types.stripDefault` exists only in the mobx-state-tree that ships with
  unreleased core. react-msaview 5.6.3 degrades to `types.optional` where absent.

The lesson is not "pin things." It is that **shape, not presence, is what varies**,
so the only reliable check boots the bundle on a real host:

```
cd ~/src/jb2hubs
node scripts/checkConfigCompat.mjs --configs hg38,genark \
  --versions v4.0.0,v4.3.0,latest \
  --plugin MsaView=dist/jbrowse-plugin-msaview/latest/dist/jbrowse-plugin-msaview.umd.production.min.js
```

Run that on any `latest/` bundle this regeneration changes, before uploading.
`git status --porcelain dist | grep 'latest/dist.*umd'` lists them.

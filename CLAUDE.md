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

### MsaView `latest/` is pinned to 3.4.11 on purpose

3.4.12 requires `JBrowseExports["@mui/material/SvgIcon"]`, which no released core
provides (absent in v4.3.0; present only on `main`). The lookup yields undefined,
the bundle throws while evaluating, `JBrowsePluginMsaView` is never defined, and
every config naming it error-pages on v4.0.0 through latest. Uploading it did
exactly that to hg38/hg19 on 2026-07-29 until `latest/` was rolled back.

`pnpm update-plugins` regenerates `latest/` from npm, so it will re-promote 3.4.12
and **re-break production** unless msaview stops importing from
`@mui/material/SvgIcon` (import `SvgIcon` from `@mui/material` instead) or core
ships that re-export in a release. Until then, after `update-plugins`, restore it:

```
git checkout HEAD -- dist/jbrowse-plugin-msaview/latest
```

A plugin's new import is only safe once the oldest host in jb2hubs'
`HOST_VERSIONS` re-exports it. `packages/core/ReExports/list.ts` in
jbrowse-components is the authority; compare against `git show v4.0.0:` etc.

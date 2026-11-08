# jbrowse-plugin-list

Plugin metadata and S3 rehosting for the JBrowse 2 plugin store. Publishing
procedures are in
[agent-docs/reference/publishing-runbook.md](agent-docs/reference/publishing-runbook.md);
why each rule holds is in
[agent-docs/architectural-decision-records/](agent-docs/architectural-decision-records/).

Breaking any of these is a production incident:

- **`pnpm upload` is live for everyone, with no staging step, so run
  `pnpm verify` first.** `pnpm dep` does; any other route to an upload runs it
  by hand. `latest/` is uploaded `no-cache` and named by jb2hubs configs at
  permanent urls, and in the RPC worker, embedded products and a plugin that
  throws from `configure()`, one bad bundle error-pages the session (ADR 0002).
- **A failed `verify` leaves the bad bundle in `dist/<pkg>/latest/`, and
  re-running `pnpm download` copies it there again.** Revert it with
  `git checkout -- dist/<pkg>/latest` before anything uploads.
- **Keep the upload `rclone copy`.** S3 holds every version ever published and
  `dist/` only the current ones, so a `sync` deletes what installed plugins and
  saved configs load (ADR 0005).
- **`url` and every `versions[].url` name a version.** The browser enforces
  their `integrity` hash, so a `latest/` url breaks every install on the next
  publish. `latestUrl` alone names `latest/`, and carries no hash (ADRs 0001,
  0008).
- **A rollback pulls both levers**: `dist/<pkg>/latest/` for url-naming configs,
  a `versions` pin in `plugins.json` for store installs. Pull both, or say which
  population stays broken (ADR 0002).
- **After every upload, `pnpm invalidate`, then wait for `Completed` before
  loading anything against the store.** The edge serves the old manifest for a
  day otherwise, and `pnpm dep` skips the invalidation on a run that committed
  nothing. Mid-invalidation the edge can serve a partial bundle, which reads
  exactly like a bundle that throws (ADR 0010).
- **`v2_plugins.json` reaches JBrowse 5 hosts only.** Hosts below 5.0.0 read the
  frozen v1 manifest this repo no longer writes, so a store edit, a range or a
  removal never reaches them (ADR 0007).

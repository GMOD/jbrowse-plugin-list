# agent-docs

Working notes written while building here. They are point-in-time records, not
maintained reference — each states when it was written and what was measured.
For invariants that must stay true, see [../CLAUDE.md](../CLAUDE.md); for how to
run the pipeline, see [../DEVELOPERS.md](../DEVELOPERS.md).

## Decisions that still bind

- [architectural-decision-records/0001-version-pinned-immutable-artifacts.md](architectural-decision-records/0001-version-pinned-immutable-artifacts.md)
  — why the published `url` names a version and can never name `latest/`
- [architectural-decision-records/0002-two-url-shapes-two-rollback-levers.md](architectural-decision-records/0002-two-url-shapes-two-rollback-levers.md)
  — `latest/` for configs, pinned urls for installs, and why a rollback needs
  both
- [architectural-decision-records/0003-boot-bundles-rather-than-trust-declared-ranges.md](architectural-decision-records/0003-boot-bundles-rather-than-trust-declared-ranges.md)
  — why `check-plugins.ts` boots bundles on real hosts instead of trusting
  `jbrowseRange`
- [architectural-decision-records/0004-fail-only-when-publishing-would-lose-something.md](architectural-decision-records/0004-fail-only-when-publishing-would-lose-something.md)
  — carry-forward on failure, and grading the exit code by what the store would
  lose
- [architectural-decision-records/0005-dist-is-a-staging-area-not-an-archive.md](architectural-decision-records/0005-dist-is-a-staging-area-not-an-archive.md)
  — why `dist/` keeps only the current versions, and why `copy` must never
  become `sync`
- [architectural-decision-records/0006-free-form-tags-over-an-enumerated-scale.md](architectural-decision-records/0006-free-form-tags-over-an-enumerated-scale.md)
  — why plugin classification is free-form tags rather than an enum
- [architectural-decision-records/0007-retire-a-plugin-by-removal-not-by-range.md](architectural-decision-records/0007-retire-a-plugin-by-removal-not-by-range.md)
  — why narrowing `jbrowseRange` does not retire a broken plugin, and what
  ranges are still for

## Incidents

- [2026-07-29-msaview-2.7.0-postmortem.md](2026-07-29-msaview-2.7.0-postmortem.md)
  — a plugin built against unreleased core error-paged every released host; the
  two shape mismatches behind it, and how to reproduce it

## Writing a new one

Number sequentially, state **Status / Date / Affected**, then **Context →
Decision → Consequences**. Record what was _measured_ — file counts, version
numbers, commit hashes, what booted and what did not — rather than what was
reasoned about. Several decisions here were reached by measuring something that
contradicted the obvious inference; that is the part worth keeping. Append an
`## Amendment, <date> — <what changed>` rather than rewriting history.

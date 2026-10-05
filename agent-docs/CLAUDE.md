# Agent documentation

Top level is exactly `CLAUDE.md`. Everything else is filed:

- `reference/` — settled: incident post-mortems and measurements with their
  numbers.
- `ideas/` — a proposal parked, one per file, in the subfolder naming what it
  waits on: `ready/` (only the work). Each file carries `name:` and
  `description:` frontmatter, the description written as the hook someone picks
  the idea up by. A verdict leaves `ideas/`: an ADR if the decision deserves a
  record, otherwise deleted.
- `architecture-decision-records/` — *why*, one per file, numbered
  `NNNN-slug.md`; its README indexes them. Read the relevant one before
  "simplifying" a design that looks accidental.
- `handoffs/` — live state of an unfinished thread. Pointers, not content;
  delete when the thread lands.
- Tried and declined → a sentence at the code that would re-try it, with the
  number. There is no rejected-ideas shelf.
- What a session did and which commits → git already holds it.

Cite a doc by its path, so a move is a grep.

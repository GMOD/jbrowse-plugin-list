# jbrowse-plugin-tview

Loads BAM/CRAM read pileups into
[react-msaview](https://github.com/GMOD/react-msaview) for a `samtools tview`
style interface inside JBrowse 2.

Because the reads are laid out as a multiple alignment, non-reference insertions
get their own columns instead of being collapsed into a marker: every read that
inserts at a position contributes its bases, and reads without that insertion
are padded so the reference columns still line up.

## Gallery

![tview expanding a non-reference insertion](img/tview-insertion.png)

The same reads at `ctgA:15,140..15,190`, twice. In the pileup above, the 1bp
insertion at 15,163 is collapsed into a column of purple `(1)` markers. In the
tview panel below it gets a real column (highlighted): reads carrying the
insertion show their base, reads that span the position without it show `-`, and
reads that do not cover it show `.` — so every row stays the same width and the
reference columns still line up.

Regenerate with `pnpm figure`; the tandem-repeat figures below come from
`pnpm figures:repeats`.

## How it is built

The alignment is built in an **RPC worker** (`TviewGetPlan`), so the reads never
cross to the main thread — the fetch, the pairwise alignments and the string
building all happen there and only the FASTA comes back. That is also what makes
several files one call: their rows are squared up against the same reference
interval, so an array's copies are counted once, over rows from all of them.

## Tandem repeats

![ABCA7 VNTR alleles in HG003](img/repeat-abca7-vntr.png)

The ABCA7 VNTR in one PacBio HiFi sample, a copy per block of columns. Every row
carries its copy count, and the rows sort by it, so the genotype is the step in
the ladder — the two alleles the table below reports for HG003, with a scatter
of reads between them. Laid out base by base this is 2.2kb of sequence with
nothing to line it up against.

### An array is an interval, not an insertion

The array is found in the **reference**, and a row's allele is what it has
between the two ends of that interval — its matched bases, plus what it inserted
inside, minus what it deleted. Everything else follows from that:

- **The count is the allele, not the excess.** An STR is already in the
  reference, so a read's insertion is only how much more it carries than hg19
  does, and a contracted allele inserts nothing at all.
- **One locus is one array.** An indel inside an array has no unique placement,
  so an aligner anchors different reads at different positions; measured over an
  interval those choices cancel. ATXN3 in HG002 reported as four separate arrays
  when anchored on insertions, splitting one locus's alleles across four counts.
- **The allele comes to the interval.** Measuring over an interval settles the
  indels an aligner placed _inside_ it. It settles nothing about the ones it
  placed just outside, and an aligner will happily anchor an expansion at the
  base before the array starts: there the insertion belongs to no allele, so it
  becomes a run of columns of its own and the read carrying it is counted as if
  it matched the reference. Each read's insertions are therefore re-filed under
  the array they belong to before anything is measured — within a flank of 25bp
  or one copy, whichever is larger, and only where the array's own unit explains
  the inserted sequence. At ATXN3 that is most of the reads carrying an
  expansion, and it is the difference between HG004 reading as 8/8 with three
  odd reads and reading as 8/21.

  Re-filing a read's insertions is not the same as moving the interval, and the
  difference is the point. The interval is a property of the reference, so one
  read's misplacement stays that read's; widening it instead made a single
  spurious copy anchored two bases early move the array's left edge for every
  row, and the reference's own copy count with it.

- **Every spanning read is counted**, including the ones that match the
  reference exactly — usually the commonest allele, and invisible to anything
  keyed on insertions.
- **The reference is a row.** It is laid out and counted like any other allele,
  which is what the coordinates are named after.

Nothing declares a repeat. Periods from 2 to 300bp are scanned, the shortest one
that explains a stretch wins, and a homopolymer is declined — it is periodic at
every lag and its "unit" is an arbitrary cut through one run.

At a detected array:

- **copy k of every row occupies the same block**, so one divergent copy shows
  up as a column rather than shifting every copy after it.
- **each row is labelled with its copy count** (`readname|n=32`), which is the
  measurement, rather than leaving it to be read off where the row ends.
- **rows are ordered longest allele first**, so the alleles form a ladder.
- the default column width shrinks to fit the array on screen.

**Blocks are array order, not homology.** Copies are counted from the left edge
of the interval, and arrays expand and contract anywhere inside themselves, so
the 9th copy of one row need not be the 9th copy of another. Reading down a row
is sound; reading across two is a hypothesis.

### What the numbers were checked against

`pnpm report:repeats` measures the GIAB Ashkenazi trio (PacBio HiFi, GRCh37) at
known loci with the same plan builder the view runs. **Every number in this
section is written by `pnpm readme:repeats` and checked by
`pnpm readme:repeats --check`**, so it is a rendering of a measurement rather
than a figure typed once that nothing afterwards could contradict. The
`Measurements` workflow runs that check weekly and whenever the plan builder
changes; it is kept out of Integration and out of `preversion` because a GIAB
outage is not a reason a commit cannot land or a release cannot go out.

An allele is a copy count carrying at least 15% of a sample's spanning reads,
and never one read. Reads scatter around an allele, so a count also collects the
reads in its skirt: those within a tenth of its size that carry less than a
third of its support. Both halves are needed — no distance separates FMR1's
mother's two alleles, which are one copy apart, from HTT's single allele with a
shoulder one copy either side, and relative support does. That is a report of
what the reads say and not a genotype call — it knows no ploidy, so a homozygote
and a haploid locus both come back as one number. Read that way, every locus
with variation to check is Mendelian:

<!-- repeat-genotypes -->

| locus            | ref | HG003 (father) | HG004 (mother) | HG002 (son) |
| ---------------- | --- | -------------- | -------------- | ----------- |
| HTT (CAG)        | 33  | 31             | 31 / 38        | 31 / 38     |
| ATXN3 (CTG)      | 8   | 15 / 17        | 8 / 21         | 17 / 21     |
| TCF4 CTG18.1     | 38  | 25 / 46        | 28 / 38        | 28 / 46     |
| DMPK (CTG)       | 21  | 12 / 14        | 6 / 12         | 12          |
| FMR1 (CGG), X    | 21  | 30             | 31 / 32        | 32          |
| C9orf72 (GGGGCC) | 4   | 3              | 3              | 3           |
| ABCA7 VNTR       | 19  | 20 / 88        | 21 / 25        | 21          |

<!-- /repeat-genotypes -->

FMR1 is the one that cannot be right by accident: nothing tells the layout which
chromosome it is on, and the two males come back with one allele each and the
mother with two, with the son's allele one of hers.

### Where it is weaker

- **The interval is what scans as periodic, not a curated locus definition.**
  Where a locus runs two related units together — HTT's CAG tract and the CCG
  tract after it are both period 3 — they are one array, the count spans both,
  and it will not match a published CAG size.
- **Reads land off the alleles**, from slippage in the read and in the aligner.
  Read the distribution — `pnpm report:repeats` prints every copy count with its
  support — rather than one row.
- **Long VNTR alleles are the noisy ones**, and thin: a row is only counted if
  it spans the interval end to end, so an array of a 25bp unit running past 2kb
  is measured on a handful of reads, each of which had to get all of it right.
  Both effects are in the last two columns:

<!-- repeat-spread -->

| locus            | array              | spanning reads | on an allele | off one |
| ---------------- | ------------------ | -------------- | ------------ | ------- |
| HTT (CAG)        | 97bp of 3bp unit   | 176            | 176          | 0       |
| ATXN3 (CTG)      | 24bp of 3bp unit   | 154            | 149          | 5       |
| TCF4 CTG18.1     | 113bp of 3bp unit  | 169            | 141          | 28      |
| DMPK (CTG)       | 62bp of 3bp unit   | 129            | 129          | 0       |
| FMR1 (CGG), X    | 62bp of 3bp unit   | 123            | 122          | 1       |
| C9orf72 (GGGGCC) | 23bp of 6bp unit   | 210            | 210          | 0       |
| ABCA7 VNTR       | 466bp of 25bp unit | 27             | 20           | 7       |

<!-- /repeat-spread -->

The off-allele reads at ABCA7 are the same handful the row before it is measured
on, which is what "noisy" means at that locus rather than a proportion to
compare with the STRs above.

They are still real sequence. HG003's long alleles were read back at base level:
the 1,207bp and 764bp insertions the aligner anchored 19bp outside the array are
the VNTR's own 25bp unit, entered at offset 6 — expansions, not a chimeric join
or a mismapping, which is why re-filing them under the array rather than leaving
them beside it is what the count depends on.

### Several samples at once

![FMR1 CGG in the GIAB trio](img/repeat-fmr1-trio.png)

The FMR1 CGG repeat in the GIAB Ashkenazi trio, all three files in one
alignment. Rows are grouped into a clade per sample by a synthetic tree, which
turns on react-msaview's collapse and show-only controls for free.

The copy numbers are checkable, which is the point of this locus: FMR1 is on the
X, so the two male samples come back with one allele each and the mother with
two, and the son's single allele is one of his mother's, as an X-linked allele
has to be. The counts are in the genotype table above, where they are measured
rather than typed.

Two things about this figure are settings rather than data, and both are there
because a column costs the same whether 124 rows use it or one does:

- **Columns only one row has a base in are hidden** — the toolbar's "hide
  columns w/ N% gaps", set to whatever percent means "one row" for the number of
  rows there are. That is read error, and it is a fifth of the columns at some
  of these loci; the rows that carry one keep an insertion marker where it was.
  What each figure is made of:

<!-- repeat-figures -->

| figure                             | rows | columns | columns one row has | hidden |
| ---------------------------------- | ---- | ------- | ------------------- | ------ |
| [fmr1](img/repeat-fmr1-trio.png)   | 124  | 218     | 24                  | 11%    |
| [htt](img/repeat-htt-trio.png)     | 182  | 222     | 25                  | 11%    |
| [atxn3](img/repeat-atxn3-trio.png) | 157  | 159     | 18                  | 11%    |
| [abca7](img/repeat-abca7-vntr.png) | 16   | 3630    | 1253                | 35%    |

<!-- /repeat-figures -->

- **The window is sized to the alignment**, because a JBrowse view taller than
  its window loses its last rows with nothing on screen to say so — and rows are
  ordered longest allele first, so what falls off the bottom is a whole sample.
  `pnpm figures:repeats` now grows the window to the content and warns when it
  cannot.

## Usage

- Install the plugin
- Open the track menu (vertical `...`) on an alignments track
- Click "Launch tview for visible region"
- Tick any other open alignments track to fold its reads into the same alignment

The launched view stays connected to the genome view it came from: hovering or
clicking an alignment column highlights the corresponding genome position, and
clicking navigates there. "Zoom to base level on click?" in the view menu
switches between centering and zooming.

The visible region is capped at 20kb, since one column per base gets unwieldy
beyond that.

### As a session, with no click path

A tview is a locus, an assembly and the files to read it from, so it can be
declared rather than driven. In a `defaultSession` or a saved session that is
the view's `init` block:

```json
{
  "type": "TView",
  "init": {
    "assembly": "hg19",
    "loc": "chrX:146,993,530..146,993,670",
    "tracks": [
      { "trackId": "HG002", "sample": "HG002_son" },
      { "trackId": "HG003", "sample": "HG003_father" }
    ]
  }
}
```

A [session spec](https://jbrowse.org/jb2/docs/urlparams/) URL takes the same
keys **flat** — that is the one shape difference, and it is JBrowse's, not this
plugin's:

```json
{
  "type": "TView",
  "assembly": "hg19",
  "loc": "chrX:146,993,530..146,993,670",
  "tracks": ["HG002"]
}
```

Either way the view resolves it itself, which is also how a restored session
gets its alignment back: react-msaview drops an MSA over 50kb from snapshots and
there is no file to reload from, so `init` is what persists.

`public/repeats.json` is a working example — the GIAB trio on hosted hg19, with
a tview at FMR1 open on load.

## Requirements

Needs a JBrowse build shipping `@jbrowse/core` >=4.3 with MUI 9 — currently
jbrowse-web nightly. On JBrowse 4.3.0 the bundle fails to load, because
react-msaview 5.x needs `@jbrowse/mobx-state-tree` 5.13 APIs and MUI 9 icon
internals that the 4.3.0 release does not ship.

## Development

```bash
pnpm install
pnpm start            # dev server on :9000, serves dist/out.js with CORS
pnpm test             # unit tests
pnpm test:e2e         # puppeteer tests (creates .test-jbrowse on first run)
pnpm lint
pnpm build

pnpm figures:repeats  # the tandem-repeat figures in img/
pnpm report:repeats   # copy numbers at known loci, from live GIAB data
```

`report:repeats` is not a test. It fetches from GIAB and UCSC and prints what
the plan builder measured at each locus, per sample, so the numbers can be read
against what the locus is known to carry — Mendelian consistency across the
trio, hemizygosity on the X, published allele ranges. The loci and samples live
in `scripts/lib/giabTrio.mjs`, which the figures are defined against too, so a
figure and the numbers beside it cannot be of different windows.

It measures whatever it is pointed at, and can photograph it with the same
harness the figures above use:

```bash
pnpm report:repeats \
  --bam HG002=https://host/HG002.bam \
  --loc chrX:146,993,530..146,993,670 \
  --genome hg19 --ref-name X \
  --figure img/fmr1.png
```

`--genome` is a UCSC genome: the reference bases come from the UCSC API and, for
`--figure`, the browser's assembly is built from UCSC's 2bit and chromAlias, so
`--ref-name` is only about what the BAM calls the same sequence.
`--fasta <indexed.fa>` reads them off disk instead, which is what a reference
UCSC does not host needs — there are no aliases to be had that way, so the locus
has to be written the way the FASTA names it. A figure can only be taken of
files the browser can load: a url, or a path under the repo, which is what the
dev server serves.

`pnpm start` serves the repo root, so a JBrowse instance unpacked at
`.test-jbrowse` can load the plugin from the same origin via
`http://localhost:9000/.test-jbrowse/index.html?config=../public/config.json`.

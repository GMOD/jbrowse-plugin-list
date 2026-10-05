# jbrowse-plugin-tandem-repeat

A JBrowse 2 view of a tandem repeat's alleles: one bar per haplotype on its own
bp axis, with each copy coloured by its repeat unit.

![LPA's KIV-2 array in GRCh38 and eight HPRC haplotypes, each copy coloured by its unit](img/kiv2_copies.png)

## Opening the view

Right-click a VCF 4.5 `<CNV:TR>` record in a variant track and choose **Show
repeat copies**. Both the single-row and the multi-sample variant displays offer
the item. The view keeps the record's alleles in the session, so a saved session
draws them without the track.

## What the view reads

The view draws what the record states, in the fields VCF 4.5 defines for tandem
repeats:

- `RN`: how many repeat sequences (runs) each ALT allele has
- `RUS` or `RUL`: each run's unit sequence or length. Runs of one unit share a
  colour
- `RUC`: copies in each run
- `RB`: bases in each run
- `RUB`: each copy's bases, so a partial or odd-length copy draws at its length
- `GT`: the alleles each sample carries. A phased genotype's k-th allele is
  labelled `sample#k`, its PanSN haplotype

The legend numbers units by how many copies the record's alleles carry, most
first. A record states no runs for its reference allele, so a sample carrying
that allele draws grey, ticked every unit. A dashed line marks the reference
allele's length.

TRGT and vamos state repeats in fields of their own, so their output needs
converting to these fields before the view draws it.

## Writing records from TRGT

`scripts/trgt-to-cnv-tr.mjs` rewrites a TRGT VCF, one sample or a `trgt merge`
of many, as `<CNV:TR>` records:

```
node scripts/trgt-to-cnv-tr.mjs merged.vcf.gz > merged.cnv-tr.vcf
```

Each ALT allele takes the runs its samples' `MS` field states. Without `MS`, a
locus of one motif states one run of it, its copies the allele's length over the
motif's. A locus of several motifs with no `MS` states no runs, so the script
skips it and reports the count on stderr. `GT`, `AL`, `SD` and TRGT's other
sample fields pass through. The script needs nothing beyond Node.

The runs are the spans TRGT called. Bases between two spans, an interruption
like the CAA of `(CAG)nCAACAG(CCG)n`, count in the preceding run's `RB`, so an
allele's `RB`s sum to its length, TRGT's `AL`, while `RUC` states only the
copies TRGT found. TRGT spans the CAG after that interruption as a run of its
own, so an allele can carry two consecutive runs of one unit.

We ran the script on TRGT 5.1.0's own example and on its output for error-free
reads of a two-motif repeat, before and after `trgt merge`. Real reads with
sequencing errors and several interruptions are untested.

## Writing a record from a graph

No repeat finder states KIV-2 per copy from assemblies today: TRGT needs reads
spanning the array, and vamos skips any allele over 30 kb.
`scripts/tandem-repeat-vcf.mjs` writes the record from a pangenome graph cut
instead, a GFA with W lines that holds the array and its flanks, plus a BED row
naming the array on the reference:

```
node scripts/tandem-repeat-vcf.mjs cut.gfa --bed arrays.bed --name KIV-2 > kiv2.vcf
```

The script needs nothing beyond Node. Its header states how it splits copies and
groups them into units.

vamos 3.1.1 in contig mode, given a catalogue of KIV-2's two units, can split
all nine haplotypes copy for copy as the script does, but only once patched and
fed by hand:

- A constant in `src/vntr.cpp` caps an allele at 30,000 bp whatever `-L` says.
  Patched to `max(30000, opt.maxLocusLength)`, it reaches the KIV-2 alleles.
- Its DP tables cost 15.7 bytes a cell, 5–26 GB per KIV-2 allele. Dropping the
  two tables nothing reads, storing the path as `int8_t` and keeping two rolling
  score columns brings that to 1.07 bytes a cell with the same output.
- minimap2 can't bridge the expansion: its primary record for HG00128 aligns 33
  kb of the 127 kb contig and soft-clips the rest. vamos then annotates the
  aligned part as the whole allele, 6 copies for HG00128's 23. Each contig has
  to go in as one record built from the graph instead.
- Contig mode filters no secondary or supplementary records, so given several
  for a contig, vamos silently keeps whichever comes last in the file.

## The KIV-2 example

The hosted HPRC demo's `hprc_kiv2_copies` track holds one record: LPA's KIV-2
array in GRCh38 and eight HPRC haplotypes. `scripts/tandem-repeat-vcf.mjs` wrote
it from the demo's KIV-2 graph cut, splitting each haplotype's array into copies
and grouping copies within 1% of each other into a unit. Two units come out,
2.3% apart, matching the two repeat types long-read studies of LPA report.

`hprc_kiv2_copies_all` holds the same array in all 464 haplotypes whose walks
reach both of its flanks, GRCh38 included. Past 30 rows the view squeezes its
rows into the height of 30, unlabelled, those with the most copies of the rarest
unit first, then longest; hovering a copy names its haplotype. Unit 2 leads
every array that holds it except GRCh38's, the lone row whose only unit 2 copy
sits fourth. Given the exons of one copy, `--sites` shows the units differ in
exon 1 at positions 14, 41 and 86, the sites that define KIV-2B:

```
node scripts/tandem-repeat-vcf.mjs cut.gfa --bed arrays.bed --name KIV-2 \
  --sites kiv2_exons.bed > /dev/null
```

![LPA's KIV-2 array in 464 HPRC haplotypes, those carrying unit 2 first, each copy coloured by its unit](img/kiv2_copies_all.png)

## Grouping rows by sample

When the track's adapter names a `samplesTsvLocation`, the view keeps that
file's rows in the session, and its menu's **Group by…** offers each column by
its header. Each value gets a section under a header naming it and its
haplotypes, ordered as JBrowse orders a track's facets, with the rows that have
no value last. The sections share the ruler, the row height and the reference
line, and squeezed rows keep their sort within each. The demo's cohort track,
grouped by `superpopulation`:

![LPA's KIV-2 array in all HPRC haplotypes, one section per superpopulation, each copy coloured by its unit](img/kiv2_copies_all_by_superpopulation.png)

## Usage

Needs JBrowse 5.0.0-beta.9 or later.

```json
{
  "plugins": [
    {
      "name": "TandemRepeat",
      "esmUrl": "https://unpkg.com/jbrowse-plugin-tandem-repeat/dist/jbrowse-plugin-tandem-repeat.esm.js"
    }
  ]
}
```

## Development

```
pnpm install
pnpm start      # serves the bundle on port 9000
pnpm test
pnpm figures    # reshoots img/ from the hosted HPRC demo on a released JBrowse
```

`pnpm figures` answers the demo's config request with this plugin added and
serves the local `dist/` in place of the published bundle, then right-clicks the
record and chooses the menu item as a reader would.

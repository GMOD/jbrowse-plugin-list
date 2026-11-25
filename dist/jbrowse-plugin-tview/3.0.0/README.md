# jbrowse-plugin-tview

Loads BAM/CRAM reads into [react-msaview](https://github.com/GMOD/react-msaview)
as a multiple alignment, for a `samtools tview` style view inside JBrowse 2.

Because the reads are laid out as a multiple alignment, a non-reference
insertion gets columns of its own instead of a marker: every read that inserts
at a site contributes its bases there, and the other reads are padded so the
reference columns still line up. The reference is the top row, and a copy of it
is pinned above the alignment. A base that matches it draws as a dot, so the
colours in a row mark where that read differs. Rows are grouped in a band per
sample, and labelled brackets above the alignment mark the insertion sites and
tandem arrays.

## Gallery

Each picture opens full size, and the ones of the GIAB trio also open as a
[live demo](#live-demos).

<table>
<tr>
<td width="50%" valign="top">

<a href="img/insertion-alu.png"><img src="img/insertion-alu.png" width="380" alt="An Alu insertion in HG002, as a JBrowse pileup above and a tview below"></a>

An Alu insertion in HG002: a box per read in the pileup, 290 aligned columns in
the tview. [Live demo][tview-demo-alu]

</td>
<td width="50%" valign="top">

<a href="img/insertion-alu-trio.png"><img src="img/insertion-alu-trio.png" width="380" alt="The same Alu insertion in the GIAB trio, one band per sample"></a>

The NPHP4 Alu in a band per sample: the son and the father have it, the mother
does not. [Live demo][tview-demo-alu-trio]

</td>
</tr>
<tr>
<td width="50%" valign="top">

<a href="img/tview-insertion.png"><img src="img/tview-insertion.png" width="380" alt="A 1bp insertion in the volvox test reads, with its bracket and residue letters"></a>

A 1bp insertion up close: one bracketed column, and a dot for each base that
matches the reference.

</td>
<td width="50%" valign="top">

<a href="img/repeat-atxn3-hg004.png"><img src="img/repeat-atxn3-hg004.png" width="380" alt="The ATXN3 CTG repeat in HG004, a block per copy, rows sorted by copy count"></a>

ATXN3 in HG004, a block per CTG copy, rows sorted from 21 copies down to the
reference's 8. [Live demo][tview-demo-atxn3-hg004]

</td>
</tr>
<tr>
<td colspan="2" valign="top">

<a href="img/repeat-abca7-vntr.png"><img src="img/repeat-abca7-vntr.png" width="780" alt="The ABCA7 VNTR in HG003, a block per 25bp copy, with each row's copy count as a bar and a number"></a>

The ABCA7 VNTR in HG003, a block per 25bp copy, rows sorted from 134 copies
down, each with its count as a bar and a number. [Live demo][tview-demo-abca7]

</td>
</tr>
<tr>
<td width="50%" valign="top">

<a href="img/tview-modifications-bases.png"><img src="img/tview-modifications-bases.png" width="380" alt="Nanopore reads with 5mC calls, coloured by bases, with a bar under each called base"></a>

**Color by bases**: base colours, and a bar under each base with a modification
call.

</td>
<td width="50%" valign="top">

<a href="img/tview-modifications.png"><img src="img/tview-modifications.png" width="380" alt="The same reads coloured by modification, from blue at 0% to red at 100%"></a>

**Color by modification**: each called base filled from blue (0%) to red (100%),
one of them in an inserted column.

</td>
</tr>
</table>

## Live demos

Real human data, nothing to install. Each link opens reads from the GIAB
Ashkenazi trio (PacBio HiFi, GRCh37, streamed from GIAB's FTP) at an Alu
insertion or a tandem repeat.

<!-- demo-links -->

| locus            | window                        | what it shows                                                     | open                             |
| ---------------- | ----------------------------- | ----------------------------------------------------------------- | -------------------------------- |
| NPHP4 Alu, HG002 | chr1:5,934,190..5,934,390     | an Alu insertion in about half the reads, aligned base by base    | [launch][tview-demo-alu]         |
| NPHP4 Alu        | chr1:5,934,190..5,934,390     | a band per sample: the son and the father have it, the mother not | [launch][tview-demo-alu-trio]    |
| FMR1             | chrX:146,993,530..146,993,670 | CGG on the X, so two of the three samples carry one allele        | [launch][tview-demo-fmr1]        |
| HTT              | chr4:3,076,570..3,076,730     | the CAG tract, with a shoulder either side of one allele          | [launch][tview-demo-htt]         |
| ATXN3            | chr14:92,537,320..92,537,420  | the locus that reports as four arrays when anchored on insertions | [launch][tview-demo-atxn3]       |
| ATXN3, HG004     | chr14:92,537,320..92,537,420  | the mother alone, a CTG ladder of two steps                       | [launch][tview-demo-atxn3-hg004] |
| ABCA7            | chr19:1,049,460..1,050,000    | a 25bp VNTR whose alleles run past 2kb                            | [launch][tview-demo-abca7]       |

[tview-demo-alu]:
  https://jbrowse.org/code/jb2/main/index.html?config=/demos/tview/config.json&session=spec-%7B%22sessionName%22%3A%22alu%22%2C%22views%22%3A%5B%7B%22id%22%3A%22lgv%22%2C%22type%22%3A%22LinearGenomeView%22%2C%22loc%22%3A%22chr1%3A5%2C934%2C190..5%2C934%2C390%22%2C%22assembly%22%3A%22hg19%22%2C%22tracks%22%3A%5B%7B%22trackId%22%3A%22HG002%22%2C%22displaySnapshot%22%3A%7B%22height%22%3A160%7D%7D%5D%7D%2C%7B%22id%22%3A%22tview%22%2C%22type%22%3A%22TView%22%2C%22displayName%22%3A%22alu%22%2C%22assembly%22%3A%22hg19%22%2C%22loc%22%3A%22chr1%3A5%2C934%2C190..5%2C934%2C390%22%2C%22tracks%22%3A%5B%7B%22trackId%22%3A%22HG002%22%2C%22sample%22%3A%22HG002_son%22%7D%5D%2C%22connectedViewId%22%3A%22lgv%22%2C%22height%22%3A900%2C%22colWidth%22%3A3%2C%22rowHeight%22%3A8%2C%22treeAreaWidth%22%3A220%7D%5D%7D
[tview-demo-alu-trio]:
  https://jbrowse.org/code/jb2/main/index.html?config=/demos/tview/config.json&session=spec-%7B%22sessionName%22%3A%22alu-trio%22%2C%22views%22%3A%5B%7B%22id%22%3A%22lgv%22%2C%22type%22%3A%22LinearGenomeView%22%2C%22loc%22%3A%22chr1%3A5%2C934%2C190..5%2C934%2C390%22%2C%22assembly%22%3A%22hg19%22%2C%22tracks%22%3A%5B%7B%22trackId%22%3A%22HG002%22%2C%22displaySnapshot%22%3A%7B%22height%22%3A55%7D%7D%2C%7B%22trackId%22%3A%22HG003%22%2C%22displaySnapshot%22%3A%7B%22height%22%3A55%7D%7D%2C%7B%22trackId%22%3A%22HG004%22%2C%22displaySnapshot%22%3A%7B%22height%22%3A55%7D%7D%5D%7D%2C%7B%22id%22%3A%22tview%22%2C%22type%22%3A%22TView%22%2C%22displayName%22%3A%22alu-trio%22%2C%22assembly%22%3A%22hg19%22%2C%22loc%22%3A%22chr1%3A5%2C934%2C190..5%2C934%2C390%22%2C%22tracks%22%3A%5B%7B%22trackId%22%3A%22HG002%22%2C%22sample%22%3A%22HG002_son%22%7D%2C%7B%22trackId%22%3A%22HG003%22%2C%22sample%22%3A%22HG003_father%22%7D%2C%7B%22trackId%22%3A%22HG004%22%2C%22sample%22%3A%22HG004_mother%22%7D%5D%2C%22connectedViewId%22%3A%22lgv%22%2C%22height%22%3A900%2C%22colWidth%22%3A3%2C%22rowHeight%22%3A5%2C%22treeAreaWidth%22%3A220%7D%5D%7D
[tview-demo-fmr1]:
  https://jbrowse.org/code/jb2/main/index.html?config=/demos/tview/config.json&session=spec-%7B%22sessionName%22%3A%22fmr1%22%2C%22views%22%3A%5B%7B%22id%22%3A%22lgv%22%2C%22type%22%3A%22LinearGenomeView%22%2C%22loc%22%3A%22chrX%3A146%2C993%2C530..146%2C993%2C670%22%2C%22assembly%22%3A%22hg19%22%2C%22tracks%22%3A%5B%7B%22trackId%22%3A%22HG002%22%2C%22displaySnapshot%22%3A%7B%22height%22%3A55%7D%7D%2C%7B%22trackId%22%3A%22HG003%22%2C%22displaySnapshot%22%3A%7B%22height%22%3A55%7D%7D%2C%7B%22trackId%22%3A%22HG004%22%2C%22displaySnapshot%22%3A%7B%22height%22%3A55%7D%7D%5D%7D%2C%7B%22id%22%3A%22tview%22%2C%22type%22%3A%22TView%22%2C%22displayName%22%3A%22fmr1%22%2C%22assembly%22%3A%22hg19%22%2C%22loc%22%3A%22chrX%3A146%2C993%2C530..146%2C993%2C670%22%2C%22tracks%22%3A%5B%7B%22trackId%22%3A%22HG002%22%2C%22sample%22%3A%22HG002_son%22%7D%2C%7B%22trackId%22%3A%22HG003%22%2C%22sample%22%3A%22HG003_father%22%7D%2C%7B%22trackId%22%3A%22HG004%22%2C%22sample%22%3A%22HG004_mother%22%7D%5D%2C%22connectedViewId%22%3A%22lgv%22%2C%22height%22%3A900%2C%22colWidth%22%3A6%2C%22rowHeight%22%3A8%2C%22treeAreaWidth%22%3A220%7D%5D%7D
[tview-demo-htt]:
  https://jbrowse.org/code/jb2/main/index.html?config=/demos/tview/config.json&session=spec-%7B%22sessionName%22%3A%22htt%22%2C%22views%22%3A%5B%7B%22id%22%3A%22lgv%22%2C%22type%22%3A%22LinearGenomeView%22%2C%22loc%22%3A%22chr4%3A3%2C076%2C570..3%2C076%2C730%22%2C%22assembly%22%3A%22hg19%22%2C%22tracks%22%3A%5B%7B%22trackId%22%3A%22HG002%22%2C%22displaySnapshot%22%3A%7B%22height%22%3A55%7D%7D%2C%7B%22trackId%22%3A%22HG003%22%2C%22displaySnapshot%22%3A%7B%22height%22%3A55%7D%7D%2C%7B%22trackId%22%3A%22HG004%22%2C%22displaySnapshot%22%3A%7B%22height%22%3A55%7D%7D%5D%7D%2C%7B%22id%22%3A%22tview%22%2C%22type%22%3A%22TView%22%2C%22displayName%22%3A%22htt%22%2C%22assembly%22%3A%22hg19%22%2C%22loc%22%3A%22chr4%3A3%2C076%2C570..3%2C076%2C730%22%2C%22tracks%22%3A%5B%7B%22trackId%22%3A%22HG002%22%2C%22sample%22%3A%22HG002_son%22%7D%2C%7B%22trackId%22%3A%22HG003%22%2C%22sample%22%3A%22HG003_father%22%7D%2C%7B%22trackId%22%3A%22HG004%22%2C%22sample%22%3A%22HG004_mother%22%7D%5D%2C%22connectedViewId%22%3A%22lgv%22%2C%22height%22%3A900%2C%22colWidth%22%3A6%2C%22rowHeight%22%3A8%2C%22treeAreaWidth%22%3A220%7D%5D%7D
[tview-demo-atxn3]:
  https://jbrowse.org/code/jb2/main/index.html?config=/demos/tview/config.json&session=spec-%7B%22sessionName%22%3A%22atxn3%22%2C%22views%22%3A%5B%7B%22id%22%3A%22lgv%22%2C%22type%22%3A%22LinearGenomeView%22%2C%22loc%22%3A%22chr14%3A92%2C537%2C320..92%2C537%2C420%22%2C%22assembly%22%3A%22hg19%22%2C%22tracks%22%3A%5B%7B%22trackId%22%3A%22HG002%22%2C%22displaySnapshot%22%3A%7B%22height%22%3A55%7D%7D%2C%7B%22trackId%22%3A%22HG003%22%2C%22displaySnapshot%22%3A%7B%22height%22%3A55%7D%7D%2C%7B%22trackId%22%3A%22HG004%22%2C%22displaySnapshot%22%3A%7B%22height%22%3A55%7D%7D%5D%7D%2C%7B%22id%22%3A%22tview%22%2C%22type%22%3A%22TView%22%2C%22displayName%22%3A%22atxn3%22%2C%22assembly%22%3A%22hg19%22%2C%22loc%22%3A%22chr14%3A92%2C537%2C320..92%2C537%2C420%22%2C%22tracks%22%3A%5B%7B%22trackId%22%3A%22HG002%22%2C%22sample%22%3A%22HG002_son%22%7D%2C%7B%22trackId%22%3A%22HG003%22%2C%22sample%22%3A%22HG003_father%22%7D%2C%7B%22trackId%22%3A%22HG004%22%2C%22sample%22%3A%22HG004_mother%22%7D%5D%2C%22connectedViewId%22%3A%22lgv%22%2C%22height%22%3A900%2C%22colWidth%22%3A7%2C%22rowHeight%22%3A8%2C%22treeAreaWidth%22%3A220%7D%5D%7D
[tview-demo-atxn3-hg004]:
  https://jbrowse.org/code/jb2/main/index.html?config=/demos/tview/config.json&session=spec-%7B%22sessionName%22%3A%22atxn3-hg004%22%2C%22views%22%3A%5B%7B%22id%22%3A%22lgv%22%2C%22type%22%3A%22LinearGenomeView%22%2C%22loc%22%3A%22chr14%3A92%2C537%2C320..92%2C537%2C420%22%2C%22assembly%22%3A%22hg19%22%2C%22tracks%22%3A%5B%7B%22trackId%22%3A%22HG004%22%2C%22displaySnapshot%22%3A%7B%22height%22%3A55%7D%7D%5D%7D%2C%7B%22id%22%3A%22tview%22%2C%22type%22%3A%22TView%22%2C%22displayName%22%3A%22atxn3-hg004%22%2C%22assembly%22%3A%22hg19%22%2C%22loc%22%3A%22chr14%3A92%2C537%2C320..92%2C537%2C420%22%2C%22tracks%22%3A%5B%7B%22trackId%22%3A%22HG004%22%2C%22sample%22%3A%22HG004_mother%22%7D%5D%2C%22connectedViewId%22%3A%22lgv%22%2C%22height%22%3A900%2C%22colWidth%22%3A7%2C%22rowHeight%22%3A8%2C%22treeAreaWidth%22%3A220%7D%5D%7D
[tview-demo-abca7]:
  https://jbrowse.org/code/jb2/main/index.html?config=/demos/tview/config.json&session=spec-%7B%22sessionName%22%3A%22abca7%22%2C%22views%22%3A%5B%7B%22id%22%3A%22lgv%22%2C%22type%22%3A%22LinearGenomeView%22%2C%22loc%22%3A%22chr19%3A1%2C049%2C460..1%2C050%2C000%22%2C%22assembly%22%3A%22hg19%22%2C%22tracks%22%3A%5B%7B%22trackId%22%3A%22HG003%22%2C%22displaySnapshot%22%3A%7B%22height%22%3A55%7D%7D%5D%7D%2C%7B%22id%22%3A%22tview%22%2C%22type%22%3A%22TView%22%2C%22displayName%22%3A%22abca7%22%2C%22assembly%22%3A%22hg19%22%2C%22loc%22%3A%22chr19%3A1%2C049%2C460..1%2C050%2C000%22%2C%22tracks%22%3A%5B%7B%22trackId%22%3A%22HG003%22%2C%22sample%22%3A%22HG003_father%22%7D%5D%2C%22connectedViewId%22%3A%22lgv%22%2C%22height%22%3A900%2C%22colWidth%22%3A1%2C%22rowHeight%22%3A16%7D%5D%7D

<!-- /demo-links -->

Nothing to accept and nothing to install: click one and wait for the reads,
which take a few seconds since they arrive by range request and the alignment is
built in a worker.

The links open the build a maintainer last uploaded with `pnpm demos:upload`,
which can be older than the figures in this README and look different from them.

The demo lives at [jbrowse.org/demos/tview/](https://jbrowse.org/demos/tview/) —
the config and the plugin bundle both, and that folder opens the first of them —
and runs in [JBrowse Web nightly](https://jbrowse.org/code/jb2/main/), the
nightly because the plugin needs a JBrowse v5 host (see
[Requirements](#requirements)). Hosting it there rather than pointing at a
config on GitHub and a bundle on a CDN is what makes it one click: jbrowse-web
asks a visitor to confirm a **cross origin** config that names a UMD plugin,
which is the right thing for it to do and put a dialog headed "Warning" in front
of a README link. Served from the origin the JBrowse is on, the question does
not arise.

Hosting the bundle there also frees the demo from npm releases:
`pnpm demos:upload` puts the **built** bundle there. Each link is the session
spec its figure below was taken from, so after an upload the demo, the
screenshot and the numbers are three renderings of one window.

## Insertions

![An Alu insertion in HG002 at chr1:5,934,288, as a JBrowse pileup above, where each read's copy is a purple box with its length, and as a tview below, where its bases have columns](img/insertion-alu.png)

An Alu in an intron of NPHP4, in HG002's PacBio HiFi reads. JBrowse's pileup
above draws each read's copy as a purple box labelled with its length, 282 to
285bp in the reads on screen. The tview below aligns the copies to each other in
290 columns, with the poly-A tail in green at the right-hand end, and the rows
without the insertion are blank across them. [Open this one
live][tview-demo-alu].

The GIAB HG002 structural-variant benchmark (v0.6, GRCh37) calls this a
heterozygous 283bp insertion after 1:5,934,288. It was found by taking that
benchmark's heterozygous insertions of 280 to 330bp outside tandem repeats and
segmental duplications, and counting, in each of the trio's BAMs, the reads that
span each one and the reads with an insertion of 200bp or more within 100bp of
it. Here 22 of HG002's 44 spanning reads have it, 24 of his father's 54 do, and
none of his mother's 31 do, which is what [the same window in all
three][tview-demo-alu-trio] shows.

Each insertion site is as wide as the longest sequence inserted there, after the
sequences are aligned to each other:

- **Inserted sequences are aligned to the commonest one.** At each site, the
  sequence the most reads carry is the centre, ties going to the length nearest
  the median, and every other distinct sequence is aligned to it. The alignment
  is banded, so its time grows with length times divergence rather than with
  length squared. A site whose alignments would take more than a fixed budget of
  work is left left-justified. A site whose inserted sequence is copies of one
  unit is laid out a copy per block instead (see
  [Tandem repeats](#tandem-repeats)).
- **Insertions are left-normalized.** An aligner can anchor the same `CA`
  inserted in a `CACACA` run at either end of it. Each read's insertion is moved
  left through the read's own bases for as long as the read spells the same
  sequence, so reads carrying one event share one site. An insertion a tandem
  array owns stays where the array put it.
- **A read that does not span a site is absent there.** In the alignment's text,
  a read that spans a site without inserting has `-` in its columns, and a read
  that does not span it has `.`.

![The volvox test reads at ctgA:15,140..15,190 in a tview, where the inserted bases have a column of their own](img/tview-insertion.png)

The volvox test reads at `ctgA:15,140..15,190`. The 1bp insertion after 15,163
is a column of its own, bracketed as "+1bp after ctgA:15,163": the reads with
the insertion show their base there, a C in all but one. Bases that match the
reference are dots on grey, and a row is white where its read has no base.

Each insertion site has a bracket in the Highlights strip above the alignment,
labelled with the size and the reference base it follows, such as
`+1bp after ctgA:15,163`. The size is the length most of the reads at the site
insert: HG002's reads have 280 to 287bp of the Alu above, and the bracket over
its 290 columns is labelled `+283bp`. Each tandem array has a bracket labelled
with its unit and the reference's copy count, such as
`(GCG)x21 in the reference`. In a noisy window only the 100 sites carrying the
most inserted sequence get a bracket. A one-column bracket draws as a triangle,
and where brackets crowd, some are drawn without their label. Hovering a bracket
outlines its columns, a click selects them, and a double click zooms to them.

## How it is built

The alignment is built in an **RPC worker** (`TviewGetPlan`), so the reads never
cross to the main thread — the fetch, the pairwise alignments and the string
building all happen there, and what comes back is the alignment, a table of what
each row is, the brackets and any base modification calls. That is also what
makes several files one call: their rows are squared up against the same
reference interval, so an array's copies are counted once, over rows from all of
them.

## Tandem repeats

![ABCA7 VNTR alleles in HG003, one row per read with its copy count as a bar and a number beside it](img/repeat-abca7-vntr.png)

The ABCA7 VNTR in one PacBio HiFi sample, a copy per block of columns. Each
row's copy count is the bar and the number beside it, and the rows sort by it,
so the genotype is the step in the ladder — the two alleles the table below
reports for HG003, with a few reads off them. Laid out base by base this is
2.2kb of sequence with nothing to line it up against. [Open this one
live][tview-demo-abca7].

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
- **each row's copy count is drawn beside it**, as a bar in the `copies` panel
  and a number in the `n` panel, which is the measurement, rather than leaving
  it to be read off where the row ends.
- **rows sort by copy count, most copies first**, within each sample's band, so
  the alleles form a ladder.
- the column width starts at whatever puts the whole alignment in about 3,000px,
  between 1 and 10px, so a long array is mostly on screen.

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

![FMR1 CGG in the GIAB trio, rows in a band per sample with the reference band on top](img/repeat-fmr1-trio.png)

The FMR1 CGG repeat in the GIAB Ashkenazi trio, all three files in one
alignment. Rows are grouped in a band per sample, labelled in the gutter beside
the read names, with the reference in a band of its own on top, and the rows in
each band sort by copy count. A band is named after the `sample` its track was
given in the view's `init`, or after the track. [Open this one
live][tview-demo-fmr1].

The copy numbers are checkable, which is the point of this locus: FMR1 is on the
X, so the two male samples come back with one allele each and the mother with
two, and the son's single allele is one of his mother's, as an X-linked allele
has to be. The counts are in the genotype table above, where they are measured
rather than typed.

Three things about this figure are settings rather than data:

- **Columns only one row has a base in are hidden**, with react-msaview's gap
  threshold set to whatever percent means "one row" for the number of rows there
  are, because a column takes the same width whether 124 rows use it or one
  does. That is read error, and it is a fifth of the columns at some of these
  loci; the rows that carry one keep an insertion marker where it was. What each
  figure is made of:

<!-- repeat-figures -->

| figure                                    | rows | columns | columns one row has | hidden |
| ----------------------------------------- | ---- | ------- | ------------------- | ------ |
| [fmr1](img/repeat-fmr1-trio.png)          | 124  | 218     | 24                  | 11%    |
| [htt](img/repeat-htt-trio.png)            | 182  | 222     | 25                  | 11%    |
| [atxn3](img/repeat-atxn3-trio.png)        | 157  | 159     | 18                  | 11%    |
| [atxn3-hg004](img/repeat-atxn3-hg004.png) | 53   | 145     | 4                   | 3%     |
| [abca7](img/repeat-abca7-vntr.png)        | 16   | 3630    | 1253                | 35%    |

<!-- /repeat-figures -->

- **The label column is 220px**, so the read names are cut in the middle. The
  view fits the column to the widest name unless told otherwise.
- **The window is sized to the alignment**, because a JBrowse view taller than
  its window loses its last rows with nothing on screen to say so, and what
  falls off the bottom is the last band, a whole sample. `pnpm figures:giab`
  grows the window to the content and warns when it cannot.

## Base modifications

When the reads carry MM/ML tags, the view places each read's most probable call
at each base on that base, inserted bases included. Hovering a cell names the
call, such as `5mC 97%`. The view's menu gains a **Base modifications** submenu:

- **Color by bases**, the default, keeps the base colours.
- **Color by modification** fills each called base on a scale from blue (0%) to
  red (100%) of its call's probability, with a legend.

![Nanopore reads with 5mC calls at 20:13,226..13,275, coloured by modification, with a called base in an insertion column](img/tview-modifications.png)

Seven nanopore reads from `public/methylation_clip.bam`, coloured by
modification. The red G in the second read sits in the column bracketed after
20:13,243, a base the reference does not have; the read is on the reverse
strand, so its called C reads as a G.

The calls have limits:

- **At most 50,000 calls per view.** Past that the least probable are left out,
  and the menu says how many.
- **A row whose letters are not one unbroken run of its read's sequence gets no
  calls**, since a call projected onto it could land on the wrong base. That
  happens inside a tandem array, where a read's insertion was re-filed into the
  array or the row has no allele for a block. The menu counts these rows as "not
  annotated".
- **One call per base.** A base called as both 5mC and 5hmC shows the more
  probable of the two.

## Usage

Install the plugin, then open a tview in one of three ways:

- **From an alignments track.** The track menu (vertical `...`) has **Launch
  tview for visible region**, which opens the view at once over the region in
  view. It is disabled, with the reason beneath it, when the region is wider
  than 20,000bp or spans more than one region.
- **From a selection.** Drag across the genome view's ruler to select a region,
  then choose **Launch** -> **Tview of all alignments tracks**, which reads
  every alignments track open in that view into one alignment.
- **From a session or a link**, with no click path (see below).

The view's own menu (the hamburger on its title bar) changes what it shows:

- **Tracks** ticks which alignments tracks the view reads: those open in the
  genome view it came from, and any others it already reads. At least one stays
  ticked.
- **Show the connected view's current region** rebuilds the view over whatever
  the genome view is showing now, with the same limits as the track menu.
- **Zoom to base level on click?** switches a click on a column between centring
  the genome view there and zooming it to that base.
- **Base modifications** appears when the reads carry calls (see above).

The view stays connected to the genome view it came from:

- Hovering a column highlights that position in the genome view, and a click
  keeps it highlighted and moves the genome view there.
- Hovering the genome view highlights that base of the reference row in the
  alignment.

While it builds, the view says what it is waiting for. When it cannot load a
region, it shows why in place of the alignment, with a retry button where
retrying can help. Besides the 20,000bp limit, an alignment is refused past 25
million cells (rows times columns), since every read is a full-width row.

### As a session, with no click path

A tview is a locus, an assembly and the tracks to read it from, so it can be
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

`assembly`, `loc` and `tracks` are required, and a spec missing one fails with
"A TView spec needs an assembly name, a loc string and a tracks array of
trackIds". A track is a trackId or `{ trackId, sample }`, where `sample` names
its band. Every other key is passed to the view as is, such as
`connectedViewId`, `colWidth` or `rowHeight`, and the view is titled with its
locus unless `displayName` says otherwise.

Either way the view resolves it itself, which is also how a restored session
gets its alignment back: the alignment is never written into the session, so
`init` is what persists, and the view rebuilds from it.

`public/repeats.json` is a working example — the GIAB trio on hosted hg19, with
a tview at FMR1 open on load.

## Requirements

A JBrowse v5 host: `@jbrowse/core` 5.0.0 or later. No v5 is released yet (npm's
`latest` is 4.3.0), so today that means
[JBrowse Web nightly](https://jbrowse.org/code/jb2/main/) or a `5.0.0-beta`
build from npm's `next` tag; this version was built and tested against
5.0.0-beta.23.

## Features react-msaview lacks

This view would use two things react-msaview does not have yet:

- **A ruler in genomic coordinates.** The position ruler, off by default,
  numbers the reference row's own residues, so it counts from 1 at the start of
  the window rather than from the chromosome position.
- **Base colours under modification fills.** Coloured by modification, a cell
  with no call loses its base colour, so a mismatch reads only as its letter.

## Development

```bash
pnpm install
pnpm start            # dev server on :9000 (or $PORT), serves dist/out.js with CORS
pnpm test             # unit tests
pnpm test:e2e         # puppeteer tests (creates .test-jbrowse on first run)
pnpm lint
pnpm build

pnpm figure           # the figures in img/ from the fixtures in public/
pnpm figures:giab     # the figures in img/ from the GIAB trio
pnpm report:repeats   # copy numbers at known loci, from live GIAB data
pnpm demos            # public/demo.json and the live-demo links above
pnpm demos:upload     # ...and push both to jbrowse.org/demos/tview/
```

`demos` regenerates the hosted config from `public/repeats.json` and the links
from the same figure definitions, so the demo, the screenshot and the numbers
are three renderings of one window. It needs no network, so `pnpm demos --check`
runs in Integration on every push, where the measured tables have to wait for
the weekly Measurements run.

`demos:upload` builds first, then writes `config.json`, `plugin.js` and an
`index.html` under `s3://jbrowse.org/demos/tview/` and invalidates that path.
The index is only there so the folder itself is a link rather than a 404 for
whoever trims one of the long ones. It needs AWS credentials for the bucket, so
it is a thing a maintainer runs and not a thing CI does — and it is the only
step between a change here and what the links open.

The figures are defined in `scripts/lib/figures.mjs` as session specs and taken
by `scripts/lib/capture.mjs`, which starts its own dev server on port 9000, or
on `FIGURE_PORT` when it is set (with esbuild's own server 400 above it). On
another port it writes a copy of the config naming the bundle there and deletes
it afterwards. The harness prints what each figure holds (rows, columns, hidden
columns, brackets, whether residue letters are drawn) and warns when a repeat
figure came out with no copy counts or with rows or columns that did not fit.

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

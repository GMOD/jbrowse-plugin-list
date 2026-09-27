# Bandage layout engine

`native/` is the C++ port of Bandage's FMMM layout (OGDF), ~1,100 lines: the
graph model, the OGDF wiring, and the Emscripten bindings. It lives here rather
than in a BandageNG checkout so a change to the layout is a reviewable diff in
this repo, beside the figures it moves.

`bandage-layout.js` is the generated artifact — an Emscripten build of `native/`
compiled with `-sSINGLE_FILE=1`, so the wasm is embedded as base64 and the file
is a self-contained ES module with no imports. That is what lets `esbuild` leave
it alone and the plugin load it as a lazy chunk at runtime.

Regenerate with `pnpm build:wasm` (`scripts/build-wasm.sh`). The Emscripten SDK
is the only thing you have to install: OGDF is **vendored** at `vendor/ogdf`
(elderberry-202309, patched — see [`vendor/README.md`](../../vendor/README.md)),
so there is no checkout to find, no network, and no version to get wrong. About
four minutes from nothing on 16 cores, seconds once `libOGDF.a` exists.

`OGDF_DIR` still points it elsewhere if you are testing an upstream bump.

### OGDF's own age is not a suspect

The script reuses `libOGDF.a` whenever one is there, so the OGDF an artifact was
linked against can be much older than the Emscripten that linked it. Measured
rather than assumed: rebuilding OGDF from scratch under emcc 6.0.6, against a
`libOGDF.a` built by whatever was current in October 2025, moved **no coordinate
in any of the 90 digest cases** (2026-08-13). Reach for `layout-digest.mjs`
below to establish that again rather than trusting this line.

`pnpm test:wasm` runs the committed artifact for real. Three things it guards:
the file is minified glue that any reformatter (eslint --fix, prettier) will
silently corrupt; **the layout is deterministic** — FMMM used to seed its
initial placement from `clock()`, which moved ~2% of the pixels in every
force-directed screenshot between regens, and the seed is now fixed
(`LayoutSettings::randomSeed`) and overridable per call with a `seed` option;
and the linear layout draws a graph whose **segment names are not integers**.

A node may also carry an `x`/`y`. The engine reads it as where that node's chain
starts (`addToOgdfGraph`) and switches FMMM to `KeepPositions`, so a
reference-anchored graph can hand it the backbone laid along x and the alleles
under their anchors (`layout/referenceSeeds.ts`). Send `rotateComponents: false`
with them: FMMM otherwise turns each component to the angle of least area, and
packing may tip it a further 90 degrees, which would throw away the orientation
the seeds stated. Off, the components are still packed, just not turned. A graph
with no seeds and the option absent draws exactly as before, which
`layout-digest.mjs` checks; its `seeded` rows cover the new path.

That last one is narrow on purpose. `determineLinearNodePositions` is the only
code that reads a segment's name and the only code reached by `linearLayout`,
and the smoke graph's segments were called `1`..`6`, so it never exercised the
branch a minigraph rGFA takes. See `parseWholeInt` in `native/include/types.h`
for what was hiding there.

## Nothing in native/ may throw

Emscripten builds with exception catching off by default, so `throw` is not
caught, it is `abort()` — including a `throw` from inside a `try` with a
`catch (...)` right there, because the handler is compiled away. A `std::stoi`
wrapped in exactly that shape read as careful and took the module down on every
graph whose segments were named `s1`.

An abort is not contained either. The call that aborts leaks whatever it had
allocated, so repeated ones exhaust the heap, and `loadBandage()` caches one
module per worker — measured, about twenty aborted calls and every _later_
layout fails with "memory access out of bounds" until the tab is reloaded. That
is why ownership here is `std::unique_ptr` rather than a matched `new`/`delete`:
not tidiness, but bounding what a future throw can cost.

## emcc is a lenient judge of includes

`settings.h` called `ceil()` for years without including `<cmath>`. It compiled
because emcc's libc++ pulls the header in transitively; libstdc++ does not, and
the file was only ever compiled by emcc, so nothing said so. It surfaced when
`scripts/profile/` compiled the identical sources with g++ and both translation
units failed on that one line.

The vendored OGDF needed the same fix for `<chrono>` (hunk 2 of
`vendor/ogdf-emscripten.patch`), so this is a pattern rather than a one-off, and
a header that is not self-contained is a latent break in any future toolchain
bump. `g++ -fsyntax-only -Ivendor/ogdf/include -Ivendor/ogdf/build-wasm/include`
over `src/graphlayout.cpp` is a seconds-long check for it that needs no native
OGDF.

## Verifying a rebuild

The artifact's bytes move for reasons that have nothing to do with the layout —
a different Emscripten, a different build host — so diffing the file says
nothing. Diff the **drawing**, which is what every committed figure is a
function of:

```console
git show HEAD:src/bandage/bandage-layout.js > /tmp/old-engine.mjs
node scripts/layout-digest.mjs /tmp/old-engine.mjs > /tmp/before.txt
pnpm build:wasm
node scripts/layout-digest.mjs > /tmp/after.txt
diff /tmp/before.txt /tmp/after.txt
```

That hashes full-precision coordinates over five graph shapes against every
option the view sends. Expect an empty diff for a change that was not meant to
move anything; every line that does change is a figure that will need
regenerating, and should be one you can name in advance.

`.github/workflows/wasm-rebuild.yml` runs exactly this weekly, and puts the diff
in the job summary. So the question it answers is not "did the bytes change" but
"does the committed engine still draw what its sources say it draws". It needs
no checkout but this one now that OGDF is vendored, and no `pnpm install`: both
scripts run on bare node.

**On one host with one Emscripten the build is byte-reproducible**, which this
file previously denied — it claimed Emscripten embeds the build path. It does
not: the `<cmath>` regen (2026-08-13) was run from a worktree, i.e. a different
absolute path to every source, and `git status` came back clean against an
artifact built in the primary checkout. So for a change that is meant to be a
no-op, an unmodified `bandage-layout.js` is the strongest confirmation available
and comes for free; the digest is what you need when it _does_ differ, and
across Emscripten versions, where the bytes genuinely do move.

Upstream: https://github.com/cmdcolin/BandageNG-web (`bandage-layout-js/`)

Both Bandage and OGDF are GPL, which is why this plugin is GPL-3.0-or-later.

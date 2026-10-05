---
name: derive-jbrowserange-from-the-boot-matrix
description: Derive jbrowseRange from the boot matrix check-plugins.ts already runs instead of a hand-written declaration, so a plugin that drops v4.0.0 stops jamming the pipeline.
---

# Derive jbrowseRange from the boot matrix

Deriving `jbrowseRange` from the boot matrix rather than from a declaration.
`check-plugins.ts` already boots every promoted bundle across `v4.0.0..latest`,
which is a measured compatibility set, and it currently throws that measurement
away and exits 1 on any host failure — so a plugin that legitimately drops
v4.0.0 support jams the whole pipeline until someone hand-writes a narrowed pin.
Refs are what would make a measured range do something: an old host and a new
one loading the same genark config could be served different builds.

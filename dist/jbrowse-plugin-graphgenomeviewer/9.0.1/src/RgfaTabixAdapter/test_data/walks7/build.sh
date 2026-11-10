#!/usr/bin/env bash
# Rebuilds the walk-file fixtures from their GFAs with gfa-to-tabix 4.0, in
# walk format 7, at the tile size the tests' windows assume.
# Usage: test_data/walks7/build.sh <gfa-to-tabix binary>
set -euo pipefail
cd "$(dirname "$0")"
B=${1:?the gfa-to-tabix binary}
build() {
  local name=$1 gfa=$2; shift 2
  "$B" "$gfa" --walks -o "$name.tmp" "$@" > /dev/null 2>&1
  local out
  for out in "$name".tmp.*.walks.gz; do
    local sample=${out#"$name".tmp.}; sample=${sample%.walks.gz}
    mv "$out" "$name.$sample.walks.gz"
    mv "$out.idx" "$name.$sample.walks.gz.idx"
  done
}
build header header.GRCh38.gfa --refs GRCh38 --tile 1000
build twopart twopart.GRCh38.gfa --refs GRCh38 --tile 1000
build maxnode maxnode.GRCh38.gfa --refs GRCh38 --tile 1000
build follow follow.GRCh38.gfa --refs GRCh38 --tile 1000
build rejoin follow.GRCh38.gfa --refs GRCh38 --tile 10000
build skip skip.GRCh38.gfa --refs GRCh38 --tile 10
build skipfollow skipfollow.GRCh38.gfa --refs GRCh38 --tile 1000
build skipinv skipinv.GRCh38.gfa --refs GRCh38 --tile 1000
build inversion inversion.GRCh38.gfa --refs GRCh38 --tile 10000
build lanepairs lanepairs.GRCh38.gfa --refs GRCh38 --tile 1000

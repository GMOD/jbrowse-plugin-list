import { getSession } from '@jbrowse/core/util';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { syncGenomeHoverToMsaColumn } from './afterCreateAutoruns';
// Mock only getSession; keep the rest of the util module real so the
// afterCreateAutoruns import graph still loads.
vi.mock('@jbrowse/core/util', async (importOriginal) => ({
    ...(await importOriginal()),
    getSession: vi.fn(),
}));
const mockGetSession = vi.mocked(getSession);
const mafRegion = {
    refName: 'chr1',
    start: 1000,
    end: 1010,
    assemblyName: 'hg38',
};
// A model wired through the real genomeToMSA path: a connected genome view
// over a maf region, with seqPosToVisibleCol as identity so the asserted
// column equals the ungapped offset into the region.
function makeModel() {
    const calls = [];
    const model = {
        querySeqName: 'hg38.chr1',
        transcriptToMsaMap: undefined,
        mafRegion,
        connectedView: { initialized: true, assemblyNames: ['hg38'] },
        seqPosToVisibleCol: (_name, pos) => pos,
        setMousePos: (col) => {
            calls.push(col);
        },
    };
    return { model, calls };
}
function hoverGenome(coord) {
    mockGetSession.mockReturnValue({
        hovered: { hoverFeature: {}, hoverPosition: { coord, refName: 'chr1' } },
    });
}
function clearGenomeHover() {
    mockGetSession.mockReturnValue({
        hovered: null,
    });
}
describe('syncGenomeHoverToMsaColumn (real genomeToMSA mapping)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    test('genome hover at coord 1005 highlights MSA column 5', () => {
        const { model, calls } = makeModel();
        const run = syncGenomeHoverToMsaColumn(model);
        hoverGenome(1005); // 1005 - mafRegion.start(1000) = ungapped 5
        run();
        expect(calls).toEqual([5]);
    });
    test('moving the genome hover moves the highlighted column', () => {
        const { model, calls } = makeModel();
        const run = syncGenomeHoverToMsaColumn(model);
        hoverGenome(1002);
        run();
        hoverGenome(1007);
        run();
        expect(calls).toEqual([2, 7]);
    });
    test('leaving the genome clears the column it set', () => {
        const { model, calls } = makeModel();
        const run = syncGenomeHoverToMsaColumn(model);
        hoverGenome(1004);
        run();
        clearGenomeHover();
        run();
        expect(calls).toEqual([4, undefined]);
    });
    test('a hover outside the maf region clears a previously-set column once', () => {
        const { model, calls } = makeModel();
        const run = syncGenomeHoverToMsaColumn(model);
        hoverGenome(1004);
        run();
        hoverGenome(5000); // outside [1000,1010) -> genomeToMSA returns undefined
        run();
        run();
        expect(calls).toEqual([4, undefined]);
    });
    test('never touches mouseCol when the genome never provides a column, so a direct MSA hover survives unrelated session hovers', () => {
        const { model, calls } = makeModel();
        const run = syncGenomeHoverToMsaColumn(model);
        clearGenomeHover();
        run();
        hoverGenome(9999); // unrelated/out-of-range hover elsewhere
        run();
        expect(calls).toEqual([]);
    });
});

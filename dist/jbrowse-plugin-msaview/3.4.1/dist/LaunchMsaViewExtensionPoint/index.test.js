import { expect, test } from 'vitest';
import LaunchMsaViewExtensionPointF from './index';
function launch(args) {
    let run;
    LaunchMsaViewExtensionPointF({
        addToExtensionPoint(_name, cb) {
            run = cb;
        },
    });
    const added = [];
    const session = {
        addView(_type, snapshot) {
            added.push(snapshot);
            return { id: 'view-1' };
        },
    };
    run({ session, ...args });
    return added[0];
}
test('inline data carries no init, which the panel would read as a launch in flight', () => {
    const snapshot = launch({ data: { msa: '>a\nMEEP' } });
    expect('init' in snapshot).toBe(false);
});
test('a file location travels through init', () => {
    const snapshot = launch({
        msaFileLocation: { uri: 'http://example.com/a.fa' },
    });
    expect(snapshot.init).toEqual({
        msaUrl: 'http://example.com/a.fa',
        msaIndexedLocation: undefined,
        msaName: undefined,
        querySeqName: undefined,
    });
});
test('one field set is enough to need init', () => {
    const snapshot = launch({ data: { msa: '>a\nMEEP' }, querySeqName: 'QUERY' });
    expect(snapshot.init).toEqual({
        msaUrl: undefined,
        msaIndexedLocation: undefined,
        msaName: undefined,
        querySeqName: 'QUERY',
    });
});

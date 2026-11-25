// @vitest-environment jsdom
import React from 'react';
import { SimpleFeature } from '@jbrowse/core/util';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { observer } from 'mobx-react';
import { afterEach, expect, test, vi } from 'vitest';
import BlastPanel from './BlastPanel';
const mounted = vi.fn();
const Probe = observer(function Probe({ name, children, }) {
    React.useEffect(() => {
        mounted(name);
    }, [name]);
    return (React.createElement(React.Fragment, null,
        children,
        React.createElement("input", { "aria-label": `${name} input`, defaultValue: "" })));
});
vi.mock('./BlastAutomaticPanel', () => ({
    default: observer(function ({ children }) {
        return React.createElement(Probe, { name: "automatic" }, children);
    }),
}));
vi.mock('./BlastManualPanel', () => ({
    default: observer(function ({ children }) {
        return React.createElement(Probe, { name: "manual" }, children);
    }),
}));
afterEach(() => {
    cleanup();
    mounted.mockClear();
});
const feature = new SimpleFeature({
    uniqueId: 'gene1',
    refName: 'chr1',
    start: 0,
    end: 10,
});
const model = {};
function pick(label) {
    const radio = screen
        .getAllByLabelText(label)
        .find(el => !el.closest('[hidden]'));
    fireEvent.click(radio);
}
test('flipping Automatic and Manual keeps what each panel holds', () => {
    render(React.createElement(BlastPanel, { handleClose: () => { }, model: model, feature: feature }));
    fireEvent.change(screen.getByLabelText('automatic input'), {
        target: { value: 'hit count' },
    });
    pick('Manual');
    fireEvent.change(screen.getByLabelText('manual input'), {
        target: { value: 'pasted alignment' },
    });
    pick('Automatic');
    pick('Manual');
    expect(screen.getByDisplayValue('hit count')).toBeTruthy();
    expect(screen.getByDisplayValue('pasted alignment')).toBeTruthy();
    expect(mounted.mock.calls).toEqual([['automatic'], ['manual']]);
});
test('only the chosen panel is shown, and Manual mounts on first use', () => {
    render(React.createElement(BlastPanel, { handleClose: () => { }, model: model, feature: feature }));
    expect(screen.getByLabelText('automatic input').closest('[hidden]')).toBeNull();
    expect(screen.queryByLabelText('manual input')).toBeNull();
    pick('Manual');
    expect(screen.getByLabelText('automatic input').closest('[hidden]')).not.toBeNull();
    expect(screen.getByLabelText('manual input').closest('[hidden]')).toBeNull();
});
test('the EBI settings gear is offered only where a job goes to EBI', () => {
    render(React.createElement(BlastPanel, { handleClose: () => { }, model: model, feature: feature }));
    expect(screen.getByLabelText('EBI settings')).toBeTruthy();
    pick('Manual');
    expect(screen.queryByLabelText('EBI settings')).toBeNull();
});

// @vitest-environment jsdom
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import TabPanel from './TabPanel';
afterEach(() => {
    cleanup();
});
function Panels({ value }) {
    return (React.createElement(React.Fragment, null,
        React.createElement(TabPanel, { value: value, index: "a" },
            React.createElement(Probe, { name: "a" })),
        React.createElement(TabPanel, { value: value, index: "b" },
            React.createElement(Probe, { name: "b" }))));
}
const mounted = vi.fn();
function Probe({ name }) {
    React.useEffect(() => {
        mounted(name);
    }, [name]);
    return React.createElement("input", { defaultValue: name });
}
test('a visited panel keeps its state while another tab is shown', () => {
    const { rerender } = render(React.createElement(Panels, { value: "a" }));
    const typed = screen.getByDisplayValue('a');
    typed.value = 'edited';
    rerender(React.createElement(Panels, { value: "b" }));
    rerender(React.createElement(Panels, { value: "a" }));
    expect(screen.getByDisplayValue('edited')).toBeTruthy();
    expect(mounted.mock.calls.filter(([n]) => n === 'a')).toHaveLength(1);
});
test('an unvisited panel does not mount, so it fetches nothing', () => {
    mounted.mockClear();
    render(React.createElement(Panels, { value: "a" }));
    expect(mounted.mock.calls.map(([n]) => n)).toEqual(['a']);
});

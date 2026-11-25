import React from 'react';
export declare function tabProps(tabsId: string, index: number | string): {
    id: string;
    'aria-controls': string;
};
declare const TabPanel: ({ children, value, index, tabsId, }: {
    children?: React.ReactNode;
    index: number | string;
    value: number | string;
    tabsId?: string;
}) => React.JSX.Element;
export default TabPanel;

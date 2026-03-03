import React from 'react';
declare const SetRowHeightDialog: (props: {
    model: {
        rowHeight?: number;
        rowProportion?: number;
        setRowHeight: (arg: number) => void;
        setRowProportion: (arg: number) => void;
    };
    handleClose: () => void;
}) => React.JSX.Element;
export default SetRowHeightDialog;

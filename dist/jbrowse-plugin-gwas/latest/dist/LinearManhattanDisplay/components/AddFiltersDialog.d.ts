import React from 'react';
declare const AddFiltersDialog: ({ model, handleClose, }: {
    model: {
        jexlFilters?: string[];
        activeFilters: string[];
        setJexlFilters: (arg?: string[]) => void;
    };
    handleClose: () => void;
}) => React.JSX.Element;
export default AddFiltersDialog;

import React from 'react';
import { MultilevelLinearViewModel } from '../model';
type MLLV = MultilevelLinearViewModel;
declare const Header: ({ model, ExtraButtons, }: {
    model: MLLV;
    ExtraButtons?: React.ReactNode;
}) => React.JSX.Element;
export default Header;

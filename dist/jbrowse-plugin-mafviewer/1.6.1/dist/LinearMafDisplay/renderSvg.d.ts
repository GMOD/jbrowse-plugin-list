import React from 'react';
import type { LinearMafDisplayModel } from './stateModel';
import type { ExportSvgDisplayOptions } from '@jbrowse/plugin-linear-genome-view';
export declare function renderSvg(self: LinearMafDisplayModel, opts: ExportSvgDisplayOptions, superRenderSvg: (opts: ExportSvgDisplayOptions) => Promise<React.ReactNode>): Promise<React.JSX.Element>;

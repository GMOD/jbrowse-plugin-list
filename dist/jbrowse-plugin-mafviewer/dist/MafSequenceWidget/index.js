import { lazy } from 'react';
import WidgetType from '@jbrowse/core/pluggableElementTypes/WidgetType';
import MafSequenceHoverHighlightExtensionF from './MafSequenceHoverHighlightExtension';
import { configSchema } from './configSchema';
import { stateModelFactory } from './stateModelFactory';
export default function MafSequenceWidgetF(pluginManager) {
    pluginManager.addWidgetType(() => new WidgetType({
        name: 'MafSequenceWidget',
        heading: 'MAF Sequence',
        configSchema: configSchema,
        stateModel: stateModelFactory(),
        ReactComponent: lazy(() => import('./MafSequenceWidget')),
    }));
    MafSequenceHoverHighlightExtensionF(pluginManager);
}
//# sourceMappingURL=index.js.map
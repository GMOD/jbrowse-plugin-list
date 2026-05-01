import { types } from '@jbrowse/mobx-state-tree';
import { ConfigurationReference } from '@jbrowse/core/configuration';
import { getParentRenderProps } from '@jbrowse/core/util/tracks';
import { getSession, isSessionModelWithWidgets } from '@jbrowse/core/util';
import FilterListIcon from '@mui/icons-material/FilterList';
const linearGDCDisplayModel = (pluginManager, configSchema) => {
    const { BaseLinearDisplay } = pluginManager.getPlugin('LinearGenomeViewPlugin').exports;
    return types
        .compose('LinearGDCDisplay', BaseLinearDisplay, types.model({
        type: types.literal('LinearGDCDisplay'),
        configuration: ConfigurationReference(configSchema),
    }))
        .actions(self => ({
        openFilterConfig() {
            const session = getSession(self);
            if (isSessionModelWithWidgets(session)) {
                const editor = session.addWidget('GDCFilterWidget', 'gdcFilter', {
                    target: self.parentTrack.configuration,
                });
                session.showWidget(editor);
            }
        },
        selectFeature(feature) {
            const session = getSession(self);
            if (isSessionModelWithWidgets(session)) {
                const featureWidget = session.addWidget('VariantFeatureWidget', 'gdcFeature', { featureData: feature.toJSON() });
                session.showWidget(featureWidget);
                session.setSelection(feature);
            }
        },
    }))
        .views(self => {
        const { renderProps: superRenderProps, trackMenuItems: superTrackMenuItems, } = self;
        return {
            renderProps() {
                return {
                    ...superRenderProps(),
                    ...getParentRenderProps(self),
                    displayModel: self,
                    config: self.configuration.renderer,
                };
            },
            get rendererTypeName() {
                return self.configuration.renderer.type;
            },
            trackMenuItems() {
                return [
                    ...superTrackMenuItems(),
                    {
                        label: 'Filter',
                        onClick: () => {
                            self.openFilterConfig();
                        },
                        icon: FilterListIcon,
                    },
                ];
            },
        };
    });
};
export default linearGDCDisplayModel;
//# sourceMappingURL=model.js.map
import AdapterType from "@jbrowse/core/pluggableElementTypes/AdapterType";
import Plugin from "@jbrowse/core/Plugin";
import { AdapterClass, configSchema } from "./CIVICAdapter";
import { autorun } from "mobx";
import { resolveIdentifier } from "mobx-state-tree";
import { version } from "../package.json";
import PluginManager from "@jbrowse/core/PluginManager";

export default class CIVICPlugin extends Plugin {
  name = "CIVICPlugin";
  version = version;
  install(pluginManager: any) {
    pluginManager.addAdapterType(
      () =>
        new AdapterType({
          name: "CIVICAdapter",
          configSchema,
          AdapterClass,
        }),
    );
  }

  configure(pluginManager: PluginManager) {
    autorun(() => {
      const root = pluginManager.rootModel;
      const session = root?.session;
      if (root && session) {
        //@ts-ignore remove me once this is in abstract session model
        const trackConfigSchema = pluginManager.pluggableConfigSchemaType(
          "track",
        );
        const trackId = "civic_hg19";
        //@ts-ignore
        const found = resolveIdentifier(trackConfigSchema, root, trackId);
        if (!found) {
          //@ts-ignore
          session.addTrackConf({
            trackId,
            type: "FeatureTrack",
            name: "CIVIC cancer variants hg19",
            category: ["Annotation"],
            assemblyNames: ["hg19"],
            adapter: {
              type: "CIVICAdapter",
              base: "https://civicdb.org/api/variants?count=9999999&page=1",
            },
          });
        }
      }
    });
  }
}

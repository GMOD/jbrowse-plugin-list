import TviewGetPlan from './TviewGetPlan'

import type PluginManager from '@jbrowse/core/PluginManager'

export default function TviewGetPlanRpcF(pluginManager: PluginManager) {
  pluginManager.addRpcMethod(() => new TviewGetPlan(pluginManager))
}

export type {
  TviewArrayReport,
  TviewGetPlanArgs,
  TviewPlanResult,
  TviewSourceArgs,
} from './TviewGetPlan'

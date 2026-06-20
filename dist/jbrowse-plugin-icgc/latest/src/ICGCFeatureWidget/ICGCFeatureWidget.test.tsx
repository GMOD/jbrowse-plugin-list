import React from 'react'
import { types } from 'mobx-state-tree'
import { render } from '@testing-library/react'
import { ConfigurationSchema } from '@jbrowse/core/configuration'
import PluginManager from '@jbrowse/core/PluginManager'
import ICGCFeatureDetails from './ICGCFeatureWidget'
import { stateModelFactory } from '.'

describe('ICGCTrack widget', () => {
  it('renders a mutation with the required model elements', () => {
    console.warn = jest.fn()
    const pluginManager = new PluginManager([])
    const Session = types.model({
      pluginManager: types.optional(types.frozen(), {}),
      rpcManager: types.optional(types.frozen(), {}),
      configuration: ConfigurationSchema('test', {}),
      widget: stateModelFactory(pluginManager),
    })
    const model = Session.create({
      widget: { type: 'ICGCFeatureWidget' },
    })

    model.widget.setFeatureData({
      refName: 'chr3',
      type: 'single base substitution',
      start: 124907170,
      end: 124907171,
      id: 'MU125557849',
      chromosome: 3,
      mutation: 'G>T',
      assemblyVersion: 'GRCh37',
      referenceGenomeAllele: 'G',
      testedDonorCount: 186,
      affectedDonorCountTotal: 1,
      affectedDonorCountFiltered: 1,
      affectedProjectCount: 1,
      functionalImpact: 'Unknown',
    })

    const { container } = render(<ICGCFeatureDetails model={model.widget} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('renders a gene with the required model elements', () => {
    console.warn = jest.fn()
    const pluginManager = new PluginManager([])
    const Session = types.model({
      pluginManager: types.optional(types.frozen(), {}),
      rpcManager: types.optional(types.frozen(), {}),
      configuration: ConfigurationSchema('test', {}),
      widget: stateModelFactory(pluginManager),
    })
    const model = Session.create({
      widget: { type: 'ICGCFeatureWidget' },
    })

    model.widget.setFeatureData({
      refName: 'chr3',
      type: 'MU128994531',
      start: 124909350,
      end: 124909349,
      id: 'DO52170',
      donorId: 'DO52170',
      mutationId: 'MU128994531',
      chromosome: 3,
      projectId: 'LIHC-US',
      mutation: 'G>T',
    })

    const { container } = render(<ICGCFeatureDetails model={model.widget} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})

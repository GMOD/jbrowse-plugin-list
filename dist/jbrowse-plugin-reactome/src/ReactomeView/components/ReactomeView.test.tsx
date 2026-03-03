import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ReactomeView from './ReactomeView'
import { types } from 'mobx-state-tree'
import fetchMock from 'jest-fetch-mock'

fetchMock.enableMocks()

describe('<ReactomeView />', () => {
  it('renders submits gene query', async () => {
    const m = types.model({ displayName: 'ReactomeView' }).create()
    render(<ReactomeView model={m} />)

    const element = await waitFor(() =>
      screen.getByText('There are no pathways to be displayed.'),
    )
    expect(element).toBeTruthy()
  })
})

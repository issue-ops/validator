/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import * as main from '../src/main'

describe('index', () => {
  it('calls run when imported', async () => {
    jest.spyOn(main, 'run').mockImplementation()

    require('../src/index')

    expect(main.run).toHaveBeenCalled()
  })
})

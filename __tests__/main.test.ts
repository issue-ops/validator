/**
 * Unit tests for the action's index.ts file.
 */

import * as core from '@actions/core'
import * as main from '../src/main'

const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()

describe('main', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retrieves the inputs', async () => {
    getInputMock.mockImplementation((name: string) => {
      switch (name) {
        case 'issue-form-template':
          return 'example-request.yml'
        case 'workspace':
          return process.cwd()
        default:
          return ''
      }
    })

    await main.run()

    expect(getInputMock).toHaveBeenCalledWith('issue-form-template', {
      required: true
    })
    expect(getInputMock).toHaveBeenCalledWith('workspace', { required: true })
  })

  it('fails when the issue form template does not exist', async () => {
    getInputMock.mockImplementation((name: string) => {
      switch (name) {
        case 'issue-form-template':
          return 'not-real.yml'
        case 'workspace':
          return process.cwd()
        default:
          return ''
      }
    })

    await main.run()

    expect(setFailedMock).toHaveBeenCalledWith(
      'Template not found: not-real.yml'
    )
  })
})

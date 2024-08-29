import { jest } from '@jest/globals'
import { RestEndpointMethodTypes } from '@octokit/rest'
import fs from 'fs'
import * as core from '../__fixtures__/core.js'
import * as github from '../__fixtures__/github.js'
import * as octokit from '../__fixtures__/octokit.js'

const validateCheckboxesSpy = jest.fn()
const validateDropdownSpy = jest.fn()
const validateInputSpy = jest.fn()
const validateTextareaSpy = jest.fn()

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => github)
jest.unstable_mockModule('@octokit/rest', async () => {
  class Octokit {
    constructor() {
      return octokit
    }
  }

  return {
    Octokit
  }
})
jest.unstable_mockModule('../src/validate/checkboxes.js', () => ({
  validateCheckboxes: validateCheckboxesSpy
}))
jest.unstable_mockModule('../src/validate/dropdown.js', () => ({
  validateDropdown: validateDropdownSpy
}))
jest.unstable_mockModule('../src/validate/input.js', () => ({
  validateInput: validateInputSpy
}))
jest.unstable_mockModule('../src/validate/textarea.js', () => ({
  validateTextarea: validateTextareaSpy
}))

const { validate } = await import('../src/validate.js')
const { Octokit } = await import('@octokit/rest')

const mocktokit = jest.mocked(new Octokit())

describe('validate()', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Validates each input type', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false)

    await validate(
      {
        test_input: {
          label: 'test',
          type: 'input',
          required: true
        },
        test_textarea: {
          label: 'test',
          type: 'textarea',
          required: true
        },
        test_dropdown: {
          label: 'test',
          type: 'dropdown',
          required: true,
          options: ['test']
        },
        test_checkboxes: {
          label: 'test',
          type: 'checkboxes',
          required: true,
          options: [
            {
              label: 'test',
              required: true
            }
          ]
        }
      },
      {
        test_input: 'test'
      },
      process.cwd()
    )

    expect(validateInputSpy).toHaveBeenCalled()
    expect(validateTextareaSpy).toHaveBeenCalled()
    expect(validateDropdownSpy).toHaveBeenCalled()
    expect(validateCheckboxesSpy).toHaveBeenCalled()
  })

  it('Skips custom validation if no config is present', async () => {
    const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false)

    const errors: string[] = await validate(
      {
        test: {
          label: 'test',
          type: 'input',
          required: true
        }
      },
      {
        test: 'test'
      },
      process.cwd()
    )

    expect(errors).toEqual([])

    existsSyncSpy.mockRestore()
  })

  it('Passes custom validation if config is present and inputs are valid', async () => {
    const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true)

    core.getInput.mockReturnValue('1234')

    mocktokit.rest.teams.getByName.mockResolvedValue({
      data: {
        id: 1234
      }
    } as RestEndpointMethodTypes['teams']['getByName']['response'])

    const errors: string[] = await validate(
      {
        'read-team': {
          label: 'test',
          type: 'input',
          required: true
        },
        'write-team': {
          label: 'test',
          type: 'input',
          required: true
        }
      },
      {
        'read-team': 'IssueOps-Demo-Readers',
        'write-team': 'IssueOps-Demo-Writers'
      },
      process.cwd()
    )

    expect(errors).toEqual([])

    existsSyncSpy.mockRestore()
  })

  it('Fails custom validation if config is present and inputs are invalid', async () => {
    const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true)

    core.getInput.mockReturnValue('1234')

    mocktokit.rest.teams.getByName.mockRejectedValue({
      status: 404
    })

    const errors: string[] = await validate(
      {
        'read-team': {
          label: 'test',
          type: 'input',
          required: true
        },
        'write-team': {
          label: 'test',
          type: 'input',
          required: true
        }
      },
      {
        'read-team': 'IssueOps-Demo-Readers',
        'write-team': 'IssueOps-Demo-Writers'
      },
      process.cwd()
    )

    expect(errors).toEqual([
      "Invalid read-team: Team 'IssueOps-Demo-Readers' does not exist",
      "Invalid write-team: Team 'IssueOps-Demo-Writers' does not exist"
    ])

    existsSyncSpy.mockRestore()
  })
})

import { jest } from '@jest/globals'
import { RestEndpointMethodTypes } from '@octokit/rest'
import fs from 'fs'
import * as core from '../__fixtures__/core.js'
import * as github from '../__fixtures__/github.js'
import * as octokit from '../__fixtures__/octokit.js'

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
  validateCheckboxes: jest.fn()
}))
jest.unstable_mockModule('../src/validate/dropdown.js', () => ({
  validateDropdown: jest.fn()
}))
jest.unstable_mockModule('../src/validate/input.js', () => ({
  validateInput: jest.fn()
}))
jest.unstable_mockModule('../src/validate/textarea.js', () => ({
  validateTextarea: jest.fn()
}))

const checkboxes = await import('../src/validate/checkboxes.js')
const dropdown = await import('../src/validate/dropdown.js')
const input = await import('../src/validate/input.js')
const textarea = await import('../src/validate/textarea.js')
const { validate } = await import('../src/validate.js')
const { Octokit } = await import('@octokit/rest')

const mocktokit = jest.mocked(new Octokit())

describe('validate.ts', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Validates each input type', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false)

    await validate(
      {
        test_input: {
          type: 'input',
          required: true
        },
        test_textarea: {
          type: 'textarea',
          required: true
        },
        test_dropdown: {
          type: 'dropdown',
          required: true,
          dropdownOptions: ['test']
        },
        test_checkboxes: {
          type: 'checkboxes',
          required: true,
          checkboxesOptions: [
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

    expect(input.validateInput).toHaveBeenCalled()
    expect(textarea.validateTextarea).toHaveBeenCalled()
    expect(dropdown.validateDropdown).toHaveBeenCalled()
    expect(checkboxes.validateCheckboxes).toHaveBeenCalled()
  })

  it('Skips custom validation if no config is present', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false)

    const errors: string[] = await validate(
      {
        test: {
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
  })

  it('Passes custom validation if config is present and inputs are valid', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    core.getInput.mockReturnValue('1234')

    mocktokit.rest.teams.getByName.mockResolvedValue({
      data: {
        id: 1234
      }
    } as RestEndpointMethodTypes['teams']['getByName']['response'])

    const errors: string[] = await validate(
      {
        read_team: {
          type: 'input',
          required: true
        },
        write_team: {
          type: 'input',
          required: true
        }
      },
      {
        read_team: 'IssueOps-Demo-Readers',
        write_team: 'IssueOps-Demo-Writers'
      },
      process.cwd()
    )

    expect(errors).toEqual([])
  })

  it('Fails custom validation if config is present and inputs are invalid', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    core.getInput.mockReturnValue('1234')

    mocktokit.rest.teams.getByName.mockRejectedValue({
      status: 404
    })

    const errors: string[] = await validate(
      {
        read_team: {
          type: 'input',
          required: true
        },
        write_team: {
          type: 'input',
          required: true
        }
      },
      {
        read_team: 'IssueOps-Demo-Readers',
        write_team: 'IssueOps-Demo-Writers'
      },
      process.cwd()
    )

    expect(errors).toEqual([
      "Invalid read_team: Team 'IssueOps-Demo-Readers' does not exist",
      "Invalid write_team: Team 'IssueOps-Demo-Writers' does not exist"
    ])
  })
})

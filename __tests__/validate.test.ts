/**
 * Unit tests for the action's validation script
 */

import fs from 'fs'
import * as core from '@actions/core'
import { validate } from '../src/validate'
import * as input from '../src/validate/input'
import * as textarea from '../src/validate/textarea'
import * as dropdown from '../src/validate/dropdown'
import * as checkboxes from '../src/validate/checkboxes'

// Mock Octokit
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn()
}))

describe('validate', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(core, 'error').mockImplementation()
    jest.spyOn(core, 'info').mockImplementation()
    jest.spyOn(input, 'validateInput').mockImplementation()
    jest.spyOn(textarea, 'validateTextarea').mockImplementation()
    jest.spyOn(dropdown, 'validateDropdown').mockImplementation()
    jest.spyOn(checkboxes, 'validateCheckboxes').mockImplementation()
  })

  it('validates each input type', async () => {
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

  it('skips custom validation if no config is present', async () => {
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

  it('passes custom validation if config is present and inputs are valid', async () => {
    jest.spyOn(core, 'getInput').mockReturnValue('1234')
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)

    const mocktokit = {
      rest: {
        teams: {
          getByName: jest.fn().mockResolvedValue({
            data: {
              id: 1234
            }
          })
        }
      }
    }

    jest
      .spyOn(require('@octokit/rest'), 'Octokit')
      .mockImplementation(() => mocktokit)

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

  it('fails custom validation if config is present and inputs are invalid', async () => {
    jest.spyOn(core, 'getInput').mockReturnValue('1234')
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)

    const mocktokit = {
      rest: {
        teams: {
          getByName: jest.fn().mockRejectedValue({
            status: 404
          })
        }
      }
    }

    jest
      .spyOn(require('@octokit/rest'), 'Octokit')
      .mockImplementation(() => mocktokit)

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

/**
 * Unit tests for the action's validation script
 */

import fs from 'fs'
import { validate } from '../src/validate'
import * as input from '../src/validate/input'
import * as textarea from '../src/validate/textarea'
import * as dropdown from '../src/validate/dropdown'
import * as checkboxes from '../src/validate/checkboxes'

// Mock the action's entrypoint
jest.spyOn(input, 'validateInput').mockImplementation()
jest.spyOn(textarea, 'validateTextarea').mockImplementation()
jest.spyOn(dropdown, 'validateDropdown').mockImplementation()
jest.spyOn(checkboxes, 'validateCheckboxes').mockImplementation()

const config: string = `
validators:
- field: test
  script: team
  method: exists
`

describe('validate', () => {
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

  it('runs custom validation if config is present', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'readFileSync').mockReturnValue(config)
    jest
      .spyOn(require(`${process.cwd()}/.github/validator/team`), 'exists')
      .mockReturnValue('success')

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

    expect(
      require(`${process.cwd()}/.github/validator/team`).exists
    ).toHaveBeenCalledWith('test')
  })
})

/**
 * Unit tests for the dropdown validator
 */

import { FormattedField } from '../../src/interfaces'
import * as dropdown from '../../src/validate/dropdown'

describe('dropdown', () => {
  let errors: string[] = []

  beforeEach(() => {
    errors = []
  })

  it('default required to false if not provided', async () => {
    dropdown.validateDropdown(
      'test',
      {
        type: 'dropdown'
      } as FormattedField,
      {},
      errors
    )

    expect(errors).toHaveLength(0)
  })

  it('returns an error for missing required input', async () => {
    dropdown.validateDropdown(
      'test',
      {
        type: 'dropdown',
        required: true
      },
      {},
      errors
    )

    expect(errors).toContain('Missing required input: test')
  })

  it('returns an error for non-list input', async () => {
    dropdown.validateDropdown(
      'test',
      {
        type: 'dropdown',
        required: false
      },
      {
        test: 123 as any
      },
      errors
    )

    expect(errors).toContain('Dropdown input is not a list: test')
  })

  it('returns an error for required input with empty list', async () => {
    dropdown.validateDropdown(
      'test',
      {
        type: 'dropdown',
        required: true
      },
      {
        test: []
      },
      errors
    )

    expect(errors).toContain('Missing required input: test')
  })

  it('returns an error for multiple selections with multi-select disabled', async () => {
    dropdown.validateDropdown(
      'test',
      {
        type: 'dropdown',
        required: false,
        multiple: false
      },
      {
        test: ['test', 'test']
      },
      errors
    )

    expect(errors).toContain('Too many dropdown selections: test')
  })

  it('returns an error for non-allowed options', async () => {
    dropdown.validateDropdown(
      'test',
      {
        type: 'dropdown',
        required: false,
        dropdownOptions: ['test']
      },
      {
        test: ['test', 'test2']
      },
      errors
    )

    expect(errors).toContain('Invalid dropdown selection: test / test2')
  })

  it('does not return an error for valid input', async () => {
    dropdown.validateDropdown(
      'test',
      {
        type: 'dropdown',
        required: false,
        dropdownOptions: ['test']
      },
      {
        test: ['test']
      },
      errors
    )

    expect(errors).toHaveLength(0)
  })
})

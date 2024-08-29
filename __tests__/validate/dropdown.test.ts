import type { Checkboxes, FormattedField } from '../../src/interfaces.js'
import { validateDropdown } from '../../src/validate/dropdown.js'

describe('validateDropdown()', () => {
  let errors: string[] = []

  beforeEach(() => {
    errors = []
  })

  it('Default required to false if not provided', async () => {
    validateDropdown(
      'test',
      {
        type: 'dropdown'
      } as FormattedField,
      {},
      errors
    )

    expect(errors).toHaveLength(0)
  })

  it('Returns an error for missing required input', async () => {
    validateDropdown(
      'test',
      {
        label: 'test',
        type: 'dropdown',
        required: true
      },
      {},
      errors
    )

    expect(errors).toContain('Missing required input: test')
  })

  it('Returns an error for non-list input', async () => {
    validateDropdown(
      'test',
      {
        label: 'test',
        type: 'dropdown',
        required: false
      },
      {
        test: 123 as unknown as Checkboxes
      },
      errors
    )

    expect(errors).toContain('Dropdown input is not a list: test')
  })

  it('Returns an error for required input with empty list', async () => {
    validateDropdown(
      'test',
      {
        label: 'test',
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

  it('Returns an error for multiple selections with multi-select disabled', async () => {
    validateDropdown(
      'test',
      {
        label: 'test',
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

  it('Returns an error for non-allowed options', async () => {
    validateDropdown(
      'test',
      {
        label: 'test',
        type: 'dropdown',
        required: false,
        options: ['test']
      },
      {
        test: ['test', 'test2']
      },
      errors
    )

    expect(errors).toContain('Invalid dropdown selection: test / test2')
  })

  it('Does not return an error for valid input', async () => {
    validateDropdown(
      'test',
      {
        label: 'test',
        type: 'dropdown',
        required: false,
        options: ['test']
      },
      {
        test: ['test']
      },
      errors
    )

    expect(errors).toHaveLength(0)
  })
})

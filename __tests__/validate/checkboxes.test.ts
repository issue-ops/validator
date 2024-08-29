import type { Checkboxes, FormattedField } from '../../src/interfaces.js'
import { validateCheckboxes } from '../../src/validate/checkboxes.js'

describe('validateCheckboxes()', () => {
  let errors: string[] = []

  beforeEach(() => {
    errors = []
  })

  it('Default required to false if not provided', async () => {
    validateCheckboxes(
      'test',
      {
        type: 'checkboxes'
      } as FormattedField,
      {},
      errors
    )

    expect(errors).toHaveLength(0)
  })

  it('Returns an error for missing required input', async () => {
    validateCheckboxes(
      'test',
      {
        label: 'test',
        type: 'checkboxes',
        required: true
      },
      {},
      errors
    )

    expect(errors).toContain('Missing required input: test')
  })

  it('Returns an error for non-checkboxes input', async () => {
    validateCheckboxes(
      'test',
      {
        label: 'test',
        type: 'checkboxes',
        required: false
      },
      {
        test: 123 as unknown as Checkboxes
      },
      errors
    )

    expect(errors).toContain(
      'Checkboxes input is not a Checkboxes object: test'
    )
  })

  it('Returns an error for required input with no selected options', async () => {
    validateCheckboxes(
      'test',
      {
        label: 'test',
        type: 'checkboxes',
        required: true
      },
      {
        test: {
          selected: [],
          unselected: []
        }
      },
      errors
    )

    expect(errors).toContain('At least one checkbox must be selected: test')
  })

  it('Returns an error for invalid selected options', async () => {
    validateCheckboxes(
      'test',
      {
        label: 'test',
        type: 'checkboxes',
        required: false
      },
      {
        test: {
          selected: ['test'],
          unselected: []
        }
      },
      errors
    )

    expect(errors).toContain('Invalid checkboxes selection: test / test')
  })

  it('Returns an error for invalid unselected options', async () => {
    validateCheckboxes(
      'test',
      {
        label: 'test',
        type: 'checkboxes',
        required: false
      },
      {
        test: {
          selected: [],
          unselected: ['test']
        }
      },
      errors
    )

    expect(errors).toContain('Invalid checkboxes selection: test / test')
  })

  it('Returns an error for missing required options', async () => {
    validateCheckboxes(
      'test',
      {
        label: 'test',
        type: 'checkboxes',
        required: false,
        options: [
          {
            label: 'test',
            required: true
          }
        ]
      },
      {
        test: {
          selected: [],
          unselected: ['test']
        }
      },
      errors
    )

    expect(errors).toContain(
      'Missing required checkboxes selection: test / test'
    )
  })
})

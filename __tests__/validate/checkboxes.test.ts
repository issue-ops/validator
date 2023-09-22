/**
 * Unit tests for the checkboxes validator
 */

import * as checkboxes from '../../src/validate/checkboxes'

describe('checkboxes', () => {
  let errors: string[] = []

  beforeEach(() => {
    errors = []
  })

  it('default required to false if not provided', async () => {
    checkboxes.validateCheckboxes(
      'test',
      {
        type: 'checkboxes'
      } as any,
      {},
      errors
    )

    expect(errors).toHaveLength(0)
  })

  it('returns an error for missing required input', async () => {
    checkboxes.validateCheckboxes(
      'test',
      {
        type: 'checkboxes',
        required: true
      },
      {},
      errors
    )

    expect(errors).toContain('Missing required input: test')
  })

  it('returns an error for non-checkboxes input', async () => {
    checkboxes.validateCheckboxes(
      'test',
      {
        type: 'checkboxes',
        required: false
      },
      {
        test: 123 as any
      },
      errors
    )

    expect(errors).toContain(
      'Checkboxes input is not a Checkboxes object: test'
    )
  })

  it('returns an error for required input with no selected options', async () => {
    checkboxes.validateCheckboxes(
      'test',
      {
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

  it('returns an error for invalid selected options', async () => {
    checkboxes.validateCheckboxes(
      'test',
      {
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

  it('returns an error for invalid unselected options', async () => {
    checkboxes.validateCheckboxes(
      'test',
      {
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

  it('returns an error for missing required options', async () => {
    checkboxes.validateCheckboxes(
      'test',
      {
        type: 'checkboxes',
        required: false,
        checkboxesOptions: [
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

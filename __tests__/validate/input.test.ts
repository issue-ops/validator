import type { Checkboxes } from '../../src/interfaces.js'
import * as input from '../../src/validate/input.js'

describe('input', () => {
  let errors: string[] = []

  beforeEach(() => {
    errors = []
  })

  it('returns an error for missing required input', async () => {
    input.validateInput(
      'test',
      {
        type: 'input',
        required: true
      },
      {},
      errors
    )

    expect(errors).toContain('Missing required input: test')
  })

  it('returns an error for empty required input', async () => {
    input.validateInput(
      'test',
      {
        type: 'input',
        required: true
      },
      {
        test: ''
      },
      errors
    )

    expect(errors).toContain('Empty required input: test')
  })

  it('returns an error for non-string input', async () => {
    input.validateInput(
      'test',
      {
        type: 'input',
        required: false
      },
      {
        test: 123 as unknown as Checkboxes
      },
      errors
    )

    expect(errors).toContain('Input response is not a string: test')
  })

  it('does not return an error for valid input', async () => {
    input.validateInput(
      'test',
      {
        type: 'input',
        required: false
      },
      {
        test: 'test'
      },
      errors
    )

    expect(errors).toHaveLength(0)
  })
})

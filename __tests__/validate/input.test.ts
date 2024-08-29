import type { Checkboxes } from '../../src/interfaces.js'
import { validateInput } from '../../src/validate/input.js'

describe('validateInput()', () => {
  let errors: string[] = []

  beforeEach(() => {
    errors = []
  })

  it('Returns an error for missing required input', async () => {
    validateInput(
      'test',
      {
        label: 'test',
        type: 'input',
        required: true
      },
      {},
      errors
    )

    expect(errors).toContain('Missing required input: test')
  })

  it('Returns an error for empty required input', async () => {
    validateInput(
      'test',
      {
        label: 'test',
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

  it('Returns an error for non-string input', async () => {
    validateInput(
      'test',
      {
        label: 'test',
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

  it('Does not return an error for valid input', async () => {
    validateInput(
      'test',
      {
        label: 'test',
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

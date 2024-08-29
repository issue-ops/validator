import type { Checkboxes } from '../../src/interfaces.js'
import { validateTextarea } from '../../src/validate/textarea.js'

describe('validateTextarea()', () => {
  let errors: string[] = []

  beforeEach(() => {
    errors = []
  })

  it('Returns an error for missing required input', async () => {
    validateTextarea(
      'test',
      {
        label: 'test',
        type: 'textarea',
        required: true
      },
      {},
      errors
    )

    expect(errors).toContain('Missing required input: test')
  })

  it('Returns an error for empty required input', async () => {
    validateTextarea(
      'test',
      {
        label: 'test',
        type: 'textarea',
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
    validateTextarea(
      'test',
      {
        label: 'test',
        type: 'textarea',
        required: false
      },
      {
        test: 123 as unknown as Checkboxes
      },
      errors
    )

    expect(errors).toContain('Textarea response is not a string: test')
  })

  it('Does not return an error for valid input', async () => {
    validateTextarea(
      'test',
      {
        label: 'test',
        type: 'textarea',
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

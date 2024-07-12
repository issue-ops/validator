import type { Checkboxes } from '../../src/interfaces.js'
import * as textarea from '../../src/validate/textarea.js'

describe('textarea', () => {
  let errors: string[] = []

  beforeEach(() => {
    errors = []
  })

  it('returns an error for missing required input', async () => {
    textarea.validateTextarea(
      'test',
      {
        type: 'textarea',
        required: true
      },
      {},
      errors
    )

    expect(errors).toContain('Missing required input: test')
  })

  it('returns an error for empty required input', async () => {
    textarea.validateTextarea(
      'test',
      {
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

  it('returns an error for non-string input', async () => {
    textarea.validateTextarea(
      'test',
      {
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

  it('does not return an error for valid input', async () => {
    textarea.validateTextarea(
      'test',
      {
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

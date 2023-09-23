/**
 * Unit tests for the textarea validator
 */

import * as textarea from '../../src/validate/textarea'

describe('textarea', () => {
  let errors: string[] = []

  beforeEach(() => {
    jest.clearAllMocks()
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

  it('returns an error for non-string input', async () => {
    textarea.validateTextarea(
      'test',
      {
        type: 'textarea',
        required: false
      },
      {
        test: 123 as any
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

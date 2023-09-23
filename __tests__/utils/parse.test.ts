/**
 * Unit tests for the parser, src/parse.ts
 */

import * as parse from '../../src/utils/parse'
import { IssueFormTemplate } from '../../src/interfaces'

describe('parseTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('skips markdown fields', async () => {
    const template: IssueFormTemplate = {
      name: 'Example Request',
      description: 'Submit an example request',
      body: [
        {
          type: 'markdown',
          attributes: {
            value: 'test'
          }
        }
      ]
    }

    expect(await parse.parseTemplate(template)).toEqual({})
  })

  it('parses textarea fields', async () => {
    const template: IssueFormTemplate = {
      name: 'Example Request',
      description: 'Submit an example request',
      body: [
        {
          type: 'textarea',
          id: 'test',
          attributes: {
            label: 'This is a test'
          },
          validations: {
            required: true
          }
        }
      ]
    }

    expect(await parse.parseTemplate(template)).toEqual({
      this_is_a_test: {
        type: 'textarea',
        required: true
      }
    })
  })

  it('parses input fields', async () => {
    const template: IssueFormTemplate = {
      name: 'Example Request',
      description: 'Submit an example request',
      body: [
        {
          type: 'input',
          id: 'test',
          attributes: {
            label: 'This is a test'
          }
        }
      ]
    }

    expect(await parse.parseTemplate(template)).toEqual({
      this_is_a_test: {
        type: 'input',
        required: false
      }
    })
  })

  it('parses dropdown fields', async () => {
    const template: IssueFormTemplate = {
      name: 'Example Request',
      description: 'Submit an example request',
      body: [
        {
          type: 'dropdown',
          id: 'test',
          attributes: {
            label: 'This is a test',
            options: ['this', 'that']
          }
        }
      ]
    }

    expect(await parse.parseTemplate(template)).toEqual({
      this_is_a_test: {
        type: 'dropdown',
        required: false,
        multiple: false,
        dropdownOptions: ['this', 'that']
      }
    })
  })

  it('parses checkboxes fields', async () => {
    const template: IssueFormTemplate = {
      name: 'Example Request',
      description: 'Submit an example request',
      body: [
        {
          type: 'checkboxes',
          id: 'test',
          attributes: {
            label: 'This is a test',
            options: [
              {
                label: 'this',
                required: false
              },
              {
                label: 'that',
                required: true
              }
            ]
          }
        }
      ]
    }

    expect(await parse.parseTemplate(template)).toEqual({
      this_is_a_test: {
        type: 'checkboxes',
        required: false,
        checkboxesOptions: [
          {
            label: 'this',
            required: false
          },
          {
            label: 'that',
            required: true
          }
        ]
      }
    })
  })
})

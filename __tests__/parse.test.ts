/**
 * Unit tests for the parser, src/parse.ts
 */

import * as parse from '../src/parse'
import { IssueFormTemplate } from '../src/interfaces'

describe('parseTemplate', () => {
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
            options: ['this', 'that', 'the other one']
          }
        }
      ]
    }

    expect(await parse.parseTemplate(template)).toEqual({
      this_is_a_test: {
        type: 'dropdown',
        required: false,
        default: undefined,
        multiple: false,
        options: ['this', 'that', 'the other one']
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
              },
              {
                label: 'the other one'
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
        options: [
          {
            label: 'this',
            required: false
          },
          {
            label: 'that',
            required: true
          },
          {
            label: 'the other one',
            required: false
          }
        ]
      }
    })
  })
})

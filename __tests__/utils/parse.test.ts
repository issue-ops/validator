import { IssueFormTemplate } from '../../src/interfaces.js'
import * as parse from '../../src/utils/parse.js'

describe('parseTemplate', () => {
  it('parses issue form templates', async () => {
    const template: IssueFormTemplate = {
      name: 'Example Request',
      description: 'Submit an example request',
      body: [
        {
          type: 'markdown',
          attributes: {
            value: 'This is some sample markdown'
          }
        },
        {
          type: 'textarea',
          id: 'my_textarea',
          attributes: {
            label: 'This is a textarea field'
          },
          validations: {
            required: true
          }
        },
        {
          type: 'input',
          id: 'my_input',
          attributes: {
            label: 'This is an input field'
          }
        },
        {
          type: 'dropdown',
          id: 'my_dropdown',
          attributes: {
            label: 'This is a dropdown field',
            options: ['this', 'that']
          }
        },
        {
          type: 'checkboxes',
          id: 'my_checkboxes',
          attributes: {
            label: 'This is a checkboxes field',
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
      this_is_a_textarea_field: {
        type: 'textarea',
        required: true
      },
      this_is_an_input_field: {
        type: 'input',
        required: false
      },
      this_is_a_dropdown_field: {
        type: 'dropdown',
        required: false,
        multiple: false,
        dropdownOptions: ['this', 'that']
      },
      this_is_a_checkboxes_field: {
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

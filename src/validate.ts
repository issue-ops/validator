import { FormattedField, ParsedBody } from './interfaces'
import { validateInput } from './validate/input'
import { validateTextarea } from './validate/textarea'
import { validateDropdown } from './validate/dropdown'
import { validateCheckboxes } from './validate/checkboxes'

/**
 * Validates the parsed issue body against the parsed issue form template
 * @param template The parsed issue form template
 * @param issue The parsed issue body
 * @returns A list of errors (empty list means the issue is valid)
 */
export async function validate(
  template: { [key: string]: FormattedField },
  issue: ParsedBody
): Promise<string[]> {
  const errors: string[] = []

  for (const [key, props] of Object.entries(template)) {
    // Type-specific validations
    if (props.type === 'input') {
      validateInput(key, props, issue, errors)
    } else if (props.type === 'textarea') {
      validateTextarea(key, props, issue, errors)
    } else if (props.type === 'dropdown') {
      validateDropdown(key, props, issue, errors)
    } else if (props.type === 'checkboxes') {
      validateCheckboxes(key, props, issue, errors)
    }

    // TODO: Custom validators
  }

  return errors
}

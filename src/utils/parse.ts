import { FormattedField, IssueFormTemplate } from '../interfaces.js'
import { formatKey } from './format.js'

/**
 * Parses the issue form template and returns a dictionary of fields
 * @param template The issue form template
 * @returns A dictionary of fields
 */
export async function parseTemplate(
  template: IssueFormTemplate
): Promise<{ [key: string]: FormattedField }> {
  const fields: { [key: string]: FormattedField } = {}

  for (const item of template.body) {
    // Skip markdown fields
    if (item.type === 'markdown') continue

    // Convert the label to snake case. This is the heading in the issue body
    // when the form is submitted, and is used by issue-ops/parser as the key.
    const formattedKey: string = formatKey(item.attributes.label)

    // Take the rest of the attributes and add them to the fields object
    fields[formattedKey] = {
      type: item.type,
      required: item.validations?.required || false
    }

    if (item.type === 'dropdown') {
      // These fields are only used by dropdowns
      fields[formattedKey].multiple = item.attributes.multiple || false
      fields[formattedKey].dropdownOptions = item.attributes.options
    }

    if (item.type === 'checkboxes') {
      // Checkboxes have a different options format than dropdowns
      // Enforce false for required if not present
      fields[formattedKey].checkboxesOptions = item.attributes.options.map(
        (x) => {
          return { label: x.label, required: x.required || false }
        }
      )
    }
  }

  return fields
}

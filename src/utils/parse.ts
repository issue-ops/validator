import fs from 'fs'
import yaml from 'yaml'
import {
  CheckboxesField,
  DropdownField,
  FormattedField,
  InputField
} from '../interfaces.js'
import { formatKey } from './format.js'

/**
 * Parses the issue form template and returns a dictionary of fields
 * @param template The issue form template
 * @returns A dictionary of fields
 */
export async function parseTemplate(
  templatePath: string
): Promise<{ [key: string]: FormattedField }> {
  const fields: { [key: string]: FormattedField } = {}

  // Verify the template exists
  if (!fs.existsSync(templatePath))
    throw new Error(`Template not found: ${templatePath}`)

  const template = yaml.parse(fs.readFileSync(templatePath, 'utf8'))

  for (const item of template.body) {
    // Skip markdown fields
    if (item.type === 'markdown') continue

    // Check if the ID is present in the field attributes. If so, use it as the
    // key. Otherwise, convert the label to snake case (this is the heading in
    // the issue body when the form is submitted).
    const key: string =
      item.id || formatKey((item as InputField).attributes.label)

    // Take the rest of the attributes and add them to the fields object
    fields[key] = {
      type: item.type,
      label: (item as InputField).attributes.label,
      required: (item as InputField).validations?.required || false
    }

    if (item.type === 'dropdown') {
      // These fields are only used by dropdowns
      fields[key].multiple =
        (item as DropdownField).attributes.multiple || false
      fields[key].options = (item as DropdownField).attributes.options
    }

    if (item.type === 'checkboxes') {
      // Checkboxes have a different options format than dropdowns
      // Enforce false for required if not present
      fields[key].options = (item as CheckboxesField).attributes.options.map(
        (x) => {
          return { label: x.label, required: x.required || false }
        }
      )
    }
  }

  return fields
}

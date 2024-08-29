import type { Checkboxes } from '../interfaces.js'
import { FormattedField, ParsedBody } from '../interfaces.js'

/**
 * Validates the parsed issue body section as a dropdown type
 * @param key The name of the field
 * @param props The issue form template properties for this field
 * @param issue The parsed issue body
 * @param errors The running list of errors (modified in place)
 * @returns
 */
export function validateDropdown(
  key: string,
  props: FormattedField,
  issue: ParsedBody,
  errors: string[]
): void {
  const exists: boolean = Object.keys(issue).includes(key)
  const required: boolean = props.required ?? false
  const multiple: boolean = props.multiple ?? false

  if (exists === false) {
    // Input doesn't exist
    // Error if required, otherwise skip
    if (required) errors.push(`Missing required input: ${key}`)
    return
  } else {
    // Input exists

    // Input is not a list of strings
    // This is a breaking error, so return early
    if (!isStringList(issue[key])) {
      errors.push(`Dropdown input is not a list: ${key}`)
      return
    }

    // Get the type-safe list of values
    const values: string[] = issue[key] as string[]

    // Input is required
    // Input is empty
    if (required && values.length === 0)
      errors.push(`Missing required input: ${key}`)

    // Input is not multi-select
    // Multiple options selected
    if (!multiple && values.length > 1)
      errors.push(`Too many dropdown selections: ${key}`)

    // Get the allowed options from the properties
    const allowedOptions: string[] = (props.options ?? []) as string[]

    // Selected options are not in the list of options
    for (const option of values) {
      if (!allowedOptions.includes(option))
        errors.push(`Invalid dropdown selection: ${key} / ${option}`)
    }
  }
}

function isStringList(
  obj: string | string[] | Checkboxes | null
): obj is string[] {
  return Array.isArray(obj) && obj.every((item) => typeof item === 'string')
}

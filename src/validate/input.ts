import { FormattedField, ParsedBody } from '../interfaces.js'

/**
 * Validates the parsed issue body section as an input type
 * @param template The parsed issue form template
 * @param issue The parsed issue body
 * @param errors The running list of errors (modified in place)
 * @returns
 */
export function validateInput(
  key: string,
  props: FormattedField,
  issue: ParsedBody,
  errors: string[]
): void {
  // Required input does not exist
  if (props.required && !issue[key])
    errors.push(`Missing required input: ${key}`)

  // Required input is an empty string
  if (props.required && issue[key] === '')
    errors.push(`Empty required input: ${key}`)

  // Inputs must be strings
  if (issue[key] && typeof issue[key] !== 'string')
    errors.push(`Input response is not a string: ${key}`)
}

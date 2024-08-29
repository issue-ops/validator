import { Checkboxes, FormattedField, ParsedBody } from '../interfaces.js'

/**
 * Validates the parsed issue body section as a checkboxes type
 * @param key The name of the field
 * @param props The issue form template properties for this field
 * @param issue The parsed issue body
 * @param errors The running list of errors (modified in place)
 * @returns
 */
export function validateCheckboxes(
  key: string,
  props: FormattedField,
  issue: ParsedBody,
  errors: string[]
): void {
  const exists: boolean = Object.keys(issue).includes(key)
  const required: boolean = props.required ?? false

  if (exists === false) {
    // Input doesn't exist
    // Error if required, otherwise skip
    if (required) errors.push(`Missing required input: ${key}`)
    return
  } else {
    // Input exists

    // Input is not a Checkboxes object
    // This is a breaking error, so return early
    if (!isCheckboxes(issue[key])) {
      errors.push(`Checkboxes input is not a Checkboxes object: ${key}`)
      return
    }

    // Get the type-safe Checkboxes object
    const checkboxes: Checkboxes = issue[key] as Checkboxes

    // Get the allowed options from the properties
    const allowedOptions: string[] =
      props.options === undefined
        ? []
        : (
            props.options as {
              label: string
              required: boolean
            }[]
          ).map((option: { label: string; required: boolean }) => option.label)

    // Get the required options from the properties
    const requiredOptions: string[] =
      props.options === undefined
        ? []
        : (
            props.options as {
              label: string
              required: boolean
            }[]
          )
            .filter(
              (option: { label: string; required: boolean }) =>
                option.required === true
            )
            .map((option: { label: string; required: boolean }) => option.label)

    // Required checkboxes must have at least one option selected
    if (required && checkboxes.selected.length === 0)
      errors.push(`At least one checkbox must be selected: ${key}`)

    // Selected checkboxes are not in the list of allowed options
    for (const option of checkboxes.selected)
      if (!allowedOptions.includes(option))
        errors.push(`Invalid checkboxes selection: ${key} / ${option}`)

    // Checkboxes unselected must be in the list of options
    for (const option of checkboxes.unselected)
      if (!allowedOptions.includes(option))
        errors.push(`Invalid checkboxes selection: ${key} / ${option}`)

    // Required options must not be in the unselected list
    for (const option of checkboxes.unselected)
      if (requiredOptions.includes(option))
        errors.push(`Missing required checkboxes selection: ${key} / ${option}`)
  }
}

/**
 * Checks if a given object is a Checkboxes object
 * @param obj The object to check
 * @returns True if the object is a Checkboxes object, false otherwise
 */
function isCheckboxes(
  obj: string | string[] | Checkboxes | null
): obj is Checkboxes {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'selected' in obj &&
    'unselected' in obj &&
    Array.isArray(obj.selected) &&
    obj.selected.every(
      (item: string | string[] | Checkboxes | null) => typeof item === 'string'
    ) &&
    Array.isArray(obj.unselected) &&
    obj.unselected.every(
      (item: string | string[] | Checkboxes | null) => typeof item === 'string'
    )
  )
}

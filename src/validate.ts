import fs from 'fs'
import YAML from 'yaml'
import * as core from '@actions/core'
import { FormattedField, ParsedBody } from './interfaces'
import { validateInput } from './validate/input'
import { validateTextarea } from './validate/textarea'
import { validateDropdown } from './validate/dropdown'
import { validateCheckboxes } from './validate/checkboxes'

/**
 * Validates the parsed issue body against the parsed issue form template
 * @param template The parsed issue form template
 * @param issue The parsed issue body
 * @param workspace The path to the workspace
 * @returns A list of errors (empty list means the issue is valid)
 */
export async function validate(
  template: { [key: string]: FormattedField },
  issue: ParsedBody,
  workspace: string
): Promise<string[]> {
  const errors: string[] = []

  core.info('Starting standard validation')
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
  }

  // If there is no config file, return the normal validation errors
  if (!fs.existsSync(`${workspace}/.github/validator/config.yml`)) {
    core.info('No validator config file found, returning standard errors')
    return errors
  }

  // Read validator config from ./.github/validator/config.yml
  const config: any = YAML.parse(
    fs.readFileSync(`${workspace}/.github/validator/config.yml`, 'utf8')
  )

  for (const validator of config.validators) {
    core.info(
      `Running custom validator '${validator.script}' on '${validator.field}'`
    )

    // Import the script for the validator
    const script: any = require(
      `${workspace}/.github/validator/${validator.script}`
    )

    // Run the method, passing in the issue data for that field (if any)
    const result: string = await script(issue[validator.field])
    core.info(`Result: ${result}`)

    // If the script returns an error, add it to the list
    if (result !== 'success')
      errors.push(`Invalid ${validator.field}: ${result}`)
  }

  return errors
}

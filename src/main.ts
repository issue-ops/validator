import * as core from '@actions/core'
import fs from 'fs'
import YAML from 'yaml'
import { parseTemplate } from './utils/parse'
import { FormattedField, ParsedBody } from './interfaces'
import { validate } from './validate'

/**
 * The entrypoint for the action
 */
export async function run(): Promise<void> {
  // Get inputs
  const template: string = core.getInput('issue-form-template', {
    required: true
  })
  const workspace: string = core.getInput('workspace', { required: true })
  const parsedIssue: ParsedBody = JSON.parse(
    core.getInput('parsed-issue-body', { required: true })
  )

  core.info('Running action with the following inputs:')
  core.info(`  template: ${template}`)
  core.info(`  workspace: ${workspace}`)
  core.info(`  parsedIssue: ${JSON.stringify(parsedIssue)}`)

  // Verify the template exists
  if (
    !fs.existsSync(
      `${workspace.replace(/\/+$/, '')}/.github/ISSUE_TEMPLATE/${template}`
    )
  ) {
    core.setFailed(`Template not found: ${template}`)
    return
  }

  // Read and parse the template
  const parsedTemplate: { [key: string]: FormattedField } = await parseTemplate(
    YAML.parse(
      fs.readFileSync(`${workspace}/.github/ISSUE_TEMPLATE/${template}`, 'utf8')
    )
  )

  // Validate the parsed issue against the template
  const errors: string[] = await validate(
    parsedTemplate,
    parsedIssue,
    workspace
  )

  console.log(errors)
}

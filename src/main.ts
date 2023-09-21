import * as core from '@actions/core'
import fs from 'fs'
import YAML from 'yaml'
import { parseTemplate } from './parse'
import { IssueFormTemplate } from './interfaces'

/**
 * The entrypoint for the action
 */
export async function run(): Promise<void> {
  // Get inputs
  const template: string = core.getInput('issue-form-template', {
    required: true
  })
  const workspace: string = core.getInput('workspace', { required: true })

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
  const templateYaml: IssueFormTemplate = YAML.parse(
    fs.readFileSync(`${workspace}/.github/ISSUE_TEMPLATE/${template}`, 'utf8')
  )
  await parseTemplate(templateYaml)
}

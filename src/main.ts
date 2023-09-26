import fs from 'fs'
import YAML from 'yaml'
import * as core from '@actions/core'
import { Octokit } from '@octokit/rest'
import { compileTemplate } from './utils/compile'
import { parseTemplate } from './utils/parse'
import { FormattedField, ParsedBody } from './interfaces'
import { validate } from './validate'

/**
 * The entrypoint for the action
 */
export async function run(): Promise<void> {
  // Get inputs
  const addComment: boolean =
    core.getInput('add-comment', {
      required: true
    }) === 'true'
  const issueNumber: number = parseInt(
    core.getInput('issue-number', { required: true }),
    10
  )
  const parsedIssue: ParsedBody = JSON.parse(
    core.getInput('parsed-issue-body', { required: true })
  )
  const repository: string = core.getInput('repository', {
    required: true
  })
  const template: string = core.getInput('issue-form-template', {
    required: true
  })
  const token: string = core.getInput('github-token', { required: true })
  const workspace: string = core
    .getInput('workspace', { required: true })
    .replace(/\/+$/, '') // Remove trailing slashes

  const owner: string = repository.split('/')[0]
  const repo: string = repository.split('/')[1]

  core.info('Running action with the following inputs:')
  core.info(`  addComment: ${addComment}`)
  core.info(`  issueNumber: ${issueNumber}`)
  core.info(`  parsedIssue: ${JSON.stringify(parsedIssue)}`)
  core.info(`  repository: ${repository}`)
  core.info(`  template: ${template}`)
  core.info(`  workspace: ${workspace}`)

  // Verify the template exists
  if (!fs.existsSync(`${workspace}/.github/ISSUE_TEMPLATE/${template}`)) {
    core.setFailed(`Template not found: ${template}`)
    return
  }
  core.info(`Template found: ${template}`)

  // Read and parse the template
  const parsedTemplate: { [key: string]: FormattedField } = await parseTemplate(
    YAML.parse(
      fs.readFileSync(`${workspace}/.github/ISSUE_TEMPLATE/${template}`, 'utf8')
    )
  )
  core.info(`Template parsed: ${JSON.stringify(parsedTemplate)}`)

  // Validate the parsed issue against the template
  const errors: string[] = await validate(
    parsedTemplate,
    parsedIssue,
    workspace
  )

  core.info('Validation complete!')
  if (errors.length > 0) core.info(`Errors found: ${JSON.stringify(errors)}`)
  else core.info('No errors found!')

  let body: string

  if (addComment) {
    core.info('Adding comment to issue...')

    if (errors.length > 0) {
      // Add a comment to the issue with the error(s).
      if (fs.existsSync(`${workspace}/.github/validator/failure.mustache`)) {
        // Use the template file to create the failure message.
        body = compileTemplate(
          `${workspace}/.github/validator/failure.mustache`,
          {
            errors
          }
        )
      } else {
        // Use the default message.
        body = `:no_entry: There were errors validating the issue body:\n\n${errors
          .map((error) => `- ${error}`)
          .join('\n')}`
      }
    } else {
      // Add a comment to the issue with the success message.
      if (fs.existsSync(`${workspace}/.github/validator/success.mustache`)) {
        // Use the template file to create the success message.
        body = compileTemplate(
          `${workspace}/.github/validator/success.mustache`,
          {
            issue: parsedIssue
          }
        )
      } else {
        // Use the default message.
        body = `:tada: Issue validated successfully!`
      }
    }

    const octokit = new Octokit({ auth: token })

    await octokit.rest.issues.createComment({
      body,
      issue_number: issueNumber,
      owner,
      repo
    })
  }

  // Set outputs
  core.info('Setting outputs...')

  if (errors.length === 0) {
    core.setOutput('result', 'success')
    core.setOutput('errors', '')
  } else {
    core.setOutput('result', 'failure')
    core.setOutput('errors', JSON.stringify(errors))
  }

  core.info('Action complete!')
}

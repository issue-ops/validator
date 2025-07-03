/**
 * Example custom validator script: checks if a team exists
 *
 * @param {string | string[] | {label: string; required: boolean }} field The input field.
 *
 * This can be one of several types:
 *  - `string` -> The value of the field (e.g. `'my-team'`)
 *  - `string[]` -> The value(s) of the field (e.g. `['team-1', 'team-2']`)
 *  - A checkboxes object with a `label` and `required` property (e.g.
 *    `{ label: 'my-team', required: true }`)
 *
 *  You do not need to handle them all! It is up to the individual validation
 *  script to define which type(s) to expect and how to handle them.
 *
 * @returns {Promise<string>} An error message or `'success'`
 */
export default async (field) => {
  // If you are importing libraries that are not included in the GitHub Actions
  // runner image, you will need to make sure to include the following steps in
  // your workflow file **before** running the validator action:
  //
  // - name: Setup Node.js
  //   uses: actions/setup-node@vX.X.X
  //   with:
  //     node-version: 20
  //
  // - name: Install dependencies
  //   run: npm install
  //
  // For example, the above would be required here since we are importing the
  // `@octokit/rest` library to make requests to the GitHub API.
  const { Octokit } = await import('@octokit/rest')
  const core = await import('@actions/core')

  // You will need to set any required inputs or environment variables in the
  // GitHub Actions workflow file that runs the `issue-ops/validator` action.
  // This is how you can specify inputs to the custom validators. In this case,
  // you will need to set the authentication token for the GitHub API so you can
  // read GitHub Teams in your organization.
  const github = new Octokit({
    auth: core.getInput('github-token', { required: true }),
    baseUrl: core.getInput('api_url', { required: true })
  })

  // In this validator, the only type of input we are expecting is a `string` (a
  // team name). If the field is not a string, return an error message. In each
  // custom validator, you can define the rules for what is valid input and what
  // is not. In other cases, you may want to only accept lists of strings
  // (dropdown) or lists of objects (checkboxes). It is up to you!
  if (typeof field !== 'string') return 'Field type is invalid'

  try {
    // Check if the team exists
    core.info(`Checking if team '${field}' exists`)

    await github.rest.teams.getByName({
      org: process.env.ORGANIZATION ?? '',
      team_slug: field
    })

    core.info(`Team '${field}' exists`)
    return 'success'
  } catch (error) {
    if (error.status === 404) {
      // If the team does not exist, return an error message
      core.error(`Team '${field}' does not exist`)
      return `Team '${field}' does not exist`
    } else {
      // Otherwise, something else went wrong...
      throw error
    }
  }
}

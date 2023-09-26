/**
 * Checks if a team exists
 * @param {string | string[] | {label: string; required: boolean }} field The input field.
 *
 * This can be one of several types:
 *  - A string, which is the value of the field (e.g. "my-team").
 *  - An array of strings, which are the values of the field (e.g. ["my-team"]).
 *  - An object with a `label` and `required` property. This is used for checkboxes.
 *
 *  You do not need to handle them all! It is up to the validator to determine
 *  which type(s) to expect, and how to handle them.
 *
 * @returns {Promise<string>} An error message if validation fails, 'success' otherwise
 */
module.exports = async (field) => {
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
  const { Octokit } = require('@octokit/rest')
  const core = require('@actions/core')

  // You will need to set any required inputs or environment variables in the
  // GitHub Actions workflow file that runs the `issue-ops/validator` action.
  // This is how you can specify inputs to the custom validators. In this case,
  // you will need to set the authentication token for the GitHub API so you can
  // read GitHub Teams in your organization.
  const github = new Octokit({
    auth: core.getInput('github-token', { required: true })
  })

  // If the field is not a string, return an error message. This is a custom
  // validator, so you can define the rules for what is valid and what is not.
  if (typeof field !== 'string') return 'Field type is invalid'

  try {
    // Check if the team exists
    core.info(`Checking if team ${field} exists`)

    await github.rest.teams.getByName({
      org: process.env.ORGANIZATION ?? '',
      team_slug: field
    })

    core.info(`Team ${field} exists`)
    return 'success'
  } catch (error) {
    if (error.status === 404) {
      // If the team does not exist, return an error message
      core.error(`Team ${field} does not exist`)
      return `Team ${field} does not exist`
    } else {
      // Otherwise, something else went wrong...
      throw error
    }
  }
}

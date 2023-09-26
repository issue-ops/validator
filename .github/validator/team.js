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

  // You will need to set any required environment variables in the GitHub
  // Actions workflow file that runs the validator action. This is how you can
  // specify inputs to the custom validators. In this case, you will need to
  // set the `GITHUB_TOKEN` environment variable to a token that has access to
  // read GitHub Teams in your organization.
  const github = new Octokit({
    auth: process.env.GITHUB_TOKEN
  })

  // If the field is not a string, return false
  if (typeof field !== 'string') return 'Invalid field type'

  // Check if the team exists
  try {
    await github.rest.teams.getByName({
      org: process.env.ORGANIZATION ?? '',
      team_slug: field
    })

    return 'success'
  } catch (error) {
    // If the team does not exist, return an error message
    if (error.status === 404) return `Team ${field} does not exist`
    // Otherwise, throw the exception
    else throw error
  }
}

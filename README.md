# IssueOps Validator

[![Check dist/](https://github.com/issue-ops/validator/actions/workflows/check-dist.yml/badge.svg)](https://github.com/issue-ops/validator/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/issue-ops/validator/actions/workflows/codeql.yml/badge.svg)](https://github.com/issue-ops/validator/actions/workflows/codeql.yml)
[![Continuous Integration](https://github.com/issue-ops/validator/actions/workflows/continuous-integration.yml/badge.svg)](https://github.com/issue-ops/validator/actions/workflows/continuous-integration.yml)
[![Continuous Delivery](https://github.com/issue-ops/validator/actions/workflows/continuous-delivery.yml/badge.svg)](https://github.com/issue-ops/validator/actions/workflows/continuous-delivery.yml)
[![Linter](https://github.com/issue-ops/validator/actions/workflows/linter.yml/badge.svg)](https://github.com/issue-ops/validator/actions/workflows/linter.yml)
[![Code Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Validate issue form submissions

> [!IMPORTANT]
>
> As of version `v2.0.0`, this action has been converted to ESM. Because of
> this, custom validation scripts must be provided in ESM syntax. If you are
> using CommonJS, you will need to convert your scripts to ESM. See
> [`team.js`](./.github/validator/team.js) for an example.

## About

This action is designed to be used in conjunction with
[issue forms](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository#creating-issue-forms)
to allow you to validate submitted issues against their template, as well as any
developer-defined logic.

Out of the box, this action supports validating the following details based on
the issue forms template used to create the issue.

| Field Type   | Validation                                       |
| ------------ | ------------------------------------------------ |
| All          | Required input missing                           |
|              | Required input empty                             |
|              | Invalid input type                               |
| `input`      |                                                  |
| `textarea`   |                                                  |
| `dropdown`   | Input required / No selection(s) made            |
|              | Single-select input / Multiple selection(s) made |
|              | Selection(s) not in template                     |
| `checkboxes` | Input required / No selection(s) made            |
|              | Selection(s) not in template                     |
|              | Required selection(s) are not chosen             |

You can also include your own validation logic to run on the parsed issue! For
example, you may want to validate that a team name input is a valid GitHub Team.
See [Custom Validators](#custom-validators) for more information.

Feel free to try the action out by submitting a
[New Thing Request](https://github.com/issue-ops/validator/issues/new?template=example-request.yml)!

## Setup

Here is a simple example of how to use this action in your workflow. Make sure
to replace `vX.X.X` with the latest versions of the actions.

```yaml
name: Issue Opened/Edited

on:
  issues:
    types:
      - opened
      - edited

jobs:
  validate:
    name: Validate Issue
    runs-on: ubuntu-latest

    steps:
      # This is required to access the repository's files. Specifically, the
      # issue forms template and the additional validation configuration.
      - name: Checkout Repository
        id: checkout
        uses: actions/checkout@vX.X.X

      # Parse the issue body and convert it to JSON.
      - name: Parse Issue Body
        id: parse
        uses: issue-ops/parser@vX.X.X
        with:
          body: ${{ github.event.issue.body }}
          issue-form-template: example-request.yml
          workspace: ${{ github.workspace }}

      # Validate the parsed issue body against the issue form template. This
      # example does not use custom validators.
      - name: Validate Issue
        id: validate
        uses: issue-ops/validator@vX.X.X
        with:
          issue-form-template: example-request.yml
          parsed-issue-body: ${{ steps.parse.outputs.json }}
          workspace: ${{ github.workspace }}

      - name: Output Validation Results
        id: output
        run: |
          echo "Result: ${{ steps.validate.outputs.result }}"
          echo "Errors: ${{ steps.validate.outputs.errors }}"
```

As a more complex example, suppose you want to include custom validation logic
that relies on additional npm libraries. In this case, you would need to ensure
those libraries are available on the runner before validation takes place.

```yaml
name: Issue Opened/Edited

on:
  issues:
    types:
      - opened
      - edited

jobs:
  validate:
    name: Validate Issue with Custom Logic
    runs-on: ubuntu-latest

    steps:
      # This is required to access the repository's files. Specifically, the
      # issue forms template and the additional validation configuration.
      - name: Checkout Repository
        id: checkout
        uses: actions/checkout@vX.X.X

      # Install Node.js on the runner.
      - name: Setup Node.js
        id: setup-node
        uses: actions/setup-node@vX.X.X
        with:
          node-version: 20

      # Install dependencies from `package.json`.
      - name: Install Dependencies
        id: install
        run: npm install

      # Parse the issue body and convert it to JSON.
      - name: Parse Issue Body
        id: parse
        uses: issue-ops/parser@vX.X.X
        with:
          body: ${{ github.event.issue.body }}
          issue-form-template: example-request.yml
          workspace: ${{ github.workspace }}

      # Validate the parsed issue body against the issue form template. This
      # example does use custom validators.
      - name: Validate Issue
        id: validate
        uses: issue-ops/validator@vX.X.X
        with:
          issue-form-template: example-request.yml
          parsed-issue-body: ${{ steps.parse.outputs.json }}
          workspace: ${{ github.workspace }}

      - name: Output Validation Results
        id: output
        run: |
          echo "Result: ${{ steps.validate.outputs.result }}"
          echo "Errors: ${{ steps.validate.outputs.errors }}"
```

## Inputs

| Input                 | Description                                         |
| --------------------- | --------------------------------------------------- |
| `add-comment`         | Add a [success/failure comment](#comment-templates) |
|                       | Default: `true`                                     |
| `github-token`        | GitHub PAT for authentication                       |
|                       | Default: `${{ github.token }}`                      |
| `issue-form-template` | Template `.yml` file in `.github/ISSUE_TEMPLATE`    |
| `issue-number`        | The issue number to validate                        |
|                       | Default: `${{ github.event.issue.number }}`         |
| `parsed-issue-body`   | The parsed issue body to validate                   |
| `workspace`           | The path where the repository was cloned            |
|                       | Default: `${{ github.workspace }}`                  |

## Outputs

| Output   | Description                                  |
| -------- | -------------------------------------------- |
| `result` | `success` or `failure`                       |
| `errors` | A list of validation error messages (if any) |

## Custom Validators

This action supports custom validation logic in the form of a configuration file
and additional **JavaScript** files in the repository where you are calling this
action. For example, the
[New Thing Request](https://github.com/issue-ops/validator/issues/new?template=example-request.yml)
issue form validates that the **Read Team** and **Write Team** inputs are valid
GitHub Teams.

Check out the following sections for instructions on how to set this up in your
repository!

### Step 1: Configuration File

First, a configuration file must be created at `.github/validator/config.yml`.
The content of the file should follow the below format:

```yaml
validators:
  - field: read_team
    script: team
  - field: write_team
    script: team
```

| Property | Description                                                     |
| -------- | --------------------------------------------------------------- |
| `field`  | The `label` attribute of the input in the issue form template   |
|          | Must be camel-cased, and all special characters removed         |
|          | This matches the output format of the `issue-ops/parser` action |
|          | E.g. `My Input Name :D` -> `my_input_name`                      |
| `script` | The path and name of the script to call                         |
|          | Relative to the `validator` directory                           |

### Step 2: Validation Script

Next, you must include any validation script(s) referenced in `config.yml`.
These scripts must have the following behavior:

- Accept inputs of the following types:
  - `string` (Input and Textarea)
  - `string[]` (Dropdown)
  - `{label: string; required: boolean }` (Checkboxes)
- Return `'success'` for successful validation
- Return an error message (`string`) for unsuccessful validation

For an example, see [`team.js`](./.github/validator/team.js).

_**Isn't running arbitrary scripts dangerous?**_

:fire: Yes! :fire: That's why it is highly recommended to only use this action
on event types such as
[`on: issues`](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#issues).
In GitHub Actions, certain triggers use files from non-default branches. This
can be a big security risk when arbitrary scripts are involved.

> The `on: issues` event will only trigger a workflow run if the workflow file
> is on the default branch.

Along with this, you must make sure to not pull branches with untrusted
validation scripts into the workspace where this action is run (by default the
`actions/checkout` action will pull the default branch).

### Step 3: Additional Libraries

If your custom validator requires libraries that are not included on
[GitHub-hosted runners](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners/about-github-hosted-runners#supported-software)
(or not installed on self-hosted runners), you will need to include additional
steps in the workflow to ensure that they are available before this action runs.
For example, if you wanted to include the `yaml` library for parsing YAML files,
you would need to do the following:

1. Create a `package.json` in your repository

   ```bash
   npm init -y
   ```

1. Install the `yaml` library

   ```bash
   npm install yaml
   ```

1. Update your GitHub Actions workflow to setup Node.js and install dependencies

   ```yaml
   # This is required to access the repository's files. Specifically, the
   # issue forms template and the additional validation configuration.
   - name: Checkout Repository
     id: checkout
     uses: actions/checkout@vX.X.X

   # If your validation scripts include any third-party dependencies, you
   # will need to install them. First, setup Node.js on the runner.
   - name: Setup Node.js
     id: setup-node
     uses: actions/setup-node@vX.X.X
     with:
       node-version: 20
       cache: npm

   # Next, install the dependencies from `package.json`.
   - name: Install Dependencies
     id: install
     run: npm install

   # Now you're good to go!
   - name: Parse Issue Body
     id: parse
     uses: issue-ops/parser@vX.X.X
     with:
       body: ${{ github.event.issue.body }}
       issue-form-template: example-request.yml
       workspace: ${{ github.workspace }}

   # Validate the parsed issue body against the issue form template and any
   # custom validation scripts. You can also pass in additional inputs as
   # environment variables.
   - name: Validate Issue
     id: validate
     uses: issue-ops/validator@vX.X.X
     env:
       ORGANIZATION: issue-ops
     with:
       issue-form-template: example-request.yml
       parsed-issue-body: ${{ steps.parse.outputs.json }}
       workspace: ${{ github.workspace }}
   ```

## GitHub API Permissions

By default, the GitHub token available to workflows has specific permissions
that are limited to the repository the workflow is running in. If you have
custom validators that need to call other GitHub APIs, you will need to provide
either a personal access token (PAT), or use a GitHub App to authenticate.
Either one can be passed to the action in the `github-token` input.

For GitHub App authentication, you can use the
[`actions/create-github-app-token`](https://github.com/actions/create-github-app-token)
action to generate a token and pass it to the validation step.

```yaml
- name: Generate App Token
  id: token
  uses: actions/create-github-app-token@vX.X.X
  with:
    app_id: ${{ secrets.ISSUEOPS_DEMO_APP_ID }}
    private_key: ${{ secrets.ISSUEOPS_DEMO_APP_KEY }}

- name: Validate Issue
  id: validate
  uses: issue-ops/validator@vX.X.X
  env:
    ORGANIZATION: issue-ops
  with:
    github-token: ${{ steps.token.outputs.token }}
    issue-form-template: example-request.yml
    parsed-issue-body: ${{ steps.parse.outputs.json }}
    workspace: ${{ github.workspace }}
```

## Comment Templates

If the `add-comment` input is set to `true`, a comment will be added to the
issue that triggered the action. The comment will include the results of the
validation job. By default, the comments look like this:

Default success comment:

```plain
:tada: Issue validated successfully!
```

Default failure comment:

```plain
:no_entry: There were errors validating the issue body:

- Error message
```

You can customize the success/failure comments by including custom templates in
the `.github/validator/` directory. If either template is present, it will be
used to generate the comment that is added after validation completes.

> As you can probably guess, these are [Handlebars](https://handlebarsjs.com/)
> templates :wink:

| Result  | Template Filename  | Input Type | Input Description       |
| ------- | ------------------ | ---------- | ----------------------- |
| Success | `success.mustache` | JSON       | The parsed issue body   |
| Failure | `failure.mustache` | `string[]` | The validation error(s) |

You can reference the inputs to each template to customize the presentation and
format to your liking. For examples, check out
[`failure.mustache`](.github/validator/failure.mustache) and
[`success.mustache`](.github/validator/success.mustache).

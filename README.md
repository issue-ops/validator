# IssueOps Validator

[![Check dist/](https://github.com/issue-ops/validator/actions/workflows/check-dist.yml/badge.svg)](https://github.com/issue-ops/validator/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/issue-ops/validator/actions/workflows/codeql.yml/badge.svg)](https://github.com/issue-ops/validator/actions/workflows/codeql.yml)
[![Continuous Integration](https://github.com/issue-ops/validator/actions/workflows/continuous-integration.yml/badge.svg)](https://github.com/issue-ops/validator/actions/workflows/continuous-integration.yml)
[![Super Linter](https://github.com/issue-ops/validator/actions/workflows/super-linter.yml/badge.svg)](https://github.com/issue-ops/validator/actions/workflows/super-linter.yml)
[![Code Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Validate issue form submissions

## About

<!-- TODO -->

## Setup

Here is a simple example of how to use this action in your workflow. Make sure
to replace `vX.X.X` with the latest version of this action.

<!-- TODO
```yaml
jobs:
  example:
    name: Example
    runs-on: ubuntu-latest

    # Write permissions to issues is required
    permissions:
      issues: write

    steps:
      # Add labels to an issue in this repository
      - name: Add Labels
        id: add-labels
        uses: issue-ops/labeler@vX.X.X
        with:
          action: add
          issue_number: 1
          labels: |
            enhancement
            great-first-issue

```
-->

## Behavior

<!-- TODO -->

## Inputs

<!-- TODO -->

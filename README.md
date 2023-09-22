# IssueOps Validator

[![Check dist/](https://github.com/issue-ops/validator/actions/workflows/check-dist.yml/badge.svg)](https://github.com/issue-ops/validator/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/issue-ops/validator/actions/workflows/codeql.yml/badge.svg)](https://github.com/issue-ops/validator/actions/workflows/codeql.yml)
[![Continuous Integration](https://github.com/issue-ops/validator/actions/workflows/continuous-integration.yml/badge.svg)](https://github.com/issue-ops/validator/actions/workflows/continuous-integration.yml)
[![Continuous Delivery](https://github.com/issue-ops/validator/actions/workflows/continuous-delivery.yml/badge.svg)](https://github.com/issue-ops/validator/actions/workflows/continuous-delivery.yml)
[![Super Linter](https://github.com/issue-ops/validator/actions/workflows/super-linter.yml/badge.svg)](https://github.com/issue-ops/validator/actions/workflows/super-linter.yml)
[![Code Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Validate issue form submissions

## About

<!-- TODO -->

## Setup

Here is a simple example of how to use this action in your workflow. Make sure
to replace `vX.X.X` with the latest version of this action.

```yaml
name: IssueOps Workflow

on:
  issues:
    types:
      - opened
      - edited

permissions:
  contents: read
  issues: write

jobs:
  process:
    name: Process Issue
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        id: checkout
        uses: actions/checkout@v4

      - name: Parse Issue
        id: parse
        uses: issue-ops/parser@vX.X.X
        with:
          body: ${{ github.event.issue.body }}

      - name: Validate Issue
        id: validate
        uses: issue-ops/validator@vX.X.X
        with:
          issue-form-template: example-template.yml
          parsed-issue-body: ${{ steps.parse.outputs.json }}
          workspace: ${{ github.workspace }}
```

## Behavior

<!-- TODO -->

## Inputs

<!-- TODO -->

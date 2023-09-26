/**
 * Unit tests for the parser, src/parse.ts
 */

import * as compile from '../../src/utils/compile'
import fs from 'fs'

const template = fs.readFileSync(
  '__tests__/fixtures/example/success.mustache',
  'utf8'
)
const compiledTemplate = fs
  .readFileSync('__tests__/fixtures/example/compiled-success.md', 'utf8')
  .trim()
const parsedIssue = JSON.parse(
  fs.readFileSync('__tests__/fixtures/example/parsed-issue.json', 'utf8')
)

describe('compileTemplate', () => {
  it('compiles the template correctly', async () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(template)

    const result = compile.compileTemplate(
      `${process.cwd()}/.github/validator/success.mustache`,
      {
        issue: parsedIssue
      }
    )

    expect(result === compiledTemplate).toBe(true)
  })
})

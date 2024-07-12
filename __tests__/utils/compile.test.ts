import { jest } from '@jest/globals'
import fs from 'fs'
import * as compile from '../../src/utils/compile.js'

const template = fs.readFileSync(
  '__fixtures__/examples/success.mustache',
  'utf8'
)
const compiledTemplate = fs
  .readFileSync('__fixtures__/examples/compiled-success.md', 'utf8')
  .trim()
const parsedIssue = JSON.parse(
  fs.readFileSync('__fixtures__/examples/parsed-issue.json', 'utf8')
)

describe('compileTemplate', () => {
  afterAll(() => {
    jest.restoreAllMocks()
  })

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

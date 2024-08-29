import { jest } from '@jest/globals'
import fs from 'fs'
import * as compile from '../../src/utils/compile.js'

const template = fs.readFileSync(
  '__fixtures__/example/success.mustache',
  'utf8'
)
const compiledTemplate = fs
  .readFileSync('__fixtures__/example/compiled-success.md', 'utf8')
  .trim()
const parsedIssue = JSON.parse(
  fs.readFileSync('__fixtures__/example/parsed-issue.json', 'utf8')
)

describe('compileTemplate()', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Compiles the template', async () => {
    const readFileSyncSpy = jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValueOnce(template)

    const result = compile.compileTemplate(
      `${process.cwd()}/.github/validator/success.mustache`,
      {
        issue: parsedIssue
      }
    )

    expect(result).toEqual(compiledTemplate)

    readFileSyncSpy.mockRestore()
  })
})

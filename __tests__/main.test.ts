/**
 * Unit tests for the action's index.ts file.
 */
import fs from 'fs'
import YAML from 'yaml'
import * as core from '@actions/core'
import * as main from '../src/main'
import * as parse from '../src/utils/parse'

// Get the expected data (before mocking fs)
const parsedIssue: string = fs.readFileSync(
  '__tests__/fixtures/example/parsed-issue.json',
  'utf-8'
)
const template: string = fs.readFileSync(
  '__tests__/fixtures/example/template.yml',
  'utf-8'
)

describe('main', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retrieves the inputs', async () => {
    jest.spyOn(core, 'setFailed').mockImplementation()
    jest.spyOn(core, 'info').mockImplementation()
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      switch (name) {
        case 'issue-form-template':
          return 'example-request.yml'
        case 'workspace':
          return process.cwd()
        case 'parsed-issue-body':
          return '{}'
        default:
          return ''
      }
    })

    // Fail the run early so we don't have to mock the rest of the function
    jest.spyOn(fs, 'existsSync').mockImplementation(() => false)

    await main.run()

    expect(core.getInput).toHaveBeenCalledWith('issue-form-template', {
      required: true
    })
    expect(core.getInput).toHaveReturnedWith('example-request.yml')
    expect(core.getInput).toHaveBeenCalledWith('workspace', { required: true })
    expect(core.getInput).toHaveReturnedWith(process.cwd())
    expect(core.getInput).toHaveBeenCalledWith('parsed-issue-body', {
      required: true
    })
    expect(core.getInput).toHaveReturnedWith('{}')
  })

  it('fails when the issue form template does not exist', async () => {
    jest.spyOn(core, 'setFailed').mockImplementation()
    jest.spyOn(core, 'info').mockImplementation()
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      switch (name) {
        case 'issue-form-template':
          return 'example-request.yml'
        case 'workspace':
          return process.cwd()
        case 'parsed-issue-body':
          return '{}'
        default:
          return ''
      }
    })

    jest.spyOn(fs, 'existsSync').mockImplementation(() => false)

    await main.run()

    expect(core.setFailed).toHaveBeenCalledWith(
      'Template not found: example-request.yml'
    )
  })

  it('parses the issue form template', async () => {
    jest.spyOn(core, 'info').mockImplementation()
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      switch (name) {
        case 'issue-form-template':
          return 'example-request.yml'
        case 'workspace':
          return process.cwd()
        case 'parsed-issue-body':
          return parsedIssue
        default:
          return ''
      }
    })

    jest.spyOn(fs, 'existsSync').mockImplementation(() => true)
    jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(template)
    jest.spyOn(parse, 'parseTemplate')

    await main.run()

    expect(parse.parseTemplate).toHaveBeenCalledWith(YAML.parse(template))
    expect(parse.parseTemplate).toHaveReturned()
  })
})

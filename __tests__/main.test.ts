import { jest } from '@jest/globals'
import { RestEndpointMethodTypes } from '@octokit/rest'
import fs, { PathLike, PathOrFileDescriptor } from 'fs'
import * as core from '../__fixtures__/core.js'
import * as octokit from '../__fixtures__/octokit.js'

const compileTemplateSpy = jest.fn()
const validateSpy = jest.fn()
const parseTemplateSpy = jest.fn()
const getCommentIdSpy = jest.fn()

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@octokit/rest', async () => {
  class Octokit {
    constructor() {
      return octokit
    }
  }

  return {
    Octokit
  }
})
jest.unstable_mockModule('../src/utils/compile.js', () => ({
  compileTemplate: compileTemplateSpy
}))
jest.unstable_mockModule('../src/validate.js', () => ({
  validate: validateSpy
}))
jest.unstable_mockModule('../src/utils/parse.js', () => ({
  parseTemplate: parseTemplateSpy
}))
jest.unstable_mockModule('../src/comments.js', () => ({
  getCommentId: getCommentIdSpy
}))

const main = await import('../src/main.js')
const { Octokit } = await import('@octokit/rest')

const mocktokit = jest.mocked(new Octokit())

// Get the expected data (before mocking fs)
const parsedIssue: string = fs.readFileSync(
  '__fixtures__/example/parsed-issue.json',
  'utf-8'
)
const template: string = fs.readFileSync(
  '__fixtures__/example/template.yml',
  'utf-8'
)
const parsedTemplate: string = fs.readFileSync(
  '__fixtures__/example/parsed-template.json',
  'utf-8'
)
const failureMustache: string = fs.readFileSync(
  '__fixtures__/example/failure.mustache',
  'utf-8'
)
const successMustache: string = fs.readFileSync(
  '__fixtures__/example/success.mustache',
  'utf-8'
)

describe('main.ts', () => {
  beforeEach(() => {
    mocktokit.rest.teams.getByName.mockResolvedValue({
      data: {
        id: 1
      }
    } as RestEndpointMethodTypes['teams']['getByName']['response'])

    core.getInput
      .mockReturnValueOnce('true') // add-comment
      .mockReturnValueOnce('1') // issue-number
      .mockReturnValueOnce(parsedIssue) // parsed-issue-body
      .mockReturnValueOnce('issue-ops/validator') // repository
      .mockReturnValueOnce('example-request.yml') // issue-form-template
      .mockReturnValueOnce('12345') // github-token
      .mockReturnValueOnce(process.cwd()) // workspace

    parseTemplateSpy.mockReturnValue(JSON.parse(parsedTemplate))
    validateSpy.mockReturnValue([])
    getCommentIdSpy.mockReturnValue(undefined)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Retrieves the inputs', async () => {
    await main.run()

    expect(core.getInput).toHaveBeenCalledWith('add-comment', {
      required: true
    })
    expect(core.getInput).toHaveBeenCalledWith('issue-number', {
      required: true
    })
    expect(core.getInput).toHaveBeenCalledWith('issue-form-template', {
      required: true
    })
    expect(core.getInput).toHaveBeenCalledWith('parsed-issue-body', {
      required: true
    })
    expect(core.getInput).toHaveBeenCalledWith('repository', {
      required: true
    })
    expect(core.getInput).toHaveBeenCalledWith('github-token', {
      required: true
    })
    expect(core.getInput).toHaveBeenCalledWith('workspace', { required: true })
  })

  it('Does not add a comment when add-comment is false', async () => {
    core.getInput
      .mockReset()
      .mockReturnValueOnce('false') // add-comment
      .mockReturnValueOnce('1') // issue-number
      .mockReturnValueOnce(parsedIssue) // parsed-issue-body
      .mockReturnValueOnce('issue-ops/validator') // repository
      .mockReturnValueOnce('example-request.yml') // issue-form-template
      .mockReturnValueOnce('12345') // github-token
      .mockReturnValueOnce(process.cwd()) // workspace

    jest
      .spyOn(fs, 'existsSync')
      .mockImplementation((path: PathLike): boolean => {
        switch (path) {
          case `${process.cwd()}/.github/ISSUE_TEMPLATE/example-request.yml`:
            return true
          default:
            return false
        }
      })

    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementation((path: PathOrFileDescriptor): string => {
        switch (path) {
          case `${process.cwd()}/.github/ISSUE_TEMPLATE/example-request.yml`:
            return template
          default:
            return ''
        }
      })

    // Mock the validation errors.
    jest.mocked(validateSpy).mockReturnValue(['error_one', 'error_two'])

    await main.run()

    expect(mocktokit.rest.issues.createComment).not.toHaveBeenCalled()
  })

  it('Adds a failure comment when add-comment is true', async () => {
    jest
      .spyOn(fs, 'existsSync')
      .mockImplementation((path: PathLike): boolean => {
        switch (path) {
          case `${process.cwd()}/.github/ISSUE_TEMPLATE/example-request.yml`:
            return true
          case `${process.cwd()}/.github/validator/failure.mustache`:
            return true
          default:
            return false
        }
      })

    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementation((path: PathOrFileDescriptor): string => {
        switch (path) {
          case `${process.cwd()}/.github/ISSUE_TEMPLATE/example-request.yml`:
            return template
          case `${process.cwd()}/.github/validator/failure.mustache`:
            return failureMustache
          default:
            return ''
        }
      })

    // Mock the validation errors.
    jest.mocked(validateSpy).mockReturnValue(['error_one', 'error_two'])

    await main.run()

    expect(compileTemplateSpy).toHaveBeenCalledWith(
      `${process.cwd()}/.github/validator/failure.mustache`,
      {
        errors: ['error_one', 'error_two']
      }
    )
    expect(mocktokit.rest.issues.createComment).toHaveBeenCalled()
  })

  it('Adds a default failure comment if no template is provided', async () => {
    jest
      .spyOn(fs, 'existsSync')
      .mockImplementation((path: PathLike): boolean => {
        switch (path) {
          case `${process.cwd()}/.github/ISSUE_TEMPLATE/example-request.yml`:
            return true
          default:
            return false
        }
      })

    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementation((path: PathOrFileDescriptor): string => {
        switch (path) {
          case `${process.cwd()}/.github/ISSUE_TEMPLATE/example-request.yml`:
            return template
          default:
            return ''
        }
      })

    // Mock the validation errors.
    jest.mocked(validateSpy).mockReturnValue(['error_one', 'error_two'])

    await main.run()

    expect(compileTemplateSpy).not.toHaveBeenCalledWith()
    expect(mocktokit.rest.issues.createComment).toHaveBeenCalled()
  })

  it('Adds a success comment when add-comment is true', async () => {
    jest
      .spyOn(fs, 'existsSync')
      .mockImplementation((path: PathLike): boolean => {
        switch (path) {
          case `${process.cwd()}/.github/ISSUE_TEMPLATE/example-request.yml`:
            return true
          case `${process.cwd()}/.github/validator/success.mustache`:
            return true
          default:
            return false
        }
      })

    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementation((path: PathOrFileDescriptor): string => {
        switch (path) {
          case `${process.cwd()}/.github/ISSUE_TEMPLATE/example-request.yml`:
            return template
          case `${process.cwd()}/.github/validator/success.mustache`:
            return successMustache
          default:
            return ''
        }
      })

    // Mock the validation errors.
    jest.mocked(validateSpy).mockReturnValue([])

    await main.run()

    expect(compileTemplateSpy).toHaveBeenCalledWith(
      `${process.cwd()}/.github/validator/success.mustache`,
      {
        issue: JSON.parse(parsedIssue)
      }
    )
    expect(mocktokit.rest.issues.createComment).toHaveBeenCalled()
  })

  it('adds a default success comment if no template is provided', async () => {
    jest
      .spyOn(fs, 'existsSync')
      .mockImplementation((path: PathLike): boolean => {
        switch (path) {
          case `${process.cwd()}/.github/ISSUE_TEMPLATE/example-request.yml`:
            return true
          default:
            return false
        }
      })

    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementation((path: PathOrFileDescriptor): string => {
        switch (path) {
          case `${process.cwd()}/.github/ISSUE_TEMPLATE/example-request.yml`:
            return template
          default:
            return ''
        }
      })

    // Mock the validation errors.
    jest.mocked(validateSpy).mockReturnValue([])

    await main.run()

    expect(compileTemplateSpy).not.toHaveBeenCalledWith()
    expect(mocktokit.rest.issues.createComment).toHaveBeenCalled()
  })

  it('Updates an existing comment when add-comment is true', async () => {
    getCommentIdSpy.mockReturnValue(1)

    jest
      .spyOn(fs, 'existsSync')
      .mockImplementation((path: PathLike): boolean => {
        switch (path) {
          case `${process.cwd()}/.github/ISSUE_TEMPLATE/example-request.yml`:
            return true
          case `${process.cwd()}/.github/validator/success.mustache`:
            return true
          default:
            return false
        }
      })

    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementation((path: PathOrFileDescriptor): string => {
        switch (path) {
          case `${process.cwd()}/.github/ISSUE_TEMPLATE/example-request.yml`:
            return template
          case `${process.cwd()}/.github/validator/success.mustache`:
            return successMustache
          default:
            return ''
        }
      })

    // Mock the validation errors.
    jest.mocked(validateSpy).mockReturnValue([])

    await main.run()

    expect(compileTemplateSpy).toHaveBeenCalledWith(
      `${process.cwd()}/.github/validator/success.mustache`,
      {
        issue: JSON.parse(parsedIssue)
      }
    )
    expect(mocktokit.rest.issues.updateComment).toHaveBeenCalled()
  })
})

/**
 * Unit tests for the action's index.ts file.
 */
import fs, { PathLike, PathOrFileDescriptor } from 'fs'
import * as core from '@actions/core'
import * as main from '../src/main'
import * as validate from '../src/validate'
import * as compile from '../src/utils/compile'

// Get the expected data (before mocking fs)
const parsedIssue: string = fs.readFileSync(
  '__tests__/fixtures/example/parsed-issue.json',
  'utf-8'
)
const template: string = fs.readFileSync(
  '__tests__/fixtures/example/template.yml',
  'utf-8'
)
const failureMustache: string = fs.readFileSync(
  '__tests__/fixtures/example/failure.mustache',
  'utf-8'
)
const successMustache: string = fs.readFileSync(
  '__tests__/fixtures/example/success.mustache',
  'utf-8'
)

// Mocks
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn()
}))

jest.spyOn(core, 'info').mockImplementation()
jest.spyOn(core, 'setFailed').mockImplementation()
jest.spyOn(core, 'setOutput').mockImplementation()

describe('main', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('retrieves the inputs', async () => {
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      switch (name) {
        case 'add-comment':
          return 'false'
        case 'github-token':
          return '12345'
        case 'issue-form-template':
          return 'example-request.yml'
        case 'issue-number':
          return '1'
        case 'parsed-issue-body':
          return parsedIssue
        case 'repository':
          return 'issue-ops/validator'
        case 'workspace':
          return process.cwd()
        default:
          return ''
      }
    })

    // First call is to check if the template exists. Set to false to fail fast.
    jest.spyOn(fs, 'existsSync').mockReturnValue(false)

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

  it('fails when the issue form template does not exist', async () => {
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      switch (name) {
        case 'add-comment':
          return 'false'
        case 'github-token':
          return '12345'
        case 'issue-form-template':
          return 'example-request.yml'
        case 'issue-number':
          return '1'
        case 'parsed-issue-body':
          return parsedIssue
        case 'repository':
          return 'issue-ops/validator'
        case 'workspace':
          return process.cwd()
        default:
          return ''
      }
    })

    jest.spyOn(fs, 'existsSync').mockReturnValue(false)

    await main.run()

    expect(core.setFailed).toHaveBeenCalledWith(
      'Template not found: example-request.yml'
    )
  })

  it('does not add a comment when add-comment is false', async () => {
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      switch (name) {
        case 'add-comment':
          return 'false'
        case 'github-token':
          return '12345'
        case 'issue-form-template':
          return 'example-request.yml'
        case 'issue-number':
          return '1'
        case 'parsed-issue-body':
          return parsedIssue
        case 'repository':
          return 'issue-ops/validator'
        case 'workspace':
          return process.cwd()
        default:
          return ''
      }
    })

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
    jest
      .spyOn(validate, 'validate')
      .mockResolvedValue(['error_one', 'error_two'])

    const mocktokit = {
      rest: {
        teams: {
          getByName: jest.fn().mockImplementation(() => ({
            data: {
              id: 1
            }
          }))
        },
        issues: {
          createComment: jest.fn().mockImplementation()
        }
      }
    }

    jest
      .spyOn(require('@octokit/rest'), 'Octokit')
      .mockImplementation(() => mocktokit)

    await main.run()

    expect(mocktokit.rest.issues.createComment).not.toHaveBeenCalled()
  })

  it('adds a failure comment when add-comment is true', async () => {
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      switch (name) {
        case 'add-comment':
          return 'true'
        case 'github-token':
          return '12345'
        case 'issue-form-template':
          return 'example-request.yml'
        case 'issue-number':
          return '1'
        case 'parsed-issue-body':
          return parsedIssue
        case 'repository':
          return 'issue-ops/validator'
        case 'workspace':
          return process.cwd()
        default:
          return ''
      }
    })

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

    jest
      .spyOn(validate, 'validate')
      .mockResolvedValueOnce(['error_one', 'error_two'])

    jest.spyOn(compile, 'compileTemplate')

    const mocktokit = {
      rest: {
        teams: {
          getByName: jest.fn().mockImplementation(() => ({
            data: {
              id: 1
            }
          }))
        },
        issues: {
          createComment: jest.fn().mockImplementation()
        }
      }
    }

    jest
      .spyOn(require('@octokit/rest'), 'Octokit')
      .mockImplementation(() => mocktokit)

    await main.run()

    expect(compile.compileTemplate).toHaveBeenCalledWith(
      `${process.cwd()}/.github/validator/failure.mustache`,
      {
        errors: ['error_one', 'error_two']
      }
    )
    expect(mocktokit.rest.issues.createComment).toHaveBeenCalled()
  })

  it('adds a default failure comment if no template is provided', async () => {
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      switch (name) {
        case 'add-comment':
          return 'true'
        case 'github-token':
          return '12345'
        case 'issue-form-template':
          return 'example-request.yml'
        case 'issue-number':
          return '1'
        case 'parsed-issue-body':
          return parsedIssue
        case 'repository':
          return 'issue-ops/validator'
        case 'workspace':
          return process.cwd()
        default:
          return ''
      }
    })

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
    jest
      .spyOn(validate, 'validate')
      .mockResolvedValueOnce(['error_one', 'error_two'])

    jest.spyOn(compile, 'compileTemplate')

    const mocktokit = {
      rest: {
        teams: {
          getByName: jest.fn().mockImplementation(() => ({
            data: {
              id: 1
            }
          }))
        },
        issues: {
          createComment: jest.fn().mockImplementation()
        }
      }
    }

    jest
      .spyOn(require('@octokit/rest'), 'Octokit')
      .mockImplementation(() => mocktokit)

    await main.run()

    expect(compile.compileTemplate).not.toHaveBeenCalledWith()
    expect(mocktokit.rest.issues.createComment).toHaveBeenCalled()
  })

  it('adds a success comment when add-comment is true', async () => {
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      switch (name) {
        case 'add-comment':
          return 'true'
        case 'github-token':
          return '12345'
        case 'issue-form-template':
          return 'example-request.yml'
        case 'issue-number':
          return '1'
        case 'parsed-issue-body':
          return parsedIssue
        case 'repository':
          return 'issue-ops/validator'
        case 'workspace':
          return process.cwd()
        default:
          return ''
      }
    })

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
    jest.spyOn(validate, 'validate').mockResolvedValueOnce([])

    jest.spyOn(compile, 'compileTemplate')

    const mocktokit = {
      rest: {
        teams: {
          getByName: jest.fn().mockImplementation(() => ({
            data: {
              id: 1
            }
          }))
        },
        issues: {
          createComment: jest.fn().mockImplementation()
        }
      }
    }

    jest
      .spyOn(require('@octokit/rest'), 'Octokit')
      .mockImplementation(() => mocktokit)

    await main.run()

    expect(compile.compileTemplate).toHaveBeenCalledWith(
      `${process.cwd()}/.github/validator/success.mustache`,
      {
        issue: JSON.parse(parsedIssue)
      }
    )
    expect(mocktokit.rest.issues.createComment).toHaveBeenCalled()
  })

  it('adds a default success comment if no template is provided', async () => {
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      switch (name) {
        case 'add-comment':
          return 'true'
        case 'github-token':
          return '12345'
        case 'issue-form-template':
          return 'example-request.yml'
        case 'issue-number':
          return '1'
        case 'parsed-issue-body':
          return parsedIssue
        case 'repository':
          return 'issue-ops/validator'
        case 'workspace':
          return process.cwd()
        default:
          return ''
      }
    })

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
    jest.spyOn(validate, 'validate').mockResolvedValueOnce([])

    jest.spyOn(compile, 'compileTemplate')

    const mocktokit = {
      rest: {
        teams: {
          getByName: jest.fn().mockImplementation(() => ({
            data: {
              id: 1
            }
          }))
        },
        issues: {
          createComment: jest.fn().mockImplementation()
        }
      }
    }

    jest
      .spyOn(require('@octokit/rest'), 'Octokit')
      .mockImplementation(() => mocktokit)

    await main.run()

    expect(compile.compileTemplate).not.toHaveBeenCalledWith()
    expect(mocktokit.rest.issues.createComment).toHaveBeenCalled()
  })
})

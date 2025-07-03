import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import * as github from '../__fixtures__/github.js'
import * as octokit from '../__fixtures__/octokit.js'

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => github)
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
jest.unstable_mockModule('../src/constants.js', () => ({
  COMMENT_IDENTIFIER: '<!-- action-required -->'
}))

const { getCommentId } = await import('../src/comments.js')
const { Octokit } = await import('@octokit/rest')

const mocktokit = jest.mocked(new Octokit())

describe('getCommentId()', () => {
  beforeEach(() => {
    core.getInput.mockReset().mockReturnValueOnce('https://api.github.com')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Returns a comment ID', async () => {
    mocktokit.paginate.mockResolvedValue([
      {
        id: 1,
        body: 'This is a comment. <!-- action-required -->'
      },
      {
        id: 2,
        body: 'This is another comment.'
      }
    ])

    const result = await getCommentId('token', 'owner', 'repo', 1)

    expect(mocktokit.paginate).toHaveBeenCalled()
    expect(result).toBe(1)
  })
})

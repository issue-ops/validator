import * as github from '@actions/github'
import { COMMENT_IDENTIFIER } from './constants.js'

/**
 * Gets the comment ID that contains the previous validator result comment, if
 * it exists.
 *
 * @param token The GitHub token
 * @returns The ID of the previous validator result comment, or undefined
 */
export async function getCommentId(
  token: string,
  owner: string,
  repo: string,
  issueNumber: number
): Promise<number | undefined> {
  const octokit = github.getOctokit(token)

  // If no existing comment is found, set the result to undefined.
  let commentId: number | undefined = undefined

  const response = await octokit.paginate(octokit.rest.issues.listComments, {
    owner,
    repo,
    issue_number: issueNumber
  })

  for (const comment of response)
    if (comment.body?.includes(COMMENT_IDENTIFIER)) commentId = comment.id

  return commentId
}

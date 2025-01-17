import * as github from '@actions/github'

export const COMMENT_IDENTIFIER = `<!-- validator: workflow=${github.context.workflow} -->`

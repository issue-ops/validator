/**
 * Gets the comment ID that contains the previous validator result comment, if
 * it exists.
 *
 * @param token The GitHub token
 * @returns The ID of the previous validator result comment, or undefined
 */
export declare function getCommentId(token: string, owner: string, repo: string, issueNumber: number): Promise<number | undefined>;

import { FormattedField, ParsedBody } from './interfaces.js';
/**
 * Validates the parsed issue body against the parsed issue form template
 * @param template The parsed issue form template
 * @param issue The parsed issue body
 * @param workspace The path to the workspace
 * @returns A list of errors (empty list means the issue is valid)
 */
export declare function validate(template: {
    [key: string]: FormattedField;
}, issue: ParsedBody, workspace: string): Promise<string[]>;

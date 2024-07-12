import { FormattedField, ParsedBody } from '../interfaces.js';
/**
 * Validates the parsed issue body section as a textarea type
 * @param template The parsed issue form template
 * @param issue The parsed issue body
 * @param errors The running list of errors (modified in place)
 * @returns
 */
export declare function validateTextarea(key: string, props: FormattedField, issue: ParsedBody, errors: string[]): void;

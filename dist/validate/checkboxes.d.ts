import { FormattedField, ParsedBody } from '../interfaces.js';
/**
 * Validates the parsed issue body section as a checkboxes type
 * @param key The name of the field
 * @param props The issue form template properties for this field
 * @param issue The parsed issue body
 * @param errors The running list of errors (modified in place)
 * @returns
 */
export declare function validateCheckboxes(key: string, props: FormattedField, issue: ParsedBody, errors: string[]): void;

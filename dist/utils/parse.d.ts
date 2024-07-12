import { FormattedField, IssueFormTemplate } from '../interfaces.js';
/**
 * Parses the issue form template and returns a dictionary of fields
 * @param template The issue form template
 * @returns A dictionary of fields
 */
export declare function parseTemplate(template: IssueFormTemplate): Promise<{
    [key: string]: FormattedField;
}>;

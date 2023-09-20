/**
 * Formats a input name to a snake case string
 *
 * - Removes leading and trailing whitespace
 * - Converts to lowercase
 * - Replaces spaces with underscores
 * - Replaces non-alphanumeric characters with underscores
 * - Replaces multiple consecutive underscores with a single underscore
 */
export function formatKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
}

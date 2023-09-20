/**
 * Unit tests for the action's format.ts file.
 */

import { formatKey } from '../src/format'

describe('formatKey', () => {
  it('removes non-alphanumeric characters', async () => {
    expect(formatKey('!@#$%^&*()_+')).toBe('')
  })

  it('converts to lowercase', async () => {
    expect(formatKey('ABC')).toBe('abc')
  })

  it('replaces spaces with underscores', async () => {
    expect(formatKey('a b c')).toBe('a_b_c')
  })

  it('replaces multiple consecutive underscores with a single underscore', async () => {
    expect(formatKey('a__b__c')).toBe('a_b_c')
  })

  it('removes leading and trailing underscores', async () => {
    expect(formatKey('_abc_')).toBe('abc')
  })

  it('removes leading and trailing whitespace', async () => {
    expect(formatKey(' abc ')).toBe('abc')
  })

  it('handles empty strings', async () => {
    expect(formatKey('')).toBe('')
  })
})

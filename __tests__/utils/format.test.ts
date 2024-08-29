import { jest } from '@jest/globals'
import { formatKey } from '../../src/utils/format.js'

describe('formatKey()', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  it('Removes non-alphanumeric characters', async () => {
    expect(formatKey('!@#$%^&*()_+')).toBe('')
  })

  it('Converts to lowercase', async () => {
    expect(formatKey('ABC')).toBe('abc')
  })

  it('Replaces spaces with underscores', async () => {
    expect(formatKey('a b c')).toBe('a_b_c')
  })

  it('Replaces multiple consecutive underscores with a single underscore', async () => {
    expect(formatKey('a__b__c')).toBe('a_b_c')
  })

  it('Removes leading and trailing underscores', async () => {
    expect(formatKey('_abc_')).toBe('abc')
  })

  it('Removes leading and trailing whitespace', async () => {
    expect(formatKey(' abc ')).toBe('abc')
  })

  it('Handles empty strings', async () => {
    expect(formatKey('')).toBe('')
  })
})

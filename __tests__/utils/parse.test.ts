import { jest } from '@jest/globals'
import fs from 'fs'
import * as core from '../../__fixtures__/core.js'

jest.unstable_mockModule('@actions/core', () => core)

const { parseTemplate } = await import('../../src/utils/parse.js')

describe('parseTemplate()', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  it('Parses a template with IDs', async () => {
    const expected = JSON.parse(
      fs.readFileSync('__fixtures__/example/parsed-template.json', 'utf8')
    )

    const result = await parseTemplate('__fixtures__/example/template.yml')
    expect(result).toEqual(expected)
  })

  it('Parses a template without IDs', async () => {
    const expected = JSON.parse(
      fs.readFileSync('__fixtures__/no-ids/parsed-template.json', 'utf8')
    )

    const result = await parseTemplate('__fixtures__/no-ids/template.yml')
    expect(result).toEqual(expected)
  })

  it('Throws if the template is not found', async () => {
    await expect(
      parseTemplate('__fixtures__/does-not-exist.yml')
    ).rejects.toThrow('Template not found: __fixtures__/does-not-exist.yml')
  })
})

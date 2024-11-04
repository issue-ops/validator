import dedent from 'dedent-js'
import fs from 'fs'
import Handlebars from 'handlebars'

/**
 * A custom Handlebars helper to nicely format newlines in markdown
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Handlebars.registerHelper('newlines', (input: any): string => {
  if (typeof input !== 'string') return JSON.stringify(input)
  else return input.replaceAll('\n', '<br>')
})

/**
 * Compile a message using a given template and context
 *
 * @param template The template to compile
 * @param ctx The context to use when compiling the template
 * @returns The compiled message
 */
export function compileTemplate(template: string, ctx: object): string {
  // Load the template
  const templateFile: string = fs.readFileSync(template, 'utf8')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const compiledTemplate: HandlebarsTemplateDelegate<any> =
    Handlebars.compile(templateFile)

  return dedent(compiledTemplate(ctx))
}

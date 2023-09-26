import dedent from 'dedent-js'
import fs from 'fs'
import Handlebars from 'handlebars'

/**
 * A custom Handlebars helper to nicely format newlines in markdown
 */
Handlebars.registerHelper('newlines', function (input: string): string {
  return input.replaceAll('\n', '<br>')
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

  // eslint-disable-next-line no-undef
  const compiledTemplate: HandlebarsTemplateDelegate<any> =
    Handlebars.compile(templateFile)

  return dedent(compiledTemplate(ctx))
}

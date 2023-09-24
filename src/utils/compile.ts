import dedent from 'dedent-js'
import fs from 'fs'
import handlebars from 'handlebars'

/**
 * Compile a message using a given template and context
 *
 * @param template The template to compile
 * @param ctx The context to use when compiling the template
 * @returns The compiled message
 */
export function compileTemplate(template: string, ctx: object): string {
  // Load the template
  const templateFile = fs.readFileSync(template, 'utf8')
  const compiledTemplate = handlebars.compile(templateFile)

  return dedent(compiledTemplate(ctx))
}

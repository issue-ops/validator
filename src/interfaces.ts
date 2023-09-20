/**
 * A GitHub issue form template
 */
export interface IssueFormTemplate {
  name: string
  description: string
  body: (
    | MarkdownField
    | TextareaField
    | InputField
    | DropdownField
    | CheckboxesField
  )[]
  assignees?: string[]
  labels?: string[]
  title?: string
  projects?: string[]
}

/**
 * A GitHub issue forms Markdown field
 */
export interface MarkdownField {
  type: 'markdown'
  id?: string
  attributes: {
    value: string
  }
}

/**
 * A GitHub issue forms textarea field
 */
export interface TextareaField {
  type: 'textarea'
  id?: string
  attributes: {
    label: string
    description?: string
    placeholder?: string
    value?: string
    render?: string
  }
  validations?: {
    required?: boolean
  }
}

/**
 * A GitHub issue forms input field
 */
export interface InputField {
  type: 'input'
  id?: string
  attributes: {
    label: string
    description?: string
    placeholder?: string
    value?: string
  }
  validations?: {
    required?: boolean
  }
}

/**
 * A GitHub issue forms dropdown field
 */
export interface DropdownField {
  type: 'dropdown'
  id?: string
  attributes: {
    label: string
    description?: string
    multiple?: boolean
    options: string[]
    default?: number
  }
  validations?: {
    required?: boolean
  }
}

/**
 * A GitHub issue forms checkboxes field
 */
export interface CheckboxesField {
  type: 'checkboxes'
  id?: string
  attributes: {
    label: string
    description?: string
    options: {
      label: string
      required?: boolean
    }[]
  }
  validations?: {
    required?: boolean
  }
}

/**
 * A formatted GitHub issue forms field
 */
export interface FormattedField {
  type: 'markdown' | 'textarea' | 'input' | 'dropdown' | 'checkboxes'
  required: boolean
  default?: number
  multiple?: boolean
  options?: (
    | string
    | {
        label: string
        required: boolean
      }
  )[]
}

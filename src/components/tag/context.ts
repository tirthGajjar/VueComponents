import { inject, InjectionKey } from 'vue'
import { TagSelectOptionStateDefinition, TagsStateDefinition } from './types'

export const TagsContext = Symbol('TagsContext') as InjectionKey<
  TagsStateDefinition
>

export function useTagsContext(component: string, parentComponent = 'Tags') {
  const context = inject(TagsContext, null)

  if (context === null) {
    const err = new Error(
      `<${component} /> is missing a parent <${parentComponent} /> component.`
    )
    if (Error.captureStackTrace) Error.captureStackTrace(err, useTagsContext)
    throw err
  }

  return context
}

// Used only in TagSelectOption & TagRemoveIcon
export const TagSelectOptionContext = Symbol(
  'TagSelectOptionContext'
) as InjectionKey<TagSelectOptionStateDefinition>

export function useTagSelectOptionContext(
  component: string,
  parentComponent = 'TagSelectOption'
) {
  const context = inject(TagSelectOptionContext, null)

  if (context === null) {
    const err = new Error(
      `<${component} /> is missing a parent <${parentComponent} /> component.`
    )
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useTagSelectOptionContext)
    throw err
  }

  return context
}

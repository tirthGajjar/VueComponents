import { inject, InjectionKey } from 'vue'
import { CheckboxGroupStateDefinition } from './types'

export const CheckboxGroupContext = Symbol(
  'CheckboxGroupContext'
) as InjectionKey<CheckboxGroupStateDefinition>

export function useCheckboxGroupContext(component: string) {
  const context = inject(CheckboxGroupContext, null)

  if (context === null) {
    const err = new Error(
      `<${component} /> is missing a parent <CheckboxGroup /> component.`
    )
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useCheckboxGroupContext)
    throw err
  }

  return context
}

import { inject, InjectionKey } from 'vue'
import { RadioGroupStateDefinition } from './types'

export const RadioGroupContext = Symbol('RadioGroupContext') as InjectionKey<
  RadioGroupStateDefinition
>

export function useRadioGroupContext(component: string) {
  const context = inject(RadioGroupContext, null)

  if (context === null) {
    const err = new Error(
      `<${component} /> is missing a parent <RadioGroup /> component.`
    )
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useRadioGroupContext)
    throw err
  }

  return context
}

import { StringOrNumber } from '@/types'
import { ComputedRef, Ref } from 'vue'

export type Option = {
  id: string
  value: StringOrNumber
  disabled: boolean
}

export type CheckboxGroupStateDefinition = {
  /**
   * State
   */
  checkedValues: ComputedRef<StringOrNumber[]>
  checkboxGroupRef: Ref<HTMLElement | null>
  options: Ref<Option[]>

  /**
   * Methods
   */
  markChecked(option: Option): void
  registerOption(option: Option): void
  unregisterOption(id: string): void
}

import { Focus } from '@/utils/calculate-active-index'
import { ComputedRef, Ref } from 'vue'

export type StringOrNumber = string | number

export type Option = {
  id: string
  value: StringOrNumber
  disabled: boolean
}

export type RadioGroupStateDefinition = {
  /**
   * State
   */
  checkedRadioValue: ComputedRef<StringOrNumber | null>
  radioGroupRef: Ref<HTMLElement | null>
  options: Ref<Option[]>

  /**
   * Methods
   */
  markChecked(option: Option): void
  registerOption(option: Option): void
  unregisterOption(id: string): void
  goToOption(focus: Focus, id?: string): void
}

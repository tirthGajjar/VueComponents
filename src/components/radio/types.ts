import { ComputedRef, Ref } from 'vue'

export type StringOrNumber = string | number

export type RadioGroupStateDefinition = {
  /**
   * State
   */
  checkedRadioValue: ComputedRef<StringOrNumber | null>
  // checkRadioOptionIndex: ComputedRef<number>
  radioGroupRef: Ref<HTMLElement | null>
  radioOptions: ComputedRef<unknown[]>

  /**
   * Methods
   */
  markChecked(value: StringOrNumber): void
}

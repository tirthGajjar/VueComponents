import { ComputedRef, Ref } from 'vue'

export type StringOrNumber = string | number

export type Option = {
  // Unique id of the option
  id: StringOrNumber
  label?: string
}

export type OptionsMap = Ref<
  {
    [id in StringOrNumber]: unknown
  }
>

export type SelectedOptionsIdMap = Ref<
  {
    [key in StringOrNumber]: boolean
  }
>

export type TagsStateDefinition = {
  /**
   * State
   */
  isOpen: Ref<boolean> // Is tag menu opened?

  // Id of the current highlighted option
  highlightedOptionId: Ref<StringOrNumber | null>

  filterQuery: Ref<string>

  // All the options
  options: Ref<unknown[]>

  // OptionsMap
  optionsMap: ComputedRef<OptionsMap>

  // Store the ids of the all the selected options
  selectedOptionsIdMap: ComputedRef<SelectedOptionsIdMap>

  // Store the selectedOptionsData
  selectedOptions: ComputedRef<unknown[]>

  // Ids of the filtered options
  filteredOptionsId: Ref<StringOrNumber[]>

  //refs
  tagControlRef: Ref<HTMLElement | null>
  tagMenuRef: Ref<HTMLElement | null>
  tagSelectionListRef: Ref<HTMLElement | null>
  tagFilterRef: Ref<HTMLInputElement | null>
  tagCreateRef: Ref<HTMLElement | null>

  /**
   * Methods
   */
  openMenu(): void
  closeMenu(): void
  toggleMenu(): void
  select(
    optionId: StringOrNumber,
    createNew?: boolean,
    newOptionDetails?: Partial<Option>
  ): void
  clearFilterQuery(): void
  handleOnClick(event: MouseEvent): void
  foucsFilterBox(): void
  removeLastSelectedOption(): void
  setHighlightedOption(optionId: StringOrNumber): void
  highLightFirstOption(): void
  highLightLastOption(): void
  highlightNextOption(): void
  highlightPrevOption(): void
}

export type TagSelectOptionStateDefinition = {
  optionId: ComputedRef<StringOrNumber>
  removeOption(): void
}

import { useId } from '@/hooks/use-id'
import { Keys } from '@/keyboard'
import { isEmpty } from '@/utils/isEmpty'
import { render } from '@/utils/render'
import { scrollIntoView } from '@/utils/scrollIntoView'
import {
  computed,
  ComputedRef,
  defineComponent,
  inject,
  InjectionKey,
  nextTick,
  provide,
  ref,
  Ref,
  watch,
} from 'vue'

const TAG_SELECTION_MODE = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
}

const keysThatRequireToOpenMenu = [
  Keys.Enter,
  Keys.ArrowUp,
  Keys.ArrowDown,
  Keys.Space,
]

type StringOrNumber = string | number

type Option = {
  // Unique id of the option
  id: StringOrNumber
  label?: string
}

type OptionsMap = Ref<
  {
    [id in StringOrNumber]: unknown
  }
>

type SelectedOptionsIdMap = Ref<
  {
    [key in StringOrNumber]: boolean
  }
>

type TagsStateDefinition = {
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

  /**
   * Methods
   */
  openMenu(): void
  closeMenu(): void
  toggleMenu(): void
  select(optionId: StringOrNumber): void
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

const TagsContext = Symbol('TagsContext') as InjectionKey<TagsStateDefinition>

function useTagsContext(component: string, parentComponent = 'Tags') {
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

type TagSelectOptionStateDefinition = {
  optionId: ComputedRef<StringOrNumber>
  removeOption(): void
}

const TagSelectOptionContext = Symbol('TagSelectOptionContext') as InjectionKey<
  TagSelectOptionStateDefinition
>

function useTagSelectOptionContext(
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

export const Tags = defineComponent({
  name: 'Tags',
  props: {
    as: {
      type: [Object, String],
      default: 'div',
    },
    modelValue: {
      type: Array,
      default: () => [],
    },
    mode: {
      default: TAG_SELECTION_MODE.SINGLE,
      validator: (value: string): boolean => {
        return Object.values(TAG_SELECTION_MODE).includes(value)
      },
    },
    options: {
      type: Array,
      required: true,
    },
    searchKey: {
      type: String,
      default: 'label',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots, attrs, emit }) {
    const isOpen = ref<TagsStateDefinition['isOpen']['value']>(false)
    const highlightedOptionId = ref<
      TagsStateDefinition['highlightedOptionId']['value']
    >(null)
    const filterQuery = ref<TagsStateDefinition['filterQuery']['value']>('')
    const filteredOptionsId = ref<
      TagsStateDefinition['filteredOptionsId']['value']
    >((props.options as Option[]).map((option) => option.id))

    // ------------- refs ------------------
    const tagMenuRef = ref<TagsStateDefinition['tagMenuRef']['value']>(null)
    const tagSelectionListRef = ref<
      TagsStateDefinition['tagSelectionListRef']['value']
    >(null)
    const tagFilterRef = ref<TagsStateDefinition['tagFilterRef']['value']>(null)
    const tagControlRef = ref<TagsStateDefinition['tagControlRef']['value']>(
      null
    )

    // ---------------- Computed -------------------
    const options = computed(() => props.options)
    const selectedOptions = computed(() => props.modelValue)

    const optionsMap = computed<OptionsMap>(() => {
      const optsMap: any = {}
      props.options.forEach((opt) => {
        const option = opt as Option
        optsMap[option.id] = option
      })

      return optsMap
    })

    const selectedOptionsIdMap = computed<SelectedOptionsIdMap>(() => {
      const seleletedIds: any = {}
      const selectedOpts = props.modelValue as Option[]

      selectedOpts.forEach((option: Option) => {
        seleletedIds[option.id] = true
      })

      return seleletedIds
    })

    watch(
      () => filterQuery.value,
      (newValue) => {
        const opts = options.value as Option[]
        const query = newValue.trim()

        filteredOptionsId.value.splice(0)

        if (isEmpty(query)) {
          opts.forEach((option: Option) => {
            filteredOptionsId.value.push(option.id)
          })
        } else {
          // ids = []
          opts.forEach((option: any) => {
            const searchKeyValue = option[props.searchKey] as string

            if (
              searchKeyValue.toLowerCase().search(query.toLowerCase()) != -1
            ) {
              filteredOptionsId.value.push(option.id)
            }
          })
        }
      }
    )

    const api = {
      isOpen,
      highlightedOptionId,
      filterQuery,
      filteredOptionsId,
      options,
      optionsMap,
      selectedOptionsIdMap,
      selectedOptions,
      tagMenuRef,
      tagSelectionListRef,
      tagFilterRef,
      tagControlRef,
      openMenu() {
        api.isOpen.value = true
        emit('menu-opened')
      },
      closeMenu() {
        api.isOpen.value = false
        api.highlightedOptionId.value = null
        emit('menu-closed')
      },
      toggleMenu() {
        if (api.isOpen.value) {
          api.closeMenu()
        } else {
          api.openMenu()
        }
      },
      select(optionId: StringOrNumber) {
        const option = (api.optionsMap.value as any)[optionId]
        if (props.disabled || option.disabled) {
          return
        }

        const isAlreadySelected = (api.selectedOptionsIdMap.value as any)[
          optionId
        ]

        const modelValue = [...props.modelValue] as Option[]
        if (isAlreadySelected) {
          // Deselect the option
          const idx = modelValue.findIndex((opt) => opt.id === optionId)

          if (idx === -1) {
            const error = new Error(
              'selectedOptions value & selectedOptionsMap are not in sync'
            )
            throw error
          }

          modelValue.splice(idx, 1)

          const eventData = {
            deSelectedOptionId: optionId,
            deSelectedOption: (api.optionsMap.value as any)[optionId],
            currentSelectedData: props.modelValue,
          }

          emit('option-deselected', eventData)
        } else {
          if (props.mode === TAG_SELECTION_MODE.SINGLE) {
            // Empty array
            modelValue.splice(0, props.modelValue.length)
          }

          const selectedOption = (api.optionsMap.value as any)[optionId]
          modelValue.push(selectedOption)
          const eventData = {
            selectedOptionId: optionId,
            selectedOption: selectedOption,
            currentSelectedData: modelValue,
          }

          emit('option-selected', eventData)
        }

        emit('update:modelValue', modelValue)
      },
      setHighlightedOption(optionId: StringOrNumber) {
        api.highlightedOptionId.value = optionId

        if (api.isOpen.value) {
          const scrollToOption = () => {
            const menu = api.tagMenuRef.value
            const option = menu?.querySelector(`[data-id="${optionId}"]`)
            if (option) {
              scrollIntoView(menu as HTMLElement, option as HTMLElement)
            }
          }

          // In case `openMenu()` is just called and the menu is not rendered yet.
          if (api.tagMenuRef.value) {
            scrollToOption()
          } else {
            nextTick(scrollToOption)
          }
        }
      },
      highLightLastOption() {
        const filteredOptsId = api.filteredOptionsId.value
        if (filteredOptsId.length === 0) return

        const lastOptionId = filteredOptsId[filteredOptsId.length - 1]
        api.setHighlightedOption(lastOptionId)
      },
      highLightFirstOption() {
        const filteredOptsId = api.filteredOptionsId.value
        if (filteredOptsId.length === 0) return

        const firstOptionId = filteredOptsId[0]
        api.setHighlightedOption(firstOptionId)
      },
      highlightPrevOption() {
        const filteredOptsId = api.filteredOptionsId.value
        if (filteredOptsId.length === 0) return

        if (api.highlightedOptionId.value !== null) {
          const idx = filteredOptsId.indexOf(api.highlightedOptionId.value) - 1
          if (idx === -1) {
            return api.highLightLastOption()
          }

          const prevOptionId = filteredOptsId[idx]
          api.setHighlightedOption(prevOptionId)
        } else {
          api.highLightLastOption()
        }
      },
      highlightNextOption() {
        const filteredOptsId = api.filteredOptionsId.value
        if (filteredOptsId.length === 0) return

        if (api.highlightedOptionId.value !== null) {
          const idx = filteredOptsId.indexOf(api.highlightedOptionId.value) + 1
          if (idx === -1) {
            return api.highLightFirstOption()
          }

          const nextOptionId = filteredOptsId[idx]
          api.setHighlightedOption(nextOptionId)
        } else {
          api.highLightFirstOption()
        }
      },
      clearFilterQuery() {
        api.filterQuery.value = ''
      },
      foucsFilterBox() {
        api.tagFilterRef.value?.focus()
      },
      handleOnClick(event: MouseEvent) {
        event.preventDefault()
        event.stopPropagation()

        if (props.disabled) return

        if (!api.isOpen.value) {
          api.openMenu()
        }

        this.foucsFilterBox()
      },
      removeLastSelectedOption() {
        if (props.modelValue.length === 0) {
          return
        }

        const selectedOpts = props.modelValue as Option[]

        const lastOption = selectedOpts[selectedOpts.length - 1]

        // Deselect the last element
        api.select(lastOption.id)
      },
    }

    provide(TagsContext, api)

    return () => {
      const slot = { isOpen: api.isOpen.value, disabled: props.disabled }
      return render({ props, slot, attrs, slots })
    }
  },
})

export const TagsControl = defineComponent({
  name: 'TagsControl',
  props: {
    as: {
      type: [Object, String],
      default: 'div',
    },
  },
  setup() {
    const api = useTagsContext('TagsControl')
    const id = `raxui-tags-control-control-${useId()}`

    return {
      id,
      el: api.tagControlRef,
      handleOnClick(event: MouseEvent) {
        api.handleOnClick(event)
      },
    }
  },
  render() {
    const api = useTagsContext('TagsControl')

    const propsWeControl = {
      ref: 'el',
      id: this.id,
      onClick: this.handleOnClick,
    }

    const slot = { isOpen: api.isOpen.value }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
    })
  },
})

export const TagsControlArrow = defineComponent({
  name: 'TagsControlArrow',
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  setup() {
    const id = `raxui-tag-control-arrow-${useId()}`
    const api = useTagsContext('TagsControlArrow', 'TagsControl')

    function handleOnClick(event: MouseEvent) {
      event.preventDefault()
      event.stopPropagation()

      api.foucsFilterBox()
      api.toggleMenu()
    }

    return {
      id,
      handleOnClick,
    }
  },
  render() {
    const api = useTagsContext('TagsControlArrow', 'TagsControl')
    const propsWeControl = {
      id: this.id,
      onClick: this.handleOnClick,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot: { isOpen: api.isOpen.value },
      slots: this.$slots,
      attrs: this.$attrs,
    })
  },
})

export const TagSelectionList = defineComponent({
  name: 'TagSelectionList',
  props: {
    as: {
      type: [Object, String],
      default: 'div',
    },
  },
  setup() {
    const api = useTagsContext('TagSelectionList', 'TagsControl')
    const id = `raxui-tag-selection-list-${useId()}`

    return {
      id,
      el: api.tagSelectionListRef,
    }
  },
  render() {
    const api = useTagsContext('TagSelectionList', 'TagsControl')
    const slot = { isOpen: api.isOpen.value }

    const propsWeControl = {
      id: this.id,
      ref: 'el',
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      slots: this.$slots,
      attrs: this.$attrs,
    })
  },
})

export const TagSelectOption = defineComponent({
  name: 'TagSelectOption',
  props: {
    as: { type: [Object, String], default: 'div' },
    optionId: { type: [String, Number], required: true },
    onClickRemove: { type: Boolean, default: true },
  },
  setup(props) {
    const api = useTagsContext('TagSelectOption', 'TagsControl')
    const id = `raxui-tag-select-option-${useId()}`
    const optionId = computed(() => props.optionId)

    function removeOption() {
      if (!api.isOpen.value) {
        return api.openMenu()
      }
      // Deselect the option
      api.select(optionId.value)
    }

    const tagSelectOptionAPI = {
      optionId,
      removeOption,
    }

    provide(TagSelectOptionContext, tagSelectOptionAPI)

    return {
      id,
      removeOption,
    }
  },
  render() {
    const api = useTagsContext('TagSelectOption', 'TagsControl')
    const slot = {
      selected: (api.selectedOptionsIdMap.value as any)[this.$props.optionId],
      isOpen: api.isOpen.value,
    }

    const handleOnClick = () => {
      if (this.$props.onClickRemove) {
        this.removeOption()
      }
    }

    const propsWeControl = {
      id: this.id,
      onClick: handleOnClick,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      slots: this.$slots,
      attrs: this.$attrs,
    })
  },
})

export const TagRemoveIcon = defineComponent({
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  setup() {
    const id = `raxui-tag-remove-icon-${useId()}`

    return {
      id,
    }
  },
  render() {
    const tagSelectOptionAPI = useTagSelectOptionContext(
      'TagRemoveIcon',
      'TagSelectOption'
    )

    const propsWeControl = {
      id: this.id,
      onClick: tagSelectOptionAPI.removeOption(),
    }

    const slot = {}

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      slots: this.$slots,
      attrs: this.$attrs,
    })
  },
})

export const TagFilter = defineComponent({
  name: 'TagFilter',
  props: {
    as: { type: [Object, String], default: 'input' },
  },
  setup(_props, { emit }) {
    const api = useTagsContext('TagFilter', 'TagsControl')
    const id = `raxui-tag-filter-${useId()}`

    function handleOnInput(event: InputEvent) {
      const { value } = event.target as HTMLInputElement
      api.filterQuery.value = value
      emit('filter-query-change', value)
    }

    function handleOnKeyDown(event: KeyboardEvent) {
      const key = event.key

      if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
        return
      }

      if (
        !api.isOpen.value &&
        keysThatRequireToOpenMenu.includes(key as Keys)
      ) {
        event.preventDefault()
        return api.openMenu()
      }

      switch (key) {
        case Keys.Backspace: {
          if (api.filterQuery.value.length === 0) {
            api.removeLastSelectedOption()
          }
          break
        }

        case Keys.Enter: {
          event.preventDefault()
          if (api.highlightedOptionId.value === null) return
          api.select(api.highlightedOptionId.value)
          break
        }

        case Keys.Escape: {
          if (api.isOpen.value) {
            api.closeMenu()
          }
          break
        }

        case Keys.End: {
          event.preventDefault()
          api.highLightLastOption()
          break
        }

        case Keys.ArrowUp: {
          event.preventDefault()
          api.highlightPrevOption()
          break
        }

        case Keys.ArrowDown: {
          event.preventDefault()
          api.highlightNextOption()
          break
        }

        case Keys.Delete: {
          api.removeLastSelectedOption()
          break
        }

        default: {
          api.openMenu()
          break
        }
      }
    }

    function handleOnClick(event: MouseEvent) {
      if (api.selectedOptions.value.length) {
        // Prevent it from bubbling to the top level and triggering `preventDefault()`
        // to make the textbox unselectable
        event.stopPropagation()
      }
    }

    return {
      id,
      el: api.tagFilterRef,
      handleOnInput,
      handleOnKeyDown,
      handleOnClick,
    }
  },
  render() {
    const api = useTagsContext('TagFilter', 'TagsControl')

    const propsWeControl = {
      ref: 'el',
      id: this.id,
      type: 'text',
      autocomplete: 'off',
      tabIndex: 0,
      value: api.filterQuery.value,
      onInput: this.handleOnInput,
      onKeydown: this.handleOnKeyDown,
      onClick: this.handleOnClick,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot: {},
      slots: this.$slots,
      attrs: this.$attrs,
    })
  },
})

export const TagMenu = defineComponent({
  name: 'TagMenu',
  props: {
    as: { type: [Object, String], default: 'div' },
    unmount: { type: Boolean, default: true },
  },
  setup() {
    const api = useTagsContext('TagMenu', 'Tags')

    const id = `raxui-tag-menu-${useId()}`

    return {
      id,
      el: api.tagMenuRef,
    }
  },
  render() {
    const api = useTagsContext('TagMenu', 'Tags')

    const slot = { isOpen: api.isOpen.value }

    const propsWeControl = {
      id: this.id,
      role: 'listbox',
      ref: 'el',
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      slots: this.$slots,
      attrs: this.$attrs,
    })
  },
})

export const TagMenuOption = defineComponent({
  name: 'TagMenuOption',
  props: {
    as: { type: [Object, String], default: 'template' },
    optionId: { type: [String, Number], required: true },
    disabled: { type: Boolean, default: false },
  },
  setup(props) {
    const api = useTagsContext('TagMenuOption', 'TagMenu')

    const id = `raxui-tag-menu-option-${useId()}`

    function handleOnClick(event: MouseEvent) {
      if (props.disabled) return event.preventDefault()
      api.select(props.optionId)
    }

    return {
      id,
      handleOnClick,
    }
  },
  render() {
    const api = useTagsContext('TagMenuOption', 'TagMenu')

    const highlighted = computed<boolean>(
      () => this.$props.optionId === api.highlightedOptionId.value
    )

    const selected = computed<boolean>(() => {
      const selectedOptionsIdMap: any = api.selectedOptionsIdMap.value

      return selectedOptionsIdMap[this.$props.optionId]
    })

    const visible = computed<boolean>(() => {
      return api.filteredOptionsId.value.includes(this.$props.optionId)
    })

    const slot = {
      visible: visible.value,
      highlighted: highlighted.value,
      selected: selected.value,
    }
    const propsWeControl = {
      id: this.id,
      role: 'option',
      tabIndex: -1,
      'aria-disabled': this.$props.disabled === true ? true : undefined,
      'aria-selected': selected.value === true ? true : undefined,
      onClick: this.handleOnClick,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      slots: this.$slots,
      attrs: this.$attrs,
    })
  },
})

// export const TagCreateOption = defineComponent({
//   name: 'TagCreateOption',
//   props: {
//     as: { type: [Object, String], default: 'template' },
//   },
// })

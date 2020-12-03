import { useId } from '@/hooks/use-id'
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
} from 'vue'

const TAG_SELECTION_MODE = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
}

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

type SelectedOptionIdMap = Ref<
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

  //refs
  tagControlRef: Ref<HTMLElement | null>
  tagMenuRef: Ref<HTMLElement | null>
  tagSelectionListRef: Ref<HTMLElement | null>
  tagFilterRef: Ref<HTMLInputElement | null>

  // OptionsMap
  optionsMap: ComputedRef<OptionsMap>

  // Store the ids of the all the selected options
  selectedOptionsIdMap: ComputedRef<SelectedOptionIdMap>

  // Ids of the filtered options
  filteredOptionsId: ComputedRef<StringOrNumber[]>

  /**
   * Methods
   */
  openMenu(): void
  closeMenu(): void
  toggleMenu(): void
  select(optionId: StringOrNumber): void
  setHighlightedOption(optionId: StringOrNumber): void
  clearFilterQuery(): void
  handleMouseDown(event: MouseEvent): void
  foucsFilterBox(): void
}

const TagsContext = Symbol('TagsContext') as InjectionKey<TagsStateDefinition>

function useTagsContext(component: string, parentComponent: string = 'Tags') {
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
  parentComponent: string = 'TagSelectOption'
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

    const optionsMap = computed<OptionsMap>(() => {
      const optsMap: any = {}
      props.options.forEach((opt) => {
        const option = opt as Option
        optsMap[option.id] = option
      })

      return optsMap
    })

    const selectedOptionsIdMap = computed<SelectedOptionIdMap>(() => {
      const seleletedIds: any = {}
      props.modelValue.forEach((id) => {
        seleletedIds[id as StringOrNumber] = true
      })

      return seleletedIds
    })

    const filteredOptionsId = computed<StringOrNumber[]>(() => {
      let ids: StringOrNumber[] = []
      const opts = options.value as Option[]
      const query = filterQuery.value.trim()

      if (isEmpty(query)) {
        ids = opts.map((option: Option) => option.id)
      } else {
        ids = []
        opts.forEach((option: any) => {
          const searchKeyValue = option[props.searchKey] as string

          if (searchKeyValue.toLowerCase().search(query.toLowerCase()) != -1) {
            ids.push(option.id)
          }
        })
      }

      return ids
    })

    const api = {
      isOpen,
      highlightedOptionId,
      filterQuery,
      filteredOptionsId,
      options,
      optionsMap,
      selectedOptionsIdMap,
      tagMenuRef,
      tagSelectionListRef,
      tagFilterRef,
      tagControlRef,
      openMenu() {
        api.isOpen.value = true
        emit('menuOpened')
      },
      closeMenu() {
        api.isOpen.value = false
        api.highlightedOptionId.value = null
        emit('menuClosed')
      },
      toggleMenu() {
        if (api.isOpen.value) {
          api.closeMenu()
        } else {
          api.openMenu()
        }
      },
      select(optionId: StringOrNumber) {
        // TODO: Implement select for single & multiple mode
        const option = (api.optionsMap.value as any)[optionId]
        if (props.disabled || option.disabled) {
          return
        }

        const isAlreadySelected = (api.selectedOptionsIdMap.value as any)[
          optionId
        ]
        if (isAlreadySelected) {
          // Deselect the option
          const idx = props.modelValue.findIndex((id) => id === optionId)

          if (idx === -1) {
            const error = new Error(
              'selectedOptions value & selectedOptionsMap are not in sync'
            )
            throw error
          }

          props.modelValue.splice(idx, 1)

          const eventData = {
            deSelectedOptionId: optionId,
            deSelectedOption: (api.optionsMap.value as any)[optionId],
            currentSelectedData: props.modelValue,
          }

          emit('optionDeSelected', eventData)
        } else {
          if (props.mode === TAG_SELECTION_MODE.SINGLE) {
            // Empty array
            props.modelValue.splice(0, props.modelValue.length)
          }

          props.modelValue.push(optionId)
          const eventData = {
            selectedOptionId: optionId,
            selectedOption: (api.optionsMap as any)[optionId],
            currentSelectedData: props.modelValue,
          }

          emit('optionSelected', eventData)
        }

        emit('update:modelValue', props.modelValue)
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
      clearFilterQuery() {
        api.filterQuery.value = ''
      },
      foucsFilterBox() {
        api.tagFilterRef.value?.focus()
      },
      handleMouseDown(event: MouseEvent) {
        if (event.type !== 'mousedown' || event.button !== 0) {
          return
        }

        event.preventDefault()
        event.stopPropagation()

        if (props.disabled) return

        const isClickOnTagSelectionList = api.tagSelectionListRef.value?.contains(
          event.target as HTMLElement
        )

        if (isClickOnTagSelectionList && !api.isOpen) {
          api.openMenu()
        }

        this.foucsFilterBox()
      },
    }

    provide(TagsContext, api)

    return () => {
      const slot = { isOpen: api.isOpen, disabled: props.disabled }
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
      handleMouseDown(event: MouseEvent) {
        api.handleMouseDown(event)
      },
    }
  },
  render() {
    const api = useTagsContext('TagsControl')

    const propsWeControl = {
      ref: 'el',
      id: this.id,
      onMousedown: this.handleMouseDown,
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

    function handleMouseDown(event: MouseEvent) {
      event.preventDefault()
      event.stopPropagation()

      api.foucsFilterBox()
      api.toggleMenu()
    }

    return {
      id,
      handleMouseDown,
    }
  },
  render() {
    const api = useTagsContext('TagsControlArrow', 'TagsControl')
    const propsWeControl = {
      id: this.id,
      onMousedown: this.handleMouseDown,
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

    const tagSelectOptionAPI = {
      optionId,
      removeOption() {
        // Deselect the option
        api.select(tagSelectOptionAPI.optionId.value)
      },
    }

    provide(TagSelectOptionContext, tagSelectOptionAPI)

    return {
      id,
    }
  },
  render() {
    const tagSelectOptionAPI = useTagSelectOptionContext('TagSelectOption')
    const api = useTagsContext('TagSelectOption', 'TagsControl')
    const slot = {
      selected: (api.selectedOptionsIdMap.value as any)[this.$props.optionId],
      isOpen: api.isOpen.value,
    }

    const handleOnClick = () => {
      if (this.$props.onClickRemove) {
        tagSelectOptionAPI.removeOption()
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

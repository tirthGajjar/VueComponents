import { isEmpty } from '@/utils/isEmpty'
import { render } from '@/utils/render'
import { scrollIntoView } from '@/utils/scrollIntoView'
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watch,
} from 'vue'
import { TAG_SELECTION_MODE } from '../constant'
import { TagsContext } from '../context'
import {
  Option,
  OptionsMap,
  SelectedOptionsIdMap,
  StringOrNumber,
  TagsStateDefinition,
} from '../types'

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
    const tagCreateRef = ref<TagsStateDefinition['tagCreateRef']['value']>(null)

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
      tagCreateRef,
      openMenu() {
        api.isOpen.value = true
        emit('menu-opened')
      },
      closeMenu() {
        api.isOpen.value = false
        api.highlightedOptionId.value = null
        api.tagFilterRef.value?.blur()
        emit('menu-closed')
      },
      toggleMenu() {
        if (api.isOpen.value) {
          api.closeMenu()
        } else {
          api.openMenu()
        }
      },
      // Select & deselect
      select(
        optionId: StringOrNumber,
        createNew = false,
        newOptionDetails?: Option
      ) {
        const option = (api.optionsMap.value as any)[optionId]
        if (props.disabled || option?.disabled) {
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

          let selectedOption: Option

          if (createNew && newOptionDetails) {
            selectedOption = { ...newOptionDetails, id: optionId }
            modelValue.push(selectedOption)
          } else {
            selectedOption = (api.optionsMap.value as any)[optionId]
            if (selectedOption) {
              modelValue.push(selectedOption)
            } else {
              throw new Error(`Invalid optionId: ${optionId}`)
            }
          }

          const eventData = {
            selectedOptionId: optionId,
            selectedOption: selectedOption,
            currentSelectedData: modelValue,
          }

          emit('option-selected', eventData)
        }

        emit('update:modelValue', modelValue)
        api.tagFilterRef.value?.focus()
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
          if (idx < 0 || idx >= filteredOptsId.length) {
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
          if (idx < 0 || idx >= filteredOptsId.length) {
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
          this.foucsFilterBox()
        } else {
          api.closeMenu()
        }
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

    onMounted(() => {
      function handler(event: MouseEvent) {
        if (!api.isOpen.value) return
        if (api.tagControlRef.value?.contains(event.target as HTMLElement))
          return

        if (!api.tagMenuRef.value?.contains(event.target as HTMLElement)) {
          api.closeMenu()
        }
      }

      window.addEventListener('click', handler)
      onUnmounted(() => window.removeEventListener('click', handler))
    })

    provide(TagsContext, api)

    return () => {
      const slot = { isOpen: api.isOpen.value, disabled: props.disabled }
      return render({ props, slot, attrs, slots })
    }
  },
})

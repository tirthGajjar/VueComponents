import {
  computed,
  ComputedRef,
  defineComponent,
  inject,
  InjectionKey,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  ref,
  Ref,
  toRaw,
  watchEffect,
} from 'vue'
import { Features, render } from '../../utils/render'
import { Keys } from '../../keyboard'
import { useId } from '../../hooks/use-id'
import { calculateActiveIndex, Focus } from '../../utils/calculate-active-index'

enum SelectboxState {
  Open,
  Closed,
}

const SelextboxMode = {
  single: 'single',
  multiple: 'multiple',
}

type SelectboxOptionDataRef = Ref<{
  textValue: string
  disabled: boolean
  value: unknown
}>

type StateDefinition = {
  // State
  selectboxState: Ref<SelectboxState>
  selectboxMode: ComputedRef<string>
  selectedValues: ComputedRef<unknown[]>
  labelRef: Ref<HTMLButtonElement | null>
  buttonRef: Ref<HTMLDivElement | null>
  optionsRef: Ref<HTMLDivElement | null>
  options: Ref<{ id: string; dataRef: SelectboxOptionDataRef }[]>
  activeOptionIndex: Ref<number | null>
  searchBoxRef: Ref<HTMLFormElement | null>
  allowNotAvailableOption: ComputedRef<boolean>

  // State mutators
  closeSelectBox(): void
  openSelectBox(): void
  select(value: unknown): void
  goToOption(focus: Focus, id?: string): void
  registerOption(id: string, dataRef: SelectboxOptionDataRef): void
  unregisterOption(id: string): void
  clearSearchBox(): void
}

const SelectboxContext = Symbol('SelectboxContext') as InjectionKey<
  StateDefinition
>

function useSelectboxContext(component: string) {
  const context = inject(SelectboxContext, null)

  if (context === null) {
    const err = new Error(
      `<${component} /> is missing a parent <Select /> component.`
    )
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useSelectboxContext)
    throw err
  }

  return context
}

export const Selectbox = defineComponent({
  name: 'Selectbox',
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
      default: SelextboxMode.single,
      validator: (value: string): boolean => {
        return Object.values(SelextboxMode).includes(value)
      },
    },
    allowNotAvailableOption: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots, attrs, emit }) {
    const selectboxState = ref<StateDefinition['selectboxState']['value']>(
      SelectboxState.Closed
    )
    const labelRef = ref<StateDefinition['labelRef']['value']>(null)
    const buttonRef = ref<StateDefinition['buttonRef']['value']>(null)
    const optionsRef = ref<StateDefinition['optionsRef']['value']>(null)
    const options = ref<StateDefinition['options']['value']>([])
    const searchBoxRef = ref<StateDefinition['searchBoxRef']['value']>(null)
    const activeOptionIndex = ref<
      StateDefinition['activeOptionIndex']['value']
    >(null)

    const selectedValues = computed(() => props.modelValue)
    const selectboxMode = computed(() => props.mode)
    const allowNotAvailableOption = computed(
      () => props.allowNotAvailableOption
    )

    const api = {
      selectboxState,
      selectboxMode,
      selectedValues,
      labelRef,
      buttonRef,
      optionsRef,
      options,
      searchBoxRef,
      activeOptionIndex,
      allowNotAvailableOption,
      closeSelectBox: () => {
        selectboxState.value = SelectboxState.Closed
        activeOptionIndex.value = null
      },
      openSelectBox: () => {
        selectboxState.value = SelectboxState.Open
      },
      select(value: unknown) {
        if (
          api.selectboxMode.value === SelextboxMode.multiple &&
          !api.selectedValues.value.includes(value)
        ) {
          api.selectedValues.value.push(value)
          emit('update:modelValue', api.selectedValues.value)
        } else if (
          api.selectboxMode.value === SelextboxMode.single ||
          api.selectboxMode.value === null
        ) {
          api.selectedValues.value.splice(1)
          api.selectedValues.value[0] = value
          emit('update:modelValue', api.selectedValues.value)
        }
        emit('selected-change', api.selectedValues.value)
      },
      goToOption(focus: Focus, id?: string) {
        const nextActiveOptionIndex = calculateActiveIndex(
          focus === Focus.Specific
            ? { focus: Focus.Specific, id: id! }
            : { focus: focus as Exclude<Focus, Focus.Specific> },
          {
            resolveItems: () => options.value,
            resolveActiveIndex: () => activeOptionIndex.value,
            resolveId: (option) => option.id,
            resolveDisabled: (option) => option.dataRef.disabled,
          }
        )

        activeOptionIndex.value = nextActiveOptionIndex
      },
      registerOption(id: string, dataRef: SelectboxOptionDataRef) {
        // @ts-expect-error The expected type comes from property 'dataRef' which is declared here on type '{ id: string; dataRef: { textValue: string; disabled: boolean; }; }'
        options.value.push({ id, dataRef })
      },
      unregisterOption(id: string) {
        const nextOptions = options.value.slice()
        const currentActiveOption =
          activeOptionIndex.value !== null
            ? nextOptions[activeOptionIndex.value]
            : null
        const idx = nextOptions.findIndex((a) => a.id === id)
        if (idx !== -1) nextOptions.splice(idx, 1)
        options.value = nextOptions
        activeOptionIndex.value = (() => {
          if (idx === activeOptionIndex.value) return null
          if (currentActiveOption === null) return null

          // If we removed the option before the actual active index, then it would be out of sync. To
          // fix this, we will find the correct (new) index position.
          return nextOptions.indexOf(currentActiveOption)
        })()
      },
      clearSearchBox() {
        if (api.searchBoxRef.value !== null) {
          api.searchBoxRef.value.value = ''
        }
      },
    }

    onMounted(() => {
      function handler(event: MouseEvent) {
        if (selectboxState.value !== SelectboxState.Open) return
        if (buttonRef.value?.contains(event.target as HTMLElement)) return

        if (!optionsRef.value?.contains(event.target as HTMLElement)) {
          api.closeSelectBox()
        }

        if (!event.defaultPrevented) nextTick(() => buttonRef.value?.focus())
      }

      window.addEventListener('click', handler)
      onUnmounted(() => window.removeEventListener('click', handler))
    })

    // @ts-expect-error Types of property 'dataRef' are incompatible.
    provide(SelectboxContext, api)

    return () => {
      const slot = { open: selectboxState.value === SelectboxState.Open }
      return render({ props, slot, slots, attrs })
    }
  },
})

export const SelectboxLabel = defineComponent({
  name: 'SelectboxLabel',
  props: {
    as: {
      type: [Object, String],
      default: 'label',
    },
  },
  setup() {
    const api = useSelectboxContext('SelectboxLabel')
    const id = `raxui-selectbox-label-${useId()}`

    return {
      id,
      el: api.labelRef,
      handlePointerUp() {
        api.buttonRef.value?.focus()
      },
    }
  },
  render() {
    const api = useSelectboxContext('SelectboxLabel')

    const slot = { open: api.selectboxState.value === SelectboxState.Open }
    const propsWeControl = {
      id: this.id,
      ref: 'el',
      onPointerUp: this.handlePointerUp,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
    })
  },
})

export const SelectboxButton = defineComponent({
  name: 'SelectboxButton',
  props: {
    as: {
      type: [Object, String],
      default: 'button',
    },
  },
  setup() {
    const api = useSelectboxContext('SelectboxButton')
    const id = `raxui-listbox-button-${useId()}`
    const focused = ref(false)

    function handleKeyDown(event: KeyboardEvent) {
      debugger
      switch (event.key) {
        // case Keys.Space:
        case Keys.Enter:
        case Keys.ArrowDown:
          event.preventDefault()
          api.openSelectBox()
          nextTick(() => {
            if (api.searchBoxRef.value !== null) {
              return api.searchBoxRef.value.focus()
            }
            api.optionsRef.value?.focus()
            if (!api.selectedValues.value) api.goToOption(Focus.First)
          })
          break

        case Keys.ArrowUp:
          event.preventDefault()
          api.openSelectBox()
          nextTick(() => {
            if (api.searchBoxRef.value !== null) {
              return api.searchBoxRef.value.focus()
            }
            api.optionsRef.value?.focus()
            if (!api.selectedValues.value) api.goToOption(Focus.Last)
          })
          break
      }
    }

    function handlePointerUp(event: MouseEvent) {
      if (api.selectboxState.value === SelectboxState.Closed) {
        event.preventDefault()
        api.openSelectBox()
        nextTick(() => {
          if (api.searchBoxRef.value !== null) {
            return api.searchBoxRef.value.focus()
          }
          api.optionsRef.value?.focus()
        })
      }
    }

    function handleFocus() {
      if (api.selectboxState.value === SelectboxState.Open)
        return api.searchBoxRef.value?.focus() || api.optionsRef.value?.focus()
      focused.value = true
    }

    function handleBlur() {
      focused.value = false
    }

    return {
      id,
      el: api.buttonRef,
      focused,
      handleKeyDown,
      handlePointerUp,
      handleFocus,
      handleBlur,
    }
  },
  render() {
    const api = useSelectboxContext('SelectboxButton')

    const slot = {
      open: api.selectboxState.value === SelectboxState.Open,
      focused: this.focused,
    }

    const propsWeControl = {
      ref: 'el',
      id: this.id,
      type: 'button',
      'aria-haspopup': true,
      'aria-controls': api.optionsRef.value?.id,
      'aria-expanded':
        api.selectboxState.value === SelectboxState.Open ? true : undefined,
      'aria-labelledby': api.labelRef.value
        ? [api.labelRef.value.id, this.id].join(' ')
        : undefined,
      onKeyDown: this.handleKeyDown,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
      onPointerUp: this.handlePointerUp,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
    })
  },
})

export const SelectboxOptions = defineComponent({
  name: 'SelectboxOptions',
  props: {
    as: {
      type: [Object, String],
      default: 'ul',
    },
    static: {
      type: Boolean,
      default: false,
    },
    unmount: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const api = useSelectboxContext('SelectboxOptions')
    const id = `raxui-selectbox-options-${useId()}`

    function handleKeyDown(event: KeyboardEvent) {
      debugger
      switch (event.key) {
        case Keys.Enter:
          event.preventDefault()
          if (api.activeOptionIndex.value !== null) {
            const { dataRef } = api.options.value[api.activeOptionIndex.value]
            api.select(dataRef.value)
          }
          break

        case Keys.ArrowDown:
          event.preventDefault()
          return api.goToOption(Focus.Next)

        case Keys.ArrowUp:
          event.preventDefault()
          return api.goToOption(Focus.Previous)

        case Keys.Home:
        case Keys.PageUp:
          event.preventDefault()
          return api.goToOption(Focus.First)

        case Keys.End:
        case Keys.PageDown:
          event.preventDefault()
          return api.goToOption(Focus.Last)

        case Keys.Escape:
          event.preventDefault()
          api.closeSelectBox()
          nextTick(() => api.buttonRef.value?.focus())
          break

        case Keys.Tab:
          return event.preventDefault()
      }
    }

    return {
      id,
      el: api.optionsRef,
      handleKeyDown,
    }
  },
  render() {
    const api = useSelectboxContext('SelectboxOptions')

    const slot = { open: api.selectboxState.value === SelectboxState.Open }

    const propsWeControl = {
      'aria-activedescendant':
        api.activeOptionIndex.value === null
          ? undefined
          : api.options.value[api.activeOptionIndex.value]?.id,
      'aria-labelledby': api.labelRef.value?.id ?? api.buttonRef.value?.id,
      id: this.id,
      onKeyDown: this.handleKeyDown,
      role: 'listbox',
      tabIndex: 0,
      ref: 'el',
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
      features: Features.RenderStrategy | Features.Static,
      visible: slot.open,
    })
  },
})

export const SelectboxOption = defineComponent({
  name: 'SelectboxOption',
  props: {
    as: {
      type: [Object, String],
      default: 'li',
    },
    value: {
      type: [Object, String],
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    class: {
      type: [String, Function],
      required: false,
    },
    className: {
      type: [String, Function],
      required: false,
    },
  },
  setup(props, { slots, attrs }) {
    const api = useSelectboxContext('SelectboxOption')
    const id = `raxui-selectbox-option-${useId()}`
    const disabled = props.disabled
    const value = props.value

    const active = computed(() => {
      return api.activeOptionIndex.value !== null
        ? api.options.value[api.activeOptionIndex.value].id === id
        : false
    })

    const selected = computed(() =>
      api.selectedValues.value.some((val) => toRaw(val) === toRaw(value))
    )

    const dataRef = ref<SelectboxOptionDataRef['value']>({
      disabled,
      value,
      textValue: '',
    })
    onMounted(() => {
      const textValue = document
        .getElementById(id)
        ?.textContent?.toLowerCase()
        .trim()

      if (textValue !== undefined) dataRef.value.textValue = textValue
    })

    onMounted(() => api.registerOption(id, dataRef))
    onUnmounted(() => api.unregisterOption(id))

    watchEffect(() => {
      if (api.selectboxState.value !== SelectboxState.Open) return
      if (!active.value) return
      nextTick(() =>
        document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' })
      )
    })

    function handleClick(event: MouseEvent) {
      if (disabled) return event.preventDefault()
      api.select(value)
    }

    function handleFocus() {
      if (disabled) return api.goToOption(Focus.Nothing)
      api.goToOption(Focus.Specific, id)
    }

    function handlePointerMove() {
      if (disabled) return
      if (active.value) return
      api.goToOption(Focus.Specific, id)
    }

    function handlePointerLeave() {
      if (disabled) return
      if (!active.value) return
      api.goToOption(Focus.Nothing)
    }

    return () => {
      const slot = { active: active.value, disabled, selected: selected.value }
      const propsWeControl = {
        id,
        role: 'option',
        tabIndex: -1,
        'aria-disabled': disabled === true ? true : undefined,
        'aria-selected': selected.value === true ? selected.value : undefined,
        onClick: handleClick,
        onFocus: handleFocus,
        onPointerMove: handlePointerMove,
        onPointerLeave: handlePointerLeave,
      }

      return render({
        props: { ...props, ...propsWeControl },
        slot,
        attrs,
        slots,
      })
    }
  },
})

export const SelectSearchBox = defineComponent({
  name: 'SelectSearchBox',
  props: {
    as: {
      type: [Object, String],
      default: 'input',
    },
    modelValue: {
      type: String,
      default: '',
    },
  },
  setup(_props, { emit }) {
    const api = useSelectboxContext('SelectSearchBox')
    const id = `raxui-select-searchbox-${useId()}`

    function handleKeyDown(event: InputEvent) {
      const target = event.target as HTMLInputElement
      emit('update:modelValue', target.value)
    }

    return {
      id,
      el: api.searchBoxRef,
      handleKeyDown,
    }
  },
  render() {
    const api = useSelectboxContext('SelectSearchBox')

    const slot = { open: api.selectboxState.value === SelectboxState.Open }
    const propsWeControl = {
      id: this.id,
      tabIndex: 0,
      ref: 'el',
      // value: this.modelValue,
      // onInput: this.handleKeyDown,
    }

    const passThroughProps = this.$props
    return render({
      props: { ...passThroughProps, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
    })
  },
})

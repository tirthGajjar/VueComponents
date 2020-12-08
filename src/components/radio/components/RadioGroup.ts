import { StringOrNumber } from '@/types'
import { Option } from './../types'
import { useId } from '@/hooks/use-id'
import { render } from '@/utils/render'
import { computed, defineComponent, inject, provide, ref } from 'vue'
import { RadioGroupContext } from '../context'
import { RadioGroupStateDefinition } from '../types'
import { calculateActiveIndex, Focus } from '@/utils/calculate-active-index'

export const RadioGroup = defineComponent({
  name: 'RadioGroup',
  props: {
    as: { type: [Object, String], default: 'div' },
    disabled: { type: Boolean, default: false },
    modelValue: { type: [String, Number], default: null },
    options: { type: Array, required: true },
  },
  emits: ['update:modelValue', 'checked'],
  setup(props, { emit }) {
    const id = `raxui-radio-group-${useId()}`
    const radioGroupRef = ref<
      RadioGroupStateDefinition['radioGroupRef']['value']
    >(null)
    const options = ref<RadioGroupStateDefinition['options']['value']>([])

    const checkedRadioValue = computed<StringOrNumber | null>(
      () => props.modelValue
    )

    const radioOptions = computed(() => props.options)

    const api = {
      radioGroupRef,
      checkedRadioValue,
      radioOptions,
      options,
      markChecked(option: Option) {
        emit('checked', option.value)
        emit('update:modelValue', option.value)
      },
      registerOption(option: Option) {
        api.options.value.push(option)
      },
      unregisterOption(optionId: string) {
        const nextOptions = api.options.value.slice()
        const idx = nextOptions.findIndex((a) => a.id === optionId)
        if (idx !== -1) nextOptions.splice(idx, 1)
        options.value = nextOptions
      },
      goToOption(focus: Focus, id?: string) {
        let currentActiveIndex: number | null = api.options.value.findIndex(
          (option: Option) => option.value === props.modelValue
        )
        if (currentActiveIndex === -1) {
          currentActiveIndex = null
        }
        const idx = calculateActiveIndex(
          focus === Focus.Specific
            ? { focus: Focus.Specific, id: id! }
            : { focus: focus as Exclude<Focus, Focus.Specific> },
          {
            resolveItems: () => api.options.value,
            resolveActiveIndex: () => currentActiveIndex,
            resolveId: (option) => option.id,
            resolveDisabled: (option) => option.disabled,
          }
        )

        if (idx === currentActiveIndex || idx === -1 || idx == null) {
          return
        }

        api.markChecked(api.options.value[idx])
      },
    }

    provide(RadioGroupContext, api)

    return {
      id,
      el: api.radioGroupRef,
    }
  },
  render() {
    const api = inject(RadioGroupContext, null)

    const slot = { checkedValue: api?.checkedRadioValue.value }

    const propsWeControl = {
      id: this.id,
      ref: 'el',
      tabIndex: -1,
      role: 'radiogroup',
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      slots: this.$slots,
      attrs: this.$attrs,
    })
  },
})

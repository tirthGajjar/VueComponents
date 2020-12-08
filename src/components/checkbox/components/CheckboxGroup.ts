import { Option } from './../types'
import { useId } from '@/hooks/use-id'
import { StringOrNumber } from '@/types'
import { computed, defineComponent, provide, ref } from 'vue'
import { CheckboxGroupStateDefinition } from '../types'
import { CheckboxGroupContext } from '../context'
import { render } from '@/utils/render'

export const CheckboxGroup = defineComponent({
  name: 'CheckboxGroup',
  props: {
    as: { type: [Object, String], default: 'div' },
    disabled: { type: Boolean, default: false },
    modelValue: { type: Array, default: () => [] },
    options: { type: Array, required: true },
  },
  emits: ['update:modelValue', 'checked', 'unchecked'],
  setup(props, { emit }) {
    const id = `raxui-checkbox-group-${useId()}`

    const checkboxGroupRef = ref<
      CheckboxGroupStateDefinition['checkboxGroupRef']['value']
    >(null)
    const options = ref<CheckboxGroupStateDefinition['options']['value']>([])

    const checkedValues = computed<StringOrNumber[]>(
      () => props.modelValue as StringOrNumber[]
    )

    const api = {
      checkboxGroupRef,
      options,
      checkedValues,
      markChecked(option: Option) {
        const nextOptions = api.checkedValues.value.slice()
        const idx = nextOptions.findIndex((value) => value === option.value)

        // Mark unchecked
        if (idx !== -1) {
          nextOptions.splice(idx, 1)
          emit('unchecked', nextOptions)
        } else {
          // Mark value as checked value
          nextOptions.push(option.value)
          emit('checked', nextOptions)
        }

        emit('update:modelValue', nextOptions)
      },
      registerOption(option: Option) {
        api.options.value.push(option)
      },
      unregisterOption(optionId: string) {
        const nextOptions = api.options.value.slice()
        const idx = nextOptions.findIndex((a) => a.id === optionId)
        if (idx !== -1) nextOptions.splice(idx, 1)
        api.options.value = nextOptions
      },
    }

    provide(CheckboxGroupContext, api)

    return {
      id,
      el: api.checkboxGroupRef,
    }
  },
  render() {
    const propsWeControl = {
      id: this.id,
      ref: 'el',
      tabIndex: -1,
      role: 'checkboxgroup',
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot: {},
      slots: this.$slots,
      attrs: this.$attrs,
    })
  },
})

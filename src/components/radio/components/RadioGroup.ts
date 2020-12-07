import { StringOrNumber } from '@/components/tag'
import { useId } from '@/hooks/use-id'
import { render } from '@/utils/render'
import { computed, defineComponent, inject, provide, ref } from 'vue'
import { RadioGroupContext } from '../context'
import { RadioGroupStateDefinition } from '../types'

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

    const checkedRadioValue = computed<StringOrNumber | null>(
      () => props.modelValue
    )

    const radioOptions = computed(() => props.options)

    const api = {
      radioGroupRef,
      checkedRadioValue,
      radioOptions,
      markChecked(value: StringOrNumber) {
        emit('checked', value)
        emit('update:modelValue', value)
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

import { useId } from '@/hooks/use-id'
import { Keys } from '@/keyboard'
import { render } from '@/utils/render'
import { computed, defineComponent, onMounted, onUnmounted } from 'vue'
import { useCheckboxGroupContext } from '../context'
import { Option } from '../types'

export const Checkbox = defineComponent({
  name: 'Checkbox',
  props: {
    as: { type: [Object, String], default: 'div' },
    value: { type: [String, Number], required: true },
    disabled: { type: Boolean, default: false },
  },
  setup(props) {
    const api = useCheckboxGroupContext('Checkbox')

    const id = `raxui-checkbox-${useId()}`

    const option: Option = {
      id,
      value: props.value,
      disabled: props.disabled,
    }

    onMounted(() => api.registerOption(option))
    onUnmounted(() => api.unregisterOption(option.id))

    function handleCheckboxSelection() {
      if (props.disabled) return

      api.markChecked(option)
    }

    function handleOnKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          {
            handleCheckboxSelection()
          }
          break
      }
    }

    return {
      id,
      handleCheckboxSelection,
      handleOnKeyDown,
    }
  },
  render() {
    const api = useCheckboxGroupContext('Checkbox')

    const checked = computed(() =>
      api.checkedValues.value.includes(this.$props.value)
    )

    const slot = {
      checked: checked.value,
    }

    const propsWeControl = {
      id: this.id,
      role: 'checkbox',
      tabIndex: 0,
      'aria-checked': slot.checked ? 'true' : 'false',
      onClick: this.handleCheckboxSelection,
      onKeyDown: this.handleOnKeyDown,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      slots: this.$slots,
      attrs: this.$attrs,
    })
  },
})

import { useId } from '@/hooks/use-id'
import { Keys } from '@/keyboard'
import { Focus } from '@/utils/calculate-active-index'
import { render } from '@/utils/render'
import { defineComponent, onMounted, onUnmounted } from 'vue'
import { useRadioGroupContext } from '../context'
import { Option } from '../types'

export const Radio = defineComponent({
  name: 'Radio',
  props: {
    as: { type: [Object, String], default: 'div' },
    value: { type: [String, Number], required: true },
    disabled: { type: Boolean, default: false },
  },
  setup(props) {
    const api = useRadioGroupContext('Radio')

    const id = `raxui-radio-${useId()}`

    const option: Option = {
      id,
      value: props.value,
      disabled: props.disabled,
    }

    onMounted(() => api.registerOption(option))
    onUnmounted(() => api.unregisterOption(option.id))

    function handleRadioSelection() {
      if (props.disabled) return

      api.markChecked(option)
    }

    function handleOnKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case Keys.ArrowRight:
        case Keys.ArrowDown:
          {
            api.goToOption(Focus.Next)
          }
          break

        case Keys.ArrowLeft:
        case Keys.ArrowUp:
          {
            api.goToOption(Focus.Previous)
          }
          break
      }
    }

    return {
      id,
      handleRadioSelection,
      handleOnKeyDown,
    }
  },
  render() {
    const api = useRadioGroupContext('Radio')

    const slot = {
      checked: api.checkedRadioValue.value === this.$props.value,
    }

    const propsWeControl = {
      id: this.id,
      role: 'radio',
      tabIndex: slot.checked ? 0 : -1,
      'aria-checked': slot.checked ? 'true' : 'false',
      onClick: this.handleRadioSelection,
      onFocus: this.handleRadioSelection,
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

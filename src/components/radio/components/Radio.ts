import { useId } from '@/hooks/use-id'
import { render } from '@/utils/render'
import { defineComponent } from 'vue'
import { useRadioGroupContext } from '../context'

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

    function handleRadioSelection() {
      api.markChecked(props.value)
    }

    return {
      id,
      handleRadioSelection,
    }
  },
  render() {
    const api = useRadioGroupContext('Radio')

    const slot = { checked: api.checkedRadioValue.value === this.$props.value }

    const propsWeControl = {
      id: this.id,
      role: 'radio',
      tabIndex: slot.checked ? 0 : -1,
      'aria-checked': slot.checked ? 'true' : 'false',
      onClick: this.handleRadioSelection,
      onFocus: this.handleRadioSelection,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      slots: this.$slots,
      attrs: this.$attrs,
    })
  },
})

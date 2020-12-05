import { useId } from '@/hooks/use-id'
import { render } from '@/utils/render'
import { defineComponent } from 'vue'
import { useTagSelectOptionContext } from '../context'

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
      onClick: (event: MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        tagSelectOptionAPI.removeOption()
      },
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

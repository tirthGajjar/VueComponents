import { useId } from '@/hooks/use-id'
import { render } from '@/utils/render'
import { defineComponent } from 'vue'
import { useTagsContext } from '../context'

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
      handleOnClick(event: MouseEvent) {
        api.handleOnClick(event)
      },
    }
  },
  render() {
    const api = useTagsContext('TagsControl')

    const propsWeControl = {
      ref: 'el',
      id: this.id,
      onClick: this.handleOnClick,
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

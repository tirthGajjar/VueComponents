import { useId } from '@/hooks/use-id'
import { render } from '@/utils/render'
import { defineComponent } from 'vue'
import { useTagsContext } from '../context'

export const TagSelectionList = defineComponent({
  name: 'TagSelectionList',
  props: {
    as: {
      type: [Object, String],
      default: 'div',
    },
  },
  setup() {
    const api = useTagsContext('TagSelectionList', 'TagsControl')
    const id = `raxui-tag-selection-list-${useId()}`

    return {
      id,
      el: api.tagSelectionListRef,
    }
  },
  render() {
    const api = useTagsContext('TagSelectionList', 'TagsControl')
    const slot = { isOpen: api.isOpen.value }

    const propsWeControl = {
      id: this.id,
      ref: 'el',
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      slots: this.$slots,
      attrs: this.$attrs,
    })
  },
})

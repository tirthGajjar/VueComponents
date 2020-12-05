import { useId } from '@/hooks/use-id'
import { render } from '@/utils/render'
import { defineComponent } from 'vue'
import { useTagsContext } from '../context'

export const TagMenu = defineComponent({
  name: 'TagMenu',
  props: {
    as: { type: [Object, String], default: 'div' },
    unmount: { type: Boolean, default: true },
  },
  setup() {
    const api = useTagsContext('TagMenu', 'Tags')

    const id = `raxui-tag-menu-${useId()}`

    return {
      id,
      el: api.tagMenuRef,
    }
  },
  render() {
    const api = useTagsContext('TagMenu', 'Tags')

    const slot = { isOpen: api.isOpen.value }

    const propsWeControl = {
      id: this.id,
      role: 'listbox',
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

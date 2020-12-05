import { useId } from '@/hooks/use-id'
import { render } from '@/utils/render'
import { defineComponent } from 'vue'
import { useTagsContext } from '../context'

export const TagsControlArrow = defineComponent({
  name: 'TagsControlArrow',
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  setup() {
    const id = `raxui-tag-control-arrow-${useId()}`
    const api = useTagsContext('TagsControlArrow', 'TagsControl')

    function handleOnClick(event: MouseEvent) {
      event.preventDefault()
      event.stopPropagation()

      api.foucsFilterBox()
      api.toggleMenu()
    }

    return {
      id,
      handleOnClick,
    }
  },
  render() {
    const api = useTagsContext('TagsControlArrow', 'TagsControl')
    const propsWeControl = {
      id: this.id,
      onClick: this.handleOnClick,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot: { isOpen: api.isOpen.value },
      slots: this.$slots,
      attrs: this.$attrs,
    })
  },
})

import { useId } from '@/hooks/use-id'
import { render } from '@/utils/render'
import { computed, defineComponent } from 'vue'
import { useTagsContext } from '../context'
import { Option } from '../types'

export const TagCreate = defineComponent({
  name: 'TagCreate',
  props: {
    as: { type: [Object, String], default: 'div' },
    optionId: { type: [String, Number], required: true },
    value: { type: Object, required: true },
    selectOnClick: { type: Boolean, default: true },
  },
  setup(props, { emit }) {
    const id = `raxui-tag-create-${useId()}`
    const api = useTagsContext('TagCreate')

    function handleOnClick(event: MouseEvent) {
      event.stopImmediatePropagation()

      const newOption: Option = {
        id: props.optionId,
        ...props.value,
      }

      emit('create-new-tag-clicked', newOption)
      if (props.selectOnClick) {
        api.select(props.optionId, true, newOption)
      }
      api.filterQuery.value = ''
    }

    function handleOnMouseOver() {
      api.setHighlightedOption(props.optionId)
    }

    return {
      id,
      el: api.tagCreateRef,
      handleOnClick,
      handleOnMouseOver,
    }
  },
  render() {
    const api = useTagsContext('TagCreate')
    const visible = computed(() => api.filterQuery.value.trim() !== '')

    const highlighted = computed<boolean>(
      () => this.$props.optionId === api.highlightedOptionId.value
    )

    const slot = {
      visible: visible.value,
      highlighted: highlighted.value,
    }

    const propsWeControl = {
      id: this.id,
      ref: 'el',
      onClick: this.handleOnClick,
      onMouseOver: this.handleOnMouseOver,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      slots: this.$slots,
      attrs: this.$attrs,
    })
  },
})

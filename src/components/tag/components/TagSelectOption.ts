import { useId } from '@/hooks/use-id'
import { render } from '@/utils/render'
import { computed, defineComponent, provide } from 'vue'
import { useTagsContext, TagSelectOptionContext } from '../context'

export const TagSelectOption = defineComponent({
  name: 'TagSelectOption',
  props: {
    as: { type: [Object, String], default: 'div' },
    optionId: { type: [String, Number], required: true },
    onClickRemove: { type: Boolean, default: true },
  },
  setup(props) {
    const api = useTagsContext('TagSelectOption', 'TagsControl')
    const id = `raxui-tag-select-option-${useId()}`
    const optionId = computed(() => props.optionId)

    function removeOption() {
      if (!api.isOpen.value) {
        return api.openMenu()
      }
      // Deselect the option
      api.select(optionId.value)
    }

    const tagSelectOptionAPI = {
      optionId,
      removeOption,
    }

    provide(TagSelectOptionContext, tagSelectOptionAPI)

    return {
      id,
      removeOption,
    }
  },
  render() {
    const api = useTagsContext('TagSelectOption', 'TagsControl')
    const slot = {
      selected: (api.selectedOptionsIdMap.value as any)[this.$props.optionId],
      isOpen: api.isOpen.value,
    }

    const handleOnClick = (event: MouseEvent) => {
      event.stopPropagation()
      event.preventDefault()
      if (this.$props.onClickRemove) {
        this.removeOption()
      }
    }

    const propsWeControl = {
      id: this.id,
      onClick: handleOnClick,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      slots: this.$slots,
      attrs: this.$attrs,
    })
  },
})

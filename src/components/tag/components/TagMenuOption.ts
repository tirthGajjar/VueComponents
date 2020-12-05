import { useId } from '@/hooks/use-id'
import { render } from '@/utils/render'
import { computed, defineComponent } from 'vue'
import { useTagsContext } from '../context'

export const TagMenuOption = defineComponent({
  name: 'TagMenuOption',
  props: {
    as: { type: [Object, String], default: 'template' },
    optionId: { type: [String, Number], required: true },
    disabled: { type: Boolean, default: false },
  },
  setup(props) {
    const api = useTagsContext('TagMenuOption', 'TagMenu')

    const id = `raxui-tag-menu-option-${useId()}`

    function handleOnClick(event: MouseEvent) {
      if (props.disabled) return event.preventDefault()
      api.select(props.optionId)
    }

    function handleOnMouseOver() {
      api.setHighlightedOption(props.optionId)
    }

    return {
      id,
      handleOnClick,
      handleOnMouseOver,
    }
  },
  render() {
    const api = useTagsContext('TagMenuOption', 'TagMenu')

    const highlighted = computed<boolean>(
      () => this.$props.optionId === api.highlightedOptionId.value
    )

    const selected = computed<boolean>(() => {
      const selectedOptionsIdMap: any = api.selectedOptionsIdMap.value

      return selectedOptionsIdMap[this.$props.optionId]
    })

    const visible = computed<boolean>(() => {
      return api.filteredOptionsId.value.includes(this.$props.optionId)
    })

    const slot = {
      visible: visible.value,
      highlighted: highlighted.value,
      selected: selected.value,
    }
    const propsWeControl = {
      id: this.id,
      role: 'option',
      tabIndex: -1,
      'aria-disabled': this.$props.disabled === true ? true : undefined,
      'aria-selected': selected.value === true ? true : undefined,
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

import { useId } from '@/hooks/use-id'
import { Keys } from '@/keyboard'
import { render } from '@/utils/render'
import { defineComponent } from 'vue'
import { keysThatRequireToOpenMenu } from '../constant'
import { useTagsContext } from '../context'

export const TagFilter = defineComponent({
  name: 'TagFilter',
  props: {
    as: { type: [Object, String], default: 'input' },
    removeSelectedOnBackSpace: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const api = useTagsContext('TagFilter', 'TagsControl')
    const id = `raxui-tag-filter-${useId()}`

    function handleOnInput(event: InputEvent) {
      const { value } = event.target as HTMLInputElement
      api.filterQuery.value = value
      api.highLightFirstOption()
      emit('filter-query-change', value)
    }

    function handleOnKeyDown(event: KeyboardEvent) {
      const key = event.key

      if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
        return
      }

      if (
        !api.isOpen.value &&
        keysThatRequireToOpenMenu.includes(key as Keys)
      ) {
        event.preventDefault()
        return api.openMenu()
      }

      switch (key) {
        case Keys.Backspace: {
          if (
            props.removeSelectedOnBackSpace &&
            api.filterQuery.value.length === 0
          ) {
            api.removeLastSelectedOption()
          }
          break
        }

        case Keys.Enter: {
          event.preventDefault()
          if (
            api.highlightedOptionId.value === null ||
            api.filteredOptionsId.value.length === 0
          )
            return
          api.select(api.highlightedOptionId.value)
          break
        }

        case Keys.Escape: {
          if (api.isOpen.value) {
            api.closeMenu()
          }
          break
        }

        case Keys.End: {
          event.preventDefault()
          api.highLightLastOption()
          break
        }

        case Keys.ArrowUp: {
          event.preventDefault()
          api.highlightPrevOption()
          break
        }

        case Keys.ArrowDown: {
          event.preventDefault()
          api.highlightNextOption()
          break
        }

        case Keys.Delete: {
          api.removeLastSelectedOption()
          break
        }

        default: {
          api.openMenu()
          break
        }
      }
    }

    function handleOnClick(event: MouseEvent) {
      if (api.selectedOptions.value.length) {
        // Prevent it from bubbling to the top level and triggering `preventDefault()`
        // to make the textbox unselectable
        event.stopPropagation()
      }
    }

    function handleOnFocus() {
      api.highLightFirstOption()
      if (api.isOpen.value) return

      api.openMenu()
    }

    return {
      id,
      el: api.tagFilterRef,
      handleOnInput,
      handleOnKeyDown,
      handleOnClick,
      handleOnFocus,
    }
  },
  render() {
    const api = useTagsContext('TagFilter', 'TagsControl')

    const propsWeControl = {
      ref: 'el',
      id: this.id,
      type: 'text',
      autocomplete: 'off',
      tabIndex: 0,
      size: api.filterQuery.value.length,
      value: api.filterQuery.value,
      onInput: this.handleOnInput,
      onKeydown: this.handleOnKeyDown,
      onClick: this.handleOnClick,
      onFocus: this.handleOnFocus,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot: {},
      slots: this.$slots,
      attrs: this.$attrs,
    })
  },
})

import { useId } from './../../hooks/use-id'
import { render } from './../../utils/render'
import { resolvePropValue } from './../../utils/resolve-prop-value'
import { defineComponent, inject, InjectionKey, Ref } from 'vue'

type StateDefinition = {
  buttonRef: Ref<HTMLButtonElement | null>
}

const ButtonContext = Symbol('ButtonContext') as InjectionKey<StateDefinition>

export const Button = defineComponent({
  name: 'Button',
  props: {
    as: {
      type: [Object, String],
      default: 'button',
    },
    class: { type: [String, Function], required: false },
    className: { type: [String, Function], required: false },
  },
  render() {
    const api = inject(ButtonContext, null)
    const { class: defaultClass, className = defaultClass } = this.$props

    const slot = {}
    const propsWeControl = {
      id: this.id,
      ref: api === null ? undefined : api.buttonRef,
      role: 'button',
      tabIndex: 0,
      class: resolvePropValue(className, slot),
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
    })
  },
  setup(props) {
    const api = inject(ButtonContext, null)
    const id = `raxui-button-${useId()}`
    return {
      id,
      props,
      el: api?.buttonRef,
    }
  },
})

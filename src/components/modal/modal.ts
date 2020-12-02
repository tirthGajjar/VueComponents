import { useId } from './../../hooks/use-id'
import { defineComponent, inject, InjectionKey, provide, ref, Ref } from 'vue'
import { render } from './../../utils/render'

type btntype = 'ok' | 'cancel'

type ModalStateDefinition = {
  visible: Ref<boolean>
  modalRef: Ref<HTMLElement | null>
  closeModal(btnType: btntype): void
}

const ModalContext = Symbol('ModalContext') as InjectionKey<
  ModalStateDefinition
>

function useModalContext(component: string) {
  const context = inject(ModalContext, null)

  if (context === null) {
    const err = new Error(
      `<${component} /> is missing a parent <Modal /> component.`
    )
    if (Error.captureStackTrace) Error.captureStackTrace(err, useModalContext)
    throw err
  }

  return context
}

export const Modal = defineComponent({
  props: {
    as: {
      type: [Object, String],
      default: 'div',
    },
    modelValue: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { emit }) {
    const modalRef = ref<ModalStateDefinition['modalRef']['value']>(null)
    const visible = ref<ModalStateDefinition['visible']['value']>(false)
    visible.value = props.modelValue

    const id = `raxui-modal-${useId()}`

    const api = {
      modalRef,
      visible,
      closeModal(btnType: btntype) {
        emit('update:modelValue', false)

        if (btnType === 'ok') {
          emit('ok')
        } else if (btnType === 'cancel') {
          emit('cancel')
        }
      },
    }

    provide(ModalContext, api)

    return {
      id,
      props,
    }
  },
  render() {
    const api = inject(ModalContext, null)

    const slot = { visible: this.$props.modelValue }

    const propsWeControl = {
      id: this.id,
      ref: api === null ? undefined : api.modalRef,
      role: 'modal',
      tabIndex: 0,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
    })
  },
})

export const ModalActionButton = defineComponent({
  props: {
    as: {
      type: [Object, String],
      default: 'button',
    },
    btntype: {
      type: String,
      default: 'ok',
    },
  },
  render() {
    const api = useModalContext('ModalActionButton')
    const slot = {}

    const propsWeControl = {
      id: this.id,
      role: 'button',
      tabIndex: 0,
      onClick: () => api?.closeModal(this.$props.btntype as btntype),
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
    })
  },
  setup(props) {
    const id = `raxui-button-${useId()}`
    return {
      id,
      props,
    }
  },
})

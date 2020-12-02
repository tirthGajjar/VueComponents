import { render } from '../../utils/render'
import {
  computed,
  ComputedRef,
  defineComponent,
  inject,
  InjectionKey,
  provide,
  ref,
  Ref,
} from 'vue'
import { useId } from '../../hooks/use-id'

type TabsStateDefinition = {
  activeKey: ComputedRef<string | number>
  tabRef: Ref<HTMLDivElement | null>
  activateTab(key: string | number): void
}

const TabsContext = Symbol('TabsContext') as InjectionKey<TabsStateDefinition>

function useTabsContext(component: string) {
  const context = inject(TabsContext, null)

  if (context === null) {
    const err = new Error(
      `<${component} /> is missing a parent <Tabs /> component.`
    )
    if (Error.captureStackTrace) Error.captureStackTrace(err, useTabsContext)
    throw err
  }

  return context
}

export const Tabs = defineComponent({
  props: {
    as: {
      type: [Object, String],
      default: 'div',
    },
    modelValue: {
      type: [String, Number],
      default: null,
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { slots, attrs, emit }) {
    const tabRef = ref<TabsStateDefinition['tabRef']['value']>(null)

    const activeKey = computed(() => props.modelValue)

    const api = {
      tabRef,
      activeKey,
      activateTab(key: string | number) {
        const modelValue = key
        emit('update:modelValue', modelValue)
        emit('change', modelValue)
      },
    }

    const propsWeControl = {
      role: 'tablist',
    }

    provide(TabsContext, api)

    return () => {
      const slot = {}
      return render({
        props: { ...props, ...propsWeControl },
        slot,
        slots,
        attrs,
      })
    }
  },
})

export const Tab = defineComponent({
  props: {
    val: {
      type: [String, Number],
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    as: {
      type: [Object, String],
      default: 'div',
    },
  },
  setup(props) {
    const api = useTabsContext('Tab')
    const id = `raxui-tab-${useId()}`

    // TODO: Enter & Space keyboard key binding

    function handleClick() {
      if (!props.disabled) {
        api.activateTab(props.val)
      }
    }

    return {
      id,
      props,
      handleClick,
    }
  },
  render() {
    const api = useTabsContext('Tab')
    const { val } = this.$props

    const slot = { active: val == api.activeKey.value }

    const propsWeControl = {
      id: this.id,
      onClick: this.handleClick,
      role: 'tab',
      tabindex: this.$props.disabled ? -1 : 0,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
    })
  },
})

type TabPanelStateDefinition = {
  activeKey: ComputedRef<string | number>
  tabPanelsRef: Ref<HTMLDivElement | null>
}

const TabPanelContext = Symbol('TabPanelContext') as InjectionKey<
  TabPanelStateDefinition
>
function useTabPanelContext(component: string) {
  const context = inject(TabPanelContext, null)

  if (context === null) {
    const err = new Error(
      `<${component} /> is missing a parent <TabPanels /> component.`
    )
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useTabPanelContext)
    throw err
  }

  return context
}

export const TabPanels = defineComponent({
  props: {
    modelValue: {
      type: [String, Number],
      default: null,
    },
    as: {
      type: [Object, String],
      default: 'div',
    },
  },
  setup(props, { slots, attrs }) {
    const tabPanelRef = ref<TabPanelStateDefinition['tabPanelsRef']['value']>(
      null
    )

    const activeKey = computed(() => props.modelValue)

    const api = {
      tabPanelRef,
      activeKey,
    }

    const propsWeControl = {
      role: 'tabpanel',
      tabindex: 0,
    }

    // @ts-expect-error Types of property 'dataRef' are incompatible.
    provide(TabPanelContext, api)

    return () => {
      const slot = {}
      return render({
        props: { ...props, ...propsWeControl },
        slot,
        slots,
        attrs,
      })
    }
  },
})

export const TabPanel = defineComponent({
  props: {
    val: {
      type: [String, Number],
      default: null,
    },
    as: {
      type: [Object, String],
      default: 'div',
    },
  },
  render() {
    const api = useTabPanelContext('TabPanel')
    const id = `raxui-tab-${useId()}`

    const isActive = computed(() => this.$props.val === api.activeKey.value)

    const propsWeControl = {
      id,
      hidden: !isActive.value,
    }

    const attrsWeControl = {
      hidden: !isActive.value,
    }

    // TODO: Handle displaying the content with slot
    const slot = {}
    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      slots: this.$slots,
      attrs: { ...this.$attrs, ...attrsWeControl },
    })
  },
})

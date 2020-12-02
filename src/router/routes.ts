import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@examples/Home.vue'),
  },
  {
    name: 'Menu',
    path: '/menu',
    component: () => import('@examples/components/menu/menu.vue'),
    children: [
      {
        name: 'Menu (basic)',
        path: '/menu/menu',
        component: () => import('@examples/components/menu/menu.vue'),
      },
      {
        name: 'Menu with Popper',
        path: '/menu/menu-with-popper',
        component: () =>
          import('@examples/components/menu/menu-with-popper.vue'),
      },
      {
        name: 'Menu with Transition',
        path: '/menu/menu-with-transition',
        component: () =>
          import('@examples/components/menu/menu-with-transition.vue'),
      },
      {
        name: 'Menu with Popper + Transition',
        path: '/menu/menu-with-transition-and-popper',
        component: () =>
          import(
            '@examples/components/menu/menu-with-transition-and-popper.vue'
          ),
      },
    ],
  },
  {
    name: 'Listbox',
    path: '/listbox',
    component: () => import('@examples/components/listbox/listbox.vue'),
    children: [
      {
        name: 'Listbox (basic)',
        path: '/listbox/listbox',
        component: () => import('@examples/components/listbox/listbox.vue'),
      },
    ],
  },
  {
    name: 'Switch',
    path: '/switch',
    component: () => import('@examples/components/switch/switch.vue'),
    children: [
      {
        name: 'Switch (basic)',
        path: '/switch/switch',
        component: () => import('@examples/components/switch/switch.vue'),
      },
    ],
  },
  {
    name: 'Button',
    path: '/button',
    component: () => import('@examples/components/button/button.vue'),
    children: [
      {
        name: 'Button',
        path: '/button/basic',
        component: () => import('@examples/components/button/button.vue'),
      },
    ],
  },
  {
    name: 'Tabs',
    path: '/tab',
    component: () => import('@examples/components/tabs/tabs-basic.vue'),
    children: [
      {
        name: 'Tab (basic)',
        path: '/tab/basic',
        component: () => import('@examples/components/tabs/tabs-basic.vue'),
      },
    ],
  },
  {
    name: 'Modal',
    path: '/modal',
    component: () => import('@examples/components/modal/modal-basic.vue'),
    children: [
      {
        name: 'Modal (basic)',
        path: '/modal/basic',
        component: () => import('@examples/components/modal/modal-basic.vue'),
      },
    ],
  },
  {
    name: 'Select',
    path: '/select',
    component: () => import('@examples/components/select/select-multiple.vue'),
    children: [
      {
        name: 'Select multiple',
        path: '/select/multiple',
        component: () =>
          import('@examples/components/select/select-multiple.vue'),
      },
    ],
  },
]

export default routes

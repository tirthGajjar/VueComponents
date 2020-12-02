import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.ts'

import 'tailwindcss/tailwind.css'

console.log(router.getRoutes())

createApp(App)
  .use(router)
  .mount('#app')
